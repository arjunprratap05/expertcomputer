import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVideo, FiClock, FiSend, FiLoader, FiLayers, FiExternalLink, FiCheckCircle } from 'react-icons/fi';

export default function AddLecture() {
    const [batches, setBatches] = useState([]);
    const [recentLectures, setRecentLectures] = useState([]);
    const [status, setStatus] = useState('idle');
    const [historyLoading, setHistoryLoading] = useState(true); // Track history loading
    
    const [formData, setFormData] = useState({
        batchId: '', title: '', teacher: '',
        time: '', course: '', link: '', status: 'upcoming'
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('adminToken');

    // Sync History Function (Reusable)
    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_URL}/lms/add-lecture`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Based on your controller, the array is inside 'res.data.data' or 'res.data.lectures'
            setRecentLectures(res.data?.data || res.data?.lectures || []);
            setHistoryLoading(false);
        } catch (err) {
            console.error("History fetch failed", err);
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const batchRes = await axios.get(`${API_URL}/admin/batches/active`, { headers });
                setBatches(batchRes.data?.data || []);
                
                // Fetch historical list
                await fetchHistory();
            } catch (err) {
                console.error("Initial load failed", err);
            }
        };
        fetchInitialData();
    }, [API_URL, token]);

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
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post(`${API_URL}/lms/add-lecture`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setStatus('success');
            setFormData({ ...formData, title: '', link: '' });
            
            // Immediately refresh the list from server
            await fetchHistory();
            
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) { 
            setStatus('idle'); 
            alert("Broadcast Failed"); 
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-8 p-6 text-left">
            {/* LEFT: FORM SECTION */}
            <div className="lg:col-span-7 bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100 h-fit">
                <header className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><FiVideo size={24} /></div>
                    <h2 className="text-xl font-black text-[#1A5F7A] uppercase italic">Sync Live Link</h2>
                </header>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Select Batch</label>
                        <select required className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-[#1A5F7A] border-none outline-none appearance-none" onChange={handleBatchChange} value={formData.batchId}>
                            <option value="">Select Scheduled Batch</option>
                            {batches.map(b => (
                                <option key={b._id} value={b._id}>{b.batchCode} ({b.startTime})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Course Slug</label>
                            <input readOnly value={formData.course} className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs text-slate-500" />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Start Time</label>
                            <input readOnly value={formData.time} className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs text-slate-500" />
                        </div>
                    </div>

                    <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-orange-200" placeholder="Topic Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-orange-200" placeholder="Professor" value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})} />
                    <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-orange-200" placeholder="Meeting Link (Zoom/Google Meet)" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />

                    <button type="submit" disabled={status === 'loading'} className="w-full py-5 bg-[#F37021] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95">
                        {status === 'loading' ? <FiLoader className="animate-spin" /> : status === 'success' ? <FiCheckCircle /> : <FiSend />} 
                        {status === 'success' ? 'Link Pushed' : 'Push to Students'}
                    </button>
                </form>
            </div>

            {/* RIGHT: HISTORY SIDEBAR */}
            <div className="lg:col-span-5 bg-slate-50 rounded-[2.5rem] p-6 border border-dashed border-slate-200 h-[750px] flex flex-col">
                <header className="flex justify-between items-center mb-6 px-2">
                    <h3 className="font-black text-slate-400 uppercase text-xs">Broadcast History</h3>
                    <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full shadow-sm text-slate-500">
                        {recentLectures.length} Links
                    </span>
                </header>
                
                <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                    {historyLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300">
                            <FiLoader className="animate-spin mb-2" size={24} />
                            <p className="text-xs font-bold uppercase tracking-widest">Syncing List...</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {recentLectures.map((lecture) => (
                                <motion.div 
                                    key={lecture._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-orange-200 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-[#1A5F7A] text-sm uppercase italic leading-tight pr-4">
                                            {lecture.title || "Untitled Lecture"}
                                        </h4>
                                        <span className="bg-green-100 text-green-600 text-[8px] font-black px-2 py-1 rounded-md shrink-0">LIVE</span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-400 mb-4">
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                            <FiLayers size={12} className="text-orange-400" /> 
                                            {lecture.batchId?.batchCode || lecture.batchCode || "General"}
                                        </span>
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                            <FiClock size={12} className="text-orange-400" /> 
                                            {lecture.time || "N/A"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                        <span className="text-[10px] font-bold text-slate-500 italic">By {lecture.teacher}</span>
                                        <a 
                                            href={lecture.link} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="text-[#F37021] text-[10px] font-black uppercase flex items-center gap-1 hover:underline"
                                        >
                                            Join <FiExternalLink />
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {!historyLoading && recentLectures.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 italic opacity-40">
                            <FiVideo size={48} className="mb-4" />
                            <p className="text-xs font-bold uppercase">No broadcasts found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}