import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebookF, FaYoutube, FaLinkedinIn, FaInstagram, FaArrowRight } from 'react-icons/fa';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import expertcomputerlogo from '../../assets/expertcomputerlogo.jpeg'; 

export default function Footer() {
    const navigate = useNavigate();
    const mapUrl = "https://maps.google.com/?q=Expert+Computer+Academy+Patna";

    const handleFooterLinkClick = (item) => {
        if (item.isPdf) {
            window.open(item.link, '_blank', 'noopener,noreferrer');
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
            navigate(item.link);
        }
    };

    const footerLinks = {
        programs: [
            { name: 'ADCA+', link: '/pdfs/adca-syllabus.pdf', isPdf: true },
            { name: 'Python Data Science', link: '/pdfs/python-ds.pdf', isPdf: true },
            { name: 'Web Development', link: '/pdfs/web-dev.pdf', isPdf: true },
            { name: 'Digital Marketing', link: '/pdfs/digital-marketing.pdf', isPdf: true },
        ],
        academy: [
            { name: 'About Us', link: '/about' },
            { name: 'Founder', link: '/founder' },
            { name: 'Hall of Fame', link: '/halloffame' },
            { name: 'Placement Cell', link: '/placements' },
            { name: 'Contact Us', link: '/contact' },
        ],
    };

    return (
        <footer className="relative overflow-hidden bg-slate-950 text-slate-200">
            {/* Top Accent Gradient Border */}
            <div className="h-[4px] w-full bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-500" />

            {/* Glowing Decorative Background Blobs for Modern UI Depth */}
            <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 -z-10 h-72 w-72 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />

            <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
                {/* 
                  Responsive Grid Architecture:
                  - Mobile: 1 Column
                  - iPads/Tablets (md): 2 Columns (Clean layout split)
                  - Desktop (lg): 12-Column Grid for precise proportioning
                */}
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                    
                    {/* 1. BRAND COLUMN */}
                    <div className="space-y-6 lg:col-span-4">
                        <button 
                            onClick={() => navigate('/')} 
                            className="group block transition-transform duration-300 active:scale-95"
                        >
                            <img 
                                src={expertcomputerlogo} 
                                className="h-14 w-auto rounded-xl bg-white p-1.5 shadow-md transition-all duration-300 group-hover:shadow-cyan-500/20" 
                                alt="Logo" 
                            />
                        </button>
                        <p className="max-w-sm text-sm font-normal leading-relaxed text-slate-400">
                            Empowering students in Patna with IT excellence since 1987. 
                            Our <span className="font-semibold text-white">38+ years legacy</span> is built entirely on hands-on, practical learning.
                        </p>
                        {/* Social Media Links with glassmorphism style */}
                        <div className="flex flex-wrap gap-3">
                            {[
                                { icon: <FaFacebookF />, url: "https://www.facebook.com/expertcomputeracademypat/" },
                                { icon: <FaInstagram />, url: "https://www.instagram.com/expertcomputeracademypatna/" },
                                { icon: <FaYoutube />, url: "https://youtube.com/@expertcomputeracademy" },
                                { icon: <FaLinkedinIn />, url: "https://linkedin.com/in/expert-computer-academy-9234363b6" }
                            ].map((social, i) => (
                                <a 
                                    key={i} 
                                    href={social.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/20"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* 2. PROGRAMS COLUMN */}
                    <div className="lg:col-span-2 lg:pl-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-6 after:h-[2px] after:bg-orange-500">
                            Programs
                        </h4>
                        <ul className="space-y-3.5">
                            {footerLinks.programs.map((item, i) => (
                                <li key={i}>
                                    <button 
                                        onClick={() => handleFooterLinkClick(item)} 
                                        className="group flex items-center gap-2 text-left text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-white"
                                    >
                                        <FaArrowRight className="text-[10px] text-orange-500 transition-transform duration-200 group-hover:translate-x-1" />
                                        <span>
                                            {item.name} 
                                            {item.isPdf && (
                                                <span className="ml-1.5 rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-cyan-400 uppercase">
                                                    PDF
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 3. ACADEMY COLUMN */}
                    <div className="lg:col-span-2 lg:pl-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-6 after:h-[2px] after:bg-orange-500">
                            Academy
                        </h4>
                        <ul className="space-y-3.5">
                            {footerLinks.academy.map((item, i) => (
                                <li key={i}>
                                    <button 
                                        onClick={() => handleFooterLinkClick(item)} 
                                        className="group flex items-center gap-2 text-left text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-white"
                                    >
                                        <FaArrowRight className="text-[10px] text-orange-500 transition-transform duration-200 group-hover:translate-x-1" />
                                        <span>{item.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 4. CONTACT & LOCATION COLUMN */}
                    <div className="space-y-6 lg:col-span-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-6 after:h-[2px] after:bg-orange-500">
                            Visit Us
                        </h4>
                        <div className="space-y-4">
                            {/* Phone */}
                            <a href="tel:+917282983335" className="group flex items-start gap-3.5 rounded-2xl border border-slate-900 bg-slate-900/50 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-slate-800 hover:bg-slate-900">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white">
                                    <HiOutlinePhone className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Admissions</p>
                                    <p className="text-sm font-semibold text-slate-300 transition-colors duration-200 group-hover:text-white">+91 7282983335</p>
                                </div>
                            </a>

                            {/* Email */}
                            <a href="mailto:expertcomputeracademypatna@gmail.com" className="group flex items-start gap-3.5 rounded-2xl border border-slate-900 bg-slate-900/50 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-slate-800 hover:bg-slate-900 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 transition-colors duration-300 group-hover:bg-cyan-500 group-hover:text-white">
                                    <HiOutlineMail className="text-xl" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Support Email</p>
                                    <p className="text-sm font-semibold text-slate-300 truncate transition-colors duration-200 group-hover:text-white">expertcomputeracademypatna@gmail.com</p>
                                </div>
                            </a>

                            {/* Location */}
                            <a href={mapUrl} target="_blank" rel="noreferrer" className="group flex items-start gap-3.5 rounded-2xl border border-slate-900 bg-slate-900/50 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-slate-800 hover:bg-slate-900">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-white">
                                    <HiOutlineLocationMarker className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Boring Road Campus</p>
                                    <p className="text-sm font-medium leading-normal text-slate-300 transition-colors duration-200 group-hover:text-white">Kumar Tower, 2nd Floor, Boring Road crossing, Patna</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* BOTTOM FOOTER BAR */}
                <div className="mt-16 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-[11px] font-medium tracking-widest text-slate-500 text-center sm:text-left">
                        © {new Date().getFullYear()} EXPERT COMPUTER ACADEMY. ALL RIGHTS RESERVED.
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
                        Handcrafted for Bihar
                        <motion.span 
                            animate={{ scale: [1, 1.2, 1] }} 
                            transition={{ repeat: Infinity, duration: 1.5 }} 
                            className="text-red-500 inline-block"
                        >
                            ❤️
                        </motion.span>
                    </div>
                </div>
            </div>
        </footer>
    );
}