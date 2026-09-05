import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiClock, FiLock, FiAlertCircle, FiAward, FiCheckCircle, FiLoader, FiArrowLeft } from 'react-icons/fi';
import StudentQuizArea from './StudentQuizArea';

const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function StudentQuizHub() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeQuizId, setActiveQuizId] = useState(null);
    const [studentId, setStudentId] = useState(null);

    const fetchMyQuizzes = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("studentToken");
            const res = await axios.get(`${API_URL}/student/quizzes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(res.data.data);
        } catch (err) {
            console.error("Failed to fetch quizzes:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedData = localStorage.getItem("studentData");
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setStudentId(parsedData._id || parsedData.id);
        }
        fetchMyQuizzes();
    }, [fetchMyQuizzes]);

    // Triggers when student finishes exam and clicks "Return to Vault"
    const handleReturnToVault = () => {
        setActiveQuizId(null);
        fetchMyQuizzes(); // Refresh data to lock the exam if passed
    };

    if (loading && quizzes.length === 0) {
        return (
            <div className="h-96 flex flex-col justify-center items-center gap-4">
                <FiLoader className="animate-spin text-4xl text-[#F37021]" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Synchronizing Examination Vault...</p>
            </div>
        );
    }

    return (
        <div className="w-full pb-20 text-left max-w-6xl mx-auto mt-4 px-1">
            
            {activeQuizId ? (
                /* ==================================
                   EXAM MODE (Full Canvas Takeover)
                   ================================== */
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <button 
                        onClick={handleReturnToVault} 
                        className="text-slate-400 hover:text-red-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all bg-slate-900/50 border border-slate-800 px-4 py-2.5 rounded-xl w-fit shadow-sm hover:border-red-900/50 hover:bg-slate-900"
                    >
                        <FiArrowLeft size={14} /> Abandon Exam (Warning: Counts as attempt)
                    </button>
                    
                    <StudentQuizArea 
                        quizId={activeQuizId} 
                        studentId={studentId} 
                        onReturn={handleReturnToVault} // Passes the return function
                    />
                </motion.div>
            ) : (
                /* ==================================
                   VAULT MODE (Shows Cards)
                   ================================== */
                <div className="space-y-10">
                    <header className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900/80 border border-slate-700 text-[#F37021] rounded-2xl shadow-inner">
                            <FiEdit3 size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase italic leading-none tracking-tighter">
                                Examination <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200">Vault</span>
                            </h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                Assessments for your enrolled programs
                            </p>
                        </div>
                    </header>

                    {quizzes.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/40 backdrop-blur-md p-12 md:p-24 rounded-[3rem] shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-2 border-dashed border-slate-800 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner text-slate-600">
                                <FiAlertCircle size={32} />
                            </div>
                            <p className="text-slate-400 font-black uppercase text-[11px] tracking-widest">No active exams found for your program</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {quizzes.map((quiz, index) => {
                                const attemptsLeft = quiz.maxAttempts - quiz.attemptsUsed;
                                const isMaxedOut = attemptsLeft <= 0;
                                const hasPassed = quiz.hasPassed; // From backend

                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }} 
                                        whileInView={{ opacity: 1, y: 0 }} 
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                        key={quiz._id} 
                                        className={`bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border flex flex-col h-full relative overflow-hidden group transition-all duration-500 ${hasPassed ? 'border-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,0.1)]' : 'border-slate-800 hover:border-[#F37021]/50 hover:shadow-[0_10px_30px_rgba(243,112,33,0.15)]'}`}
                                    >
                                        
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1.5 border tracking-widest ${hasPassed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800/80 text-slate-400 border-slate-700'}`}>
                                                {hasPassed ? <FiAward size={12}/> : <FiEdit3 size={12}/>} 
                                                {hasPassed ? 'PASSED' : `${quiz.questions.length} Items`}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase italic flex items-center gap-1">
                                                <FiClock/> {quiz.durationMins}m
                                            </div>
                                        </div>
                                        
                                        <h3 className={`text-xl font-black italic leading-tight mb-2 transition-colors ${hasPassed ? 'text-emerald-400' : 'text-white group-hover:text-orange-300'}`}>{quiz.title}</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate mb-8">{quiz.targetCourse}</p>

                                        <div className="mt-auto">
                                            <div className="flex justify-between items-end mb-5 border-t border-slate-800/80 pt-5">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-1">Attempts</p>
                                                    <p className={`text-lg font-black italic leading-none ${isMaxedOut ? 'text-red-400' : hasPassed ? 'text-emerald-400' : 'text-white'}`}>
                                                        {quiz.attemptsUsed} <span className="text-xs text-slate-600">/ {quiz.maxAttempts}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Logic: If passed, show success. If maxed out, show locked. Otherwise, start exam. */}
                                            {hasPassed ? (
                                                <button disabled className="w-full py-4.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                                                    <FiCheckCircle size={16} /> Exam Cleared
                                                </button>
                                            ) : isMaxedOut ? (
                                                <button disabled className="w-full py-4.5 bg-slate-900/50 border border-slate-800 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                                                    <FiLock size={16} /> Max Attempts Reached
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setActiveQuizId(quiz._id || quiz.id)}
                                                    className="w-full py-4.5 bg-gradient-to-r from-[#F37021] to-orange-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_8px_20px_rgba(243,112,33,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                                >
                                                    Initiate Exam
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}