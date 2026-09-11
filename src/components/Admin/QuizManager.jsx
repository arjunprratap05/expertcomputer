import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPlus, FiX, FiCheckCircle, FiEdit3, FiSave, FiList, 
    FiUsers, FiAward, FiTrash2, FiLock, FiUnlock, FiUploadCloud, 
    FiCpu, FiLoader, FiAlertCircle 
} from 'react-icons/fi';
import axios from 'axios';
import { techCoursesData, universityPrograms } from '../../data/courses';

// Normalizes API base URL to prevent missing or duplicated '/api' paths
const rawApiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;

export default function QuizManager() {
    const [quizzes, setQuizzes] = useState([]); 
    const [isCreating, setIsCreating] = useState(false);
    
    // AI Generation States
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [notification, setNotification] = useState('');
    const fileInputRef = useRef(null);

    const token = localStorage.getItem("adminToken");

    const fetchQuizzes = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/quizzes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch quizzes:", err);
        }
    };
    
    useEffect(() => {
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

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 4000);
    };

    // --- AI PDF INTEGRATION ---
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPdfFile(e.target.files[0]);
        }
    };

    const generateFromPdf = async () => {
        if (!pdfFile) return showNotification('Please upload a PDF document first.');
        
        setIsGenerating(true);
        const uploadData = new FormData();
        uploadData.append('document', pdfFile);

        try {
            const res = await axios.post(`${API_BASE}/quizzes/generate-from-pdf`, uploadData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (res.data.success && res.data.questions) {
                const formattedQuestions = res.data.questions.map(q => ({
                    questionText: q.question,
                    options: q.options,
                    correctIndex: q.correctIndex
                }));

                setQuizForm(prev => ({
                    ...prev,
                    questions: [...prev.questions, ...formattedQuestions]
                }));
                
                setPdfFile(null);
                showNotification('AI successfully extracted questions!');
            }
        } catch (error) {
            console.error(error);
            showNotification('Failed to generate questions. Ensure PDF text is readable.');
        } finally {
            setIsGenerating(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddQuestion = () => {
        if (!currentQuestion.questionText.trim()) return alert("Question text required!");
        if (currentQuestion.options.some(opt => !opt.trim())) return alert("All 4 options must be filled!");
        
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

    const removeQuestion = (indexToRemove) => {
        setQuizForm(prev => ({
            ...prev,
            questions: prev.questions.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleSaveQuiz = async (e) => {
        e.preventDefault();
        if (quizForm.questions.length === 0) {
            return alert("Add at least one question before deploying.");
        }

        try {
            const res = await axios.post(`${API_BASE}/admin/quizzes`, quizForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setQuizzes([res.data.data, ...quizzes]);
            setIsCreating(false);
            setQuizForm({ title: "", targetCourse: "ALL", durationMins: 30, questions: [] });
            showNotification("Quiz created! It is currently locked.");
        } catch (err) {
            console.error("Failed to deploy quiz:", err);
            alert(err.response?.data?.message || "Deployment failed.");
        }
    };

    const handleDeleteQuiz = async (id, title) => {
        const confirmDelete = window.confirm(`Permanently delete the exam: "${title}"?`);
        if (!confirmDelete) return;

        try {
            await axios.delete(`${API_BASE}/admin/quizzes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(quizzes.filter(q => q._id !== id));
            showNotification("Exam removed from registry.");
        } catch (err) {
            console.error("Failed to delete quiz:", err);
            alert("Failed to delete exam.");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await axios.patch(
                `${API_BASE}/admin/quizzes/${id}/status`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            const updatedStatus = res.data?.status || res.data?.data?.status;
            setQuizzes(quizzes.map(q => q._id === id ? { ...q, status: updatedStatus } : q));
            showNotification(`Quiz status set to ${updatedStatus}`);
        } catch (err) {
            console.error("Failed to toggle status:", err);
            alert(err.response?.data?.message || "Failed to update quiz visibility.");
        }
    };

    return (
        <div className="space-y-8 relative text-left">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ y: -40, opacity: 0, x: "-50%" }} 
                        animate={{ y: 20, opacity: 1, x: "-50%" }} 
                        exit={{ y: -40, opacity: 0, x: "-50%" }} 
                        className="fixed top-6 left-1/2 bg-[#0A192F] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 z-[9999] border border-slate-700 border-b-4 border-b-[#F37021]"
                    >
                        <FiAlertCircle className="text-[#F37021] text-sm" /> {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header & Deploy Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                <div>
                    <h3 className="text-2xl font-black text-white uppercase italic leading-none tracking-tight">
                        Examination <span className="text-[#F37021]">Engine</span>
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">
                        Manage Assessments, Status & Real-time Metrics
                    </p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="bg-[#F37021] hover:bg-orange-600 text-white px-5 py-3 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg shadow-orange-950/40 active:scale-95 transition-all flex items-center gap-2"
                >
                    <FiPlus size={16}/> Deploy New Quiz
                </button>
            </div>

            {/* Quizzes Registry Table */}
            <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[780px]">
                        <thead className="bg-slate-950 font-black uppercase border-b border-slate-800 text-slate-400 text-[10px] tracking-wider">
                            <tr>
                                <th className="p-5 pl-7">Quiz Identity</th>
                                <th>Target Scope</th>
                                <th>Engagement Analytics</th>
                                <th>Duration</th>
                                <th className="pr-7 text-right">Visibility / Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 font-bold">
                            {quizzes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-500 uppercase tracking-widest text-[10px]">
                                        No active quizzes deployed in registry
                                    </td>
                                </tr>
                            ) : (
                                quizzes.map((q) => {
                                    const isActive = q.status === 'ACTIVE';

                                    return (
                                        <tr key={q._id} className="hover:bg-slate-900/50 transition-colors">
                                            <td className="p-5 pl-7">
                                                <div className={`font-black uppercase italic text-sm ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                                    {q.title}
                                                </div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                                                    {q.questions?.length || 0} Questions Total
                                                </div>
                                            </td>
                                            <td className="uppercase text-slate-300">{q.targetCourse}</td>
                                            
                                            <td>
                                                <div className="flex flex-col gap-1 text-[11px]">
                                                    <span className="flex items-center gap-1.5 text-sky-400">
                                                        <FiUsers size={12}/> {q.studentsAttempted || 0} Attempted
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-emerald-400">
                                                        <FiAward size={12}/> {q.studentsPassed || 0} Passed
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="text-slate-300">{q.durationMins} Mins</td>
                                            
                                            <td className="pr-7 text-right">
                                                <div className="flex items-center justify-end gap-2.5">
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border flex items-center gap-1 ${
                                                        isActive 
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                                            : 'bg-slate-900 text-slate-500 border-slate-750'
                                                    }`}>
                                                        {isActive ? <FiCheckCircle size={11}/> : <FiLock size={11}/>} 
                                                        {q.status || 'LOCKED'}
                                                    </span>

                                                    <button 
                                                        onClick={() => handleToggleStatus(q._id)}
                                                        className={`p-2 rounded-xl transition-all border ${
                                                            isActive 
                                                                ? 'bg-orange-500/10 text-[#F37021] border-orange-500/30 hover:bg-orange-500/20' 
                                                                : 'bg-[#1A5F7A] text-white border-[#1A5F7A] hover:bg-[#14475c]'
                                                        }`}
                                                        title={isActive ? "Lock Exam (Hide from Students)" : "Unlock Exam (Make Active)"}
                                                    >
                                                        {isActive ? <FiLock size={14} /> : <FiUnlock size={14} />}
                                                    </button>

                                                    <button 
                                                        onClick={() => handleDeleteQuiz(q._id, q.title)}
                                                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-all"
                                                        title="Delete Assessment"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Assessment Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.95, opacity: 0 }} 
                            className="bg-[#0A192F] text-white rounded-3xl p-7 md:p-8 max-w-3xl w-full shadow-2xl relative border border-slate-750 border-t-8 border-t-[#1A5F7A] max-h-[90vh] overflow-y-auto no-scrollbar"
                        >
                            <button onClick={() => setIsCreating(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-400">
                                <FiX size={20} />
                            </button>
                            
                            <h3 className="text-xl font-black text-white uppercase italic mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
                                <FiEdit3 className="text-[#F37021]"/> Quiz Creation Environment
                            </h3>

                            <form onSubmit={handleSaveQuiz} className="space-y-6 text-left">
                                {/* Basic Form Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-inner">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assessment Title</label>
                                        <input 
                                            required 
                                            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-xs text-white outline-none focus:border-[#F37021] placeholder:text-slate-600 shadow-inner" 
                                            placeholder="e.g. Node.js Exam" 
                                            value={quizForm.title} 
                                            onChange={e => setQuizForm({...quizForm, title: e.target.value})} 
                                        />
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Course</label>
                                        <select 
                                            required 
                                            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-xs text-white outline-none focus:border-[#F37021] cursor-pointer shadow-inner"
                                            value={quizForm.targetCourse} 
                                            onChange={e => setQuizForm({...quizForm, targetCourse: e.target.value})}
                                        >
                                            <option value="ALL">ALL GENERAL PROGRAMS</option>
                                            {allCourses.map(course => (
                                                <option key={course.id || course.title} value={course.title}>
                                                    {course.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Duration (Mins)</label>
                                        <input 
                                            required 
                                            type="number" 
                                            min="1" 
                                            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-xs text-white outline-none focus:border-[#F37021] shadow-inner text-center" 
                                            value={quizForm.durationMins} 
                                            onChange={e => setQuizForm({...quizForm, durationMins: Number(e.target.value)})} 
                                        />
                                    </div>
                                </div>

                                {/* AI Auto-Generation Module */}
                                <div className="bg-gradient-to-br from-[#1A5F7A] to-[#0A192F] border border-slate-700/60 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h4 className="font-black uppercase italic text-base flex items-center gap-2">
                                            <FiCpu className="text-[#F37021]" /> AI Extraction Engine
                                        </h4>
                                        <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
                                            Upload a syllabus or study material in PDF format. The extraction engine will automatically compile multiple-choice questions into this draft.
                                        </p>
                                    </div>
                                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0 relative z-10">
                                        <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()} 
                                            className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-700 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 text-slate-200 transition-colors"
                                        >
                                            <FiUploadCloud size={14} className="text-[#F37021]" /> 
                                            {pdfFile ? `${pdfFile.name.substring(0, 15)}...` : 'Select Document'}
                                        </button>
                                        <button 
                                            type="button" 
                                            disabled={!pdfFile || isGenerating} 
                                            onClick={generateFromPdf}
                                            className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                                                !pdfFile 
                                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-750' 
                                                    : 'bg-[#F37021] hover:bg-orange-600 text-white shadow-orange-950/40'
                                            }`}
                                        >
                                            {isGenerating ? <><FiLoader className="animate-spin" /> Compiling...</> : <><FiCpu /> Compile AI</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Active Question Bank List */}
                                {quizForm.questions.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-[#F37021] ml-1">
                                            Questions Added ({quizForm.questions.length})
                                        </label>
                                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                                            {quizForm.questions.map((q, idx) => (
                                                <div key={idx} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
                                                    <span className="text-xs font-bold text-slate-200 truncate flex-1">
                                                        {idx + 1}. {q.questionText}
                                                    </span>
                                                    <button type="button" onClick={() => removeQuestion(idx)} className="text-slate-500 hover:text-red-400 p-1">
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Manual Question Entry Form */}
                                <div className="p-5 border-2 border-dashed border-slate-850 rounded-2xl bg-slate-900/40 space-y-4">
                                    <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                        <FiList size={12} className="text-[#F37021]" /> Add Manual Question
                                    </div>
                                    <textarea 
                                        className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl font-bold text-xs text-white outline-none focus:border-[#F37021] min-h-[70px] resize-none placeholder:text-slate-600 shadow-inner" 
                                        placeholder="Enter question statement..." 
                                        value={currentQuestion.questionText} 
                                        onChange={e => setCurrentQuestion({...currentQuestion, questionText: e.target.value})} 
                                    />
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {currentQuestion.options.map((opt, idx) => (
                                            <div key={idx} className={`flex items-center p-2 rounded-xl border transition-all ${
                                                currentQuestion.correctIndex === idx 
                                                    ? 'border-emerald-500/60 bg-emerald-500/10' 
                                                    : 'border-slate-800 bg-slate-900'
                                            }`}>
                                                <input 
                                                    type="radio" 
                                                    name="correctAnswer" 
                                                    checked={currentQuestion.correctIndex === idx} 
                                                    onChange={() => setCurrentQuestion({...currentQuestion, correctIndex: idx})} 
                                                    className="mx-2 accent-emerald-500 cursor-pointer"
                                                    title="Mark this option as correct"
                                                />
                                                <input 
                                                    className="flex-1 bg-transparent border-none outline-none font-bold text-xs py-1 text-white placeholder:text-slate-600" 
                                                    placeholder={`Option ${idx + 1}`} 
                                                    value={opt} 
                                                    onChange={e => handleOptionChange(idx, e.target.value)} 
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        type="button" 
                                        onClick={handleAddQuestion} 
                                        className="w-full py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-black uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                                    >
                                        + Append Question to Bank
                                    </button>
                                </div>

                                {/* Save/Deploy Action */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <div className="text-xs font-black uppercase text-slate-400">
                                        Total Questions: <span className="text-[#F37021]">{quizForm.questions.length}</span>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={quizForm.questions.length === 0} 
                                        className="bg-[#F37021] hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-orange-950/40 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        <FiSave size={16} /> Deploy to Registry
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