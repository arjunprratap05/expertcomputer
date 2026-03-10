import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FiUser, FiMail, FiHash, FiCalendar, 
    FiShield, FiAward, FiCheckCircle, FiTrendingUp, FiLayers, FiBookOpen 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function StudentProfile() {
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

    if (!student) return (
        <div className="h-96 flex items-center justify-center font-black italic text-[#1A5F7A] animate-pulse uppercase tracking-widest">
            Fetching Secure Records...
        </div>
    );

    const formatDate = (dateString) => {
        if (!dateString) return "Active Member";
        return new Date(dateString).toLocaleDateString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric' 
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
            <div className="max-w-6xl mx-auto px-4 pt-8">
                {/* Header Title */}
                <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-black text-[#1A5F7A] uppercase tracking-tighter italic">
                        Student <span className="text-[#F37021]">Dashboard</span>
                    </h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1 italic">
                        Expert Academy Official ERP Profile
                    </p>
                </div>

                {/* Main Grid: Changed md to lg to prevent iPad squeezing */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* ID Card Side */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center sticky top-8"
                    >
                        <div className="relative mb-6">
                            <div className="w-32 h-32 bg-gradient-to-br from-[#1A5F7A] to-[#F37021] rounded-full p-1 shadow-lg">
                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-4xl font-black text-[#1A5F7A]">
                                    {student?.name?.charAt(0)}
                                </div>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-green-500 text-white p-2 rounded-full border-4 border-white">
                                <FiCheckCircle size={14} />
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-[#1A5F7A] mb-1 uppercase tracking-tight break-words px-2">{student?.name}</h3>
                        <p className="text-[9px] font-black text-[#F37021] uppercase tracking-widest bg-orange-50 px-4 py-1.5 rounded-full mt-2 mb-6">
                            Verified Profile
                        </p>
                        <div className="w-full pt-6 border-t border-dashed border-slate-200">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                                <span>Aadhaar Sync</span>
                                <span className="text-green-600 flex items-center gap-1 font-black"><FiShield /> Validated</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content Side */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        className="lg:col-span-2 space-y-6"
                    >
                        
                        {/* Multi-Course Tracker */}
                        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100">
                            <h4 className="text-[11px] font-black text-[#1A5F7A] uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                                <FiLayers className="text-[#F37021]" /> Academic Journey
                            </h4>
                            <div className="space-y-4">
                                {student.enrollments && student.enrollments.length > 0 ? (
                                    student.enrollments.map((course, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1A5F7A] shrink-0">
                                                    <FiBookOpen size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[#1A5F7A] uppercase italic leading-tight">{course.course}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enrolled: {formatDate(course.enrolledAt)}</p>
                                                </div>
                                            </div>
                                            <span className="text-[8px] font-black uppercase px-3 py-1 bg-green-100 text-green-600 rounded-full italic self-start sm:self-center">
                                                {course.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 bg-orange-50 rounded-xl text-center">
                                        <p className="text-[10px] font-black text-orange-600 uppercase">Legacy Account: {student.course}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Personal Records - Fixed Grid for iPad */}
                        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100">
                            <h4 className="text-[11px] font-black text-[#1A5F7A] uppercase tracking-widest mb-8 flex items-center gap-2 italic">
                                <FiUser className="text-[#F37021]" /> Personal Records
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                <InfoItem icon={<FiHash />} label="Registration ID" value={student?.registrationId} />
                                <InfoItem icon={<FiMail />} label="Official Email" value={student?.email} />
                                <InfoItem icon={<FiCalendar />} label="Member Since" value={formatDate(student?.createdAt)} />
                                <InfoItem icon={<FiShield />} label="Identity Doc" value={`AADHAAR-XXXX-${student?.aadhaarNo?.slice(-4)}`} />
                            </div>
                        </div>

                        {/* Financial Card */}
                        <div className="bg-[#1A5F7A] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3 italic">Account Statement</h4>
                            <div className="flex flex-wrap items-end gap-3">
                                <span className="text-4xl font-black italic tracking-tighter">₹{Number(student?.amountPaid || 0).toLocaleString('en-IN')}</span>
                                <div className="flex flex-col mb-1.5">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#F37021]">Total Paid</span>
                                    <span className="text-[8px] opacity-40 uppercase">Verified Ledger</span>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center gap-4">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0">
                                    <FiTrendingUp className="text-[#F37021]" /> Active Status
                                </div>
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-400 w-full" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-4 overflow-hidden">
            <div className="mt-1 text-[#F37021] text-lg bg-orange-50 p-2 rounded-xl shrink-0">{icon}</div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
                {/* Added break-all to prevent long emails from breaking the layout */}
                <p className="text-sm font-bold text-[#1A5F7A] uppercase italic leading-tight break-all">
                    {value || "Pending Sync"}
                </p>
            </div>
        </div>
    );
}