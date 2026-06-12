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
        <div className="p-10 text-center font-black text-red-500 uppercase italic mt-20 flex flex-col items-center gap-4">
            <FiAlertTriangle size={48} />
            Failed to load examination parameters. Invalid Exam ID.
            <button onClick={onReturn} className="mt-4 px-6 py-2 bg-slate-100 text-[#1A5F7A] rounded-xl hover:bg-slate-200 transition-all">Go Back</button>
        </div>
    );

    if (!quizData) return <div className="p-10 font-black text-[#1A5F7A] uppercase italic animate-pulse flex items-center justify-center h-full min-h-[400px]">Initializing Exam Environment...</div>;

    // --- SCORE RENDERER ---
    if (result) {
        const percentage = (result.score / result.total) * 100;
        const isPassed = percentage >= 60; // Assuming 60% is the passing threshold

        return (
            <div className="max-w-2xl mx-auto mt-10 bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border-t-[15px] border-[#1A5F7A]">
                {isPassed ? (
                    <FiCheckCircle className="mx-auto text-green-500 mb-6" size={80} />
                ) : (
                    <FiAlertTriangle className="mx-auto text-orange-500 mb-6" size={80} />
                )}
                
                <h2 className="text-3xl font-black text-[#1A5F7A] uppercase italic mb-2">Examination Concluded</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Results securely logged to your profile</p>
                
                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 inline-block w-full max-w-md mb-8 shadow-inner">
                    <div className={`text-6xl font-black italic tracking-tighter ${isPassed ? 'text-green-600' : 'text-[#F37021]'}`}>
                        {result.score} <span className="text-2xl text-slate-300">/ {result.total}</span>
                    </div>
                    <div className="mt-4 text-[14px] font-black uppercase text-[#1A5F7A]">
                        Final Accuracy: {percentage.toFixed(1)}%
                    </div>
                    <div className={`mt-2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block border ${isPassed ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                        {isPassed ? "STATUS: PASSED" : "STATUS: FAILED / RETAKE REQUIRED"}
                    </div>
                </div>

                <button 
                    onClick={onReturn}
                    className="w-full bg-[#1A5F7A] text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
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
        <div className="max-w-4xl mx-auto space-y-8 pb-20 relative">
            
            {/* Exam Header & Timer */}
            <div className="bg-[#1A5F7A] text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden gap-6 sticky top-20 z-[60]">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-wide leading-tight">{quizData.title}</h2>
                    <p className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em] mt-2">{quizData.targetCourse}</p>
                </div>
                
                {/* Timer Display Widget */}
                <motion.div 
                    animate={isWarningState ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg border-2 min-w-[180px] justify-center ${isWarningState ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-[#F37021] border-[#F37021] text-white'}`}
                >
                    {isWarningState ? <FiAlertCircle size={24} /> : <FiClock size={24} />}
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-80 leading-none">Time Remaining</span>
                        <span className="font-black text-2xl uppercase italic leading-none mt-1">{formatTime(timeLeft)}</span>
                    </div>
                </motion.div>
            </div>

            {/* 5-Minute Warning Banner */}
            <AnimatePresence>
                {isWarningState && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-2xl font-black text-xs uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-sm mx-2">
                        <FiAlertTriangle size={18}/> 5 Minutes Remaining. System will auto-submit when time expires.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Question List */}
            <div className="space-y-6 px-2">
                {quizData.questions.map((q, qIndex) => (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qIndex * 0.1 }} key={qIndex} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 relative hover:border-[#1A5F7A] transition-colors">
                        <div className="absolute -top-4 left-8 bg-slate-100 px-4 py-1 border border-slate-200 text-[10px] font-black uppercase text-[#1A5F7A] rounded-full shadow-sm">
                            Question {qIndex + 1} of {quizData.questions.length}
                        </div>
                        
                        <h3 className="text-lg md:text-xl font-bold text-slate-800 mt-4 mb-6 leading-relaxed">{q.questionText}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, oIndex) => {
                                const isSelected = answers[qIndex] === oIndex;
                                return (
                                    <button 
                                        key={oIndex}
                                        onClick={() => handleSelectOption(qIndex, oIndex)}
                                        className={`p-5 text-left rounded-2xl border-2 transition-all font-bold text-sm flex items-center ${isSelected ? 'border-[#F37021] bg-orange-50 text-[#F37021] shadow-md' : 'border-slate-100 hover:border-slate-300 text-slate-600 bg-slate-50 hover:bg-white'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 border-2 flex-shrink-0 ${isSelected ? 'border-[#F37021] bg-[#F37021] text-white' : 'border-slate-300 text-slate-400'}`}>
                                            <span className="text-[10px] font-black">{String.fromCharCode(65 + oIndex)}</span>
                                        </div>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Submission Action */}
            <div className="flex justify-end pt-8 px-2 border-t border-slate-200 mt-8">
                <button 
                    onClick={() => executeSubmission(false)}
                    disabled={isSubmitting}
                    className="bg-[#1A5F7A] text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-xs disabled:opacity-50 disabled:translate-y-0 flex items-center gap-3 w-full md:w-auto justify-center"
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