import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUsers, FiMessageSquare, FiLogOut, FiActivity, FiX, FiMenu, FiSearch,
    FiCheckCircle, FiCreditCard, FiDollarSign, FiVideo, FiBookOpen,
    FiGrid, FiClock, FiShield, FiTag, FiChevronDown, FiZap, FiPhoneCall,
    FiAlertCircle, FiCpu, FiUserCheck, FiMessageCircle, FiFacebook, FiGlobe,
    FiEdit3, FiPlusCircle, FiCheck, FiUnlock, FiSend, FiTrendingUp, FiAward
} from 'react-icons/fi';
import AdminAIBot from './AdminAIBot';
import { techCoursesData, universityPrograms } from '../../data/courses';
import AddLecture from '../Admin/AddLecture';
import AddMaterial from '../Admin/AddMaterial';
import BatchScheduler from '../Admin/BatchScheduler';
import QuizManager from '../Admin/QuizManager';
import WhatsAppLeads from '../Admin/WhatsAppLeads';
import AdminCertificates from '../Admin/AdminCertificates';

const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

const SidebarBtn = React.memo(({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 p-3.5 rounded-2xl font-black transition-all group relative 
        ${active
                ? 'bg-[#F37021] text-white shadow-lg shadow-orange-950/40 translate-x-1'
                : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'}`}
    >
        <span className="text-lg transition-transform group-hover:scale-110">{icon}</span>
        <span className="text-[11px] uppercase tracking-widest italic">{label}</span>
        {active && (
            <motion.div
                layoutId="active_pill"
                className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff]"
            />
        )}
    </button>
));

export default function AdminDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("adminToken");
    const userRole = localStorage.getItem("userRole")?.toLowerCase() || 'admin';
    const userName = localStorage.getItem("adminName") || "Administrator";

    const permissions = {
        founder: ['overview', 'logs', 'registrations', 'batches', 'lectures', 'materials', 'enquiries', 'whatsapp', 'coupons', 'quizzes', 'certificates'],
        admin: ['overview', 'registrations', 'batches', 'lectures', 'materials', 'enquiries', 'whatsapp', 'coupons', 'quizzes', 'certificates'],
        frontoffice: ['batches', 'lectures', 'materials', 'enquiries', 'whatsapp', 'quizzes', 'coupons', 'certificates'],
        accounts: ['registrations', 'batches', 'lectures', 'materials', 'coupons', 'quizzes', 'certificates']
    };

    const hasAccess = (tab) => !permissions[userRole] || permissions[userRole].includes(tab);

    const [activeTab, setActiveTab] = useState(() => {
        if (userRole === 'frontoffice') return 'enquiries';
        if (userRole === 'accounts') return 'registrations';
        return 'overview';
    });

    const [students, setStudents] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [availableBatches, setAvailableBatches] = useState([]);
    const [apiLatency, setApiLatency] = useState("Calculating...");

    // Global Search & Neural Tracer States
    const [globalQuery, setGlobalQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [traceModal, setTraceModal] = useState({ show: false, phone: null, data: null, loading: false });

    const [finances, setFinances] = useState({ total: 0, pendingAdjustments: 0 });
    const [monthlyHistory, setMonthlyHistory] = useState({});
    const [selectedMonth, setSelectedMonth] = useState("");

    const [expandedStudent, setExpandedStudent] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterApproved, setFilterApproved] = useState("all");
    const [toast, setToast] = useState({ show: false, message: "" });
    const [isSendingReport, setIsSendingReport] = useState(false);

    const [paymentModal, setPaymentModal] = useState({ show: false, student: null, amount: "", mode: "Cash", transactionId: "", courseTitle: "" });
    const [batchModal, setBatchModal] = useState({ show: false, student: null, filteredBatches: [] });

    const [couponForm, setCouponForm] = useState({
        code: "", description: "", maxUsage: "", isActive: true,
        validFrom: "", validTo: "", courseCode: "ALL",
        discountType: "PERCENTAGE", discountValue: ""
    });

    const allCourses = useMemo(() => [...techCoursesData, ...universityPrograms], []);

    useEffect(() => {
        if (!globalQuery || globalQuery.trim().length < 2) {
            setSearchResults(null);
            return;
        }
        const delayDebounce = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await axios.get(`${API_URL}/admin/global-search?q=${globalQuery}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setSearchResults(res.data.results);
                }
            } catch (err) {
                console.error("Global search failed", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [globalQuery, token]);

    const handleOpenTracer = async (phone) => {
        setTraceModal({ show: true, phone, data: null, loading: true });
        try {
            const res = await axios.get(`${API_URL}/admin/trace/${phone}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setTraceModal(prev => ({ ...prev, data: res.data.dossier, loading: false }));
            }
        } catch (err) {
            triggerToast("TRACE FAILED: RECORD NOT FOUND");
            setTraceModal({ show: false, phone: null, data: null, loading: false });
        }
    };

    const mlOverviewStats = useMemo(() => {
        if (students.length === 0) return { avgProb: 0, positive: 0, neutral: 0, negative: 0 };
        let totalProb = 0;
        let positive = 0, neutral = 0, negative = 0;
        students.forEach(s => {
            totalProb += (s.conversionProbability || 50);
            if (s.sentiment === 'positive') positive++;
            else if (s.sentiment === 'negative') negative++;
            else neutral++;
        });
        return {
            avgProb: Math.round(totalProb / students.length),
            positive,
            neutral,
            negative
        };
    }, [students]);

    const webPerformanceMetrics = useMemo(() => [
        { label: "First Contentful Paint (FCP)", value: "0.74s", status: "Optimal", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
        { label: "Time to Interactive (TTI)", value: "1.25s", status: "Optimal", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
        { label: "Core API Query Latency", value: apiLatency, status: apiLatency.includes("ms") ? "Low Load" : "Monitoring", color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
        { label: "Vite Hot Reload Cycle", value: "42ms", status: "Excellent", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" }
    ], [apiLatency]);

    const triggerToast = useCallback((msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.clear();
        sessionStorage.setItem("hasSeenLoader", "true");
        localStorage.setItem("hasSeenLoader", "true");
        navigate("/admin/login", { replace: true });
    }, [navigate]);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
    }, []);

    const isCourseBatchMatch = useCallback((courseName, batchCourseId, batchCourseName) => {
        if (!courseName) return false;
        const cName = courseName.toLowerCase();
        const bId = (batchCourseId || "").toLowerCase();
        const bName = (batchCourseName || "").toLowerCase();

        if (cName.includes("tally") && (bId.includes("tally") || bName.includes("tally"))) return true;
        if ((cName.includes("gen-ai") || cName.includes("generative ai")) && (bId.includes("gen-ai") || bId.includes("generative"))) return true;
        if (cName.includes("java") && (bId.includes("java") || bName.includes("java"))) return true;
        if (cName.includes("adca") && (bId.includes("adca") || bName.includes("adca"))) return true;
        if (cName.includes("dca") && !cName.includes("adca") && (bId.includes("dca") || bName.includes("dca"))) return true;

        const cleanCourse = cName.replace(/[^a-z0-9]/g, "");
        const cleanBatchId = bId.replace(/[^a-z0-9]/g, "");
        const cleanBatchName = bName.replace(/[^a-z0-9]/g, "");

        if (cleanBatchId.length > 2 && (cleanCourse.includes(cleanBatchId) || cleanBatchId.includes(cleanCourse))) return true;
        if (cleanBatchName.length > 2 && (cleanCourse.includes(cleanBatchName) || cleanBatchName.includes(cleanCourse))) return true;

        return false;
    }, []);

    const getNormalizedEnrollments = useCallback((student) => {
        let list = student.enrollments ? [...student.enrollments] : [];
        if (list.length === 0 && student.course) {
            list.push({
                course: student.course,
                courseFee: student.totalFee || 0,
                amountPaid: student.amountPaid || 0,
                paymentStatus: student.paymentStatus || (student.isApproved ? "VERIFIED" : "PENDING"),
                transactionId: student.transactionId || "UTR-LEGACY",
                enrolledAt: student.createdAt
            });
        }

        return list.map(en => {
            let verifiedItemPaid = 0;
            if (en.amountPaid !== undefined && en.amountPaid !== null && Number(en.amountPaid) !== 0) {
                verifiedItemPaid = Number(en.amountPaid);
            } else if (en.transactionId === student.transactionId || list.length === 1) {
                verifiedItemPaid = Number(student.amountPaid) || 0;
            }

            return {
                ...en,
                courseFee: Number(en.courseFee) || Number(student.totalFee) || 0,
                amountPaid: verifiedItemPaid,
                transactionId: en.transactionId || student.transactionId || "UTR-PENDING",
                enrolledAt: en.enrolledAt || student.createdAt
            };
        });
    }, []);

    const analyzeFinances = useCallback((studentList) => {
        let grossTotal = 0;
        const history = {};
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        let earliestDate = new Date();

        studentList.forEach(s => {
            const enrolls = getNormalizedEnrollments(s);
            enrolls.forEach(en => {
                const dateObj = new Date(en.enrolledAt || s.createdAt);
                if (!isNaN(dateObj.getTime()) && dateObj < earliestDate) {
                    earliestDate = dateObj;
                }
            });
        });

        let startYear = earliestDate.getFullYear();
        let startMonth = earliestDate.getMonth() + 1;

        while (startYear < now.getFullYear() || (startYear === now.getFullYear() && startMonth <= (now.getMonth() + 1))) {
            const monthKey = `${startYear}-${String(startMonth).padStart(2, '0')}`;
            history[monthKey] = 0;
            startMonth++;
            if (startMonth > 12) { startMonth = 1; startYear++; }
        }

        studentList.forEach(s => {
            const enrolls = getNormalizedEnrollments(s);
            enrolls.forEach(en => {
                grossTotal += (Number(en.amountPaid) || 0);
                const dateObj = new Date(en.enrolledAt || s.createdAt);
                if (!isNaN(dateObj.getTime())) {
                    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
                    if (history[monthKey] !== undefined) {
                        history[monthKey] += (Number(en.amountPaid) || 0);
                    }
                }
            });
        });

        setMonthlyHistory(history);
        setFinances({
            total: grossTotal,
            pendingAdjustments: studentList.filter(s => s.discountRequest?.status === 'PENDING').length
        });

        if (!selectedMonth) setSelectedMonth(currentMonthKey);
    }, [getNormalizedEnrollments, selectedMonth]);

    const topCoursesData = useMemo(() => {
        const stats = {};
        students.forEach(student => {
            const enrolls = getNormalizedEnrollments(student);
            enrolls.forEach(en => {
                if (!en.course) return;
                if (!stats[en.course]) {
                    stats[en.course] = { enrollments: 0, revenue: 0 };
                }
                stats[en.course].enrollments += 1;
                stats[en.course].revenue += (Number(en.amountPaid) || 0);
            });
        });

        return Object.entries(stats)
            .map(([courseName, data]) => ({ courseName, ...data }))
            .sort((a, b) => b.enrollments - a.enrollments)
            .slice(0, 4);
    }, [students, getNormalizedEnrollments]);

    const calculateAggregateLedger = useCallback((student) => {
        const enrolls = getNormalizedEnrollments(student);
        const total = enrolls.reduce((acc, curr) => acc + (Number(curr.courseFee) || 0), 0);
        const paid = enrolls.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
        const due = total - paid;
        return { total, paid, due: due > 0 ? due : 0 };
    }, [getNormalizedEnrollments]);

    const fetchEverything = useCallback(async () => {
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        const latencyStart = performance.now();
        const safeFetch = async (url) => {
            try {
                const res = await axios.get(url, { headers });
                return res.data.data || res.data.materials || res.data.coupons || res.data.logs || res.data;
            } catch (err) {
                return [];
            }
        };

        try {
            setAvailableBatches(await safeFetch(`${API_URL}/admin/batches/active`));
            if (hasAccess('registrations')) {
                const sData = await safeFetch(`${API_URL}/admin/registrations`);
                setStudents(sData);
                analyzeFinances(sData);
            }
            if (hasAccess('enquiries')) setEnquiries(await safeFetch(`${API_URL}/admin/enquiries`));
            if (hasAccess('coupons')) setCoupons(await safeFetch(`${API_URL}/admin/coupons`));
            if (hasAccess('logs')) {
                const lData = await safeFetch(`${API_URL}/admin/audit-logs`);
                setAuditLogs(lData.logs || lData);
            }
            setApiLatency(`${Math.round(performance.now() - latencyStart)}ms`);
        } catch (e) {
            console.error(e);
        }
    }, [token, analyzeFinances]);

    useEffect(() => {
        fetchEverything();
    }, [fetchEverything]);

    const handleAuthorizeBatch = async (studentId, batchId, studentName) => {
        if (!batchId) return;
        try {
            await axios.patch(`${API_URL}/admin/registrations/${studentId}/authorize-batch`, { batchId, targetName: studentName }, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast("STREAM AUTHORIZED");
            setBatchModal({ show: false, student: null, filteredBatches: [] });
            fetchEverything();
        } catch (err) {
            triggerToast("AUTHORIZATION FAILED");
        }
    };

    const handleApprovePayment = async (studentId, studentName, transactionId) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.patch(`${API_URL}/admin/approve-student/${studentId}`, { targetName: studentName, transactionId }, { headers });
            await axios.patch(`${API_URL}/admin/registrations/${studentId}/grant-access`, {}, { headers });
            triggerToast("PAYMENT VERIFIED");
            await fetchEverything();
        } catch (err) {
            triggerToast("VERIFICATION FAILED");
        }
    };

    const handleForceUnlock = async (studentId) => {
        try {
            await axios.patch(`${API_URL}/admin/registrations/${studentId}/grant-access`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            triggerToast("PORTAL GRANTED FOR TOKEN PAYMENT");
            fetchEverything();
        } catch (err) {
            triggerToast("PORTAL UNLOCK FAILED");
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
    
        const newCode = (couponForm.code || "").toUpperCase().trim();
        if (!newCode) return triggerToast("ENTER A COUPON CODE");
        if (!couponForm.discountValue || Number(couponForm.discountValue) <= 0) {
            return triggerToast("ENTER A VALID DISCOUNT VALUE");
        }
        if (!couponForm.maxUsage || Number(couponForm.maxUsage) <= 0) {
            return triggerToast("ENTER MAX USAGE LIMIT");
        }
    
        const codeExists = Array.isArray(coupons) && coupons.some(
            c => (c?.code || "").toUpperCase().trim() === newCode
        );
    
        if (codeExists) {
            triggerToast("COUPON CODE ALREADY EXISTS");
            return;
        }
    
        try {
            const rawApi = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
            const API_BASE = rawApi.endsWith('/api') ? rawApi : `${rawApi}/api`;
    
            const payload = {
                ...couponForm,
                code: newCode,
                maxUsage: Number(couponForm.maxUsage),
                discountValue: Number(couponForm.discountValue),
                courseCode: couponForm.courseCode || "ALL"
            };
    
            const res = await axios.post(`${API_BASE}/admin/coupons`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (res.data?.success || res.status === 200 || res.status === 201) {
                triggerToast("COUPON ACTIVATED SUCCESSFULLY");
                setCouponForm({
                    code: "",
                    description: "",
                    maxUsage: "",
                    isActive: true,
                    validFrom: "",
                    validTo: "",
                    courseCode: "ALL",
                    discountType: "PERCENTAGE",
                    discountValue: ""
                });
                fetchEverything();
            }
        } catch (err) {
            console.error("Coupon deploy error:", err);
            triggerToast(err.response?.data?.message?.toUpperCase() || "DEPLOYMENT FAILED");
        }
    };

    const generateLocalCashTxn = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() >= 3 ? `${year}-${(year + 1).toString().slice(-2)}` : `${year - 1}-${year.toString().slice(-2)}`;
        const randomNum = Math.floor(Math.random() * 900) + 100;
        return `ECA/CASH/${month}/${randomNum}`;
    };

    const handlePaymentModeSelect = (newMode) => {
        setPaymentModal(prev => ({
            ...prev,
            mode: newMode,
            transactionId: newMode === 'Cash' ? generateLocalCashTxn() : ""
        }));
    };

    const handleLedgerSync = async (e) => {
        e.preventDefault();
        const { student, amount, mode, transactionId, courseTitle } = paymentModal;
        const amt = Number(amount);
        if (!amt || amt <= 0) return triggerToast("ENTER VALID AMOUNT");

        try {
            await axios.patch(`${API_URL}/admin/registrations/${student._id}/update-payment`,
                { courseTitle, amountPaid: amt, paymentLog: { amount: amt, mode, transactionId, date: new Date() } },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const ledger = calculateAggregateLedger(student);
            if (amt >= ledger.due && !student.isApproved) {
                await axios.patch(`${API_URL}/admin/registrations/${student._id}/grant-access`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            triggerToast("LEDGER SYNCED");
            setPaymentModal({ show: false, student: null, amount: "", mode: "Cash", transactionId: "", courseTitle: "" });
            fetchEverything();
        } catch (err) {
            triggerToast("SYNC FAILED");
        }
    };

    const handleEnquiryStatusUpdate = async (id, currentStatus, studentName) => {
        try {
            await axios.patch(`${API_URL}/inquiry/${id}`, { isContacted: !currentStatus, targetName: studentName }, { headers: { Authorization: `Bearer ${token}` } });
            triggerToast(!currentStatus ? "CONTACTED" : "PENDING");
            fetchEverything();
        } catch (err) {
            triggerToast("FAILED");
        }
    };

    const handleSendReport = async () => {
        setIsSendingReport(true);
        try {
            await axios.post(`${API_URL}/admin/reports/dispatch-founder-report`, {
                targetMonth: selectedMonth,
                totalRevenue: monthlyHistory[selectedMonth] || 0,
                topCourses: topCoursesData,
                totalStudents: students.length,
                pendingQueue: finances.pendingAdjustments
            }, { headers: { Authorization: `Bearer ${token}` } });

            triggerToast("REPORT DISPATCHED TO FOUNDER");
        } catch (err) {
            triggerToast("FAILED TO DISPATCH REPORT");
        } finally {
            setIsSendingReport(false);
        }
    };

    const renderSourceBadge = (src) => {
        const norm = src?.toLowerCase() || "";
        if (norm.includes("bot") || norm.includes("ai")) {
            return <span className="px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full font-black text-[9px] border border-sky-500/30 uppercase italic inline-flex items-center gap-1.5"><FiMessageCircle size={11} /> AI Chatbot</span>;
        }
        if (norm.includes("facebook") || norm.includes("meta")) {
            return <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full font-black text-[9px] border border-indigo-500/30 uppercase italic inline-flex items-center gap-1.5"><FiFacebook size={11} /> Facebook Ads</span>;
        }
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full font-black text-[9px] border border-emerald-500/30 uppercase italic inline-flex items-center gap-1.5"><FiGlobe size={11} /> Website Portal</span>;
    };

    const renderOverview = () => {
        let currentRevenue = selectedMonth ? (monthlyHistory[selectedMonth] || 0) : 0;
        let [y, m] = selectedMonth ? selectedMonth.split('-').map(Number) : [2026, 1];
        m -= 1; if (m === 0) { m = 12; y -= 1; }
        let prevRevenue = monthlyHistory[`${y}-${String(m).padStart(2, '0')}`] || 0;

        return (
            <div className="space-y-8 text-left">
                {/* 1. TOP METRICS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-[#1A5F7A] to-[#0A192F] text-white p-7 rounded-3xl shadow-xl relative overflow-hidden border border-slate-700/60 border-b-4 border-b-[#F37021]">
                        <FiDollarSign className="absolute -right-3 -bottom-3 text-8xl opacity-10" />
                        <p className="text-[10px] uppercase font-black text-slate-300 tracking-wider mb-1">Gross Collection (All Time)</p>
                        <div className="text-3xl lg:text-4xl font-black italic tracking-tight">₹{finances.total.toLocaleString()}</div>
                    </div>

                    <div className="bg-[#0A192F]/80 backdrop-blur-md p-7 rounded-3xl border border-slate-800 flex flex-col justify-between shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-orange-500/10 text-[#F37021] rounded-xl border border-orange-500/20"><FiActivity size={18} /></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Monthly Revenue</p>
                            </div>
                            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="text-[10px] font-black bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 uppercase outline-none focus:border-[#F37021]">
                                {Object.keys(monthlyHistory).sort().reverse().map(mKey => <option key={mKey} value={mKey}>{mKey}</option>)}
                            </select>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-white italic">₹{currentRevenue.toLocaleString()}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold text-[#F37021] uppercase">Verified Credits</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-[9px] font-black uppercase text-slate-400">Prev: <span className={currentRevenue >= prevRevenue ? "text-emerald-400" : "text-red-400"}>₹{prevRevenue.toLocaleString()}</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0A192F]/80 backdrop-blur-md p-7 rounded-3xl border border-slate-800 flex items-center gap-5 shadow-xl">
                        <div className="p-3.5 bg-sky-500/10 text-[#1A5F7A] rounded-2xl border border-sky-500/20"><FiUsers size={26} className="text-sky-400" /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Student Registry</p>
                            <div className="text-2xl font-black text-white italic">{students.length} Students</div>
                        </div>
                    </div>

                    <div className="bg-[#0A192F]/80 backdrop-blur-md p-7 rounded-3xl border border-dashed border-red-500/40 flex items-center gap-5 shadow-xl bg-red-950/10">
                        <div className="p-3.5 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 animate-pulse"><FiAlertCircle size={26} /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Action Queue</p>
                            <div className="text-2xl font-black text-red-400 italic">{finances.pendingAdjustments} Alerts</div>
                        </div>
                    </div>
                </div>

                {/* --- TIME-SERIES & DEEP ML ANALYTICS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Time-Series Trend */}
                    <div className="lg:col-span-2 bg-[#0A192F]/80 backdrop-blur-md rounded-3xl p-7 border border-slate-800 shadow-xl flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h4 className="font-black text-white text-sm uppercase tracking-wide italic flex items-center gap-2">
                                    <FiTrendingUp className="text-[#F37021]" /> Time-Series Revenue Trend
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Monthly collection history across chronological time-buckets.</p>
                            </div>
                            <span className="bg-orange-500/10 text-[#F37021] border border-orange-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                                Live Stream
                            </span>
                        </div>

                        <div className="h-44 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
                            {Object.keys(monthlyHistory).length > 0 ? (
                                Object.entries(monthlyHistory).map(([month, rev], idx) => {
                                    const maxVal = Math.max(...Object.values(monthlyHistory), 1000);
                                    const heightPercent = Math.max((rev / maxVal) * 100, 12);
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                                            <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[8px] font-black px-2.5 py-1 rounded-md uppercase whitespace-nowrap shadow-md pointer-events-none z-10 border border-slate-800">
                                                {month}: ₹{rev.toLocaleString()}
                                            </div>
                                            <div
                                                className="w-full bg-[#1A5F7A] group-hover:bg-[#F37021] rounded-t-lg transition-all duration-300 shadow-sm"
                                                style={{ height: `${heightPercent}%` }}
                                            />
                                            <span className="text-[8px] font-black text-slate-500 uppercase truncate w-full text-center">
                                                {month.split('-')[1]}M
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px] font-black uppercase">
                                    Waiting for telemetry entries...
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-slate-400 uppercase">
                            <span>Timeline Origin</span>
                            <span className="text-[#F37021] font-black">Current Period ({selectedMonth})</span>
                        </div>
                    </div>

                    {/* Deep ML Analytics */}
                    <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl p-7 border border-slate-800 shadow-xl flex flex-col justify-between">
                        <div>
                            <h4 className="font-black text-white text-sm uppercase tracking-wide italic flex items-center gap-2">
                                <FiCpu className="text-[#F37021]" /> Deep ML Analytics
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Neural classification telemetry.</p>
                        </div>

                        <div className="space-y-4 my-5">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-300 mb-1">
                                    <span>Positive Sentiment</span>
                                    <span className="text-emerald-400 font-bold">{mlOverviewStats.positive} Leads</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${students.length ? (mlOverviewStats.positive / students.length) * 100 : 0}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-300 mb-1">
                                    <span>Neutral Sentiment</span>
                                    <span className="text-slate-400 font-bold">{mlOverviewStats.neutral} Leads</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                    <div className="bg-slate-500 h-full rounded-full transition-all duration-500" style={{ width: `${students.length ? (mlOverviewStats.neutral / students.length) * 100 : 0}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-300 mb-1">
                                    <span>Negative / Urgent</span>
                                    <span className="text-red-400 font-bold">{mlOverviewStats.negative} Leads</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                    <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${students.length ? (mlOverviewStats.negative / students.length) * 100 : 0}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
                            <div>
                                <span className="text-[8px] font-black text-[#F37021] uppercase block tracking-wider">Avg Conversion Score</span>
                                <span className="text-2xl font-black text-white italic">{mlOverviewStats.avgProb}%</span>
                            </div>
                            <FiActivity className="text-[#F37021] text-2xl animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* 2. LIVE OPTIMIZATION ARCHITECTURE TRACE */}
                <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl p-7 border border-slate-800 shadow-xl">
                    <div className="mb-5">
                        <h4 className="font-black text-white text-sm uppercase tracking-wide italic flex items-center gap-2">
                            <FiCpu className="text-[#F37021]" /> Live Optimization Architecture Trace
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Production network compilation delays and browser layout speeds.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                        {webPerformanceMetrics.map((item, idx) => (
                            <div key={idx} className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col justify-between">
                                <span className="text-[9px] font-black text-slate-400 uppercase leading-normal tracking-wide">{item.label}</span>
                                <div className="flex justify-between items-baseline mt-4 border-t pt-3 border-slate-800">
                                    <span className="text-2xl font-black text-white tracking-tight italic">{item.value}</span>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${item.color}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. MARKET INTELLIGENCE & REPORT DISPATCH */}
                <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl p-7 border border-slate-800 shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-slate-800">
                        <div>
                            <h4 className="font-black text-white text-sm uppercase tracking-wide italic flex items-center gap-2">
                                <FiTrendingUp className="text-[#F37021]" /> Market Intelligence
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Highest performing programs by enrollment volume.</p>
                        </div>
                        {(userRole === 'founder' || userRole === 'admin') && (
                            <button
                                onClick={handleSendReport}
                                disabled={isSendingReport}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all border ${isSendingReport
                                        ? "bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed"
                                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
                                    }`}
                            >
                                <FiSend /> {isSendingReport ? "Transmitting..." : "Dispatch Founder Report"}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {topCoursesData.length > 0 ? topCoursesData.map((course, idx) => (
                            <div key={idx} className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 relative hover:border-[#F37021] transition-all">
                                <div className="absolute -top-2.5 -left-2.5 w-7 h-7 bg-slate-950 rounded-full border border-slate-700 flex items-center justify-center shadow-md">
                                    <FiAward className={idx === 0 ? "text-yellow-400" : idx === 1 ? "text-slate-400" : "text-amber-500"} size={14} />
                                </div>
                                <h5 className="font-black text-white text-xs uppercase italic mt-1 leading-tight min-h-[32px]">{course.courseName}</h5>
                                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Enrolls</p>
                                        <p className="font-black text-[#F37021] text-base">{course.enrollments}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Revenue</p>
                                        <p className="font-black text-white text-base">₹{course.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                                <span className="text-[10px] font-black uppercase tracking-widest block">Awaiting Sales Data</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. ACTIVE BROADCAST STREAMS */}
                <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl p-7 border border-slate-800 shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-slate-800">
                        <div>
                            <h4 className="font-black text-white text-sm uppercase tracking-wide italic flex items-center gap-2">
                                <FiClock className="text-[#F37021]" /> Active Broadcast Streams
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Currently running academic batches across the network.</p>
                        </div>
                        <span className="bg-orange-500/10 text-[#F37021] px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase border border-orange-500/30">
                            {availableBatches.length} Live Operations
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {availableBatches.length > 0 ? availableBatches.map(batch => (
                            <div key={batch._id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-orange-500/50 transition-all flex flex-col justify-between h-full shadow-inner">
                                <div>
                                    <div className="flex justify-between items-start mb-2.5">
                                        <span className="bg-[#1A5F7A] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-xs">{batch.batchCode}</span>
                                        <span className="text-[9px] font-bold text-slate-300 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                                            <FiClock size={10} className="text-[#F37021]" /> {batch.startTime}
                                        </span>
                                    </div>
                                    <div className="font-black text-xs text-white uppercase leading-tight hover:text-[#F37021] transition-colors">
                                        {batch.courseName || batch.courseId?.replace(/-/g, ' ')}
                                    </div>
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-3 pt-2.5 border-t border-slate-800/80 italic flex items-center gap-1.5">
                                    <FiUsers size={10} className="text-slate-500" /> By {batch.instructor || 'Instructor TBD'}
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full p-8 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                                <FiAlertCircle size={24} className="mb-2 opacity-40 text-slate-400 mx-auto" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">No Academic Streams Online</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderRegistry = () => (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h3 className="text-2xl font-black text-white uppercase italic">Student Registry</h3>
                <div className="flex items-center gap-3 w-full max-w-xl">
                    <div className="relative flex-1 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search Identity or UTR..."
                            className="w-full pl-11 pr-4 py-3 bg-[#0A192F] border border-slate-800 text-white rounded-2xl outline-none font-bold text-xs focus:border-[#F37021] shadow-inner transition-all placeholder:text-slate-500"
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-[#0A192F] border border-slate-800 rounded-2xl px-4 py-3 font-black text-xs uppercase outline-none text-slate-200 cursor-pointer shadow-md focus:border-[#F37021]"
                        value={filterApproved}
                        onChange={e => setFilterApproved(e.target.value)}
                    >
                        <option value="all">All Registry</option>
                        <option value="approved">Approved ERP Only</option>
                        <option value="pending">Pending Access</option>
                    </select>
                </div>
            </div>

            <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-800 overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                    <thead className="bg-slate-950 font-black uppercase text-slate-400 border-b border-slate-800 text-[10px] tracking-wider">
                        <tr>
                            <th className="p-6">Profile Identity</th>
                            <th>Financial Standing</th>
                            <th>Portal Status</th>
                            <th className="pr-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-xs">
                        {students.filter(s => {
                            const matchSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone?.includes(searchQuery);
                            const matchFilter = filterApproved === "all" ? true : filterApproved === "approved" ? s.isApproved : !s.isApproved;
                            return matchSearch && matchFilter;
                        }).map(student => {
                            const ledger = calculateAggregateLedger(student);
                            const enrollments = getNormalizedEnrollments(student);
                            const isExpanded = expandedStudent === student._id;

                            const studentMatchingBatches = availableBatches.filter(batch =>
                                enrollments.some(en => isCourseBatchMatch(en.course, batch.courseId, batch.courseName))
                            );

                            return (
                                <React.Fragment key={student._id}>
                                    <tr className={`group transition-all ${isExpanded ? 'bg-slate-900/90' : 'hover:bg-slate-900/50'}`}>
                                        <td className="p-6">
                                            <div className="font-black text-white uppercase italic text-sm tracking-wide flex items-center justify-between">
                                                <span>{student.name}</span>
                                                <button onClick={() => handleOpenTracer(student.phone)} className="px-2.5 py-0.5 bg-orange-500/10 text-[#F37021] rounded-lg font-black text-[8px] uppercase border border-orange-500/30 flex items-center gap-1 hover:bg-[#F37021] hover:text-white transition-all">
                                                    <FiCpu size={10} /> Trace
                                                </button>
                                            </div>
                                            <div className="text-slate-400 font-bold text-[10px] uppercase mt-1 italic flex items-center gap-1.5 flex-wrap">
                                                <span>{enrollments.length} Enrollment(s)</span>
                                                <span className="text-slate-600">•</span>
                                                <span>{student.phone}</span>
                                                <span className="text-slate-600">•</span>
                                                <span className="flex items-center gap-1 text-slate-300">
                                                    <FiShield size={10} className={student.aadhaarNo || student.aadhar ? "text-emerald-400" : "text-slate-500"} />
                                                    {student.aadhaarNo || student.aadhar ? "[Aadhaar Redacted]" : "Aadhaar Pending"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${student.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                                        student.sentiment === 'negative' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                                                    }`}>
                                                    Sentiment: {student.sentiment || 'Neutral'}
                                                </span>
                                                <span className="bg-orange-500/10 text-[#F37021] border border-orange-500/30 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider">
                                                    Conv: {student.conversionProbability || 50}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-black text-white text-sm">
                                                ₹{ledger.paid.toLocaleString()} <span className="text-slate-500 text-xs font-normal">/ ₹{ledger.total.toLocaleString()}</span>
                                            </div>
                                            <div className={`text-[10px] uppercase font-black italic mt-1 ${ledger.due > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {ledger.due > 0 ? `DUE: ₹${ledger.due.toLocaleString()}` : 'CLEARED'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1.5">
                                                {student.isApproved ? (
                                                    <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md border border-emerald-500/30 text-[9px] font-black w-fit uppercase flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Portal Active
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-md border border-red-500/30 text-[9px] font-black uppercase flex items-center gap-1">
                                                            Inactive
                                                        </span>
                                                        <button
                                                            onClick={() => handleForceUnlock(student._id)}
                                                            className="bg-slate-900 border border-slate-700 text-[#F37021] hover:bg-[#F37021] hover:text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                                                        >
                                                            <FiUnlock size={10} /> Unlock
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setExpandedStudent(isExpanded ? null : student._id)}
                                                    className={`p-2 rounded-xl border transition-all ${isExpanded ? 'bg-[#F37021] text-white border-orange-500 rotate-180' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'}`}
                                                >
                                                    <FiChevronDown size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setBatchModal({ show: true, student, filteredBatches: studentMatchingBatches })}
                                                    className="w-9 h-9 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl flex items-center justify-center hover:bg-[#1A5F7A] hover:text-white transition-all shadow-md"
                                                    title="Link Batch"
                                                >
                                                    <FiUserCheck size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setPaymentModal({ show: true, student, amount: "", mode: "Cash", transactionId: generateLocalCashTxn(), courseTitle: enrollments[0]?.course || "" })}
                                                    className="w-9 h-9 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl flex items-center justify-center hover:bg-[#1A5F7A] hover:text-white transition-all shadow-md"
                                                    title="Ledger Sync"
                                                >
                                                    <FiCreditCard size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan="4" className="p-0 bg-slate-950/60">
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0 }} className="overflow-hidden border-y border-slate-800 p-6 space-y-3">
                                                        {enrollments.map((en, i) => (
                                                            <div key={i} className="bg-[#0A192F] p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/20 text-[#F37021] font-black rounded-lg flex items-center justify-center text-xs">
                                                                        {i + 1}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-black text-white uppercase italic text-sm">{en.course}</div>
                                                                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 flex items-center gap-2">
                                                                            <span>UTR: <span className="text-slate-300 font-black">{en.transactionId}</span></span>
                                                                            <span>•</span>
                                                                            <span>Status: <span className="text-sky-400 font-black">{en.paymentStatus}</span></span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="text-right">
                                                                        <span className="text-[8px] uppercase text-slate-500 font-black block">Paid / Fee</span>
                                                                        <span className="text-sm font-black text-white">₹{(en.amountPaid || 0).toLocaleString()} <span className="text-slate-500 text-xs font-normal">/ ₹{en.courseFee?.toLocaleString()}</span></span>
                                                                    </div>
                                                                    {['PENDING', 'PARTIALLY_PAID'].includes(en.paymentStatus?.toUpperCase()) ? (
                                                                        <button onClick={() => handleApprovePayment(student._id, student.name, en.transactionId)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 flex items-center gap-1 shadow-md">
                                                                            <FiShield /> Verify
                                                                        </button>
                                                                    ) : (
                                                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-3 py-1 rounded-lg flex items-center gap-1">
                                                                            <FiCheckCircle /> Verified
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
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

    const renderCoupons = () => {
        const isDuplicateCoupon = Boolean(
            couponForm.code?.trim() &&
            Array.isArray(coupons) &&
            coupons.some(c => (c?.code || "").toUpperCase().trim() === couponForm.code.trim().toUpperCase())
        );
    
        return (
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-800 overflow-hidden border-t-8 border-[#1A5F7A]">
                    <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
                        <div className="p-2.5 bg-orange-500/10 text-[#F37021] rounded-xl border border-orange-500/20"><FiTag size={20}/></div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase italic leading-none">Coupon Deployment Engine</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Generate and distribute tuition benefits</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleCreateCoupon} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Activation Code</label>
                                <div className="relative">
                                    <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        required 
                                        className={`w-full pl-11 pr-4 py-3.5 bg-slate-900/80 border rounded-2xl font-black uppercase text-sm text-white outline-none focus:border-[#F37021] transition-all shadow-inner ${
                                            isDuplicateCoupon ? 'border-red-500 ring-1 ring-red-500/50' : 'border-slate-800'
                                        }`} 
                                        placeholder="E.g. DIWALI2026" 
                                        value={couponForm.code} 
                                        onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} 
                                    />
                                </div>
                                {isDuplicateCoupon && (
                                    <p className="text-red-400 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1">
                                        <FiAlertCircle /> Code already exists in database
                                    </p>
                                )}
                            </div>
    
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Usage Limit</label>
                                <div className="relative">
                                    <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        required 
                                        type="number" 
                                        min="1" 
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl font-bold text-sm text-white outline-none focus:border-[#F37021] transition-all shadow-inner" 
                                        placeholder="100" 
                                        value={couponForm.maxUsage} 
                                        onChange={e => setCouponForm({...couponForm, maxUsage: e.target.value})} 
                                    />
                                </div>
                            </div>
                        </div>
    
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Campaign Description</label>
                            <textarea 
                                className="w-full p-4 bg-slate-900/80 border border-slate-800 rounded-2xl font-bold text-xs text-white outline-none focus:border-[#F37021] min-h-[80px] resize-none transition-all shadow-inner placeholder:text-slate-600" 
                                placeholder="Optional summary of this promotion..." 
                                value={couponForm.description} 
                                onChange={e => setCouponForm({...couponForm, description: e.target.value})} 
                            />
                        </div>
    
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Start Date</label>
                                <input 
                                    required 
                                    type="date" 
                                    className="w-full p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl font-bold text-xs outline-none focus:border-[#F37021] text-white shadow-inner" 
                                    value={couponForm.validFrom} 
                                    onChange={e => setCouponForm({...couponForm, validFrom: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Expiry Date</label>
                                <input 
                                    required 
                                    type="date" 
                                    className="w-full p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl font-bold text-xs outline-none focus:border-[#F37021] text-white shadow-inner" 
                                    value={couponForm.validTo} 
                                    onChange={e => setCouponForm({...couponForm, validTo: e.target.value})} 
                                />
                            </div>
                        </div>
    
                        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-[#F37021] ml-1">Scope</label>
                                <select 
                                    className="w-full p-3.5 bg-[#0A192F] border border-slate-800 rounded-xl font-bold text-xs outline-none cursor-pointer text-slate-200 focus:border-[#F37021]" 
                                    value={couponForm.courseCode} 
                                    onChange={e => setCouponForm({...couponForm, courseCode: e.target.value})}
                                >
                                    <option value="ALL">All Programs (Global)</option>
                                    {allCourses.map(c => <option key={c.id || c.title} value={c.title}>{c.title}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-[#F37021] ml-1">Mode</label>
                                <div className="flex bg-[#0A192F] p-1 rounded-xl border border-slate-800">
                                    <button 
                                        type="button" 
                                        onClick={() => setCouponForm({...couponForm, discountType: 'PERCENTAGE'})} 
                                        className={`flex-1 py-2.5 rounded-lg font-black text-[10px] uppercase transition-all ${
                                            couponForm.discountType === 'PERCENTAGE' ? 'bg-[#1A5F7A] text-white shadow-xs' : 'text-slate-500'
                                        }`}
                                    >
                                        % Percent
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setCouponForm({...couponForm, discountType: 'FLAT'})} 
                                        className={`flex-1 py-2.5 rounded-lg font-black text-[10px] uppercase transition-all ${
                                            couponForm.discountType === 'FLAT' ? 'bg-[#1A5F7A] text-white shadow-xs' : 'text-slate-500'
                                        }`}
                                    >
                                        ₹ Flat
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-white ml-1">Value ({couponForm.discountType === 'PERCENTAGE' ? '%' : '₹'})</label>
                                <input 
                                    required 
                                    type="number" 
                                    min="1" 
                                    className="w-full p-3 bg-[#0A192F] border border-slate-800 rounded-xl font-black text-xl text-center outline-none focus:border-[#F37021] text-white shadow-inner" 
                                    placeholder="0" 
                                    value={couponForm.discountValue} 
                                    onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} 
                                />
                            </div>
                        </div>
    
                        <button 
                            type="submit"
                            className="w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex justify-center items-center gap-2 bg-[#F37021] hover:bg-orange-600 active:scale-95 shadow-orange-950/40 cursor-pointer"
                        >
                            <FiCheckCircle size={16} /> Deploy Coupon
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const renderLogs = () => (
        <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-800 overflow-hidden overflow-x-auto text-left">
            <table className="w-full min-w-[750px] text-xs">
                <thead className="bg-slate-950 text-[10px] font-black uppercase border-b border-slate-800 text-slate-400">
                    <tr>
                        <th className="p-5 pl-8">Operator</th>
                        <th>Action</th>
                        <th>Target</th>
                        <th className="pr-8 text-right">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-bold">
                    {auditLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-5 pl-8 text-sky-400 font-black uppercase italic">{log.performedBy}</td>
                            <td className="uppercase text-slate-300">{log.action}</td>
                            <td className="italic text-slate-400 font-black">{log.targetName}</td>
                            <td className="pr-8 text-right text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#070D1D] font-sans overflow-hidden text-left relative text-slate-200 w-full selection:bg-[#F37021]/30">

            {/* AMBIENT BACKGROUND GLOWS */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ y: -50, x: "-50%", opacity: 0 }} animate={{ y: 24, x: "-50%", opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed left-1/2 z-[999] bg-[#0A192F] text-white px-6 py-3.5 rounded-2xl shadow-2xl font-black border-b-4 border-[#F37021] border border-slate-700 uppercase text-xs flex items-center gap-2.5">
                        <FiZap className="text-[#F37021]" /> {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SIDEBAR */}
            <aside className={`fixed lg:relative z-[200] h-full w-72 bg-[#0A192F] text-white p-6 flex flex-col shadow-2xl border-r border-slate-800 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-800">
                    <div>
                        <h1 className="font-black text-[#F37021] italic text-2xl uppercase tracking-tighter leading-none">Expert Academy</h1>
                        <span className="text-[9px] text-slate-400 tracking-[0.3em] font-black uppercase block mt-1">Admin Central</span>
                    </div>
                    <button className="lg:hidden text-slate-400 p-1 hover:text-white" onClick={() => setIsSidebarOpen(false)}><FiX size={22} /></button>
                </div>

                <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto no-scrollbar pr-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1 ml-3">Main Menu</p>
                    {hasAccess('overview') && <SidebarBtn active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} icon={<FiGrid />} label="Dashboard" />}
                    {hasAccess('enquiries') && <SidebarBtn active={activeTab === 'enquiries'} onClick={() => handleTabChange('enquiries')} icon={<FiMessageSquare />} label="Web Leads" />}
                    {hasAccess('whatsapp') && <SidebarBtn active={activeTab === 'whatsapp'} onClick={() => handleTabChange('whatsapp')} icon={<FiMessageCircle />} label="WhatsApp Chat" />}
                    {hasAccess('registrations') && <SidebarBtn active={activeTab === 'registrations'} onClick={() => handleTabChange('registrations')} icon={<FiUsers />} label="Registry" />}

                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-5 mb-1 ml-3">LMS Controls</p>
                    {hasAccess('batches') && <SidebarBtn active={activeTab === 'batches'} onClick={() => handleTabChange('batches')} icon={<FiClock />} label="Batches" />}
                    {hasAccess('lectures') && <SidebarBtn active={activeTab === 'lectures'} onClick={() => handleTabChange('lectures')} icon={<FiVideo />} label="Live Class" />}
                    {hasAccess('materials') && <SidebarBtn active={activeTab === 'materials'} onClick={() => handleTabChange('materials')} icon={<FiBookOpen />} label="Vault" />}
                    {hasAccess('quizzes') && <SidebarBtn active={activeTab === 'quizzes'} onClick={() => handleTabChange('quizzes')} icon={<FiEdit3 />} label="Examinations" />}
                    {hasAccess('certificates') && <SidebarBtn active={activeTab === 'certificates'} onClick={() => handleTabChange('certificates')} icon={<FiAward />} label="Certificates" />}

                    {userRole === 'founder' && (
                        <>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-5 mb-1 ml-3">Admin Tools</p>
                            {hasAccess('coupons') && <SidebarBtn active={activeTab === 'coupons'} onClick={() => handleTabChange('coupons')} icon={<FiTag />} label="Coupons" />}
                            {hasAccess('logs') && <SidebarBtn active={activeTab === 'logs'} onClick={() => handleTabChange('logs')} icon={<FiActivity />} label="Audit Logs" />}
                        </>
                    )}
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <header className="bg-[#0A192F]/90 backdrop-blur-md h-20 px-8 flex items-center justify-between border-b border-slate-800 shadow-sm sticky top-0 z-[150]">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden text-white p-2 hover:bg-slate-800 rounded-xl" onClick={() => setIsSidebarOpen(true)}><FiMenu size={22} /></button>
                        <h2 className="font-black text-white text-base uppercase italic hidden sm:block tracking-wide">{activeTab.replace('-', ' ')}</h2>
                    </div>

                    {/* Global Search Bar */}
                    <div className="relative max-w-md w-full mx-4">
                        <div className="relative flex items-center">
                            <FiSearch className="absolute left-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Global Search (Students, Relatives, Web, Chats)..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-xl font-bold text-xs outline-none focus:border-[#F37021] transition-all shadow-inner placeholder:text-slate-500"
                                value={globalQuery}
                                onChange={e => setGlobalQuery(e.target.value)}
                            />
                            {isSearching && <span className="absolute right-3 text-[9px] font-black text-[#F37021] uppercase animate-pulse">Searching...</span>}
                        </div>

                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {searchResults && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-0 right-0 top-12 bg-[#0A192F] rounded-2xl shadow-2xl border border-slate-700 p-5 max-h-[400px] overflow-y-auto no-scrollbar z-[300]">
                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Intelligence Match</span>
                                        <button onClick={() => { setSearchResults(null); setGlobalQuery(""); }} className="text-slate-400 hover:text-red-400"><FiX size={15} /></button>
                                    </div>

                                    {searchResults.students?.length > 0 && (
                                        <div className="space-y-1.5">
                                            {searchResults.students.map(s => (
                                                <div key={s._id} onClick={() => { handleOpenTracer(s.phone); setSearchResults(null); }} className="p-3 bg-slate-900/90 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors flex justify-between items-center border border-slate-800">
                                                    <div>
                                                        <div className="font-black text-white text-xs uppercase">{s.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold">📞 {s.phone}</div>
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase bg-[#F37021] text-white px-2 py-0.5 rounded">Trace</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:block text-right pr-4 border-r border-slate-800">
                            <span className="text-white text-xs font-black uppercase block leading-tight">{userName}</span>
                            <span className="text-[9px] font-bold text-[#F37021] uppercase tracking-wider">{userRole}</span>
                        </div>
                        <button onClick={() => setLogoutModal(true)} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 active:scale-95 transition-all border border-red-500/20"><FiLogOut size={18} /></button>
                    </div>
                </header>

                <main className="p-6 lg:p-10 overflow-y-auto flex-1 no-scrollbar bg-[#070D1D]">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'registrations' && renderRegistry()}
                    {activeTab === 'coupons' && renderCoupons()}
                    {activeTab === 'logs' && renderLogs()}
                    {activeTab === 'enquiries' && (
                        <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-800 overflow-hidden overflow-x-auto text-left">
                            <table className="w-full min-w-[850px] text-xs">
                                <thead className="bg-slate-950 font-black uppercase text-slate-400 border-b border-slate-800 text-[10px]">
                                    <tr>
                                        <th className="p-5 pl-8">Lead Identity</th>
                                        <th>User Inquiry & Message</th>
                                        <th>Source</th>
                                        <th className="pr-8 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850 font-bold">
                                    {enquiries.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-slate-500 font-black uppercase tracking-wider">
                                                No website inquiries recorded.
                                            </td>
                                        </tr>
                                    ) : (
                                        enquiries.map(item => {
                                            const actualMessage = item.message && item.message.trim() !== ""
                                                ? item.message
                                                : item.course || "General Inquiry";

                                            return (
                                                <tr key={item._id} className="hover:bg-slate-900/50 transition-colors">
                                                    <td className="p-5 pl-8">
                                                        <div className="font-black text-white uppercase text-xs">{item.name}</div>
                                                        <div className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1.5 flex-wrap">
                                                            <span>📞 {item.phone}</span>
                                                            {item.email && (
                                                                <>
                                                                    <span className="text-slate-600">•</span>
                                                                    <span className="lowercase font-normal text-slate-400">{item.email}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="max-w-md pr-4">
                                                        <div className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-slate-200 font-semibold text-xs leading-relaxed">
                                                            "{actualMessage}"
                                                        </div>
                                                        {item.course && item.course !== "General Inquiry" && item.course !== actualMessage && (
                                                            <span className="text-[9px] font-black uppercase text-[#F37021] tracking-wider mt-1 block">
                                                                Track: {item.course}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{renderSourceBadge(item.source)}</td>
                                                    <td className="pr-8 text-right">
                                                        <button
                                                            onClick={() => handleEnquiryStatusUpdate(item._id, item.isContacted, item.name)}
                                                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ml-auto ${item.isContacted
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                                                                }`}
                                                            title={item.isContacted ? "Contacted" : "Mark as Contacted"}
                                                        >
                                                            {item.isContacted ? <FiCheckCircle size={16} /> : <FiPhoneCall size={14} />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeTab === 'whatsapp' && <WhatsAppLeads />}
                    {activeTab === 'batches' && <BatchScheduler />}
                    {activeTab === 'lectures' && <AddLecture />}
                    {activeTab === 'materials' && <AddMaterial />}
                    {activeTab === 'quizzes' && <QuizManager />}
                    {activeTab === 'certificates' && <AdminCertificates />}
                </main>
            </div>

            {/* NEURAL TRACER MODAL */}
            <AnimatePresence>
                {traceModal.show && (
                    <div className="fixed inset-0 z-[1100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0A192F] text-white rounded-3xl p-8 max-w-xl w-full border-t-8 border-[#1A5F7A] border border-slate-700 relative shadow-2xl max-h-[85vh] flex flex-col">
                            <button onClick={() => setTraceModal({ show: false, phone: null, data: null, loading: false })} className="absolute top-6 right-6 text-slate-400 hover:text-red-400"><FiX size={20} /></button>

                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2.5 bg-orange-500/10 text-[#F37021] rounded-xl border border-orange-500/20"><FiCpu size={22} /></div>
                                <div>
                                    <h3 className="text-base font-black text-white uppercase italic leading-tight">Neural Intelligence Tracer</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Target: {traceModal.phone}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 space-y-5 no-scrollbar">
                                {traceModal.loading ? (
                                    <div className="py-16 text-center font-black uppercase text-slate-500 text-xs animate-pulse">Tracing digital footprint...</div>
                                ) : traceModal.data ? (
                                    <>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                                                <span className="text-[8px] font-black text-slate-500 uppercase">Name</span>
                                                <div className="text-xs font-black text-white uppercase mt-0.5 truncate">{traceModal.data.profile.name}</div>
                                            </div>
                                            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                                                <span className="text-[8px] font-black text-slate-500 uppercase">Sentiment</span>
                                                <div className="text-xs font-black text-emerald-400 uppercase mt-0.5">{traceModal.data.profile.sentiment || 'Neutral'}</div>
                                            </div>
                                            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                                                <span className="text-[8px] font-black text-slate-500 uppercase">Conversion</span>
                                                <div className="text-xs font-black text-[#F37021] uppercase mt-0.5">{traceModal.data.profile.conversionProbability || 50}%</div>
                                            </div>
                                        </div>

                                        {traceModal.data.timeline && (
                                            <div>
                                                <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-wider mb-3 italic">Action Timeline</h4>
                                                <div className="space-y-2 border-l-2 border-slate-800 pl-3 ml-2">
                                                    {traceModal.data.timeline.map((event, idx) => (
                                                        <div key={idx} className="relative pb-2">
                                                            <div className="text-[9px] font-bold text-slate-500 uppercase">{new Date(event.timestamp).toLocaleString()}</div>
                                                            <div className="text-xs font-bold text-slate-200 bg-slate-900 p-2.5 rounded-xl border border-slate-800 mt-0.5">{event.content}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-12 text-center text-red-400 font-black uppercase text-xs">No records found.</div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* BATCH LINK MODAL */}
            <AnimatePresence>
                {batchModal.show && batchModal.student && (
                    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0A192F] text-white rounded-3xl p-8 max-w-md w-full border-t-8 border-[#F37021] border border-slate-700 relative shadow-2xl">
                            <button onClick={() => setBatchModal({ show: false, student: null, filteredBatches: [] })} className="absolute top-6 right-6 text-slate-400 hover:text-red-400"><FiX size={20} /></button>
                            <h3 className="text-lg font-black text-white uppercase italic mb-1">Stream Assignment</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-5">{batchModal.student.name}</p>

                            <div className="space-y-2.5 max-h-[280px] overflow-y-auto no-scrollbar">
                                {batchModal.filteredBatches.length > 0 ? (
                                    batchModal.filteredBatches.map(b => (
                                        <div key={b._id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                                            <div>
                                                <span className="bg-[#1A5F7A] text-white text-[8px] px-1.5 py-0.5 font-black uppercase rounded">{b.batchCode}</span>
                                                <p className="text-xs font-black text-white uppercase mt-0.5">{b.courseName || b.courseId}</p>
                                            </div>
                                            <button onClick={() => handleAuthorizeBatch(batchModal.student._id, b._id, batchModal.student.name)} className="bg-[#F37021] text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-all">Link</button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl text-xs font-bold uppercase">No matching batches found</div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* LEDGER SYNC MODAL */}
            <AnimatePresence>
                {paymentModal.show && paymentModal.student && (() => {
                    const ledger = calculateAggregateLedger(paymentModal.student);
                    const enrolls = getNormalizedEnrollments(paymentModal.student);
                    return (
                        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0A192F] text-white rounded-3xl p-8 max-w-md w-full border-t-8 border-[#1A5F7A] border border-slate-700">
                                <button onClick={() => setPaymentModal({ show: false, student: null, amount: "", mode: "Cash", transactionId: "", courseTitle: "" })} className="absolute top-6 right-6 text-slate-400 hover:text-red-400"><FiX size={20} /></button>
                                <h3 className="text-lg font-black text-white uppercase italic mb-1">Ledger Sync</h3>
                                <div className="rounded-2xl p-4 mb-5 border border-slate-800 flex justify-between items-center bg-slate-900">
                                    <div><p className="text-[8px] font-black text-slate-500 uppercase">Gross Total</p><div className="text-base font-black text-slate-200">₹{ledger.total.toLocaleString()}</div></div>
                                    <div className="text-right"><p className="text-[8px] font-black text-red-400 uppercase">Due</p><div className="text-lg font-black text-red-400">₹{ledger.due.toLocaleString()}</div></div>
                                </div>
                                <form onSubmit={handleLedgerSync} className="space-y-3.5">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1 block">Course</label>
                                        <select className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-xs text-white" value={paymentModal.courseTitle} onChange={e => setPaymentModal({ ...paymentModal, courseTitle: e.target.value })}>
                                            {enrolls.map((en, idx) => <option key={idx} value={en.course}>{en.course}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1 block">Amount (₹)</label>
                                        <input required autoFocus type="number" className="w-full p-3 bg-slate-900 border-2 border-slate-800 rounded-xl font-black text-lg text-center text-white outline-none focus:border-[#F37021]" placeholder="0000" value={paymentModal.amount} onChange={e => setPaymentModal({ ...paymentModal, amount: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1 block">Mode</label>
                                        <select className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-xs text-white" value={paymentModal.mode} onChange={e => handlePaymentModeSelect(e.target.value)}>
                                            <option value="Cash">Physical Cash</option><option value="UPI">Direct UPI</option><option value="NetBanking">Net Banking</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex justify-center items-center gap-2 bg-[#F37021] hover:bg-orange-600 active:scale-95 shadow-orange-950/40 cursor-pointer"
                                    >
                                        <FiCheckCircle size={16} /> Deploy Coupon
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>

            {/* LOGOUT CONFIRMATION MODAL */}
            <AnimatePresence>
                {logoutModal && (
                    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 text-center">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0A192F] text-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-t-8 border-red-500 border border-slate-800">
                            <FiLogOut className="mx-auto text-red-400 mb-4" size={40} />
                            <h3 className="text-xl font-black text-white uppercase italic mb-6 leading-tight">Terminate Session?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setLogoutModal(false)} className="py-3 bg-slate-900 border border-slate-800 rounded-xl font-black uppercase text-[10px] text-slate-400 hover:bg-slate-800 transition-colors">Stay</button>
                                <button onClick={handleLogout} className="py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] shadow-md hover:bg-red-500 transition-all">Logout</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AdminAIBot
                systemData={{
                    totalRevenue: finances.total,
                    monthlyRevenue: selectedMonth ? (monthlyHistory[selectedMonth] || 0) : 0,
                    totalStudents: students.length,
                    activeBatches: availableBatches.length,
                    pendingAlerts: finances.pendingAdjustments,
                    pendingStudentsList: students.filter(s => !s.isApproved).map(s => s.name).join(", "),
                    activeBatchCodes: availableBatches.map(b => b.batchCode).join(", "),
                    availableCourses: allCourses.map(c => c.title).join(", ")
                }}
                onStateChange={fetchEverything}
            />
        </div>
    );
}