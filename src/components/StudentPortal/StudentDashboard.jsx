import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiAward, FiArrowRight, FiTarget, FiUser, FiHash, FiMail, FiPhone, FiCalendar, FiDollarSign, FiInfo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
    const [studentData, setStudentData] = useState(null);
    const [greeting, setGreeting] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudent = () => {
            const storedData = localStorage.getItem("studentData");
            if (!storedData) {
                navigate('/student-login');
                return;
            }
            setStudentData(JSON.parse(storedData));
            setLoading(false);
        };

        fetchStudent();
        
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 17) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, [navigate]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center font-black italic text-[#1A5F7A] bg-slate-50">
            SECURELY LOADING PROFILE...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
            {/* 1. MOST IMPORTANT: PROFILE HEADER */}
            <header className="max-w-7xl mx-auto mb-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center"
                >
                    <div className="w-32 h-32 bg-[#1A5F7A] rounded-full flex items-center justify-center text-white text-5xl font-black border-8 border-slate-50 shadow-inner">
                        {studentData.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                            <span className="bg-orange-100 text-[#F37021] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">
                                {studentData.registrationId}
                            </span>
                            <span className="bg-blue-100 text-[#1A5F7A] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">
                                Verified Student
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-[#1A5F7A] tracking-tighter uppercase italic">
                            {studentData.name}
                        </h1>
                        <p className="text-slate-400 font-bold mt-1">Enrollment Date: {new Date(studentData.enrollmentDate).toLocaleDateString() || 'N/A'}</p>
                    </div>

                    <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-slate-100 min-w-[200px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Course</p>
                        <p className="text-xl font-black text-[#1A5F7A] uppercase italic leading-none">{studentData.course}</p>
                    </div>
                </motion.div>
            </header>

            {/* 2. SECONDARY SECTION: PERSONAL DETAILS & DYNAMIC CONTENT */}
            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Profile Details Card */}
                <section className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                        <h2 className="text-[#1A5F7A] font-black uppercase text-sm mb-6 flex items-center gap-2 italic">
                            <FiUser className="text-[#F37021]"/> Personal Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ProfileField icon={<FiUser />} label="Father's Name" value={studentData.fatherName} />
                            <ProfileField icon={<FiMail />} label="Email Address" value={studentData.email} />
                            <ProfileField icon={<FiPhone />} label="Phone Number" value={studentData.phone} />
                            <ProfileField icon={<FiCalendar />} label="Date of Birth" value={new Date(studentData.dob).toLocaleDateString()} />
                        </div>
                    </div>

                    {/* DYNAMIC CONTENT BLOCK (e.g., Fee Details) */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                        <h2 className="text-[#1A5F7A] font-black uppercase text-sm mb-6 flex items-center gap-2 italic">
                            <FiDollarSign className="text-[#F37021]"/> Fee Status & Finance
                        </h2>
                        
                        {studentData.amountPaid > 0 ? (
                            <div className="flex items-center justify-between bg-green-50 p-6 rounded-3xl border border-green-100">
                                <div>
                                    <p className="text-[10px] font-black text-green-600 uppercase">Paid Amount</p>
                                    <p className="text-3xl font-black text-green-700 italic">₹{studentData.amountPaid}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                                    <span className="text-xs font-black text-green-600 uppercase italic">Cleared</span>
                                </div>
                            </div>
                        ) : (
                            /* THE "NO DATA" HANDLER */
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                    <FiInfo size={32} />
                                </div>
                                <h3 className="font-black text-slate-400 uppercase italic">No Fee Records Found</h3>
                                <p className="text-xs text-slate-400 max-w-[200px] mt-2 font-bold">Data will be visible once updated by the Accounts Department.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Quick Actions / Progress Sidebar */}
                <aside className="space-y-6">
                    <div className="bg-[#1A5F7A] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <h3 className="font-black italic uppercase tracking-tighter text-xl mb-4 leading-none">
                            {greeting}, <br/> <span className="text-[#F37021]">{studentData.name.split(' ')[0]}</span>
                        </h3>
                        <p className="text-xs text-white/60 font-bold mb-6 italic leading-relaxed">
                            Welcome to your workspace. Stay updated with your course progress.
                        </p>
                        <button className="w-full bg-[#F37021] py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg">
                            Go to Classroom <FiArrowRight />
                        </button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                         <h3 className="text-[#1A5F7A] font-black uppercase text-[10px] mb-4 tracking-widest italic">Upcoming Tasks</h3>
                         <div className="space-y-4">
                            <TaskItem label="Module 1 Exam" date="Pending" />
                            <TaskItem label="Final Project" date="Awaiting Data" />
                         </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

// Sub-components for cleaner structure
function ProfileField({ icon, label, value }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 text-[#F37021] rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
                <p className="text-sm font-bold text-[#1A5F7A] truncate">{value || "NO DATA"}</p>
            </div>
        </div>
    );
}

function TaskItem({ label, date }) {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[11px] font-bold text-slate-600 italic">{label}</p>
            <span className="text-[9px] font-black text-slate-400 uppercase italic bg-white px-2 py-1 rounded-lg border border-slate-100">{date}</span>
        </div>
    );
}