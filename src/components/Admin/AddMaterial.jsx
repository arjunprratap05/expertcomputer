import React, { useState } from 'react';
import axios from 'axios';
import { FiUpload, FiSend, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

export default function AddMaterial() {
    const allCourses = [...techCoursesData, ...universityPrograms];
    const [status, setStatus] = useState('idle');
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({ title: '', course: allCourses[0]?.id || '' });

    const handleUpload = async (e) => {
        e.preventDefault();
        
        // FIX: Match the key used in AdminLogin
        const token = localStorage.getItem('adminToken'); 
        if (!token) return alert("Security Error: Admin session not found. Please login again.");
        if (!file) return alert("Please select a PDF file.");

        setStatus('loading');
        const data = new FormData();
        data.append('file', file);
        data.append('title', formData.title);
        data.append('course', formData.course); // Sending the ID (e.g., 'java-pro')

        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL;
            await axios.post(`${API_URL}/lms/add-material`, data, {
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'multipart/form-data' 
                }
            });
            setStatus('success');
            setFile(null);
            setFormData({ ...formData, title: '' });
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            setStatus('idle');
            alert(err.response?.data?.message || "Upload failed. Verify Admin Role.");
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-xl mt-10">
            <h2 className="text-2xl font-black text-[#1A5F7A] mb-6 uppercase italic">Study <span className="text-[#F37021]">Material</span></h2>
            <form onSubmit={handleUpload} className="space-y-4">
                <select 
                    className="w-full p-4 bg-slate-50 rounded-xl font-bold text-[#1A5F7A] outline-none"
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                >
                    {allCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                </select>

                <input required className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none" placeholder="Material Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />

                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center relative hover:bg-slate-50 transition-all">
                    <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files[0])} />
                    <FiUpload className="mx-auto text-2xl text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-500 uppercase">{file ? file.name : "Click to select PDF"}</p>
                </div>

                <button disabled={status === 'loading'} className="w-full py-5 bg-[#F37021] text-white rounded-2xl font-black uppercase flex items-center justify-center gap-2">
                    {status === 'loading' ? <FiLoader className="animate-spin" /> : status === 'success' ? <FiCheckCircle /> : <FiSend />}
                    {status === 'loading' ? 'SAVING TO DB...' : 'PUBLISH MATERIAL'}
                </button>
            </form>
        </div>
    );
}