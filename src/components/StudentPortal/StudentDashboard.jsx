import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUser, FiMail, FiRefreshCw, FiArrowRight, FiCheckCircle, 
    FiBook, FiActivity, FiLayers, FiChevronRight, FiTrendingUp, FiTarget
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudentDashboard() {
    const [studentData, setStudentData] = useState(null);
    const [greeting, setGreeting] = useState("");
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

    // --- PROD LOGIC: AGGREGATE PROGRESS CALCULATION ---
    const calculateProgress = () => {
        if (!studentData?.enrollments) return 0;
        const total = studentData.enrollments.length;
        const active = studentData.activeBatches?.length || 0;
        // Logic: (Authorized Streams / Total Programs Enrolled) * 100
        return Math.min(Math.round((active / total) * 100), 100);
    };

    const fetchFreshProfile = async (token) => {
        try {
            setSyncing(true);
            const res = await axios.get(`${API_URL}/auth/my-profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStudentData(res.data.student);
                localStorage.setItem("studentData", JSON.stringify(res.data.student));
                window.dispatchEvent(new CustomEvent("profileSynced", { detail: res.data.student }));
            }
        } catch (err) { console.error("Profile Sync Failed", err);
        } finally { setSyncing(false); setLoading(false); }
    };

    const switchCourse = (targetEnrollment) => {
        // Find the specific batch linked to this course name from authorized batches
        // Note: In PROD, you'd match by course slug
        const updatedData = { ...studentData, course: targetEnrollment.course };
        setStudentData(updatedData);
        localStorage.setItem("studentData", JSON.stringify(updatedData));
        window.dispatchEvent(new CustomEvent("profileSynced", { detail: updatedData }));
    };

    useEffect(() => {
        const token = localStorage.getItem("studentToken");
        const storedData = localStorage.getItem("studentData");
        if (!token || !storedData) return navigate('/student-login');
        setStudentData(JSON.parse(storedData));
        fetchFreshProfile(token);
        const hour = new Date().getHours();
        setGreeting(hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening");
    }, [navigate]);

    if (loading || !studentData) return (
        <div className="h-screen flex flex-col items-center justify-center font-black italic text-[#1A5F7A] bg-slate-50 gap-4">
            <FiRefreshCw size={40} className="text-[#F37021] animate-spin" />
            SECURE AUTHENTICATION...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 text-left">
            <header className="max-w-7xl mx-auto mb-8 relative">
                {syncing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-6 right-4 flex items-center gap-2 text-[8px] font-black text-[#F37021] uppercase tracking-widest">
                        <FiRefreshCw className="animate-spin" /> Live Syncing Data
                    </motion.div>
                )}
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-24 h-24 bg-[#1A5F7A] rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl">
                        {studentData.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-black text-[#1A5F7A] uppercase italic tracking-tighter">{studentData.name}</h1>
                        <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">
                            {studentData.enrollments?.length} Active Programs Linked
                        </p>
                    </div>
                    <div className="bg-[#1A5F7A] p-6 rounded-3xl min-w-[240px] text-white shadow-xl">
                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Active View</p>
                        <p className="text-xl font-black uppercase italic leading-none truncate">{studentData.course}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* --- LEFT: COURSE LIST --- */}
                <section className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                        <h2 className="text-[#1A5F7A] font-black uppercase text-xs mb-6 flex items-center gap-2 italic tracking-widest">
                            <FiLayers className="text-[#F37021]"/> Program Selector
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {studentData.enrollments?.map((enroll, idx) => (
                                <div key={idx} onClick={() => switchCourse(enroll)}
                                    className={`group cursor-pointer p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${
                                        studentData.course === enroll.course ? 'border-[#F37021] bg-orange-50/30' : 'border-slate-50 bg-white hover:border-slate-200'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${studentData.course === enroll.course ? 'bg-[#F37021] text-white' : 'bg-slate-100'}`}>
                                            <FiBook size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#1A5F7A] uppercase italic text-lg leading-none">{enroll.course}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Status: {enroll.status}</p>
                                        </div>
                                    </div>
                                    <FiChevronRight className={studentData.course === enroll.course ? "text-[#F37021]" : "text-slate-200"} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- RIGHT: GLOBAL PROGRESS SIDEBAR --- */}
                <aside className="space-y-6">
                    <div className="bg-[#1A5F7A] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-black italic uppercase tracking-tighter text-2xl mb-6">
                                Learning <br/> <span className="text-[#F37021]">Consistency</span>
                            </h3>
                            
                            <div className="flex items-center gap-4 mb-8">
                                <div className="text-5xl font-black italic tracking-tighter">{calculateProgress()}%</div>
                                <div className="text-[10px] font-bold uppercase opacity-50 leading-tight">Sync <br/> Readiness</div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-10">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${calculateProgress()}%` }}
                                    className="h-full bg-gradient-to-r from-orange-500 to-[#F37021]"
                                />
                            </div>

                            <div className="space-y-3">
                                <button onClick={() => navigate('/classroom')} className="w-full bg-[#F37021] py-5 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-orange-900/20">
                                    Enter Classroom <FiArrowRight />
                                </button>
                                <button onClick={() => navigate('/vault')} className="w-full bg-white/10 py-5 rounded-2xl font-black uppercase text-[10px] hover:bg-white/20 transition-all border border-white/10">
                                    Study Vault
                                </button>
                            </div>
                        </div>
                        <FiTrendingUp className="absolute -bottom-10 -right-10 text-white/5 size-40" />
                    </div>

                    {/* Quick Stats Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                        <h4 className="text-[10px] font-black text-[#1A5F7A] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <FiTarget className="text-[#F37021]" /> Stream Analytics
                        </h4>
                        <div className="space-y-4">
                            <StatRow label="Authorized Batches" value={studentData.activeBatches?.length || 0} />
                            <StatRow label="Pending Batches" value={studentData.enrollments?.length - (studentData.activeBatches?.length || 0)} />
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

function StatRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
            <span className="text-sm font-black text-[#1A5F7A] italic">{value}</span>
        </div>
    );
}