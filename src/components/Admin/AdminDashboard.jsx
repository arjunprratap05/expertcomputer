import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiX, FiMenu, FiSearch, 
    FiCheckCircle, FiCreditCard, FiPieChart, FiDollarSign, FiVideo, FiBookOpen, 
    FiGrid, FiClock, FiShield, FiTag, FiCalendar, FiTarget, FiCopy, FiChevronDown,
    FiZap, FiCheck, FiTrendingDown, FiPhoneCall, FiAlertCircle
} from 'react-icons/fi';

// Internal Assets & Admin Modules
import { techCoursesData, universityPrograms } from '../../data/courses';
import AddLecture from '../Admin/AddLecture';
import AddMaterial from '../Admin/AddMaterial';
import BatchScheduler from '../Admin/BatchScheduler'; 

const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

// --- MEMOIZED SIDEBAR COMPONENT ---
const SidebarBtn = React.memo(({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] font-black transition-all group relative 
        ${active ? 'bg-[#F37021] text-white shadow-2xl -translate-x-2' : 'hover:bg-white/5 text-slate-300 hover:text-white hover:translate-x-1'}`}
    > 
        <span className="text-xl transition-transform group-hover:scale-110">{icon}</span>
        <span className="text-[11px] uppercase tracking-widest italic">{label}</span> 
        {active && (
            <motion.div 
                layoutId="active_pill" 
                className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
            />
        )} 
    </button>
));

/**
 * ADMIN DASHBOARD CORE - EXPERT ACADEMY v4.0
 * Features: 
 * - Multi-role Access Control (Founder, FrontOffice, Accounts)
 * - Financial History with YYYY-MM normalizer
 * - Automated Mobile Sidebar Toggling
 * - Unified Ledger Sync
 */
export default function AdminDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("adminToken");
    const userRole = localStorage.getItem("userRole")?.toLowerCase(); 
    const userName = localStorage.getItem("adminName") || "Administrator";

    // --- ACCESS CONTROL GATE ---
    const permissions = {
        founder: ['overview', 'logs', 'registrations', 'batches', 'lectures', 'materials', 'enquiries', 'coupons'],
        frontoffice: ['batches', 'lectures', 'materials', 'enquiries'],
        accounts: ['registrations', 'batches', 'lectures', 'materials', 'coupons']
    };
    const hasAccess = (tab) => permissions[userRole]?.includes(tab);

    // --- STATE ORCHESTRATION ---
    const [activeTab, setActiveTab] = useState(() => {
        if (userRole === 'frontoffice') return 'enquiries';
        if (userRole === 'accounts') return 'registrations';
        return 'overview'; 
    });
    
    const [students, setStudents] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [coupons, setCoupons] = useState([]);
    
    // --- FINANCIAL HISTORY ENGINE ---
    const [finances, setFinances] = useState({ total: 0, pendingAdjustments: 0 });
    const [monthlyHistory, setMonthlyHistory] = useState({}); 
    const [selectedMonth, setSelectedMonth] = useState(""); 
    
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState({ show: false, message: "" });
    
    const [discountMode, setDiscountMode] = useState(false);
    const [discountData, setDiscountData] = useState({ amount: "", reason: "" });
    const [paymentModal, setPaymentModal] = useState({ show: false, student: null, amount: "" });
    
    const [couponForm, setCouponForm] = useState({
        code: "", description: "", maxUsage: "", isActive: true, 
        validFrom: "", validTo: "", courseCode: "ALL", 
        discountType: "PERCENTAGE", discountValue: ""
    });

    const allCourses = useMemo(() => [...techCoursesData, ...universityPrograms], []);

    const triggerToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    // FIXED: Centralized Tab Switcher for Mobile Collapse
    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false); // Collapses sidebar on mobile after clicking
    }, []);

    const handleLogout = useCallback(() => { 
        localStorage.clear(); 
        navigate("/admin/login"); 
        window.location.reload(); 
    }, [navigate]);

    // --- DATA NORMALIZATION LAYER ---
    const getNormalizedEnrollments = useCallback((student) => {
        let list = student.enrollments ? [...student.enrollments] : [];
        if (student.transactionId && !list.find(e => e.transactionId === student.transactionId)) {
            list.unshift({
                course: student.course || "General Course",
                courseFee: student.totalFee || 0,
                paymentOption: student.paymentOption || "FULL",
                transactionId: student.transactionId,
                paymentStatus: student.paymentStatus || (student.isApproved ? "VERIFIED" : "PENDING"),
                enrolledAt: student.createdAt,
                isLegacy: true
            });
        }
        return list.map(en => ({
            ...en,
            courseFee: Number(en.courseFee) || Number(student.totalFee) || 0,
            transactionId: en.transactionId || student.transactionId || "NO-UTR-FIX",
            enrolledAt: en.enrolledAt || student.createdAt
        }));
    }, []);

    // --- FINANCIAL ANALYTICS LOGIC (Fixed "No Data" Bug) ---
    const analyzeFinances = useCallback((studentList) => {
        let grossTotal = 0;
        const history = {};
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        studentList.forEach(s => {
            grossTotal += (Number(s.amountPaid) || 0);
            
            const enrolls = getNormalizedEnrollments(s);
            enrolls.forEach(en => {
                const status = en.paymentStatus?.toUpperCase();
                if (status === 'VERIFIED' || status === 'SUCCESS') {
                    // Robust normalization for ISO and Locale date strings
                    const dateObj = new Date(en.enrolledAt || s.createdAt);
                    if (!isNaN(dateObj.getTime())) {
                        const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
                        history[monthKey] = (history[monthKey] || 0) + (Number(en.courseFee) || 0);
                    }
                }
            });
        });

        const sortedKeys = Object.keys(history).sort().reverse();
        setMonthlyHistory(history);
        setFinances({
            total: grossTotal,
            pendingAdjustments: studentList.filter(s => s.discountRequest?.status === 'PENDING').length
        });

        // Set initial selection to most recent month with data if current is empty
        if (!selectedMonth) {
            setSelectedMonth(history[currentMonthKey] ? currentMonthKey : (sortedKeys[0] || currentMonthKey));
        }
    }, [getNormalizedEnrollments, selectedMonth]);

    const calculateAggregateLedger = useCallback((student) => {
        const enrolls = getNormalizedEnrollments(student);
        const total = enrolls.reduce((acc, curr) => acc + (Number(curr.courseFee) || 0), 0);
        const paid = Number(student.amountPaid) || 0;
        const due = total - paid;
        return { total, paid, due: due > 0 ? due : 0 };
    }, [getNormalizedEnrollments]);

    // --- API HANDLERS ---
    const fetchEverything = useCallback(async () => {
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const [regRes, enqRes, coupRes] = await Promise.all([
                axios.get(`${API_URL}/admin/registrations`, { headers }),
                axios.get(`${API_URL}/admin/enquiries`, { headers }),
                axios.get(`${API_URL}/admin/coupons`, { headers })
            ]);
            
            const sData = regRes.data.data || [];
            setStudents(sData);
            setEnquiries(enqRes.data.data || []);
            setCoupons(coupRes.data.data || []);
            analyzeFinances(sData);

            if (userRole === 'founder' || activeTab === 'logs') {
                const logRes = await axios.get(`${API_URL}/admin/audit-logs`, { headers });
                setAuditLogs(logRes.data.logs || logRes.data.data || []);
            }
        } catch (err) { 
            if (err.response?.status === 401) handleLogout(); 
        }
    }, [token, analyzeFinances, userRole, activeTab, handleLogout]);

    useEffect(() => { fetchEverything(); }, [fetchEverything]);

    // --- SHARED ACTIONS ---
    const handleApprovePayment = async (studentId, studentName, transactionId) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.patch(`${API_URL}/admin/approve-student/${studentId}`, { targetName: studentName, transactionId }, { headers });
            await axios.patch(`${API_URL}/admin/registrations/${studentId}/grant-access`, {}, { headers });
            triggerToast("VERIFIED & UNLOCKED");
            fetchEverything(); 
        } catch (err) { triggerToast("VERIFICATION FAILED"); }
    };

    const handleFounderApprove = async (studentId) => {
        try {
            await axios.patch(`${API_URL}/admin/registrations/${studentId}/approve-discount`, {}, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast("AUTHORIZED"); fetchEverything();
        } catch (err) { triggerToast("APPROVAL FAILED"); }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...couponForm, code: couponForm.code.toUpperCase().trim() };
            await axios.post(`${API_URL}/admin/coupons`, payload, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast("COUPON ACTIVATED");
            setCouponForm({ code: "", description: "", maxUsage: "", isActive: true, validFrom: "", validTo: "", courseCode: "ALL", discountType: "PERCENTAGE", discountValue: "" });
            fetchEverything();
        } catch (err) { triggerToast("DEPLOYMENT FAILED"); }
    };

    const handleLedgerSync = async (e) => {
        e.preventDefault();
        const amt = Number(discountMode ? discountData.amount : paymentModal.amount);
        if (!amt || amt <= 0) return triggerToast("ENTER VALID AMOUNT");
        try {
            const headers = { Authorization: `Bearer ${token}` };
            if (discountMode) {
                if (!discountData.reason.trim()) return triggerToast("REASON REQUIRED");
                await axios.patch(`${API_URL}/admin/registrations/${paymentModal.student._id}/request-discount`, { amount: amt, reason: discountData.reason, targetName: paymentModal.student.name }, { headers });
                triggerToast("SENT TO FOUNDER");
            } else {
                const currentPaid = Number(paymentModal.student.amountPaid) || 0;
                await axios.patch(`${API_URL}/admin/registrations/${paymentModal.student._id}/update-ledger`, { amountPaid: currentPaid + amt, targetName: paymentModal.student.name }, { headers });
                triggerToast("LEDGER UPDATED");
            }
            setPaymentModal({ show: false, student: null, amount: "" });
            fetchEverything();
        } catch (err) { triggerToast("SYNC FAILED"); }
    };

    const handleEnquiryStatusUpdate = async (id, currentStatus, currentRemarks, studentName) => {
        const newStatus = !currentStatus;
        try {
            await axios.patch(`${API_URL}/inquiry/${id}`, { isContacted: newStatus, remarks: newStatus ? "CONTACTED" : "NOT CONTACTED", targetName: studentName }, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast(newStatus ? "CONTACTED" : "PENDING");
            fetchEverything();
        } catch (err) { triggerToast("STATUS FAILED"); }
    };

    // --- SEARCH FILTERS ---
    const filteredStudents = useMemo(() => students.filter(s => 
        (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
        getNormalizedEnrollments(s).some(e => e.transactionId?.includes(searchQuery))
    ), [students, searchQuery, getNormalizedEnrollments]);

    const filteredEnquiries = useMemo(() => enquiries.filter(e => 
        (e.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || (e.phone || "").includes(searchQuery)
    ), [enquiries, searchQuery]);

    // --- RENDER FRAGMENTS ---
    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* GROSS COLLECTION CARD */}
            <div className="bg-[#1A5F7A] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <FiDollarSign className="absolute -right-4 -bottom-4 text-9xl opacity-10" />
                <p className="text-[10px] uppercase font-black opacity-60 mb-1">Gross Collection (All Time)</p>
                <div className="text-4xl font-black italic tracking-tighter">₹{finances.total.toLocaleString()}</div>
            </div>
            
            {/* DYNAMIC MONTHLY REVENUE CARD */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-50 text-[#F37021] rounded-xl"><FiActivity size={20}/></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Monthly Revenue</p>
                    </div>
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="text-[10px] font-black bg-slate-100 border-none outline-none text-[#1A5F7A] cursor-pointer rounded-lg px-2 py-1 uppercase"
                    >
                        {Object.keys(monthlyHistory).length === 0 && <option value="">NO DATA</option>}
                        {Object.keys(monthlyHistory).sort().reverse().map(m => {
                            const [year, month] = m.split('-');
                            const date = new Date(year, month - 1);
                            return <option key={m} value={m}>{date.toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase()}</option>
                        })}
                    </select>
                </div>
                <div>
                    <div className="text-3xl font-black text-[#1A5F7A] italic">₹{(monthlyHistory[selectedMonth] || 0).toLocaleString()}</div>
                    <p className="text-[9px] font-bold text-[#F37021] uppercase opacity-70 mt-1">
                        {selectedMonth === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` ? "CURRENT CYCLE" : "HISTORICAL RECORD"}
                    </p>
                </div>
            </div>

            {/* REGISTRY CARD */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex items-center gap-5 shadow-sm">
                <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><FiUsers size={30}/></div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Registry</p>
                    <div className="text-xl font-black text-[#1A5F7A] italic">{students.length} Students</div>
                </div>
            </div>
            
            {/* ALERT CARD */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 flex items-center gap-5 border-dashed shadow-sm">
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl"><FiTrendingDown size={30}/></div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Alerts</p>
                    <div className="text-xl font-black text-[#1A5F7A] italic">{finances.pendingAdjustments} Pending</div>
                </div>
            </div>
        </div>
    );

    const renderRegistry = () => (
        <div className="space-y-8">
             <div className="flex flex-wrap justify-between items-center gap-4">
                <h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic">Student Registry</h3>
                <div className="relative w-full max-w-md group shadow-sm">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"/>
                    <input type="text" placeholder="Search Identity or UTR..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none font-bold focus:border-[#F37021] transition-all" onChange={e => setSearchQuery(e.target.value)}/>
                </div>
             </div>
             <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 font-black uppercase text-slate-400 border-b text-[9px]">
                        <tr><th className="p-7">Profile Identity</th><th>Financial standing</th><th>Portal Status</th><th className="pr-7 text-right">Ledger Sync</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredStudents.map(student => {
                            const ledger = calculateAggregateLedger(student);
                            const enrollments = getNormalizedEnrollments(student);
                            const isExpanded = expandedStudent === student._id;
                            const isPending = student.discountRequest?.status === 'PENDING';
                            return (
                                <React.Fragment key={student._id}>
                                    <tr className={`group transition-all ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
                                        <td className="p-7">
                                            <div className="font-black text-[#1A5F7A] uppercase italic text-[16px] leading-none">{student.name}</div>
                                            <div className="text-slate-400 font-bold text-[10px] uppercase mt-1 italic">{enrollments.length} Enrollment(s)</div>
                                        </td>
                                        <td>
                                            <div className="font-black text-[#1A5F7A] text-[15px]">₹{student.amountPaid?.toLocaleString()} <span className="text-slate-300 text-[11px] font-normal">/ ₹{ledger.total.toLocaleString()}</span></div>
                                            <div className={`text-[10px] uppercase italic mt-1 ${ledger.due > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                {isPending ? "APPROVAL REQUIRED" : (ledger.due > 0 ? `DUE: ₹${ledger.due}` : 'CLEARED')}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`px-3 py-1.5 rounded-xl w-fit font-black text-[9px] border ${student.isPortalActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-300 border-slate-200'}`}>
                                                {student.isPortalActive ? 'PORTAL ACTIVE' : 'LOCKED'}
                                            </div>
                                        </td>
                                        <td className="pr-7 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {userRole === 'founder' && isPending && <button onClick={() => handleFounderApprove(student._id)} className="bg-green-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all"><FiCheck className="inline mr-1"/> Approve</button>}
                                                <button onClick={() => setExpandedStudent(isExpanded ? null : student._id)} className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-[#F37021] text-white rotate-180' : 'bg-slate-100 text-[#1A5F7A]'}`}><FiChevronDown size={20}/></button>
                                                <button onClick={() => setPaymentModal({ show: true, student: student, amount: "" })} className="w-12 h-12 bg-white border-2 border-slate-100 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-[#F37021] hover:text-white transition-all shadow-sm"><FiCreditCard size={20}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan="4" className="p-0 bg-white">
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0 }} className="overflow-hidden border-b-8 border-blue-50/50">
                                                        <div className="p-10 grid grid-cols-1 gap-4 bg-slate-50/40">
                                                            {enrollments.map((en, i) => (
                                                                <div key={i} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-6 hover:border-[#F37021] transition-all">
                                                                    <div className="flex items-center gap-6">
                                                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#F37021] font-black italic">{i+1}</div>
                                                                        <div>
                                                                            <div className="text-[14px] font-black text-[#1A5F7A] uppercase italic leading-none">{en.course}</div>
                                                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                                                                                <FiCopy className="cursor-pointer hover:text-[#F37021]" onClick={() => {navigator.clipboard.writeText(en.transactionId); triggerToast("COPIED")}}/>
                                                                                UTR: <span className="text-slate-600 font-black">{en.transactionId}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-8">
                                                                        <div className="text-right pr-6 border-r border-slate-100">
                                                                            <p className="text-[8px] font-black text-slate-300 uppercase">Fee</p>
                                                                            <p className="text-[14px] font-black text-[#1A5F7A]">₹{en.courseFee?.toLocaleString()}</p>
                                                                        </div>
                                                                        {en.paymentStatus === 'PENDING' ? (
                                                                            <button onClick={() => handleApprovePayment(student._id, student.name, en.transactionId)} className="bg-green-600 text-white px-7 py-3 rounded-2xl text-[10px] font-black uppercase italic shadow-lg hover:bg-green-700 transition-all flex items-center gap-2"><FiShield /> Verify</button>
                                                                        ) : (
                                                                            <div className="text-green-600 font-black text-[10px] uppercase italic flex items-center gap-2 px-4"><FiCheckCircle/> Verified</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
             </div>
        </div>
    );

    const renderLogs = () => (
        <div className="space-y-8">
             <div className="flex justify-between items-center"><h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic">Audit Trail</h3></div>
             <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase border-b p-8 text-slate-400">
                        <tr><th className="p-8">Operator</th><th>Action</th><th>Target</th><th className="pr-8 text-right">Timestamp</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold text-[11px]">
                        {auditLogs.map((log, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-all">
                                <td className="p-8"><div className="text-[#1A5F7A] font-black uppercase italic">{log.performedBy}</div></td>
                                <td className="uppercase opacity-60">{log.action}</td>
                                <td className="italic text-slate-500 font-black">{log.targetName}</td>
                                <td className="pr-8 text-right">
                                    <div className="text-[#1A5F7A] font-black text-[14px]">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">{new Date(log.timestamp).toLocaleDateString()}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );

    const renderCoupons = () => (
        <div className="space-y-10">
             <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden border-t-[10px] border-[#1A5F7A]">
                <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4"><div className="w-2 h-10 bg-[#F37021] rounded-full"></div><h3 className="text-xl font-black text-[#1A5F7A] uppercase italic">Coupon Deployment Engine</h3></div>
                </div>
                <form onSubmit={handleCreateCoupon} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Activation Code</label><input required className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:bg-white focus:border-[#F37021] uppercase" placeholder="SALE2026" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Usage Limit</label><input required type="number" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:bg-white focus:border-[#F37021]" placeholder="100" value={couponForm.maxUsage} onChange={e => setCouponForm({...couponForm, maxUsage: e.target.value})} /></div>
                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Description</label>
                        <textarea required className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:bg-white focus:border-[#F37021] min-h-[100px] resize-none" value={couponForm.description} onChange={e => setCouponForm({...couponForm, description: e.target.value})} />
                    </div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Start Date</label><input required type="date" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:bg-white" value={couponForm.validFrom} onChange={e => setCouponForm({...couponForm, validFrom: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Expiry Date</label><input required type="date" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none focus:bg-white" value={couponForm.validTo} onChange={e => setCouponForm({...couponForm, validTo: e.target.value})} /></div>
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 border-t pt-10">
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#F37021] ml-4 flex items-center gap-2 italic"><FiTarget/> Product Scope</label><select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold outline-none appearance-none" value={couponForm.courseCode} onChange={e => setCouponForm({...couponForm, courseCode: e.target.value})}><option value="ALL">ALL PROGRAMS</option>{allCourses.map(c => <option key={c.title} value={c.title}>{c.title}</option>)}</select></div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-[#F37021] ml-4 flex items-center gap-2 italic"><FiPieChart/> Mode</label><div className="flex bg-slate-100 p-1.5 rounded-[2rem]"><button type="button" onClick={() => setCouponForm({...couponForm, discountType: 'PERCENTAGE'})} className={`flex-1 py-3 rounded-full font-black text-[10px] transition-all ${couponForm.discountType === 'PERCENTAGE' ? 'bg-[#1A5F7A] text-white shadow-xl' : 'text-slate-400'}`}>% Percentage</button><button type="button" onClick={() => setCouponForm({...couponForm, discountType: 'FLAT'})} className={`flex-1 py-3 rounded-full font-black text-[10px] transition-all ${couponForm.discountType === 'FLAT' ? 'bg-[#1A5F7A] text-white shadow-xl' : 'text-slate-400'}`}>₹ Fixed</button></div></div>
                        <div className="col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Value</label><input required type="number" className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[3rem] font-black text-5xl outline-none text-center focus:bg-white transition-all" value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} /></div>
                    </div>
                    <button className="col-span-2 py-6 bg-[#1A5F7A] text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all text-xs">Deploy Code</button>
                </form>
             </div>
        </div>
    );

    // --- MAIN RENDER ORCHESTRATION ---
    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-left relative text-slate-800">
            {/* TOAST SYSTEM */}
            <AnimatePresence>{toast.show && (
                <motion.div initial={{ y: -50, x: "-50%", opacity: 0 }} animate={{ y: 30, x: "-50%", opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed left-1/2 z-[999] bg-[#1A5F7A] text-white px-8 py-4 rounded-[1.5rem] shadow-2xl font-black border-b-4 border-[#F37021] uppercase text-[11px] flex items-center gap-3">
                    <FiZap className="text-[#F37021]"/> {toast.message}
                </motion.div>
            )}</AnimatePresence>

            {/* MOBILE SIDEBAR OVERLAY */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* DYNAMIC SIDEBAR */}
            <aside className={`fixed lg:relative z-[200] h-full w-80 bg-[#1A5F7A] text-white p-8 flex flex-col shadow-2xl transition-all duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex justify-between items-start mb-12">
                    <div className="font-black text-[#F37021] italic text-2xl uppercase tracking-tighter">
                        Expert Academy<br/>
                        <span className="text-[10px] text-white/30 tracking-[0.4em] font-black not-italic block mt-1 uppercase">Admin Central</span>
                    </div>
                    <button className="lg:hidden text-white/50 p-2" onClick={() => setIsSidebarOpen(false)}><FiX size={24} /></button>
                </div>
                <nav className="flex flex-col gap-3 flex-1 no-scrollbar overflow-y-auto">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2 ml-4">Main Menu</p>
                    {hasAccess('overview') && <SidebarBtn active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} icon={<FiGrid />} label="Dashboard" />}
                    {hasAccess('enquiries') && <SidebarBtn active={activeTab === 'enquiries'} onClick={() => handleTabChange('enquiries')} icon={<FiMessageSquare />} label="Leads" />}
                    {hasAccess('registrations') && <SidebarBtn active={activeTab === 'registrations'} onClick={() => handleTabChange('registrations')} icon={<FiUsers />} label="Registry" />}
                    
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-6 mb-2 ml-4">LMS Controls</p>
                    {hasAccess('batches') && <SidebarBtn active={activeTab === 'batches'} onClick={() => handleTabChange('batches')} icon={<FiClock />} label="Batches" />}
                    <SidebarBtn active={activeTab === 'lectures'} onClick={() => handleTabChange('lectures')} icon={<FiVideo />} label="Live Class" />
                    <SidebarBtn active={activeTab === 'materials'} onClick={() => handleTabChange('materials')} icon={<FiBookOpen />} label="Vault" />
                    
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-6 mb-2 ml-4">Admin Tools</p>
                    {hasAccess('coupons') && <SidebarBtn active={activeTab === 'coupons'} onClick={() => handleTabChange('coupons')} icon={<FiTag />} label="Coupons" />}
                    {hasAccess('logs') && <SidebarBtn active={activeTab === 'logs'} onClick={() => handleTabChange('logs')} icon={<FiActivity />} label="Audit Logs" />}
                </nav>
            </aside>

            {/* CONTENT ORCHESTRATOR */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <header className="bg-white h-24 px-10 flex items-center justify-between border-b border-slate-100 shadow-sm sticky top-0 z-[100]">
                    <div className="flex items-center gap-5">
                        <button className="lg:hidden text-[#1A5F7A] p-2" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24} /></button>
                        <h2 className="font-black text-[#1A5F7A] text-lg uppercase italic">{activeTab.replace('-', ' ')}</h2>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="hidden sm:block text-right pr-6 border-r border-slate-100">
                            <span className="text-[#1A5F7A] text-[13px] font-black uppercase block">{userName}</span>
                            <span className="text-[9px] font-bold text-[#F37021] uppercase opacity-70">{userRole}</span>
                        </div>
                        <button onClick={() => setLogoutModal(true)} className="p-4 bg-red-50 text-red-500 rounded-2xl active:scale-90 transition-all"><FiLogOut size={22} /></button>
                    </div>
                </header>

                <main className="p-6 lg:p-12 overflow-y-auto flex-1 no-scrollbar bg-[#F8FAFC]">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'registrations' && renderRegistry()}
                    {activeTab === 'enquiries' && (
                        <div className="space-y-8">
                             <div className="flex flex-wrap justify-between items-center gap-4">
                                <h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic">Inquiry Pipeline</h3>
                                <div className="relative w-full max-w-md group">
                                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"/>
                                    <input type="text" placeholder="Search Identity..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none font-bold focus:border-[#F37021] transition-all" onChange={e => setSearchQuery(e.target.value)}/>
                                </div>
                             </div>
                             <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden overflow-x-auto">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-50 font-black uppercase text-slate-400 border-b text-[9px]">
                                        <tr><th className="p-7">Lead Identity</th><th>Program</th><th>Source</th><th>Date</th><th className="pr-7 text-right">Action</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-bold">
                                        {filteredEnquiries.map(item => (
                                            <tr key={item._id} className="hover:bg-blue-50/20 transition-all group">
                                                <td className="p-7"><div className="font-black text-[#1A5F7A] uppercase italic text-[15px] group-hover:text-[#F37021]">{item.name}</div><div className="text-slate-400 font-bold text-[11px] mt-1 italic">{item.phone}</div></td>
                                                <td className="font-black text-[#1A5F7A] uppercase opacity-80 text-[13px]">{item.course || "GENERAL"}</td>
                                                <td><div className="px-3 py-1 bg-green-50 text-green-600 rounded-full font-black text-[8px] w-fit italic uppercase border border-green-100 flex items-center gap-1">Website</div></td>
                                                <td className="text-slate-400 italic uppercase"><FiCalendar className="inline mr-2"/>{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
                                                <td className="pr-7 text-right">
                                                    <button onClick={() => handleEnquiryStatusUpdate(item._id, item.isContacted, item.remarks, item.name)} className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ml-auto ${item.isContacted ? 'bg-green-500 text-white shadow-lg' : 'bg-white border-2 text-slate-200 hover:border-[#F37021] hover:text-[#F37021]'}`}>
                                                        {item.isContacted ? <FiCheckCircle size={20}/> : <FiPhoneCall size={18}/>}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'coupons' && renderCoupons()}
                    {activeTab === 'logs' && renderLogs()}
                    {activeTab === 'batches' && <BatchScheduler />}
                    {activeTab === 'lectures' && <AddLecture />}
                    {activeTab === 'materials' && <AddMaterial />}
                </main>
            </div>

            {/* LEDGER MODAL SYSTEM */}
            <AnimatePresence>{paymentModal.show && paymentModal.student && (() => {
                const ledger = calculateAggregateLedger(paymentModal.student);
                return (
                    <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3.5rem] p-10 max-w-md w-full shadow-2xl relative border-t-[15px] border-[#1A5F7A]">
                            <button onClick={() => { setPaymentModal({ show: false, student: null, amount: "" }); setDiscountMode(false); }} className="absolute top-8 right-8 text-slate-300 hover:text-red-500"><FiX size={24} /></button>
                            <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic mb-1">Ledger Sync</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase mb-6 italic">Updating: {paymentModal.student.name}</p>
                            
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 font-black uppercase text-[10px]">
                                <button onClick={() => setDiscountMode(false)} className={`flex-1 py-3 rounded-xl transition-all ${!discountMode ? 'bg-white text-[#1A5F7A] shadow-sm' : 'text-slate-400'}`}>Receive Pay</button>
                                <button onClick={() => setDiscountMode(true)} className={`flex-1 py-3 rounded-xl transition-all ${discountMode ? 'bg-[#F37021] text-white shadow-sm' : 'text-slate-400'}`}>Adjustment</button>
                            </div>

                            <form onSubmit={handleLedgerSync} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-4 italic flex items-center gap-2">Enter Amount (₹)</label>
                                    <input required autoFocus type="number" className={`w-full p-6 bg-slate-50 border-2 rounded-[2rem] font-black text-3xl outline-none text-center ${discountMode ? 'focus:border-[#F37021]' : 'focus:border-green-500'}`} placeholder="0000" value={discountMode ? discountData.amount : paymentModal.amount} onChange={(e) => discountMode ? setDiscountData({...discountData, amount: e.target.value}) : setPaymentModal({...paymentModal, amount: e.target.value})} />
                                </div>
                                {discountMode && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-4 italic">Reason</label>
                                        <textarea required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold text-xs outline-none focus:bg-white min-h-[100px] resize-none" placeholder="Reason..." value={discountData.reason} onChange={(e) => setDiscountData({...discountData, reason: e.target.value})} />
                                    </div>
                                )}
                                <button type="submit" className={`w-full py-6 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${discountMode ? 'bg-[#F37021]' : 'bg-green-600'}`}>
                                    <FiCheckCircle size={18}/> {discountMode ? "Request Auth" : "Sync Registry"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                );
            })()}</AnimatePresence>

            {/* SESSION TERMINATION */}
            <AnimatePresence>{logoutModal && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-t-8 border-red-500 text-center">
                        <FiLogOut className="mx-auto text-red-500 mb-6" size={48} />
                        <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic mb-8">Sign Out?</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setLogoutModal(false)} className="py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px] text-slate-500">Stay</button>
                            <button onClick={handleLogout} className="py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Exit</button>
                        </div>
                    </motion.div>
                </div>
            )}</AnimatePresence>
        </div>
    );
}