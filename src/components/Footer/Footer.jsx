import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebookF, FaYoutube, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import expertcomputerlogo from '../../assets/expertcomputerlogo.png'; 

const calculateYearsOfExperience = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); 
    let years = currentYear - 1987;
    if (currentMonth < 2) {
        years--;
    }
    return years;
};

export default function Footer() {
    const navigate = useNavigate();
    const location = useLocation();
    const mapUrl = "https://maps.google.com/?q=Expert+Computer+Academy+Patna";

    const handleFooterLinkClick = (item) => {
        if (item.isPdf) {
            window.open(item.link, '_blank', 'noopener,noreferrer');
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
            navigate(item.link);
        }
    };

    // UNIVERSAL LOGO ROUTING & SCROLL LOGIC
    const handleLogoClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault(); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    };

    const yearsOfExperience = calculateYearsOfExperience();

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
        <footer className="relative overflow-hidden bg-[#070D1D] text-slate-300 font-sans border-t border-slate-800/60 z-10 selection:bg-[#F37021]/30 selection:text-orange-200">
            
            {/* GLOWING TOP ACCENT LINE */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#F37021]/60 to-transparent opacity-70" />

            {/* AMBIENT GLOWS & MESH BACKDROP */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

            <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20 relative z-10">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                    
                    {/* BRAND & SOCIAL SECTION */}
                    <div className="space-y-6 lg:col-span-4">
                        <Link 
                            to="/"
                            onClick={handleLogoClick} 
                            className="group block w-max"
                        >
                            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-2.5 rounded-2xl shadow-lg group-hover:border-[#F37021]/40 group-hover:shadow-[0_0_20px_rgba(243,112,33,0.15)] transition-all duration-300">
                                <img 
                                    src={expertcomputerlogo} 
                                    className="h-14 w-auto rounded-xl object-contain drop-shadow-md" 
                                    alt="Expert Computer Logo" 
                                />
                            </div>
                        </Link>
                        
                        <p className="max-w-sm text-sm font-normal leading-relaxed text-slate-400">
                            Empowering students in Patna with IT excellence since 1987. 
                            Our <span className="font-bold text-slate-200">{yearsOfExperience}+ years legacy</span> is built entirely on hands-on, practical learning and industry alignment.
                        </p>
                        
                        <div className="flex flex-wrap gap-3 pt-2">
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
                                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-[#F37021] hover:bg-gradient-to-br hover:from-[#F37021] hover:to-orange-600 hover:text-white hover:shadow-[0_8px_20px_rgba(243,112,33,0.3)]"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* PROGRAMS LINKS */}
                    <div className="lg:col-span-2 lg:pl-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F37021] mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2.5 after:left-0 after:w-8 after:h-[2px] after:bg-[#F37021]/50 after:rounded-full">
                            Curriculums
                        </h4>
                        <ul className="space-y-4">
                            {footerLinks.programs.map((item, i) => (
                                <li key={i}>
                                    <button 
                                        onClick={() => handleFooterLinkClick(item)} 
                                        className="group flex items-center gap-2.5 text-left text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-white w-full"
                                    >
                                        <FiArrowRight className="text-xs text-slate-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#F37021]" />
                                        <span>
                                            {item.name} 
                                            {item.isPdf && (
                                                <span className="ml-2 rounded-md bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[9px] font-black tracking-widest text-blue-400 uppercase">
                                                    PDF
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ACADEMY LINKS */}
                    <div className="lg:col-span-2 lg:pl-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F37021] mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2.5 after:left-0 after:w-8 after:h-[2px] after:bg-[#F37021]/50 after:rounded-full">
                            Academy
                        </h4>
                        <ul className="space-y-4">
                            {footerLinks.academy.map((item, i) => (
                                <li key={i}>
                                    <button 
                                        onClick={() => handleFooterLinkClick(item)} 
                                        className="group flex items-center gap-2.5 text-left text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-white w-full"
                                    >
                                        <FiArrowRight className="text-xs text-slate-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#F37021]" />
                                        <span>{item.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* VISIT US CONTACT CARDS */}
                    <div className="space-y-6 lg:col-span-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F37021] mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2.5 after:left-0 after:w-8 after:h-[2px] after:bg-[#F37021]/50 after:rounded-full">
                            Visit Hub
                        </h4>
                        <div className="space-y-4">
                            {/* Phone Card */}
                            <a href="tel:+917282983335" className="group flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-[#F37021]/40 hover:bg-slate-800/60 hover:shadow-[0_4px_20px_rgba(243,112,33,0.1)]">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#F37021] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#F37021] group-hover:text-white shadow-inner">
                                    <HiOutlinePhone className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Admissions</p>
                                    <p className="text-sm font-bold text-slate-200 transition-colors duration-200 group-hover:text-white mt-0.5">+91 7282983335</p>
                                </div>
                            </a>

                            {/* Email Card */}
                            <a href="mailto:expertcomputeracademypatna@gmail.com" className="group flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:bg-slate-800/60 hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)] min-w-0">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white shadow-inner">
                                    <HiOutlineMail className="text-2xl" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Support Desk</p>
                                    <p className="text-sm font-bold text-slate-200 truncate transition-colors duration-200 group-hover:text-white mt-0.5">expertcomputeracademypatna@gmail.com</p>
                                </div>
                            </a>

                            {/* Location Card */}
                            <a href={mapUrl} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-teal-500/40 hover:bg-slate-800/60 hover:shadow-[0_4px_20px_rgba(20,184,166,0.1)]">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white shadow-inner">
                                    <HiOutlineLocationMarker className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Boring Road Campus</p>
                                    <p className="text-sm font-medium leading-snug text-slate-300 transition-colors duration-200 group-hover:text-white mt-0.5">Kumar Tower, 2nd Floor, Boring Road crossing, Patna</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* BOTTOM COPYRIGHT ROW */}
                <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-[10px] md:text-[11px] font-bold tracking-widest text-slate-500 text-center md:text-left uppercase">
                        © {new Date().getFullYear()} EXPERT COMPUTER ACADEMY. ALL RIGHTS RESERVED.
                    </div>
                    
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 px-4 py-2 rounded-full shadow-inner">
                        Handcrafted for Bihar
                        <motion.span 
                            animate={{ scale: [1, 1.25, 1] }} 
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} 
                            className="text-red-500 inline-block drop-shadow-[0_0_5px_rgba(239,68,68,0.6)]"
                        >
                            ❤️
                        </motion.span>
                    </div>
                </div>
            </div>
        </footer>
    );
}