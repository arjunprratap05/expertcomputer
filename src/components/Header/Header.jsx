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
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobileDropdown, setActiveMobileDropdown] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    const handleScroll = useCallback(() => {
        setIsScrolled(window.scrollY > 10);
        if (isMobileMenuOpen && window.scrollY > 100) {
            setIsMobileMenuOpen(false);
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const closeAllMenus = () => {
        setIsMobileMenuOpen(false);
        setActiveMobileDropdown(false);
    };

    const handleCourseClick = (course) => {
        closeAllMenus();
        const targetId = course.sectionId || 'signature-courses';
        if (location.pathname === '/') {
            const element = document.getElementById(targetId);
            if (element) {
                const headerOffset = 80; // Adjusted for slimmer header
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
            }
        } else {
            navigate('/', { state: { targetId } });
        }
    };

    return (
        <header 
            className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
                isScrolled 
                ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-5px_rgba(26,95,122,0.2)] border-b border-[#1A5F7A]/10' 
                : 'bg-white border-b border-slate-100'
            }`}
        >
            {/* VIBRANT TOP ACCENT */}
            <div className="h-[4px] w-full bg-gradient-to-r from-[#1A5F7A] via-[#F37021] to-[#1A5F7A]"></div>
            
            <nav className="max-w-screen-2xl mx-auto px-4 lg:px-10">
                {/* Slimmed height: h-14 for mobile, h-20 for desktop */}
                <div className="flex justify-between items-center h-14 lg:h-20">
                    
                    {/* LOGO AREA */}
                    <Link to="/" onClick={closeAllMenus} className="flex items-center group shrink-0">
                        <img 
                            src={expertcomputerlogo} 
                            className="h-9 lg:h-16 transition-transform group-hover:scale-105 duration-300" 
                            alt="Logo" 
                        />
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden lg:flex items-center gap-6">
                        <ul className="flex items-center space-x-6">
                            {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                <li key={name}>
                                    <NavLink 
                                        to={`/${name.toLowerCase().replace(/ /g, '')}`} 
                                        className={({ isActive }) => `text-[12px] font-black uppercase tracking-wider relative py-1 transition-all ${isActive ? "text-[#F37021]" : "text-[#1A5F7A] hover:text-[#F37021]"}`}
                                    >
                                        {name}
                                    </NavLink>
                                </li>
                            ))}
                            
                            <li className="relative group">
                                <button className="flex items-center gap-1 text-[12px] font-black uppercase tracking-wider py-6 text-[#1A5F7A] hover:text-[#F37021] transition-colors">
                                    Courses <FiChevronDown size={14} />
                                </button>
                                <div className="absolute left-0 top-[90%] w-64 bg-white shadow-2xl rounded-xl py-3 border-t-4 border-[#F37021] opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    <div className="max-h-[50vh] overflow-y-auto no-scrollbar px-2">
                                        {techCoursesData.map(c => (
                                            <button key={c.id} onClick={() => handleCourseClick(c)} className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-orange-50 flex items-center gap-3 transition-all group/item">
                                                <FiBook className="text-[#1A5F7A] group-hover/item:text-[#F37021]" size={14} />
                                                <span className="text-[11px] font-bold text-[#1A5F7A] uppercase group-hover/item:text-[#F37021] tracking-tight">{c.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </li>
                        </ul>

                        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                            <Link to="/admin/login" className="flex items-center gap-2 text-[#1A5F7A] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase hover:bg-slate-100 transition-all">
                                <FiShield className="text-[#F37021]" /> Admin
                            </Link>
                            <Link to="/student-login" className="flex items-center gap-2 text-[#F37021] bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase hover:bg-orange-100 transition-all">
                                <FiUser /> ERP
                            </Link>
                            <Link to="/contact" className="bg-[#1A5F7A] text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-[#F37021] transition-all flex items-center gap-2">
                                Join Now <FiArrowRight />
                            </Link>
                        </div>
                    </div>

                    <button className="lg:hidden text-2xl text-[#1A5F7A] p-2 hover:bg-slate-50 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
                        <FiMenu />
                    </button>
                </div>
            </nav>

            {/* MOBILE DRAWER */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] lg:hidden">
                        <div className="absolute inset-0 bg-[#1A5F7A]/80 backdrop-blur-sm" onClick={closeAllMenus} />
                        <motion.div 
                            initial={{ x: '100%' }} 
                            animate={{ x: 0 }} 
                            exit={{ x: '100%' }} 
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 h-screen w-[80%] max-w-[300px] bg-white shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-5 border-b bg-white">
                                <img src={expertcomputerlogo} className="h-9" alt="Logo" />
                                <button className="p-2 bg-slate-100 rounded-full text-[#F37021]" onClick={closeAllMenus}><FiX size={20} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-1 bg-white">
                                {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                    <NavLink key={name} to={`/${name.toLowerCase().replace(/ /g, '')}`} onClick={closeAllMenus} className="block py-3.5 font-black uppercase text-xs border-b border-slate-50 text-[#1A5F7A]">{name}</NavLink>
                                ))}
                                
                                <div className="pt-2">
                                    <button className={`w-full flex justify-between items-center py-3.5 font-black uppercase text-xs ${activeMobileDropdown ? 'text-[#F37021]' : 'text-[#1A5F7A]'}`} onClick={() => setActiveMobileDropdown(!activeMobileDropdown)}>
                                        Courses <FiChevronDown className={activeMobileDropdown ? 'rotate-180' : ''} />
                                    </button>
                                    {activeMobileDropdown && (
                                        <div className="mt-1 space-y-1 pl-3 border-l-2 border-[#F37021]/30">
                                            {techCoursesData.map(c => (
                                                <button key={c.id} onClick={() => handleCourseClick(c)} className="w-full text-left py-2 text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><FiBook className="text-[#F37021]" size={12}/> {c.title}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 space-y-3 pb-8">
                                    <Link to="/student-login" onClick={closeAllMenus} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-50 text-[#F37021] font-black uppercase text-[10px] border border-orange-100">Student Portal</Link>
                                    <Link to="/admin/login" onClick={closeAllMenus} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 text-[#1A5F7A] font-black uppercase text-[10px] border border-slate-200">Admin Access</Link>
                                    <button onClick={() => { window.open('https://wa.me/917282983335', '_blank'); closeAllMenus(); }} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-50 text-green-600 font-black uppercase text-[10px] border border-green-100">Live Support</button>
                                    <Link to="/contact" onClick={closeAllMenus} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#1A5F7A] text-white font-black uppercase text-[10px] shadow-lg">Join Now</Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}