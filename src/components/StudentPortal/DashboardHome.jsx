import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiClock, FiUser, FiLogOut, FiAward } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function DashboardHome() {
    const [student, setStudent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve the dynamic data we stored during login
        const savedData = localStorage.getItem("studentData");
        if (savedData) {
            setStudent(JSON.parse(savedData));
        } else {
            // If no data, kick back to login (Safety check)
            navigate('/student-login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/student-login');
    };

    // Dynamic greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    if (!student) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
            {/* Top Navigation Bar */}
            <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1A5F7A] rounded-xl flex items-center justify-center text-white font-bold">
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Portal</p>
                        <p className="text-sm font-bold text-[#1A5F7A]">{student.registrationId}</p>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                >
                    <FiLogOut /> LOGOUT
                </button>
            </div>

            {/* Main Welcome Hero */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
            >
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F37021]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                
                <div className="relative z-10">
                    <span className="px-4 py-2 bg-orange-50 text-[#F37021] rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                        Welcome Back
                    </span>
                    
                    <h1 className="text-4xl md:text-6xl font-black text-[#1A5F7A] mt-6 mb-4 tracking-tighter">
                        {getGreeting()}, <br />
                        <span className="text-[#F37021] italic">{student.name.split(' ')[0]}!</span>
                    </h1>
                    
                    <p className="text-slate-500 max-w-md font-medium leading-relaxed">
                        Ready to continue your learning journey at Expert Computer Academy? Your courses and latest lectures are waiting for you.
                    </p>

                    {/* Quick Stats/Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        <QuickStat icon={<FiBookOpen />} label="Course" value={student.course || "General"} color="bg-blue-500" />
                        <QuickStat icon={<FiClock />} label="Current Batch" value="10:00 AM - 12:00 PM" color="bg-purple-500" />
                        <QuickStat icon={<FiAward />} label="Attendance" value="88%" color="bg-green-500" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Helper Component for Stats
function QuickStat({ icon, label, value, color }) {
    return (
        <div className="bg-slate-50 p-6 rounded-3xl flex items-center gap-5 border border-slate-100">
            <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-lg font-bold text-[#1A5F7A]">{value}</p>
            </div>
        </div>
    );
}