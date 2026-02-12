import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiAward, FiCheckCircle, FiSearch, FiArrowLeft, 
    FiShield, FiExternalLink, FiX 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

// ASSET IMPORTS
import suruchiImg from "../assets/student-suruchi.jpeg";
import harshImg from "../assets/student-harsh.jpeg";
import gauravImg from "../assets/student-gaurav.jpeg";
import arpitaImg from "../assets/student-arpita.jpeg";
import ankitImg from "../assets/student-ankit.jpeg";
import ghanshyamImg from "../assets/student-ghanshyam.jpeg";
import batchImg from "../assets/student-batch.jpeg";
import schoolStudent from '../assets/school.jpeg';

const alumniData = [
    { name: "Suruchi Rai", course: "HTML5 Programming", cat: "Web Development", image: suruchiImg, regNo: "ECA/2025/WEB/001", date: "Jan 2025" },
    { name: "Ankit Shubham", course: "Python Data Analyst", cat: "Data Science", image: ankitImg, regNo: "ECA/2025/PY/042", date: "Dec 2024" },
    { name: "Arpita Neeti", course: "Advanced Excel", cat: "Office Skills", image: arpitaImg, regNo: "ECA/2025/EX/015", date: "Jan 2025" },
    { name: "Harsh Raj", course: "ADCA Diploma", cat: "Professional Diplomas", image: harshImg, regNo: "ECA/2025/DIP/088", date: "Nov 2024" },
    { name: "Gaurav Kumar", course: "Microsoft Office", cat: "Office Skills", image: gauravImg, regNo: "ECA/2025/MS/009", date: "Oct 2024" },
    { name: "Ghanshyam Kumar", course: "Digital Marketing", cat: "Marketing", image: ghanshyamImg, regNo: "ECA/2025/DM/023", date: "Jan 2025" },
    { name: "Group Batch", course: "ADCA Graduates", cat: "Professional Diplomas", image: batchImg, regNo: "BATCH-2025-A", date: "Jan 2025" },
    { name: "Group Batch", course: "ADCA Graduates", cat: "Professional Diplomas", image: schoolStudent, regNo: "BATCH-2025-B", date: "Jan 2025" }
];

export default function AlumniSuccessGallery() {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCert, setSelectedCert] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const categories = ['All', 'Professional Diplomas', 'Web Development', 'Data Science', 'Office Skills', 'Marketing'];

    const filteredAlumni = alumniData.filter(item => {
        const matchesFilter = filter === 'All' || item.cat === filter;
        const matchesSearch = item.regNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 py-12 md:py-20 px-4 md:px-6 font-sans relative scroll-smooth overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 md:mb-20">
                    <Link to="/" className="inline-flex items-center gap-2 text-[#1A5F7A] font-bold mb-6 hover:underline group">
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Return to Home
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black text-[#1A5F7A] mb-4 uppercase tracking-tighter">The Hall of Fame</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto font-medium mb-12 px-4">
                        Celebrating Patna's 38-year technical legacy through our certified alumni.
                    </p>

                    <div className="max-w-2xl mx-auto bg-white p-1.5 md:p-2 rounded-[2rem] shadow-2xl border border-orange-100 flex items-center group">
                        <div className="pl-4 md:pl-6 text-[#F37021]"><FiShield className="text-xl" /></div>
                        <input 
                            type="text" 
                            placeholder="Enter Registration No. or Name..." 
                            className="w-full px-4 md:px-6 py-4 outline-none font-bold text-[#1A5F7A] placeholder:text-slate-300 bg-transparent text-sm md:text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="hidden sm:flex bg-[#F37021] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#1A5F7A] transition-all items-center gap-2">
                            <FiSearch /> Search
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-16">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setFilter(cat)} 
                            className={`px-5 py-2.5 rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${filter === cat ? 'bg-[#1A5F7A] text-white shadow-xl scale-105' : 'bg-white text-slate-400 border border-slate-100 hover:border-orange-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    <AnimatePresence mode='popLayout'>
                        {filteredAlumni.map((item, index) => (
                            <motion.div 
                                layout 
                                key={item.regNo} 
                                onClick={() => setSelectedCert(item)}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-slate-100 relative group overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
                            >
                                <div className="absolute top-8 left-8 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2 shadow-sm">
                                    <FiCheckCircle className="text-blue-500" />
                                    <span className="text-[8px] md:text-[9px] font-black text-[#1A5F7A]">Verified</span>
                                </div>
                                
                                {/* Optimized Image Container */}
                                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 relative bg-slate-100">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        // Load first image immediately, lazy load the rest
                                        loading={index === 0 ? "eager" : "lazy"}
                                        // Hint to browser that first image is high priority
                                        fetchpriority={index === 0 ? "high" : "auto"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    />
                                </div>

                                <div className="text-center px-2">
                                    <h3 className="text-xl md:text-2xl font-black text-[#1A5F7A] mb-1 uppercase tracking-tighter leading-none">{item.name}</h3>
                                    <p className="text-[#F37021] text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 italic">{item.course}</p>
                                    <div className="bg-slate-50 py-3 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center">
                                        <span className="text-[8px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">Registration ID</span>
                                        <span className="text-xs md:text-sm font-black text-[#1A5F7A]">{item.regNo}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* No Results Fallback */}
                {filteredAlumni.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <FiAward className="text-slate-200 text-6xl mx-auto mb-4" />
                        <p className="text-[#1A5F7A] font-bold">No record found matching this ID or Name.</p>
                    </div>
                )}
            </div>

            {/* VERIFICATION MODAL */}
            <AnimatePresence>
                {selectedCert && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0A192F]/95 backdrop-blur-xl" 
                        onClick={() => setSelectedCert(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} 
                            className="bg-white rounded-[3rem] max-w-4xl w-full overflow-hidden shadow-2xl relative" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedCert(null)} className="absolute top-6 right-6 text-[#1A5F7A] hover:text-[#F37021] z-10 p-2 bg-slate-100 rounded-full"><FiX size={20} /></button>
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="w-full md:w-1/2 bg-slate-200 p-6 flex items-center justify-center">
                                    <img src={selectedCert.image} alt="Certificate" className="w-full h-auto shadow-2xl rounded-xl border-4 border-white" />
                                </div>
                                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                    <div className="inline-flex items-center gap-2 text-blue-600 mb-6 font-bold uppercase tracking-widest text-[9px] bg-blue-50 px-3 py-1.5 rounded-full w-fit"><FiShield /> Result Verified</div>
                                    <h2 className="text-3xl md:text-4xl font-black text-[#1A5F7A] mb-1 uppercase tracking-tighter">{selectedCert.name}</h2>
                                    <p className="text-[#F37021] font-black uppercase tracking-widest text-[10px] mb-8">{selectedCert.course}</p>
                                    <div className="space-y-3 mb-10 border-y border-slate-100 py-6">
                                        <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold uppercase">Record ID</span><span className="font-black text-[#1A5F7A]">{selectedCert.regNo}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold uppercase">Awarded</span><span className="font-black text-[#1A5F7A]">{selectedCert.date}</span></div>
                                    </div>
                                    <button onClick={() => window.print()} className="w-full py-4 bg-[#1A5F7A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#F37021] transition-all flex items-center justify-center gap-2 shadow-lg">Download Certificate <FiExternalLink /></button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}