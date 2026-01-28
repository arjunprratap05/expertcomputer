import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiPlus, FiX, 
    FiCheckCircle, FiCreditCard, FiDownload, FiClock, FiTrendingUp, FiAward, FiPieChart, FiDollarSign
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("adminToken");
    const userRole = localStorage.getItem("userRole"); 
    
    const [activeTab, setActiveTab] = useState(userRole === 'frontoffice' ? 'enquiries' : 'registrations');
    const [data, setData] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [finances, setFinances] = useState({ total: 0, topCourses: [] });
    const [monthlyData, setMonthlyData] = useState([]); // Added for Monthly Report
    const [reasons, setReasons] = useState([]); 
    const [paymentModal, setPaymentModal] = useState({ show: false, student: null, amount: "", mode: "Cash", transactionId: "" });
    const [toast, setToast] = useState({ show: false, message: "" });

    const fetchData = async () => {
        try {
            const path = activeTab === 'logs' ? '/admin/audit-logs' : 
                         (activeTab === 'registrations' ? '/admin/registrations' : '/admin/enquiries');
            const res = await axios.get(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
            
            if (activeTab === 'logs') {
                setAuditLogs(res.data.logs || []);
                setFinances({ total: res.data.totalRevenue, topCourses: res.data.top3Courses });
                setReasons(res.data.reasonBreakdown || []);
                setMonthlyData(res.data.monthlyReport || []); // Data from backend aggregation
            } else { 
                setData(res.data.data || []); 
            }
        } catch (err) { console.error("Sync failed", err); }
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    const calculateFinancials = (courseTitle, paid = 0) => {
        const allPrograms = [...techCoursesData, ...universityPrograms];
        const course = allPrograms.find(c => c.title === courseTitle || c.id === courseTitle);
        const fee = course?.fee ? parseInt(course.fee.replace(/[^0-9]/g, "")) : 0;
        return { fee, paid, balance: fee - paid };
    };

    const handleEvaluation = async (item, status) => {
        let reason = "";
        if (!status) { 
            reason = prompt("Please state the reason for rejection (e.g. Budget Issue):");
            if (reason === null) return; 
        }

        try {
            const res = await axios.patch(`${API_URL}/admin/enquiries/${item._id}/status`, 
                { enrolled: status, reason }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                if (status) {
                    setToast({ show: true, message: "LEAD CONVERTED! REDIRECTING..." });
                    setActiveTab('registrations'); 
                    setTimeout(() => { navigate('/registration'); }, 1500);
                } else {
                    setToast({ show: true, message: "Lead rejected and logged." });
                    fetchData();
                }
            }
            setTimeout(() => setToast({ show: false, message: "" }), 3000);
        } catch (err) { alert("Evaluation failed."); }
    };

    const handleUpdateAction = async (e) => {
        e.preventDefault();
        const { student, amount, mode, transactionId } = paymentModal;
        const finalTxId = !transactionId ? `ECA-CASH-${Date.now().toString().slice(-4)}` : transactionId;
        try {
            await axios.patch(`${API_URL}/admin/registrations/${student._id}/update-payment`, 
                { amountPaid: (student.amountPaid || 0) + parseInt(amount), paymentLog: { amount, mode, transactionId: finalTxId } }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaymentModal({ show: false, student: null, amount: "", mode: "Cash", transactionId: "" });
            fetchData();
            setToast({ show: true, message: "Sync Successful!" });
            setTimeout(() => setToast({ show: false, message: "" }), 3000);
        } catch (err) { alert("Sync failed."); }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            <AnimatePresence>{toast.show && (
                <motion.div initial={{ y: -50, x: "-50%" }} animate={{ y: 30, x: "-50%" }} exit={{ y: -50 }} className="fixed left-1/2 z-[200] bg-[#1A5F7A] text-white px-8 py-4 rounded-2xl shadow-xl italic font-black">
                    <FiCheckCircle className="text-[#F37021] inline mr-2" /><span>{toast.message}</span>
                </motion.div>
            )}</AnimatePresence>

            <div className="w-64 bg-[#1A5F7A] text-white p-6 flex flex-col shrink-0 shadow-2xl">
                <div className="text-xl font-black mb-10 text-center text-[#F37021] italic uppercase tracking-tighter">EXPERT ACADEMY</div>
                <nav className="flex flex-col gap-2 flex-1">
                    {(userRole === 'founder' || userRole === 'accounts') && <button onClick={() => setActiveTab('registrations')} className={`flex items-center gap-3 p-4 rounded-xl font-bold ${activeTab === 'registrations' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiUsers /> Registrations</button>}
                    {(userRole === 'founder' || userRole === 'frontoffice') && <button onClick={() => setActiveTab('enquiries')} className={`flex items-center gap-3 p-4 rounded-xl font-bold ${activeTab === 'enquiries' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiMessageSquare /> Enquiries</button>}
                    {userRole === 'founder' && <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-3 p-4 rounded-xl font-bold ${activeTab === 'logs' ? 'bg-[#F37021]' : 'hover:bg-white/10'}`}><FiActivity /> Financial Audit</button>}
                </nav>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white h-24 px-10 flex items-center justify-between border-b shadow-sm">
                    <div className="text-slate-400 text-[10px] font-black uppercase italic tracking-widest leading-none">Portal: <span className="text-[#F37021]">{userRole}</span></div>
                    {activeTab === 'logs' && userRole === 'founder' && (
                        <div className="flex gap-4">
                            <div className="bg-green-50 px-6 py-2 rounded-2xl border border-green-100 flex flex-col leading-none shadow-sm">
                                <span className="text-[8px] font-black uppercase text-green-600 italic">Total Revenue</span>
                                <span className="text-sm font-black text-[#1A5F7A]">₹{finances.total.toLocaleString()}</span>
                            </div>
                            <div className="flex gap-2">
                                {finances.topCourses.map((c, i) => (
                                    <div key={i} className="bg-orange-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-orange-100 shadow-sm">
                                        <FiAward className={i === 0 ? "text-yellow-500" : "text-slate-400"} /> <span className="text-[10px] font-black uppercase truncate max-w-[80px]">{c.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button onClick={() => { localStorage.clear(); window.location.href="/admin/login"; }} className="text-slate-500 font-bold uppercase text-[10px] flex items-center gap-2 hover:text-red-500 italic"><FiLogOut /> Logout</button>
                </header>

                <main className="p-10 overflow-y-auto flex-1 bg-slate-50/50">
                    {/* NEW SECTION: MONTHLY REVENUE REPORT */}
                    {activeTab === 'logs' && userRole === 'founder' && (
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <FiTrendingUp className="text-green-500 text-xl" />
                                <h3 className="text-sm font-black text-[#1A5F7A] uppercase italic">Monthly Revenue Breakdown</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {monthlyData.map((m, i) => (
                                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-green-200 transition-all">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.month}</span>
                                        <div className="text-xl font-black text-[#1A5F7A] mt-2 group-hover:text-green-600 transition-colors">₹{m.amount.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* REJECTION BREAKDOWN CHART */}
                    {activeTab === 'logs' && userRole === 'founder' && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10">
                            <div className="flex items-center gap-3 mb-6"><FiPieChart className="text-[#F37021] text-xl" /><h3 className="text-sm font-black text-[#1A5F7A] uppercase italic">Rejected Breakdown</h3></div>
                            <div className="flex flex-wrap gap-4">{reasons.map((r, i) => (<div key={i} className="flex-1 min-w-[120px] p-4 bg-slate-50 rounded-2xl border border-slate-100"><span className="text-[8px] font-black text-slate-400 uppercase leading-none">{r.name}</span><div className="text-xl font-black text-[#1A5F7A] mt-1">{r.value} <span className="text-[10px] text-slate-400 uppercase">Leads</span></div></div>))}</div>
                        </div>
                    )}

                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                <tr>{activeTab === 'enquiries' ? (<><th>Lead Info</th><th>Program</th><th>Evaluation</th><th>Status</th></>) : activeTab === 'logs' ? (<><th>Time</th><th>Staff</th><th>Target</th><th>Details</th></>) : (<><th>Candidate</th><th>Program</th><th>Financials</th><th>Action</th></>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {activeTab === 'logs' ? auditLogs.map(log => (
                                    <tr key={log._id} className="text-[10px] font-bold uppercase hover:bg-slate-50 transition-all">
                                        <td className="p-6 text-slate-400 italic"> {new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="p-6"><span className="bg-[#1A5F7A]/10 text-[#1A5F7A] px-3 py-1 rounded-lg font-black">{log.performedBy || "SYSTEM"}</span></td>
                                        <td className="p-6 text-slate-500 font-black">{log.targetName}</td>
                                        <td className="p-6"><span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg italic">{log.details}</span></td>
                                    </tr>
                                )) : activeTab === 'registrations' ? data.map(item => {
                                    const { fee, paid, balance } = calculateFinancials(item.course || item.selectedCourse, item.amountPaid);
                                    return (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="p-6 font-black text-[#1A5F7A] uppercase text-xs">{item.name}</td>
                                            <td className="p-6 text-[10px] font-black uppercase text-slate-600 tracking-tighter">{item.course}</td>
                                            <td className="p-6 text-[10px] font-bold uppercase">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between w-40 border-b pb-1"><span>Total Amount:</span><span className="text-slate-600 font-black">₹{fee.toLocaleString()}</span></div>
                                                    <div className="flex justify-between w-40 border-b pb-1"><span>PAID:</span><span className="text-green-600 font-black">₹{paid.toLocaleString()}</span></div>
                                                    <div className={`flex justify-between w-40 font-black ${balance > 0 ? 'text-red-500' : 'text-blue-500'}`}><span>Due:</span><span>₹{balance.toLocaleString()}</span></div>
                                                </div>
                                            </td>
                                            <td className="p-6">{(userRole === 'founder' || userRole === 'accounts') && (<button onClick={() => setPaymentModal({ show: true, student: item, amount: "", mode: "Cash", transactionId: "" })} className="bg-[#1A5F7A] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase italic shadow-sm hover:bg-[#F37021] transition-all"><FiPlus /> Sync Payment</button>)}</td>
                                        </tr>
                                    );
                                }) : data.map(item => (
                                    <tr key={item._id} className="hover:bg-slate-50/50 group transition-all">
                                        <td className="p-6 font-black text-[#1A5F7A] uppercase text-xs">{item.name}<div className="text-[9px] text-slate-400 font-bold mt-1">{item.phone}</div></td>
                                        <td className="p-6 text-[10px] font-black uppercase text-slate-600">{item.selectedCourse || "General"}</td>
                                        <td className="p-6 flex gap-2">
                                            <button onClick={() => handleEvaluation(item, true)} className="px-3 py-1 bg-green-50 text-green-600 border rounded-lg text-[8px] font-black hover:bg-green-500 hover:text-white italic">ENROLL</button>
                                            <button onClick={() => handleEvaluation(item, false)} className="px-3 py-1 bg-red-50 text-red-600 border rounded-lg text-[8px] font-black hover:bg-red-500 hover:text-white italic">REJECT</button>
                                        </td>
                                        <td className="p-6"><span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${item.enrolled ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{item.enrolled ? 'VERIFIED' : 'LEAD'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* SYNC MODAL INTEGRATION */}
            <AnimatePresence>
                {paymentModal.show && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border">
                            <button onClick={() => setPaymentModal({ show: false, student: null, amount: "", mode: "Cash", transactionId: "" })} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><FiX size={20} /></button>
                            <div className="flex items-center gap-3 mb-6"><div className="bg-[#F37021]/10 p-3 rounded-2xl text-[#F37021]"><FiCreditCard size={24} /></div><div><h3 className="text-xl font-black text-[#1A5F7A] uppercase leading-none italic">Sync & Receipt</h3><p className="text-[9px] font-bold text-slate-400 mt-1">Ref Candidate: {paymentModal.student?.name}</p></div></div>
                            <form onSubmit={handleUpdateAction} className="space-y-4">
                                <input required type="number" placeholder="Amount (INR)" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold italic focus:border-[#F37021]" value={paymentModal.amount} onChange={(e) => setPaymentModal({...paymentModal, amount: e.target.value})} />
                                <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold italic outline-none" value={paymentModal.mode} onChange={(e) => setPaymentModal({...paymentModal, mode: e.target.value})}><option value="Cash">Cash Entry</option><option value="UPI">UPI / Digital</option><option value="Razorpay">Razorpay Portal</option></select>
                                <input type="text" placeholder="Enter Slip No / Manual ID" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold italic focus:border-[#F37021]" value={paymentModal.transactionId} onChange={(e) => setPaymentModal({...paymentModal, transactionId: e.target.value})} />
                                <button type="submit" className="w-full py-4 bg-[#F37021] text-white font-black rounded-2xl shadow-lg uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-[#1A5F7A] transition-all italic"><FiDownload /> Synchronize Records</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}