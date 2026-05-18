import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    FiUpload, FiSend, FiLoader, FiCheckCircle, 
    FiSearch, FiTrash2, FiFileText, FiBookOpen, FiShield 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { techCoursesData, universityPrograms } from '../../data/courses';

const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function AddMaterial() {
    const allCourses = [...techCoursesData, ...universityPrograms];
    const token = localStorage.getItem('adminToken');

    // --- STATE MANAGEMENT ---
    const [status, setStatus] = useState('idle');
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({ 
        title: '', 
        // FIX: Using title as the primary key for Student Portal visibility matching
        course: allCourses[0]?.title || '' 
    });
    
    const [existingMaterials, setExistingMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleting, setIsDeleting] = useState(null);

    // --- DATA FETCHING ---
    const fetchMaterials = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/lms/materials`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExistingMaterials(res.data.materials || []);
        } catch (err) { 
            console.error("Directory fetch failed:", err); 
        }
    }, [token]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    // --- UPLOAD HANDLER ---
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a PDF resource.");
        if (!formData.title.trim()) return alert("Resource identity required.");

        setStatus('loading');
        const data = new FormData();
        data.append('file', file);
        data.append('title', formData.title.trim());
        data.append('course', formData.course); // Backend handles .toLowerCase().trim()

        try {
            await axios.post(`${API_URL}/lms/add-material`, data, {
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
            alert(err.response?.data?.message || "Publishing failed.");
        }
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (id) => {
        if (!window.confirm("Permanently wipe this resource from Course Vault?")) return;
        setIsDeleting(id);
        try {
            await axios.delete(`${API_URL}/lms/delete-material/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExistingMaterials(prev => prev.filter(m => m._id !== id));
        } catch (err) { 
            alert("Security wipe failed."); 
        } finally { 
            setIsDeleting(null); 
        }
    };

    const filteredMaterials = existingMaterials.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.course.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 text-left">
            {/* UPLOAD ENGINE */}
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                    <FiBookOpen size={150} />
                </div>

                <header className="flex items-center gap-4 mb-10">
                    <div className="bg-orange-50 p-4 rounded-2xl text-[#F37021] shadow-inner">
                        <FiUpload size={28}/>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-[#1A5F7A] uppercase italic leading-none">Resource <span className="text-[#F37021]">Publisher</span></h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">LMS Content Deployment Engine</p>
                    </div>
                </header>

                <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 ml-5 uppercase tracking-tighter">1. Target Academic Stream</label>
                            <select 
                                className="w-full mt-2 p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-[#1A5F7A] outline-none focus:border-[#F37021] transition-all appearance-none"
                                value={formData.course}
                                onChange={(e) => setFormData({...formData, course: e.target.value})}
                            >
                                {allCourses.map(c => (
                                    <option key={c.id} value={c.title}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 ml-5 uppercase tracking-tighter">2. Resource Nomenclature</label>
                            <input 
                                required 
                                className="w-full mt-2 p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-[#F37021] transition-all" 
                                placeholder="e.g. Masterclass Python Notes v2" 
                                value={formData.title} 
                                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] h-48 flex flex-col items-center justify-center relative hover:bg-orange-50/30 hover:border-[#F37021]/30 transition-all group overflow-hidden">
                            <input 
                                type="file" 
                                accept=".pdf" 
                                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                onChange={(e) => setFile(e.target.files[0])} 
                            />
                            <AnimatePresence mode="wait">
                                {file ? (
                                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center text-center px-6">
                                        <FiFileText className="text-5xl text-[#F37021] mb-2" />
                                        <p className="text-[11px] font-black text-[#1A5F7A] uppercase truncate max-w-xs">{file.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <FiUpload className="text-4xl text-slate-200 group-hover:text-[#F37021] group-hover:scale-110 transition-all duration-300" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase mt-3 tracking-widest">Drop PDF Document</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <button 
                            disabled={status === 'loading'} 
                            className={`w-full py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${
                                status === 'success' ? 'bg-green-600 text-white' : 'bg-[#1A5F7A] text-white hover:bg-[#F37021]'
                            }`}
                        >
                            {status === 'loading' ? <FiLoader className="animate-spin" /> : status === 'success' ? <FiCheckCircle /> : <FiSend />}
                            {status === 'loading' ? 'COMMITTING TO VAULT...' : status === 'success' ? 'PUBLISHED SUCCESSFULLY' : 'DEPLOY RESOURCE'}
                        </button>
                    </div>
                </form>
            </div>

            {/* DIRECTORY SECTION */}
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-10 bg-slate-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-[#F37021] rounded-full"></div>
                        <h3 className="text-xl font-black text-[#1A5F7A] uppercase italic leading-none">Vault <span className="text-[#F37021]">Registry</span></h3>
                    </div>
                    <div className="relative w-full md:w-96 shadow-sm">
                        <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-[#F37021] transition-all" 
                            placeholder="Filter by Title or Course..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                <th className="p-8">Resource Title</th>
                                <th>Mapped Curriculum</th>
                                <th className="pr-8 text-right">Vault Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredMaterials.length > 0 ? filteredMaterials.map(item => (
                                <tr key={item._id} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-orange-100 group-hover:text-[#F37021] transition-colors">
                                                <FiFileText size={20} />
                                            </div>
                                            <span className="font-black text-[#1A5F7A] uppercase text-[13px] italic tracking-tight">{item.title}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="px-4 py-2 bg-white text-[#1A5F7A] border border-slate-200 rounded-xl text-[9px] font-black uppercase shadow-sm">
                                            {item.course}
                                        </span>
                                    </td>
                                    <td className="pr-8 text-right">
                                        <button 
                                            onClick={() => handleDelete(item._id)} 
                                            className="p-4 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all shadow-sm"
                                            title="Delete Material"
                                        >
                                            {isDeleting === item._id ? <FiLoader className="animate-spin" /> : <FiTrash2 size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="p-20 text-center">
                                        <FiShield className="mx-auto text-slate-100 mb-4" size={60} />
                                        <p className="text-slate-300 font-black text-xs uppercase tracking-widest">No matching resources found in Directory</p>
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