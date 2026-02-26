import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiVideo, FiClock, FiSend, FiCheckCircle, 
    FiLoader, FiTrash2, FiUser, FiExternalLink, 
    FiCalendar, FiPlusCircle 
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

export default function AddLecture() {
    const allAvailableCourses = [...techCoursesData, ...universityPrograms];
    const [status, setStatus] = useState('idle');
    const [lectures, setLectures] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        teacher: '',
        time: '',
        course: allAvailableCourses[0]?.id || '',
        link: '',
        status: 'upcoming'
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    const token = localStorage.getItem('adminToken');

    const fetchLectures = useCallback(async () => {
        setIsFetching(true);
        try {
            const res = await axios.get(`${API_URL}/lms/lectures`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setLectures(res.data.lectures || []);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setIsFetching(false);
        }
    }, [API_URL, token]);

    useEffect(() => { fetchLectures(); }, [fetchLectures]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return alert("Admin session expired.");
        setStatus('loading');
        try {
            await axios.post(`${API_URL}/lms/add-lecture`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStatus('success');
            setFormData({ ...formData, title: '', teacher: '', link: '' });
            fetchLectures();
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            setStatus('idle');
            alert(err.response?.data?.message || "Sync Failed.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Mark this lecture as cancelled? It will remain visible but disabled for students.")) return;
        setDeleteId(id);
        try {
            // Note: We are using a PATCH or DELETE here depending on your backend preference. 
            // If using the 'isCancelled' logic from previous step:
            await axios.delete(`${API_URL}/lms/delete-lecture/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchLectures(); // Refresh list to see the status change
        } catch (err) {
            alert("Update failed.");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 w-full overflow-x-hidden">
            {/* Header Area */}
            <div className="bg-[#1A5F7A] pt-12 pb-20 px-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                            Lecture <span className="text-[#F37021]">Commander</span>
                        </h1>
                        <p className="text-blue-100/60 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1">
                            Expert Academy Control Panel
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest px-2">System Live</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: FORM */}
                <div className="lg:col-span-5 xl:col-span-4 w-full">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden lg:sticky lg:top-8"
                    >
                        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center gap-3">
                            <FiPlusCircle className="text-[#F37021]" size={24} />
                            <h2 className="text-lg font-black text-[#1A5F7A] uppercase italic text-left">Create Session</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Course</label>
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-[#1A5F7A] outline-none border-2 border-transparent focus:border-[#F37021]/30 focus:bg-white transition-all appearance-none text-sm"
                                    value={formData.course}
                                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                                >
                                    {allAvailableCourses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <input required className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#F37021]/30 text-sm" placeholder="Lecture Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                                <input required className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#F37021]/30 text-sm" placeholder="Professor Name" value={formData.teacher} onChange={(e) => setFormData({...formData, teacher: e.target.value})} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input required className="w-full pl-10 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-[#F37021]/30" placeholder="10:00 AM" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
                                </div>
                                <select className="w-full px-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-[#F37021]/30" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="live">Live Now</option>
                                </select>
                            </div>

                            <input required className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#F37021]/30 text-sm" placeholder="Class URL (Zoom/Meet)" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} />

                            <button disabled={status === 'loading'} type="submit" className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${status === 'success' ? 'bg-green-500 shadow-green-200' : 'bg-[#F37021] shadow-orange-200'} text-white`}>
                                {status === 'loading' ? <FiLoader className="animate-spin" /> : status === 'success' ? <FiCheckCircle size={18} /> : <FiSend size={18} />} 
                                {status === 'loading' ? 'Syncing...' : status === 'success' ? 'Published' : 'Broadcast Lecture'}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* RIGHT: LIST */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#1A5F7A] p-3 rounded-2xl text-white shadow-lg">
                                <FiCalendar size={20} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-[#1A5F7A] uppercase italic text-lg leading-none">Schedule</h3>
                                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Active Sessions: {lectures.length}</p>
                            </div>
                        </div>
                        {isFetching && <FiLoader className="animate-spin text-[#F37021]" />}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                            {lectures.map((lec) => (
                                <motion.div 
                                    key={lec._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group ${lec.isCancelled ? 'grayscale' : ''}`}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${lec.isCancelled ? 'bg-slate-400 text-white' : lec.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-50 text-[#1A5F7A]'}`}>
                                                {lec.isCancelled ? 'CANCELLED' : lec.status}
                                            </span>
                                            <button 
                                                onClick={() => handleDelete(lec._id)} 
                                                disabled={deleteId === lec._id || lec.isCancelled}
                                                className={`text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all ${lec.isCancelled ? 'hidden' : ''}`}
                                            >
                                                {deleteId === lec._id ? <FiLoader className="animate-spin" /> : <FiTrash2 size={16} />}
                                            </button>
                                        </div>
                                        <h4 className={`font-black text-[#1A5F7A] text-md line-clamp-1 uppercase italic text-left ${lec.isCancelled ? 'line-through opacity-50' : ''}`}>{lec.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 text-left">ID: {lec.course}</p>
                                        
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                                <FiUser className="text-[#F37021]" size={14} /> {lec.teacher}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                                <FiClock className="text-[#F37021]" size={14} /> {lec.time}
                                            </div>
                                        </div>
                                    </div>

                                    <a 
                                        href={lec.isCancelled ? '#' : lec.link} 
                                        target={lec.isCancelled ? '_self' : '_blank'} 
                                        rel="noreferrer" 
                                        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${lec.isCancelled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 group-hover:bg-[#1A5F7A] group-hover:text-white'}`}
                                    >
                                        {lec.isCancelled ? 'SESSION VOID' : 'Join Session'} <FiExternalLink size={14} />
                                    </a>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}