import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebookF, FaYoutube, FaLinkedinIn, FaInstagram, FaArrowRight } from 'react-icons/fa';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import expertcomputerlogo from '../../assets/expertcomputerlogo.png'; 

export default function Footer() {
    const navigate = useNavigate();
    const mapUrl = "https://maps.google.com/?q=Expert+Computer+Academy+Patna";

    // --- 1. SCROLL MANAGEMENT ---
    const handleFooterLinkClick = (path) => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        navigate(path);
    };

    const footerLinks = {
        programs: [
            { name: 'ADCA+', link: '/courses' },
            { name: 'Python Data Science', link: '/courses' },
            { name: 'Web Development', link: '/courses' },
            { name: 'Digital Marketing', link: '/courses' },
        ],
        academy: [
            { name: 'About Us', link: '/about' },
            { name: 'Founder', link: '/founder' },
            { name: 'Hall of Fame', link: '/achievements' },
            { name: 'Placement Cell', link: '/placements' },
            { name: 'Contact Us', link: '/contact' },
        ],
    };

    return (
        <footer className="bg-[#1A5F7A] text-white overflow-hidden relative">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#F37021] via-orange-400 to-[#1A5F7A]" />

            <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    
                    {/* 1. BRAND & LOGO (Fixed Visibility) */}
                    <div className="space-y-6">
                        <button onClick={() => handleFooterLinkClick('/')} className="inline-block transition-transform hover:scale-105">
                            <img
                                src={expertcomputerlogo}
                                // Removed brightness-0 invert to ensure visibility
                                className="h-16 w-auto object-contain" 
                                alt="Expert Computer Academy"
                            />
                        </button>
                        <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
                            Empowering students in Patna with IT excellence since 1987. 
                            Our 38+ year legacy is built on 100% practical learning and industry-ready skills.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: <FaFacebookF />, url: "https://www.facebook.com/expertcomputeracademy/" },
                                { icon: <FaInstagram />, url: "https://www.instagram.com/expertcomputeracademypatna/" },
                                { icon: <FaYoutube />, url: "https://youtube.com/@expertcomputeracademy" },
                                { icon: <FaLinkedinIn />, url: "https://linkedin.com/company/expert-computer-academy" }
                            ].map((social, i) => (
                                <a key={i} href={social.url} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#F37021] hover:text-white transition-all duration-300 border border-white/5">
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* 2. PROGRAMS COLUMN */}
                    <div>
                        <h4 className="text-[#F37021] font-bold uppercase tracking-widest text-xs mb-8 border-l-4 border-[#F37021] pl-3">Popular Programs</h4>
                        <ul className="space-y-4">
                            {footerLinks.programs.map((item, i) => (
                                <li key={i}>
                                    <button onClick={() => handleFooterLinkClick(item.link)} className="text-slate-300 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2 group">
                                        <FaArrowRight className="text-[10px] text-[#F37021] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 3. ACADEMY COLUMN */}
                    <div>
                        <h4 className="text-[#F37021] font-bold uppercase tracking-widest text-xs mb-8 border-l-4 border-[#F37021] pl-3">Academy</h4>
                        <ul className="space-y-4">
                            {footerLinks.academy.map((item, i) => (
                                <li key={i}>
                                    <button onClick={() => handleFooterLinkClick(item.link)} className="text-slate-300 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2 group">
                                        <FaArrowRight className="text-[10px] text-[#F37021] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 4. CONTACT & LOCATION */}
                    <div className="space-y-6">
                        <h4 className="text-[#F37021] font-bold uppercase tracking-widest text-xs mb-8 border-l-4 border-[#F37021] pl-3">Visit Us</h4>
                        <div className="space-y-5">
                            <a href="tel:+917282983335" className="flex items-start gap-3 group">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#F37021]/20 transition-colors border border-white/5">
                                    <HiOutlinePhone className="text-xl text-[#F37021]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Admissions</p>
                                    <p className="text-sm font-medium hover:text-[#F37021] transition-colors">+91 7282983335</p>
                                </div>
                            </a>

                            <a href="mailto:expertcomputeracademypatna@gmail.com" className="flex items-start gap-3 group">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#F37021]/20 transition-colors border border-white/5">
                                    <HiOutlineMail className="text-xl text-[#F37021]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Support Email</p>
                                    <p className="text-sm font-medium italic truncate max-w-[150px]">expertcomputeracademypatna@gmail.com</p>
                                </div>
                            </a>

                            <a href={mapUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 group">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#F37021]/20 transition-colors border border-white/5">
                                    <HiOutlineLocationMarker className="text-xl text-[#F37021]" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Boring Road Campus</p>
                                    <p className="text-sm font-medium leading-tight">Kumar Tower, Patna</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-[11px] text-slate-400 font-medium tracking-wider text-center md:text-left">
                        © {new Date().getFullYear()} EXPERT COMPUTER ACADEMY. ALL RIGHTS RESERVED.
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                        Handcrafted for the future of Bihar
                        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-red-500">❤️</motion.span>
                    </div>
                </div>
            </div>
        </footer>
    );
}