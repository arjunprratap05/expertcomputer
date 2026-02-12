import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiAward, FiShield, FiMaximize2, FiX, FiDownload } from 'react-icons/fi';

// Assets
import founder1Img from '../../assets/founder1.png'; 
import founder2Img from '../../assets/founder2.png';
import madhu from '../../assets/madhu.png';
import sudip from '../../assets/sudip.jpeg';
import dananjay from '../../assets/dananjay.jpeg';
import amit from '../../assets/amit.jpeg';
import sanchita from '../../assets/sanchita.jpeg';
import pawan from '../../assets/pawan.jpeg';

// Certificate Imports
import sudiptcertificate from '../../assets/certificates/Sudipt-Sengupta TCT Certificate.pdf';
import pawanMSCertificate from '../../assets/certificates/MS Certificate .NET Windows App.pdf';
import pawanMSCertificateSQL from '../../assets/certificates/MS Certificate SQL.pdf';

export default function Founder() {
    const [activeCert, setActiveCert] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const founders = [
        {
            name: "Sanjai Kumar",
            role: "Founder & Director",
            image: founder1Img,
            expertise: ["Strategic Planning", "38+ Years Exp"],
            bio: "A visionary leader who laid the foundation of Expert Computer Academy in 1987.",
        },
        {
            name: "Sima Choudhary",
            role: "Co-Founder & Technical Head",
            image: founder2Img,
            expertise: ["Full Stack", "Curriculum Design"],
            bio: "Ensuring every student learns technologies the industry actually demands.",
        }
    ];

    const faculty = [
        { name: "Madhu Chanda Ghosh", role: "Java Expert", exp: "34 Years", specialty: "Center Head/Java Expert", image: madhu },
        { 
            name: "Sudipt Sengupta", 
            role: "Faculty", 
            exp: "34 Years", 
            specialty: "Tally, Python", 
            image: sudip,
            certificates: [
                { name: "Tally Certified Trainer", link: sudiptcertificate }
            ]
        },
        { 
            name: "Pawan Kumar Jha", 
            role: "Networking", 
            exp: "26 Years", 
            specialty: "Networking Specialist", 
            image: pawan,
            certificates: [
                { name: "MS Certified: .NET", link: pawanMSCertificate },
                { name: "MS Certified: SQL", link: pawanMSCertificateSQL }
            ]
        },
        { name: "Dhananjay Kumar", role: "Faculty", exp: "20 Years", specialty: "C/C++ Specialist", image: dananjay },
        { name: "Sanchita Ghosh", role: "Faculty", exp: "20 Years", specialty: "Counselor", image: sanchita },
        { name: "Amit", role: "Faculty", exp: "20 Years", specialty: "Counselor", image: amit }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12 md:py-20 px-4 md:px-6 font-sans overflow-x-hidden relative">
            <div className="max-w-7xl mx-auto">
                
                {/* NAVIGATION */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Link to="/" className="inline-flex items-center gap-2 text-[#1A5F7A] font-bold mb-8 md:mb-12 hover:underline group">
                        <FiArrowLeft className="group-hover:-translate-x-2 transition-transform" /> 
                        <span className="text-xs md:text-sm uppercase tracking-widest">Back to Academy</span>
                    </Link>
                </motion.div>

                {/* HEADER */}
                <div className="mb-12 md:mb-20 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
                        <FiShield className="text-[#1A5F7A]" />
                        <span className="text-[#1A5F7A] text-[9px] md:text-[10px] font-black uppercase tracking-widest">The Pillars of ECA Patna</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-[#1A5F7A] leading-[1.1] md:leading-[0.9] tracking-tighter mb-6">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F37021] to-[#ff9f67]">Leadership</span> & Faculty.
                    </h1>
                </div>

                {/* FOUNDERS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-20 md:mb-32">
                    {founders.map((founder, index) => (
                        <motion.div 
                            key={index}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-6 md:gap-10 relative overflow-hidden"
                        >
                            <div className="w-40 h-48 md:w-48 md:h-56 flex-shrink-0 relative z-10 bg-slate-100 rounded-[1.5rem] md:rounded-[2.5rem]">
                                <img 
                                    src={founder.image} 
                                    alt={founder.name} 
                                    className="w-full h-full object-cover rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border-4 border-white"
                                    fetchpriority="high" // Prioritize main founders
                                />
                            </div>
                            <div className="relative z-10 space-y-3 md:space-y-4 text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-black text-[#1A5F7A] uppercase tracking-tighter">{founder.name}</h2>
                                <p className="text-[#F37021] font-black text-[10px] md:text-xs uppercase tracking-widest">{founder.role}</p>
                                <p className="text-slate-600 text-sm md:text-base font-medium italic leading-relaxed">"{founder.bio}"</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FACULTY GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {faculty.map((member, index) => (
                        <motion.div key={index} className="group flex items-center gap-5 md:gap-6 p-5 md:p-6 bg-white rounded-[2rem] border border-slate-100 hover:border-[#F37021]/30 transition-all shadow-sm">
                            <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 relative bg-slate-50 rounded-xl md:rounded-2xl">
                                <img 
                                    src={member.image} 
                                    alt={member.name} 
                                    className="w-full h-full object-cover rounded-xl md:rounded-2xl shadow-md border-2 border-white"
                                    loading="lazy" // Optimized for faster page load
                                />
                                {member.certificates && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-1 rounded-full shadow-lg">
                                        <FiAward size={12} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-base md:text-lg text-[#1A5F7A] uppercase tracking-tighter leading-tight truncate">{member.name}</h3>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{member.specialty}</p>
                                <p className="text-[#F37021] text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-2">{member.exp} Experience</p>
                                
                                <div className="flex flex-col gap-1.5 mt-2">
                                    {member.certificates?.map((cert, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setActiveCert(cert)}
                                            className="inline-flex items-center gap-1.5 text-[8px] md:text-[9px] font-black text-[#1A5F7A] uppercase tracking-tighter hover:text-[#F37021] transition-colors border-b border-[#1A5F7A]/10 w-fit pb-0.5 text-left"
                                        >
                                            <FiMaximize2 size={10} className="shrink-0" /> <span className="truncate max-w-[120px] md:max-w-full">{cert.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CERTIFICATE POP-UP MODAL */}
            <AnimatePresence>
                {activeCert && (
                    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-10">
                        {/* Overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveCert(null)}
                            className="absolute inset-0 bg-[#0A192F]/90 backdrop-blur-md"
                        />
                        
                        {/* Modal Content */}
                        <motion.div 
                            initial={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                            animate={window.innerWidth < 768 ? { y: 0 } : { scale: 1, opacity: 1 }}
                            exit={window.innerWidth < 768 ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative w-full md:max-w-4xl h-[92vh] md:h-[80vh] bg-white rounded-t-[2rem] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b bg-white">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <FiAward className="text-[#F37021] text-lg md:text-xl" />
                                    <h3 className="font-black text-[#1A5F7A] uppercase tracking-widest text-[10px] md:text-sm truncate max-w-[200px] md:max-w-full">
                                        {activeCert.name}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={activeCert.link} download className="p-2 text-slate-400 hover:text-[#F37021] md:hidden">
                                        <FiDownload size={20} />
                                    </a>
                                    <button 
                                        onClick={() => setActiveCert(null)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-500"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* PDF Viewer Body */}
                            <div className="flex-1 bg-slate-50 relative overflow-hidden">
                                <iframe 
                                    src={`${activeCert.link}#view=FitH&toolbar=0`} 
                                    className="w-full h-full border-none"
                                    title="Certificate Preview"
                                />
                                
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 md:hidden pointer-events-none">
                                    <div className="bg-black/60 text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest">
                                        Pinch to zoom
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export const founderInfoLoader = async () => {
    return {}; 
};