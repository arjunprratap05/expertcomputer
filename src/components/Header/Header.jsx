import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiChevronDown, FiBook, FiShield, FiX, FiMenu, 
    FiUser, FiArrowRight, FiZap, FiLock
} from 'react-icons/fi';
import { techCoursesData } from '../../data/courses';
import expertcomputerlogo from '../../assets/expertcomputerlogo.png';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobileDropdown, setActiveMobileDropdown] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    // Sync expiry logic with Home.jsx (Webinar ends April 24, 4:00 PM)
    const isWebinarActive = new Date() < new Date("2026-04-24T16:00:00");

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 20);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const scrollToSection = (id) => {
        setIsMobileMenuOpen(false);
        if (location.pathname === '/') {
            const element = document.getElementById(id);
            if (element) {
                window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
            }
        } else {
            navigate('/', { state: { targetId: id } });
        }
    };

    const handleCourseClick = (course) => {
        scrollToSection(course.sectionId || 'signature-courses');
    };

    return (
        <header 
            className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
                isScrolled 
                ? 'py-2 bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(26,95,122,0.1)] border-b border-white/20' 
                : 'py-4 bg-transparent border-b border-transparent'
            }`}
        >
            {/* VIBRANT TOP ACCENT */}
            <motion.div 
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 h-[4px] w-full bg-gradient-to-r from-[#1A5F7A] via-[#F37021] to-[#1A5F7A] bg-[length:200%_auto]"
            />
            
            <nav className="max-w-screen-2xl mx-auto px-6 lg:px-12">
                <div className="flex justify-between items-center h-16 lg:h-20">
                    
                    {/* LOGO */}
                    <Link to="/" className="flex items-center group shrink-0">
                        <img 
                            src={expertcomputerlogo} 
                            className={`transition-all duration-500 ${isScrolled ? 'h-10 lg:h-12' : 'h-12 lg:h-16'}`}
                            alt="Logo" 
                        />
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden lg:flex items-center gap-8">
                        <ul className="flex items-center space-x-8">
                            {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                <li key={name}>
                                    <NavLink 
                                        to={`/${name.toLowerCase().replace(/ /g, '')}`} 
                                        className={({ isActive }) => `text-[11px] font-black uppercase tracking-[0.2em] relative py-1 transition-all ${isActive ? "text-[#F37021]" : "text-[#1A5F7A] hover:text-[#F37021]"}`}
                                    >
                                        {name}
                                    </NavLink>
                                </li>
                            ))}
                            
                            {/* COURSES DROPDOWN */}
                            <li className="relative group">
                                <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] py-6 text-[#1A5F7A] group-hover:text-[#F37021] transition-colors">
                                    Courses <FiChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                                </button>
                                <div className="absolute left-1/2 -translate-x-1/2 top-[90%] w-72 bg-white/90 backdrop-blur-2xl shadow-3xl rounded-3xl p-4 border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                    <div className="grid gap-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                                        {techCoursesData.map(c => (
                                            <button key={c.id} onClick={() => handleCourseClick(c)} className="w-full text-left p-3 rounded-2xl hover:bg-orange-50 flex items-center gap-4 transition-all group/item">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover/item:bg-[#F37021] transition-colors">
                                                    <FiBook className="text-[#1A5F7A] group-hover/item:text-white" size={14} />
                                                </div>
                                                <span className="text-[10px] font-black text-[#1A5F7A] uppercase tracking-wider">{c.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </li>
                        </ul>

                        {/* ACTION BUTTONS */}
                        <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
                            <Link to="/admin/login" className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-[#1A5F7A] transition-colors group">
                                <FiLock className="text-sm group-hover:text-[#F37021]" /> Admin
                            </Link>

                            <Link to="/student-login" className="flex items-center gap-2 text-[#1A5F7A] font-black text-[10px] uppercase tracking-widest hover:text-[#F37021] transition-colors">
                                <FiUser className="text-lg" /> ERP
                            </Link>
                            
                           
                        </div>
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button className="lg:hidden text-2xl text-[#1A5F7A] p-2 bg-slate-50 rounded-xl" onClick={() => setIsMobileMenuOpen(true)}>
                        <FiMenu />
                    </button>
                </div>
            </nav>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] lg:hidden bg-[#1A5F7A]/60 backdrop-blur-md">
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute right-0 top-0 h-screen w-[85%] bg-white shadow-3xl p-8 flex flex-col rounded-l-[3rem]">
                            <div className="flex justify-between items-center mb-12">
                                <img src={expertcomputerlogo} className="h-10" alt="Logo" />
                                <button className="p-3 bg-slate-100 rounded-2xl text-[#F37021]" onClick={() => setIsMobileMenuOpen(false)}><FiX size={24} /></button>
                            </div>
                            <div className="space-y-6">
                                {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                    <NavLink key={name} to={`/${name.toLowerCase().replace(/ /g, '')}`} onClick={() => setIsMobileMenuOpen(false)} className="block text-xl font-black uppercase tracking-tighter text-[#1A5F7A] border-b border-slate-100 pb-4">{name}</NavLink>
                                ))}
                                <button className="w-full flex justify-between items-center text-xl font-black uppercase tracking-tighter text-[#F37021]" onClick={() => setActiveMobileDropdown(!activeMobileDropdown)}>
                                    Courses <FiZap className={activeMobileDropdown ? 'rotate-180' : ''} />
                                </button>
                                {activeMobileDropdown && (
                                    <div className="grid grid-cols-1 gap-2 pl-4 border-l-2 border-orange-100">
                                        {techCoursesData.slice(0,6).map(c => (
                                            <button key={c.id} onClick={() => handleCourseClick(c)} className="text-left py-2 text-[12px] font-bold text-slate-500 uppercase">{c.title}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="mt-auto space-y-4">
                                <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center w-full py-4 rounded-[1.5rem] bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border border-slate-100">Admin Access</Link>
                                <Link to="/student-login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center w-full py-5 rounded-[1.5rem] bg-orange-50 text-[#F37021] font-black uppercase text-xs tracking-widest border border-orange-100">Student Portal</Link>
                                <button onClick={() => scrollToSection('signature-courses')} className="flex items-center justify-center w-full py-5 rounded-[1.5rem] bg-[#1A5F7A] text-white font-black uppercase text-xs tracking-widest shadow-2xl">Start Journey</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}