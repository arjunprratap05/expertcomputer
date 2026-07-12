import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUser, FiMail, FiRefreshCw, FiArrowRight, FiCheckCircle, 
    FiBook, FiActivity, FiLayers, FiChevronRight, FiTrendingUp, FiTarget,
    FiCpu, FiSend, FiLoader
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudentDashboard() {
    const [studentData, setStudentData] = useState(null);
    const [greeting, setGreeting] = useState("");
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, research, study
    
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || 'http://localhost:5000';

    // --- PROD LOGIC: AGGREGATE PROGRESS CALCULATION ---
    const calculateProgress = () => {
        if (!studentData?.enrollments) return 0;
        const total = studentData.enrollments.length;
        if (total === 0) return 0;
        const active = studentData.activeBatches?.length || 0;
        return Math.min(Math.round((active / total) * 100), 100);
    };

    const fetchFreshProfile = async (token) => {
        try {
            setSyncing(true);
            const res = await axios.get(`${API_URL}/auth/my-profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStudentData(res.data.student);
                localStorage.setItem("studentData", JSON.stringify(res.data.student));
                window.dispatchEvent(new CustomEvent("profileSynced", { detail: res.data.student }));
            }
        } catch (err) { 
            console.error("Profile Sync Failed", err);
        } finally { 
            setSyncing(false); 
            setLoading(false); 
        }
    };

    const switchCourse = (targetEnrollment) => {
        const updatedData = { ...studentData, course: targetEnrollment.course };
        setStudentData(updatedData);
        localStorage.setItem("studentData", JSON.stringify(updatedData));
        window.dispatchEvent(new CustomEvent("profileSynced", { detail: updatedData }));
    };

    useEffect(() => {
        const token = localStorage.getItem("studentToken");
        const storedData = localStorage.getItem("studentData");
        
        if (!token || !storedData) {
            // Fallback for development if no token (remove in pure prod)
            if (import.meta.env.MODE === 'development') {
                setStudentData({ name: "Dev User", course: "Development Mode", enrollments: [{course: "Development Mode", status: "Active"}] });
                setLoading(false);
            } else {
                return navigate('/student-login');
            }
        } else {
            setStudentData(JSON.parse(storedData));
            fetchFreshProfile(token);
        }
        
        const hour = new Date().getHours();
        setGreeting(hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening");
    }, [navigate]);

    if (loading || !studentData) return (
        <div className="h-screen flex flex-col items-center justify-center font-black italic text-[#1A5F7A] bg-slate-50 gap-4">
            <FiRefreshCw size={40} className="text-[#F37021] animate-spin" />
            SECURE AUTHENTICATION...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 text-left overflow-x-hidden">
            
            {/* --- HEADER COMPONENT --- */}
            <header className="max-w-7xl mx-auto mb-8 relative">
                {syncing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-6 right-4 flex items-center gap-2 text-[8px] font-black text-[#F37021] uppercase tracking-widest">
                        <FiRefreshCw className="animate-spin" /> Live Syncing Data
                    </motion.div>
                )}
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
                        <div className="w-24 h-24 bg-[#1A5F7A] shrink-0 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl">
                            {studentData.name?.charAt(0) || "S"}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-black text-[#1A5F7A] uppercase italic tracking-tighter">{studentData.name}</h1>
                            <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">
                                {studentData.enrollments?.length || 0} Active Programs Linked
                            </p>
                        </div>
                        <div className="bg-[#1A5F7A] p-6 rounded-3xl min-w-[240px] text-white shadow-xl text-center md:text-left">
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Active View</p>
                            <p className="text-xl font-black uppercase italic leading-none truncate">{studentData.course || "N/A"}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- AI TAB NAVIGATION --- */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto inline-flex">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<FiTarget />} label="Dashboard" />
                    <TabButton active={activeTab === 'research'} onClick={() => setActiveTab('research')} icon={<FiCpu />} label="AI Research" />
                    <TabButton active={activeTab === 'study'} onClick={() => setActiveTab('study')} icon={<FiLayers />} label="Study Lab" />
                </div>
            </div>

            {/* --- DYNAMIC CONTENT AREA --- */}
            <main className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {/* LEFT: COURSE LIST */}
                            <section className="md:col-span-2 space-y-6">
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                                    <h2 className="text-[#1A5F7A] font-black uppercase text-xs mb-6 flex items-center gap-2 italic tracking-widest">
                                        <FiLayers className="text-[#F37021]"/> Program Selector
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        {studentData.enrollments?.map((enroll, idx) => (
                                            <div key={idx} onClick={() => switchCourse(enroll)}
                                                className={`group cursor-pointer p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${
                                                    studentData.course === enroll.course ? 'border-[#F37021] bg-orange-50/30' : 'border-slate-50 bg-white hover:border-slate-200'
                                                }`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${studentData.course === enroll.course ? 'bg-[#F37021] text-white' : 'bg-slate-100'}`}>
                                                        <FiBook size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-[#1A5F7A] uppercase italic text-lg leading-none">{enroll.course}</h4>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Status: {enroll.status || "Active"}</p>
                                                    </div>
                                                </div>
                                                <FiChevronRight className={studentData.course === enroll.course ? "text-[#F37021]" : "text-slate-200"} />
                                            </div>
                                        ))}
                                        {(!studentData.enrollments || studentData.enrollments.length === 0) && (
                                            <div className="text-center p-8 text-slate-400 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-[2rem]">
                                                No programs enrolled yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* RIGHT: GLOBAL PROGRESS SIDEBAR */}
                            <aside className="space-y-6">
                                <div className="bg-[#1A5F7A] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h3 className="font-black italic uppercase tracking-tighter text-2xl mb-6">
                                            Learning <br/> <span className="text-[#F37021]">Consistency</span>
                                        </h3>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="text-5xl font-black italic tracking-tighter">{calculateProgress()}%</div>
                                            <div className="text-[10px] font-bold uppercase opacity-50 leading-tight">Sync <br/> Readiness</div>
                                        </div>

                                        <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-10">
                                            <motion.div 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${calculateProgress()}%` }}
                                                className="h-full bg-gradient-to-r from-orange-500 to-[#F37021]"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <button onClick={() => navigate('/classroom')} className="w-full bg-[#F37021] py-5 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-orange-900/20">
                                                Enter Classroom <FiArrowRight />
                                            </button>
                                        </div>
                                    </div>
                                    <FiTrendingUp className="absolute -bottom-10 -right-10 text-white/5 size-40 pointer-events-none" />
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                                    <h4 className="text-[10px] font-black text-[#1A5F7A] uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <FiTarget className="text-[#F37021]" /> Stream Analytics
                                    </h4>
                                    <div className="space-y-4">
                                        <StatRow label="Authorized Batches" value={studentData.activeBatches?.length || 0} />
                                        <StatRow label="Pending Batches" value={(studentData.enrollments?.length || 0) - (studentData.activeBatches?.length || 0)} />
                                    </div>
                                </div>
                            </aside>
                        </motion.div>
                    )}

                    {activeTab === 'research' && <ResearchTab key="research" />}
                    {activeTab === 'study' && <StudyLabTab key="study" />}
                </AnimatePresence>
            </main>
        </div>
    );
}

// ==========================================
// TAVILY AI RESEARCH TAB
// ==========================================
function ResearchTab() {
    const [searchQuery, setSearchQuery] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAISearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        
        try {
            // Replace with your actual backend /api/chat endpoint
            const res = await axios.post('/api/chat', { message: searchQuery });
            setAiResponse(res.data.response || "Research complete. No specific data returned.");
        } catch (err) {
            console.error(err);
            setAiResponse("Connection to AI Engine failed. Ensure backend service is active.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-white rounded-[3rem] border border-slate-100 p-6 md:p-10 shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#1A5F7A]/10 rounded-2xl flex items-center justify-center text-[#1A5F7A]">
                        <FiCpu className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#1A5F7A] uppercase italic leading-none">Live Research</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">Tavily Engine Enabled</p>
                    </div>
                </div>

                <form onSubmit={handleAISearch} className="relative flex items-center">
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ask anything (e.g., 'What are the time complexities of sorting algorithms?')"
                        className="w-full bg-slate-50 text-[#1A5F7A] text-sm font-semibold pl-6 pr-16 py-5 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#1A5F7A]/30 transition-all"
                    />
                    <button 
                        type="submit" disabled={isLoading || !searchQuery}
                        className="absolute right-3 bg-[#F37021] text-white p-3.5 rounded-xl shadow-md hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                        {isLoading ? <FiLoader className="animate-spin text-sm" /> : <FiSend className="text-sm" />}
                    </button>
                </form>

                {(isLoading || aiResponse) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                        {isLoading ? (
                            <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-wider animate-pulse">
                                <FiLoader className="animate-spin text-base text-[#F37021]" /> Compiling real-time context...
                            </div>
                        ) : (
                            <div>
                                <p className="text-[10px] font-black text-[#F37021] uppercase tracking-widest mb-3">AI Synthesis:</p>
                                <div className="text-[#1A5F7A] text-sm font-medium leading-relaxed whitespace-pre-wrap">{aiResponse}</div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

// ==========================================
// AI STUDY LAB TAB
// ==========================================
function StudyLabTab() {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active Recall Module */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-[#1A5F7A] uppercase flex items-center gap-2 text-lg italic tracking-tighter">
                            <FiLayers className="text-[#F37021]"/> Flashcards
                        </h3>
                    </div>

                    <div onClick={() => setIsFlipped(!isFlipped)} className="flex-1 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors min-h-[250px]">
                        {!isFlipped ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Question</p>
                                <p className="text-xl font-black text-[#1A5F7A] italic leading-tight">What is a Promise in JavaScript?</p>
                                <p className="text-[10px] text-[#F37021] mt-8 uppercase font-black tracking-widest animate-pulse">Tap to reveal</p>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <p className="text-[10px] font-black text-[#F37021] uppercase tracking-widest mb-4">Explanation</p>
                                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                    An object representing the eventual completion (or failure) of an asynchronous operation and its resulting value. It has three states: Pending, Fulfilled, or Rejected.
                                </p>
                            </motion.div>
                        )}
                    </div>

                    <AnimatePresence>
                        {isFlipped && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-2 mt-4">
                                <button onClick={() => setIsFlipped(false)} className="flex-1 py-3.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase hover:bg-red-100 border border-red-100">Hard (1d)</button>
                                <button onClick={() => setIsFlipped(false)} className="flex-1 py-3.5 rounded-xl bg-green-50 text-green-600 text-[10px] font-black uppercase hover:bg-green-100 border border-green-100">Easy (7d)</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Adaptive Quiz Module */}
                <div className="bg-[#1A5F7A] rounded-[2rem] p-8 shadow-xl text-white flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="font-black uppercase flex items-center gap-2 text-lg italic tracking-tighter">
                            <FiActivity className="text-[#F37021]"/> Adaptive Quiz
                        </h3>
                    </div>

                    <p className="text-xl font-black leading-relaxed mb-8 italic relative z-10">
                        Which array method should you use to create a new array containing only elements that pass a specific condition?
                    </p>

                    <div className="space-y-3 mt-auto relative z-10">
                        <QuizOption label="Array.map()" />
                        <QuizOption label="Array.filter()" correct />
                        <QuizOption label="Array.reduce()" />
                    </div>
                    <FiTrendingUp className="absolute -bottom-10 -right-10 text-white/5 size-64 pointer-events-none" />
                </div>
            </div>
        </motion.div>
    );
}

// ==========================================
// UTILITY SUB-COMPONENTS
// ==========================================
function TabButton({ active, onClick, icon, label }) {
    return (
        <button 
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                active ? 'bg-[#1A5F7A] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
        >
            <span className={active ? "text-[#F37021]" : ""}>{icon}</span>
            <span className="hidden md:inline">{label}</span>
        </button>
    );
}

function StatRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
            <span className="text-sm font-black text-[#1A5F7A] italic">{value}</span>
        </div>
    );
}

function QuizOption({ label, correct }) {
    const [selected, setSelected] = useState(false);
    return (
        <button 
            onClick={() => setSelected(true)}
            disabled={selected}
            className={`w-full text-left px-5 py-4 rounded-xl text-sm font-bold border-2 transition-all ${
                selected 
                    ? correct ? 'border-green-400 bg-green-500 text-white shadow-lg' : 'border-red-400 bg-red-500 text-white shadow-lg'
                    : 'border-white/20 hover:border-white/40 hover:bg-white/10 text-white/90'
            }`}
        >
            {label}
        </button>
    );
}