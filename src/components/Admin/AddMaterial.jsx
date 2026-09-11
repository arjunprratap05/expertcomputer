import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    FiUpload, FiSend, FiLoader, FiCheckCircle, 
    FiSearch, FiTrash2, FiFileText, FiBookOpen, FiShield 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { techCoursesData, universityPrograms } from '../../data/courses';

// URL normalization helper to prevent missing or duplicated '/api' paths
const rawApiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;

export default function AddMaterial() {
    const allCourses = [...techCoursesData, ...universityPrograms];
    const token = localStorage.getItem('adminToken');

    // --- STATE MANAGEMENT ---
    const [status, setStatus] = useState('idle');
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({ 
        title: '', 
        course: allCourses[0]?.title || '' 
    });
    
    const [existingMaterials, setExistingMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleting, setIsDeleting] = useState(null);

    // --- DATA FETCHING ---
    const fetchMaterials = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/lms/materials`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExistingMaterials(res.data.materials || []);
        } catch (err) { 
            console.error("Vault Directory fetch failed:", err); 
        }
    }, [token]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    // --- UPLOAD HANDLER ---
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a PDF resource document.");
        if (!formData.title.trim()) return alert("Resource identity required.");

        setStatus('loading');
        const data = new FormData();
        data.append('file', file);
        data.append('title', formData.title.trim());
        data.append('course', formData.course);

        try {
            await axios.post(`${API_BASE}/lms/add-material`, data, {
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'multipart/form-data' 
                }
            });
            setStatus('success');
            setFile(null);
            setFormData(prev => ({ ...prev, title: '' }));
            fetchMaterials();
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            setStatus('idle');
            alert(err.response?.data?.message || "Resource deployment failed.");
        }
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (id) => {
        if (!window.confirm("Permanently wipe this resource from Course Vault?")) return;
        setIsDeleting(id);
        try {
            await axios.delete(`${API_BASE}/lms/delete-material/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExistingMaterials(prev => prev.filter(m => m._id !== id));
        } catch (err) { 
            alert("Security wipe failed: Unable to remove document."); 
        } finally { 
            setIsDeleting(null); 
        }
    };

    const filteredMaterials = existingMaterials.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.course.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 text-left">
            
            {/* UPLOAD ENGINE CARD */}
            <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F37021]/5 rounded-full -mr-28 -mt-28 blur-3xl pointer-events-none" />
                
                <header className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-5 relative z-10">
                    <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl text-[#F37021] shadow-inner">
                        <FiUpload size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic leading-none tracking-tight">
                            Resource <span className="text-[#F37021]">Publisher</span>
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            LMS Content & PDF Vault Deployment Engine
                        </p>
                    </div>
                </header>

                <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                1. Target Academic Stream
                            </label>
                            <select 
                                className="w-full p-4 bg-slate-900/90 border border-slate-800 rounded-2xl font-bold text-white outline-none focus:border-[#F37021] appearance-none cursor-pointer shadow-inner transition-colors"
                                value={formData.course}
                                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                            >
                                {allCourses.map(c => (
                                    <option key={c.id} value={c.title} className="bg-slate-900 text-white">
                                        {c.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                2. Resource Nomenclature
                            </label>
                            <input 
                                required 
                                className="w-full p-4 bg-slate-900/90 border border-slate-800 rounded-2xl font-bold text-white outline-none focus:border-[#F37021] placeholder:text-slate-600 shadow-inner transition-colors" 
                                placeholder="e.g. Masterclass Python Notes v2" 
                                value={formData.title} 
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                            />
                        </div>
                    </div>

                    <div className="space-y-5 flex flex-col justify-between">
                        <div className="border-2 border-dashed border-slate-800 rounded-2xl h-44 flex flex-col items-center justify-center relative hover:bg-slate-900/60 hover:border-[#F37021]/50 transition-all group overflow-hidden shadow-inner">
                            <input 
                                type="file" 
                                accept=".pdf" 
                                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                onChange={(e) => setFile(e.target.files[0])} 
                            />
                            <AnimatePresence mode="wait">
                                {file ? (
                                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center text-center px-6">
                                        <FiFileText className="text-4xl text-[#F37021] mb-2" />
                                        <p className="text-xs font-black text-white uppercase truncate max-w-xs">{file.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <FiUpload className="text-3xl text-slate-500 group-hover:text-[#F37021] group-hover:scale-110 transition-all duration-300" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase mt-2.5 tracking-widest">
                                            Click or Drop PDF Document
                                        </p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <button 
                            type="submit"
                            disabled={status === 'loading'} 
                            className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                                status === 'success' 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-[#F37021] hover:bg-orange-600 text-white shadow-orange-950/40'
                            }`}
                        >
                            {status === 'loading' ? (
                                <><FiLoader className="animate-spin text-base" /> Committing to Vault...</>
                            ) : status === 'success' ? (
                                <><FiCheckCircle size={16} /> Published Successfully!</>
                            ) : (
                                <><FiSend size={16} /> Deploy Resource</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* DIRECTORY SECTION */}
            <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-800 overflow-hidden text-left">
                <div className="p-6 bg-slate-950/40 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[#F37021] rounded-full"></div>
                        <h3 className="text-base font-black text-white uppercase italic leading-none">
                            Vault <span className="text-[#F37021]">Registry</span>
                        </h3>
                    </div>
                    <div className="relative w-full md:w-80">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-[#F37021] transition-colors placeholder:text-slate-500 shadow-inner" 
                            placeholder="Filter by Title or Course..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] text-left text-xs">
                        <thead>
                            <tr className="bg-slate-950 text-[9px] font-black uppercase text-slate-400 border-b border-slate-800 tracking-wider">
                                <th className="p-5 pl-7">Resource Title</th>
                                <th>Mapped Curriculum</th>
                                <th className="pr-7 text-right">Vault Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 font-bold">
                            {filteredMaterials.length > 0 ? (
                                filteredMaterials.map(item => (
                                    <tr key={item._id} className="hover:bg-slate-900/50 transition-colors">
                                        <td className="p-5 pl-7">
                                            <div className="flex items-center gap-3.5">
                                                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 group-hover:text-[#F37021]">
                                                    <FiFileText size={18} />
                                                </div>
                                                <span className="font-black text-white uppercase text-sm italic tracking-tight">
                                                    {item.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-lg text-[9px] font-black uppercase">
                                                {item.course}
                                            </span>
                                        </td>
                                        <td className="pr-7 text-right">
                                            <button 
                                                onClick={() => handleDelete(item._id)} 
                                                className="p-2.5 text-slate-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
                                                title="Delete Material"
                                            >
                                                {isDeleting === item._id ? <FiLoader className="animate-spin text-base" /> : <FiTrash2 size={16} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="p-16 text-center text-slate-500 font-black uppercase italic tracking-widest">
                                        <FiShield className="mx-auto text-slate-700 mb-3 opacity-40" size={40} />
                                        No matching resources found in Directory
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