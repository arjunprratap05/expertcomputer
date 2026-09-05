import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiChevronDown, FiBook, FiX, FiMenu, 
    FiUser, FiLock, FiLayers
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

    // UNIVERSAL LOGO ROUTING & SCROLL LOGIC
    const handleLogoClick = (e) => {
        setIsMobileMenuOpen(false);
        if (location.pathname === '/') {
            e.preventDefault(); // Stop routing, just scroll up smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Let the <Link> handle routing, but force window to top instantly
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    };

    return (
        <header 
            className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
                isScrolled 
                ? 'py-3 bg-[#070D1D]/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-slate-800/80' 
                : 'py-4 lg:py-6 bg-transparent border-b border-transparent'
            }`}
        >
            {!isScrolled && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#070D1D]/80 to-transparent pointer-events-none" />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex justify-between items-center h-14 lg:h-16">
                    
                    <div className="flex items-center gap-8">
                        {/* ATTACHED TO DESKTOP LOGO */}
                        <Link to="/" onClick={handleLogoClick} className="flex items-center shrink-0 transition-transform hover:scale-[1.02] group">
                            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 p-1.5 md:p-2 rounded-xl shadow-lg group-hover:border-[#F37021]/50 group-hover:shadow-[0_0_15px_rgba(243,112,33,0.2)] transition-all duration-300">
                                <img 
                                    src={expertcomputerlogo} 
                                    className={`transition-all duration-300 w-auto rounded-lg object-contain ${
                                        isScrolled ? 'h-8 lg:h-10' : 'h-10 lg:h-12'
                                    }`}
                                    alt="Expert Computer Logo" 
                                />
                            </div>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-2">
                            {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                <NavLink 
                                    key={name}
                                    to={`/${name.toLowerCase().replace(/ /g, '')}`} 
                                    className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 border border-transparent ${
                                        isActive 
                                        ? "text-[#F37021] bg-orange-500/10 border-orange-500/20 shadow-inner" 
                                        : "text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-slate-700/50"
                                    }`}
                                >
                                    {name}
                                </NavLink>
                            ))}
                            
                            <div className="relative group/menu">
                                <button aria-haspopup="true" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold tracking-wide text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all">
                                    <span>Courses</span>
                                    <FiChevronDown size={15} className="text-slate-500 group-hover/menu:text-[#F37021] group-hover/menu:rotate-180 transition-all duration-300" />
                                </button>
                                
                                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[500px] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible translate-y-3 group-hover/menu:translate-y-0 transition-all duration-300 pointer-events-none group-hover/menu:pointer-events-auto">
                                    <div className="bg-[#0A192F]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-slate-700 overflow-hidden p-4 grid grid-cols-1 gap-1 max-h-[450px] overflow-y-auto custom-scrollbar">
                                        <div className="px-3 py-2 mb-2 border-b border-slate-800 flex items-center gap-2 text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">
                                            <FiLayers className="text-[#F37021]" /> Available Specializations
                                        </div>
                                        {techCoursesData.map(c => (
                                            <button 
                                                key={c.id} 
                                                onClick={() => handleCourseClick(c)} 
                                                className="w-full text-left p-3 rounded-xl border border-transparent hover:border-slate-700 hover:bg-slate-800/60 flex items-start gap-4 transition-all group/item"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 text-slate-400 group-hover/item:text-[#F37021] group-hover/item:border-orange-500/30 group-hover/item:bg-orange-500/5 transition-all duration-300 shadow-inner">
                                                    <FiBook size={16} />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <span className="text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors">{c.title}</span>
                                                    <span className="text-[11px] text-slate-500 line-clamp-1 font-medium mt-0.5 tracking-wide">Explore curriculum & tracks</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <Link to="/admin/login" className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/80 transition-all group">
                            <FiLock className="text-slate-500 group-hover:text-[#F37021] transition-colors" /> 
                            <span>Admin</span>
                        </Link>

                        <Link to="/student-login" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-sm hover:border-[#F37021] hover:text-white transition-all bg-slate-900/60 backdrop-blur-md shadow-lg group">
                            <FiUser className="text-slate-400 group-hover:text-[#F37021] transition-colors" /> 
                            <span>ERP Portal</span>
                        </Link>
                    </div>

                    <div className="flex lg:hidden">
                        <button 
                            className="p-2.5 rounded-xl transition-all text-slate-300 bg-slate-900/60 border border-slate-700/80 backdrop-blur-md hover:bg-slate-800 hover:text-white shadow-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open Menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <FiMenu size={22} />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[200] lg:hidden bg-[#070D1D]/80 backdrop-blur-sm"
                        />
                        
                        <motion.div 
                            initial={{ x: '100%' }} 
                            animate={{ x: 0 }} 
                            exit={{ x: '100%' }} 
                            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }} 
                            className="fixed right-0 top-0 bottom-0 h-screen w-full sm:w-[380px] z-[201] lg:hidden bg-[#0A192F] shadow-2xl flex flex-col border-l border-slate-800"
                        >
                            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800 shrink-0 bg-[#070D1D]">
                                {/* ATTACHED TO MOBILE DRAWER LOGO */}
                                <Link to="/" onClick={handleLogoClick}>
                                    <div className="bg-slate-900/80 border border-slate-700 p-1.5 rounded-lg shadow-inner">
                                        <img src={expertcomputerlogo} className="h-8 w-auto rounded object-contain" alt="Logo" />
                                    </div>
                                </Link>
                                <button 
                                    className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-label="Close Menu"
                                >
                                    <FiX size={22} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="px-6 py-6 space-y-6">
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase px-3 mb-4">Navigation</div>
                                        {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                            <NavLink 
                                                key={name} 
                                                to={`/${name.toLowerCase().replace(/ /g, '')}`} 
                                                onClick={() => setIsMobileMenuOpen(false)} 
                                                className={({ isActive }) => `flex items-center w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all border ${
                                                    isActive 
                                                    ? 'bg-orange-500/10 text-[#F37021] border-orange-500/20 shadow-inner' 
                                                    : 'text-slate-300 border-transparent hover:bg-slate-800/60 hover:text-white hover:border-slate-700'
                                                }`}
                                            >
                                                {name}
                                            </NavLink>
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        <button 
                                            className="w-full flex justify-between items-center px-4 py-3.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-all" 
                                            onClick={() => setActiveMobileDropdown(!activeMobileDropdown)}
                                            aria-expanded={activeMobileDropdown}
                                        >
                                            <span>Our Programs</span>
                                            <FiChevronDown className={`transform transition-transform duration-300 ${activeMobileDropdown ? 'rotate-180 text-[#F37021]' : 'text-slate-500'}`} size={18} />
                                        </button>
                                        
                                        <AnimatePresence initial={false}>
                                            {activeMobileDropdown && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden bg-[#070D1D]/50 border border-slate-800 rounded-xl mt-2 mx-1 shadow-inner"
                                                >
                                                    <div className="p-2 grid grid-cols-1 gap-1">
                                                        {techCoursesData.map(c => (
                                                            <button 
                                                                key={c.id} 
                                                                onClick={() => handleCourseClick(c)} 
                                                                className="w-full text-left py-3 px-4 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors rounded-lg flex items-center gap-3"
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block" />
                                                                {c.title}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 pb-8 pt-4 border-t border-slate-800">
                                <div className="grid grid-cols-2 gap-4">
                                    <Link 
                                        to="/admin/login" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs shadow-inner hover:bg-slate-800 hover:text-white transition-all"
                                    >
                                        <FiLock size={14} className="text-slate-500" /> Admin
                                    </Link>
                                    <Link 
                                        to="/student-login" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-bold text-xs shadow-inner hover:border-[#F37021] hover:text-white transition-all"
                                    >
                                        <FiUser size={14} className="text-[#F37021]" /> ERP Portal
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}