import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiLoader, FiLock, FiClock, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import axios from 'axios';

export default function LiveLectures() {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

    // Logic to determine session status based on current time
    const getStatus = useCallback((lectureTime) => {
        if (!lectureTime) return "UPCOMING";
        const [hours, minutes] = lectureTime.split(':').map(Number);
        const now = new Date();
        const lectureDate = new Date();
        lectureDate.setHours(hours, minutes, 0);
        const diffInMinutes = (now - lectureDate) / (1000 * 60);

        // LIVE: started in the last 2 hours
        if (diffInMinutes >= 0 && diffInMinutes <= 120) return "LIVE";
        // UPCOMING: starting in the future
        if (diffInMinutes < 0) return "UPCOMING";
        // FINISHED: older than 2 hours (kept visible for recording access)
        return "FINISHED";
    }, []);

    const fetchLectures = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        setError(null);
        
        try {
            const studentRaw = localStorage.getItem("studentData");
            const token = localStorage.getItem("studentToken"); // FIX: Token now defined

            if (!studentRaw || !token) {
                setError("Authentication missing. Please login again.");
                return;
            }

            const student = JSON.parse(studentRaw);
            
            // PROD MULTI-COURSE LOGIC:
            // Fetch for all authorized batches (Arjun's 3 courses: Java, Python, Gen-AI)
            const batchIds = student.activeBatches || (student.batchId ? [student.batchId] : []);

            if (batchIds.length === 0) {
                setLectures([]);
                setLoading(false);
                return;
            }

            // Using POST to send the array of IDs safely
            const res = await axios.post(`${API_BASE}/lms/sync-multi`, 
                { batchIds }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setLectures(res.data.data?.lectures || []);
            } else {
                setError("Failed to synchronize curriculum links.");
            }
        } catch (err) {
            console.error("LMS Sync Error:", err);
            setError("Network error: Learning portal is unreachable.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLectures();
        
        // Listen for profile switches (e.g. switching from Java to Python view)
        const handleSync = () => fetchLectures(false);
        window.addEventListener("profileSynced", handleSync);
        return () => window.removeEventListener("profileSynced", handleSync);
    }, []);

    if (loading) return (
        <div className="h-64 flex flex-col justify-center items-center gap-4">
            <FiLoader className="animate-spin text-4xl text-[#F37021]" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching curriculum streams...</p>
        </div>
    );

    return (
        <div className="w-full space-y-8 pb-20 text-left">
            <header className="flex flex-col gap-1 px-1">
                <h2 className="text-3xl font-black text-[#1A5F7A] uppercase italic leading-none">
                    Live <span className="text-[#F37021]">Classroom</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Multi-Topic Synchronization Active
                </p>
            </header>

            {error && (
                <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center gap-4 text-red-600">
                    <FiAlertCircle size={24} />
                    <p className="text-xs font-bold uppercase">{error}</p>
                </div>
            )}

            <div className="space-y-5">
                <AnimatePresence mode="popLayout">
                    {lectures.length > 0 ? (
                        lectures.map((lecture) => {
                            const status = getStatus(lecture.time);
                            return (
                                <motion.div 
                                    layout 
                                    key={lecture._id} 
                                    initial={{ opacity: 0, scale: 0.95 }} 
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`relative bg-white rounded-[2rem] p-7 shadow-xl border-l-[12px] flex flex-col md:flex-row justify-between items-center gap-6 transition-all ${
                                        status === 'LIVE' ? 'border-red-500 bg-red-50/10' : 
                                        status === 'UPCOMING' ? 'border-[#1A5F7A]' : 'border-slate-200 opacity-80'
                                    }`}
                                >
                                    {/* Status Badge */}
                                    <div className={`absolute -top-3 left-8 px-4 py-1.5 rounded-full text-[9px] font-black text-white shadow-md ${
                                        status === 'LIVE' ? 'bg-red-500 animate-pulse' : 
                                        status === 'UPCOMING' ? 'bg-[#1A5F7A]' : 'bg-slate-400'
                                    }`}>
                                        {status === "LIVE" ? "• BROADCASTING NOW" : status === "UPCOMING" ? "SCHEDULED" : "SESSION ARCHIVED"}
                                    </div>

                                    <div className="flex items-center gap-5 w-full min-w-0">
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black uppercase">
                                                    Stream: {lecture.batchId?.slice(-4).toUpperCase()}
                                                </span>
                                                <h3 className="text-xl font-black uppercase text-[#1A5F7A] truncate italic leading-none">
                                                    {lecture.title}
                                                </h3>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
                                                <FiClock className="inline mb-0.5 mr-1"/> {lecture.time} • Prof. {lecture.teacher}
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => lecture.link && window.open(lecture.link, '_blank')}
                                        className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                                            status === 'LIVE' 
                                            ? 'bg-[#F37021] text-white shadow-lg shadow-orange-200' 
                                            : 'bg-slate-100 text-slate-400'
                                        }`}
                                    >
                                        {status === 'LIVE' ? 'Join Stream' : status === 'UPCOMING' ? 'Link Pending' : 'View Recording'}
                                        {status === 'LIVE' && <FiExternalLink />}
                                    </button>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                            <FiLock className="mx-auto mb-4 text-slate-200" size={48} />
                            <p className="text-slate-300 font-black text-xs uppercase tracking-widest">No topic streams authorized for your profile</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}