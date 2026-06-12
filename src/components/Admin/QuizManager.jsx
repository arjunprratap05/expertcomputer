import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiCheckCircle, FiEdit3, FiSave, FiList, FiUsers, FiAward, FiTrash2, FiLock, FiUnlock } from 'react-icons/fi';
import axios from 'axios';

import { techCoursesData, universityPrograms } from '../../data/courses';

const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function QuizManager() {
    const [quizzes, setQuizzes] = useState([]); 
    const [isCreating, setIsCreating] = useState(false);
    
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const res = await axios.get(`${API_URL}/admin/quizzes`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuizzes(res.data.data);
            } catch (err) {
                console.error("Failed to fetch quizzes:", err);
            }
        };
        fetchQuizzes();
    }, []);

    const allCourses = useMemo(() => {
        const combined = [...techCoursesData, ...universityPrograms];
        return combined.sort((a, b) => a.title.localeCompare(b.title));
    }, []);

    const [quizForm, setQuizForm] = useState({
        title: "",
        targetCourse: "ALL",
        durationMins: 30,
        questions: []
    });

    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: "",
        options: ["", "", "", ""],
        correctIndex: 0
    });

    const handleAddQuestion = () => {
        if (!currentQuestion.questionText) return alert("Question text required!");
        setQuizForm({
            ...quizForm,
            questions: [...quizForm.questions, currentQuestion]
        });
        setCurrentQuestion({ questionText: "", options: ["", "", "", ""], correctIndex: 0 });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const handleSaveQuiz = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("adminToken");
            const res = await axios.post(`${API_URL}/admin/quizzes`, quizForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // New quizzes default to LOCKED on the backend
            setQuizzes([res.data.data, ...quizzes]);
            setIsCreating(false);
            setQuizForm({ title: "", targetCourse: "ALL", durationMins: 30, questions: [] });
            alert("Quiz drafted successfully! It is currently LOCKED and hidden from students.");
        } catch (err) {
            console.error("Failed to deploy quiz:", err);
            alert("Deployment failed. Check console.");
        }
    };

    const handleDeleteQuiz = async (id, title) => {
        const confirmDelete = window.confirm(`WARNING: Are you sure you want to permanently delete the "${title}" exam?`);
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("adminToken");
            await axios.delete(`${API_URL}/admin/quizzes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(quizzes.filter(q => q._id !== id));
        } catch (err) {
            console.error("Failed to delete quiz:", err);
            alert("Failed to delete exam.");
        }
    };

    // --- NEW TOGGLE FUNCTION ---
    const handleToggleStatus = async (id) => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await axios.patch(`${API_URL}/admin/quizzes/${id}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update the UI instantly
            setQuizzes(quizzes.map(q => q._id === id ? { ...q, status: res.data.status } : q));
        } catch (err) {
            console.error("Failed to toggle status:", err);
            alert("Failed to change quiz visibility.");
        }
    };

    return (
        <div className="space-y-10">
            {/* Header & Controls */}
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic">Examination Engine</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Manage Quizzes & Analytics</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="bg-[#F37021] text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                    <FiPlus size={16}/> Deploy New Quiz
                </button>
            </div>

            {/* Active Quizzes Registry */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden text-left">
                <table className="w-full text-[11px]">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase border-b p-8 text-slate-400">
                        <tr>
                            <th className="p-8">Quiz Identity</th>
                            <th>Target Scope</th>
                            <th>Engagement Analytics</th>
                            <th>Duration</th>
                            <th className="pr-8 text-right">Status / Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold text-[11px]">
                        {quizzes.length === 0 && (
                            <tr><td colSpan="5" className="p-10 text-center text-slate-300 italic uppercase">No active quizzes deployed</td></tr>
                        )}
                        {quizzes.map((q) => {
                            // Determine visual state based on lock status
                            const isActive = q.status === 'ACTIVE';

                            return (
                                <tr key={q._id} className="hover:bg-slate-50 transition-all">
                                    <td className="p-8">
                                        <div className={`font-black uppercase italic text-[14px] ${isActive ? 'text-[#1A5F7A]' : 'text-slate-400 line-through decoration-slate-300'}`}>{q.title}</div>
                                        <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">
                                            {q.questions.length} Items Total
                                        </div>
                                    </td>
                                    <td className="uppercase opacity-80">{q.targetCourse}</td>
                                    
                                    <td>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-[#1A5F7A]">
                                                <FiUsers size={12}/> 
                                                <span>{q.studentsAttempted || 0} Student(s) Attempted</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-green-600">
                                                <FiAward size={12}/> 
                                                <span>{q.studentsPassed || 0} Student(s) Passed</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>{q.durationMins} Mins</td>
                                    
                                    <td className="pr-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            
                                            {/* VISIBILITY BADGE */}
                                            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border flex items-center gap-1 shadow-sm ${isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                {isActive ? <FiCheckCircle/> : <FiLock/>} {q.status || 'LOCKED'}
                                            </div>

                                            {/* TOGGLE LOCK BUTTON */}
                                            <button 
                                                onClick={() => handleToggleStatus(q._id)}
                                                className={`p-2 rounded-xl transition-all shadow-sm ${isActive ? 'bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white' : 'bg-[#1A5F7A] text-white hover:bg-[#124256]'}`}
                                                title={isActive ? "Lock Quiz (Hide from students)" : "Unlock Quiz (Publish to students)"}
                                            >
                                                {isActive ? <FiLock size={14} /> : <FiUnlock size={14} />}
                                            </button>

                                            {/* DELETE BUTTON */}
                                            <button 
                                                onClick={() => handleDeleteQuiz(q._id, q.title)}
                                                className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                title="Terminate Exam"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* QUIZ BUILDER MODAL */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3.5rem] p-10 max-w-4xl w-full shadow-2xl relative border-t-[15px] border-[#1A5F7A] max-h-[90vh] overflow-y-auto no-scrollbar">
                            <button onClick={() => setIsCreating(false)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><FiX size={24} /></button>
                            
                            <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic mb-8 border-b pb-4 flex items-center gap-3">
                                <FiEdit3 className="text-[#F37021]"/> Quiz Build Environment
                            </h3>

                            <form onSubmit={handleSaveQuiz} className="space-y-8">
                                {/* Quiz Meta Config */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-[#1A5F7A] ml-4 italic">Assessment Title</label>
                                        <input required className="w-full p-4 bg-white border-2 border-slate-100 rounded-[1.5rem] font-bold outline-none focus:border-[#F37021]" placeholder="e.g., React JS Mid-Term" value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-[#1A5F7A] ml-4 italic">Target Program</label>
                                        <select 
                                            required 
                                            className="w-full p-4 bg-white border-2 border-slate-100 rounded-[1.5rem] font-bold outline-none focus:border-[#F37021] cursor-pointer appearance-none truncate text-[13px]"
                                            value={quizForm.targetCourse} 
                                            onChange={e => setQuizForm({...quizForm, targetCourse: e.target.value})}
                                        >
                                            <option value="ALL">ALL GENERAL PROGRAMS</option>
                                            {allCourses.map(course => (
                                                <option key={course.id} value={course.title}>
                                                    {course.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-[#1A5F7A] ml-4 italic">Duration (Mins)</label>
                                        <input required type="number" min="1" className="w-full p-4 bg-white border-2 border-slate-100 rounded-[1.5rem] font-bold outline-none focus:border-[#F37021]" value={quizForm.durationMins} onChange={e => setQuizForm({...quizForm, durationMins: e.target.value})} />
                                    </div>
                                </div>

                                {/* Question Builder Sub-Module */}
                                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 relative">
                                    <div className="absolute -top-3 left-6 bg-white px-2 text-[10px] font-black uppercase text-[#F37021] italic flex items-center gap-1"><FiList/> Question Compiler</div>
                                    
                                    <div className="space-y-4">
                                        <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none focus:border-[#F37021] min-h-[80px] resize-none" placeholder="Enter question text here..." value={currentQuestion.questionText} onChange={e => setCurrentQuestion({...currentQuestion, questionText: e.target.value})} />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentQuestion.options.map((opt, idx) => (
                                                <div key={idx} className={`flex items-center p-2 rounded-2xl border-2 transition-all ${currentQuestion.correctIndex === idx ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-white'}`}>
                                                    <input 
                                                        type="radio" 
                                                        name="correctAnswer" 
                                                        checked={currentQuestion.correctIndex === idx} 
                                                        onChange={() => setCurrentQuestion({...currentQuestion, correctIndex: idx})} 
                                                        className="mx-4 accent-green-600 w-4 h-4 cursor-pointer" 
                                                        title="Mark as correct answer"
                                                    />
                                                    <input 
                                                        className="flex-1 bg-transparent border-none outline-none font-bold text-xs p-2" 
                                                        placeholder={`Option ${idx + 1}`} 
                                                        value={opt} 
                                                        onChange={(e) => handleOptionChange(idx, e.target.value)} 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <button type="button" onClick={handleAddQuestion} className="w-full py-4 border-2 border-[#1A5F7A] text-[#1A5F7A] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#1A5F7A] hover:text-white transition-all">
                                            + Commit Question to Bank
                                        </button>
                                    </div>
                                </div>

                                {/* Pre-flight checklist & Submit */}
                                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                    <div className="text-[10px] font-black uppercase text-slate-400 italic">
                                        Questions in Bank: <span className="text-[#F37021] text-lg">{quizForm.questions.length}</span>
                                    </div>
                                    <button type="submit" disabled={quizForm.questions.length === 0} className="bg-[#1A5F7A] disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 text-xs transition-all">
                                        <FiSave size={18}/> Authorize Deployment
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}