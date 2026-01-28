import React, { useState, useEffect } from 'react'; // Added useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiAward, FiCheckCircle, FiSearch, FiArrowLeft, 
    FiShield, FiExternalLink, FiUsers, FiX 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

// ASSET IMPORTS (Using Professional Naming Convention)
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
     { name: "Group Batch", course: "ADCA Graduates", cat: "Professional Diplomas", image: schoolStudent, regNo: "BATCH-2025-A", date: "Jan 2025" }
];

export default function AlumniSuccessGallery() {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCert, setSelectedCert] = useState(null);

    // --- EFFECT TO SCROLL TO TOP ON LOAD ---
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' // Using instant to prevent the user seeing the scroll move
        });
    }, []);

    const categories = ['All', 'Professional Diplomas', 'Web Development', 'Data Science', 'Office Skills', 'Marketing'];

    const filteredAlumni = alumniData.filter(item => {
        const matchesFilter = filter === 'All' || item.cat === filter;
        const matchesSearch = item.regNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        // Added scroll-smooth and overflow-x-hidden
        <div className="min-h-screen bg-slate-50 py-20 px-6 font-sans relative scroll-smooth overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <Link to="/" className="inline-flex items-center gap-2 text-[#1A5F7A] font-bold mb-6 hover:underline">
                        <FiArrowLeft /> Return to Home
                    </Link>
                    <h1 className="text-5xl md:text-6xl font-black text-[#1A5F7A] mb-4 uppercase tracking-tighter">The Hall of Fame</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto font-medium mb-12">
                        Celebrating Patna's 38-year technical legacy through our certified alumni.
                    </p>

                    <div className="max-w-2xl mx-auto bg-white p-2 rounded-3xl shadow-2xl border border-orange-100 flex items-center group">
                        <div className="pl-6 text-[#F37021]"><FiShield className="text-xl" /></div>
                        <input 
                            type="text" 
                            placeholder="Enter Registration No. to Verify Certificate..." 
                            className="w-full px-6 py-4 outline-none font-bold text-[#1A5F7A] placeholder:text-slate-300 bg-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="bg-[#F37021] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#1A5F7A] transition-all">
                            <FiSearch /> Search
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center mb-16">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)} className={`px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${filter === cat ? 'bg-[#1A5F7A] text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 hover:border-orange-200'}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode='popLayout'>
                        {filteredAlumni.map((item) => (
                            <motion.div 
                                layout 
                                key={item.regNo} 
                                onClick={() => setSelectedCert(item)}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-[3rem] p-6 shadow-sm border border-slate-100 relative group overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
                            >
                                <div className="absolute top-10 left-10 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2 shadow-sm font-sans">
                                    <FiCheckCircle className="text-blue-500" />
                                    <span className="text-[9px] font-black text-[#1A5F7A]">Verified</span>
                                </div>
                                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 relative">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="text-center px-4">
                                    <h3 className="text-2xl font-black text-[#1A5F7A] mb-1 uppercase tracking-tighter font-sans">{item.name}</h3>
                                    <p className="text-[#F37021] text-xs font-black uppercase tracking-widest mb-4 italic">{item.course}</p>
                                    <div className="bg-slate-50 py-3 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center">
                                        <span className="text-[8px] uppercase font-bold text-slate-400 tracking-widest mb-1">Registration ID</span>
                                        <span className="text-sm font-black text-[#1A5F7A] font-sans">{item.regNo}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* VERIFICATION MODAL */}
            <AnimatePresence>
                {selectedCert && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0A192F]/95 backdrop-blur-xl" 
                        onClick={() => setSelectedCert(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.9, y: 30 }} 
                            className="bg-white rounded-[4rem] max-w-5xl w-full overflow-hidden shadow-2xl relative" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedCert(null)} className="absolute top-8 right-8 text-[#1A5F7A] hover:text-[#F37021] transition-colors z-10 p-2 bg-slate-100 rounded-full"><FiX size={24} /></button>
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="w-full md:w-3/5 bg-slate-200 p-8 flex items-center justify-center border-r border-slate-100">
                                    <img src={selectedCert.image} alt="Digital Copy" className="w-full h-auto shadow-2xl rounded-2xl border-8 border-white group" />
                                </div>
                                <div className="w-full md:w-2/5 p-12 flex flex-col justify-center">
                                    <div className="inline-flex items-center gap-2 text-blue-600 mb-6 font-bold uppercase tracking-widest text-[10px] bg-blue-50 px-4 py-2 rounded-full w-fit"><FiShield /> Certified Result Verified</div>
                                    <h2 className="text-4xl font-black text-[#1A5F7A] mb-2 uppercase tracking-tighter font-sans">{selectedCert.name}</h2>
                                    <p className="text-[#F37021] font-black uppercase tracking-widest text-xs mb-8">{selectedCert.course}</p>
                                    <div className="space-y-4 mb-10 border-y border-slate-100 py-8">
                                        <div className="flex justify-between items-center"><span className="text-slate-400 font-bold text-[10px] uppercase">Record No.</span><span className="font-black text-[#1A5F7A] font-sans">{selectedCert.regNo}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-slate-400 font-bold text-[10px] uppercase">Award Date</span><span className="font-black text-[#1A5F7A] font-sans">{selectedCert.date}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-slate-400 font-bold text-[10px] uppercase">Status</span><span className="text-green-500 font-black flex items-center gap-1 font-sans"><FiCheckCircle /> Authenticated</span></div>
                                    </div>
                                    <button onClick={() => window.print()} className="w-full py-5 bg-[#1A5F7A] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-[#F37021] transition-all flex items-center justify-center gap-2 shadow-lg">Download Digital Copy <FiExternalLink /></button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}