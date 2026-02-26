import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiPlus, FiX, FiMenu, FiSearch, 
    FiCheckCircle, FiCreditCard, FiDownload, FiAlertCircle, FiPieChart, 
    FiDollarSign, FiVideo, FiBookOpen, FiGrid
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

// INTERNAL COMPONENTS
import AddLecture from '../Admin/AddLecture';
import AddMaterial from '../Admin/AddMaterial';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("adminToken");
    const userRole = localStorage.getItem("userRole"); 
    
    const [activeTab, setActiveTab] = useState(
        userRole === 'frontoffice' ? 'enquiries' : 
        userRole === 'founder' ? 'overview' : 'registrations'
    );
    const [data, setData] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [finances, setFinances] = useState({ total: 0, monthly: [], topCourses: [] });
    const [reasons, setReasons] = useState([]); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterApproved, setFilterApproved] = useState("all");
    const [toast, setToast] = useState({ show: false, message: "" });
    const [paymentModal, setPaymentModal] = useState({ show: false, student: null, amount: "", mode: "Cash", transactionId: "" });

    // --- DATA FETCHING ---
    const fetchData = useCallback(async () => {
        if (!token) return navigate('/admin/login');
        
        try {
            // 1. Fetch Registrations / Enquiries
            if (['registrations', 'enquiries'].includes(activeTab)) {
                const path = activeTab === 'registrations' ? '/admin/registrations' : '/admin/enquiries';
                const res = await axios.get(`${API_URL}${path}`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                setData(res.data.data || []); 
            }

            // 2. Fetch Audit Logs & Financials (Founder Only)
            if ((activeTab === 'logs' || activeTab === 'overview') && userRole === 'founder') {
                const res = await axios.get(`${API_URL}/admin/audit-logs`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                
                // Debugging Log: Check your browser console if logs are still empty
                console.log("Audit Data Received:", res.data);

                setAuditLogs(res.data.logs || []);
                setFinances({ 
                    total: res.data.totalRevenue || 0, 
                    monthly: res.data.monthlyReport || [],
                    topCourses: res.data.topCourses || [] 
                });
                setReasons(res.data.rejectionReasons || []);
            }
        } catch (err) {
            console.error("Sync failed", err);
            if (err.response?.status === 401) navigate('/admin/login');
        }
    }, [activeTab, token, userRole, navigate]);

    useEffect(() => { 
        fetchData(); 
        setIsSidebarOpen(false); 
    }, [fetchData]);

    // --- UTILITY FUNCTIONS ---
    const calculateFinancials = (courseTitle, paid = 0) => {
        const allPrograms = [...techCoursesData, ...universityPrograms];
        const course = allPrograms.find(c => c.title === courseTitle || c.id === courseTitle);
        const fee = parseInt(course?.fee?.replace(/[^0-9]/g, "")) || 0;
        return { fee, paid, balance: fee - paid };
    };

    const filteredData = data.filter(item => {
        const matchesSearch = (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || (item.phone || "").includes(searchQuery);
        if (activeTab === 'registrations') {
            const matchesFilter = filterApproved === "all" ? true : filterApproved === "approved" ? item.isApproved : !item.isApproved;
            return matchesSearch && matchesFilter;
        }
        return matchesSearch;
    });

    const handleApproveStudent = async (studentId) => {
        try {
            await axios.patch(`${API_URL}/admin/approve-student/${studentId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setToast({ show: true, message: "ERP ACCESS GRANTED" });
            fetchData();
            setTimeout(() => setToast({ show: false, message: "" }), 3000);
        } catch (err) { alert("Approval failed."); }
    };

    const handleUpdateAction = async (e) => {
        e.preventDefault();
        const { student, amount, mode, transactionId } = paymentModal;
        try {
            await axios.patch(`${API_URL}/admin/registrations/${student._id}/update-payment`, 
                { amountPaid: (student.amountPaid || 0) + parseInt(amount), paymentLog: { amount, mode, transactionId, date: new Date() } }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaymentModal({ show: false, student: null, amount: "", mode: "Cash", transactionId: "" });
            fetchData();
            setToast({ show: true, message: "PAYMENT SYNCED" });
            setTimeout(() => setToast({ show: false, message: "" }), 3000);
        } catch (err) { alert("Sync failed."); }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
            
            {/* TOAST */}
            <AnimatePresence>{toast.show && (
                <motion.div initial={{ y: -50, x: "-50%", opacity: 0 }} animate={{ y: 30, x: "-50%", opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed left-1/2 z-[700] bg-[#1A5F7A] text-white px-8 py-4 rounded-2xl shadow-2xl font-black border-b-4 border-[#F37021]">
                    <FiCheckCircle className="text-[#F37021] inline mr-2 mb-1" size={20} /><span>{toast.message}</span>
                </motion.div>
            )}</AnimatePresence>

            {/* MOBILE OVERLAY */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] lg:hidden" />
                )}
            </AnimatePresence>

            {/* SIDEBAR */}
            <aside className={`fixed lg:relative z-[200] h-full w-72 bg-[#1A5F7A] text-white p-6 flex flex-col shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <button className="lg:hidden absolute top-6 right-6 text-white/50" onClick={() => setIsSidebarOpen(false)}><FiX size={24} /></button>
                <div className="mb-10 text-center font-black text-[#F37021] italic text-xl tracking-tighter border-b border-white/10 pb-4 uppercase">Expert Academy</div>
                
                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar">
                    {userRole === 'founder' && (
                        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiGrid /> Overview</button>
                    )}
                    {(userRole === 'founder' || userRole === 'accounts') && (
                        <button onClick={() => setActiveTab('registrations')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'registrations' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiUsers /> Registrations</button>
                    )}
                    <div className="text-[10px] uppercase opacity-40 font-black mt-4 ml-4 mb-2 tracking-widest">LMS Control</div>
                    <button onClick={() => setActiveTab('lectures')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'lectures' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiVideo /> Live Classroom</button>
                    <button onClick={() => setActiveTab('materials')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'materials' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiBookOpen /> Study Material</button>
                    {(userRole === 'founder' || userRole === 'frontoffice') && (
                        <button onClick={() => setActiveTab('enquiries')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'enquiries' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiMessageSquare /> Enquiries</button>
                    )}
                    {userRole === 'founder' && (
                        <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'logs' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiActivity /> Audit Logs</button>
                    )}
                </nav>
                <button onClick={() => setLogoutModal(true)} className="mt-4 flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all uppercase text-[10px] italic tracking-widest"><FiLogOut /> Terminate</button>
            </aside>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white h-20 px-4 md:px-10 flex items-center justify-between border-b shadow-sm sticky top-0 z-[100]">
                    <button className="lg:hidden text-[#1A5F7A] p-2 bg-slate-50 rounded-xl" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24} /></button>
                    <div className="text-right leading-none flex items-center gap-4">
                        <div>
                            <div className="text-slate-400 text-[9px] font-black uppercase">Role</div>
                            <div className="text-[#F37021] text-[10px] font-black uppercase italic">{userRole}</div>
                        </div>
                        <button onClick={() => setLogoutModal(true)} className="lg:hidden p-3 bg-red-50 text-red-500 rounded-xl"><FiLogOut size={20} /></button>
                    </div>
                </header>

                <main className="p-4 md:p-10 overflow-y-auto flex-1 bg-slate-50/50">
                    
                    {/* 1. AUDIT LOGS & OVERVIEW (FOUNDER ONLY) */}
                    {userRole === 'founder' && (activeTab === 'logs' || activeTab === 'overview') && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#1A5F7A] text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                                    <FiDollarSign className="absolute -right-4 -bottom-4 text-white/10 text-9xl" />
                                    <span className="text-[10px] font-black uppercase opacity-60">Total Collection</span>
                                    <div className="text-4xl font-black mt-2">₹{finances.total.toLocaleString()}</div>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                                    <div className="bg-orange-50 p-4 rounded-2xl text-[#F37021]"><FiPieChart size={32}/></div>
                                    <div><span className="text-[10px] font-black text-slate-400 uppercase">Top Program</span><div className="text-xl font-black text-[#1A5F7A]">{finances.topCourses[0]?.name || 'N/A'}</div></div>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-500"><FiActivity size={32}/></div>
                                    <div><span className="text-[10px] font-black text-slate-400 uppercase">System Events</span><div className="text-xl font-black text-slate-700">{auditLogs.length} Logs</div></div>
                                </div>
                            </div>

                            {/* AUDIT TABLE - THE SPECIFIC FIX */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                                <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                                    <h3 className="text-xs font-black text-[#1A5F7A] uppercase italic">Real-Time Audit Stream</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border-b tracking-widest">
                                            <tr><th className="p-6">Timestamp</th><th>Staff Member</th><th>Action</th><th>Target</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {auditLogs.length > 0 ? auditLogs.map(log => (
                                                <tr key={log._id} className="text-[11px] font-bold hover:bg-slate-50 transition-colors">
                                                    <td className="p-6 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td><span className="px-3 py-1 bg-blue-50 text-[#1A5F7A] rounded-lg border border-blue-100 uppercase text-[9px]">{log.performedBy}</span></td>
                                                    <td><span className={`italic font-black uppercase ${log.action.includes('Delete') ? 'text-red-500' : 'text-[#F37021]'}`}>{log.action}</span></td>
                                                    <td className="text-slate-600 truncate max-w-[200px]">{log.targetName || "System"}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="p-20 text-center text-slate-300 font-bold uppercase italic">No audit logs found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. LMS CONTROL TABS */}
                    {activeTab === 'lectures' && <AddLecture />}
                    {activeTab === 'materials' && <AddMaterial />}

                    {/* 3. REGISTRATIONS & ENQUIRIES */}
                    {(activeTab === 'registrations' || activeTab === 'enquiries') && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex flex-col md:flex-row gap-4 mb-8">
                                <div className="flex-1 relative">
                                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"/><input type="text" placeholder="Search..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[900px]">
                                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                            <tr>
                                                <th className="p-6">Candidate Details</th>
                                                {activeTab === 'enquiries' ? (<><th>Selected Program</th><th>System Status</th></>) : (<><th>ERP Status</th><th>Fee Structure</th><th>Payment</th></>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredData.map(item => {
                                                const { fee, paid } = calculateFinancials(item.course || item.selectedCourse, item.amountPaid);
                                                return (
                                                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-6">
                                                            <div className="font-black text-[#1A5F7A] uppercase text-xs">{item.name}</div>
                                                            <div className="text-[9px] font-bold text-slate-400 mt-1">{item.phone}</div>
                                                        </td>
                                                        {activeTab === 'registrations' ? (
                                                            <>
                                                                <td className="p-6">{item.isApproved ? <span className="text-green-600 bg-green-50 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Live Access</span> : <button onClick={() => handleApproveStudent(item._id)} className="bg-orange-50 text-[#F37021] px-4 py-2 rounded-lg font-black text-[8px] uppercase">Enable ERP</button>}</td>
                                                                <td className="p-6"><span className="text-[11px] font-black">₹{paid} / ₹{fee}</span></td>
                                                                <td className="p-6"><button onClick={() => setPaymentModal({ show: true, student: item, amount: "", mode: "Cash", transactionId: "" })} className="bg-[#1A5F7A] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-sm flex items-center gap-2"><FiPlus /> Add Receipt</button></td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="p-6 text-[10px] font-black uppercase text-slate-600">{item.selectedCourse}</td>
                                                                <td className="p-6"><span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${item.enrolled ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{item.enrolled ? 'STUDENT' : 'LEAD'}</span></td>
                                                            </>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* LOGOUT CONFIRMATION MODAL */}
            <AnimatePresence>{logoutModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-sm w-full shadow-2xl relative text-center border-t-8 border-red-500">
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><FiLogOut className="text-red-500 text-3xl" /></div>
                        <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic leading-none">Terminate?</h3>
                        <p className="text-slate-400 text-xs font-bold mt-4 uppercase tracking-widest leading-relaxed">Sure you want to end your session?</p>
                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <button onClick={() => setLogoutModal(false)} className="py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest">Stay</button>
                            <button onClick={() => { localStorage.clear(); navigate("/admin/login"); }} className="py-4 bg-red-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-red-200">Logout</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>

            {/* PAYMENT MODAL */}
            <AnimatePresence>{paymentModal.show && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl relative border">
                        <button onClick={() => setPaymentModal({ show: false, student: null, amount: "", mode: "Cash", transactionId: "" })} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><FiX size={24} /></button>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-[#F37021]/10 p-4 rounded-2xl text-[#F37021]"><FiCreditCard size={28} /></div>
                            <div>
                                <h3 className="text-xl font-black text-[#1A5F7A] uppercase leading-none italic">Sync Payment</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">ID: {paymentModal.student?.name}</p>
                            </div>
                        </div>
                        <form onSubmit={handleUpdateAction} className="space-y-4">
                            <input required type="number" placeholder="Amount" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={paymentModal.amount} onChange={(e) => setPaymentModal({...paymentModal, amount: e.target.value})} />
                            <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={paymentModal.mode} onChange={(e) => setPaymentModal({...paymentModal, mode: e.target.value})}>
                                <option value="Cash">Cash</option><option value="UPI">UPI</option><option value="NetBanking">NetBanking</option>
                            </select>
                            <input type="text" placeholder="Transaction ID" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" value={paymentModal.transactionId} onChange={(e) => setPaymentModal({...paymentModal, transactionId: e.target.value})} />
                            <button type="submit" className="w-full py-5 bg-[#F37021] text-white font-black rounded-2xl uppercase text-xs hover:bg-[#1A5F7A] transition-all">Push to Ledger</button>
                        </form>
                    </motion.div>
                </motion.div>
            )}</AnimatePresence>

        </div>
    );
}