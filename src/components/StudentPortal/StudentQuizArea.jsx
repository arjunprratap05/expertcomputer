import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCheckCircle, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function StudentQuizArea({ quizId, studentId, onReturn }) {
    const [quizData, setQuizData] = useState(null);
    const [answers, setAnswers] = useState([]); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null); 
    const [fetchError, setFetchError] = useState(false);
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState(null); // In seconds

    useEffect(() => {
        // Defensive check to ensure we don't try to fetch an 'undefined' ID
        if (!quizId || quizId === 'undefined') {
            setFetchError(true);
            return;
        }

        const fetchQuiz = async () => {
            try {
                const token = localStorage.getItem("studentToken");
                const res = await axios.get(`${API_URL}/student/quizzes/${quizId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data.data;
                setQuizData(data);
                setAnswers(new Array(data.questions.length).fill(null));
                // Initialize timer (Convert minutes to seconds)
                setTimeLeft(data.durationMins * 60);
            } catch (err) {
                console.error("Failed to fetch exam protocol:", err);
                setFetchError(true);
            }
        };
        fetchQuiz();
    }, [quizId]);

    // Core Submission Engine (Handles both manual and auto triggers)
    const executeSubmission = useCallback(async (isAutoSubmit = false) => {
        // Prevent double submission
        if (isSubmitting || result) return;

        // If manual submission, check for blanks. Auto-submit skips this warning.
        if (!isAutoSubmit && answers.includes(null)) {
            const confirm = window.confirm("You have unanswered questions. Are you sure you want to finalize?");
            if (!confirm) return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("studentToken");
            const res = await axios.post(`${API_URL}/student/quizzes/${quizId}/submit`, {
                studentId: studentId,
                studentAnswers: answers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(res.data);
        } catch (err) {
            console.error("Submission failed:", err);
            alert(err.response?.data?.message || "Failed to submit exam.");
        } finally {
            setIsSubmitting(false);
        }
    }, [answers, isSubmitting, quizId, result, studentId]);

    // Timer Countdown Engine
    useEffect(() => {
        // Stop timer if exam is loading, already submitted, or currently submitting
        if (timeLeft === null || result || isSubmitting) return;

        // Trigger Auto-Submit when time reaches zero
        if (timeLeft <= 0) {
            executeSubmission(true);
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        // Cleanup interval on unmount or re-render
        return () => clearInterval(timerId);
    }, [timeLeft, result, isSubmitting, executeSubmission]);

    const handleSelectOption = (questionIndex, optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    // Format seconds into MM:SS
    const formatTime = (seconds) => {
        if (seconds === null) return "--:--";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // --- ERROR / LOADING STATES ---
    if (fetchError) return (
        <div className="p-10 text-center font-black text-red-400 uppercase italic mt-20 flex flex-col items-center gap-4 bg-slate-900/40 rounded-[3rem] border border-slate-800 max-w-2xl mx-auto backdrop-blur-md">
            <FiAlertTriangle size={48} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            <p>Failed to load examination parameters.<br/><span className="text-[10px] tracking-widest text-slate-500 mt-2 block">Invalid Exam ID or Session Expired.</span></p>
            <button onClick={onReturn} className="mt-4 px-8 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl hover:bg-slate-700 hover:text-white transition-all text-xs tracking-widest uppercase">Go Back</button>
        </div>
    );

    if (!quizData) return (
        <div className="p-10 font-black text-slate-500 uppercase italic animate-pulse flex flex-col items-center justify-center h-full min-h-[400px] gap-4 tracking-widest text-sm">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-[#F37021] rounded-full animate-spin" />
            Initializing Secure Exam Environment...
        </div>
    );

    // --- SCORE RENDERER ---
    if (result) {
        const percentage = (result.score / result.total) * 100;
        const isPassed = percentage >= 60; // Assuming 60% is the passing threshold

        return (
            <div className="max-w-2xl mx-auto mt-10 bg-slate-900/60 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center border border-slate-800 border-t-[12px] overflow-hidden relative"
                 style={{ borderTopColor: isPassed ? '#10b981' : '#f37021' }}>
                
                {/* Ambient Glow */}
                <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full blur-[100px] opacity-20 pointer-events-none ${isPassed ? 'bg-emerald-500' : 'bg-orange-500'}`} />

                {isPassed ? (
                    <FiCheckCircle className="mx-auto text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" size={80} />
                ) : (
                    <FiAlertTriangle className="mx-auto text-orange-400 mb-6 drop-shadow-[0_0_15px_rgba(243,112,33,0.4)]" size={80} />
                )}
                
                <h2 className="text-3xl font-black text-white uppercase italic mb-2 tracking-tight">Examination Concluded</h2>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Results securely logged to your profile</p>
                
                <div className="bg-slate-950/50 border border-slate-800 rounded-[2rem] p-8 inline-block w-full max-w-md mb-8 shadow-inner">
                    <div className={`text-6xl font-black italic tracking-tighter ${isPassed ? 'text-emerald-400' : 'text-[#F37021]'}`}>
                        {result.score} <span className="text-2xl text-slate-600">/ {result.total}</span>
                    </div>
                    <div className="mt-4 text-[14px] font-black uppercase text-white tracking-widest">
                        Final Accuracy: {percentage.toFixed(1)}%
                    </div>
                    <div className={`mt-4 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full inline-block border ${isPassed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                        {isPassed ? "STATUS: PASSED" : "STATUS: FAILED / RETAKE REQUIRED"}
                    </div>
                </div>

                <button 
                    onClick={onReturn}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-slate-700 hover:text-white active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                >
                    Return to Vault
                </button>
            </div>
        );
    }

    // Determine if we are in the 5-minute warning window (<= 300 seconds)
    const isWarningState = timeLeft <= 300 && timeLeft > 0;

    // --- QUIZ INTERFACE RENDERER ---
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 relative px-1 mt-4">
            
            {/* Exam Header & Timer */}
            <div className="bg-[#0A192F]/90 backdrop-blur-md border border-slate-800 text-white p-6 md:p-8 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden gap-6 sticky top-20 z-[60]">
                <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight leading-tight">{quizData.title}</h2>
                    <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                        {quizData.targetCourse}
                    </p>
                </div>
                
                {/* Timer Display Widget */}
                <motion.div 
                    animate={isWarningState ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={`relative z-10 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-inner border-2 min-w-[180px] justify-center transition-colors duration-300 ${isWarningState ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-900/80 border-slate-700 text-[#F37021]'}`}
                >
                    {isWarningState ? <FiAlertCircle size={24} className="animate-pulse" /> : <FiClock size={24} />}
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-80 leading-none text-slate-400">Time Remaining</span>
                        <span className={`font-black text-2xl uppercase italic leading-none mt-1 ${isWarningState ? 'text-red-400' : 'text-white'}`}>{formatTime(timeLeft)}</span>
                    </div>
                </motion.div>
            </div>

            {/* 5-Minute Warning Banner */}
            <AnimatePresence>
                {isWarningState && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl font-black text-[10px] uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-lg backdrop-blur-sm mx-2">
                        <FiAlertTriangle size={18} className="animate-pulse"/> 5 Minutes Remaining. System will auto-submit when time expires.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Question List */}
            <div className="space-y-6">
                {quizData.questions.map((q, qIndex) => (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qIndex * 0.05 }} key={qIndex} className="bg-slate-900/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-lg border border-slate-800 relative hover:border-[#F37021]/30 transition-colors group">
                        
                        <div className="absolute -top-3 left-6 md:left-8 bg-slate-950 px-4 py-1.5 border border-slate-700 text-[9px] font-black uppercase text-slate-400 tracking-widest rounded-full shadow-inner">
                            Question {qIndex + 1} <span className="opacity-50 mx-1">of</span> {quizData.questions.length}
                        </div>
                        
                        <h3 className="text-base md:text-lg font-bold text-white mt-4 mb-6 leading-relaxed tracking-wide">{q.questionText}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, oIndex) => {
                                const isSelected = answers[qIndex] === oIndex;
                                return (
                                    <button 
                                        key={oIndex}
                                        onClick={() => handleSelectOption(qIndex, oIndex)}
                                        className={`p-4 md:p-5 text-left rounded-2xl border transition-all duration-300 font-bold text-sm flex items-center shadow-sm ${isSelected ? 'border-[#F37021] bg-[#F37021]/10 text-[#F37021] shadow-[0_0_15px_rgba(243,112,33,0.15)]' : 'border-slate-800 hover:border-slate-600 text-slate-300 bg-slate-950/50 hover:bg-slate-800/50'}`}
                                    >
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-4 border-2 flex-shrink-0 transition-colors duration-300 ${isSelected ? 'border-[#F37021] bg-[#F37021] text-white' : 'border-slate-700 text-slate-500'}`}>
                                            <span className="text-[10px] font-black">{String.fromCharCode(65 + oIndex)}</span>
                                        </div>
                                        <span className="leading-snug">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Submission Action */}
            <div className="flex justify-end pt-8 border-t border-slate-800 mt-8">
                <button 
                    onClick={() => executeSubmission(false)}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 border border-transparent text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all text-xs disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center gap-3 w-full md:w-auto justify-center"
                >
                    {isSubmitting ? "Transmitting Results..." : (
                        <>
                            <FiCheckCircle size={18} /> Finalize & Submit Exam
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}