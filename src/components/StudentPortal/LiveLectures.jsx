import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiLoader, FiLock, FiClock, FiAlertCircle, FiExternalLink, FiPlayCircle } from 'react-icons/fi';
import axios from 'axios';

export default function LiveLectures() {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

    // Real-time calculation loop matching student dashboard parameters
    const getStatus = useCallback((lectureTime) => {
        if (!lectureTime) return "UPCOMING";
        
        try {
            // Regex handles "14:30", "2:30 PM", "02:30AM" seamlessly
            const timeMatch = lectureTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (!timeMatch) return "UPCOMING";

            let hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            const period = timeMatch[3]?.toUpperCase();

            // Normalize to 24-hour clock for accurate JS Date manipulation
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const now = new Date();
            const lectureDate = new Date();
            lectureDate.setHours(hours, minutes, 0, 0);
            
            const diffInMinutes = (now - lectureDate) / (1000 * 60);

            // Window logic: Active classrooms remain live for 2 hours (120 minutes)
            if (diffInMinutes >= 0 && diffInMinutes <= 120) return "LIVE";
            if (diffInMinutes < 0) return "UPCOMING";
            return "FINISHED";
        } catch (error) {
            return "UPCOMING"; // Fallback to safe state instead of crashing
        }
    }, []);

    const fetchLectures = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        setError(null);
        
        try {
            const studentRaw = localStorage.getItem("studentData");
            const token = localStorage.getItem("studentToken");

            if (!studentRaw || !token) {
                setError("Authentication missing. Please login again.");
                return;
            }

            const student = JSON.parse(studentRaw);
            const collectedIds = [];

            // Robust dynamic collection mapping tracking polymorphic array architectures
            if (Array.isArray(student.activeBatches)) {
                student.activeBatches.forEach(b => {
                    if (!b) return;
                    if (typeof b === 'string') collectedIds.push(b);
                    else if (b._id) collectedIds.push(b._id);
                });
            }

            // Fallback catch to resolve flat field references string values
            if (student.batchId) {
                const flatId = typeof student.batchId === 'object' ? student.batchId._id : student.batchId;
                if (flatId) collectedIds.push(flatId);
            }

            // De-duplicate final batch array parameters safely
            const batchIds = [...new Set(collectedIds)].filter(Boolean);

            if (batchIds.length === 0) {
                setLectures([]);
                return;
            }

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
            if (showLoader) setLoading(false);
        }
    }, [API_BASE]);

    useEffect(() => {
        fetchLectures();
        
        const ticker = setInterval(() => {
            setLectures(prev => [...prev]); 
        }, 60000);

        const handleSync = () => fetchLectures(false);
        window.addEventListener("profileSynced", handleSync);
        
        return () => {
            window.removeEventListener("profileSynced", handleSync);
            clearInterval(ticker);
        };
    }, [fetchLectures]);

    if (loading) return (
        <div className="h-96 flex flex-col justify-center items-center gap-4">
            <FiLoader className="animate-spin text-4xl text-[#F37021]" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Synchronizing Stream Gateways...</p>
        </div>
    );

    return (
        <div className="w-full space-y-10 pb-20 text-left max-w-5xl mx-auto px-4 mt-24">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-50 text-[#F37021] rounded-2xl shadow-sm">
                        <FiVideo size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-[#1A5F7A] uppercase italic leading-none tracking-tighter">
                            Live <span className="text-[#F37021]">Classroom</span>
                        </h2>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {lectures.length} Academic Streams Identified
                        </p>
                    </div>
                </div>
            </header>

            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center gap-4 text-red-600 shadow-sm">
                    <FiAlertCircle size={20} className="shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
                </motion.div>
            )}

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {lectures.length > 0 ? (
                        lectures.map((lecture) => {
                            const status = getStatus(lecture.time || lecture.startTime);
                            return (
                                <motion.div 
                                    layout
                                    key={lecture._id} 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8 group hover:shadow-2xl transition-all duration-500 ${
                                        status === 'LIVE' ? 'ring-2 ring-red-500/20' : ''
                                    }`}
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-3 ${
                                        status === 'LIVE' ? 'bg-red-500' : status === 'UPCOMING' ? 'bg-[#1A5F7A]' : 'bg-slate-200'
                                    }`} />

                                    <div className="flex flex-col gap-4 w-full">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                status === 'LIVE' ? 'bg-red-500 text-white animate-pulse' : 
                                                status === 'UPCOMING' ? 'bg-[#1A5F7A] text-white' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {status === "LIVE" ? "• Broadcasting" : status === "UPCOMING" ? "Scheduled" : "Archive"}
                                            </span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                <FiClock size={10}/> {lecture.time || lecture.startTime}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black uppercase text-[#1A5F7A] italic leading-tight group-hover:text-[#F37021] transition-colors">
                                                {lecture.title}
                                            </h3>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                                Prof. {lecture.teacher} • <span className="text-[#1A5F7A] opacity-70">Batch {lecture.batchId?.batchCode || "General Stream"}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => lecture.link && window.open(lecture.link, '_blank')}
                                        disabled={status === 'UPCOMING'}
                                        className={`w-full lg:w-auto px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95 ${
                                            status === 'LIVE' 
                                            ? 'bg-[#F37021] text-white hover:bg-[#e0651c] shadow-orange-200' 
                                            : status === 'UPCOMING' 
                                            ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' 
                                            : 'bg-[#1A5F7A] text-white hover:bg-[#144d63]'
                                        }`}
                                    >
                                        {status === 'LIVE' ? (
                                            <>Enter Studio <FiExternalLink size={14}/></>
                                        ) : status === 'UPCOMING' ? (
                                            <>Gateway Locked <FiLock size={14}/></>
                                        ) : (
                                            <>Watch Recording <FiPlayCircle size={16}/></>
                                        )}
                                    </button>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <FiLock className="text-slate-200" size={40} />
                            </div>
                            <h4 className="text-[#1A5F7A] font-black uppercase italic text-xl">Curriculum Standby</h4>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                                No active sessions scheduled for your batches at this time. Please check your timetable for specific timings.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}