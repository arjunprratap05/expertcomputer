import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiX, FiMenu, FiSearch, 
    FiCheckCircle, FiCreditCard, FiPieChart, FiDollarSign, FiVideo, FiBookOpen, 
    FiGrid, FiClock, FiShield, FiTrendingUp, FiRefreshCw, FiAlertTriangle, FiPlus, FiList
} from 'react-icons/fi';

// DATA SOURCES for price calculation
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

    // --- 1. RBAC CONFIG ---
    const permissions = {
        founder: ['overview', 'logs', 'registrations', 'batches', 'lectures', 'materials', 'enquiries'],
        frontoffice: ['batches', 'lectures', 'materials', 'enquiries'],
        accounts: ['registrations', 'batches', 'lectures', 'materials']
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
    
    // Modals
    const [approvalModal, setApprovalModal] = useState({ show: false, student: null });
    const [selectedBatches, setSelectedBatches] = useState([]); 
    const [paymentModal, setPaymentModal] = useState({ show: false, student: null, amount: "" });
    const [rejectModal, setRejectModal] = useState({ show: false, enquiry: null, reason: "" });

    // --- 3. FINANCIAL AGGREGATOR ---
    const calculateAggregateLedger = (student) => {
        const allProgramData = [...techCoursesData, ...universityPrograms];
        const totalContractValue = (student.enrollments || []).reduce((acc, curr) => {
            const courseInfo = allProgramData.find(c => c.title === curr.course || c.id === curr.course);
            const feeAmount = parseInt(courseInfo?.fee?.replace(/[^0-9]/g, "")) || 0;
            return acc + feeAmount;
        }, 0);
        const paid = student.amountPaid || 0;
        const due = totalContractValue - paid;
        return { totalContractValue, paid, due, count: student.enrollments?.length || 0 };
    };

    // --- 4. CORE HANDLERS ---
    const triggerToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false); 
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/admin/login", { replace: true });
        window.location.reload(); 
    };

    // --- PIPELINE HANDLERS ---
    const convertToRegistration = (enquiry) => {
        navigate('/registration', { 
            state: { 
                prefill: {
                    name: enquiry.name,
                    phone: enquiry.phone,
                    course: enquiry.course || enquiry.selectedCourse
                } 
            } 
        });
    };

    const handleRejectLead = async () => {
        if (!rejectModal.reason) return alert("Reason required for archive.");
        try {
            await axios.patch(`${API_URL}/admin/enquiries/${rejectModal.enquiry._id}/status`, 
                { enrolled: false, reason: rejectModal.reason }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            triggerToast("LEAD ARCHIVED");
            setRejectModal({ show: false, enquiry: null, reason: "" });
            fetchData();
        } catch (err) { alert("Action Failed"); }
    };

    // --- SYNC & PAYMENT HANDLERS ---
    const getSyncedCourseNames = (student) => {
        if (!student.activeBatches || batches.length === 0) return [];
        return batches.filter(b => student.activeBatches.includes(b._id)).map(b => b.courseId);
    };

    const getUnsyncedCourses = (student) => {
        if (!student.enrollments) return [];
        const synced = getSyncedCourseNames(student).map(name => name.toLowerCase());
        return student.enrollments.filter(e => !synced.includes(e.course?.toLowerCase()));
    };

    const handleQuickSync = (student) => {
        const unsynced = getUnsyncedCourses(student);
        if (unsynced.length === 0) return;
        const newIds = unsynced.map(en => batches.find(b => b.courseId?.toLowerCase() === en.course?.toLowerCase())?._id).filter(id => id);
        setSelectedBatches([...new Set([...(student.activeBatches || []), ...newIds])]);
        setApprovalModal({ show: true, student });
    };

    const handleBatchSync = async () => {
        try {
            await axios.patch(`${API_URL}/admin/approve-student/${approvalModal.student._id}`, 
                { batchIds: selectedBatches }, { headers: { Authorization: `Bearer ${token}` } }
            );
            triggerToast("STREAMS SYNCED");
            fetchData(); setApprovalModal({ show: false, student: null });
        } catch (err) { alert("Sync Failed"); }
    };

    const handlePaymentPush = async (e) => {
        e.preventDefault();
        try {
            const newTotal = (paymentModal.student.amountPaid || 0) + parseInt(paymentModal.amount);
            await axios.patch(`${API_URL}/admin/registrations/${paymentModal.student._id}/update-payment`, 
                { amountPaid: newTotal }, { headers: { Authorization: `Bearer ${token}` } }
            );
            triggerToast("LEDGER UPDATED");
            setPaymentModal({ show: false, student: null, amount: "" });
            fetchData();
        } catch (err) { alert("Update Failed"); }
    };

    const fetchData = useCallback(async () => {
        if (!token) return navigate('/admin/login');
        try {
            const endpoint = activeTab === 'registrations' ? '/admin/registrations' : activeTab === 'enquiries' ? '/admin/enquiries' : null;
            if (endpoint && hasAccess(activeTab)) {
                const res = await axios.get(`${API_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
                setData(res.data.data || []); 
            }
            if (userRole === 'founder' && (activeTab === 'logs' || activeTab === 'overview')) {
                const res = await axios.get(`${API_URL}/admin/audit-logs`, { headers: { Authorization: `Bearer ${token}` } });
                setAuditLogs(res.data.logs || []);
                setFinances({ total: res.data.totalRevenue || 0, topCourses: res.data.topCourses || [] });
            }
        } catch (err) { if (err.response?.status === 401) handleLogout(); }
    }, [activeTab, token, userRole, navigate]);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/batches/active`, { headers: { Authorization: `Bearer ${token}` } });
                setBatches(res.data.data || []);
            } catch (err) {}
        };
        fetchBatches(); fetchData();
    }, [token, activeTab, fetchData]);

    const filteredData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.filter(item => (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || (item.phone || "").includes(searchQuery));
    }, [data, searchQuery]);

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative text-left">
            <AnimatePresence>{toast.show && (
                <motion.div initial={{ y: -50, x: "-50%", opacity: 0 }} animate={{ y: 30, x: "-50%", opacity: 1 }} exit={{ y: -50 }} className="fixed left-1/2 z-[700] bg-[#1A5F7A] text-white px-8 py-4 rounded-2xl shadow-2xl font-black border-b-4 border-[#F37021] flex items-center gap-3 italic uppercase text-[10px]">
                    <FiCheckCircle className="text-[#F37021]" />{toast.message}
                </motion.div>
            )}</AnimatePresence>

            {/* SIDEBAR */}
            <aside className={`fixed lg:relative z-[200] h-full w-72 bg-[#1A5F7A] text-white p-6 flex flex-col shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="mb-10 font-black text-[#F37021] italic text-xl uppercase tracking-tighter">Expert Academy</div>
                <nav className="flex flex-col gap-2 flex-1 no-scrollbar overflow-y-auto">
                    {hasAccess('overview') && <button onClick={() => handleTabChange('overview')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiGrid /> Overview</button>}
                    {hasAccess('registrations') && <button onClick={() => handleTabChange('registrations')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'registrations' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiUsers /> Registrations</button>}
                    {hasAccess('batches') && <button onClick={() => handleTabChange('batches')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'batches' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiClock /> Batch Master</button>}
                    <button onClick={() => handleTabChange('lectures')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'lectures' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiVideo /> Live Classroom</button>
                    <button onClick={() => handleTabChange('materials')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'materials' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiBookOpen /> Study Vault</button>
                    {hasAccess('enquiries') && <button onClick={() => handleTabChange('enquiries')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'enquiries' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiMessageSquare /> Enquiries</button>}
                    {hasAccess('logs') && <button onClick={() => handleTabChange('logs')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'logs' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiActivity /> Audit Logs</button>}
                </nav>
                <button onClick={() => setLogoutModal(true)} className="mt-4 p-4 rounded-2xl font-black text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all uppercase text-[10px] flex items-center justify-center gap-2"><FiLogOut /> Terminate</button>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white h-20 px-6 lg:px-10 flex items-center justify-between border-b sticky top-0 z-[100]">
                    <button className="lg:hidden text-[#1A5F7A] p-2 bg-slate-50 rounded-xl" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24} /></button>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest uppercase">Admin Node: {userRole}</span>
                        <div className="flex items-center gap-2 mt-0.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div><span className="text-[#F37021] text-[10px] font-black italic uppercase leading-none">Security Active</span></div>
                    </div>
                </header>

                <main className="p-4 md:p-10 overflow-y-auto flex-1 bg-slate-50/50 no-scrollbar">
                    
                    {activeTab === 'overview' && userRole === 'founder' && (
                        <div className="space-y-10 animate-in fade-in duration-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#1A5F7A] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                    <FiDollarSign className="absolute -right-4 -bottom-4 text-9xl opacity-10" />
                                    <p className="text-[10px] uppercase font-black opacity-60 tracking-widest leading-none mb-1">Aggregate Revenue</p>
                                    <div className="text-4xl font-black italic">₹{finances.total.toLocaleString()}</div>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 shadow-sm">
                                    <div className="p-4 bg-orange-50 text-[#F37021] rounded-2xl shadow-inner"><FiPieChart size={30}/></div>
                                    <div><p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Top Performer</p><div className="text-xl font-black text-[#1A5F7A] italic uppercase leading-none">{finances.topCourses[0]?.name || 'N/A'}</div></div>
                                </div>
                            </div>
                            <AuditTable logs={auditLogs.slice(0, 10)} title="Security Audit Preview" />
                        </div>
                    )}

                    {activeTab === 'logs' && userRole === 'founder' && <AuditTable logs={auditLogs} title="Full System Ledger" />}

                    {activeTab === 'enquiries' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic px-2">Marketing <span className="text-[#F37021]">Pipeline</span></h3>
                            <div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden overflow-x-auto">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
                                        <tr><th className="p-6">Lead Identity</th><th>Target Program</th><th>Pipeline Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredData.map(en => (
                                            <tr key={en._id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-6 font-black text-xs uppercase italic text-[#1A5F7A]">{en.name}<br/><span className="text-slate-400 font-bold not-italic text-[9px]">{en.phone}</span></td>
                                                <td className="text-[10px] font-black uppercase text-slate-500 italic">{en.course || en.selectedCourse}</td>
                                                <td className="p-6">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => convertToRegistration(en)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                                                            <FiTrendingUp /> Convert
                                                        </button>
                                                        <button onClick={() => setRejectModal({ show: true, enquiry: en, reason: "" })} className="bg-red-50 text-red-500 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
                                                            <FiX /> Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'registrations' && (
                        <div className="space-y-6">
                            <div className="relative max-w-xl mb-8"><FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"/><input type="text" placeholder="Search entries..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/></div>
                            <div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden overflow-x-auto">
                                <table className="w-full text-left min-w-[1000px]">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
                                        <tr><th className="p-6">Student Identity</th><th>Sync Inventory</th><th>Financial Ledger (Aggregate)</th><th>Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredData.map(item => {
                                            const ledger = calculateAggregateLedger(item);
                                            const unsynced = getUnsyncedCourses(item);
                                            const syncedCourses = getSyncedCourseNames(item);
                                            return (
                                                <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="p-6">
                                                        <div className="font-black text-[#1A5F7A] text-xs uppercase italic">{item.name}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 mt-0.5">ID: {item.registrationId || item.phone}</div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex flex-col gap-2 cursor-pointer" onClick={() => { setApprovalModal({ show: true, student: item }); setSelectedBatches(item.activeBatches || []); }}>
                                                            <div className="flex flex-wrap gap-1">
                                                                {syncedCourses.map((c, i) => <span key={i} className="bg-green-50 text-green-600 px-2 py-1 rounded text-[8px] font-black border border-green-100 uppercase italic">✓ {c}</span>)}
                                                            </div>
                                                            {unsynced.length > 0 && <div className="flex flex-wrap gap-1">{unsynced.map((u, i) => <span key={i} className="text-red-500 text-[7px] font-black uppercase animate-pulse flex items-center gap-1"><FiAlertTriangle size={8}/> Missing: {u.course}</span>)}</div>}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="space-y-1 min-w-[200px]">
                                                            <div className="flex justify-between text-[11px] font-black text-[#1A5F7A]"><span>₹{ledger.paid.toLocaleString()} Paid</span><span className="text-slate-300">Total ₹{ledger.totalContractValue.toLocaleString()}</span></div>
                                                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${(ledger.paid / ledger.totalContractValue) * 100}%` }} /></div>
                                                            <div className={`text-[9px] font-black uppercase italic ${ledger.due > 0 ? 'text-red-500 animate-pulse' : 'text-green-600'}`}>{ledger.due > 0 ? `Remaining: ₹${ledger.due.toLocaleString()}` : "Fully Cleared"}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => setPaymentModal({ show: true, student: item, amount: "" })} className="p-2.5 bg-slate-50 text-[#1A5F7A] rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"><FiCreditCard size={14}/></button>
                                                            {unsynced.length > 0 && <button onClick={() => handleQuickSync(item)} className="p-2.5 bg-orange-500 text-white rounded-xl shadow-md hover:scale-110 transition-all font-black text-[8px] uppercase flex items-center gap-1"><FiRefreshCw size={10}/> Sync All</button>}
                                                        </div>
                                                    </td>
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

                </main>
            </div>

            {/* --- MODALS --- */}
            
            <AnimatePresence>{rejectModal.show && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[700] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border-t-[12px] border-red-500">
                        <button onClick={() => setRejectModal({ show: false, enquiry: null, reason: "" })} className="absolute top-8 right-8 text-slate-300 hover:text-red-500"><FiX size={24} /></button>
                        <h3 className="text-xl font-black text-[#1A5F7A] uppercase text-center italic">Archive Lead</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase text-center mb-8">{rejectModal.enquiry?.name}</p>
                        <textarea className="w-full p-5 bg-slate-50 rounded-3xl font-bold text-sm text-[#1A5F7A] outline-none h-32 resize-none border-2 border-transparent focus:border-red-100" placeholder="State reason for lead archive (e.g. Budget issues, No response)..." value={rejectModal.reason} onChange={(e) => setRejectModal({...rejectModal, reason: e.target.value})} />
                        <button onClick={handleRejectLead} className="w-full py-5 bg-red-500 text-white rounded-2xl font-black uppercase text-xs mt-6 shadow-xl shadow-red-100">Confirm Rejection</button>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>

            <AnimatePresence>{paymentModal.show && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[700] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border-t-[12px] border-green-600">
                        <button onClick={() => setPaymentModal({ show: false, student: null, amount: "" })} className="absolute top-8 right-8 text-slate-300 hover:text-red-500"><FiX size={24} /></button>
                        <h3 className="text-xl font-black text-[#1A5F7A] uppercase text-center italic leading-none">Update Ledger</h3>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 mt-6 mb-8 flex justify-between">
                            <div><p className="text-[8px] font-black text-slate-400 uppercase">Package Value</p><p className="text-base font-black text-[#1A5F7A]">₹{calculateAggregateLedger(paymentModal.student).totalContractValue.toLocaleString()}</p></div>
                            <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Global Due</p><p className="text-base font-black text-red-500">₹{calculateAggregateLedger(paymentModal.student).due.toLocaleString()}</p></div>
                        </div>
                        <form onSubmit={handlePaymentPush} className="space-y-6">
                            <input autoFocus type="number" placeholder="Enter Installment (₹)" className="w-full p-5 bg-slate-50 rounded-2xl font-black text-3xl text-[#1A5F7A] outline-none text-center border-2 border-transparent focus:border-green-100 transition-all shadow-inner" value={paymentModal.amount} onChange={(e) => setPaymentModal({...paymentModal, amount: e.target.value})} />
                            <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-green-700 transition-all tracking-widest">Push Payment to Sync</button>
                        </form>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>

            <AnimatePresence>{approvalModal.show && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[700] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border-t-[12px] border-[#1A5F7A]">
                        <button onClick={() => setApprovalModal({ show: false, student: null })} className="absolute top-8 right-8 text-slate-300 hover:text-red-500"><FiX size={24} /></button>
                        <h3 className="text-xl font-black text-[#1A5F7A] uppercase mb-1 italic">Stream Authorization</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 italic">{approvalModal.student?.name}</p>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {batches.filter(batch => approvalModal.student?.enrollments?.some(e => e.course.toLowerCase() === batch.courseId.toLowerCase())).map(b => (
                                <div key={b._id} onClick={() => setSelectedBatches(prev => prev.includes(b._id) ? prev.filter(i => i !== b._id) : [...prev, b._id])} 
                                     className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedBatches.includes(b._id) ? 'border-[#F37021] bg-orange-50' : 'border-slate-50 bg-white hover:border-slate-100'}`}>
                                    <div><div className="font-black text-[#1A5F7A] text-xs uppercase italic">{b.batchCode}</div><div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{b.courseId} • Live Stream</div></div>
                                    {selectedBatches.includes(b._id) ? <FiCheckCircle className="text-[#F37021]" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-100" />}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleBatchSync} className="w-full py-5 bg-[#F37021] text-white rounded-2xl font-black uppercase text-xs mt-6 shadow-xl shadow-orange-900/20">Sync Data Stream</button>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>

            <AnimatePresence>{logoutModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-slate-900/80 flex items-center justify-center p-4 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-12 max-w-sm w-full text-center shadow-2xl border-t-8 border-red-500">
                        <FiLogOut className="mx-auto text-5xl text-red-500 mb-6" />
                        <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic leading-none">Terminate?</h3>
                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <button onClick={() => setLogoutModal(false)} className="py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px]">Stay</button>
                            <button onClick={handleLogout} className="py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Logout</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>
        </div>
    );
}

function AuditTable({ logs, title }) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-[#1A5F7A] uppercase italic px-2 flex items-center gap-2"><FiShield className="text-[#F37021]"/> {title}</h3>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden overflow-x-auto shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
                        <tr><th className="p-6">Staff Member</th><th>Action Performed</th><th>Target Entity</th><th>Time</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.length > 0 ? logs.map(log => (
                            <tr key={log._id} className="hover:bg-slate-50 text-[11px]">
                                <td className="p-6 font-bold uppercase text-[#1A5F7A]"><span className="px-2 py-1 bg-slate-100 rounded-lg text-[9px]">{log.performedBy}</span></td>
                                <td className="font-black text-[#1A5F7A] uppercase italic text-[10px]">{log.action}</td>
                                <td className="font-bold text-slate-500 uppercase">{log.targetName}</td>
                                <td className="text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="p-20 text-center font-black text-slate-300 uppercase italic tracking-widest text-xs">Security Stream Empty</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}