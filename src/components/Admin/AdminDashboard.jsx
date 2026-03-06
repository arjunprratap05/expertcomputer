import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiX, FiMenu, FiSearch, 
    FiCheckCircle, FiCreditCard, FiPieChart, FiDollarSign, FiVideo, FiBookOpen, 
    FiGrid, FiClock, FiShield, FiTrendingUp, FiRefreshCw, FiAlertTriangle, FiKey
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
    
    // Modals
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
            .flatMap(b => [b.courseId?.toLowerCase().trim(), b.courseTitle?.toLowerCase().trim()]);

        return student.enrollments.filter(e => {
            const enrolledTitle = e.course.toLowerCase().trim();
            const courseObj = allCourses.find(c => c.title.toLowerCase().trim() === enrolledTitle);
            const courseId = courseObj?.id.toLowerCase().trim();
            return !syncedCourseIdentifiers.includes(enrolledTitle) && 
                   (!courseId || !syncedCourseIdentifiers.includes(courseId));
        });
    };

    const handleActivatePortal = async (student) => {
        try {
            const res = await axios.patch(`${API_URL}/admin/registrations/${student._id}/grant-access`, 
                {}, { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setData(prev => prev.map(item => item._id === student._id ? { ...item, isPortalActive: true } : item));
                triggerToast("PORTAL ACCESS ENABLED");
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

    const fetchData = useCallback(async () => {
        if (!token) return navigate('/admin/login');
        try {
            const endpoint = activeTab === 'registrations' ? '/admin/registrations' : activeTab === 'enquiries' ? '/admin/enquiries' : null;
            if (endpoint && hasAccess(activeTab)) {
                const res = await axios.get(`${API_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
                setData(res.data.data || []); 
            }
        } catch (err) { if (err.response?.status === 401) handleLogout(); }
    }, [activeTab, token, userRole, navigate]);

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
            (item.phone || "").includes(searchQuery)
        );
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
                <div className="mb-10 flex justify-between items-center">
                    <div className="font-black text-[#F37021] italic text-xl uppercase tracking-tighter">Expert Academy</div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-white/50 hover:text-white"><FiX size={24}/></button>
                </div>
                <nav className="flex flex-col gap-2 flex-1 no-scrollbar overflow-y-auto">
                    {hasAccess('overview') && <button onClick={() => handleTabChange('overview')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiGrid /> Overview</button>}
                    {hasAccess('registrations') && <button onClick={() => handleTabChange('registrations')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'registrations' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiUsers /> Registrations</button>}
                    {hasAccess('batches') && <button onClick={() => handleTabChange('batches')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'batches' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiClock /> Batch Master</button>}
                    <button onClick={() => handleTabChange('lectures')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'lectures' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiVideo /> Live Classroom</button>
                    <button onClick={() => handleTabChange('materials')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'materials' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiBookOpen /> Study Vault</button>
                </nav>
                {/* Always visible at bottom of sidebar */}
                <button onClick={() => setLogoutModal(true)} className="mt-4 p-4 rounded-2xl font-black text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all uppercase text-[10px] flex items-center justify-center gap-2 border border-red-500/20"><FiLogOut /> Terminate Session</button>
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
                            <div className="flex items-center gap-2 mt-1 justify-end"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div><span className="text-[#F37021] text-[10px] font-black italic uppercase">Live</span></div>
                        </div>
                        {/* MOBILE LOGOUT BUTTON (Crucial Fix) */}
                        <button 
                            onClick={() => setLogoutModal(true)} 
                            className="p-3 bg-red-50 text-red-500 rounded-2xl transition-all shadow-sm active:scale-90"
                            aria-label="Logout"
                        >
                            <FiLogOut size={20} />
                        </button>
                    </div>
                </header>

                <main className="p-4 md:p-10 overflow-y-auto flex-1 no-scrollbar">
                    {activeTab === 'registrations' && (
                        <div className="space-y-6">
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
                                                            <button onClick={() => handleActivatePortal(item)} className="bg-[#1A5F7A] text-white px-4 py-2 rounded-xl font-black text-[8px] uppercase shadow-md hover:bg-[#F37021] flex items-center gap-1"><FiKey /> Enable</button>
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
                                                    <td className="p-6"><button onClick={() => handleQuickSync(item)} className="p-2.5 bg-orange-500 text-white rounded-xl hover:scale-105 transition-all shadow-md active:scale-95"><FiRefreshCw size={14}/></button></td>
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

            {/* SYNC MODAL */}
            <AnimatePresence>{approvalModal.show && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[700] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative border-t-[10px] border-[#1A5F7A]">
                        <button onClick={() => setApprovalModal({ show: false, student: null })} className="absolute top-6 right-6 text-slate-300 hover:text-red-500"><FiX size={24} /></button>
                        <h3 className="text-xl font-black text-[#1A5F7A] uppercase mb-1 italic">Stream Sync</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Authorized Program: {approvalModal.student?.enrollments?.map(e => e.course).join(', ')}</p>
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
                                     className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedBatches.includes(b._id) ? 'border-[#F37021] bg-orange-50' : 'border-slate-50 bg-white hover:border-slate-100'}`}>
                                    <div><div className="font-black text-[#1A5F7A] text-xs uppercase italic">{b.batchCode}</div><div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{b.courseId}</div></div>
                                    {selectedBatches.includes(b._id) ? <FiCheckCircle className="text-[#F37021]" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-100" />}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleBatchSync} className="w-full py-5 bg-[#F37021] text-white rounded-2xl font-black uppercase text-xs mt-6 shadow-xl active:scale-95 transition-all">Authorize Streams</button>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>

            {/* LOGOUT CONFIRMATION MODAL */}
            <AnimatePresence>{logoutModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 text-center">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-t-8 border-red-500">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><FiLogOut size={32} /></div>
                        <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic leading-tight">Terminate Session?</h3>
                        <p className="text-slate-400 text-xs font-bold mt-2">You will need to re-authenticate to access the admin node.</p>
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => setLogoutModal(false)} className="py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px] text-slate-500 hover:bg-slate-200">Go Back</button>
                            <button onClick={handleLogout} className="py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-red-200 hover:bg-red-600">Logout</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>
        </div>
    );
}