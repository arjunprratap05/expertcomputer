import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiFileText, FiLoader, FiLock, FiX, FiShield } from 'react-icons/fi';
import axios from 'axios';

export default function StudyMaterial() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewTitle, setPreviewTitle] = useState("");
    const API_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

    const loadMaterials = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const student = JSON.parse(localStorage.getItem("studentData"));
            const token = localStorage.getItem("studentToken");
            
            // We still send batchIds, but the BACKEND will resolve them to Course Slugs
            const batchIds = student.activeBatches || (student.batchId ? [student.batchId] : []);

            if (batchIds.length === 0) { setLoading(false); return; }

            const res = await axios.post(`${API_BASE}/lms/sync-multi`, { batchIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // materials are now items matched by Course Name in DB
                setMaterials(res.data.data?.materials || []);
            }
        } catch (err) { console.error("Vault sync failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        loadMaterials();
        window.addEventListener("profileSynced", () => loadMaterials(false));
        return () => window.removeEventListener("profileSynced", () => loadMaterials(false));
    }, []);

    const handlePreview = async (id, title) => {
        try {
            const token = localStorage.getItem("studentToken");
            const res = await axios.get(`${API_BASE}/lms/download/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            setPreviewUrl(url); setPreviewTitle(title);
        } catch (err) { alert("Access Denied."); }
    };

    if (loading) return <div className="h-64 flex justify-center items-center"><FiLoader className="animate-spin text-3xl text-[#1A5F7A]" /></div>;

    return (
        <div className="space-y-8 text-left">
            <h2 className="text-3xl font-black text-[#1A5F7A] uppercase italic leading-none">Course <span className="text-[#F37021]">Vault</span></h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] px-1 italic">Authorized Study Resources</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((item) => (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={item._id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 group hover:shadow-2xl transition-all">
                        <div className="bg-orange-50 p-4 rounded-2xl mb-6 group-hover:bg-[#1A5F7A] transition-colors w-fit">
                            <FiFileText className="text-3xl text-[#F37021] group-hover:text-white" />
                        </div>
                        <h3 className="font-black text-[#1A5F7A] mb-2 uppercase text-sm italic leading-tight">{item.title}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">Course: {item.course}</p>
                        <button onClick={() => handlePreview(item._id, item.title)} className="w-full py-4 bg-slate-50 hover:bg-[#F37021] hover:text-white text-[#1A5F7A] rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2">
                            <FiEye /> View Resource
                        </button>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {previewUrl && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-slate-900/95 backdrop-blur-xl flex flex-col p-4 md:p-10">
                        <div className="flex justify-between items-center mb-6 text-white w-full max-w-7xl mx-auto">
                            <h3 className="font-black uppercase italic text-xl">{previewTitle}</h3>
                            <button onClick={() => setPreviewUrl(null)} className="p-4 bg-white/10 hover:bg-red-500 rounded-full transition-all"><FiX size={24} /></button>
                        </div>
                        <div className="flex-1 bg-white rounded-[2rem] overflow-hidden w-full max-w-7xl mx-auto">
                            <iframe src={`${previewUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-none" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}