import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiEdit3, FiClock, FiLock, FiAlertCircle, FiAward, FiCheckCircle } from 'react-icons/fi';
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
        return <div className="p-10 text-center font-black text-[#1A5F7A] uppercase italic animate-pulse mt-20">Synchronizing Examination Vault...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            
            {activeQuizId ? (
                /* ==================================
                   EXAM MODE (Full Canvas Takeover)
                   ================================== */
                <div className="space-y-6">
                    <button 
                        onClick={handleReturnToVault} 
                        className="text-[#F37021] font-black uppercase text-[10px] tracking-widest hover:underline flex items-center gap-2"
                    >
                        ← Abandon Exam (Warning: Counts as attempt)
                    </button>
                    
                    <StudentQuizArea 
                        quizId={activeQuizId} 
                        studentId={studentId} 
                        onReturn={handleReturnToVault} // Passes the return function
                    />
                </div>
            ) : (
                /* ==================================
                   VAULT MODE (Shows Cards)
                   ================================== */
                <div className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-black text-[#1A5F7A] uppercase italic tracking-tight">Examination Vault</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assessments for your enrolled programs</p>
                    </div>

                    {quizzes.length === 0 ? (
                        <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
                            <FiAlertCircle size={48} className="text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No active exams found for your program</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quizzes.map((quiz) => {
                                const attemptsLeft = quiz.maxAttempts - quiz.attemptsUsed;
                                const isMaxedOut = attemptsLeft <= 0;
                                const hasPassed = quiz.hasPassed; // From backend

                                return (
                                    <div key={quiz._id} className={`bg-white rounded-[2rem] p-6 shadow-sm border-2 flex flex-col h-full relative overflow-hidden group hover:shadow-xl transition-all ${hasPassed ? 'border-green-400' : 'border-slate-100'}`}>
                                        
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 border ${hasPassed ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-[#1A5F7A] border-blue-100'}`}>
                                                {hasPassed ? <FiAward size={12}/> : <FiEdit3/>} 
                                                {hasPassed ? 'PASSED' : `${quiz.questions.length} Items`}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase italic flex items-center gap-1">
                                                <FiClock/> {quiz.durationMins}m
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-xl font-black text-[#1A5F7A] italic leading-tight mb-2">{quiz.title}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mb-8">{quiz.targetCourse}</p>

                                        <div className="mt-auto">
                                            <div className="flex justify-between items-end mb-4 border-t pt-4">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Attempts</p>
                                                    <p className={`text-lg font-black italic leading-none ${isMaxedOut ? 'text-red-500' : hasPassed ? 'text-green-500' : 'text-[#1A5F7A]'}`}>
                                                        {quiz.attemptsUsed} <span className="text-sm text-slate-300">/ {quiz.maxAttempts}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Logic: If passed, show success. If maxed out, show locked. Otherwise, start exam. */}
                                            {hasPassed ? (
                                                <button disabled className="w-full py-4 bg-green-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-200">
                                                    <FiCheckCircle size={16} /> Exam Cleared
                                                </button>
                                            ) : isMaxedOut ? (
                                                <button disabled className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                                                    <FiLock size={16} /> Max Attempts Reached
                                                </button>
                                            ) : (
                                                <button 
                                                onClick={() => setActiveQuizId(quiz._id || quiz.id)}
                                                    className="w-full py-4 bg-[#F37021] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-orange-200 hover:scale-[1.02] active:scale-95 transition-all"
                                                >
                                                    Initiate Exam
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}