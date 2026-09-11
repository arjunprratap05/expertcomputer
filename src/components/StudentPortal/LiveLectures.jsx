import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiVideo, FiLoader, FiLock, FiClock, FiAlertCircle, 
    FiExternalLink, FiShield, FiRefreshCw 
} from 'react-icons/fi';
import axios from 'axios';

export default function LiveLectures() {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTimeTick, setCurrentTimeTick] = useState(Date.now());
    const API_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

    // Real-time status determination (LIVE, UPCOMING, FINISHED)
    const getStatus = useCallback((lectureTime) => {
        if (!lectureTime) return "UPCOMING";
        
        try {
            const timeMatch = lectureTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (!timeMatch) return "UPCOMING";

            let hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            const period = timeMatch[3]?.toUpperCase();

            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const now = new Date();
            const lectureDate = new Date();
            lectureDate.setHours(hours, minutes, 0, 0);
            
            const diffInMinutes = (now - lectureDate) / (1000 * 60);

            // Active live window: from scheduled start up to 120 minutes (2 hrs)
            if (diffInMinutes >= 0 && diffInMinutes <= 120) return "LIVE";
            if (diffInMinutes < 0) return "UPCOMING";
            return "FINISHED";
        } catch {
            return "UPCOMING";
        }
    }, []);

    const fetchLectures = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        setError(null);
        
        try {
            const studentRaw = localStorage.getItem("studentData");
            const token = localStorage.getItem("studentToken");

            if (!studentRaw || !token) {
                setError("Session expired or unverified. Please log in again.");
                return;
            }

            const student = JSON.parse(studentRaw);
            const collectedIds = [];

            // 1. Direct activeBatches check
            if (Array.isArray(student.activeBatches)) {
                student.activeBatches.forEach(b => {
                    if (!b) return;
                    if (typeof b === 'string') collectedIds.push(b);
                    else if (b._id) collectedIds.push(b._id.toString());
                });
            }

            // 2. Singular batchId check
            if (student.batchId) {
                const flatId = typeof student.batchId === 'object' ? student.batchId._id : student.batchId;
                if (flatId) collectedIds.push(flatId.toString());
            }

            // 3. Multi-course enrollments check
            if (Array.isArray(student.enrollments)) {
                student.enrollments.forEach(en => {
                    if (en.batchId) {
                        const enBatch = typeof en.batchId === 'object' ? en.batchId._id : en.batchId;
                        if (enBatch) collectedIds.push(enBatch.toString());
                    }
                });
            }

            let batchIds = [...new Set(collectedIds)].filter(Boolean);

            // Fallback: If no direct batches, search by enrolled courses
            if (batchIds.length === 0) {
                const fallbackRes = await axios.get(`${API_BASE}/lms/add-lecture`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const allLectures = fallbackRes.data?.data || fallbackRes.data?.lectures || [];
                const studentCourses = [
                    student.course,
                    ...(student.enrollments || []).map(e => e.course)
                ].filter(Boolean).map(c => c.toLowerCase());

                const matched = allLectures.filter(lec => {
                    const lecCourse = (lec.course || lec.courseId || "").toLowerCase();
                    return studentCourses.some(sc => sc.includes(lecCourse) || lecCourse.includes(sc));
                });

                setLectures(matched.length > 0 ? matched : allLectures);
                return;
            }

            const res = await axios.post(`${API_BASE}/lms/sync-multi`, 
                { batchIds }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data?.success) {
                setLectures(res.data.data?.lectures || []);
            } else {
                setError("Failed to synchronize active academic streams.");
            }
        } catch (err) {
            console.error("LMS Sync Error:", err);
            setError("Unable to establish link with classroom broadcasting gateway.");
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [API_BASE]);

    useEffect(() => {
        fetchLectures(true);
        
        // Advance clock every 60 seconds to automatically recalculate and remove expired lectures
        const intervalId = setInterval(() => {
            setCurrentTimeTick(Date.now());
        }, 60000);

        return () => clearInterval(intervalId);
    }, [fetchLectures]);

    // Filter to only retain time-relevant lectures (LIVE or UPCOMING today)
    const activeSchedule = useMemo(() => {
        return lectures
            .map(lec => ({
                ...lec,
                status: getStatus(lec.time || lec.startTime)
            }))
            .filter(lec => lec.status === 'LIVE' || lec.status === 'UPCOMING')
            .sort((a, b) => (a.status === 'LIVE' ? -1 : 1)); // Show LIVE broadcasts on top
    }, [lectures, getStatus, currentTimeTick]);

    if (loading) {
        return (
            <div className="h-96 flex flex-col justify-center items-center gap-3">
                <FiLoader className="animate-spin text-3xl text-[#F37021]" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">
                    Connecting to Academic Streams...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 pb-16 text-left max-w-5xl mx-auto px-2">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-orange-50 text-[#F37021] rounded-2xl border border-orange-100 shadow-xs">
                        <FiVideo size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#1A5F7A] uppercase italic leading-none tracking-tight">
                            Live <span className="text-[#F37021]">Classroom</span>
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {activeSchedule.length} Active Timetabled Session{activeSchedule.length === 1 ? '' : 's'}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => fetchLectures(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95"
                >
                    <FiRefreshCw size={13} /> Refresh Stream
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex items-center gap-3 text-red-600 shadow-xs">
                    <FiAlertCircle size={18} className="shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-wide leading-relaxed">{error}</p>
                </div>
            )}

            {/* Timetabled Lectures List */}
            <div className="grid grid-cols-1 gap-5">
                <AnimatePresence mode="popLayout">
                    {activeSchedule.length > 0 ? (
                        activeSchedule.map((lecture) => {
                            const isLive = lecture.status === 'LIVE';

                            return (
                                <motion.div 
                                    layout
                                    key={lecture._id} 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className={`relative bg-white rounded-3xl p-6 sm:p-7 shadow-xs border transition-all duration-300 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 overflow-hidden ${
                                        isLive 
                                            ? 'border-red-300 shadow-red-100/50 ring-2 ring-red-100' 
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {/* Status Color Strip */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${
                                        isLive ? 'bg-red-500 shadow-sm' : 'bg-sky-500'
                                    }`} />

                                    <div className="flex flex-col gap-3 w-full pl-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border inline-flex items-center gap-1.5 ${
                                                isLive 
                                                    ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                                                    : 'bg-sky-50 text-sky-700 border-sky-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    isLive ? 'bg-red-500' : 'bg-sky-500'
                                                }`} />
                                                {isLive ? "Broadcasting Now" : "Upcoming Session"}
                                            </span>

                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                                                <FiClock size={12} className="text-[#F37021]"/> 
                                                {lecture.time || lecture.startTime || "Scheduled Time"}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-lg sm:text-xl font-black uppercase text-[#1A5F7A] italic leading-tight">
                                                {lecture.title}
                                            </h3>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-tight flex flex-wrap items-center gap-2 pt-0.5">
                                                <span>Faculty: {lecture.teacher || "Faculty Incharge"}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-[#F37021] font-bold">
                                                    Batch: {lecture.batchId?.batchCode || lecture.batchCode || "General Session"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button 
                                        onClick={() => lecture.link && window.open(lecture.link, '_blank', 'noopener,noreferrer')}
                                        disabled={!isLive}
                                        className={`w-full lg:w-auto px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2.5 shrink-0 active:scale-95 shadow-xs ${
                                            isLive 
                                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 cursor-pointer' 
                                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                        }`}
                                    >
                                        {isLive ? (
                                            <>Join Classroom <FiExternalLink size={13}/></>
                                        ) : (
                                            <>Available At Scheduled Time <FiLock size={13}/></>
                                        )}
                                    </button>
                                </motion.div>
                            );
                        })
                    ) : (
                        /* Standby View when no live or upcoming session matches */
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-center py-20 px-6 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center shadow-xs"
                        >
                            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 text-[#1A5F7A]">
                                <FiShield size={28} />
                            </div>
                            <h4 className="text-[#1A5F7A] font-black uppercase italic text-lg tracking-tight">
                                Curriculum Standby
                            </h4>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mt-2 max-w-sm leading-relaxed">
                                No active broadcast sessions are scheduled for your batches right now. Your lectures will appear automatically once your scheduled class hour arrives.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}