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

            // High-resiliency parser looping through multi-object schema types uniformly
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

            if (batchIds.length === 0) { 
                setLoading(false); 
                return; 
            }

            // Aggregates literal naming permutations to avoid casing mismatch errors
            const studentAssignedCourses = [];
            if (student.course) studentAssignedCourses.push(student.course.toLowerCase().trim());
            
            if (Array.isArray(student.enrollments)) {
                student.enrollments.forEach(e => {
                    if (e.course) studentAssignedCourses.push(e.course.toLowerCase().trim());
                });
            }

            // Pass explicit courses array to Backend Aggregator
            const res = await axios.post(`${API_BASE}/lms/sync-multi`, { 
                batchIds, 
                explicitCourses: studentAssignedCourses 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const serverMaterials = res.data.data?.materials || [];
                
                // Reverse filtering fallback catch to map course slugs seamlessly
                const flexibleFilteredList = serverMaterials.filter(material => {
                    const matCourseName = material.course?.toLowerCase().trim() || "";
                    if (!matCourseName) return false;

                    if (studentAssignedCourses.includes(matCourseName)) return true;

                    return studentAssignedCourses.some(assigned => {
                        const standardAssigned = assigned.replace(/-/g, ' ');
                        const standardMaterial = matCourseName.replace(/-/g, ' ');
                        return standardAssigned.includes(standardMaterial) || standardMaterial.includes(standardAssigned);
                    });
                });

                setMaterials(flexibleFilteredList.length > 0 ? flexibleFilteredList : serverMaterials);
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
            setPreviewUrl(url); 
            setPreviewTitle(title);
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
            
            {materials.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {materials.map((item) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            key={item._id} 
                            className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 group hover:shadow-2xl hover:translate-y-[-5px] transition-all duration-500"
                        >
                            <div className="bg-orange-50 p-5 rounded-[1.5rem] mb-8 group-hover:bg-[#1A5F7A] transition-all duration-500 w-fit shadow-inner">
                                <FiFileText className="text-4xl text-[#F37021] group-hover:text-white group-hover:rotate-12 transition-all duration-500" />
                            </div>
                            
                            <h3 className="font-black text-[#1A5F7A] mb-2 uppercase text-[15px] italic leading-tight group-hover:text-[#F37021] transition-colors">
                                {item.title}
                            </h3>
                            
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-10 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#F37021] rounded-full" />
                                {item.course}
                            </p>
                            
                            <button 
                                onClick={() => handlePreview(item._id, item.title)} 
                                className="w-full py-5 bg-slate-50 hover:bg-[#F37021] hover:text-white text-[#1A5F7A] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-sm"
                            >
                                <FiEye size={16} /> Open Resource
                            </button>
                        </motion.div>
                    ))}
                </div>
            ) : !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-24 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center shadow-inner">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <FiDownloadCloud className="text-slate-200" size={48} />
                    </div>
                    <h4 className="text-[#1A5F7A] font-black uppercase italic text-xl">Archive Empty</h4>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                        No authorized study materials have been published to your stream yet.
                    </p>
                </motion.div>
            )}

            {/* PREVIEW CONTAINER OVERLAY */}
            <AnimatePresence>
                {previewUrl && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-2xl flex flex-col p-4 md:p-8">
                        <div className="flex justify-between items-center mb-8 text-white w-full max-w-7xl mx-auto px-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-[#F37021] rounded-xl"><FiEye /></div>
                                <h3 className="font-black uppercase italic text-lg tracking-tighter">{previewTitle}</h3>
                            </div>
                            <button 
                                onClick={() => {
                                    window.URL.revokeObjectURL(previewUrl);
                                    setPreviewUrl(null);
                                }} 
                                className="p-5 bg-white/5 hover:bg-red-500 rounded-full transition-all duration-300 group"
                            >
                                <FiX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>
                        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl overflow-hidden w-full max-w-7xl mx-auto relative">
                            <iframe src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full border-none" title="Secure Preview Viewport" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}