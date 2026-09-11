import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiEye, FiFileText, FiLoader, FiLock, FiX, 
    FiShield, FiDownloadCloud, FiRefreshCw, FiBookOpen 
} from 'react-icons/fi';
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
                setError("Session expired or missing. Please log in again.");
                return;
            }

            const student = JSON.parse(studentRaw);
            const collectedIds = [];

            // 1. Extract batch IDs from activeBatches (handles ObjectIds and populated objects)
            if (Array.isArray(student.activeBatches)) {
                student.activeBatches.forEach(b => {
                    if (!b) return;
                    if (typeof b === 'string') collectedIds.push(b);
                    else if (b._id) collectedIds.push(b._id.toString());
                });
            }

            // 2. Extract from singular batchId field
            if (student.batchId) {
                const flatId = typeof student.batchId === 'object' ? student.batchId._id : student.batchId;
                if (flatId) collectedIds.push(flatId.toString());
            }

            // 3. Extract batch IDs from multi-course enrollments
            if (Array.isArray(student.enrollments)) {
                student.enrollments.forEach(e => {
                    if (e.batchId) {
                        const enBatch = typeof e.batchId === 'object' ? e.batchId._id : e.batchId;
                        if (enBatch) collectedIds.push(enBatch.toString());
                    }
                });
            }

            const batchIds = [...new Set(collectedIds)].filter(Boolean);

            // 4. Collect student courses (both primary and multi-enrollments)
            const studentAssignedCourses = [];
            if (student.course) {
                studentAssignedCourses.push(student.course);
                studentAssignedCourses.push(student.course.toLowerCase().trim());
            }
            
            if (Array.isArray(student.enrollments)) {
                student.enrollments.forEach(e => {
                    if (e.course) {
                        studentAssignedCourses.push(e.course);
                        studentAssignedCourses.push(e.course.toLowerCase().trim());
                    }
                });
            }

            // 5. Query LMS Multi-Sync Route
            const res = await axios.post(`${API_BASE}/lms/sync-multi`, { 
                batchIds, 
                explicitCourses: [...new Set(studentAssignedCourses)]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let serverMaterials = res.data?.data?.materials || [];

            // 6. Safe Student Fallback (only triggered if sync returns zero items)
            if (serverMaterials.length === 0) {
                try {
                    const fallbackRes = await axios.get(`${API_BASE}/lms/student/materials`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    const allDocs = fallbackRes.data?.data || fallbackRes.data?.materials || [];
                    const normalizedCourses = studentAssignedCourses.map(c => c.toLowerCase());
                    
                    serverMaterials = allDocs.filter(doc => {
                        const docCourse = (doc.course || "").toLowerCase();
                        return normalizedCourses.some(sc => sc.includes(docCourse) || docCourse.includes(sc));
                    });

                    if (serverMaterials.length === 0 && allDocs.length > 0) {
                        serverMaterials = allDocs;
                    }
                } catch {
                    // Gracefully handle if route is not enabled on backend
                }
            }

            setMaterials(serverMaterials);
        } catch (err) { 
            console.error("Vault sync error:", err);
            setError("Unable to sync vault. Verify network connection.");
        } finally { 
            if (showLoader) setLoading(false); 
        }
    }, [API_BASE]);

    useEffect(() => {
        loadMaterials(true);
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
            console.error("Preview error:", err);
            setError("Permission denied: Unable to access protected document."); 
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col justify-center items-center gap-3">
                <FiLoader className="animate-spin text-3xl text-[#F37021]" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">
                    Unlocking Resource Vault...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 pb-16 text-left max-w-7xl mx-auto px-2">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-orange-50 text-[#F37021] rounded-2xl border border-orange-100 shadow-xs">
                        <FiBookOpen size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#1A5F7A] uppercase italic leading-none tracking-tight">
                            Course <span className="text-[#F37021]">Vault</span>
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {materials.length} Verified Document{materials.length === 1 ? '' : 's'} Synchronized
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => loadMaterials(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95"
                >
                    <FiRefreshCw size={13} /> Sync Vault
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex items-center gap-3 text-red-600 shadow-xs">
                    <FiLock size={18} className="shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-wide leading-relaxed">{error}</p>
                </div>
            )}
            
            {/* Materials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {materials.map((item) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }} 
                        whileInView={{ opacity: 1, y: 0 }} 
                        key={item._id} 
                        viewport={{ once: true }}
                        className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group"
                    >
                        <div>
                            <div className="w-12 h-12 bg-orange-50 border border-orange-100 text-[#F37021] rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                                <FiFileText size={22} />
                            </div>
                            
                            <h3 className="font-black text-[#1A5F7A] text-sm sm:text-base uppercase italic leading-tight group-hover:text-[#F37021] transition-colors line-clamp-2">
                                {item.title}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 line-clamp-1">
                                {item.course}
                            </p>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => handlePreview(item._id, item.title)} 
                                className="w-full py-3 bg-slate-50 hover:bg-[#1A5F7A] text-[#1A5F7A] hover:text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-200 hover:border-transparent active:scale-95 shadow-xs"
                            >
                                <FiEye size={14} /> Open Document
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {materials.length === 0 && !error && (
                <div className="text-center py-20 px-6 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center shadow-xs">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 text-[#1A5F7A]">
                        <FiShield size={28} />
                    </div>
                    <h4 className="text-[#1A5F7A] font-black uppercase italic text-lg tracking-tight">
                        Vault Standing By
                    </h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mt-2 max-w-sm leading-relaxed">
                        No instructional resources or syllabi have been published for your enrolled tracks yet.
                    </p>
                </div>
            )}

            {/* PDF Embedded Modal */}
            <AnimatePresence>
                {previewUrl && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[1000] bg-slate-900/70 backdrop-blur-sm flex flex-col p-4 md:p-8"
                    >
                        <div className="bg-white rounded-t-2xl px-6 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-3 min-w-0 pr-4">
                                <div className="p-2 bg-orange-50 text-[#F37021] rounded-lg shrink-0">
                                    <FiDownloadCloud size={18} />
                                </div>
                                <h3 className="font-black text-[#1A5F7A] uppercase italic text-sm md:text-base truncate">
                                    {previewTitle}
                                </h3>
                            </div>
                            <button 
                                onClick={() => { 
                                    window.URL.revokeObjectURL(previewUrl); 
                                    setPreviewUrl(null); 
                                }} 
                                className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="flex-1 w-full bg-slate-100 rounded-b-2xl overflow-hidden border border-t-0 border-slate-200 shadow-2xl" onContextMenu={(e) => e.preventDefault()}>
                            <object 
                                data={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`} 
                                type="application/pdf" 
                                className="w-full h-full"
                            >
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 p-6">
                                    <FiFileText size={42} className="opacity-40" />
                                    <p className="text-xs font-bold uppercase tracking-wider text-center">
                                        Browser does not support direct PDF embedding.
                                    </p>
                                </div>
                            </object>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}