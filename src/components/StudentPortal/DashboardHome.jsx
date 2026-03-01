import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiClock, FiLogOut, FiAward, FiX, FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function DashboardHome() {
    const [student, setStudent] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedData = localStorage.getItem("studentData");
        if (savedData) {
            setStudent(JSON.parse(savedData));
        } else {
            navigate('/student-login');
        }
    }, [navigate]);

    const confirmLogout = () => {
        localStorage.clear();
        navigate('/student-login');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    if (!student) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans overflow-x-hidden">
            
            {/* 1. LOGOUT CONFIRMATION MODAL */}
            <AnimatePresence>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogoutModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center"
                        >
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FiAlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-[#1A5F7A] uppercase italic">Confirm Logout</h3>
                            <p className="text-slate-500 text-sm mt-2 font-medium">Are you sure you want to end your session?</p>
                            
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <button 
                                    onClick={() => setShowLogoutModal(false)}
                                    className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmLogout}
                                    className="py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 2. TOP NAV BAR */}
            <div className="max-w-7xl mx-auto flex justify-between items-center mb-6 md:mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1A5F7A] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                        {student.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Portal</p>
                        <p className="text-sm font-bold text-[#1A5F7A]">{student.registrationId}</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-2 text-[10px] font-black text-red-500 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl transition-all hover:bg-red-500 hover:text-white uppercase tracking-widest"
                >
                    <FiLogOut /> Logout
                </button>
            </div>

            {/* 3. MAIN HERO */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto bg-white rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-[#F37021]/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                
                <div className="relative z-10">
                    <span className="px-4 py-2 bg-orange-50 text-[#F37021] rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                        Classroom Sync Active
                    </span>
                    
                    <h1 className="text-3xl md:text-6xl font-black text-[#1A5F7A] mt-6 mb-4 tracking-tighter leading-tight">
                        {getGreeting()}, <br />
                        <span className="text-[#F37021] italic">{student.name.split(' ')[0]}!</span>
                    </h1>
                    
                    <p className="text-slate-500 max-w-md text-sm md:text-base font-medium leading-relaxed">
                        Your learning dashboard is ready. Access your modules and batch details below.
                    </p>

                    {/* STATS GRID - Responsive 1 col on mobile, 3 on desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-10 md:mt-12">
                        <QuickStat icon={<FiBookOpen />} label="Enrollment" value={student.course || "General"} color="bg-blue-500" />
                        <QuickStat icon={<FiClock />} label="Batch Time" value="10 AM - 12 PM" color="bg-orange-500" />
                        <QuickStat icon={<FiAward />} label="Status" value="Active" color="bg-green-500" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function QuickStat({ icon, label, value, color }) {
    return (
        <div className="bg-slate-50/50 p-5 md:p-6 rounded-2xl md:rounded-3xl flex items-center gap-4 md:gap-5 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
            <div className={`w-10 h-10 md:w-12 md:h-12 ${color} text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{label}</p>
                <p className="text-sm md:text-lg font-bold text-[#1A5F7A] truncate">{value}</p>
            </div>
        </div>
    );
}