import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiClock, FiLogOut, FiAward, FiUser, FiLinkedin, FiFacebook, FiInstagram, FiYoutube } from 'react-icons/fi';
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

    if (!student) return null;

    return (
        // Added overflow-x-hidden and min-h-screen to prevent layout breaking
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-x-hidden">
            
            {/* --- LOGOUT MODAL (Ensured High Z-Index) --- */}
            <AnimatePresence>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            onClick={() => setShowLogoutModal(false)} className="absolute inset-0 bg-[#1A5F7A]/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border-t-[12px] border-[#F37021] text-center">
                            <FiLogOut size={40} className="mx-auto text-[#F37021] mb-4" />
                            <h3 className="text-xl font-black text-[#1A5F7A] uppercase">Terminate Session?</h3>
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <button onClick={() => setShowLogoutModal(false)} className="py-3 bg-slate-100 rounded-xl font-bold text-slate-500">Stay</button>
                                <button onClick={handleLogout} className="py-3 bg-[#F37021] text-white rounded-xl font-bold shadow-lg">Logout</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- TOP NAVIGATION (Fixed Mobile Visibility) --- */}
            <header className="bg-white border-b sticky top-0 z-[50] px-4 md:px-10 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1A5F7A] rounded-xl flex items-center justify-center text-white font-bold">
                            {student.name?.charAt(0)}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Student Portal</p>
                            <p className="text-sm font-bold text-[#1A5F7A]">{student.registrationId}</p>
                        </div>
                    </div>
                    
                    {/* Logout Trigger: Compact on mobile, labeled on desktop */}
                    <button 
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-100 active:scale-90 transition-transform"
                    >
                        <FiLogOut size={18} />
                        <span className="hidden md:inline">Exit Portal</span>
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-slate-100 relative overflow-hidden mb-10">
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-5xl font-black text-[#1A5F7A] leading-tight">
                            Welcome Back, <br/><span className="text-[#F37021] italic">{student.name?.split(' ')[0]}!</span>
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                            <QuickStat icon={<FiBookOpen />} label="Program" value={student.course || "N/A"} color="bg-blue-500" />
                            <QuickStat icon={<FiClock />} label="Status" value="Live Sync Active" color="bg-[#F37021]" />
                            <QuickStat icon={<FiAward />} label="Certification" value="In Progress" color="bg-green-500" />
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* --- FOOTER (Fix for image_cf995e.png Overlap) --- */}
            <footer className="bg-[#1A5F7A] text-white p-8 md:p-12 mt-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div>
                        <div className="font-black text-xl italic uppercase mb-4">Expert Computer</div>
                        <p className="text-blue-100/60 text-sm leading-relaxed max-w-sm">
                            Empowering students in Patna with IT excellence since 1987. Our 38+ year legacy is built on 100% practical learning.
                        </p>
                    </div>
                    <div className="flex flex-col md:items-end gap-6">
                        <div className="flex gap-4">
                            <SocialIcon icon={<FiFacebook />} /><SocialIcon icon={<FiInstagram />} /><SocialIcon icon={<FiYoutube />} /><SocialIcon icon={<FiLinkedin />} />
                        </div>
                        <button 
                            onClick={() => setShowLogoutModal(true)}
                            className="w-full md:w-auto bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                        >
                            <FiLogOut /> Terminate Portal Session
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Utility Components
function QuickStat({ icon, label, value, color }) {
    return (
        <div className="bg-slate-50 p-6 rounded-3xl flex items-center gap-5 border border-slate-100">
            <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>{icon}</div>
            <div>
                <p className="text-[9px] font-black uppercase text-slate-400">{label}</p>
                <p className="text-sm font-bold text-[#1A5F7A]">{value}</p>
            </div>
        </div>
    );
}

function SocialIcon({ icon }) {
    return <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#F37021] transition-all border border-white/10">{icon}</a>;
}