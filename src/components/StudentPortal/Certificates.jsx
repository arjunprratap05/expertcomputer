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
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full pb-20 text-left max-w-6xl mx-auto mt-4 px-1"
        >
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-slate-900/80 border border-slate-700 text-[#F37021] rounded-2xl shadow-inner">
                    <FiAward size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white uppercase italic leading-none tracking-tighter">
                        Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200">Recognition</span>
                    </h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                        Verify and Download your credentials
                    </p>
                </div>
            </div>

            {hasCertificate ? (
                <div className="max-w-xl">
                    <div className="bg-slate-900/40 backdrop-blur-md p-8 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/50 relative overflow-hidden group hover:border-[#F37021]/50 transition-colors duration-500">
                        {/* Ambient Glow */}
                        <div className="absolute -top-10 -right-10 w-60 h-60 bg-[#F37021]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#F37021]/20 transition-colors duration-500" />
                        
                        <div className="relative z-10 flex flex-col items-center md:items-start">
                            
                            <div className="w-20 h-20 bg-slate-950 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <FiAward className="text-4xl text-[#F37021]" />
                            </div>
                            
                            <div className="text-center md:text-left mb-8">
                                <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight mb-2">Certificate of Excellence</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                                    Awarded to <span className="text-emerald-400 font-black flex items-center gap-1"><FiCheckCircle size={12}/> Verified Student</span>
                                </p>
                                <p className="text-lg font-black text-white mt-1 capitalize">{student?.name}</p>
                            </div>
                            
                            <div className="w-full bg-slate-950/50 border border-slate-800 shadow-inner p-5 rounded-2xl mb-8">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase mb-3">
                                    <span className="text-slate-500 tracking-widest">Course:</span>
                                    <span className="text-white text-right max-w-[60%] line-clamp-2">{student?.course}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase border-t border-slate-800/80 pt-3">
                                    <span className="text-slate-500 tracking-widest">Status:</span>
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px]">Graduated</span>
                                </div>
                            </div>

                            <button className="w-full bg-gradient-to-r from-[#F37021] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_25px_rgba(243,112,33,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95">
                                <FiDownload size={16} /> Download Diploma
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-900/40 backdrop-blur-md p-12 md:p-16 rounded-[3rem] border-2 border-dashed border-slate-800 text-center max-w-2xl flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-950 border border-slate-800 shadow-inner rounded-full flex items-center justify-center mb-6 text-slate-500">
                        <FiLock size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase italic mb-3 tracking-tight">Certificate Locked</h3>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest max-w-sm leading-relaxed">
                        Your certificate will be generated automatically once your curriculum and final assessment are completed.
                    </p>
                </div>
            )}
        </motion.div>
    );
}