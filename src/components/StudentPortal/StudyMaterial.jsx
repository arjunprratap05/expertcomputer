import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiFileText, FiLoader, FiLock, FiX, FiShield, FiDownloadCloud } from 'react-icons/fi';
import axios from 'axios';

export default function StudyMaterial() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewTitle, setPreviewTitle] = useState("");
    const API_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

    const loadMaterials = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        setError(null);
        try {
            const studentRaw = localStorage.getItem("studentData");
            const token = localStorage.getItem("studentToken");
            
            if (!studentRaw || !token) {
                setError("Session expired. Please login again.");
                return;
            }

            const student = JSON.parse(studentRaw);
            const collectedIds = [];

            if (Array.isArray(student.activeBatches)) {
                student.activeBatches.forEach(b => {
                    if (!b) return;
                    if (typeof b === 'string') collectedIds.push(b);
                    else if (b._id) collectedIds.push(b._id);
                });
            }

            if (student.batchId) {
                const flatId = typeof student.batchId === 'object' ? student.batchId._id : student.batchId;
                if (flatId) collectedIds.push(flatId);
            }

            const batchIds = [...new Set(collectedIds)].filter(Boolean);
            if (batchIds.length === 0) { setLoading(false); return; }

            const studentAssignedCourses = [];
            if (student.course) studentAssignedCourses.push(student.course.toLowerCase().trim());
            
            if (Array.isArray(student.enrollments)) {
                student.enrollments.forEach(e => {
                    if (e.course) studentAssignedCourses.push(e.course.toLowerCase().trim());
                });
            }

            const res = await axios.post(`${API_BASE}/lms/sync-multi`, { 
                batchIds, 
                explicitCourses: studentAssignedCourses 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const serverMaterials = res.data.data?.materials || [];
                setMaterials(serverMaterials);
            }
        } catch (err) { 
            console.error("Vault sync failed", err);
            setError("Unable to sync vault. Check connection.");
        } finally { 
            setLoading(false); 
        }
    }, [API_BASE]);

    useEffect(() => {
        loadMaterials();
        const handleSync = () => loadMaterials(false);
        window.addEventListener("profileSynced", handleSync);
        return () => window.removeEventListener("profileSynced", handleSync);
    }, [loadMaterials]);

    const handlePreview = async (id, title) => {
        try {
            const token = localStorage.getItem("studentToken");
            const res = await axios.get(`${API_BASE}/lms/download/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            if (previewUrl) window.URL.revokeObjectURL(previewUrl);
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            setPreviewTitle(title);
            setPreviewUrl(url); 
        } catch (err) { 
            setError("Permission Denied: Unable to fetch resource."); 
        }
    };

    if (loading) return (
        <div className="h-96 flex flex-col justify-center items-center gap-4">
            <FiLoader className="animate-spin text-4xl text-[#F37021]" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Unlocking Course Vault...</p>
        </div>
    );

    return (
        <div className="w-full space-y-10 pb-20 text-left max-w-7xl mx-auto px-1 mt-4">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900/80 border border-slate-700 text-[#F37021] rounded-2xl shadow-inner">
                        <FiShield size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic leading-none tracking-tighter">
                            Course <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200">Vault</span>
                        </h2>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                            {materials.length} Premium Learning Resources Synchronized
                        </p>
                    </div>
                </div>
            </header>

            {error && (
                <div className="bg-red-500/10 p-5 rounded-[2rem] border border-red-500/20 flex items-center gap-4 text-red-400 shadow-sm backdrop-blur-md">
                    <FiLock size={20} className="shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-tight leading-relaxed">{error}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {materials.map((item) => (
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} key={item._id} viewport={{ once: true }}
                        className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-slate-800 group hover:border-[#F37021]/50 hover:shadow-[0_10px_30px_rgba(243,112,33,0.15)] transition-all duration-500 flex flex-col h-full"
                    >
                        <div className="w-14 h-14 bg-slate-950 border border-slate-700 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner shrink-0">
                            <FiFileText className="text-2xl text-[#F37021] group-hover:text-orange-400 transition-colors duration-500" />
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                            <h3 className="font-black text-white mb-2 uppercase text-[15px] italic leading-tight group-hover:text-orange-300 transition-colors line-clamp-3">
                                {item.title}
                            </h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-10 line-clamp-1">
                                {item.course}
                            </p>
                        </div>
                        
                        <button onClick={() => handlePreview(item._id, item.title)} 
                            className="w-full py-4 bg-slate-800/80 hover:bg-gradient-to-r hover:from-[#F37021] hover:to-orange-600 text-slate-300 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-slate-700 hover:border-transparent shadow-sm hover:shadow-[0_8px_20px_rgba(243,112,33,0.3)] shrink-0"
                        >
                            <FiEye size={16} /> Open Resource
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* PREVIEW CONTAINER OVERLAY */}
            <AnimatePresence>
                {previewUrl && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[1000] bg-[#070D1D]/95 backdrop-blur-xl flex flex-col"
                    >
                        <div className="flex justify-between items-center p-4 md:p-6 text-white w-full border-b border-slate-800 bg-slate-900/50">
                            <div className="flex items-center gap-3 min-w-0 pr-4">
                                <div className="p-2 bg-orange-500/10 border border-orange-500/20 text-[#F37021] rounded-lg shrink-0">
                                    <FiDownloadCloud size={18} />
                                </div>
                                <h3 className="font-black uppercase italic text-sm md:text-lg tracking-tight truncate">{previewTitle}</h3>
                            </div>
                            <button onClick={() => { window.URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }} 
                                className="p-2.5 md:p-3 bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-800 hover:border-red-900/50 rounded-xl transition-colors shadow-sm shrink-0"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="flex-1 w-full h-full p-2 md:p-8" onContextMenu={(e) => e.preventDefault()}>
                            <div className="w-full h-full md:rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800 bg-slate-900">
                                <object 
                                    data={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`} 
                                    type="application/pdf" 
                                    className="w-full h-full"
                                >
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                                        <FiFileText size={48} className="opacity-50" />
                                        <p className="text-sm font-bold uppercase tracking-widest text-center px-4">Browser does not support direct PDF embedding.</p>
                                    </div>
                                </object>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}