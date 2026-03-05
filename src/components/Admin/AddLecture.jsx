import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiVideo, FiClock, FiSend, FiLoader, FiLayers } from 'react-icons/fi';

export default function AddLecture() {
    const [batches, setBatches] = useState([]);
    const [status, setStatus] = useState('idle');
    const [formData, setFormData] = useState({
        batchId: '', title: '', teacher: '',
        time: '', course: '', link: '', status: 'upcoming'
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/batches/active`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBatches(res.data.data || []);
            } catch (err) { console.error("Sync failed"); }
        };
        fetchBatches();
    }, [API_URL, token]);

    const handleBatchChange = (e) => {
        const bId = e.target.value;
        const selected = batches.find(b => b._id === bId);
        if (selected) {
            setFormData({
                ...formData,
                batchId: bId,
                course: selected.courseId,
                time: selected.startTime
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
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) { setStatus('idle'); alert("Broadcast Failed"); }
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 max-w-xl mx-auto border border-slate-100">
            <header className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><FiVideo size={24} /></div>
                <h2 className="text-xl font-black text-[#1A5F7A] uppercase italic">Sync Live Link</h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Target Batch</label>
                    <div className="relative">
                        <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <select required className="w-full pl-12 pr-5 py-4 bg-slate-50 rounded-2xl font-bold text-[#1A5F7A] border-none outline-none appearance-none" onChange={handleBatchChange} value={formData.batchId}>
                            <option value="">Select Scheduled Batch</option>
                            {batches.map(b => (
                                <option key={b._id} value={b._id}>{b.batchCode} ({b.startTime})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="opacity-60">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Synced Course</label>
                        <input readOnly value={formData.course} className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs" />
                    </div>
                    <div className="opacity-60">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Synced Time</label>
                        <input readOnly value={formData.time} className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-xs" />
                    </div>
                </div>

                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" placeholder="Topic Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" placeholder="Professor" value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})} />
                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" placeholder="Zoom/Meet Link" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />

                <button type="submit" disabled={!formData.batchId} className="w-full py-5 bg-[#F37021] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
                    {status === 'loading' ? <FiLoader className="animate-spin" /> : <FiSend />} Push to Student Portal
                </button>
            </form>
        </div>
    );
}