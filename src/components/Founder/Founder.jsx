import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiAward, FiShield, FiExternalLink, FiX, FiDownload, FiLayers } from 'react-icons/fi';

// --- DATA & MODAL IMPORTS ---
import SEO from "../../components/SEO";

// Assets
import founder1Img from '../../assets/founder1.png'; 
import founder2Img from '../../assets/founder2.png';
import madhu from '../../assets/madhu.png';
import sudip from '../../assets/sudip.jpeg';
import dananjay from '../../assets/dananjay.jpeg';
import amit from '../../assets/amit.jpeg';
import sanchita from '../../assets/sanchita.jpeg';
import pawan from '../../assets/pawan.jpeg';
import amitsingh from '../../assets/AmitSingh.jpeg';

// Certificate Imports
import sudiptcertificate from '../../assets/certificates/Sudipt-Sengupta TCT Certificate.pdf';
import pawanMSCertificate from '../../assets/certificates/MS Certificate .NET Windows App.pdf';
import pawanMSCertificateSQL from '../../assets/certificates/MS Certificate SQL.pdf';

export default function Founder() {
    const [activeCert, setActiveCert] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize(); // run on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const founders = [
        {
            name: "Sanjai Kumar",
            role: "Founder & Director",
            image: founder1Img,
            expertise: ["Strategic Planning", "39+ Years Exp"],
            bio: "A visionary leader who laid the foundation of Expert Computer Academy in 1987, pioneering technical excellence in the region.",
        },
        {
            name: "Sima Choudhary",
            role: "Co-Founder & Technical Head",
            image: founder2Img,
            expertise: ["Full Stack", "Curriculum Design"],
            bio: "Driving the academy's technological edge, ensuring every student learns modern frameworks demanded by top-tier industries.",
        }
    ];

    const faculty = [
        { name: "Madhu Chanda Ghosh", role: "Java Expert", exp: "34 Years", specialty: "Center Head / Java Expert", image: madhu },
        { 
            name: "Sudipt Sengupta", 
            role: "Senior Faculty", 
            exp: "34 Years", 
            specialty: "Tally, Python Systems", 
            image: sudip,
            certificates: [{ name: "Tally Certified Trainer", link: sudiptcertificate }]
        },
        { 
            name: "Pawan Kumar Jha", 
            role: "Networking Head", 
            exp: "26 Years", 
            specialty: "Infrastructure Specialist", 
            image: pawan,
            certificates: [
                { name: "MS Certified: .NET", link: pawanMSCertificate },
                { name: "MS Certified: SQL", link: pawanMSCertificateSQL }
            ]
        },
        { name: "Dhananjay Kumar", role: "Faculty", exp: "20 Years", specialty: "C/C++ Architecture", image: dananjay },
        { name: "Sanchita Ghosh", role: "Business Lead", exp: "25 Years", specialty: "Communication Skills Expert", image: sanchita },
        { name: "Amit", role: "Faculty", exp: "20 Years", specialty: "Business Executive Operations", image: amit },
        { name: "Amit Kumar Singh", role: "Faculty", exp: "20 Years", specialty: "Corporate Accounts", image: amitsingh }
    ];

    return (
        <div className="min-h-screen bg-[#070D1D] text-slate-100 py-12 md:py-24 px-4 sm:px-6 lg:px-8 font-sans overflow-x-hidden relative selection:bg-[#F37021]/30 selection:text-orange-200">
            
            {/* FULLY INTEGRATED SEO COMPONENT */}
            <SEO 
                title="Leadership & Faculty | Expert Computer Academy"
                description="Meet the visionary founders and elite faculty of Expert Computer Academy in Patna. Industry veterans shaping tech leaders since 1987."
                url="https://expertcomputeracademy.in/founder"
            />
            
            {/* AMBIENT GLOWS & MESH BACKDROP */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-orange-600/10 via-blue-600/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute top-[45%] right-0 w-[500px] h-[700px] bg-indigo-900/15 rounded-full blur-[160px] pointer-events-none -z-10" />
            <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* BACK NAVIGATION */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Link to="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-orange-400 font-semibold mb-12 group transition-colors">
                        <span className="p-2 bg-slate-900/80 border border-slate-700/60 shadow-inner rounded-xl group-hover:-translate-x-1.5 transition-transform backdrop-blur-md">
                            <FiArrowLeft size={16} />
                        </span>
                        <span className="text-xs uppercase tracking-widest font-bold">Back to Academy</span>
                    </Link>
                </motion.div>

                {/* HERO TITLE SECTION */}
                <div className="mb-16 md:mb-28 text-left max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full mb-6 shadow-sm backdrop-blur-md">
                        <FiShield className="text-[#F37021]" size={14} />
                        <span className="text-[#F37021] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">The Pillars of ECA Patna</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tight text-white mb-6 leading-[1.05]">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200">Leadership</span> <br className="hidden md:inline"/>& Elite Faculty
                    </h1>
                    <p className="text-slate-400 text-base md:text-xl font-normal max-w-2xl leading-relaxed">
                        Meet the visionaries and industry veterans shaping the tech leaders of tomorrow since 1987.
                    </p>
                </div>

                {/* FOUNDERS SECTION */}
                <div className="space-y-12 md:space-y-20 mb-24 md:mb-40">
                    <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                        <FiLayers className="text-[#F37021]" size={24} />
                        <h2 className="text-2xl font-black tracking-[0.2em] uppercase text-white">Founding Board</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                        {founders.map((founder, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="bg-gradient-to-br from-[#0A192F] to-[#070D1D] rounded-3xl border border-slate-800 hover:border-slate-700 p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center sm:items-stretch gap-6 md:gap-8 relative overflow-hidden group transition-all backdrop-blur-md"
                            >
                                <div className="w-full sm:w-48 md:w-56 h-64 sm:h-auto flex-shrink-0 relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800">
                                    <img 
                                        src={founder.image} 
                                        alt={founder.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        fetchpriority="high"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#070D1D]/80 via-transparent to-transparent opacity-80 sm:opacity-60" />
                                </div>
                                
                                <div className="flex flex-col justify-between py-2 text-center sm:text-left flex-1">
                                    <div>
                                        <span className="text-[#F37021] font-black text-[10px] md:text-xs uppercase tracking-widest block mb-2">
                                            {founder.role}
                                        </span>
                                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">
                                            {founder.name}
                                        </h3>
                                        <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal mb-6">
                                            "{founder.bio}"
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-auto">
                                        {founder.expertise.map((exp, i) => (
                                            <span key={i} className="bg-slate-900/80 text-slate-300 border border-slate-700/60 shadow-inner text-xs px-3 py-1.5 rounded-lg font-bold">
                                                {exp}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* FACULTY SECTION */}
                <div className="space-y-12">
                    <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                        <FiAward className="text-[#F37021]" size={24} />
                        <h2 className="text-2xl font-black tracking-[0.2em] uppercase text-white">Expert Core Faculty</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {faculty.map((member, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="group bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-orange-500/40 rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-[0_10px_30px_rgba(243,112,33,0.1)]"
                            >
                                <div>
                                    {/* Card Top Avatar/Meta */}
                                    <div className="flex items-center gap-4 md:gap-5 mb-5">
                                        <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 relative bg-slate-950 rounded-xl overflow-hidden border border-slate-700">
                                            <img 
                                                src={member.image} 
                                                alt={member.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                            {member.certificates && (
                                                <div className="absolute top-1 right-1 bg-[#F37021] text-white p-1 rounded-md shadow-md">
                                                    <FiAward size={10} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-0.5">
                                                {member.exp} EXP
                                            </span>
                                            <h4 className="font-bold text-base md:text-lg text-white tracking-tight leading-snug truncate">
                                                {member.name}
                                            </h4>
                                            <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                                                {member.role}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Specialty Badge */}
                                    <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-2.5 mb-4 shadow-inner">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-0.5">Core Mastery</span>
                                        <span className="text-xs text-slate-200 font-semibold">{member.specialty}</span>
                                    </div>
                                </div>

                                {/* Certification Documents CTA */}
                                {member.certificates && (
                                    <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-800">
                                        {member.certificates.map((cert, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setActiveCert(cert)}
                                                className="inline-flex items-center justify-between gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-slate-800/50 hover:bg-orange-500/10 border border-slate-700 hover:border-orange-500/30 rounded-lg px-3 py-2.5 w-full text-left group/btn"
                                            >
                                                <span className="truncate">{cert.name}</span>
                                                <FiExternalLink size={14} className="shrink-0 transition-transform group-hover/btn:translate-x-0.5 text-[#F37021]" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* EXPANDED CERTIFICATE VIEWPORT MODAL */}
            <AnimatePresence>
                {activeCert && (
                    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 lg:p-12">
                        
                        {/* Dim Backdrop Layer */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveCert(null)}
                            className="absolute inset-0 bg-[#070D1D]/80 backdrop-blur-md"
                        />
                        
                        {/* Interactive Window Layer */}
                        <motion.div 
                            initial={isMobile ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
                            exit={isMobile ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", damping: 28, stiffness: 260 }}
                            className="relative w-full md:max-w-4xl h-[90vh] md:h-[85vh] bg-[#0A192F] border border-slate-800 md:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-10"
                        >
                            {/* Window Controller Bar */}
                            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 bg-orange-500/10 border border-orange-500/20 text-[#F37021] rounded-lg shrink-0 shadow-inner">
                                        <FiAward size={16} />
                                    </div>
                                    <h3 className="font-bold text-white text-sm md:text-base truncate pr-4">
                                        {activeCert.name}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <a 
                                        href={activeCert.link} 
                                        download 
                                        className="p-2.5 bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700 rounded-lg transition-colors shadow-sm"
                                        title="Download Certificate"
                                    >
                                        <FiDownload size={16} />
                                    </a>
                                    <button 
                                        onClick={() => setActiveCert(null)}
                                        className="p-2.5 bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700 hover:bg-slate-700 hover:border-red-900/50 rounded-lg transition-colors shadow-sm"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Embed Embedded PDF View */}
                            <div className="flex-1 bg-slate-950 relative">
                                <iframe 
                                    src={`${activeCert.link}#view=FitH&toolbar=1`} 
                                    className="w-full h-full border-none"
                                    title="Verification Panel Preview"
                                />
                                {isMobile && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                                        <div className="bg-slate-900/90 text-slate-300 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-slate-700 shadow-xl backdrop-blur-md">
                                            Pinch viewport to zoom
                                        </div>
                                    </div>
                                )}
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