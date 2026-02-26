import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiLoader, FiLock } from 'react-icons/fi';
import axios from 'axios';
import { techCoursesData, universityPrograms } from '../../data/courses';

export default function StudyMaterial() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentCourse, setStudentCourse] = useState("");

    const API_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

    useEffect(() => {
        const loadMaterials = async () => {
            try {
                const studentRaw = localStorage.getItem("studentData");
                const token = localStorage.getItem("studentToken");
                if (!studentRaw || !token) return setLoading(false);

                const student = JSON.parse(studentRaw);
                const displayTitle = student.course || "";
                setStudentCourse(displayTitle);

                // MAP TITLE TO ID
                const allCourses = [...techCoursesData, ...universityPrograms];
                const match = allCourses.find(c => c.title.trim().toLowerCase() === displayTitle.trim().toLowerCase());
                const searchID = match ? match.id : displayTitle.toLowerCase().trim();

                const res = await axios.get(`${API_BASE}/lms/sync/${encodeURIComponent(searchID)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    setMaterials(res.data.data?.materials || []);
                }
            } catch (err) {
                console.error("Vault Error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadMaterials();
    }, [API_BASE]);

    const handleDownload = async (id, fileName) => {
        try {
            const token = localStorage.getItem("studentToken");
            const res = await axios.get(`${API_BASE}/lms/download/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'study-material.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Download failed.");
        }
    };

    if (loading) return <div className="h-64 flex items-center justify-center"><FiLoader className="animate-spin text-2xl text-[#1A5F7A]" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#1A5F7A] uppercase italic">Study <span className="text-[#F37021]">Vault</span></h2>
            {materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {materials.map((item) => (
                        <motion.div key={item._id} className="bg-white p-6 rounded-[2rem] shadow-lg border">
                            <FiFileText className="text-3xl text-[#F37021] mb-4" />
                            <h3 className="font-bold text-[#1A5F7A] mb-4 uppercase text-sm">{item.title}</h3>
                            <button onClick={() => handleDownload(item._id, item.file?.fileName)} className="w-full py-3 bg-slate-50 hover:bg-[#1A5F7A] hover:text-white rounded-xl flex items-center justify-center gap-2 font-bold transition-all">
                                <FiDownload /> Download PDF
                            </button>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed">
                    <FiLock className="mx-auto mb-2 text-slate-300 size-8" />
                    <p className="text-slate-400 font-bold text-xs uppercase">No Materials for {studentCourse}</p>
                </div>
            )}
        </div>
    );
}