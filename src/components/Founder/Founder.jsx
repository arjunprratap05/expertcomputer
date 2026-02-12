import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiLinkedin, FiMail, FiAward, FiShield, FiStar, FiMaximize2, FiX } from 'react-icons/fi';

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
    // State to handle the modal
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
        <div className="min-h-screen bg-slate-50 py-20 px-6 font-sans overflow-x-hidden relative">
            <div className="max-w-7xl mx-auto">
                
                {/* NAVIGATION */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Link to="/" className="inline-flex items-center gap-2 text-[#1A5F7A] font-bold mb-12 hover:underline group">
                        <FiArrowLeft className="group-hover:-translate-x-2 transition-transform" /> 
                        <span className="text-sm uppercase tracking-widest">Back to Academy</span>
                    </Link>
                </motion.div>

                {/* HEADER */}
                <div className="mb-20">
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
                        <FiShield className="text-[#1A5F7A]" />
                        <span className="text-[#1A5F7A] text-[10px] font-black uppercase tracking-widest">The Pillars of ECA Patna</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-[#1A5F7A] leading-[0.9] tracking-tighter mb-6">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F37021] to-[#ff9f67]">Leadership</span> & Faculty.
                    </h1>
                </div>

                {/* FOUNDERS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
                    {founders.map((founder, index) => (
                        <motion.div 
                            key={index}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden"
                        >
                            <div className="w-48 h-56 flex-shrink-0 relative z-10">
                                <img src={founder.image} alt={founder.name} className="w-full h-full object-cover rounded-[2.5rem] shadow-2xl border-4 border-white" />
                            </div>
                            <div className="relative z-10 space-y-4 text-center md:text-left">
                                <h2 className="text-3xl font-black text-[#1A5F7A] uppercase tracking-tighter">{founder.name}</h2>
                                <p className="text-[#F37021] font-black text-xs uppercase tracking-widest">{founder.role}</p>
                                <p className="text-slate-600 font-medium italic leading-relaxed">"{founder.bio}"</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FACULTY GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {faculty.map((member, index) => (
                        <motion.div key={index} className="group flex items-center gap-6 p-6 bg-white rounded-[2.5rem] border border-slate-100 hover:border-[#F37021]/30 transition-all shadow-sm">
                            <div className="w-20 h-20 flex-shrink-0 relative">
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white" />
                                {member.certificates && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-lg">
                                        <FiAward size={14} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-lg text-[#1A5F7A] uppercase tracking-tighter leading-tight">{member.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{member.specialty}</p>
                                <p className="text-[#F37021] text-[10px] font-black uppercase tracking-widest mb-2">{member.exp} Experience</p>
                                
                                {/* Dynamic Certificate Links List - Now triggers modal */}
                                <div className="flex flex-col gap-1.5 mt-2">
                                    {member.certificates?.map((cert, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setActiveCert(cert)}
                                            className="inline-flex items-center gap-1.5 text-[9px] font-black text-[#1A5F7A] uppercase tracking-tighter hover:text-[#F37021] transition-colors border-b border-[#1A5F7A]/10 w-fit pb-0.5 text-left"
                                        >
                                            <FiMaximize2 size={10} /> {cert.name}
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
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
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-8 py-4 border-b">
                                <div className="flex items-center gap-3">
                                    <FiAward className="text-[#F37021] text-xl" />
                                    <h3 className="font-black text-[#1A5F7A] uppercase tracking-widest text-sm">{activeCert.name}</h3>
                                </div>
                                <button 
                                    onClick={() => setActiveCert(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-500"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            {/* PDF Viewer Body */}
                            <div className="flex-1 bg-slate-100 relative">
                                <iframe 
                                    src={`${activeCert.link}#toolbar=0`} 
                                    className="w-full h-full border-none"
                                    title="Certificate Preview"
                                />
                                {/* Mobile Download Hint */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden">
                                    <p className="bg-black/50 text-white px-4 py-2 rounded-full text-[10px] font-bold">
                                        Tap to view/zoom on mobile
                                    </p>
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