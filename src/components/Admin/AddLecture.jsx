import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiVideo, FiClock, FiSend, FiLoader, FiLayers, 
    FiExternalLink, FiCheckCircle, FiBookOpen, FiUser 
} from 'react-icons/fi';

// Normalizes API base URL to prevent missing or duplicated '/api' paths
const rawApiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;

export default function AddLecture() {
    const [batches, setBatches] = useState([]);
    const [recentLectures, setRecentLectures] = useState([]);
    const [status, setStatus] = useState('idle');
    const [historyLoading, setHistoryLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        batchId: '', 
        title: '', 
        teacher: '',
        time: '', 
        course: '', 
        link: '', 
        status: 'upcoming'
    });

    const token = localStorage.getItem('adminToken');

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_BASE}/lms/add-lecture`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentLectures(res.data?.data || res.data?.lectures || []);
        } catch (err) {
            console.error("History fetch failed", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const batchRes = await axios.get(`${API_BASE}/admin/batches/active`, { headers });
                setBatches(batchRes.data?.data || []);
                await fetchHistory();
            } catch (err) {
                console.error("Initial load failed", err);
            }
        };
        fetchInitialData();
    }, [token]);

    const handleBatchChange = (e) => {
        const bId = e.target.value;
        const selected = batches.find(b => b._id === bId);
        if (selected) {
            setFormData({
                ...formData,
                batchId: bId,
                course: selected.courseId || '',
                time: selected.startTime || ''
            });
        } else {
            setFormData({
                ...formData,
                batchId: '',
                course: '',
                time: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post(`${API_BASE}/lms/add-lecture`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setStatus('success');
            setFormData({ ...formData, title: '', link: '' });
            await fetchHistory();
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) { 
            setStatus('idle'); 
            alert("Broadcast submission failed. Please check endpoint status."); 
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-8 text-left">
            {/* LEFT: FORM SECTION */}
            <div className="lg:col-span-7 bg-[#0A192F]/80 backdrop-blur-md rounded-3xl shadow-xl p-8 md:p-10 border border-slate-800 h-fit relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F37021]/5 rounded-full -mr-28 -mt-28 blur-3xl pointer-events-none" />
                
                <header className="mb-8 flex items-center gap-3.5 border-b border-slate-800 pb-5 relative z-10">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-[#F37021] rounded-2xl shadow-inner">
                        <FiVideo size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic leading-none tracking-tight">
                            Sync Live <span className="text-[#F37021]">Stream</span>
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            Broadcast Classroom Meeting Links to Authorized Batches
                        </p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Select Academic Batch
                        </label>
                        <select 
                            required 
                            className="w-full p-4 bg-slate-900/90 rounded-2xl font-bold text-white border border-slate-800 focus:border-[#F37021] outline-none transition-all cursor-pointer shadow-inner"
                            onChange={handleBatchChange} 
                            value={formData.batchId}
                        >
                            <option value="" className="bg-slate-900 text-slate-400">Select Scheduled Batch</option>
                            {batches.map(b => (
                                <option key={b._id} value={b._id} className="bg-slate-900 text-white">
                                    {b.batchCode} ({b.startTime} - {b.endTime || 'End TBD'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Course Track
                            </label>
                            <input 
                                readOnly 
                                placeholder="Auto-populated"
                                value={formData.course} 
                                className="w-full p-4 bg-slate-900/50 rounded-2xl font-bold text-xs text-slate-400 border border-slate-800/80 outline-none shadow-inner" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Scheduled Timing
                            </label>
                            <input 
                                readOnly 
                                placeholder="Auto-populated"
                                value={formData.time} 
                                className="w-full p-4 bg-slate-900/50 rounded-2xl font-bold text-xs text-slate-400 border border-slate-800/80 outline-none shadow-inner" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Topic Title
                        </label>
                        <input 
                            required 
                            className="w-full p-4 bg-slate-900/90 rounded-2xl font-bold text-white outline-none border border-slate-800 focus:border-[#F37021] transition-all placeholder:text-slate-600 shadow-inner" 
                            placeholder="e.g. Masterclass on Neural Networks & Vector DBs" 
                            value={formData.title} 
                            onChange={e => setFormData({ ...formData, title: e.target.value })} 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Faculty / Instructor
                        </label>
                        <input 
                            required 
                            className="w-full p-4 bg-slate-900/90 rounded-2xl font-bold text-white outline-none border border-slate-800 focus:border-[#F37021] transition-all placeholder:text-slate-600 shadow-inner" 
                            placeholder="e.g. Faculty Name or Guest Speaker" 
                            value={formData.teacher} 
                            onChange={e => setFormData({ ...formData, teacher: e.target.value })} 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Live Stream / Meeting URL
                        </label>
                        <input 
                            required 
                            type="url"
                            className="w-full p-4 bg-slate-900/90 rounded-2xl font-bold text-white outline-none border border-slate-800 focus:border-[#F37021] transition-all placeholder:text-slate-600 shadow-inner" 
                            placeholder="https://meet.google.com/... or Zoom link" 
                            value={formData.link} 
                            onChange={e => setFormData({ ...formData, link: e.target.value })} 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={status === 'loading'} 
                        className="w-full py-4 bg-[#F37021] hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50 mt-2"
                    >
                        {status === 'loading' ? (
                            <><FiLoader className="animate-spin text-base" /> Broadcasting...</>
                        ) : status === 'success' ? (
                            <><FiCheckCircle size={16} /> Link Synced to Classroom!</>
                        ) : (
                            <><FiSend size={16} /> Push to Student Classroom</>
                        )} 
                    </button>
                </form>
            </div>

            {/* RIGHT: BROADCAST HISTORY SIDEBAR */}
            <div className="lg:col-span-5 bg-[#0A192F]/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl h-[750px] flex flex-col">
                <header className="flex justify-between items-center mb-6 px-2 pb-4 border-b border-slate-800">
                    <h3 className="font-black text-slate-300 uppercase text-xs tracking-wider flex items-center gap-2">
                        <FiClock className="text-[#F37021]" /> Broadcast History
                    </h3>
                    <span className="text-[10px] font-black bg-slate-900 text-[#F37021] px-3 py-1 rounded-full border border-slate-800 shadow-inner">
                        {recentLectures.length} Links
                    </span>
                </header>
                
                <div className="space-y-3.5 overflow-y-auto pr-1 flex-1 no-scrollbar">
                    {historyLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <FiLoader className="animate-spin mb-2 text-[#F37021]" size={24} />
                            <p className="text-xs font-bold uppercase tracking-widest">Syncing History...</p>
                        </div>
                    ) : recentLectures.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
                            <FiVideo size={42} className="mb-3 opacity-30" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No active broadcasts logged</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {recentLectures.map((lecture) => (
                                <motion.div 
                                    key={lecture._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white text-xs uppercase italic leading-tight pr-3 truncate max-w-[200px]">
                                            {lecture.title || "Untitled Lecture"}
                                        </h4>
                                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-400 mb-3">
                                        <span className="flex items-center gap-1.5 bg-[#0A192F] px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                                            <FiLayers size={11} className="text-[#F37021]" /> 
                                            {lecture.batchId?.batchCode || lecture.batchCode || "General Batch"}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-[#0A192F] px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                                            <FiClock size={11} className="text-[#F37021]" /> 
                                            {lecture.time || "Scheduled"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[10px]">
                                        <span className="font-bold text-slate-400 italic flex items-center gap-1.5">
                                            <FiUser size={11} className="text-slate-500" /> {lecture.teacher || "Faculty"}
                                        </span>
                                        <a 
                                            href={lecture.link} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="text-[#F37021] hover:text-orange-400 font-black uppercase flex items-center gap-1 transition-colors"
                                        >
                                            Join <FiExternalLink size={12} />
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}