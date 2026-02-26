import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiDownload, FiCheckCircle, FiLock } from 'react-icons/fi';

export default function Certificates() {
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem("studentData");
        if (data) setStudent(JSON.parse(data));
    }, []);

    const hasCertificate = student?.courseCompleted; // Boolean check from DB

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-2xl font-black text-[#1A5F7A] uppercase italic">Academic <span className="text-[#F37021]">Recognition</span></h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Verify and Download your credentials</p>
            </div>

            {hasCertificate ? (
                <div className="max-w-md mx-auto md:mx-0">
                    <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-double border-orange-100 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full opacity-50" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <FiAward className="text-6xl text-[#F37021] mb-4" />
                            <h3 className="text-xl font-black text-[#1A5F7A] uppercase italic">Certificate of Excellence</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-8">Awarded to {student?.name}</p>
                            
                            <div className="w-full bg-slate-50 p-4 rounded-2xl mb-6">
                                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                    <span className="text-slate-400">Course:</span>
                                    <span className="text-[#1A5F7A]">{student?.course}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-slate-400">Issued On:</span>
                                    <span className="text-[#1A5F7A]">Feb 2026</span>
                                </div>
                            </div>

                            <button className="w-full bg-[#1A5F7A] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-[#F37021] transition-all flex items-center justify-center gap-3">
                                <FiDownload size={18} /> Download Diploma
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 rounded-[3rem] border-2 border-dashed border-slate-200 text-center max-w-2xl">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <FiLock size={32} />
                    </div>
                    <h3 className="text-xl font-black text-[#1A5F7A] uppercase italic">Certificate Locked</h3>
                    <p className="text-slate-400 text-sm font-medium mt-2 max-w-xs mx-auto">Your certificate will be generated automatically once your course and final assessment are completed.</p>
                </div>
            )}
        </motion.div>
    );
}