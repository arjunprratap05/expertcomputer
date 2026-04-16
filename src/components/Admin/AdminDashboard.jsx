import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiX, FiMenu, FiSearch, 
    FiCheckCircle, FiCreditCard, FiPieChart, FiDollarSign, FiVideo, FiBookOpen, 
    FiGrid, FiClock, FiShield, FiTag, FiChevronRight, FiUser, FiSave, FiAlertCircle, 
    FiTrendingUp, FiPhoneCall, FiEdit3, FiArrowRight, FiCalendar, FiTarget, FiFilter,
    FiClock as FiTime, FiZap, FiPlus, FiList, FiCheck, FiTrendingDown, FiMonitor
} from 'react-icons/fi';

import { techCoursesData, universityPrograms } from '../../data/courses';
import AddLecture from '../Admin/AddLecture';
import AddMaterial from '../Admin/AddMaterial';
import BatchScheduler from '../Admin/BatchScheduler'; 

const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

// --- MEMOIZED SIDEBAR BUTTON (PREVENTS FLICKER) ---
const SidebarBtn = React.memo(({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex items-center gap-4 p-5 rounded-[1.5rem] font-black transition-all group relative ${active ? 'bg-[#F37021] text-white shadow-2xl -translate-x-2' : 'hover:bg-white/5 text-slate-300 hover:text-white hover:translate-x-1'}`}> 
        <span className="text-xl transition-transform group-hover:scale-110">{icon}</span>
        <span className="text-[11px] uppercase tracking-widest italic">{label}</span> 
        {active && <motion.div layoutId="active_pill" className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></motion.div>} 
    </button>
));

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
    
    const lastFetchedTab = useRef("");
    const [data, setData] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [finances, setFinances] = useState({ total: 0, topCourses: [], pendingAdjustments: 0 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState({ show: false, message: "" });
    const [prevLeadLength, setPrevLeadLength] = useState(0);

    const [discountMode, setDiscountMode] = useState(false);
    const [discountData, setDiscountData] = useState({ amount: "", reason: "" });
    const [paymentModal, setPaymentModal] = useState({ show: false, student: null, amount: "" });

    const [coupons, setCoupons] = useState([]);
    const [couponForm, setCouponForm] = useState({
        code: "", description: "", maxUsage: "", isActive: true, 
        validFrom: "", validTo: "", courseCode: "ALL", 
        discountType: "PERCENTAGE", discountValue: ""
    });

    const audioRef = useRef(new Audio('/sounds/notification.mp3'));
    const allCourses = useMemo(() => [...techCoursesData, ...universityPrograms], []);

    const triggerToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    // --- LEDGER CALCULATION ---
    const calculateAggregateLedger = useCallback((student) => {
        if (!student) return { total: 0, paid: 0, due: 0 };
        let total = Number(student.totalFee) || 0;
        if (total === 0) {
            total = (student.enrollments || []).reduce((acc, curr) => {
                const c = allCourses.find(course => course.title.toLowerCase().trim() === curr.course.toLowerCase().trim());
                return acc + (parseInt(c?.fee?.toString().replace(/[^0-9]/g, "")) || 0);
            }, 0);
        }
        const paid = Number(student.amountPaid) || 0;
        const due = total - paid;
        return { total, paid, due: due > 0 ? due : 0 };
    }, [allCourses]);

    const fetchData = useCallback(async (force = false) => {
        if (!token) return;
        if (!force && lastFetchedTab.current === activeTab) return;
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const endpoint = activeTab === 'registrations' ? '/admin/registrations' : activeTab === 'enquiries' ? '/admin/enquiries' : null;
            if (endpoint && hasAccess(activeTab)) {
                const res = await axios.get(`${API_URL}${endpoint}`, { headers });
                const freshData = res.data.data || [];
                setData(freshData);
                lastFetchedTab.current = activeTab;
                if (activeTab === 'enquiries' && freshData.length > prevLeadLength && prevLeadLength !== 0) {
                    audioRef.current.play().catch(() => {});
                    triggerToast("NEW LEAD CAPTURED");
                    setPrevLeadLength(freshData.length);
                }
            }
            if (activeTab === 'coupons') {
                const res = await axios.get(`${API_URL}/admin/coupons`, { headers });
                setCoupons(res.data.data || []);
            }
            if (userRole === 'founder' && (activeTab === 'logs' || activeTab === 'overview')) {
                const res = await axios.get(`${API_URL}/admin/audit-logs`, { headers });
                setAuditLogs(res.data.logs || res.data.data || []);
                setFinances(prev => ({ 
                    ...prev, 
                    total: res.data.totalRevenue || 0,
                    pendingAdjustments: data?.filter(s => s.discountRequest?.status === 'PENDING').length || 0 
                }));
            }
        } catch (err) { if (err.response?.status === 401) handleLogout(); }
    }, [activeTab, token, userRole, data, prevLeadLength]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
    };

    const handleEnquiryStatusUpdate = async (id, currentStatus, currentRemarks, studentName) => {
        const newStatus = !currentStatus;
        const finalRemarks = newStatus ? (currentRemarks === "NOT CONTACTED" ? "CONTACTED" : currentRemarks) : "NOT CONTACTED";
        try {
            await axios.patch(`${API_URL}/inquiry/${id}`, { isContacted: newStatus, remarks: finalRemarks, targetName: studentName }, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast(newStatus ? "CONTACTED" : "PENDING");
            fetchData(true);
        } catch (err) { alert("Failed"); }
    };

    const handleLedgerAdjustment = async (e) => {
        e.preventDefault();
        const amt = Number(discountMode ? discountData.amount : paymentModal.amount);
        if (!amt || amt <= 0) return triggerToast("ENTER VALID AMOUNT");
        try {
            if (discountMode) {
                if (!discountData.reason.trim()) return triggerToast("REASON REQUIRED");
                await axios.patch(`${API_URL}/admin/registrations/${paymentModal.student._id}/request-discount`, { amount: amt, reason: discountData.reason, targetName: paymentModal.student.name }, { headers: { Authorization: `Bearer ${token}` } });
                triggerToast("SENT TO FOUNDER");
            } else {
                const currentPaid = Number(paymentModal.student.amountPaid) || 0;
                await axios.patch(`${API_URL}/admin/registrations/${paymentModal.student._id}/update-ledger`, { amountPaid: currentPaid + amt, targetName: paymentModal.student.name }, { headers: { Authorization: `Bearer ${token}` } });
                triggerToast("LEDGER UPDATED");
            }
            setPaymentModal({ show: false, student: null, amount: "" });
            fetchData(true);
        } catch (err) { triggerToast("SYNC FAILED"); }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
    
        // 1. Validation: Duplicate check (Matches your UI logic)
        const isDuplicate = coupons.some(c => c.code.toUpperCase() === couponForm.code.toUpperCase());
        if (isDuplicate) return triggerToast("DUPLICATE CODE DETECTED");
    
        try {
            // 2. Data Preparation: Ensure types match Backend expectations
            const payload = {
                code: couponForm.code.toUpperCase().trim(),
                description: couponForm.description,
                discountType: couponForm.discountType, // 'PERCENTAGE' or 'FLAT'
                discountValue: Number(couponForm.discountValue),
                maxUsage: Number(couponForm.maxUsage),
                courseCode: couponForm.courseCode, // 'ALL' or specific title
                validFrom: new Date(couponForm.validFrom),
                validTo: new Date(couponForm.validTo),
                isActive: true
            };
    
            const response = await axios.post(`${API_URL}/admin/coupons`, payload, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
    
            if (response.data.success) {
                triggerToast("COUPON ACTIVATED");
                fetchData(true); // Refresh the list
                // Reset Form
                setCouponForm({ 
                    code: "", description: "", maxUsage: "", isActive: true, 
                    validFrom: "", validTo: "", courseCode: "ALL", 
                    discountType: "PERCENTAGE", discountValue: "" 
                });
            }
        } catch (err) {
            // 3. Error Handling: Catch the "Code already exists" from backend
            const errMsg = err.response?.data?.message || "DEPLOYMENT FAILED";
            triggerToast(errMsg.toUpperCase());
        }
    };

    const handleFounderApprove = async (studentId) => {
        try {
            await axios.patch(`${API_URL}/admin/registrations/${studentId}/approve-discount`, {}, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast("AUTHORIZED"); fetchData(true);
        } catch (err) { triggerToast("FAILED"); }
    };

    const filteredData = useMemo(() => (data || []).filter(item => 
        (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || (item.phone || "").includes(searchQuery)
    ), [data, searchQuery]);

    const handleLogout = () => { localStorage.clear(); navigate("/admin/login"); window.location.reload(); };

    const memoizedSidebar = useMemo(() => (
        <nav className="flex flex-col gap-3 flex-1 no-scrollbar overflow-y-auto">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2 ml-4">Main Menu</p>
            {hasAccess('overview') && <SidebarBtn active={activeTab === 'overview'} onClick={() => handleTabSwitch('overview')} icon={<FiGrid />} label="Dashboard" />}
            {hasAccess('enquiries') && <SidebarBtn active={activeTab === 'enquiries'} onClick={() => handleTabSwitch('enquiries')} icon={<FiMessageSquare />} label="Leads" />}
            {hasAccess('registrations') && <SidebarBtn active={activeTab === 'registrations'} onClick={() => handleTabSwitch('registrations')} icon={<FiUsers />} label="Registry" />}
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-6 mb-2 ml-4">LMS Controls</p>
            {hasAccess('batches') && <SidebarBtn active={activeTab === 'batches'} onClick={() => handleTabSwitch('batches')} icon={<FiClock />} label="Batch Master" />}
            <SidebarBtn active={activeTab === 'lectures'} onClick={() => handleTabSwitch('lectures')} icon={<FiVideo />} label="Live classroom" />
            <SidebarBtn active={activeTab === 'materials'} onClick={() => handleTabSwitch('materials')} icon={<FiBookOpen />} label="Study Vault" />
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-6 mb-2 ml-4">Admin Tools</p>
            {hasAccess('coupons') && <SidebarBtn active={activeTab === 'coupons'} onClick={() => handleTabSwitch('coupons')} icon={<FiTag />} label="Coupon Engine" />}
            {hasAccess('logs') && <SidebarBtn active={activeTab === 'logs'} onClick={() => handleTabSwitch('logs')} icon={<FiActivity />} label="Audit Logs" />}
        </nav>
    ), [activeTab, userRole]);

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-left relative text-slate-800">
            <AnimatePresence>{toast.show && (
                <motion.div initial={{ y: -50, x: "-50%", opacity: 0 }} animate={{ y: 30, x: "-50%", opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed left-1/2 z-[999] bg-[#1A5F7A] text-white px-8 py-4 rounded-[1.5rem] shadow-2xl font-black border-b-4 border-[#F37021] uppercase text-[11px] italic flex items-center gap-3">
                    <FiZap className="text-[#F37021] text-lg animate-pulse"/> {toast.message}
                </motion.div>
            )}</AnimatePresence>

            <aside className={`fixed lg:relative z-[200] h-full w-80 bg-[#1A5F7A] text-white p-8 flex flex-col shadow-2xl transition-all duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="mb-12 font-black text-[#F37021] italic text-2xl uppercase tracking-tighter">Expert Academy<br/><span className="text-[10px] text-white/30 tracking-[0.4em] font-black not-italic block mt-1 uppercase">Admin Central</span></div>
                {memoizedSidebar}
            </aside>

            <div className="flex-1 flex flex-col min-w-0 relative">
                <header className="bg-white h-24 px-10 flex items-center justify-between border-b border-slate-100 shadow-sm sticky top-0 z-[100]">
                    <div className="flex items-center gap-5"><button className="lg:hidden text-[#1A5F7A] p-3 bg-slate-50 rounded-2xl" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24} /></button><div><h2 className="font-black text-[#1A5F7A] text-lg uppercase italic">{activeTab.replace('-', ' ')}</h2><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Management Interface</p></div></div>
                    <div className="flex items-center gap-8"><div className="hidden sm:flex flex-col text-right border-r pr-8 border-slate-100"><div className="text-right"><span className="text-[#1A5F7A] text-[13px] font-black uppercase block">{userName}</span><span className="text-[9px] font-bold text-[#F37021] uppercase opacity-70">{userRole}</span></div><div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-[#1A5F7A] font-black italic border border-white ml-4">{userName.charAt(0)}</div></div><button onClick={() => setLogoutModal(true)} className="p-4 bg-red-50 text-red-500 rounded-2xl active:scale-90"><FiLogOut size={22} /></button></div>
                </header>

                <main className="p-12 overflow-y-auto flex-1 no-scrollbar bg-[#F8FAFC]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left animate-in fade-in duration-500">
                            <div className="bg-[#1A5F7A] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group"><FiDollarSign className="absolute -right-4 -bottom-4 text-9xl opacity-10" /><p className="text-[10px] uppercase font-black opacity-60 mb-1">Gross Revenue</p><div className="text-4xl font-black italic tracking-tighter">₹{finances.total.toLocaleString()}</div></div>
                            <div className="bg-white p-8 rounded-[2.5rem] border flex items-center gap-5 shadow-sm group hover:border-[#F37021] transition-all"><div className="p-4 bg-orange-50 text-[#F37021] rounded-2xl group-hover:bg-[#F37021] group-hover:text-white transition-all"><FiUsers size={30}/></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment</p><div className="text-xl font-black text-[#1A5F7A] italic leading-none">{data.length} Enrolled</div></div></div>
                            <div className="bg-white p-8 rounded-[2.5rem] border flex items-center gap-5 shadow-sm group hover:border-[#1A5F7A] transition-all border-dashed"><div className="p-4 bg-blue-50 text-[#1A5F7A] rounded-2xl group-hover:bg-[#1A5F7A] group-hover:text-white transition-all"><FiMonitor size={30}/></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p><div className="text-xl font-black text-green-500 italic leading-none">LIVE</div></div></div>
                            <div className="bg-white p-8 rounded-[2.5rem] border flex items-center gap-5 shadow-sm group hover:border-red-500 transition-all border-dashed"><div className="p-4 bg-red-50 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all"><FiTrendingDown size={30}/></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approval Queue</p><div className="text-xl font-black text-[#1A5F7A] italic leading-none">{finances.pendingAdjustments} Found</div></div></div>
                        </div>
                    )}

                    {activeTab === 'enquiries' && (
                        <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <div className="flex justify-between items-center"><h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic tracking-tighter leading-none">Inquiry Pipeline</h3><div className="relative w-96 group"><FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#F37021] transition-colors"/><input type="text" placeholder="Search Identity..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none font-bold shadow-sm focus:border-[#F37021] transition-all" onChange={e => setSearchQuery(e.target.value)}/></div></div>
                             <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-x-auto">
                                <table className="w-full text-left text-[11px] border-collapse"><thead className="bg-slate-50 font-black uppercase text-slate-400 border-b tracking-widest text-[9px]"><tr><th className="p-7">Lead Identity</th><th>Program</th><th>Source</th><th>Date</th><th>Remarks</th><th className="pr-7 text-right">Action</th></tr></thead>
                                    <tbody className="divide-y divide-slate-50 font-bold">
                                        {filteredData.map(item => (
                                            <tr key={item._id} className="hover:bg-blue-50/20 transition-all group">
                                                <td className="p-7"><div className="font-black text-[#1A5F7A] uppercase italic text-[13px] group-hover:text-[#F37021]">{item.name}</div><div className="text-slate-400 font-bold text-[9px] mt-1 tracking-widest">{item.phone}</div></td>
                                                <td className="font-black text-[#1A5F7A] uppercase opacity-80">{item.course || "GENERAL"}</td>
                                                <td><div className="px-3 py-1 bg-green-50 text-green-600 rounded-full font-black text-[8px] w-fit italic uppercase border border-green-100 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Website</div></td>
                                                <td className="font-black text-slate-400 italic uppercase"><FiCalendar className="inline mr-2" />{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
                                                <td><div className="flex items-center gap-3 bg-slate-50 p-2 rounded-[1rem] focus-within:bg-white transition-all border border-transparent focus-within:border-slate-100"><FiEdit3 className="text-slate-300"/><input type="text" value={item.remarks || "NOT CONTACTED"} className="bg-transparent text-[11px] font-black outline-none w-full" /></div></td>
                                                <td className="pr-7 text-right"><button onClick={() => handleEnquiryStatusUpdate(item._id, item.isContacted, item.remarks, item.name)} className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ml-auto ${item.isContacted ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-white border-2 text-slate-200 hover:border-[#F37021] hover:text-[#F37021]'}`}>{item.isContacted ? <FiCheckCircle size={20}/> : <FiPhoneCall size={18}/>}</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'registrations' && (
                        <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-4">
                             <div className="flex justify-between items-center"><h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic tracking-tighter">Student Registry</h3><div className="relative w-96"><FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"/><input type="text" placeholder="Search IDENTITY..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none font-bold" onChange={e => setSearchQuery(e.target.value)}/></div></div>
                             <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden overflow-x-auto">
                                <table className="w-full text-left text-[11px]"><thead className="bg-slate-50 font-black uppercase text-slate-400 border-b tracking-widest text-[9px]"><tr><th className="p-7">Student Identity</th><th>Portal Access</th><th>Financial Ledger</th><th className="pr-7 text-right">Ledger Sync</th></tr></thead>
                                    <tbody className="divide-y divide-slate-50 font-bold">
                                        {filteredData.map(item => {
                                            const ledger = calculateAggregateLedger(item);
                                            const isPending = item.discountRequest?.status === 'PENDING';
                                            return (
                                                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-7"><div className="font-black text-[#1A5F7A] uppercase italic text-[13px]">{item.name}</div><div className="text-slate-400 font-bold text-[10px] mt-0.5">{item.email}</div></td>
                                                    <td>{item.isPortalActive ? <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg w-fit font-black text-[9px] border border-green-100 uppercase italic"><FiCheckCircle/> Active</div> : <button onClick={async () => { await axios.patch(`${API_URL}/admin/registrations/${item._id}/grant-access`, {}, { headers: { Authorization: `Bearer ${token}` } }); fetchData(true); }} className="bg-[#1A5F7A] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-lg active:scale-95">Unlock Access</button>}</td>
                                                    <td><div className="font-black"><div className="text-[#1A5F7A] text-[13px]">₹{item.amountPaid?.toLocaleString()} / <span className="text-slate-300">₹{ledger.total.toLocaleString()}</span></div><div className={`text-[9px] uppercase italic ${ledger.due > 0 ? 'text-red-500' : 'text-green-600'}`}>{isPending ? "APPROVAL PENDING" : (ledger.due > 0 ? `Due: ₹${ledger.due}` : "Cleared")}</div></div></td>
                                                    <td className="pr-7 text-right">
                                                        <div className="flex items-center justify-end gap-3">{userRole === 'founder' && isPending && <button onClick={() => handleFounderApprove(item._id)} className="bg-green-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg hover:scale-105 transition-all"><FiCheck className="inline mr-1"/> Approve</button>}
                                                        <button onClick={() => setPaymentModal({ show: true, student: item, amount: "" })} className="w-11 h-11 bg-[#F37021]/10 text-[#F37021] rounded-2xl flex items-center justify-center hover:bg-[#F37021] hover:text-white transition-all shadow-sm"><FiCreditCard size={18}/></button></div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'coupons' && (
                        <div className="space-y-10 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
                             {/* EXACT UI IMAGE 920d2a */}
                             <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden border-t-[10px] border-[#1A5F7A]">
                                <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-4"><div className="w-2 h-10 bg-[#F37021] rounded-full"></div><h3 className="text-xl font-black text-[#1A5F7A] uppercase italic leading-none">Core Parameter Setting</h3></div>
                                    {coupons.some(c => c.code.toUpperCase() === couponForm.code.toUpperCase()) && <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-1.5 rounded-xl border border-red-100 font-black text-[9px] uppercase animate-pulse"><FiAlertCircle/> Duplicate Code Found</div>}
                                </div>
                                <form onSubmit={handleCreateCoupon} className="p-10 grid grid-cols-2 gap-10">
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Activation Code</label><div className="relative group"><FiArrowRight className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-[#F37021]" /><input required className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:bg-white focus:border-[#F37021] transition-all uppercase tracking-widest" placeholder="CODE" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} /></div></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Redemption Limit</label><input required type="number" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:bg-white focus:border-[#F37021] transition-all" placeholder="00" value={couponForm.maxUsage} onChange={e => setCouponForm({...couponForm, maxUsage: e.target.value})} /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Start Window</label><input required type="date" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:bg-white focus:border-[#F37021] transition-all" value={couponForm.validFrom} onChange={e => setCouponForm({...couponForm, validFrom: e.target.value})} /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Expiry Window</label><input required type="date" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:bg-white focus:border-[#F37021] transition-all" value={couponForm.validTo} onChange={e => setCouponForm({...couponForm, validTo: e.target.value})} /></div>
                                    <div className="col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest italic">Narrative</label><textarea required className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold h-24 outline-none focus:bg-white focus:border-[#F37021] transition-all resize-none" placeholder="Provide description..." value={couponForm.description} onChange={e => setCouponForm({...couponForm, description: e.target.value})} /></div>
                                    
                                    {/* SCOPE SECTION IMAGE 920dc7 */}
                                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 border-t pt-10">
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#F37021] ml-4 flex items-center gap-2 italic tracking-widest"><FiTarget/> Product Scope</label><select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:bg-white focus:border-[#F37021] transition-all appearance-none" onChange={e => setCouponForm({...couponForm, courseCode: e.target.value})}><option value="ALL">-- Choose scope --</option>{allCourses.map(c => <option key={c.title} value={c.title}>{c.title}</option>)}</select></div>
                                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#F37021] ml-4 flex items-center gap-2 italic tracking-widest"><FiPieChart/> Mathematical Model</label><div className="flex bg-slate-100 p-1.5 rounded-[2rem]"><button type="button" onClick={() => setCouponForm({...couponForm, discountType: 'PERCENTAGE'})} className={`flex-1 py-3 rounded-full font-black text-[10px] uppercase transition-all ${couponForm.discountType === 'PERCENTAGE' ? 'bg-[#1A5F7A] text-white shadow-xl' : 'text-slate-400'}`}>Percentage (%)</button><button type="button" onClick={() => setCouponForm({...couponForm, discountType: 'FLAT'})} className={`flex-1 py-3 rounded-full font-black text-[10px] uppercase transition-all ${couponForm.discountType === 'FLAT' ? 'bg-[#1A5F7A] text-white shadow-xl' : 'text-slate-400'}`}>Fixed (₹)</button></div></div>
                                        <div className="col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic tracking-widest leading-none">Deployment Value</label><div className="relative group"><input required type="number" className="w-full p-10 bg-slate-50 border-2 border-slate-100 rounded-[3rem] font-black text-6xl outline-none text-center focus:bg-white focus:border-[#F37021] transition-all shadow-inner" placeholder="00" value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} /><div className="absolute right-10 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-200">{couponForm.discountType === 'PERCENTAGE' ? '%' : '₹'}</div></div></div>
                                    </div>
                                    <button className="col-span-2 py-6 bg-[#1A5F7A] text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all text-xs">Logic Mapping Finalized</button>
                                </form>
                             </div>

                             {/* PRODUCTION REGISTRY IMAGE 877e58 */}
                             <div className="bg-[#1A5F7A] rounded-[2.5rem] shadow-xl overflow-hidden"><div className="p-8 flex justify-between items-center text-white"><h3 className="font-black uppercase italic tracking-widest">Production Registry</h3><div className="bg-[#F37021] px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-white/20">{coupons.length} ACTIVE</div></div><div className="bg-white mx-1 mb-1 rounded-b-[2.5rem] overflow-hidden overflow-x-auto"><table className="w-full text-left text-[11px]"><thead className="bg-slate-50 text-slate-400 font-black uppercase border-b text-[9px] tracking-tight"><tr><th className="p-8">Target</th><th className="text-center">Code</th><th className="text-center">Benefit</th><th className="text-center">Burn</th><th className="text-right pr-8">Status</th></tr></thead><tbody className="divide-y divide-slate-50 font-bold">{coupons.map(c => (<tr key={c._id}><td className="p-8 text-[#1A5F7A] uppercase text-[10px] font-black">{c.description}</td><td className="text-center text-[#F37021] italic uppercase font-black">{c.code}</td><td className="text-center font-black">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`} OFF</td><td className="text-center w-48"><div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex relative"><div className="bg-orange-400 h-full w-[40%] animate-pulse"></div></div><div className="text-[8px] mt-1 text-slate-300 uppercase italic">Measured at Scale</div></td><td className="text-right pr-8"><div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[8px] font-black uppercase italic border border-green-200 ml-auto w-fit">LIVE</div></td></tr>))}</tbody></table></div></div>
                        </div>
                    )}

                    {activeTab === 'logs' && userRole === 'founder' && (
                        <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <div className="flex justify-between items-center"><h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic">Administrative Audit</h3><div className="bg-[#1A5F7A] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase italic border border-white/20 flex items-center gap-2"><FiShield className="text-green-500 animate-pulse"/> Ledger Verified</div></div>
                             <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden"><table className="w-full text-left border-collapse"><thead className="bg-slate-50 text-[10px] font-black uppercase border-b p-8 tracking-widest text-slate-400"><tr><th className="p-8">Operator</th><th>Action Event</th><th>Target</th><th className="pr-8 text-right">Detailed Temporal Sync</th></tr></thead><tbody className="divide-y divide-slate-50 font-bold text-[11px]">{auditLogs.map((log, idx) => (<tr key={idx} className="hover:bg-slate-50 transition-all border-l-4 border-transparent hover:border-[#F37021]"><td className="p-8"><div className="text-[#1A5F7A] font-black uppercase italic">{log.performedBy}</div></td><td className="uppercase opacity-60 text-[10px]">{log.action}</td><td className="italic text-slate-500 font-black">{log.targetName}</td><td className="pr-8 text-right"><div className="text-[#1A5F7A] font-black flex items-center justify-end gap-2 text-[14px] leading-none mb-1 font-black"><FiTime className="text-[#F37021]"/> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</div><div className="text-[10px] text-slate-400 uppercase tracking-widest font-black italic"> {new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} </div></td></tr>))}</tbody></table></div>
                        </div>
                    )}

                    {activeTab === 'batches' && <BatchScheduler />}
                    {activeTab === 'lectures' && <AddLecture />}
                    {activeTab === 'materials' && <AddMaterial />}
                </main>
            </div>

            {/* LEDGER MODAL IMAGE 8724a1 */}
            <AnimatePresence>{paymentModal.show && paymentModal.student && (() => {
                const ledger = calculateAggregateLedger(paymentModal.student);
                return (
                    <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 text-left">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3.5rem] p-10 max-w-md w-full shadow-2xl relative border-t-[15px] border-[#1A5F7A]">
                            <button onClick={() => { setPaymentModal({ show: false, student: null, amount: "" }); setDiscountMode(false); }} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><FiX size={24} /></button>
                            <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic mb-1 tracking-tighter leading-none">Ledger Control</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 italic tracking-widest">Updating Student: {paymentModal.student.name}</p>
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 font-black uppercase text-[10px]"><button onClick={() => setDiscountMode(false)} className={`flex-1 py-3 rounded-xl transition-all ${!discountMode ? 'bg-white text-[#1A5F7A] shadow-sm' : 'text-slate-400'}`}>Receive Payment</button><button onClick={() => setDiscountMode(true)} className={`flex-1 py-3 rounded-xl transition-all ${discountMode ? 'bg-[#F37021] text-white shadow-sm' : 'text-slate-400'}`}>Apply Adjustment</button></div>
                            <div className={`rounded-[2rem] p-6 mb-8 border flex justify-between items-center transition-colors ${discountMode ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}><div><p className="text-[9px] font-black text-slate-400 uppercase mb-1 leading-none italic">Total Value</p><div className="text-lg font-black text-slate-600 leading-none tracking-tighter leading-none italic font-black">₹{ledger.total.toLocaleString()}</div></div><div className="text-right"><p className="text-[9px] font-black text-red-400 uppercase mb-1 italic tracking-widest leading-none">Net Due</p><div className="text-2xl font-black italic text-red-600 leading-none tracking-tighter">₹{ledger.due.toLocaleString()}</div></div></div>
                            <form onSubmit={handleLedgerAdjustment} className="space-y-6"><div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic flex items-center gap-2">{discountMode ? <FiTag className="text-[#F37021]"/> : <FiDollarSign className="text-green-500"/>} Amount (₹)</label><div className="relative group shadow-inner rounded-[2rem] overflow-hidden"><input required autoFocus type="number" className={`w-full p-6 bg-slate-50 border-2 rounded-[2rem] font-black text-3xl outline-none transition-all text-center ${discountMode ? 'focus:border-[#F37021] focus:bg-white' : 'focus:border-green-500 focus:bg-white'}`} placeholder="0000" value={discountMode ? discountData.amount : paymentModal.amount} onChange={(e) => discountMode ? setDiscountData({...discountData, amount: e.target.value}) : setPaymentModal({...paymentModal, amount: e.target.value})} /><div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-200">₹</div></div></div>{discountMode && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic flex items-center gap-2"><FiAlertCircle className="text-[#F37021]"/> Mandatory Reason for Founder</label><textarea required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold text-xs outline-none focus:bg-white focus:border-[#F37021] min-h-[100px] resize-none" placeholder="Provide reason..." value={discountData.reason} onChange={(e) => setDiscountData({...discountData, reason: e.target.value})} /></motion.div>)}<button type="submit" className={`w-full py-6 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${discountMode ? 'bg-[#F37021] hover:bg-[#d9621c] shadow-orange-100' : 'bg-green-600 hover:bg-green-700 shadow-green-100'}`}><FiCheckCircle size={18}/> {discountMode ? "Request Founder Approval" : "Confirm Sync"}</button></form>
                        </motion.div>
                    </div>
                );
            })()}</AnimatePresence>

            {/* LOGOUT MODAL */}
            <AnimatePresence>{logoutModal && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 text-center">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-t-8 border-red-500"><FiLogOut className="mx-auto text-red-500 mb-6" size={48} /><h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic mb-8 leading-tight tracking-tighter">Terminate Active<br/>Management Session?</h3><div className="grid grid-cols-2 gap-4"><button onClick={() => setLogoutModal(false)} className="py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px] text-slate-500 active:scale-95 transition-all hover:bg-slate-200">Cancel</button><button onClick={handleLogout} className="py-4 bg-red-50 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all hover:bg-red-600">Logout Now</button></div></motion.div>
                </div>
            )}</AnimatePresence>
        </div>
    );
}