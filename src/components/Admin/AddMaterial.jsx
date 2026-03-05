import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUpload, FiSend, FiLoader, FiCheckCircle, FiSearch, FiTrash2, FiFileText } from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

export default function AddMaterial() {
    const allCourses = [...techCoursesData, ...universityPrograms];
    const [status, setStatus] = useState('idle');
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({ 
        title: '', 
        course: allCourses[0]?.id || '' // Link strictly to Course ID
    });
    
    const [existingMaterials, setExistingMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleting, setIsDeleting] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const res = await axios.get(`${API_URL}/lms/materials`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExistingMaterials(res.data.materials || []);
        } catch (err) { console.error("Directory fetch failed"); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a PDF file.");

        setStatus('loading');
        const data = new FormData();
        data.append('file', file);
        data.append('title', formData.title);
        data.append('course', formData.course); // Saved as Course slug

        try {
            await axios.post(`${API_URL}/lms/add-material`, data, {
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'multipart/form-data' 
                }
            });
            setStatus('success');
            setFile(null);
            setFormData({ ...formData, title: '' });
            fetchMaterials();
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            setStatus('idle');
            alert("Upload failed.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this course material?")) return;
        setIsDeleting(id);
        try {
            await axios.delete(`${API_URL}/lms/delete-material/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExistingMaterials(prev => prev.filter(m => m._id !== id));
        } catch (err) { alert("Delete failed"); }
        finally { setIsDeleting(null); }
    };

    const filteredMaterials = existingMaterials.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20 text-left">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                <header className="flex items-center gap-4 mb-8">
                    <div className="bg-orange-100 p-3 rounded-2xl text-[#F37021]"><FiUpload size={24}/></div>
                    <h2 className="text-2xl font-black text-[#1A5F7A] uppercase italic leading-none">Course <span className="text-[#F37021]">Vault</span></h2>
                </header>

                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 ml-4 uppercase">1. Select Target Course</label>
                            <select 
                                className="w-full mt-2 p-4 bg-slate-50 rounded-2xl font-bold text-[#1A5F7A] outline-none"
                                value={formData.course}
                                onChange={(e) => setFormData({...formData, course: e.target.value})}
                            >
                                {allCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 ml-4 uppercase">2. Resource Identity</label>
                            <input required className="w-full mt-2 p-4 bg-slate-50 rounded-2xl font-bold outline-none" placeholder="e.g. Session 01 Notes" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] h-44 flex flex-col items-center justify-center relative hover:bg-slate-50 transition-all group overflow-hidden">
                            <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setFile(e.target.files[0])} />
                            <FiUpload className={`text-4xl ${file ? 'text-[#F37021]' : 'text-slate-200'}`} />
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 px-4 text-center">
                                {file ? file.name : "Select PDF for this Course"}
                            </p>
                        </div>
                        <button disabled={status === 'loading'} className="w-full py-5 bg-[#F37021] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl">
                            {status === 'loading' ? <FiLoader className="animate-spin" /> : <FiSend />}
                            {status === 'loading' ? 'PUBLISHING...' : 'PUBLISH TO COURSE'}
                        </button>
                    </div>
                </form>
            </div>

            {/* DIRECTORY SECTION */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 bg-slate-50/50 border-b flex flex-col md:flex-row justify-between items-center gap-6">
                    <h3 className="text-lg font-black text-[#1A5F7A] uppercase italic leading-none">Security <span className="text-[#F37021]">Index</span></h3>
                    <div className="relative w-full md:w-80">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none" placeholder="Search Materials..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-50">
                            {filteredMaterials.map(item => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 flex items-center gap-3">
                                        <FiFileText className="text-[#F37021]" />
                                        <span className="font-black text-[#1A5F7A] uppercase text-xs italic">{item.title}</span>
                                    </td>
                                    <td>
                                        <span className="px-3 py-1 bg-blue-50 text-[#1A5F7A] border border-blue-100 rounded-lg text-[9px] font-black uppercase">
                                            Course: {item.course}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <button onClick={() => handleDelete(item._id)} className="p-3 text-slate-300 hover:text-red-500 transition-all">
                                            {isDeleting === item._id ? <FiLoader className="animate-spin" /> : <FiTrash2 size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}