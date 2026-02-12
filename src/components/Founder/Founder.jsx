import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiLinkedin, FiMail, FiAward, FiShield, FiStar, FiExternalLink } from 'react-icons/fi';

// Assets
import founder1Img from '../../assets/founder1.png'; 
import founder2Img from '../../assets/founder2.png';
import madhu from '../../assets/madhu.png';
import sudip from '../../assets/sudip.jpeg';
import dananjay from '../../assets/dananjay.jpeg';
import amit from '../../assets/amit.jpeg';
import sanchita from '../../assets/sanchita.jpeg';
import pawan from '../../assets/pawan.jpeg';

// Certificate Import
import sudiptcertificate from '../../assets/certificates/Sudipt-Sengupta TCT Certificate.pdf';

export default function Founder() {
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
            certificate: sudiptcertificate,
            certName: "Tally Certified Trainer"
        },
        { name: "Pawan Kumar Jha", role: "Networking", exp: "26 Years", specialty: "Networking Specialist", image: pawan },
        { name: "Dhananjay Kumar", role: "Faculty", exp: "20 Years", specialty: "C/C++ Specialist", image: dananjay },
        { name: "Sanchita Ghosh", role: "Faculty", exp: "20 Years", specialty: "Counselor", image: sanchita },
        { name: "Amit", role: "Faculty", exp: "20 Years", specialty: "Counselor", image: amit }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-6 font-sans overflow-x-hidden">
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
                                {member.certificate && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-lg">
                                        <FiAward size={14} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-lg text-[#1A5F7A] uppercase tracking-tighter leading-tight">{member.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{member.specialty}</p>
                                <p className="text-[#F37021] text-[10px] font-black uppercase tracking-widest mb-2">{member.exp} Experience</p>
                                
                                {/* Dynamic Certificate Link for Sudip Sengupta */}
                                {member.certificate && (
                                    <a 
                                        href={member.certificate} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[9px] font-black text-[#1A5F7A] uppercase tracking-tighter hover:text-[#F37021] transition-colors border-b border-[#1A5F7A]/20 pb-0.5"
                                    >
                                        <FiExternalLink /> View {member.certName}
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export const founderInfoLoader = async () => {
    return {}; 
};