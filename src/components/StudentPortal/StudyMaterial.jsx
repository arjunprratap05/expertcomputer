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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Unlocking Course Vault...</p>
        </div>
    );

    return (
        <div className="w-full space-y-10 pb-20 text-left max-w-7xl mx-auto px-4 mt-20">
            <header className="flex flex-col gap-2 px-1">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-[#1A5F7A] rounded-2xl shadow-sm">
                        <FiShield size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-[#1A5F7A] uppercase italic leading-none tracking-tighter">
                            Course <span className="text-[#F37021]">Vault</span>
                        </h2>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {materials.length} Premium Learning Resources Synchronized
                        </p>
                    </div>
                </div>
            </header>

            {error && (
                <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center gap-4 text-red-600 shadow-sm mx-1">
                    <FiLock size={20} />
                    <p className="text-[10px] font-black uppercase tracking-tight">{error}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {materials.map((item) => (
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} key={item._id} 
                        className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 group hover:shadow-2xl transition-all duration-500"
                    >
                        <div className="bg-orange-50 p-5 rounded-[1.5rem] mb-8 group-hover:bg-[#1A5F7A] transition-all duration-500 w-fit shadow-inner">
                            <FiFileText className="text-4xl text-[#F37021] group-hover:text-white transition-all duration-500" />
                        </div>
                        <h3 className="font-black text-[#1A5F7A] mb-2 uppercase text-[15px] italic leading-tight group-hover:text-[#F37021]">{item.title}</h3>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-10">{item.course}</p>
                        <button onClick={() => handlePreview(item._id, item.title)} 
                            className="w-full py-5 bg-slate-50 hover:bg-[#F37021] hover:text-white text-[#1A5F7A] rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-3"
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
                        className="fixed inset-0 z-[1000] bg-black flex flex-col"
                    >
                        <div className="flex justify-between items-center p-6 text-white w-full">
                            <h3 className="font-black uppercase italic text-lg">{previewTitle}</h3>
                            <button onClick={() => { window.URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }} 
                                className="p-4 bg-white/10 hover:bg-red-500 rounded-full transition-all"
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="flex-1 w-full h-full" onContextMenu={(e) => e.preventDefault()}>
                            <object 
                                data={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`} 
                                type="application/pdf" 
                                className="w-full h-full"
                            >
                                <p>Browser does not support PDF embedding.</p>
                            </object>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}