import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiX, FiMenu, FiSearch, 
    FiCheckCircle, FiCreditCard, FiPieChart, FiDollarSign, FiVideo, FiBookOpen, 
    FiGrid, FiClock, FiShield, FiTrendingUp, FiRefreshCw, FiAlertTriangle, FiPlus, FiKey, FiMail, FiPhone
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

    // --- 1. RBAC PERMISSIONS ---
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
    const [prevLeadLength, setPrevLeadLength] = useState(0);
    
    // Modals & Refs
    const audioRef = useRef(new Audio('/sounds/notification.mp3'));
    const [approvalModal, setApprovalModal] = useState({ show: false, student: null });
    const [selectedBatches, setSelectedBatches] = useState([]); 
    const [paymentModal, setPaymentModal] = useState({ show: false, student: null, amount: "" });

    // --- 3. CORE LOGIC HANDLERS ---
    const triggerToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false); 
        setData([]); 
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/admin/login", { replace: true });
        window.location.reload(); 
    };

    const calculateAggregateLedger = (student) => {
        const allProgramData = [...techCoursesData, ...universityPrograms];
        const totalContractValue = (student.enrollments || []).reduce((acc, curr) => {
            const courseInfo = allProgramData.find(c => 
                c.title.toLowerCase().trim() === curr.course.toLowerCase().trim()
            );
            const feeAmount = parseInt(courseInfo?.fee?.replace(/[^0-9]/g, "")) || 0;
            return acc + feeAmount;
        }, 0);
        const paid = student.amountPaid || 0;
        return { totalContractValue, paid, due: totalContractValue - paid };
    };

    const getUnsyncedCourses = (student) => {
        if (!student.enrollments || batches.length === 0) return [];
        const allCourses = [...techCoursesData, ...universityPrograms];
        const syncedCourseIdentifiers = batches
            .filter(b => student.activeBatches?.includes(b._id))
            .flatMap(b => [b.courseId?.toLowerCase().trim()]);

        return student.enrollments.filter(e => {
            const enrolledTitle = e.course.toLowerCase().trim();
            const courseObj = allCourses.find(c => c.title.toLowerCase().trim() === enrolledTitle);
            const courseId = courseObj?.id.toLowerCase().trim();
            return !syncedCourseIdentifiers.includes(enrolledTitle) && 
                   (!courseId || !syncedCourseIdentifiers.includes(courseId));
        });
    };

    // --- 4. API ACTIONS ---
    const handleActivatePortal = async (student) => {
        try {
            const res = await axios.patch(`${API_URL}/admin/registrations/${student._id}/grant-access`, 
                {}, { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                fetchData();
                triggerToast("STUDENT ACCESS UNLOCKED");
            }
        } catch (err) { alert("Activation Failed"); }
    };

    const handleBatchSync = async () => {
        try {
            await axios.patch(`${API_URL}/admin/approve-student/${approvalModal.student._id}`, 
                { batchIds: selectedBatches }, { headers: { Authorization: `Bearer ${token}` } }
            );
            triggerToast("STREAMS SYNCED");
            fetchData(); 
            setApprovalModal({ show: false, student: null });
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
        } catch (err) { alert("Ledger update failed"); }
    };

    const handleQuickSync = (student) => {
        const unsynced = getUnsyncedCourses(student);
        if (unsynced.length === 0) return;
        const allCourses = [...techCoursesData, ...universityPrograms];
        const matchingIds = batches.filter(b => {
            return unsynced.some(e => {
                const title = e.course.toLowerCase().trim();
                const id = allCourses.find(c => c.title.toLowerCase().trim() === title)?.id.toLowerCase().trim();
                return b.courseId?.toLowerCase().trim() === title || b.courseId?.toLowerCase().trim() === id;
            });
        }).map(b => b._id);
        setSelectedBatches([...new Set([...(student.activeBatches || []), ...matchingIds])]);
        setApprovalModal({ show: true, student });
    };

    const fetchData = useCallback(async () => {
        if (!token) return navigate('/admin/login');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const endpoint = activeTab === 'registrations' ? '/admin/registrations' : activeTab === 'enquiries' ? '/admin/enquiries' : null;
            if (endpoint && hasAccess(activeTab)) {
                const res = await axios.get(`${API_URL}${endpoint}`, { headers });
                const freshData = res.data.data || [];
                
                // Alert for new inquiries
                if (activeTab === 'enquiries' && freshData.length > prevLeadLength && prevLeadLength !== 0) {
                    audioRef.current.play().catch(() => {});
                    triggerToast("NEW LEAD CAPTURED");
                }
                
                setData(freshData);
                if (activeTab === 'enquiries') setPrevLeadLength(freshData.length);
            }

            if (userRole === 'founder' && (activeTab === 'logs' || activeTab === 'overview')) {
                const res = await axios.get(`${API_URL}/admin/audit-logs`, { headers });
                setAuditLogs(res.data.logs || res.data.data || []);
                setFinances({ total: res.data.totalRevenue || 0, topCourses: res.data.topCourses || [] });
            }
        } catch (err) { if (err.response?.status === 401) handleLogout(); }
    }, [activeTab, token, userRole, prevLeadLength, navigate]);

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

    const filteredData = useMemo(() => {
        return (data || []).filter(item => 
            (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
            (item.phone || "").includes(searchQuery) ||
            (item.source?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (item.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
        );
    }, [data, searchQuery]);

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative text-left">
            <AnimatePresence>{toast.show && (
                <motion.div initial={{ y: -50, x: "-50%", opacity: 0 }} animate={{ y: 30, x: "-50%", opacity: 1 }} exit={{ y: -50 }} className="fixed left-1/2 z-[999] bg-[#1A5F7A] text-white px-8 py-4 rounded-2xl shadow-2xl font-black border-b-4 border-[#F37021] flex items-center gap-3 italic uppercase text-[10px]">
                    <FiCheckCircle className="text-[#F37021]" />{toast.message}
                </motion.div>
            )}</AnimatePresence>

            {/* SIDEBAR */}
            <aside className={`fixed lg:relative z-[200] h-full w-72 bg-[#1A5F7A] text-white p-6 flex flex-col shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="mb-10 flex justify-between items-center">
                    <div className="font-black text-[#F37021] italic text-xl uppercase tracking-tighter leading-tight">Expert Academy<br/><span className="text-[10px] text-white/40 tracking-[0.2em] font-bold not-italic">Admin Hub</span></div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-white/50 hover:text-white"><FiX size={24}/></button>
                </div>
                <nav className="flex flex-col gap-2 flex-1 no-scrollbar overflow-y-auto">
                    {hasAccess('overview') && <SidebarBtn active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} icon={<FiGrid />} label="Overview" />}
                    {hasAccess('enquiries') && <SidebarBtn active={activeTab === 'enquiries'} onClick={() => handleTabChange('enquiries')} icon={<FiMessageSquare />} label="Admission Enquiries" />}
                    {hasAccess('registrations') && <SidebarBtn active={activeTab === 'registrations'} onClick={() => handleTabChange('registrations')} icon={<FiUsers />} label="Registrations" />}
                    {hasAccess('batches') && <SidebarBtn active={activeTab === 'batches'} onClick={() => handleTabChange('batches')} icon={<FiClock />} label="Batch Master" />}
                    <SidebarBtn active={activeTab === 'lectures'} onClick={() => handleTabChange('lectures')} icon={<FiVideo />} label="Live Classroom" />
                    <SidebarBtn active={activeTab === 'materials'} onClick={() => handleTabChange('materials')} icon={<FiBookOpen />} label="Study Vault" />
                    {hasAccess('logs') && <SidebarBtn active={activeTab === 'logs'} onClick={() => handleTabChange('logs')} icon={<FiActivity />} label="Audit Logs" />}
                </nav>
            </aside>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white h-20 px-4 lg:px-10 flex items-center justify-between border-b sticky top-0 z-[100]">
                    <div className="flex items-center gap-3">
                        <button className="lg:hidden text-[#1A5F7A] p-2.5 bg-slate-50 rounded-xl" onClick={() => setIsSidebarOpen(true)}><FiMenu size={22} /></button>
                        <h2 className="lg:hidden font-black text-[#1A5F7A] text-sm uppercase italic tracking-tighter">ECA Admin</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Node: {userRole}</span>
                            <div className="flex items-center gap-2 mt-1 justify-end"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div><span className="text-[#F37021] text-[10px] font-black italic uppercase">Live Sync</span></div>
                        </div>
                        <button onClick={() => setLogoutModal(true)} className="p-3 bg-red-50 text-red-500 rounded-2xl transition-all shadow-sm active:scale-90"><FiLogOut size={20} /></button>
                    </div>
                </header>

                <main className="p-4 md:p-10 overflow-y-auto flex-1 no-scrollbar">
                    
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && userRole === 'founder' && (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#1A5F7A] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                                    <FiDollarSign className="absolute -right-4 -bottom-4 text-9xl opacity-10" />
                                    <p className="text-[10px] uppercase font-black opacity-60 tracking-widest leading-none mb-1">Aggregate Revenue</p>
                                    <div className="text-4xl font-black italic">₹{finances.total.toLocaleString()}</div>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 shadow-sm">
                                    <div className="p-4 bg-orange-50 text-[#F37021] rounded-2xl"><FiPieChart size={30}/></div>
                                    <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Top Performer</p><div className="text-xl font-black text-[#1A5F7A] italic leading-none truncate max-w-[150px]">{finances.topCourses[0]?.name || 'N/A'}</div></div>
                                </div>
                            </div>
                            <AuditTable logs={auditLogs.slice(0, 10)} title="Real-Time Security Monitor" />
                        </div>
                    )}

                    {/* ENQUIRIES TAB (SYNCED WITH SOURCE) */}
                    {activeTab === 'enquiries' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic">Admission Enquiries</h3>
                                <div className="relative max-w-md w-full">
                                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"/>
                                    <input type="text" placeholder="Search name, phone, or source..." className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                                </div>
                            </div>
                            <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden overflow-x-auto">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
                                        <tr><th className="p-6">Lead Identity</th><th>Contact Detail</th><th>Source</th><th>Course Interest</th><th>Submission Time</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredData.length > 0 ? filteredData.map(item => (
                                            <tr key={item._id} className="hover:bg-slate-50/80 transition-colors text-[11px]">
                                                <td className="p-6">
                                                    <div className="font-black text-[#1A5F7A] uppercase italic">{item.name || 'Prospect'}</div>
                                                    <div className="text-slate-400 font-bold lowercase">{item.email}</div>
                                                </td>
                                                <td><div className="flex items-center gap-2 font-bold text-slate-600"><FiPhone className="text-[#F37021]"/> {item.phone}</div></td>
                                                <td><SourceTag source={item.source} /></td>
                                                <td><span className="px-3 py-1 bg-orange-50 text-[#F37021] rounded-full font-black uppercase text-[9px] border border-orange-100">{item.course || 'General'}</span></td>
                                                <td><div className="text-slate-400 font-bold italic">{new Date(item.createdAt).toLocaleDateString()}</div></td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="p-20 text-center font-black text-slate-200 uppercase italic text-sm tracking-widest">No enquiry data captured</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* REGISTRATIONS TAB (WITH UNLOCK & SYNC) */}
                    {activeTab === 'registrations' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="relative max-w-xl"><FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"/><input type="text" placeholder="Search Identity..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/></div>
                            <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden overflow-x-auto">
                                <table className="w-full text-left min-w-[1000px]">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
                                        <tr><th className="p-6">Identity</th><th>Access</th><th>Sync</th><th>Ledger</th><th>Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredData.map(item => {
                                            const ledger = calculateAggregateLedger(item);
                                            const unsynced = getUnsyncedCourses(item);
                                            return (
                                                <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="p-6 font-black text-[#1A5F7A] text-xs uppercase italic">{item.name}<br/><span className="text-slate-400 font-bold not-italic text-[9px]">{item.phone}</span></td>
                                                    <td className="p-6">
                                                        {item.isPortalActive ? (
                                                            <div className="flex items-center gap-1 text-green-600 font-black text-[9px] uppercase italic bg-green-50 px-3 py-1 rounded-full w-fit"><FiShield size={12} /> Active</div>
                                                        ) : (
                                                            <button onClick={() => handleActivatePortal(item)} className="bg-[#1A5F7A] hover:bg-[#F37021] text-white px-4 py-2 rounded-xl font-black text-[8px] uppercase shadow-md transition-all flex items-center gap-1"><FiKey /> Unlock Access</button>
                                                        )}
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex flex-col gap-1 cursor-pointer" onClick={() => { setApprovalModal({ show: true, student: item }); setSelectedBatches(item.activeBatches || []); }}>
                                                            <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[8px] font-black uppercase w-fit border border-green-100">{item.activeBatches?.length || 0} Synced</span>
                                                            {unsynced.length > 0 && <span className="text-red-500 text-[7px] font-black uppercase animate-pulse italic flex items-center gap-1"><FiAlertTriangle size={10}/> Sync Needed</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="space-y-1 min-w-[120px]">
                                                            <div className="flex justify-between text-[10px] font-black text-[#1A5F7A]"><span>₹{ledger.paid.toLocaleString()}</span></div>
                                                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${Math.min((ledger.paid / ledger.totalContractValue) * 100, 100)}%` }} /></div>
                                                            <div className={`text-[8px] font-black uppercase italic ${ledger.due > 0 ? 'text-red-500' : 'text-green-600'}`}>{ledger.due > 0 ? `Due: ₹${ledger.due.toLocaleString()}` : "Cleared"}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 flex items-center gap-2">
                                                        <button onClick={() => setPaymentModal({ show: true, student: item, amount: "" })} className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"><FiCreditCard size={14}/></button>
                                                        <button onClick={() => handleQuickSync(item)} className="p-2.5 bg-orange-500 text-white rounded-xl hover:scale-105 transition-all shadow-md active:scale-95"><FiRefreshCw size={14}/></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* OTHER TABS */}
                    {activeTab === 'logs' && userRole === 'founder' && <AuditTable logs={auditLogs} title="Full System Audit Trail" />}
                    {activeTab === 'batches' && <BatchScheduler />}
                    {activeTab === 'lectures' && <AddLecture />}
                    {activeTab === 'materials' && <AddMaterial />}
                </main>
            </div>

            {/* MODALS */}
            <AnimatePresence>{approvalModal.show && (
                <div className="fixed inset-0 z-[800] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative border-t-[10px] border-[#1A5F7A]">
                        <button onClick={() => setApprovalModal({ show: false, student: null })} className="absolute top-6 right-6 text-slate-300 hover:text-red-500"><FiX size={24} /></button>
                        <h3 className="text-xl font-black text-[#1A5F7A] uppercase mb-1 italic">Stream Sync</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {batches.filter(batch => {
                                const enrollments = approvalModal.student?.enrollments || [];
                                const allCourses = [...techCoursesData, ...universityPrograms];
                                return enrollments.some(e => {
                                    const title = e.course.toLowerCase().trim();
                                    const id = allCourses.find(c => c.title.toLowerCase().trim() === title)?.id.toLowerCase().trim();
                                    return batch.courseId?.toLowerCase().trim() === title || batch.courseId?.toLowerCase().trim() === id;
                                });
                            }).map(b => (
                                <div key={b._id} onClick={() => setSelectedBatches(prev => prev.includes(b._id) ? prev.filter(i => i !== b._id) : [...prev, b._id])} 
                                     className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedBatches.includes(b._id) ? 'border-[#F37021] bg-orange-50' : 'border-slate-50 bg-white'}`}>
                                    <div><div className="font-black text-[#1A5F7A] text-xs uppercase italic">{b.batchCode}</div><div className="text-[8px] font-bold text-slate-400 uppercase">{b.courseId}</div></div>
                                    {selectedBatches.includes(b._id) ? <FiCheckCircle className="text-[#F37021]" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-100" />}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleBatchSync} className="w-full py-5 bg-[#F37021] text-white rounded-2xl font-black uppercase text-xs mt-6 shadow-xl">Authorize Streams</button>
                    </motion.div>
                </div>
            )}</AnimatePresence>

            <AnimatePresence>{paymentModal.show && (
                <div className="fixed inset-0 z-[800] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border-t-[12px] border-green-600">
                        <button onClick={() => setPaymentModal({ show: false, student: null, amount: "" })} className="absolute top-8 right-8 text-slate-300 hover:text-red-500"><FiX size={24} /></button>
                        <h3 className="text-xl font-black text-[#1A5F7A] uppercase text-center italic">Update Ledger</h3>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 mt-6 mb-8 flex justify-between">
                            <div><p className="text-[8px] font-black text-slate-400 uppercase">Paid</p><p className="text-base font-black text-[#1A5F7A]">₹{paymentModal.student?.amountPaid?.toLocaleString()}</p></div>
                            <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase">Total</p><p className="text-base font-black text-slate-500">₹{calculateAggregateLedger(paymentModal.student).totalContractValue.toLocaleString()}</p></div>
                        </div>
                        <form onSubmit={handlePaymentPush} className="space-y-6">
                            <input autoFocus type="number" placeholder="Enter Amount (₹)" className="w-full p-5 bg-slate-50 rounded-2xl font-black text-3xl text-[#1A5F7A] outline-none text-center" value={paymentModal.amount} onChange={(e) => setPaymentModal({...paymentModal, amount: e.target.value})} />
                            <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl tracking-widest">Push Payment to Sync</button>
                        </form>
                    </motion.div>
                </div>
            )}</AnimatePresence>

            {/* LOGOUT CONFIRMATION */}
            <AnimatePresence>{logoutModal && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 text-center">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-t-8 border-red-500">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><FiLogOut size={24} /></div>
                        <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic">Terminate Session?</h3>
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => setLogoutModal(false)} className="py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px] text-slate-500">Cancel</button>
                            <button onClick={handleLogout} className="py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Logout</button>
                        </div>
                    </motion.div>
                </div>
            )}</AnimatePresence>
        </div>
    );
}

// --- SUB-COMPONENTS ---
function SidebarBtn({ active, onClick, icon, label }) {
    return (
        <button onClick={onClick} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${active ? 'bg-[#F37021] text-white' : 'hover:bg-white/10 text-slate-300'}`}>
            <span className="text-lg">{icon}</span> {label}
        </button>
    );
}

function SourceTag({ source }) {
    const styles = {
        'AI Chatbot': 'bg-blue-50 text-blue-600 border-blue-100',
        'Facebook': 'bg-indigo-50 text-indigo-600 border-indigo-100',
        'Website': 'bg-green-50 text-green-600 border-green-100',
    };
    return (
        <div className={`px-3 py-1 border rounded-xl font-black text-[9px] uppercase italic w-fit ${styles[source] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            {source || 'Standard'}
        </div>
    );
}

function AuditTable({ logs, title }) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black text-[#1A5F7A] uppercase italic px-2 flex items-center gap-2"><FiShield className="text-[#F37021]"/> {title}</h3>
            <div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b">
                        <tr><th className="p-6">Staff Member</th><th>Action</th><th>Target Identity</th><th>Time</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.length > 0 ? logs.map(log => (
                            <tr key={log._id} className="hover:bg-slate-50 text-[11px]">
                                <td className="p-6 font-bold uppercase text-[#1A5F7A]"><span className="px-2 py-1 bg-slate-100 rounded-lg text-[9px]">{log.performedBy}</span></td>
                                <td className="font-black text-[#1A5F7A] uppercase italic text-[10px]">{log.action}</td>
                                <td className="font-bold text-slate-500 uppercase">{log.targetName}</td>
                                <td className="text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</td>
                            </tr>
                        )) : <tr><td colSpan="4" className="p-20 text-center font-black text-slate-300 uppercase tracking-widest text-xs">No Security events logged</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}