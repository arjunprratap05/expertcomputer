import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiX, FiCheckCircle, FiExternalLink } from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

export default function CourseSection() {
    const { categoryId } = useParams();
    const [selectedSyllabus, setSelectedSyllabus] = useState(null);
    const [content, setContent] = useState({ tech: [], uni: [] });

    // Convert URL slug back to Category Name
    const activeCat = categoryId?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    useEffect(() => {
        setContent({
            tech: techCoursesData.filter(c => c.mappedCategories.includes(activeCat)),
            uni: universityPrograms.filter(p => p.cat === activeCat)
        });
        window.scrollTo(0, 0);
    }, [activeCat]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 min-h-screen">
            <Link to="/" className="flex items-center gap-2 text-[#1A5F7A] font-bold mb-10"><FiArrowLeft /> Back</Link>
            
            <h2 className="text-5xl font-black text-[#1A5F7A] mb-12 capitalize">{activeCat}</h2>

            {/* Academy Tech Courses Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {content.tech.map(course => (
                    <motion.div key={course.id} whileHover={{ y: -10 }} className="p-10 bg-white border rounded-[3rem] shadow-sm">
                        <h3 className="text-2xl font-bold text-[#1A5F7A] mb-4">{course.title}</h3>
                        <p className="text-slate-500 mb-8 text-sm">{course.desc}</p>
                        <button onClick={() => setSelectedSyllabus(course)} className="w-full py-4 bg-slate-50 text-[#1A5F7A] font-bold rounded-2xl border hover:bg-[#1A5F7A] hover:text-white transition-all">
                            View Syllabus
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* University Degree Section */}
            {content.uni.length > 0 && (
                <div className="bg-slate-900 rounded-[4rem] p-12 text-white">
                    <h3 className="text-3xl font-black mb-10 text-center">University Degree Tracks</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {content.uni.map(prog => (
                            <div key={prog.id} className="p-8 bg-white/10 rounded-3xl border border-white/10">
                                <span className="text-[#F37021] font-bold text-xs">{prog.university}</span>
                                <h4 className="text-2xl font-black mt-2">{prog.title}</h4>
                                <p className="text-blue-100/60 mt-4 font-bold">{prog.fee}</p>
                                <a href={prog.link} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-[#F37021] font-bold hover:underline">
                                    Official University Details <FiExternalLink />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SYLLABUS MODAL */}
            <AnimatePresence>
                {selectedSyllabus && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A5F7A]/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
                            <div className="p-10 bg-[#1A5F7A] text-white flex justify-between items-center">
                                <h2 className="text-3xl font-black">{selectedSyllabus.title}</h2>
                                <button onClick={() => setSelectedSyllabus(null)}><FiX size={28} /></button>
                            </div>
                            <div className="p-10 max-h-[50vh] overflow-y-auto">
                                <ul className="space-y-4">
                                    {selectedSyllabus.modules.map((m, i) => (
                                        <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border"><FiCheckCircle className="text-[#F37021] mt-1 shrink-0" /> <span className="font-bold text-slate-700">{m}</span></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-10 border-t flex gap-4">
                                <Link 
    to="/registration" 
    state={{ prefillCourse: selectedSyllabus.title }} // This passes the data
    className="flex-1 py-5 bg-[#F37021] text-white text-center font-black rounded-2xl"
>
    Register Now
</Link>
                                <button onClick={() => setSelectedSyllabus(null)} className="flex-1 py-5 bg-slate-100 font-bold rounded-2xl">Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}