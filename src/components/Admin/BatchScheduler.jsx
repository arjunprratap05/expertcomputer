import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiClock, FiPlus, FiCheckCircle, FiLoader, FiLayers, 
    FiTrash2, FiUser, FiBook, FiAlertCircle 
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

// URL normalization helper to prevent double '/api' issues
const rawApiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;

export default function BatchScheduler() {
    const [status, setStatus] = useState('idle');
    const [activeBatches, setActiveBatches] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    
    // Combine all course data for the selector
    const allAvailableCourses = [...techCoursesData, ...universityPrograms];

    const [batch, setBatch] = useState({
        batchCode: '', 
        courseId: allAvailableCourses[0]?.id || '',
        startTime: '', 
        endTime: '', 
        days: []
    });

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const token = localStorage.getItem('adminToken');

    const fetchBatches = async () => {
        setIsFetching(true);
        try {
            const res = await axios.get(`${API_BASE}/admin/batches/active`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActiveBatches(res.data.data || []);
        } catch (err) { 
            console.error("Batch Sync Error:", err); 
        } finally { 
            setIsFetching(false); 
        }
    };

    useEffect(() => { 
        fetchBatches(); 
    }, []);

    const toggleDay = (day) => {
        const updatedDays = batch.days.includes(day) 
            ? batch.days.filter(d => d !== day) 
            : [...batch.days, day];
        setBatch({ ...batch, days: updatedDays });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (batch.days.length === 0) return alert("Select active weekly days!");
        setStatus('loading');
        try {
            await axios.post(`${API_BASE}/admin/batches/create`, batch, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus('success');
            setBatch({ 
                batchCode: '', 
                courseId: allAvailableCourses[0]?.id || '', 
                startTime: '', 
                endTime: '', 
                days: [] 
            });
            fetchBatches();
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) { 
            setStatus('idle'); 
            alert(err.response?.data?.message || "Error creating timetable batch"); 
        }
    };

    const handleDeleteBatch = async (id) => {
        if (!window.confirm("Are you sure you want to remove this academic batch timetable?")) return;
        
        try {
            await axios.delete(`${API_BASE}/admin/batches/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBatches();
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete failed: Route not found or server rejected.");
        }
    };

    return (
        <div className="space-y-8 text-left max-w-6xl mx-auto">
            
            {/* FORM CARD */}
            <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F37021]/5 rounded-full -mr-28 -mt-28 blur-3xl pointer-events-none" />
                
                <header className="mb-8 flex items-center gap-4 relative z-10 border-b border-slate-800 pb-5">
                    <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl text-[#F37021] shadow-inner">
                        <FiClock size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic leading-none tracking-tight">
                            Batch <span className="text-[#F37021]">Master</span>
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            Configure Class Timetables & Live Stream Windows
                        </p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Unique Batch Code
                            </label>
                            <input 
                                required 
                                className="w-full p-4 bg-slate-900/90 rounded-2xl font-black uppercase text-white outline-none border border-slate-800 focus:border-[#F37021] transition-all placeholder:text-slate-600 shadow-inner" 
                                placeholder="e.g. PY-MORN-MAR" 
                                value={batch.batchCode} 
                                onChange={e => setBatch({ ...batch, batchCode: e.target.value.toUpperCase() })} 
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Select Target Course
                            </label>
                            <div className="relative">
                                <select 
                                    className="w-full p-4 bg-slate-900/90 rounded-2xl font-bold text-white outline-none border border-slate-800 focus:border-[#F37021] appearance-none cursor-pointer pr-12 shadow-inner" 
                                    value={batch.courseId} 
                                    onChange={e => setBatch({ ...batch, courseId: e.target.value })}
                                >
                                    {allAvailableCourses.map(c => (
                                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                                <FiBook className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Start Time
                                </label>
                                <input 
                                    required 
                                    type="time" 
                                    className="w-full p-4 bg-slate-900/90 rounded-2xl font-bold text-white outline-none border border-slate-800 focus:border-[#F37021] shadow-inner" 
                                    value={batch.startTime} 
                                    onChange={e => setBatch({ ...batch, startTime: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    End Time
                                </label>
                                <input 
                                    required 
                                    type="time" 
                                    className="w-full p-4 bg-slate-900/90 rounded-2xl font-bold text-white outline-none border border-slate-800 focus:border-[#F37021] shadow-inner" 
                                    value={batch.endTime} 
                                    onChange={e => setBatch({ ...batch, endTime: e.target.value })} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 flex flex-col justify-between">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-3">
                                Weekly Schedule (Active Days)
                            </label>
                            <div className="grid grid-cols-3 gap-2.5">
                                {daysOfWeek.map(d => {
                                    const isSelected = batch.days.includes(d);
                                    return (
                                        <button 
                                            key={d} 
                                            type="button" 
                                            onClick={() => toggleDay(d)} 
                                            className={`py-3.5 rounded-xl font-black text-[10px] border transition-all uppercase tracking-wider ${
                                                isSelected 
                                                    ? 'bg-[#1A5F7A] border-[#1A5F7A] text-white shadow-md' 
                                                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                                            }`}
                                        >
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={status === 'loading'} 
                            className="w-full py-4 bg-[#F37021] hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-950/40 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {status === 'loading' ? (
                                <><FiLoader className="animate-spin text-base" /> Initializing...</>
                            ) : status === 'success' ? (
                                <><FiCheckCircle size={16} /> Batch Created!</>
                            ) : (
                                <><FiPlus size={16} /> Initialize Timetable</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* DIRECTORY LISTING */}
            <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-800 overflow-hidden text-left">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                    <div className="flex items-center gap-2.5">
                        <FiLayers className="text-[#F37021]" size={18} />
                        <h3 className="text-xs font-black text-white uppercase tracking-widest italic">
                            Live Academic Timetables ({activeBatches.length})
                        </h3>
                    </div>
                    {isFetching && <FiLoader className="animate-spin text-[#F37021]" />}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] text-xs">
                        <thead className="text-[9px] font-black text-slate-400 uppercase bg-slate-950 border-b border-slate-800 tracking-wider">
                            <tr>
                                <th className="p-5 pl-7">Batch Code & Course</th>
                                <th>Timing Window</th>
                                <th>Active Days</th>
                                <th>Last Synchronized</th>
                                <th className="text-center pr-7">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 font-bold">
                            {activeBatches.length > 0 ? (
                                activeBatches.map(b => (
                                    <tr key={b._id} className="hover:bg-slate-900/50 transition-colors">
                                        <td className="p-5 pl-7">
                                            <div className="font-black text-white uppercase italic text-sm">{b.batchCode}</div>
                                            <div className="text-[10px] font-black text-[#F37021] uppercase mt-0.5 tracking-tight">
                                                {allAvailableCourses.find(c => c.id === b.courseId)?.title || b.courseId}
                                            </div>
                                        </td>
                                        <td className="font-black text-slate-200">
                                            {b.startTime} - {b.endTime}
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {b.days.map(d => (
                                                    <span key={d} className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded font-black text-[8px] uppercase">
                                                        {d}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-[9px] font-black text-white uppercase">
                                                    {b.lastModifiedBy?.charAt(0) || 'A'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-300 uppercase text-[9px] leading-tight">{b.lastModifiedBy || 'Admin'}</p>
                                                    <p className="text-[8px] text-slate-500 font-bold">{new Date(b.updatedAt || b.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center pr-7">
                                            <button 
                                                onClick={() => handleDeleteBatch(b._id)} 
                                                className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                                                title="Delete Timetable"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center text-slate-500 font-black uppercase italic tracking-widest">
                                        No Scheduled Academic Batches Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}