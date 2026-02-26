import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiPlayCircle, FiLoader, FiLock, FiClock, FiAlertCircle, FiRefreshCcw } from 'react-icons/fi';
import axios from 'axios';
import { techCoursesData, universityPrograms } from '../../data/courses';

export default function LiveLectures() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState("");
  const [error, setError] = useState(false);
  const [, setTick] = useState(0); // Force re-render every minute

  // 1. STABLE STATUS LOGIC
  const getStatus = useCallback((lectureTime) => {
    try {
      const [hours, minutes] = lectureTime.split(':').map(Number);
      const now = new Date();
      const lectureDate = new Date();
      lectureDate.setHours(hours, minutes, 0);
      const diffInMinutes = (now - lectureDate) / (1000 * 60);

      if (diffInMinutes >= 0 && diffInMinutes <= 90) return "LIVE";
      if (diffInMinutes < 0) return "UPCOMING";
      return "ENDED";
    } catch (err) { return "UPCOMING"; }
  }, []);

  // 2. DATA FETCHING
  const fetchLectures = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(false);
    try {
      const studentRaw = localStorage.getItem("studentData");
      const token = localStorage.getItem("studentToken");
      if (!studentRaw || !token) return;

      const student = JSON.parse(studentRaw);
      setCourseName(student.course || "");

      const allCourses = [...techCoursesData, ...universityPrograms];
      const match = allCourses.find(c => c.title.trim().toLowerCase() === student.course?.trim().toLowerCase());
      const searchID = match ? match.id : student.course?.toLowerCase().trim();

      const API_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
      const res = await axios.get(`${API_BASE}/lms/sync/${encodeURIComponent(searchID)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setLectures(res.data.data?.lectures || []);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // 3. AUTO-REFRESH TIMER (THE MAGIC)
  useEffect(() => {
    fetchLectures();

    // Re-check status every 60 seconds without showing the loading spinner
    const interval = setInterval(() => {
      setTick(t => t + 1); // Trigger re-render to update "LIVE" badges
      fetchLectures(false); // Background sync with server
    }, 60000); 

    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <FiLoader className="animate-spin text-4xl text-[#F37021]" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Classroom...</p>
    </div>
  );

  return (
    <div className="w-full max-w-full overflow-hidden space-y-8 pb-20">
      <header className="flex flex-col gap-1 px-1">
        <h2 className="text-3xl font-black text-[#1A5F7A] uppercase italic leading-none">
          Classroom <span className="text-[#F37021]">Portal</span>
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
          {courseName || "Academic Stream"}
        </p>
      </header>

      <div className="space-y-5 px-1">
        <AnimatePresence mode="popLayout">
          {lectures.length > 0 ? (
            lectures.map((lecture) => {
              const status = getStatus(lecture.time);
              if (status === "ENDED" && !lecture.isCancelled) return null;

              return (
                <motion.div 
                  layout
                  key={lecture._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative bg-white rounded-[2rem] p-5 md:p-7 shadow-xl border-l-[10px] flex flex-col md:flex-row justify-between items-center gap-6 ${
                    lecture.isCancelled ? 'border-slate-300' : status === 'LIVE' ? 'border-red-500 shadow-red-100' : 'border-[#1A5F7A]'
                  }`}
                >
                  <div className={`absolute -top-3 left-8 px-4 py-1.5 rounded-full text-[9px] font-black shadow-lg text-white ${
                    lecture.isCancelled ? 'bg-slate-500' : status === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-[#1A5F7A]'
                  }`}>
                    {lecture.isCancelled ? "CANCELLED" : status === "LIVE" ? "• LIVE NOW" : "UPCOMING"}
                  </div>

                  <div className="flex items-center gap-5 w-full min-w-0">
                    <div className={`p-4 rounded-2xl shrink-0 ${status === 'LIVE' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-[#1A5F7A]'}`}>
                      {status === 'LIVE' ? <FiVideo size={24} /> : <FiClock size={24} />}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <h3 className={`text-lg md:text-2xl font-black uppercase leading-tight truncate ${lecture.isCancelled ? 'text-slate-300 line-through' : 'text-[#1A5F7A]'}`}>
                        {lecture.title}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                        {lecture.time} • Prof. {lecture.teacher}
                      </p>
                    </div>
                  </div>

                  <button 
                    disabled={lecture.isCancelled}
                    onClick={() => window.open(lecture.link, '_blank')}
                    className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                      lecture.isCancelled ? 'bg-slate-50 text-slate-200' : status === 'LIVE' ? 'bg-red-500 text-white shadow-lg' : 'bg-[#1A5F7A] text-white'
                    }`}
                  >
                    {lecture.isCancelled ? 'Void' : status === 'LIVE' ? 'Join Now' : 'Upcoming'}
                  </button>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center p-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
              <FiLock className="mx-auto mb-4 text-slate-200 size-12" />
              <p className="text-slate-300 font-black text-xs uppercase tracking-widest">No Sessions Found</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}