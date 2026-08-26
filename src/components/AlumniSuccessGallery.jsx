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
    { name: "Harsh Raj", course: "Advance Diploma in Computer Application", cat: "Professional Diplomas", image: harshImg, regNo: "ECA/2025/DIP/088", date: "Nov 2024" },
    { name: "Gaurav Kumar", course: "Microsoft Office", cat: "Office Skills", image: gauravImg, regNo: "ECA/2025/MS/009", date: "Oct 2024" },
    { name: "Ghanshyam Kumar", course: "Digital Marketing", cat: "Marketing", image: ghanshyamImg, regNo: "ECA/2025/DM/023", date: "Jan 2025" },
    { name: "Group Batch", course: "Advance Diploma in Computer Application", cat: "Professional Diplomas", image: batchImg, regNo: "BATCH-2025-A", date: "Jan 2025" },
    { name: "Group Batch", course: "Advance Diploma in Computer Application", cat: "Professional Diplomas", image: schoolStudent, regNo: "BATCH-2025-B", date: "Jan 2025" }
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
        <div className="min-h-screen bg-[#070D1D] text-slate-100 py-12 md:py-20 px-4 md:px-6 font-sans relative scroll-smooth overflow-x-hidden selection:bg-[#F37021]/30 selection:text-orange-200">
            
            {/* AMBIENT GLOWS & MESH BACKDROP */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-orange-600/10 via-blue-600/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute top-[45%] right-0 w-[500px] h-[700px] bg-indigo-900/15 rounded-full blur-[160px] pointer-events-none -z-10" />
            <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16 md:mb-20">
                    
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter leading-tight">
                        The Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200">Fame</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto font-medium mb-12 px-4 text-base md:text-lg">
                        Celebrating Patna's 38-years technical legacy through our certified alumni
                    </p>

                    {/* SEARCH BAR */}
                    <div className="max-w-2xl mx-auto bg-slate-900/60 backdrop-blur-md p-1.5 md:p-2 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-700/80 flex items-center group focus-within:border-[#F37021]/50 transition-colors">
                        <div className="pl-4 md:pl-6 text-[#F37021]"><FiShield className="text-xl" /></div>
                        <input 
                            type="text" 
                            placeholder="Enter Registration No. or Name..." 
                            className="w-full px-4 md:px-6 py-4 outline-none font-bold text-white placeholder:text-slate-500 bg-transparent text-sm md:text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="hidden sm:flex bg-gradient-to-r from-[#F37021] to-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_4px_15px_rgba(243,112,33,0.3)] hover:from-orange-600 hover:to-orange-700 transition-all items-center gap-2">
                            <FiSearch /> Search
                        </button>
                    </div>
                </div>

                {/* FILTER TABS */}
                <div className="flex flex-wrap gap-2.5 justify-center mb-16">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setFilter(cat)} 
                            className={`px-5 py-3 rounded-full font-bold text-[10px] md:text-[11px] uppercase tracking-[0.15em] transition-all backdrop-blur-md border ${
                                filter === cat 
                                ? 'bg-[#1A5F7A] text-white border-teal-600 shadow-[0_4px_20px_rgba(26,95,122,0.4)] scale-105' 
                                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* GALLERY GRID */}
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    <AnimatePresence mode='popLayout'>
                        {filteredAlumni.map((item, index) => (
                            <motion.div 
                                layout 
                                key={item.regNo} 
                                onClick={() => setSelectedCert(item)}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25 }}
                                className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-5 md:p-6 shadow-lg border border-slate-800/80 relative group overflow-hidden cursor-pointer hover:border-[#F37021]/50 hover:shadow-[0_10px_30px_rgba(243,112,33,0.15)] transition-all"
                            >
                                <div className="absolute top-8 left-8 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/30 flex items-center gap-2 shadow-sm">
                                    <FiCheckCircle className="text-blue-400" />
                                    <span className="text-[8px] md:text-[9px] font-black text-blue-100 tracking-wider">VERIFIED</span>
                                </div>
                                
                                {/* Optimized Image Container */}
                                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 relative bg-slate-950 border border-slate-800">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        loading={index === 0 ? "eager" : "lazy"}
                                        fetchpriority={index === 0 ? "high" : "auto"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#070D1D] via-[#070D1D]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                                </div>

                                <div className="text-center px-2 relative z-10">
                                    <h3 className="text-xl md:text-2xl font-black text-white mb-1 uppercase tracking-tighter leading-none">{item.name}</h3>
                                    <p className="text-[#F37021] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 italic">{item.course}</p>
                                    <div className="bg-slate-950/50 py-3.5 rounded-2xl border border-slate-800 flex flex-col items-center shadow-inner">
                                        <span className="text-[8px] uppercase font-bold text-slate-500 tracking-widest mb-0.5">Registration ID</span>
                                        <span className="text-xs md:text-sm font-black text-slate-200">{item.regNo}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* NO RESULTS FALLBACK */}
                {filteredAlumni.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-24 bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-slate-800"
                    >
                        <FiAward className="text-slate-600 text-6xl mx-auto mb-4" />
                        <p className="text-slate-300 font-bold tracking-wide">No record found matching this ID or Name.</p>
                    </motion.div>
                )}
            </div>

            {/* VERIFICATION MODAL */}
            <AnimatePresence>
                {selectedCert && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#070D1D]/80 backdrop-blur-md" 
                        onClick={() => setSelectedCert(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} 
                            className="bg-[#0A192F] rounded-[3rem] max-w-4xl w-full overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-slate-800 relative" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedCert(null)} className="absolute top-6 right-6 text-slate-400 hover:text-red-400 z-10 p-2.5 bg-slate-800 border border-slate-700 rounded-full hover:bg-slate-700 transition-colors">
                                <FiX size={20} />
                            </button>
                            
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="w-full md:w-1/2 bg-slate-950 p-6 md:p-10 flex items-center justify-center border-r border-slate-800">
                                    <img src={selectedCert.image} alt="Certificate Profile" className="w-full h-auto shadow-2xl rounded-2xl border border-slate-800" />
                                </div>
                                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#F37021]/10 rounded-full blur-3xl pointer-events-none" />
                                    
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-2 text-blue-400 mb-6 font-bold uppercase tracking-widest text-[9px] bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full w-fit backdrop-blur-md">
                                            <FiShield /> Result Verified
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black text-white mb-1 uppercase tracking-tighter">{selectedCert.name}</h2>
                                        <p className="text-[#F37021] font-black uppercase tracking-[0.2em] text-[10px] mb-8">{selectedCert.course}</p>
                                        
                                        <div className="space-y-3 mb-10 border-y border-slate-800 py-6">
                                            <div className="flex justify-between text-xs items-center">
                                                <span className="text-slate-500 font-bold uppercase tracking-widest">Record ID</span>
                                                <span className="font-black text-slate-200">{selectedCert.regNo}</span>
                                            </div>
                                            <div className="flex justify-between text-xs items-center">
                                                <span className="text-slate-500 font-bold uppercase tracking-widest">Awarded</span>
                                                <span className="font-black text-slate-200">{selectedCert.date}</span>
                                            </div>
                                        </div>
                                        
                                        <button onClick={() => window.print()} className="w-full py-4.5 bg-gradient-to-r from-[#F37021] to-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(243,112,33,0.3)]">
                                            Download Profile <FiExternalLink />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}