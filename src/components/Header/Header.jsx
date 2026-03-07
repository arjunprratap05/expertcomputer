import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiChevronDown, FiBook, FiShield, FiX, FiMenu, 
    FiUser, FiArrowRight, FiMessageCircle 
} from 'react-icons/fi';
import { techCoursesData } from '../../data/courses';
import expertcomputerlogo from '../../assets/expertcomputerlogo.png';

export default function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobileDropdown, setActiveMobileDropdown] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    // 1. SMART SCROLL LOGIC: Auto-collapse drawer on scroll
    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        setIsScrolled(currentScrollY > 10);

        // Close menu if user scrolls away
        if (isMobileMenuOpen && currentScrollY > 60) {
            setIsMobileMenuOpen(false);
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // 2. BODY LOCK: Prevent background scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    }, [isMobileMenuOpen]);

    // 3. COLLAPSE HANDLER: Shared logic to close all menus
    const closeAllMenus = () => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
        setActiveMobileDropdown(false);
    };

    const handleCourseClick = (course) => {
        const targetId = course.sectionId || 'signature-courses';
        
        // IMMEDIATE COLLAPSE ON SELECTION
        closeAllMenus();
        
        if (location.pathname === '/') {
            const element = document.getElementById(targetId);
            if (element) {
                const headerOffset = 100;
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
            }
        } else {
            navigate('/', { state: { targetId } });
        }
    };

    return (
        <header 
            className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out ${
                isScrolled 
                ? 'bg-white/95 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border-b border-slate-200 py-0' 
                : 'bg-white border-b border-slate-50 py-1 md:py-2'
            }`}
        >
            <div className="h-[4px] w-full bg-gradient-to-r from-[#1A5F7A] via-[#F37021] to-[#1A5F7A]"></div>
            
            <nav className="max-w-screen-2xl mx-auto px-4 lg:px-10">
                <div className="flex justify-between items-center h-16 lg:h-24">
                    
                    <Link to="/" onClick={closeAllMenus} className="flex items-center group shrink-0">
                        <img src={expertcomputerlogo} className="h-10 lg:h-20 transition-transform group-hover:scale-105" alt="Logo" />
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden lg:flex items-center gap-8">
                        <ul className="flex items-center space-x-8">
                            {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                <li key={name}>
                                    <NavLink 
                                        to={`/${name.toLowerCase().replace(/ /g, '')}`} 
                                        className={({ isActive }) => `text-[13px] font-extrabold uppercase tracking-widest transition-all ${isActive ? "text-[#F37021]" : "text-[#1A5F7A] hover:text-[#F37021]"}`}
                                    >
                                        {name}
                                    </NavLink>
                                </li>
                            ))}
                            
                            <li className="relative group" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                                <button className={`flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-widest py-8 ${isDropdownOpen ? 'text-[#F37021]' : 'text-[#1A5F7A]'}`}>
                                    Courses <FiChevronDown className={`transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                <div className={`absolute left-0 top-[85%] w-72 bg-white shadow-2xl rounded-2xl py-4 border-t-4 border-[#F37021] transition-all duration-500 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
                                    <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                                        {techCoursesData.map(c => (
                                            <button key={c.id} onClick={() => handleCourseClick(c)} className="w-full text-left px-6 py-3 hover:bg-orange-50 group/item flex items-center gap-3 transition-all">
                                                <FiBook className="text-[#1A5F7A] group-hover/item:text-[#F37021]" />
                                                <span className="text-[11px] font-bold text-[#1A5F7A] uppercase group-hover/item:text-[#F37021]">{c.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </li>
                        </ul>

                        <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
                            <Link to="/admin/login" className="flex items-center gap-2 text-[#1A5F7A] bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-tighter hover:bg-[#1A5F7A] hover:text-white transition-all shadow-sm">
                                <FiShield className="text-[#F37021]" /> Admin
                            </Link>
                            <Link to="/student-login" className="flex items-center gap-2 text-[#F37021] bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-tighter hover:bg-[#F37021] hover:text-white transition-all shadow-sm">
                                <FiUser /> ERP
                            </Link>
                            <Link to="/contact" className="bg-[#1A5F7A] text-white px-6 py-3 rounded-xl font-black uppercase text-[11px] tracking-[0.15em] shadow-lg hover:bg-[#F37021] transition-all flex items-center gap-2">
                                Join Now <FiArrowRight />
                            </Link>
                        </div>
                    </div>

                    <button className="lg:hidden text-3xl text-[#1A5F7A] p-2 hover:bg-slate-50 rounded-xl active:scale-90" onClick={() => setIsMobileMenuOpen(true)}>
                        <FiMenu />
                    </button>
                </div>
            </nav>

            {/* MOBILE DRAWER */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-[200]">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#1A5F7A]/60 backdrop-blur-sm" onClick={closeAllMenus} />
                        
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="absolute right-0 top-0 h-full w-[85%] max-w-[340px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col">
                            <div className="flex justify-between items-center p-6 border-b border-slate-50">
                                <img src={expertcomputerlogo} className="h-10" alt="Logo" />
                                <button className="p-2 bg-slate-100 rounded-full text-[#F37021]" onClick={closeAllMenus}><FiX size={24} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
                                {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                    <NavLink key={name} to={`/${name.toLowerCase().replace(/ /g, '')}`} onClick={closeAllMenus} className={({ isActive }) => `block py-4 px-4 rounded-xl font-extrabold uppercase text-sm tracking-widest ${isActive ? 'bg-orange-50 text-[#F37021]' : 'text-[#1A5F7A] hover:bg-slate-50'}`}>
                                        {name}
                                    </NavLink>
                                ))}
                                
                                <div className="pt-2">
                                    <button className={`w-full flex justify-between items-center py-4 px-4 rounded-xl font-extrabold uppercase text-sm tracking-widest ${activeMobileDropdown ? 'bg-slate-50 text-[#F37021]' : 'text-[#1A5F7A]'}`} onClick={() => setActiveMobileDropdown(!activeMobileDropdown)}>
                                        Courses <FiChevronDown className={`transition-transform duration-300 ${activeMobileDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {activeMobileDropdown && (
                                        <div className="mt-2 space-y-1 pl-4 border-l-2 border-orange-100">
                                            {techCoursesData.map(c => (
                                                <button key={c.id} onClick={() => handleCourseClick(c)} className="w-full text-left py-3 px-4 text-[11px] font-bold text-slate-500 uppercase flex items-center gap-3">
                                                    <FiBook className="text-[#F37021]" /> {c.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 space-y-4 pb-12">
                                    <Link to="/student-login" onClick={closeAllMenus} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-orange-50 text-[#F37021] font-black text-xs uppercase tracking-widest border border-orange-100">
                                        <FiUser size={18} /> Student Portal
                                    </Link>
                                    <Link to="/admin/login" onClick={closeAllMenus} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-slate-50 text-[#1A5F7A] font-black text-xs uppercase tracking-widest border border-slate-200">
                                        <FiShield size={18} /> Admin Access
                                    </Link>
                                    <button onClick={() => { window.open('https://wa.me/917282983335', '_blank'); closeAllMenus(); }} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-green-50 text-green-600 font-black text-xs uppercase tracking-widest border border-green-100 shadow-sm">
                                        <FiMessageCircle size={18} /> Live Support
                                    </button>
                                    <Link to="/contact" onClick={closeAllMenus} className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-[#1A5F7A] text-white font-black text-xs tracking-[0.2em] shadow-xl active:scale-95">
                                        Join Now
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    );
}