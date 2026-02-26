import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiPlayCircle, FiLoader, FiLock, FiClock, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { techCoursesData, universityPrograms } from '../../data/courses';

export default function LiveLectures() {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseName, setCourseName] = useState("");

    // HELPER: Logic strictly matched to your working version
    const getStatus = (lectureTime) => {
        try {
            const [hours, minutes] = lectureTime.split(':').map(Number);
            const now = new Date();
            const lectureDate = new Date();
            lectureDate.setHours(hours, minutes, 0);

            const diffInMinutes = (now - lectureDate) / (1000 * 60);

            if (diffInMinutes >= 0 && diffInMinutes <= 60) return "LIVE";
            if (diffInMinutes < 0) return "UPCOMING";
            return "ENDED";
        } catch (err) {
            return "UPCOMING";
        }
    };

    useEffect(() => {
        const fetchLectures = async () => {
            try {
                const studentRaw = localStorage.getItem("studentData");
                const token = localStorage.getItem("studentToken");
                if (!studentRaw || !token) return setLoading(false);

                const student = JSON.parse(studentRaw);
                const displayTitle = student.course || "";
                setCourseName(displayTitle);

                // ID Matching Logic
                const allCourses = [...techCoursesData, ...universityPrograms];
                const match = allCourses.find(c => c.title.trim().toLowerCase() === displayTitle.trim().toLowerCase());
                const searchID = match ? match.id : displayTitle.toLowerCase().trim();

                const API_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
                
                // RESTORED: Using your original working endpoint path '/lms/sync/'
                const res = await axios.get(`${API_BASE}/lms/sync/${encodeURIComponent(searchID)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    setLectures(res.data.data?.lectures || []);
                }
            } catch (err) {
                console.error("Lecture Sync Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLectures();
    }, []);

    if (loading) return (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
            <FiLoader className="animate-spin text-3xl text-[#F37021]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Classroom...</p>
        </div>
    );

    return (
        <div className="space-y-6 w-full overflow-x-hidden px-1">
            <header className="flex flex-col gap-1 text-left">
                <h2 className="text-2xl font-black text-[#1A5F7A] uppercase italic leading-none">
                    Classroom <span className="text-[#F37021]">Portal</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {courseName || "General Course"}
                </p>
            </header>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {lectures.length > 0 ? (
                        lectures.map((lecture) => {
                            const status = getStatus(lecture.time);
                            const isCancelled = lecture.isCancelled;

                            // Skip old lectures unless they were cancelled (to show status)
                            if (status === "ENDED" && !isCancelled) return null;

                            return (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={lecture._id} 
                                    className={`relative bg-white rounded-[2rem] p-5 md:p-6 shadow-xl border-l-8 transition-all ${
                                        isCancelled 
                                            ? 'border-slate-300 grayscale' 
                                            : status === 'LIVE' ? 'border-red-500' : 'border-[#F37021]'
                                    } flex flex-col md:flex-row justify-between items-center gap-4`}
                                >
                                    {/* Status Badge */}
                                    <div className={`absolute -top-3 left-6 flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black shadow-lg text-white ${
                                        isCancelled 
                                            ? 'bg-slate-500' 
                                            : status === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-[#F37021]'
                                    }`}>
                                        {isCancelled ? (
                                            <><FiAlertCircle /> SESSION CANCELLED</>
                                        ) : status === "LIVE" ? (
                                            <>
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                                </span>
                                                LIVE NOW
                                            </>
                                        ) : "UPCOMING SESSION"}
                                    </div>

                                    <div className="flex items-center gap-5 w-full">
                                        <div className={`p-4 rounded-2xl shrink-0 ${isCancelled ? 'bg-slate-100' : status === 'LIVE' ? 'bg-red-50' : 'bg-orange-50'}`}>
                                            {status === 'LIVE' && !isCancelled ? (
                                                <FiVideo className="text-2xl text-red-500" />
                                            ) : (
                                                <FiClock className={`text-2xl ${isCancelled ? 'text-slate-400' : 'text-[#F37021]'}`} />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <h3 className={`text-xl font-black uppercase leading-tight ${isCancelled ? 'text-slate-400 line-through' : 'text-[#1A5F7A]'}`}>
                                                {lecture.title}
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                                Scheduled: {lecture.time} • Prof. {lecture.teacher}
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        disabled={isCancelled}
                                        onClick={() => window.open(lecture.link, '_blank')}
                                        className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-md ${
                                            isCancelled 
                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                                                : status === 'LIVE' 
                                                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                                                    : 'bg-[#1A5F7A] hover:bg-[#F37021] text-white'
                                        }`}
                                    >
                                        <FiPlayCircle className="text-lg" /> 
                                        {isCancelled ? 'Void' : status === 'LIVE' ? 'Join Live Now' : 'Upcoming'}
                                    </button>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                            <FiLock className="mx-auto mb-2 text-slate-300 size-8" />
                            <p className="text-slate-400 font-bold text-xs uppercase">No active or upcoming sessions</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}