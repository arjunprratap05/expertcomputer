import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FiBookOpen, FiClock, FiAward, FiZap, FiCheckCircle, 
    FiTarget, FiChevronRight, FiTrendingUp 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function DashboardHome() {
    const [student, setStudent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedData = localStorage.getItem("studentData");
        if (savedData) {
            setStudent(JSON.parse(savedData));
        } else {
            navigate('/student-login');
        }
    }, [navigate]);

    if (!student) return null;

    // Simulated Progress Logic (Replace with actual backend data if available)
    const progressValue = 68; // Percentage
    const circumference = 2 * Math.PI * 45; // Based on r=45 for the SVG circle

    return (
        <div className="flex flex-col font-sans space-y-8 pb-20">
            {/* 1. WELCOME BANNER */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-xl border border-slate-100 relative overflow-hidden"
            >
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black text-[#1A5F7A] leading-tight uppercase italic">
                        Welcome Back, <br/><span className="text-[#F37021]">{student.name?.split(' ')[0]}!</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest">Enrollment ID: {student.registrationId}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                        <QuickStat icon={<FiBookOpen />} label="Program" value={student.course || "N/A"} color="bg-blue-500" />
                        <QuickStat icon={<FiClock />} label="Status" value="Live Sync Active" color="bg-[#F37021]" />
                        <QuickStat icon={<FiAward />} label="Academic" value="Verified" color="bg-green-500" />
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
            </motion.div>

            {/* 2. COURSE PROGRESS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: MAIN PROGRESS CARD */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-[#1A5F7A] rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-10"
                >
                    {/* SVG Circular Progress */}
                    <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="45" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                            <motion.circle 
                                cx="80" cy="80" r="45" stroke="#F37021" strokeWidth="12" fill="transparent" 
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: circumference - (progressValue / 100) * circumference }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black italic">{progressValue}%</span>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">Completed</span>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4">
                            <FiZap className="text-[#F37021]" /> Advanced Track
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic leading-none mb-3">
                            Current Milestone
                        </h2>
                        <p className="text-blue-100/60 text-sm font-medium mb-6">
                            You are performing better than 85% of your batch mates. Keep it up!
                        </p>
                        <button 
                            onClick={() => navigate('/erp/live-lectures')}
                            className="bg-[#F37021] text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 mx-auto md:mx-0 shadow-xl hover:scale-105 transition-all"
                        >
                            Continue Learning <FiChevronRight />
                        </button>
                    </div>

                    <FiTrendingUp className="absolute -right-4 -bottom-4 text-9xl text-white/5 opacity-10" />
                </motion.div>

                {/* RIGHT: QUICK SYNC / ACTIVITY */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-xl flex flex-col justify-between"
                >
                    <div className="space-y-6">
                        <h3 className="text-lg font-black text-[#1A5F7A] uppercase italic flex items-center gap-2">
                            <FiTarget className="text-[#F37021]" /> Daily Tasks
                        </h3>
                        <div className="space-y-4">
                            <TaskItem label="Complete SQL Module" done={true} />
                            <TaskItem label="Download Practice Set" done={false} />
                            <TaskItem label="Watch Python Live" done={false} />
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-50">
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                             <span className="text-[10px] font-black uppercase text-slate-400">Total Credits</span>
                             <span className="text-xl font-black text-[#1A5F7A] italic">1,240</span>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}

// Sub-Components
function QuickStat({ icon, label, value, color }) {
    return (
        <div className="bg-slate-50 p-6 rounded-3xl flex items-center gap-5 border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>{icon}</div>
            <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
                <p className="text-sm font-bold text-[#1A5F7A] uppercase leading-tight mt-0.5">{value}</p>
            </div>
        </div>
    );
}

function TaskItem({ label, done }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className={`p-1 rounded-lg ${done ? 'text-green-500 bg-green-50' : 'text-slate-300 bg-slate-50'}`}>
                    <FiCheckCircle />
                </div>
                <span className={`text-xs font-bold ${done ? 'text-slate-400 line-through' : 'text-[#1A5F7A]'}`}>{label}</span>
            </div>
            {!done && <div className="w-1.5 h-1.5 bg-[#F37021] rounded-full animate-pulse" />}
        </div>
    );
}