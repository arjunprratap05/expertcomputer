import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiX, FiMenu, FiSearch, 
    FiCheckCircle, FiCreditCard, FiPieChart, FiDollarSign, FiVideo, FiBookOpen, 
    FiGrid, FiClock, FiShield, FiTrendingUp, FiRefreshCw, FiAlertTriangle, FiPlus, FiKey, FiMail, FiPhone,
    FiTag, FiCalendar, FiChevronRight, FiChevronLeft, FiSave, FiRotateCcw, FiTrash2, FiUser, FiEdit2
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

    // --- 1. RBAC PERMISSIONS ---
    const permissions = {
        founder: ['overview', 'logs', 'registrations', 'batches', 'lectures', 'materials', 'enquiries', 'coupons'],
        frontoffice: ['batches', 'lectures', 'materials', 'enquiries'],
        accounts: ['registrations', 'batches', 'lectures', 'materials', 'coupons']
    };
    const hasAccess = (tab) => permissions[userRole]?.includes(tab);

    // --- 2. STATES ---
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
    
    // --- 3. COUPON ENGINE STATE ---
    const [couponStep, setCouponStep] = useState(1);
    const [coupons, setCoupons] = useState([]);
    const [couponForm, setCouponForm] = useState({
        code: "", description: "", validFrom: "", validTo: "", 
        type: "PROMOTIONAL", maxUsage: "", isActive: true, purpose: "",
        courseCode: "", paymentType: "ALL", 
        discountType: "PERCENTAGE", // Default to Percentage
        discountValue: "", isVisibleOnForm: false
    });

    const audioRef = useRef(new Audio('/sounds/notification.mp3'));
    const [approvalModal, setApprovalModal] = useState({ show: false, student: null });
    const [selectedBatches, setSelectedBatches] = useState([]); 
    const [paymentModal, setPaymentModal] = useState({ show: false, student: null, amount: "" });

    const allCourses = useMemo(() => [...techCoursesData, ...universityPrograms], []);

    // --- 4. CORE LOGIC HANDLERS ---
    const triggerToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/admin/login", { replace: true });
        window.location.reload(); 
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
        try {
            const currentPaid = Number(paymentModal.student.amountPaid) || 0;
            const newTotal = currentPaid + Number(paymentModal.amount);
            await axios.patch(`${API_URL}/admin/registrations/${paymentModal.student._id}/update-payment`, { amountPaid: newTotal }, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast("LEDGER UPDATED");
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
        } catch (err) { alert("Deployment Failed: Check your Enum selections (Type/Payment)"); }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-[#1A5F7A] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <FiDollarSign className="absolute -right-4 -bottom-4 text-9xl opacity-10" />
                <p className="text-[10px] uppercase font-black opacity-60 tracking-widest mb-1">Aggregate Revenue</p>
                <div className="text-4xl font-black italic">₹{finances.total.toLocaleString()}</div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border flex items-center gap-5 shadow-sm">
                <div className="p-4 bg-orange-50 text-[#F37021] rounded-2xl"><FiPieChart size={30}/></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Top Performer</p><div className="text-xl font-black text-[#1A5F7A] italic leading-none">{finances.topCourses[0]?.name || 'N/A'}</div></div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-left relative">
            <AnimatePresence>{toast.show && (
                <motion.div initial={{ y: -50, x: "-50%" }} animate={{ y: 30, x: "-50%" }} exit={{ y: -50 }} className="fixed left-1/2 z-[999] bg-[#1A5F7A] text-white px-8 py-3 rounded-2xl shadow-2xl font-black border-b-4 border-[#F37021] uppercase text-[10px] italic">
                    <FiCheckCircle className="inline mr-2 text-[#F37021]"/>{toast.message}
                </motion.div>
            )}</AnimatePresence>

            <aside className={`fixed lg:relative z-[200] h-full w-72 bg-[#1A5F7A] text-white p-6 flex flex-col shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="mb-10 flex justify-between items-center">
                    <div className="font-black text-[#F37021] italic text-xl uppercase tracking-tighter leading-tight">Expert Academy<br/><span className="text-[10px] text-white/40 tracking-[0.2em] font-bold not-italic">Admin Hub</span></div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50"><FiX size={24}/></button>
                </div>
                <nav className="flex flex-col gap-2 flex-1 no-scrollbar overflow-y-auto">
                    {hasAccess('overview') && <SidebarBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<FiGrid />} label="Overview" />}
                    {hasAccess('enquiries') && <SidebarBtn active={activeTab === 'enquiries'} onClick={() => setActiveTab('enquiries')} icon={<FiMessageSquare />} label="Admission Enquiries" />}
                    {hasAccess('registrations') && <SidebarBtn active={activeTab === 'registrations'} onClick={() => setActiveTab('registrations')} icon={<FiUsers />} label="Registrations" />}
                    {hasAccess('coupons') && <SidebarBtn active={activeTab === 'coupons'} onClick={() => setActiveTab('coupons')} icon={<FiTag />} label="Coupon Engine" />}
                    {hasAccess('batches') && <SidebarBtn active={activeTab === 'batches'} onClick={() => setActiveTab('batches')} icon={<FiClock />} label="Batch Master" />}
                    <SidebarBtn active={activeTab === 'lectures'} onClick={() => setActiveTab('lectures')} icon={<FiVideo />} label="Live Classroom" />
                    <SidebarBtn active={activeTab === 'materials'} onClick={() => setActiveTab('materials')} icon={<FiBookOpen />} label="Study Vault" />
                    {hasAccess('logs') && <SidebarBtn active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<FiActivity />} label="Audit Logs" />}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white h-20 px-8 flex items-center justify-between border-b sticky top-0 z-[100]">
                    <div className="flex items-center gap-3">
                        <button className="lg:hidden text-[#1A5F7A] p-2 bg-slate-50 rounded-xl" onClick={() => setIsSidebarOpen(true)}><FiMenu size={22} /></button>
                        <h2 className="lg:hidden font-black text-[#1A5F7A] text-sm uppercase italic tracking-tighter">PRD System</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col text-right border-r pr-6 border-slate-100">
                            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Operator Session</span>
                            <div className="flex items-center gap-2 mt-0.5 justify-end">
                                <span className="text-[#1A5F7A] text-[12px] font-black uppercase italic">{userName}</span>
                                <div className="px-2 py-0.5 bg-orange-100 text-[#F37021] text-[8px] font-bold rounded-md uppercase tracking-tighter">{userRole}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 border flex items-center justify-center text-[#1A5F7A]"><FiUser size={20} /></div>
                            <button onClick={() => setLogoutModal(true)} className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-90"><FiLogOut size={20} /></button>
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-10 overflow-y-auto flex-1 no-scrollbar">
                    
                    {/* ENQUIRIES */}
                    {activeTab === 'enquiries' && (
                         <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center"><h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic">Enquiries</h3><div className="relative w-72"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"/><input type="text" placeholder="Search Identity..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl" onChange={e => setSearchQuery(e.target.value)}/></div></div>
                            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden overflow-x-auto"><table className="w-full text-left text-[11px]"><thead className="bg-slate-50 font-black uppercase text-slate-400 border-b"><tr><th className="p-5">Lead Identity</th><th>Contact</th><th>Source</th><th>Time</th></tr></thead>
                            <tbody className="divide-y">{filteredData.map(item => (<tr key={item._id} className="hover:bg-slate-50"><td className="p-5 font-black text-[#1A5F7A] uppercase italic">{item.name}</td><td>{item.phone}</td><td><SourceTag source={item.source} /></td><td>{new Date(item.createdAt).toLocaleDateString()}</td></tr>))}</tbody></table></div>
                        </div>
                    )}

                    {/* REGISTRATIONS */}
                    {activeTab === 'registrations' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                             <div className="bg-white rounded-3xl shadow-sm border overflow-hidden overflow-x-auto"><table className="w-full text-left text-[11px]"><thead className="bg-slate-50 font-black uppercase text-slate-400 border-b"><tr><th className="p-5">Student Identity</th><th>Access</th><th>Stream Sync</th><th>Ledger Sync</th><th>Action</th></tr></thead>
                                <tbody className="divide-y">{filteredData.map(item => {
                                    const ledger = calculateAggregateLedger(item);
                                    const unsynced = getUnsyncedCourses(item);
                                    return (
                                        <tr key={item._id} className="hover:bg-slate-50">
                                            <td className="p-5 font-black text-[#1A5F7A] uppercase italic">{item.name}<br/><span className="text-slate-400 font-bold text-[9px] lowercase">{item.email}</span></td>
                                            <td>{item.isPortalActive ? <div className="text-green-600 font-black text-[8px] uppercase bg-green-50 px-2 py-1 rounded w-fit italic">Active</div> : <button onClick={() => handleActivatePortal(item)} className="bg-[#1A5F7A] text-white px-3 py-1 rounded text-[8px] font-black uppercase italic">Unlock</button>}</td>
                                            <td><div onClick={() => { setApprovalModal({ show: true, student: item }); setSelectedBatches(item.activeBatches || []); }} className="cursor-pointer font-black text-green-600 bg-green-50 px-2 py-1 rounded w-fit uppercase">{item.activeBatches?.length || 0} Synced {unsynced.length > 0 && <span className="text-red-500 animate-pulse">!</span>}</div></td>
                                            <td><div className="font-black text-[#1A5F7A]">₹{ledger.paid.toLocaleString()}<br/><span className="text-red-500 text-[8px] uppercase">Due: ₹{ledger.due.toLocaleString()}</span></div></td>
                                            <td className="p-5 flex gap-2"><button onClick={() => setPaymentModal({ show: true, student: item, amount: "" })} className="p-2 bg-slate-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><FiCreditCard/></button></td>
                                        </tr>
                                    );
                                })}</tbody></table></div>
                        </div>
                    )}

                    {/* COUPON ENGINE (WITH DYNAMIC DISCOUNT TYPE SELECTOR) */}
                    {activeTab === 'coupons' && (
                        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                            <div className="flex items-center justify-between border-b pb-4">
                                <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic flex items-center gap-2"><FiTag className="text-[#F37021]"/> Deployment Wizard</h3>
                                <div className="flex gap-2">
                                    <div className={`w-10 h-1 rounded-full ${couponStep >= 1 ? 'bg-[#F37021]' : 'bg-slate-200'}`} />
                                    <div className={`w-10 h-1 rounded-full ${couponStep >= 2 ? 'bg-[#F37021]' : 'bg-slate-200'}`} />
                                </div>
                            </div>
                            
                            {couponStep === 1 ? (
                                <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl shadow-lg border-t-4 border-[#1A5F7A] overflow-hidden">
                                    <div className="bg-[#1A5F7A] p-4 text-white font-bold text-sm uppercase tracking-wide">Step 1: Deployment Parameters</div>
                                    <form onSubmit={(e) => { e.preventDefault(); setCouponStep(2); }} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Coupon Code*</label><input required className="w-full p-2.5 border rounded-md uppercase font-bold" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} /></div>
                                        <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Validity Start*</label><input type="date" required className="w-full p-2.5 border rounded-md" value={couponForm.validFrom} onChange={e => setCouponForm({...couponForm, validFrom: e.target.value})} /></div>
                                        <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Validity End*</label><input type="date" required className="w-full p-2.5 border rounded-md" value={couponForm.validTo} onChange={e => setCouponForm({...couponForm, validTo: e.target.value})} /></div>
                                        <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">No. of usable*</label><input type="number" required className="w-full p-2.5 border rounded-md" value={couponForm.maxUsage} onChange={e => setCouponForm({...couponForm, maxUsage: e.target.value})} /></div>
                                        <div className="md:col-span-2 space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Purpose*</label><input required className="w-full p-2.5 border rounded-md" value={couponForm.description} onChange={e => setCouponForm({...couponForm, description: e.target.value, purpose: e.target.value})} /></div>
                                        <div className="md:col-span-2 flex justify-center pt-4 border-t"><button type="submit" className="bg-[#1A5F7A] text-white px-10 py-2.5 rounded font-black text-xs uppercase shadow-xl hover:bg-[#F37021] transition-all flex items-center gap-2">Move to Mapping <FiChevronRight/></button></div>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div key="s2" initial={{ x: 20 }} animate={{ x: 0 }} className="space-y-8">
                                    <div className="bg-white rounded-xl shadow-lg border-t-4 border-[#F37021] overflow-hidden">
                                        <div className="bg-[#F37021] p-4 text-white font-bold text-sm uppercase flex justify-between"><span>Step 2: Course Mapping</span><button onClick={() => setCouponStep(1)}><FiX/></button></div>
                                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Target Course*</label><select required className="w-full p-2.5 border rounded-md font-bold" value={couponForm.courseCode} onChange={e => setCouponForm({...couponForm, courseCode: e.target.value})}><option value="">-- Choose Course --</option><option value="ALL">All Programs</option>{allCourses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}</select></div>
                                            
                                            {/* NEW DISCOUNT TYPE SELECTOR */}
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase">Discount Logic*</label>
                                                <div className="flex gap-2 p-1 bg-slate-50 rounded-lg">
                                                    <button onClick={() => setCouponForm({...couponForm, discountType: 'PERCENTAGE'})} className={`flex-1 py-2 rounded-md font-black text-[10px] uppercase transition-all ${couponForm.discountType === 'PERCENTAGE' ? 'bg-[#1A5F7A] text-white shadow-md' : 'text-slate-400 hover:text-[#1A5F7A]'}`}>Percentage (%)</button>
                                                    <button onClick={() => setCouponForm({...couponForm, discountType: 'FIXED'})} className={`flex-1 py-2 rounded-md font-black text-[10px] uppercase transition-all ${couponForm.discountType === 'FIXED' ? 'bg-[#1A5F7A] text-white shadow-md' : 'text-slate-400 hover:text-[#1A5F7A]'}`}>Fixed Amount (₹)</button>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase">Discount Value ({couponForm.discountType === 'PERCENTAGE' ? '%' : '₹'})*</label>
                                                <input required type="number" className="w-full p-2.5 border rounded-md font-black text-[#F37021] text-2xl" value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} />
                                            </div>

                                            <div className="md:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden flex justify-between items-center mt-4">
                                                <div className="relative z-10"><p className="text-[9px] font-black text-[#F37021] uppercase tracking-[0.3em] mb-2">Final Review</p><h4 className="text-3xl font-black italic">{couponForm.code}</h4><p className="text-xs opacity-60 mt-1 uppercase font-bold tracking-tight">{couponForm.courseCode} • {couponForm.discountType === 'PERCENTAGE' ? `${couponForm.discountValue}% OFF` : `₹${couponForm.discountValue} OFF`}</p></div>
                                                <button onClick={handleFinalCouponSave} className="bg-[#F37021] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-2xl hover:bg-white hover:text-[#1A5F7A] transition-all flex items-center gap-2"><FiSave/> Deploy Coupon</button>
                                                <FiTag className="absolute -right-6 -bottom-6 text-9xl opacity-10 rotate-12" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow border overflow-hidden"><div className="p-4 bg-slate-50 font-black text-[10px] text-slate-500 uppercase tracking-widest border-b">Registry</div>
                                    <table className="w-full text-left text-[11px]"><thead className="bg-slate-50 border-b"><tr><th className="p-4">Course</th><th>Code</th><th>Val</th><th>Limit</th><th>Status</th></tr></thead>
                                    <tbody className="divide-y">{Array.isArray(coupons) && coupons.map(c => (<tr key={c._id} className="hover:bg-slate-50"><td className="p-4 uppercase font-bold text-[#1A5F7A]">{c.courseCode}</td><td className="font-black italic">{c.code}</td><td className="text-[#F37021] font-black">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td><td>{c.usedCount || 0}/{c.maxUsage}</td><td><span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded uppercase italic">Active</span></td></tr>))}</tbody></table></div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {(activeTab === 'overview' || activeTab === 'logs') && userRole === 'founder' && (
                        <div className="space-y-10 animate-in fade-in duration-500"><FinancialCards /><AuditTable logs={auditLogs} title={activeTab === 'overview' ? "Security monitor" : "Full Security Audit Trail"} /></div>
                    )}

                    {activeTab === 'batches' && <BatchScheduler />}
                    {activeTab === 'lectures' && <AddLecture />}
                    {activeTab === 'materials' && <AddMaterial />}
                </main>
            </div>

            {/* SYNC MODAL */}
            <AnimatePresence>{approvalModal.show && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative border-t-[10px] border-[#1A5F7A]"><button onClick={() => setApprovalModal({ show: false, student: null })} className="absolute top-6 right-6 text-slate-300 hover:text-red-500"><FiX size={24} /></button><h3 className="text-xl font-black text-[#1A5F7A] uppercase mb-4 italic">Stream Sync</h3><div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">{batches.filter(batch => { const enrollments = approvalModal.student?.enrollments || []; return enrollments.some(e => { const title = e.course.toLowerCase().trim(); const id = allCourses.find(c => c.title.toLowerCase().trim() === title)?.id.toLowerCase().trim(); return batch.courseId?.toLowerCase().trim() === title || batch.courseId?.toLowerCase().trim() === id; }); }).map(b => (<div key={b._id} onClick={() => setSelectedBatches(prev => prev.includes(b._id) ? prev.filter(i => i !== b._id) : [...prev, b._id])} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedBatches.includes(b._id) ? 'border-[#F37021] bg-orange-50' : 'border-slate-50 bg-white'}`}><div><div className="font-black text-[#1A5F7A] text-xs uppercase italic">{b.batchCode}</div><div className="text-[8px] font-bold text-slate-400 uppercase">{b.courseId}</div></div>{selectedBatches.includes(b._id) ? <FiCheckCircle className="text-[#F37021]" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-100" />}</div>))}</div><button onClick={handleBatchSync} className="w-full py-5 bg-[#F37021] text-white rounded-2xl font-black uppercase text-xs mt-6 shadow-xl">Authorize Streams</button></motion.div>
                </div>
            )}</AnimatePresence>
            
            {/* PAYMENT MODAL */}
            <AnimatePresence>{paymentModal.show && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border-t-[12px] border-green-600"><button onClick={() => setPaymentModal({ show: false, student: null, amount: "" })} className="absolute top-8 right-8 text-slate-300 hover:text-red-500"><FiX size={24} /></button><h3 className="text-xl font-black text-[#1A5F7A] uppercase text-center italic">Update Ledger</h3><div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 mt-6 mb-8 flex justify-between"><div><p className="text-[8px] font-black text-slate-400 uppercase">Paid</p><p className="text-base font-black text-[#1A5F7A]">₹{paymentModal.student?.amountPaid?.toLocaleString()}</p></div><div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase">Total</p><p className="text-base font-black text-slate-500">₹{calculateAggregateLedger(paymentModal.student).totalContractValue?.toLocaleString()}</p></div></div><form onSubmit={handlePaymentPush} className="space-y-6"><input autoFocus type="number" placeholder="Enter Amount" className="w-full p-5 bg-slate-50 rounded-2xl font-black text-3xl text-[#1A5F7A] outline-none text-center border-2 border-transparent focus:border-green-100" value={paymentModal.amount} onChange={(e) => setPaymentModal({...paymentModal, amount: e.target.value})} /><button type="submit" className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl tracking-widest hover:bg-green-700 transition-all">Submit Sync</button></form></motion.div>
                </div>
            )}</AnimatePresence>

            {/* LOGOUT MODAL */}
            <AnimatePresence>{logoutModal && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 text-center">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-t-8 border-red-500"><div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><FiLogOut size={24} /></div><h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic leading-tight">Terminate Session?</h3><div className="grid grid-cols-2 gap-4 mt-8"><button onClick={() => setLogoutModal(false)} className="py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px] text-slate-500">Cancel</button><button onClick={handleLogout} className="py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Logout</button></div></motion.div>
                </div>
            )}</AnimatePresence>
        </div>
    );
}

function SidebarBtn({ active, onClick, icon, label }) {
    return <button onClick={onClick} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${active ? 'bg-[#F37021] text-white shadow-lg scale-105' : 'hover:bg-white/10 text-slate-300'}`}><span className="text-lg">{icon}</span><span className="text-[11px] uppercase tracking-tight font-black">{label}</span></button>;
}
function SourceTag({ source }) {
    const styles = { 'AI Chatbot': 'bg-blue-50 text-blue-600', 'Facebook': 'bg-indigo-50 text-indigo-600', 'Website': 'bg-green-50 text-green-600' };
    return <div className={`px-3 py-1 border rounded-xl font-black text-[9px] uppercase italic w-fit ${styles[source] || 'bg-slate-50 text-slate-400'}`}>{source || 'Standard'}</div>;
}
function AuditTable({ logs, title }) {
    return <div className="space-y-6"><h3 className="text-xl font-black text-[#1A5F7A] uppercase italic px-2 flex items-center gap-2"><FiShield className="text-[#F37021]"/> {title}</h3><div className="bg-white rounded-3xl shadow-sm border overflow-hidden overflow-x-auto"><table className="w-full text-left min-w-[600px]"><thead className="bg-slate-50 text-[10px] font-black uppercase border-b"><tr><th className="p-6">Staff</th><th>Action</th><th>Target</th><th>Time</th></tr></thead><tbody className="divide-y divide-slate-50">{logs && logs.length > 0 ? logs.map(log => (<tr key={log._id} className="text-[11px] hover:bg-slate-50"><td className="p-6 font-bold uppercase text-[#1A5F7A]">{log.performedBy}</td><td className="font-black text-[#1A5F7A] uppercase italic">{log.action}</td><td className="font-bold text-slate-500 uppercase">{log.targetName}</td><td className="text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</td></tr>)) : <tr><td colSpan="4" className="p-20 text-center text-slate-300 italic uppercase font-black text-xs tracking-widest">No Activity Pulse Detected</td></tr>}</tbody></table></div></div>;
}