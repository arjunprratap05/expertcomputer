import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiX, FiMenu, FiSearch, 
    FiCheckCircle, FiCreditCard, FiPieChart, FiDollarSign, FiVideo, FiBookOpen, 
    FiGrid, FiClock, FiShield, FiTag, FiChevronRight, FiUser, FiSave, FiAlertCircle, 
    FiTrendingUp, FiPhoneCall, FiEdit3, FiArrowRight, FiCalendar, FiTarget, FiFilter
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
    
    const [couponStep, setCouponStep] = useState(1);
    const [coupons, setCoupons] = useState([]);
    const [couponForm, setCouponForm] = useState({
        code: "", description: "", validFrom: "", validTo: "", 
        type: "PROMOTIONAL", maxUsage: "", isActive: true, purpose: "",
        courseCode: "", paymentType: "ALL", 
        discountType: "PERCENTAGE", 
        discountValue: "", isVisibleOnForm: false
    });

    const audioRef = useRef(new Audio('/sounds/notification.mp3'));
    const [approvalModal, setApprovalModal] = useState({ show: false, student: null });
    const [selectedBatches, setSelectedBatches] = useState([]); 
    const [paymentModal, setPaymentModal] = useState({ show: false, student: null, amount: "" });

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

        const updatePayload = {
            isContacted: newStatus,
            remarks: finalRemarks,
            auditAction: `Lead ${newStatus ? 'Status -> Contacted' : 'Status -> Pending'}`,
            targetName: studentName
        };

        try {
            await axios.patch(`${API_URL}/inquiry/${id}`, updatePayload, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            triggerToast(newStatus ? "LEAD MARKED: CONTACTED" : "LEAD MARKED: PENDING");
            fetchData();
        } catch (err) { alert("Failed to update status"); }
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

    const calculateAggregateLedger = (student) => {
        if (!student) return { totalContractValue: 0, paid: 0, due: 0 };
        const totalContractValue = (student.enrollments || []).reduce((acc, curr) => {
            const courseInfo = allCourses.find(c => c.title.toLowerCase().trim() === curr.course.toLowerCase().trim());
            const feeAmount = parseInt(courseInfo?.fee?.toString().replace(/[^0-9]/g, "")) || 0;
            return acc + feeAmount;
        }, 0);
        const paid = student.amountPaid || 0;
        return { totalContractValue, paid, due: totalContractValue - paid };
    };

    const getUnsyncedCourses = (student) => {
        if (!student || !student.enrollments || batches.length === 0) return [];
        const syncedCourseIdentifiers = batches
            .filter(b => student.activeBatches?.includes(b._id))
            .flatMap(b => [b.courseId?.toLowerCase().trim()]);

        return student.enrollments.filter(e => {
            const enrolledTitle = e.course.toLowerCase().trim();
            const courseObj = allCourses.find(c => c.title.toLowerCase().trim() === enrolledTitle);
            return !syncedCourseIdentifiers.includes(enrolledTitle) && 
                   (!courseObj || !syncedCourseIdentifiers.includes(courseObj.id.toLowerCase().trim()));
        });
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

    const handlePaymentPush = async (e) => {
        e.preventDefault();
        if (!paymentModal.amount || isNaN(paymentModal.amount)) {
            alert("Please enter a valid amount");
            return;
        }
        try {
            const currentPaid = Number(paymentModal.student.amountPaid) || 0;
            const additionalAmount = Number(paymentModal.amount);
            const newTotal = currentPaid + additionalAmount;
            await axios.patch(`${API_URL}/admin/registrations/${paymentModal.student._id}/update-payment`, 
                { 
                    amountPaid: newTotal,
                    auditAction: `Payment Received: ₹${additionalAmount}`,
                    targetName: paymentModal.student.name 
                }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            triggerToast(`₹${additionalAmount} ADDED TO LEDGER`);
            setPaymentModal({ show: false, student: null, amount: "" });
            fetchData();
        } catch (err) { alert("Payment Sync Failed"); }
    };

    const handleFinalCouponSave = async () => {
        const finalPayload = { 
            ...couponForm, 
            type: couponForm.type || "PROMOTIONAL",
            paymentType: couponForm.paymentType || "ALL",
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

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-left relative">
            
            {/* NOTIFICATION TOAST */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ y: -50, x: "-50%", opacity: 0 }} animate={{ y: 30, x: "-50%", opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed left-1/2 z-[999] bg-[#1A5F7A] text-white px-8 py-4 rounded-[1.5rem] shadow-2xl font-black border-b-4 border-[#F37021] uppercase text-[11px] italic tracking-widest flex items-center gap-3">
                        <FiCheckCircle className="text-[#F37021] text-lg"/>
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SIDEBAR NAVIGATION */}
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
                    
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-6 mb-2 ml-4">Admin Tools</p>
                    {hasAccess('coupons') && <SidebarBtn active={activeTab === 'coupons'} onClick={() => handleTabChange('coupons')} icon={<FiTag />} label="Coupon Engine" />}
                    {hasAccess('logs') && <SidebarBtn active={activeTab === 'logs'} onClick={() => handleTabChange('logs')} icon={<FiActivity />} label="Security Logs" />}
                </nav>
                {/* Terminate Session button removed from here */}
            </aside>

            {/* MAIN CONTENT AREA */}
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
                                <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-[#1A5F7A] font-black italic shadow-inner border border-white">
                                    {userName.charAt(0)}
                                </div>
                            </div>
                        </div>
                        {/* RIGHT TOP LOGOUT ICON */}
                        <button onClick={() => setLogoutModal(true)} className="p-4 bg-red-50 text-red-500 rounded-2xl active:scale-90 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <FiLogOut size={22} />
                        </button>
                    </div>
                </header>

                <main className="p-6 md:p-12 overflow-y-auto flex-1 no-scrollbar bg-[#F8FAFC]">
                    
                    {/* --- TAB: ADMISSION ENQUIRIES --- */}
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
                                        <tr><th className="p-7">Lead Identity</th><th>Program</th><th>Message</th><th>Source</th><th>Date</th><th>Remarks</th><th className="pr-7 text-right">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredData.map((item, idx) => (
                                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} key={item._id} className={`group hover:bg-blue-50/30 transition-all ${item.isContacted ? 'bg-slate-50/40' : ''}`}>
                                                <td className="p-7">
                                                    <div className="font-black text-[#1A5F7A] uppercase italic text-[13px]">{item.name}</div>
                                                    <div className="text-slate-400 font-black text-[9px] mt-1 tracking-wider uppercase">{item.phone}</div>
                                                </td>
                                                <td className="font-black text-[#1A5F7A] uppercase tracking-tighter opacity-80">{item.course || "GENERAL"}</td>
                                                <td className="max-w-[180px] truncate text-slate-400 font-medium italic group-hover:text-slate-600 transition-colors">"{item.message || 'No message'}"</td>
                                                <td><SourceTag source={item.source} /></td>
                                                <td className="font-black text-slate-400 uppercase italic"><div className="flex items-center gap-2"><FiCalendar size={12}/>{new Date(item.createdAt).toLocaleDateString('en-GB')}</div></td>
                                                <td><div className="flex items-center gap-3 bg-slate-100/50 p-2 rounded-[1rem] border-2 border-transparent focus-within:border-orange-200 focus-within:bg-white transition-all min-w-[180px]"><FiEdit3 className="text-slate-300"/><input type="text" placeholder="Add remark..." value={item.remarks || ""} onBlur={(e) => handleRemarkUpdate(item._id, e.target.value, item.name)} className="bg-transparent border-none text-[11px] font-black text-slate-600 outline-none w-full placeholder:opacity-30" /></div></td>
                                                <td className="pr-7 text-right"><button onClick={() => handleEnquiryStatusUpdate(item._id, item.isContacted, item.remarks, item.name)} className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ml-auto ${item.isContacted ? 'bg-green-500 text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-200 hover:border-[#F37021] hover:text-[#F37021]'}`}>{item.isContacted ? <FiCheckCircle size={20}/> : <FiPhoneCall size={18}/>}</button></td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: STUDENT REGISTRATIONS --- */}
                    {activeTab === 'registrations' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div><h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic tracking-tighter">Student Registry</h3><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Enrollment & Ledger Synchronization</p></div>
                                <div className="relative w-full md:w-96"><FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/><input type="text" placeholder="Search Student..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-[#1A5F7A]/10 outline-none transition-all font-bold" onChange={e => setSearchQuery(e.target.value)}/></div>
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
                                            const syncedCount = validSyncedBatches.length;
                                            const unsynced = getUnsyncedCourses(item);
                                            return (
                                                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-7"><div className="font-black text-[#1A5F7A] uppercase italic text-[13px]">{item.name}</div><div className="text-slate-400 font-bold text-[10px] mt-0.5 group-hover:text-[#1A5F7A] transition-colors lowercase italic">{item.email}</div></td>
                                                    <td>{item.isPortalActive ? <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl w-fit font-black uppercase text-[9px] italic border border-green-100"><FiCheckCircle/> Active</div> : <button onClick={() => handleActivatePortal(item)} className="bg-[#1A5F7A] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic shadow-md hover:bg-[#F37021] transition-all">Unlock Access</button>}</td>
                                                    <td><motion.div whileHover={{ scale: 1.05 }} onClick={() => { setApprovalModal({ show: true, student: item }); setSelectedBatches(validSyncedBatches); }} className={`cursor-pointer group flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all w-fit ${syncedCount > 0 ? 'bg-orange-50 border-orange-100 text-[#F37021]' : 'bg-slate-50 border-slate-100 text-slate-300'}`}><FiVideo className={syncedCount > 0 ? 'animate-pulse' : ''} size={16}/><div className="font-black uppercase text-[10px]">{syncedCount} Batches{unsynced.length > 0 && <span className="text-red-600 ml-2 animate-bounce inline-block">●</span>}</div></motion.div></td>
                                                    <td><div className="font-black"><div className="text-[#1A5F7A] text-[13px]">₹{item.amountPaid?.toLocaleString() || 0}</div><div className={`text-[9px] uppercase tracking-tighter mt-1 ${ledger.due > 0 ? 'text-red-500 italic' : 'text-green-500 font-black'}`}>{ledger.due > 0 ? `Balance Due: ₹${ledger.due.toLocaleString()}` : "Ledger Cleared"}</div></div></td>
                                                    <td className="pr-7 text-right"><button onClick={() => setPaymentModal({ show: true, student: item, amount: "" })} className="w-11 h-11 bg-[#F37021]/10 text-[#F37021] rounded-2xl flex items-center justify-center hover:bg-[#F37021] hover:text-white hover:shadow-lg hover:shadow-orange-200 transition-all ml-auto border border-orange-100/50"><FiCreditCard size={18}/></button></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: COUPON DEPLOYMENT --- */}
                    {activeTab === 'coupons' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28 text-left">
                            <div className="flex flex-col md:flex-row justify-between items-end border-b-2 border-slate-100 pb-8">
                                <div className="text-left"><h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic flex items-center gap-4"><div className="p-3 bg-orange-100 rounded-2xl"><FiTag className="text-[#F37021]"/></div> Deployment Wizard</h3><p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Strategic Promotional Logic Configuration</p></div>
                                <div className="flex gap-3 mt-6 md:mt-0"><div className={`px-6 py-2 rounded-full font-black text-[10px] uppercase transition-all shadow-inner ${couponStep === 1 ? 'bg-[#F37021] text-white' : 'bg-slate-200 text-slate-400'}`}>01 Registry</div><div className={`px-6 py-2 rounded-full font-black text-[10px] uppercase transition-all shadow-inner ${couponStep === 2 ? 'bg-[#F37021] text-white' : 'bg-slate-200 text-slate-400'}`}>02 Mapping</div></div>
                            </div>
                            <AnimatePresence mode="wait">
                                {couponStep === 1 ? (
                                    <motion.div key="s1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-10">
                                        <div className="bg-white rounded-[3rem] shadow-2xl border-t-[12px] border-[#1A5F7A] overflow-hidden">
                                            <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-100"><span className="font-black text-[11px] text-slate-400 uppercase tracking-widest italic">Core Parameter Setting</span>{coupons.some(c => c.code === couponForm.code) && <span className="bg-red-50 text-red-500 px-5 py-2 rounded-2xl animate-pulse flex items-center gap-2 font-black text-[10px] italic border border-red-100"><FiAlertCircle/> DUPLICATE CODE</span>}</div>
                                            <form onSubmit={(e) => { e.preventDefault(); setCouponStep(2); }} className="p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase ml-3">Activation Code</label><div className="relative group"><FiArrowRight className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#F37021]"/><input required className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] font-black uppercase text-xl outline-none focus:bg-white focus:border-[#F37021] transition-all" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase().trim()})} /></div></div>
                                                <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase ml-3">Redemption Limit</label><input type="number" required className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[2rem] font-black text-lg outline-none focus:bg-white focus:border-[#1A5F7A] transition-all" value={couponForm.maxUsage} onChange={e => setCouponForm({...couponForm, maxUsage: e.target.value})} /></div>
                                                <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase ml-3">Start Window</label><input type="date" required className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[2rem] font-black outline-none focus:bg-white focus:border-[#1A5F7A] transition-all" value={couponForm.validFrom} onChange={e => setCouponForm({...couponForm, validFrom: e.target.value})} /></div>
                                                <div className="space-y-2"><label className="text-[11px] font-black text-slate-500 uppercase ml-3">Expiry Window</label><input type="date" required className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[2rem] font-black outline-none focus:bg-white focus:border-[#1A5F7A] transition-all" value={couponForm.validTo} onChange={e => setCouponForm({...couponForm, validTo: e.target.value})} /></div>
                                                <div className="md:col-span-2 space-y-2 border-t pt-8"><label className="text-[11px] font-black text-slate-500 uppercase ml-3">Narrative</label><input required className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold text-slate-600 italic outline-none" value={couponForm.description} onChange={e => setCouponForm({...couponForm, description: e.target.value, purpose: e.target.value})} /></div>
                                                <div className="md:col-span-2 flex justify-end"><button disabled={coupons.some(c => c.code === couponForm.code) || !couponForm.code} type="submit" className="bg-[#1A5F7A] text-white px-12 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-[#F37021] transition-all flex items-center gap-4 disabled:opacity-20">Logic Mapping <FiChevronRight size={20}/></button></div>
                                            </form>
                                        </div>
                                        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden"><div className="bg-[#1A5F7A] p-6 text-white font-black text-[10px] uppercase tracking-[0.3em] flex justify-between items-center"><span>Production Registry</span><span className="opacity-40">{coupons.length} Active</span></div><div className="overflow-x-auto max-h-[400px] overflow-y-auto no-scrollbar"><table className="w-full text-left text-[11px] border-collapse"><thead className="bg-slate-50 sticky top-0 border-b border-slate-100 z-10"><tr className="text-slate-400 uppercase font-black text-[9px]"><th className="p-6">Target</th><th>Code</th><th>Benefit</th><th>Burn</th><th className="pr-6 text-right">Status</th></tr></thead><tbody className="divide-y divide-slate-50">{coupons.map(c => (<tr key={c._id} className="hover:bg-blue-50/20 group"><td className="p-6 uppercase font-black text-[#1A5F7A] opacity-80">{c.courseCode}</td><td className="font-black italic text-[#F37021] text-[13px]">{c.code}</td><td className="font-black text-slate-600">{c.discountType === 'FIXED' ? `₹${c.discountValue}` : `${c.discountValue}%`} OFF</td><td><div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-orange-400" style={{ width: `${Math.min((c.usedCount/c.maxUsage)*100, 100)}%` }}></div></div><span className="text-[9px] font-black text-slate-300 italic uppercase">{c.usedCount} burned</span></td><td className="pr-6 text-right"><span className="px-3 py-1 bg-green-50 text-green-500 rounded-lg font-black text-[9px] uppercase italic border border-green-100">Live</span></td></tr>))}</tbody></table></div></div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="bg-white rounded-[3rem] shadow-2xl border-t-[12px] border-[#F37021] overflow-hidden p-12 text-left">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12"><div className="space-y-3"><label className="text-[11px] font-black text-slate-500 uppercase ml-4 flex items-center gap-2"><FiTarget className="text-orange-400"/> Product scope</label><select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-[#1A5F7A] outline-none" value={couponForm.courseCode} onChange={e => setCouponForm({...couponForm, courseCode: e.target.value})}><option value="">-- Choose scope --</option><option value="ALL">Universal</option>{allCourses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}</select></div><div className="space-y-3"><label className="text-[11px] font-black text-slate-500 uppercase ml-4 flex items-center gap-2"><FiPieChart className="text-orange-400"/> Mathematical model</label><div className="flex gap-4 p-2 bg-slate-50 rounded-[2rem]"><button type="button" onClick={() => setCouponForm({...couponForm, discountType: 'PERCENTAGE'})} className={`flex-1 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${couponForm.discountType === 'PERCENTAGE' ? 'bg-[#1A5F7A] text-white shadow-xl' : 'text-slate-400'}`}>Percentage (%)</button><button type="button" onClick={() => setCouponForm({...couponForm, discountType: 'FIXED'})} className={`flex-1 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${couponForm.discountType === 'FIXED' ? 'bg-[#1A5F7A] text-white shadow-xl' : 'text-slate-400'}`}>Fixed (₹)</button></div></div><div className="space-y-3"><label className="text-[11px] font-black text-slate-500 uppercase ml-4">Deployment Value</label><div className="relative"><input required type="number" className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-black text-[#F37021] text-5xl outline-none text-center tracking-tighter shadow-inner" value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} /><div className="absolute right-10 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-200">{couponForm.discountType === 'PERCENTAGE' ? '%' : '₹'}</div></div></div><div className="md:col-span-2 bg-slate-900 p-12 rounded-[4rem] text-white flex flex-col md:flex-row justify-between items-center mt-6"><div className="text-left md:w-2/3"><p className="text-[10px] font-black text-[#F37021] uppercase tracking-[0.6em] mb-4">Final validation</p><h4 className="text-6xl font-black italic tracking-tighter uppercase leading-none mb-4">{couponForm.code}</h4><p className="text-sm opacity-60 font-black tracking-widest uppercase">{couponForm.courseCode || "No Program"} • {couponForm.discountValue || 0}{couponForm.discountType === 'PERCENTAGE' ? '%' : '₹'} OFF</p></div><button onClick={handleFinalCouponSave} className="bg-[#F37021] text-white px-16 py-7 rounded-full font-black uppercase text-[12px] tracking-[0.3em] shadow-xl hover:bg-[#d9621c] transition-all flex items-center gap-4 active:scale-95"><FiSave size={20}/> Activate System</button></div></div><button onClick={() => setCouponStep(1)} className="mt-12 text-slate-400 font-black uppercase text-[10px] flex items-center gap-3 hover:text-[#1A5F7A] tracking-[0.2em] italic transition-all"><FiChevronRight className="rotate-180 text-xl"/> Return to Step 1</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* OVERVIEW / LOGS */}
                    {(activeTab === 'overview' || activeTab === 'logs') && userRole === 'founder' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
                            <FinancialCards /><div className="space-y-8"><div className="flex items-center justify-between px-2"><h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic flex items-center gap-4"><div className="p-3 bg-blue-50 text-[#1A5F7A] rounded-2xl shadow-inner border border-blue-100"><FiShield /></div>{activeTab === 'overview' ? "Live monitor" : "Comprehensive audit trail"}</h3><button onClick={() => fetchData()} className="text-[10px] font-black text-slate-400 tracking-widest hover:text-[#1A5F7A] transition-colors flex items-center gap-2"><FiActivity/> Live Sync</button></div><div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden overflow-x-auto"><table className="w-full text-left min-w-[700px] border-collapse"><thead className="bg-slate-50 text-[10px] font-black uppercase border-b border-slate-100 tracking-widest"><tr><th className="p-8">Executive Staff</th><th>Action</th><th>Target</th><th className="pr-8 text-right">Time</th></tr></thead><tbody className="divide-y divide-slate-50 font-bold text-[11px]">{auditLogs && auditLogs.length > 0 ? auditLogs.map((log, idx) => (<tr key={log._id || idx} className="hover:bg-slate-50 transition-all border-l-4 border-transparent hover:border-[#1A5F7A]"><td className="p-8"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] italic text-[#1A5F7A]">{log.performedBy?.charAt(0)}</div><span className="uppercase text-[#1A5F7A] tracking-tighter italic">{log.performedBy}</span></div></td><td><span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase italic ${log.action?.includes('Delete') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{log.action}</span></td><td className="font-bold text-slate-500 uppercase tracking-tighter opacity-70">{log.targetName || "SYSTEM"}</td><td className="pr-8 text-right text-slate-400 italic font-black uppercase tracking-tighter">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td></tr>)) : (<tr><td colSpan="4" className="p-32 text-center text-slate-300 uppercase font-black text-xs tracking-[0.4em] opacity-40 italic">No Logged Records Discovered</td></tr>)}</tbody></table></div></div>
                        </div>
                    )}

                    {activeTab === 'batches' && <div className="animate-in fade-in duration-700 text-left"><BatchScheduler /></div>}
                    {activeTab === 'lectures' && <div className="animate-in fade-in duration-700 text-left"><AddLecture /></div>}
                    {activeTab === 'materials' && <div className="animate-in fade-in duration-700 text-left"><AddMaterial /></div>}
                </main>
            </div>

            {/* SYNC MODAL */}
            <AnimatePresence>
                {approvalModal.show && (
                    <div className="fixed inset-0 z-[1000] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3.5rem] p-10 max-w-lg w-full shadow-2xl relative border-t-[15px] border-[#1A5F7A] text-left">
                            <button onClick={() => setApprovalModal({ show: false, student: null })} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 p-2 rounded-xl"><FiX size={24} /></button>
                            <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic mb-8">Stream Sync</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 mb-8 custom-scrollbar">
                                {batches.filter(batch => (approvalModal.student?.enrollments || []).some(e => batch.courseId?.toLowerCase().trim() === e.course.toLowerCase().trim())).map(b => (
                                    <div key={b._id} onClick={() => setSelectedBatches(prev => prev.includes(b._id) ? prev.filter(i => i !== b._id) : [...prev, b._id])} className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between ${selectedBatches.includes(b._id) ? 'border-[#F37021] bg-orange-50 shadow-orange-100/50' : 'border-slate-50 bg-white hover:border-slate-200'}`}>
                                        <div><div className="font-black text-[#1A5F7A] text-[13px] uppercase italic leading-none">{b.batchCode}</div><div className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">{b.courseId} • {b.startTime}</div></div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${selectedBatches.includes(b._id) ? 'bg-[#F37021] border-[#F37021] text-white shadow-lg shadow-orange-200' : 'border-slate-100 bg-slate-50'}`}><FiCheckCircle size={14}/></div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleBatchSync} className="w-full py-6 bg-[#F37021] text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-[#d9621c] transition-all transform hover:-translate-y-1">Authorize Global Streams</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* LEDGER MODAL */}
            <AnimatePresence>
                {paymentModal.show && (
                    <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3.5rem] p-12 max-w-md w-full shadow-2xl relative border-t-[15px] border-green-500 text-left">
                            <button onClick={() => setPaymentModal({ show: false, student: null, amount: "" })} className="absolute top-10 right-10 text-slate-300 hover:text-red-500"><FiX size={28} /></button>
                            <h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic mb-8 tracking-tighter leading-none">Ledger Sync</h3>
                            <form onSubmit={handlePaymentPush} className="space-y-8">
                                <div className="space-y-3"><label className="text-[11px] font-black text-slate-500 uppercase ml-4 tracking-widest italic flex items-center gap-2"><FiDollarSign className="text-green-500"/> Current Transaction</label><div className="relative group"><input required autoFocus type="number" className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-black text-[#1A5F7A] text-5xl outline-none focus:bg-white focus:border-green-500 transition-all text-center tracking-tighter shadow-inner" placeholder="0000" value={paymentModal.amount} onChange={(e) => setPaymentModal({...paymentModal, amount: e.target.value})} /><div className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-200">₹</div></div></div>
                                <button type="submit" className="w-full py-7 bg-green-600 text-white rounded-full font-black uppercase text-xs tracking-[0.3em] shadow-[0_20px_50px_rgba(22,163,74,0.3)] flex items-center justify-center gap-4 hover:bg-green-700 transition-all active:scale-95">Push To Ledger</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* LOGOUT MODAL */}
            <AnimatePresence>
                {logoutModal && (
                    <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 text-center">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-t-8 border-red-500">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><FiLogOut size={24} /></div>
                            <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic leading-tight">Terminate Session?</h3>
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <button onClick={() => setLogoutModal(false)} className="py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px] text-slate-500 hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
                                <button onClick={handleLogout} className="py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-red-600 transition-all active:scale-95">Logout</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- REUSABLE WRAPPERS ---
function SourceTag({ source }) {
    const styles = { 'AI Chatbot': 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50', 'Facebook': 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50', 'Website': 'bg-green-50 text-green-600 border-green-100 shadow-green-100/50', 'Direct': 'bg-slate-50 text-slate-400 border-slate-100 shadow-sm' };
    return ( <div className={`px-4 py-1.5 border rounded-full font-black text-[9px] uppercase italic w-fit shadow-sm flex items-center gap-2 ${styles[source] || styles['Direct']}`}> <div className={`w-1.5 h-1.5 rounded-full ${source === 'Website' ? 'bg-green-500' : 'bg-slate-300'}`}></div> {source || 'Standard'} </div> );
}

function SidebarBtn({ active, onClick, icon, label }) {
    return ( <button onClick={onClick} className={`flex items-center gap-4 p-5 rounded-[1.5rem] font-black transition-all group relative ${active ? 'bg-[#F37021] text-white shadow-2xl shadow-orange-500/30 -translate-x-2' : 'hover:bg-white/5 text-slate-300 hover:text-white hover:translate-x-1'}`}> <span className={`text-xl transition-transform group-hover:scale-110 ${active ? 'animate-pulse' : ''}`}>{icon}</span><span className="text-[11px] uppercase tracking-widest font-black italic">{label}</span> {active && <motion.div layoutId="active_pill" className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></motion.div>} </button> );
}