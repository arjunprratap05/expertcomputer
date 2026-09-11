import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiAward, FiUploadCloud, FiCheckCircle, FiClock, 
    FiAlertCircle, FiLoader, FiSearch, FiRefreshCw, 
    FiX, FiCheck, FiXCircle, FiFileText 
} from 'react-icons/fi';

// Ensures the base API URL is clean and always ends with a single '/api' prefix
const rawApiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;

export default function AdminCertificates() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PENDING, APPROVED, REJECTED
    
    // Modal states for issuing signed diploma
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState("");

    const showToast = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(""), 4000);
    };

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/admin/certificate-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data?.success) {
                setRequests(res.data.data || []);
            }
        } catch (err) {
            console.error("Fetch certificate requests error:", err);
            showToast("Failed to load certificate approval queue.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile) return showToast("Please attach an official signed PDF document.");

        setSubmitting(true);
        try {
            const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
            const formData = new FormData();
            formData.append('certificatePdf', uploadFile);
            formData.append('courseTitle', selectedRequest.course);
            formData.append('remarks', remarks);

            const res = await axios.post(
                `${API_BASE}/admin/certificates/upload/${selectedRequest.studentId}`, 
                formData, 
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data?.success) {
                showToast(`Certificate issued for ${selectedRequest.name}!`);
                setSelectedRequest(null);
                setUploadFile(null);
                setRemarks("");
                fetchRequests();
            }
        } catch (err) {
            console.error("Upload error:", err);
            showToast(err.response?.data?.message || "Failed to upload certificate.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async (reqItem) => {
        const reason = window.prompt(`Enter rejection remark for ${reqItem.name}:`, "Academic verification criteria incomplete.");
        if (!reason) return;

        try {
            const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
            await axios.post(
                `${API_BASE}/admin/certificates/reject/${reqItem.studentId}`,
                { courseTitle: reqItem.course, reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast(`Request marked as rejected.`);
            fetchRequests();
        } catch (err) {
            console.error("Reject error:", err);
            showToast("Failed to reject request.");
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(r => {
            const matchSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                r.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                r.phone?.includes(searchTerm);
            const matchFilter = filterStatus === "ALL" ? true : r.requestStatus === filterStatus;
            return matchSearch && matchFilter;
        });
    }, [requests, searchTerm, filterStatus]);

    return (
        <div className="w-full space-y-6 text-left max-w-7xl mx-auto p-4 sm:p-6">
            {/* TOAST ALERT */}
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ y: -30, opacity: 0, x: "-50%" }} 
                        animate={{ y: 24, opacity: 1, x: "-50%" }} 
                        exit={{ y: -30, opacity: 0, x: "-50%" }} 
                        className="fixed top-4 left-1/2 bg-[#0A192F] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2.5 z-[9999] border border-slate-700 border-b-4 border-b-[#F37021]"
                    >
                        <FiAlertCircle className="text-[#F37021] text-base" /> {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-[#F37021] rounded-2xl shadow-inner">
                        <FiAward size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic leading-none tracking-tight">
                            Certificate <span className="text-[#F37021]">Issuance</span> Desk
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Verify completion criteria and authenticate official diplomas
                        </p>
                    </div>
                </div>

                <button 
                    onClick={fetchRequests}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                    <FiRefreshCw size={13} className={loading ? "animate-spin text-[#F37021]" : ""} /> Refresh Queue
                </button>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search student name, phone, course..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-2xl text-xs font-bold outline-none focus:border-[#F37021] transition-colors placeholder:text-slate-500 shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-1.5 bg-[#0A192F] p-1.5 rounded-2xl border border-slate-800 self-start shadow-md">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(st => (
                        <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                filterStatus === st 
                                    ? 'bg-[#F37021] text-white shadow-sm' 
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            {/* REQUESTS DATA TABLE */}
            <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[850px]">
                        <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                            <tr>
                                <th className="p-5 pl-7">Student Candidate</th>
                                <th>Target Program</th>
                                <th>Syllabus Criteria</th>
                                <th>Exam Clearance</th>
                                <th>Request Status</th>
                                <th className="p-5 pr-7 text-right">Academic Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 font-bold">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-16 text-center text-slate-500 font-black uppercase tracking-widest">
                                        <FiLoader className="animate-spin inline-block mr-2 text-[#F37021]" size={16} /> Fetching student audit queue...
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-16 text-center text-slate-500 font-black uppercase italic tracking-widest">
                                        No certification requests matched your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((item, idx) => {
                                    const isCriteriaMet = item.curriculumProgress >= 100 && (item.examPassed || item.examScore >= 50);

                                    return (
                                        <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                                            <td className="p-5 pl-7">
                                                <div className="font-black text-white text-sm uppercase italic">{item.name}</div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">📞 {item.phone} • ✉️ {item.email}</div>
                                            </td>
                                            <td className="text-slate-200 font-black uppercase text-xs">
                                                {item.course}
                                            </td>
                                            <td>
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 w-fit ${
                                                    item.curriculumProgress >= 100 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                                }`}>
                                                    <FiCheckCircle size={11} /> {item.curriculumProgress}% Completed
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 w-fit ${
                                                    item.examPassed 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                                }`}>
                                                    {item.examPassed ? <FiCheck size={11} /> : <FiX size={11} />}
                                                    Score: {item.examScore}% ({item.examPassed ? 'PASSED' : 'PENDING'})
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border flex items-center gap-1.5 w-fit ${
                                                    item.requestStatus === 'APPROVED' 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                                        : item.requestStatus === 'REJECTED'
                                                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                                            : 'bg-orange-500/10 text-[#F37021] border-orange-500/30 animate-pulse'
                                                }`}>
                                                    {item.requestStatus === 'APPROVED' ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
                                                    {item.requestStatus}
                                                </span>
                                            </td>
                                            <td className="p-5 pr-7 text-right">
                                                {item.requestStatus === 'APPROVED' ? (
                                                    <span className="text-emerald-400 font-black text-[10px] uppercase flex items-center justify-end gap-1.5">
                                                        <FiCheckCircle size={13} /> Diploma Uploaded
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleReject(item)}
                                                            className="p-2 text-slate-500 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                                                            title="Reject Request"
                                                        >
                                                            <FiXCircle size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => setSelectedRequest(item)}
                                                            disabled={!isCriteriaMet}
                                                            className="px-3.5 py-2 bg-[#F37021] hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed active:scale-95"
                                                        >
                                                            <FiUploadCloud size={13} /> Upload PDF
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL: UPLOAD SIGNED PDF DIPLOMA */}
            <AnimatePresence>
                {selectedRequest && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }} 
                            animate={{ scale: 1 }} 
                            exit={{ scale: 0.95 }}
                            className="bg-[#0A192F] text-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-700 relative"
                        >
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase italic leading-none">
                                        Issue Official Certificate
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                        Attaching PDF diploma for {selectedRequest.name}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedRequest(null)}
                                    className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-colors"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleUploadSubmit} className="space-y-5 text-left">
                                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs font-bold text-slate-300 space-y-1.5 shadow-inner">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 text-[10px] uppercase">Program Track:</span>
                                        <span className="text-[#F37021] uppercase">{selectedRequest.course}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 text-[10px] uppercase">Exam Score:</span>
                                        <span className="text-emerald-400">{selectedRequest.examScore}% (PASSED)</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                                        Signed Certificate PDF File
                                    </label>
                                    <input 
                                        type="file" 
                                        accept="application/pdf" 
                                        required
                                        onChange={e => setUploadFile(e.target.files[0])}
                                        className="w-full text-xs font-bold text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-orange-500/10 file:text-[#F37021] hover:file:bg-orange-500/20 file:cursor-pointer border border-slate-800 rounded-2xl p-2 bg-slate-900 shadow-inner"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                                        Authentication Remarks (Optional)
                                    </label>
                                    <textarea 
                                        rows="2"
                                        placeholder="e.g. Verified by Academic Director"
                                        value={remarks}
                                        onChange={e => setRemarks(e.target.value)}
                                        className="w-full p-3.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-bold outline-none focus:border-[#F37021] placeholder:text-slate-600 shadow-inner resize-none"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full bg-[#F37021] hover:bg-orange-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-800 disabled:text-slate-600"
                                >
                                    {submitting ? (
                                        <><FiLoader className="animate-spin text-base" /> Publishing Certificate...</>
                                    ) : (
                                        <><FiUploadCloud size={16} /> Authenticate & Issue</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}