import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiPlus, FiX, FiMenu, FiSearch, 
    FiCheckCircle, FiCreditCard, FiDownload, FiAlertCircle, FiBarChart2, FiPieChart, 
    FiDollarSign, FiVideo, FiBookOpen, FiGrid
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

// NEW IMPORTS FOR LECTURES & MATERIAL
import AddLecture from '../Admin/AddLecture';
import AddMaterial from '../Admin/AddMaterial';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("adminToken");
    const userRole = localStorage.getItem("userRole"); 
    
    // Default tab based on role
    const [activeTab, setActiveTab] = useState(
        userRole === 'frontoffice' ? 'enquiries' : 
        userRole === 'founder' ? 'overview' : 'registrations'
    );
    
    const [data, setData] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [finances, setFinances] = useState({ total: 0, monthly: [], topCourses: [] });
    const [reasons, setReasons] = useState([]); 
    const [paymentModal, setPaymentModal] = useState({ show: false, student: null, amount: "", mode: "Cash", transactionId: "" });
    const [toast, setToast] = useState({ show: false, message: "" });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterApproved, setFilterApproved] = useState("all");

    const fetchData = async () => {
        // Prevent unauthorized role access to logs/overview
        if ((activeTab === 'logs' || activeTab === 'overview') && userRole !== 'founder') return;

        // Fetch data for registrations or enquiries
        if (['registrations', 'enquiries'].includes(activeTab)) {
            try {
                const path = activeTab === 'registrations' ? '/admin/registrations' : '/admin/enquiries';
                const res = await axios.get(`${API_URL}${path}`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                setData(res.data.data || []); 
            } catch (err) { 
                console.error("Sync failed", err);
                if (err.response?.status === 401) navigate('/admin/login');
            }
        }

        // Fetch logs/financials for founder
        if ((activeTab === 'logs' || activeTab === 'overview') && userRole === 'founder') {
            try {
                const res = await axios.get(`${API_URL}/admin/audit-logs`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                setAuditLogs(res.data.logs || []);
                setFinances({ 
                    total: res.data.totalRevenue || 0, 
                    monthly: res.data.monthlyReport || [],
                    topCourses: res.data.topCourses || [] 
                });
                setReasons(res.data.rejectionReasons || []);
            } catch (err) {
                console.error("Audit fetch failed", err);
            }
        }
    };

    useEffect(() => { 
        fetchData(); 
        setIsSidebarOpen(false); 
    }, [activeTab]);

    const filteredData = data.filter(item => {
        const name = item.name?.toLowerCase() || "";
        const phone = item.phone || "";
        const matchesSearch = name.includes(searchQuery.toLowerCase()) || phone.includes(searchQuery);
        
        if (activeTab === 'registrations') {
            const matchesFilter = filterApproved === "all" ? true : filterApproved === "approved" ? item.isApproved : !item.isApproved;
            return matchesSearch && matchesFilter;
        }
        return matchesSearch;
    });

    const calculateFinancials = (courseTitle, paid = 0) => {
        const allPrograms = [...techCoursesData, ...universityPrograms];
        const course = allPrograms.find(c => c.title === courseTitle || c.id === courseTitle);
        const feeString = course?.fee || "0";
        const fee = parseInt(feeString.replace(/[^0-9]/g, "")) || 0;
        return { fee, paid, balance: fee - paid };
    };

    const handleApproveStudent = async (studentId) => {
        try {
            const res = await axios.patch(`${API_URL}/admin/approve-student/${studentId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) {
                showToast("ERP ACCESS GRANTED & NOTIFIED");
                fetchData();
            }
        } catch (err) { alert("Approval failed."); }
    };

    const handleUpdateAction = async (e) => {
        e.preventDefault();
        const { student, amount, mode, transactionId } = paymentModal;
        try {
            await axios.patch(`${API_URL}/admin/registrations/${student._id}/update-payment`, 
                { 
                    amountPaid: (student.amountPaid || 0) + parseInt(amount), 
                    paymentLog: { amount, mode, transactionId, date: new Date() } 
                }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaymentModal({ show: false, student: null, amount: "", mode: "Cash", transactionId: "" });
            fetchData();
            showToast("PAYMENT SYNCED SUCCESSFULLY");
        } catch (err) { alert("Sync failed."); }
    };

    const showToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
            {/* TOAST NOTIFICATION */}
            <AnimatePresence>{toast.show && (
                <motion.div initial={{ y: -50, x: "-50%", opacity: 0 }} animate={{ y: 30, x: "-50%", opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed left-1/2 translate-x-1/2 z-[500] bg-[#1A5F7A] text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-center border-b-4 border-[#F37021]">
                    <FiCheckCircle className="text-[#F37021] inline mr-2 mb-1" size={20} /><span>{toast.message}</span>
                </motion.div>
            )}</AnimatePresence>

            {/* SIDEBAR */}
            <aside className={`fixed lg:relative z-[200] h-full w-64 bg-[#1A5F7A] text-white p-6 flex flex-col shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="mb-10 text-center font-black text-[#F37021] italic text-xl tracking-tighter border-b border-white/10 pb-4">EXPERT ACADEMY</div>
                
                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
                    {userRole === 'founder' && (
                        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiGrid /> Overview</button>
                    )}

                    {(userRole === 'founder' || userRole === 'accounts') && (
                        <button onClick={() => setActiveTab('registrations')} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'registrations' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiUsers /> Registrations</button>
                    )}
                    
                    {/* UPDATED: VISIBLE TO ALL ROLES */}
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

                <button onClick={() => { localStorage.clear(); navigate("/admin/login"); }} className="mt-auto flex items-center gap-3 p-4 rounded-xl font-bold text-red-300 hover:bg-red-500/10 transition-all uppercase text-xs italic"><FiLogOut /> Terminate Session</button>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white h-20 px-6 md:px-10 flex items-center justify-between border-b shadow-sm sticky top-0 z-50">
                    <button className="lg:hidden text-[#1A5F7A]" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24} /></button>
                    <div className="text-slate-400 text-[10px] font-black uppercase italic">Access Level: <span className="text-[#F37021]">{userRole}</span></div>
                    <div className="hidden md:block font-black text-[#1A5F7A] text-xs uppercase italic tracking-widest">Administrative Control Center</div>
                </header>

                <main className="p-4 md:p-10 overflow-y-auto flex-1 bg-slate-50/50">
                    
                    {/* OVERVIEW & LOGS (FOUNDER ONLY) */}
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
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Top Program</span>
                                        <div className="text-xl font-black text-[#1A5F7A]">{finances.topCourses[0]?.name || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                                    <div className="bg-red-50 p-4 rounded-2xl text-red-500"><FiAlertCircle size={32}/></div>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Primary Rejection</span>
                                        <div className="text-xl font-black text-slate-700">{reasons[0]?.reason || 'No Data'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                                <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                                    <h3 className="text-xs font-black text-[#1A5F7A] uppercase italic">Real-Time Audit Stream</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border-b">
                                            <tr><th className="p-6">Timestamp</th><th>Staff Member</th><th>Action Performed</th><th>Target</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {auditLogs.slice(0, 15).map(log => (
                                                <tr key={log._id} className="text-[11px] font-bold">
                                                    <td className="p-6 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td><span className="px-3 py-1 bg-blue-50 text-[#1A5F7A] rounded-lg border border-blue-100">{log.performedBy}</span></td>
                                                    <td className="text-[#F37021] italic font-black uppercase">{log.action}</td>
                                                    <td className="text-slate-600">{log.targetName}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LECTURE & MATERIAL TABS (NOW VISIBLE TO ALL ROLES) */}
                    {activeTab === 'lectures' && <AddLecture />}
                    {activeTab === 'materials' && <AddMaterial />}

                    {/* REGISTRATIONS & ENQUIRIES VIEW */}
                    {(activeTab === 'registrations' || activeTab === 'enquiries') && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:row gap-4 mb-8">
                                <div className="flex-1 relative">
                                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"/>
                                    <input type="text" placeholder="Search by name or phone..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm outline-none focus:border-[#F37021]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                                </div>
                                {activeTab === 'registrations' && (
                                    <select className="bg-white border rounded-2xl px-6 py-4 font-black text-xs uppercase outline-none text-[#1A5F7A]" value={filterApproved} onChange={(e) => setFilterApproved(e.target.value)}>
                                        <option value="all">Show All Students</option>
                                        <option value="approved">Approved ERP Only</option>
                                        <option value="pending">Pending Approval</option>
                                    </select>
                                )}
                            </div>

                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[900px]">
                                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                            <tr>
                                                <th className="p-6">Candidate Details</th>
                                                {activeTab === 'enquiries' ? (
                                                    <><th>Selected Program</th><th>System Status</th><th>Lead Type</th></>
                                                ) : (
                                                    <><th>ERP Status</th><th>Fee Structure</th><th>Sync Payment</th></>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredData.map(item => {
                                                const { fee, paid } = calculateFinancials(item.course || item.selectedCourse, item.amountPaid);
                                                return (
                                                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="p-6">
                                                            <div className="font-black text-[#1A5F7A] uppercase text-xs">{item.name}</div>
                                                            <div className="text-[9px] font-bold text-slate-400 mt-1">{item.phone} • {item.email}</div>
                                                        </td>
                                                        {activeTab === 'registrations' ? (
                                                            <>
                                                                <td className="p-6">
                                                                    {item.isApproved ? 
                                                                        <span className="text-green-600 font-black text-[9px] uppercase bg-green-50 px-3 py-1 rounded-lg border border-green-100">Live Access</span> : 
                                                                        <button onClick={() => handleApproveStudent(item._id)} className="bg-orange-50 text-[#F37021] px-4 py-2 rounded-lg font-black text-[8px] uppercase border border-orange-200 hover:bg-[#F37021] hover:text-white transition-all">Enable ERP</button>
                                                                    }
                                                                </td>
                                                                <td className="p-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[11px] font-black text-slate-700">₹{paid.toLocaleString()} <span className="text-slate-300 font-normal">/ ₹{fee.toLocaleString()}</span></span>
                                                                        <div className="w-24 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                                            <div className="h-full bg-green-500" style={{ width: `${(paid/fee)*100}%` }}></div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-6">
                                                                    <button onClick={() => setPaymentModal({ show: true, student: item, amount: "", mode: "Cash", transactionId: "" })} className="bg-[#1A5F7A] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase italic shadow-sm hover:bg-[#F37021] transition-all flex items-center gap-2">
                                                                        <FiPlus /> Add Receipt
                                                                    </button>
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="p-6 text-[10px] font-black uppercase text-slate-600">{item.selectedCourse || "General Inquiry"}</td>
                                                                <td className="p-6">
                                                                    <div className="flex gap-2">
                                                                        <button className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-lg text-[8px] font-black italic hover:bg-green-600 hover:text-white transition-all">CONVERT</button>
                                                                        <button className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[8px] font-black italic hover:bg-red-600 hover:text-white transition-all">DISCARD</button>
                                                                    </div>
                                                                </td>
                                                                <td className="p-6">
                                                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${item.enrolled ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                                        {item.enrolled ? 'STUDENT' : 'HOT LEAD'}
                                                                    </span>
                                                                </td>
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

            {/* PAYMENT MODAL */}
            <AnimatePresence>
                {paymentModal.show && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl relative border">
                            <button onClick={() => setPaymentModal({ show: false, student: null, amount: "", mode: "Cash", transactionId: "" })} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><FiX size={24} /></button>
                            
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-[#F37021]/10 p-4 rounded-2xl text-[#F37021]"><FiCreditCard size={28} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-[#1A5F7A] uppercase leading-none italic">Financial Sync</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {paymentModal.student?._id.slice(-6)} | {paymentModal.student?.name}</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateAction} className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">Transaction Amount</label>
                                    <input required type="number" placeholder="Enter Amount in INR" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold italic focus:border-[#F37021] outline-none" value={paymentModal.amount} onChange={(e) => setPaymentModal({...paymentModal, amount: e.target.value})} />
                                </div>
                                
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">Payment Gateway/Mode</label>
                                    <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold italic outline-none cursor-pointer" value={paymentModal.mode} onChange={(e) => setPaymentModal({...paymentModal, mode: e.target.value})}>
                                        <option value="Cash">Physical Cash</option>
                                        <option value="UPI">Direct UPI Transfer</option>
                                        <option value="NetBanking">Net Banking / NEFT</option>
                                        <option value="Razorpay">Razorpay Checkout</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block">Reference ID / Slip No.</label>
                                    <input type="text" placeholder="TXN123456789" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold italic focus:border-[#F37021] outline-none" value={paymentModal.transactionId} onChange={(e) => setPaymentModal({...paymentModal, transactionId: e.target.value})} />
                                </div>

                                <button type="submit" className="w-full py-5 bg-[#F37021] text-white font-black rounded-2xl shadow-lg uppercase text-xs flex items-center justify-center gap-3 hover:bg-[#1A5F7A] transform hover:-translate-y-1 transition-all italic mt-4">
                                    <FiDownload size={18}/> Push to Ledger
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}