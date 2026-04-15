import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiX, FiMenu, FiSearch, 
    FiCheckCircle, FiCreditCard, FiPieChart, FiDollarSign, FiVideo, FiBookOpen, 
    FiGrid, FiClock, FiShield, FiTag, FiChevronRight, FiUser, FiSave, FiAlertCircle, 
    FiTrendingUp, FiPhoneCall, FiEdit3, FiArrowRight, FiCalendar, FiTarget, FiFilter,
    FiClock as FiTime
} from 'react-icons/fi';

// DATA SOURCES
import { techCoursesData, universityPrograms } from '../../data/courses';

// INTERNAL MODULES
import AddLecture from '../Admin/AddLecture';
import AddMaterial from '../Admin/AddMaterial';
import BatchScheduler from '../Admin/BatchScheduler'; 

const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function AdminDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("adminToken");
    const userRole = localStorage.getItem("userRole")?.toLowerCase(); 
    const userName = localStorage.getItem("adminName") || "Administrator";

    const permissions = {
        founder: ['overview', 'logs', 'registrations', 'batches', 'lectures', 'materials', 'enquiries', 'coupons'],
        frontoffice: ['batches', 'lectures', 'materials', 'enquiries'],
        accounts: ['registrations', 'batches', 'lectures', 'materials', 'coupons']
    };
    const hasAccess = (tab) => permissions[userRole]?.includes(tab);

    const [activeTab, setActiveTab] = useState(() => {
        if (userRole === 'frontoffice') return 'enquiries';
        if (userRole === 'accounts') return 'registrations';
        return 'overview'; 
    });
    
    const [data, setData] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [finances, setFinances] = useState({ total: 0, topCourses: [] });
    const [batches, setBatches] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState({ show: false, message: "" });
    const [prevLeadLength, setPrevLeadLength] = useState(0);
    
    // COUPON ENGINE STATE
    const [couponStep, setCouponStep] = useState(1);
    const [coupons, setCoupons] = useState([]);
    const [couponForm, setCouponForm] = useState({
        code: "", description: "", validFrom: "", validTo: "", 
        type: "PROMOTIONAL", maxUsage: "", isActive: true, purpose: "",
        courseCode: "", paymentType: "ALL", 
        discountType: "PERCENTAGE", 
        discountValue: "", isVisibleOnForm: false
    });

    // NEW LEDGER & DISCOUNT STATE
    const [discountMode, setDiscountMode] = useState(false);
    const [discountData, setDiscountData] = useState({ amount: "", reason: "" });
    const [paymentModal, setPaymentModal] = useState({ show: false, student: null, amount: "" });

    const audioRef = useRef(new Audio('/sounds/notification.mp3'));
    const [approvalModal, setApprovalModal] = useState({ show: false, student: null });
    const [selectedBatches, setSelectedBatches] = useState([]); 

    const allCourses = useMemo(() => [...techCoursesData, ...universityPrograms], []);

    const triggerToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/admin/login", { replace: true });
        window.location.reload(); 
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false); 
    };

    // --- FINANCIAL CALCULATIONS ---
    const calculateAggregateLedger = useCallback((student) => {
        if (!student) return { totalContractValue: 0, paid: 0, due: 0, isAdvance: false };
        
        let totalContractValue = Number(student.totalFee) || 0;
        
        if (totalContractValue === 0) {
            totalContractValue = (student.enrollments || []).reduce((acc, curr) => {
                const courseInfo = allCourses.find(c => c.title.toLowerCase().trim() === curr.course.toLowerCase().trim());
                const feeAmount = parseInt(courseInfo?.fee?.toString().replace(/[^0-9]/g, "")) || 0;
                return acc + feeAmount;
            }, 0);
        }

        const paid = Number(student.amountPaid) || 0;
        const due = totalContractValue - paid;
        
        return { 
            totalContractValue, 
            paid, 
            due: due > 0 ? due : 0,
            isAdvance: due < 0 
        };
    }, [allCourses]);

    // --- LEDGER ADJUSTMENT (PAYMENT + DISCOUNT) ---
    const handleLedgerAdjustment = async (e) => {
        e.preventDefault();
        const amt = Number(discountMode ? discountData.amount : paymentModal.amount);
        
        if (!amt || isNaN(amt) || amt <= 0) return triggerToast("ENTER VALID AMOUNT");
        if (discountMode && !discountData.reason.trim()) return triggerToast("REASON IS REQUIRED");

        try {
            const currentPaid = Number(paymentModal.student.amountPaid) || 0;
            const currentTotalFee = Number(paymentModal.student.totalFee) || 0;

            let payload = {};
            if (discountMode) {
                payload = {
                    totalFee: currentTotalFee - amt,
                    auditAction: `Manual Discount: -₹${amt} (Reason: ${discountData.reason})`,
                    targetName: paymentModal.student.name
                };
            } else {
                payload = {
                    amountPaid: currentPaid + amt,
                    auditAction: `Payment Sync: +₹${amt}`,
                    targetName: paymentModal.student.name
                };
            }

            await axios.patch(`${API_URL}/admin/registrations/${paymentModal.student._id}/update-ledger`, 
                payload, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            triggerToast(discountMode ? "DISCOUNT APPLIED" : `₹${amt} ADDED TO LEDGER`);
            setPaymentModal({ show: false, student: null, amount: "" });
            setDiscountData({ amount: "", reason: "" });
            setDiscountMode(false);
            fetchData();
        } catch (err) { triggerToast("LEDGER UPDATE FAILED"); }
    };

    const handleEnquiryStatusUpdate = async (id, currentStatus, currentRemarks, studentName) => {
        const newStatus = !currentStatus;
        let finalRemarks = currentRemarks;
        if (newStatus === true) {
            if (!currentRemarks || currentRemarks.toUpperCase() === "NOT CONTACTED") {
                finalRemarks = "CONTACTED";
            }
        } else {
            finalRemarks = "NOT CONTACTED";
        }

        try {
            await axios.patch(`${API_URL}/inquiry/${id}`, {
                isContacted: newStatus,
                remarks: finalRemarks,
                auditAction: `Lead Status -> ${newStatus ? 'Contacted' : 'Pending'}`,
                targetName: studentName
            }, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast(newStatus ? "LEAD MARKED: CONTACTED" : "LEAD MARKED: PENDING");
            fetchData();
        } catch (err) { alert("Status update failed"); }
    };

    const handleRemarkUpdate = async (id, remarkValue, studentName) => {
        try {
            await axios.patch(`${API_URL}/inquiry/${id}`, { 
                remarks: remarkValue,
                auditAction: "Manual Remark Update",
                targetName: studentName
            }, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast("REMARKS UPDATED");
            fetchData();
        } catch (err) { alert("Failed to save remark"); }
    };

    const getUnsyncedCourses = (student) => {
        if (!student || !student.enrollments || batches.length === 0) return [];
        const syncedCourseNames = batches
            .filter(b => student.activeBatches?.includes(b._id))
            .map(b => b.courseId?.toLowerCase().trim());

        return student.enrollments.filter(e => !syncedCourseNames.includes(e.course.toLowerCase().trim()));
    };

    const filteredData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data.filter(item => 
            (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
            (item.phone || "").includes(searchQuery)
        );
    }, [data, searchQuery]);

    const fetchData = useCallback(async () => {
        if (!token) return navigate('/admin/login');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const endpoint = activeTab === 'registrations' ? '/admin/registrations' : activeTab === 'enquiries' ? '/admin/enquiries' : null;
            if (endpoint && hasAccess(activeTab)) {
                const res = await axios.get(`${API_URL}${endpoint}`, { headers });
                const freshData = res.data.data || [];
                if (activeTab === 'enquiries' && freshData.length > prevLeadLength && prevLeadLength !== 0) {
                    audioRef.current.play().catch(() => {});
                    triggerToast("NEW LEAD CAPTURED");
                }
                setData(freshData);
                if (activeTab === 'enquiries') setPrevLeadLength(freshData.length);
            }
            if (activeTab === 'coupons') {
                const res = await axios.get(`${API_URL}/admin/coupons`, { headers });
                setCoupons(res.data.data || []);
            }
            if (userRole === 'founder' && (activeTab === 'logs' || activeTab === 'overview')) {
                const res = await axios.get(`${API_URL}/admin/audit-logs`, { headers });
                setAuditLogs(res.data.logs || res.data.data || []);
                setFinances({ total: res.data.totalRevenue || 0, topCourses: res.data.topCourses || [] });
            }
        } catch (err) { if (err.response?.status === 401) handleLogout(); }
    }, [activeTab, token, userRole, prevLeadLength]);

    useEffect(() => {
        const loadInit = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/batches/active`, { headers: { Authorization: `Bearer ${token}` } });
                setBatches(res.data.data || []);
                fetchData();
            } catch (err) {}
        };
        loadInit();
    }, [token, activeTab, fetchData]);

    const handleFinalCouponSave = async () => {
        const finalPayload = { 
            ...couponForm, 
            maxUsage: Number(couponForm.maxUsage), 
            discountValue: Number(couponForm.discountValue) 
        };
        try {
            await axios.post(`${API_URL}/admin/coupons`, finalPayload, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast("COUPON SYSTEM ACTIVATED");
            setCouponStep(1);
            setCouponForm({ code: "", description: "", validFrom: "", validTo: "", type: "PROMOTIONAL", maxUsage: "", isActive: true, purpose: "", courseCode: "", paymentType: "ALL", discountType: "PERCENTAGE", discountValue: "", isVisibleOnForm: false });
            fetchData();
        } catch (err) { alert("Deployment Failed"); }
    };

    const handleActivatePortal = async (student) => {
        try {
            await axios.patch(`${API_URL}/admin/registrations/${student._id}/grant-access`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchData(); triggerToast("ACCESS UNLOCKED");
        } catch (err) { alert("Activation Failed"); }
    };

    const handleBatchSync = async () => {
        try {
            await axios.patch(`${API_URL}/admin/approve-student/${approvalModal.student._id}`, { batchIds: selectedBatches }, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast("SYNCED"); fetchData(); setApprovalModal({ show: false, student: null });
        } catch (err) { alert("Sync Failed"); }
    };

    // UI HELPER COMPONENTS
    const FinancialCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1A5F7A] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <FiDollarSign className="absolute -right-4 -bottom-4 text-9xl opacity-10" />
                <p className="text-[10px] uppercase font-black opacity-60 tracking-widest mb-1">Aggregate Revenue</p>
                <div className="text-4xl font-black italic tracking-tighter">₹{finances.total.toLocaleString()}</div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2.5rem] border flex items-center gap-5 shadow-sm group hover:border-[#F37021] transition-all">
                <div className="p-4 bg-orange-50 text-[#F37021] rounded-2xl group-hover:bg-[#F37021] group-hover:text-white transition-all"><FiPieChart size={30}/></div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Top Performer</p>
                    <div className="text-xl font-black text-[#1A5F7A] italic leading-none">{finances.topCourses[0]?.name || 'N/A'}</div>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-[2.5rem] border flex items-center gap-5 shadow-sm hidden lg:flex group hover:border-[#1A5F7A] transition-all">
                <div className="p-4 bg-blue-50 text-[#1A5F7A] rounded-2xl group-hover:bg-[#1A5F7A] group-hover:text-white transition-all"><FiUsers size={30}/></div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Active Batches</p>
                    <div className="text-xl font-black text-[#1A5F7A] italic leading-none">{batches.length} Scheduled</div>
                </div>
            </motion.div>
        </div>
    );

    const SourceTag = ({ source }) => {
        const styles = { 
            'AI Chatbot': 'bg-indigo-50 text-indigo-600 border-indigo-100', 
            'Facebook': 'bg-blue-50 text-blue-600 border-blue-100', 
            'Website': 'bg-green-50 text-green-600 border-green-100', 
            'Direct': 'bg-slate-50 text-slate-400 border-slate-100' 
        };
        return ( <div className={`px-4 py-1.5 border rounded-full font-black text-[9px] uppercase italic w-fit shadow-sm flex items-center gap-2 ${styles[source] || styles['Direct']}`}> <div className={`w-1.5 h-1.5 rounded-full ${source === 'Website' ? 'bg-green-500' : 'bg-slate-300'}`}></div> {source || 'Direct'} </div> );
    };

    const SidebarBtn = ({ active, onClick, icon, label }) => (
        <button onClick={onClick} className={`flex items-center gap-4 p-5 rounded-[1.5rem] font-black transition-all group relative ${active ? 'bg-[#F37021] text-white shadow-2xl -translate-x-2' : 'hover:bg-white/5 text-slate-300 hover:text-white hover:translate-x-1'}`}> 
            <span className="text-xl transition-transform group-hover:scale-110">{icon}</span>
            <span className="text-[11px] uppercase tracking-widest italic">{label}</span> 
            {active && <motion.div layoutId="active_pill" className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></motion.div>} 
        </button>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-left relative">
            
            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ y: -50, x: "-50%", opacity: 0 }} animate={{ y: 30, x: "-50%", opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed left-1/2 z-[999] bg-[#1A5F7A] text-white px-8 py-4 rounded-[1.5rem] shadow-2xl font-black border-b-4 border-[#F37021] uppercase text-[11px] italic tracking-widest flex items-center gap-3">
                        <FiCheckCircle className="text-[#F37021] text-lg"/> {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SIDEBAR */}
            <aside className={`fixed lg:relative z-[200] h-full w-80 bg-[#1A5F7A] text-white p-8 flex flex-col shadow-2xl transition-all duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="mb-12 flex justify-between items-center">
                    <div className="font-black text-[#F37021] italic text-2xl uppercase tracking-tighter leading-none">
                        Expert Academy<br/>
                        <span className="text-[10px] text-white/30 tracking-[0.4em] font-black not-italic block mt-1">Admin Central</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white transition-colors p-2"><FiX size={28}/></button>
                </div>
                
                <nav className="flex flex-col gap-3 flex-1 no-scrollbar overflow-y-auto pr-2">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2 ml-4">Main Menu</p>
                    {hasAccess('overview') && <SidebarBtn active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} icon={<FiGrid />} label="Dashboard Overview" />}
                    {hasAccess('enquiries') && <SidebarBtn active={activeTab === 'enquiries'} onClick={() => handleTabChange('enquiries')} icon={<FiMessageSquare />} label="Admission Leads" />}
                    {hasAccess('registrations') && <SidebarBtn active={activeTab === 'registrations'} onClick={() => handleTabChange('registrations')} icon={<FiUsers />} label="Student Registry" />}
                    
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-6 mb-2 ml-4">LMS Controls</p>
                    {hasAccess('batches') && <SidebarBtn active={activeTab === 'batches'} onClick={() => handleTabChange('batches')} icon={<FiClock />} label="Batch Master" />}
                    <SidebarBtn active={activeTab === 'lectures'} onClick={() => handleTabChange('lectures')} icon={<FiVideo />} label="Live Classroom" />
                    <SidebarBtn active={activeTab === 'materials'} onClick={() => handleTabChange('materials')} icon={<FiBookOpen />} label="Study Vault" />
                    
                    {hasAccess('coupons') && (
                        <>
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-6 mb-2 ml-4">Admin Tools</p>
                            <SidebarBtn active={activeTab === 'coupons'} onClick={() => handleTabChange('coupons')} icon={<FiTag />} label="Coupon Engine" />
                            {hasAccess('logs') && <SidebarBtn active={activeTab === 'logs'} onClick={() => handleTabChange('logs')} icon={<FiActivity />} label="Security Logs" />}
                        </>
                    )}
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <header className="bg-white h-24 px-10 flex items-center justify-between border-b border-slate-100 sticky top-0 z-[100] shadow-sm">
                    <div className="flex items-center gap-5">
                        <button className="lg:hidden text-[#1A5F7A] p-3 bg-slate-50 rounded-2xl active:scale-95" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24} /></button>
                        <div className="hidden md:block">
                            <h2 className="font-black text-[#1A5F7A] text-lg uppercase italic tracking-tight">{activeTab.replace('-', ' ')}</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Management Interface</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden sm:flex flex-col text-right border-r pr-8 border-slate-100">
                            <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 italic">Operator Online</span>
                            <div className="flex items-center gap-3 mt-0.5 justify-end">
                                <div className="text-right">
                                    <span className="text-[#1A5F7A] text-[13px] font-black uppercase italic block leading-none">{userName}</span>
                                    <span className="text-[9px] font-bold text-[#F37021] uppercase tracking-tighter opacity-70">{userRole}</span>
                                </div>
                                <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-[#1A5F7A] font-black italic shadow-inner border border-white">{userName.charAt(0)}</div>
                            </div>
                        </div>
                        <button onClick={() => setLogoutModal(true)} className="p-4 bg-red-50 text-red-500 rounded-2xl active:scale-90 hover:bg-red-500 hover:text-white transition-all shadow-sm"><FiLogOut size={22} /></button>
                    </div>
                </header>

                <main className="p-6 md:p-12 overflow-y-auto flex-1 no-scrollbar bg-[#F8FAFC]">
                    
                    {activeTab === 'enquiries' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic tracking-tighter">Inquiry Pipeline</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lead Management & Conversion</p>
                                </div>
                                <div className="relative w-full md:w-96 group">
                                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#F37021] transition-colors" size={20}/>
                                    <input type="text" placeholder="Search by Name or Phone..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-orange-50 focus:border-[#F37021] outline-none transition-all font-bold text-slate-600" onChange={e => setSearchQuery(e.target.value)}/>
                                </div>
                            </div>

                             <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden overflow-x-auto">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="bg-slate-50/80 backdrop-blur font-black uppercase text-slate-400 border-b border-slate-100 sticky top-0 z-10">
                                        <tr><th className="p-7">Lead Identity</th><th>Program</th><th>Source</th><th>Date</th><th>Remarks</th><th className="pr-7 text-right">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredData.map((item, idx) => (
                                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} key={item._id} className={`group hover:bg-blue-50/30 transition-all ${item.isContacted ? 'bg-slate-50/40' : ''}`}>
                                                <td className="p-7">
                                                    <div className="font-black text-[#1A5F7A] uppercase italic text-[13px]">{item.name}</div>
                                                    <div className="text-slate-400 font-black text-[9px] mt-1 tracking-wider uppercase">{item.phone}</div>
                                                </td>
                                                <td className="font-black text-[#1A5F7A] uppercase tracking-tighter opacity-80">{item.course || "GENERAL"}</td>
                                                <td><SourceTag source={item.source} /></td>
                                                <td className="font-black text-slate-400 uppercase italic"> <FiCalendar className="inline mr-2" />{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
                                                <td>
                                                    <div className="flex items-center gap-3 bg-slate-100/50 p-2 rounded-[1rem] focus-within:bg-white transition-all">
                                                        <FiEdit3 className="text-slate-300"/>
                                                        <input type="text" placeholder="Add remark..." value={item.remarks || ""} onBlur={(e) => handleRemarkUpdate(item._id, e.target.value, item.name)} className="bg-transparent text-[11px] font-black outline-none w-full" />
                                                    </div>
                                                </td>
                                                <td className="pr-7 text-right">
                                                    <button onClick={() => handleEnquiryStatusUpdate(item._id, item.isContacted, item.remarks, item.name)} className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ml-auto ${item.isContacted ? 'bg-green-500 text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-200 hover:border-[#F37021] hover:text-[#F37021]'}`}>
                                                        {item.isContacted ? <FiCheckCircle size={20}/> : <FiPhoneCall size={18}/>}
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'registrations' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div><h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic tracking-tighter">Student Registry</h3><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Enrollment & Ledger Synchronization</p></div>
                                <div className="relative w-full md:w-96"><FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/><input type="text" placeholder="Search Student..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm outline-none font-bold" onChange={e => setSearchQuery(e.target.value)}/></div>
                            </div>

                             <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden overflow-x-auto">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-50 font-black uppercase text-slate-400 border-b tracking-widest">
                                        <tr><th className="p-7">Student Identity</th><th>Portal Access</th><th>Stream Sync</th><th>Financial Ledger</th><th className="pr-7 text-right">Ledger Sync</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-bold">
                                        {filteredData.map(item => {
                                            const ledger = calculateAggregateLedger(item);
                                            const validSyncedBatches = (item.activeBatches || []).filter(sId => batches.some(b => b._id === sId));
                                            const unsynced = getUnsyncedCourses(item);
                                            return (
                                                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-7"><div className="font-black text-[#1A5F7A] uppercase italic text-[13px]">{item.name}</div><div className="text-slate-400 font-bold text-[10px] mt-0.5 lowercase italic">{item.email}</div></td>
                                                    <td>{item.isPortalActive ? <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl w-fit font-black uppercase text-[9px] italic border border-green-100"><FiCheckCircle/> Active</div> : <button onClick={() => handleActivatePortal(item)} className="bg-[#1A5F7A] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic hover:bg-[#F37021] transition-all">Unlock Access</button>}</td>
                                                    <td><motion.div whileHover={{ scale: 1.05 }} onClick={() => { setApprovalModal({ show: true, student: item }); setSelectedBatches(validSyncedBatches); }} className={`cursor-pointer group flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all w-fit ${validSyncedBatches.length > 0 ? 'bg-orange-50 border-orange-100 text-[#F37021]' : 'bg-slate-50 border-slate-100 text-slate-300'}`}><FiVideo size={16}/><div className="font-black uppercase text-[10px]">{validSyncedBatches.length} Batches{unsynced.length > 0 && <span className="text-red-600 ml-2 animate-bounce">●</span>}</div></motion.div></td>
                                                    <td>
                                                        <div className="font-black">
                                                            <div className="text-[#1A5F7A] text-[13px]">₹{item.amountPaid?.toLocaleString() || 0} / <span className="text-slate-300">₹{ledger.totalContractValue.toLocaleString()}</span></div>
                                                            <div className={`text-[9px] uppercase tracking-tighter mt-1 ${ledger.due > 0 ? 'text-red-500 italic' : 'text-green-600 font-black'}`}>
                                                                {ledger.due > 0 ? `Due: ₹${ledger.due.toLocaleString()}` : (ledger.isAdvance ? "Advance Paid" : "Cleared")}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="pr-7 text-right"><button onClick={() => setPaymentModal({ show: true, student: item, amount: "" })} className="w-11 h-11 bg-[#F37021]/10 text-[#F37021] rounded-2xl flex items-center justify-center hover:bg-[#F37021] hover:text-white transition-all ml-auto border border-orange-100/50"><FiCreditCard size={18}/></button></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'batches' && <BatchScheduler />}
                    {activeTab === 'lectures' && <AddLecture />}
                    {activeTab === 'materials' && <AddMaterial />}

                    {(activeTab === 'overview' || activeTab === 'logs') && userRole === 'founder' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
                            <FinancialCards />
                            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                                <table className="w-full text-left min-w-[700px] border-collapse">
                                    <thead className="bg-slate-50 text-[10px] font-black uppercase border-b p-8 tracking-widest">
                                        <tr>
                                            <th className="p-8">Staff Identity</th>
                                            <th>Action Performed</th>
                                            <th>Target Name</th>
                                            <th className="pr-8 text-right">Detailed Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-bold text-[11px]">
                                        {auditLogs.map((log, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 border-l-4 border-transparent hover:border-[#1A5F7A] transition-all">
                                                <td className="p-8">
                                                    <div className="text-[#1A5F7A] font-black uppercase italic">{log.performedBy}</div>
                                                </td>
                                                <td className="uppercase opacity-60 text-[10px]">{log.action}</td>
                                                <td className="italic text-slate-500">{log.targetName}</td>
                                                <td className="pr-8 text-right">
                                                    <div className="text-[#1A5F7A] font-black flex items-center justify-end gap-2 text-[12px]">
                                                        <FiTime className="text-[#F37021]"/>
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 uppercase tracking-tighter mt-1 italic font-bold">
                                                        {new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* --- LEDGER SYNC MODAL (WITH DISCOUNT & REASON) --- */}
            <AnimatePresence>
                {paymentModal.show && paymentModal.student && (() => {
                    const ledger = calculateAggregateLedger(paymentModal.student);
                    return (
                        <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3.5rem] p-10 max-w-md w-full shadow-2xl relative border-t-[15px] border-[#1A5F7A] text-left">
                                <button onClick={() => { setPaymentModal({ show: false, student: null, amount: "" }); setDiscountMode(false); }} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 bg-slate-50 p-2 rounded-xl"><FiX size={24} /></button>
                                
                                <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic mb-1 tracking-tighter leading-none">Ledger Sync</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Updating: {paymentModal.student.name}</p>

                                {/* MODE TOGGLE */}
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                                    <button onClick={() => setDiscountMode(false)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${!discountMode ? 'bg-white text-[#1A5F7A] shadow-sm' : 'text-slate-400'}`}>Receive Payment</button>
                                    <button onClick={() => setDiscountMode(true)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${discountMode ? 'bg-[#F37021] text-white shadow-sm' : 'text-slate-400'}`}>Apply Discount</button>
                                </div>

                                <div className={`rounded-[2rem] p-6 mb-8 border flex justify-between items-center transition-colors ${discountMode ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Contract Value</p>
                                        <div className="text-lg font-black text-slate-600">₹{ledger.totalContractValue.toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1 italic">Net Due Amount</p>
                                        <div className="text-2xl font-black italic text-red-600">₹{ledger.due.toLocaleString()}</div>
                                    </div>
                                </div>

                                <form onSubmit={handleLedgerAdjustment} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic flex items-center gap-2">
                                            {discountMode ? <FiTag className="text-[#F37021]"/> : <FiDollarSign className="text-green-500"/>} 
                                            {discountMode ? "Adjustment Amount" : "Payment Received"}
                                        </label>
                                        <div className="relative group">
                                            <input required type="number" className={`w-full p-6 bg-slate-50 border-2 rounded-[2rem] font-black text-3xl outline-none transition-all text-center ${discountMode ? 'focus:border-[#F37021] focus:bg-white' : 'focus:border-green-500 focus:bg-white'}`} placeholder="0000" value={discountMode ? discountData.amount : paymentModal.amount} onChange={(e) => discountMode ? setDiscountData({...discountData, amount: e.target.value}) : setPaymentModal({...paymentModal, amount: e.target.value})} />
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-200">₹</div>
                                        </div>
                                    </div>

                                    {discountMode && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic flex items-center gap-2"><FiAlertCircle className="text-[#F37021]"/> Mandatory Justification Reason</label>
                                            <textarea required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold text-xs outline-none focus:bg-white focus:border-[#F37021] min-h-[80px] resize-none" placeholder="Enter reason for applying this discount..." value={discountData.reason} onChange={(e) => setDiscountData({...discountData, reason: e.target.value})} />
                                        </motion.div>
                                    )}

                                    <button type="submit" className={`w-full py-6 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${discountMode ? 'bg-[#F37021] hover:bg-[#d9621c]' : 'bg-green-600 hover:bg-green-700'}`}>
                                        <FiCheckCircle size={18}/> {discountMode ? "Authorize Discount" : "Confirm Sync"}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>

            {/* SYNC MODAL */}
            <AnimatePresence>
                {approvalModal.show && (
                    <div className="fixed inset-0 z-[1000] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3.5rem] p-10 max-w-lg w-full shadow-2xl relative border-t-[15px] border-[#1A5F7A] text-left">
                            <button onClick={() => setApprovalModal({ show: false, student: null })} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 bg-slate-50 p-2 rounded-xl"><FiX size={24} /></button>
                            <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic mb-8 tracking-tighter">Stream Sync Authorization</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 mb-8 no-scrollbar">
                                {batches.filter(batch => (approvalModal.student?.enrollments || []).some(e => batch.courseId?.toLowerCase().trim() === e.course.toLowerCase().trim())).map(b => (
                                    <div key={b._id} onClick={() => setSelectedBatches(prev => prev.includes(b._id) ? prev.filter(i => i !== b._id) : [...prev, b._id])} className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${selectedBatches.includes(b._id) ? 'border-[#F37021] bg-orange-50 shadow-orange-100/50' : 'border-slate-50 bg-white hover:border-slate-200 shadow-sm'}`}>
                                        <div>
                                            <div className="font-black text-[#1A5F7A] text-[13px] uppercase italic leading-none mb-1 group-hover:text-[#F37021] transition-colors">{b.batchCode}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{b.courseId} • {b.startTime}</div>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${selectedBatches.includes(b._id) ? 'bg-[#F37021] border-[#F37021] text-white shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-200'}`}><FiCheckCircle size={18}/></div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleBatchSync} className="w-full py-6 bg-[#F37021] text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-[#d9621c] transition-all flex items-center justify-center gap-3">
                                <FiSave size={18}/> Authorize Streams
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* LOGOUT MODAL */}
            <AnimatePresence>
                {logoutModal && (
                    <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-t-8 border-red-500 text-center">
                            <FiLogOut className="mx-auto text-red-500 mb-6" size={48} />
                            <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic mb-8 leading-tight tracking-tighter">Terminate Active<br/>Management Session?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setLogoutModal(false)} className="py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px] text-slate-500 active:scale-95 transition-all hover:bg-slate-200">Cancel</button>
                                <button onClick={handleLogout} className="py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all hover:bg-red-600">Logout Now</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}