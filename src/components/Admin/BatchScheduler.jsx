import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiClock, FiPlus, FiCheckCircle, FiLoader, FiLayers, 
    FiTrash2, FiUser, FiBook 
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

export default function BatchScheduler() {
    const [status, setStatus] = useState('idle');
    const [activeBatches, setActiveBatches] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    
    // Combine all course data for the dropdown
    const allAvailableCourses = [...techCoursesData, ...universityPrograms];

    const [batch, setBatch] = useState({
        batchCode: '', 
        courseId: allAvailableCourses[0]?.id || '', // Default to first course ID
        startTime: '', 
        endTime: '', 
        days: []
    });

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    const token = localStorage.getItem('adminToken');

    const fetchBatches = async () => {
        setIsFetching(true);
        try {
            const res = await axios.get(`${API_URL}/admin/batches/active`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActiveBatches(res.data.data || []);
        } catch (err) { console.error("Sync Error"); }
        finally { setIsFetching(false); }
    };

    useEffect(() => { fetchBatches(); }, []);

    const toggleDay = (day) => {
        const updatedDays = batch.days.includes(day) 
            ? batch.days.filter(d => d !== day) 
            : [...batch.days, day];
        setBatch({...batch, days: updatedDays});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (batch.days.length === 0) return alert("Select active days!");
        setStatus('loading');
        try {
            await axios.post(`${API_URL}/admin/batches/create`, batch, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus('success');
            // Reset form
            setBatch({ batchCode: '', courseId: allAvailableCourses[0].id, startTime: '', endTime: '', days: [] });
            fetchBatches();
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) { 
            setStatus('idle'); 
            alert(err.response?.data?.message || "Error creating batch"); 
        }
    };

    const handleDeleteBatch = async (id) => {
        if (!window.confirm("Are you sure you want to remove this batch timetable?")) return;
        
        try {
            // Ensure API_URL includes /api if your backend requires it
            // Based on your console: http://localhost:5000/api/admin/batches/...
            await axios.delete(`${API_URL}/admin/batches/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Refresh the list after successful delete
            fetchBatches();
        } catch (err) {
            console.error(err);
            alert("Delete failed: Route not found on server.");
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* FORM SECTION */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F37021]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                
                <header className="mb-10 flex items-center gap-4 relative z-10">
                    <div className="bg-[#1A5F7A] p-4 rounded-2xl text-white shadow-lg shadow-blue-900/20"><FiClock size={28} /></div>
                    <div className="text-left">
                        <h2 className="text-2xl font-black text-[#1A5F7A] uppercase italic leading-none">Batch <span className="text-[#F37021]">Master</span></h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Create Academic Timetables</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left relative z-10">
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Batch Identity (Unique Code)</label>
                            <input required className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#F37021]/30" placeholder="e.g. PY-MORN-MAR" value={batch.batchCode} onChange={e => setBatch({...batch, batchCode: e.target.value.toUpperCase()})} />
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Select Target Course</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-[#1A5F7A] outline-none border-2 border-transparent focus:border-[#F37021]/30 appearance-none cursor-pointer" 
                                    value={batch.courseId} 
                                    onChange={e => setBatch({...batch, courseId: e.target.value})}
                                >
                                    {allAvailableCourses.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.title} {/* Shows Title, saves ID */}
                                        </option>
                                    ))}
                                </select>
                                <FiBook className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Start Time</label>
                                <input required type="time" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={batch.startTime} onChange={e => setBatch({...batch, startTime: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">End Time</label>
                                <input required type="time" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={batch.endTime} onChange={e => setBatch({...batch, endTime: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Active Days (Weekly Schedule)</label>
                        <div className="grid grid-cols-3 gap-3">
                            {daysOfWeek.map(d => (
                                <button key={d} type="button" onClick={() => toggleDay(d)} className={`py-4 rounded-xl font-black text-[10px] border-2 transition-all uppercase tracking-widest ${batch.days.includes(d) ? 'bg-[#1A5F7A] border-[#1A5F7A] text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{d}</button>
                            ))}
                        </div>
                        <button type="submit" disabled={status === 'loading'} className="w-full py-6 bg-[#F37021] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-200 transition-all hover:bg-[#1A5F7A] active:scale-95 flex items-center justify-center gap-3">
                            {status === 'loading' ? <FiLoader className="animate-spin" /> : status === 'success' ? <FiCheckCircle /> : <FiPlus />}
                            {status === 'loading' ? 'Processing...' : status === 'success' ? 'Batch Initialized' : 'Initialize Batch'}
                        </button>
                    </div>
                </form>
            </div>

            {/* DIRECTORY SECTION */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden text-left">
                <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FiLayers className="text-[#1A5F7A]" />
                        <h3 className="text-xs font-black text-[#1A5F7A] uppercase tracking-widest">Active Timetables</h3>
                    </div>
                    {isFetching && <FiLoader className="animate-spin text-[#F37021]" />}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-black text-slate-400 uppercase bg-slate-50/80 border-b tracking-widest">
                            <tr><th className="p-6">Batch Details</th><th>Schedule</th><th>Days</th><th>Modified By</th><th className="text-center">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {activeBatches.length > 0 ? activeBatches.map(b => (
                                <tr key={b._id} className="hover:bg-slate-50/50 transition-colors text-[11px]">
                                    <td className="p-6">
                                        <div className="font-black text-[#1A5F7A] uppercase">{b.batchCode}</div>
                                        <div className="text-[9px] font-bold text-[#F37021] uppercase mt-1 tracking-tighter">
                                            {/* Logic to find Title from ID in existing list */}
                                            {allAvailableCourses.find(c => c.id === b.courseId)?.title || b.courseId}
                                        </div>
                                    </td>
                                    <td className="font-black text-slate-600">{b.startTime} - {b.endTime}</td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {b.days.map(d => <span key={d} className="px-2 py-0.5 bg-blue-50 text-[#1A5F7A] rounded font-black text-[8px] border border-blue-100 uppercase">{d}</span>)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[9px] font-black text-[#1A5F7A] uppercase">{b.lastModifiedBy?.charAt(0) || 'A'}</div>
                                            <div>
                                                <p className="font-black text-slate-600 uppercase text-[9px]">{b.lastModifiedBy || 'Admin'}</p>
                                                <p className="text-[8px] text-slate-400 font-bold">{new Date(b.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <button onClick={() => handleDeleteBatch(b._id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                                            <FiTrash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-300 font-bold uppercase italic tracking-widest">No Scheduled Batches Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}