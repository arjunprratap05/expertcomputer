import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiClock, FiLogOut, FiAward, FiAlertCircle } from 'react-icons/fi';
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

    const handleLogout = () => {
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
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans relative">
            
            {/* --- TERMINATE MODAL (Matches Admin Portal) --- */}
            <AnimatePresence>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        {/* Backdrop Blur */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogoutModal(false)}
                            className="absolute inset-0 bg-[#1A5F7A]/60 backdrop-blur-md"
                        />
                        
                        {/* Modal Box */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] p-8 md:p-12 max-w-sm w-full shadow-2xl border-t-[12px] border-[#F37021] text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 text-[#F37021] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <FiLogOut size={32} />
                            </div>
                            
                            <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic tracking-tighter">
                                Terminate?
                            </h3>
                            <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-[0.2em]">
                                Sure you want to end your session?
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 mt-10">
                                <button 
                                    onClick={() => setShowLogoutModal(false)}
                                    className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Stay
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="py-4 bg-[#F37021] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-[#d95d1a] transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- HEADER --- */}
            <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1A5F7A] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Portal</p>
                        <p className="text-sm font-bold text-[#1A5F7A]">{student.registrationId}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-2 text-[10px] font-black text-red-500 bg-red-50 border border-red-100 px-5 py-2.5 rounded-xl transition-all hover:bg-[#F37021] hover:text-white uppercase tracking-widest shadow-sm"
                >
                    <FiLogOut /> LOGOUT
                </button>
            </div>

            {/* --- HERO SECTION --- */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto bg-white rounded-[3.5rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
            >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#F37021]/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                
                <div className="relative z-10">
                    <span className="px-4 py-2 bg-orange-50 text-[#F37021] rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                        Student Dashboard
                    </span>
                    
                    <h1 className="text-4xl md:text-6xl font-black text-[#1A5F7A] mt-6 mb-4 tracking-tighter leading-tight">
                        {getGreeting()}, <br />
                        <span className="text-[#F37021] italic">{student.name.split(' ')[0]}!</span>
                    </h1>
                    
                    <p className="text-slate-500 max-w-md font-medium leading-relaxed">
                        Continue your professional training. Your course resources and attendance records are synced.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        <QuickStat icon={<FiBookOpen />} label="Course" value={student.course || "N/A"} color="bg-blue-500" />
                        <QuickStat icon={<FiClock />} label="Current Batch" value="10:00 AM - 12:00 PM" color="bg-[#F37021]" />
                        <QuickStat icon={<FiAward />} label="Attendance" value="88%" color="bg-green-500" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function QuickStat({ icon, label, value, color }) {
    return (
        <div className="bg-slate-50/50 p-6 rounded-3xl flex items-center gap-5 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
            <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-lg font-bold text-[#1A5F7A]">{value}</p>
            </div>
        </div>
    );
}