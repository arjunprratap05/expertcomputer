import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiChevronDown, FiBook, FiX, FiMenu, 
    FiUser, FiArrowRight, FiLock, FiLayers, FiCompass
} from 'react-icons/fi';
import { techCoursesData } from '../../data/courses';
import expertcomputerlogo from '../../assets/expertcomputerlogo.jpeg';

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

    return (
        <header 
            className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
                isScrolled 
                ? 'py-3 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50' 
                : 'py-4 lg:py-5 bg-transparent border-b border-transparent'
            }`}
        >
            {/* MOBILE ONLY TOP GRADIENT SCRIM: Ensures white mobile icons stand out against any background image */}
            {!isScrolled && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent pointer-events-none lg:hidden" />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex justify-between items-center h-14 lg:h-16">
                    
                    {/* LOGO AREA */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center shrink-0 transition-transform hover:scale-[1.02]">
                            <img 
                                src={expertcomputerlogo} 
                                className={`transition-all duration-300 w-auto rounded-lg ${
                                    isScrolled ? 'h-9 lg:h-10' : 'h-10 lg:h-12'
                                }`}
                                alt="Expert Computer Logo" 
                            />
                        </Link>

                        {/* DESKTOP NAVIGATION (Stays Dark Slate at top; Active is Orange) */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                <NavLink 
                                    key={name}
                                    to={`/${name.toLowerCase().replace(/ /g, '')}`} 
                                    className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 ${
                                        isActive 
                                        ? "text-[#F37021] bg-orange-50/70 font-semibold" 
                                        : "text-slate-600 hover:text-[#1A5F7A] hover:bg-slate-50"
                                    }`}
                                >
                                    {name}
                                </NavLink>
                            ))}
                            
                            {/* DESKTOP COURSES DROPDOWN */}
                            <div className="relative group/menu">
                                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium tracking-wide text-slate-600 hover:text-[#1A5F7A] hover:bg-slate-50 transition-all">
                                    <span>Courses</span>
                                    <FiChevronDown size={15} className="group-hover/menu:rotate-180 transition-transform duration-300" />
                                </button>
                                
                                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[480px] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible translate-y-2 group-hover/menu:translate-y-0 transition-all duration-300 pointer-events-none group-hover/menu:pointer-events-auto">
                                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-4 grid grid-cols-1 gap-1 max-h-[420px] overflow-y-auto custom-scrollbar">
                                        <div className="px-3 py-2 mb-1 border-b border-slate-50 flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase">
                                            <FiLayers /> Available Specializations
                                        </div>
                                        {techCoursesData.map(c => (
                                            <button 
                                                key={c.id} 
                                                onClick={() => handleCourseClick(c)} 
                                                className="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-start gap-3.5 transition-all group/item"
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 text-[#F37021] group-hover/item:bg-[#1A5F7A] group-hover/item:text-white transition-colors duration-200">
                                                    <FiBook size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-800 group-hover/item:text-[#1A5F7A] transition-colors">{c.title}</span>
                                                    <span className="text-xs text-slate-400 line-clamp-1 font-normal mt-0.5">Explore curriculum & tracks</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>

                    {/* ACTION BUTTONS (DESKTOP) */}
                    <div className="hidden lg:flex items-center gap-4">
                        <Link to="/admin/login" className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm text-slate-500 hover:text-[#1A5F7A] hover:bg-slate-50 transition-all group">
                            <FiLock className="text-slate-400 group-hover:text-[#F37021] transition-colors" /> 
                            <span>Admin</span>
                        </Link>

                        <Link to="/student-login" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:border-[#1A5F7A] hover:text-[#1A5F7A] transition-all bg-white shadow-sm">
                            <FiUser className="text-slate-400" /> 
                            <span>ERP Portal</span>
                        </Link>
                        
                        <button 
                            onClick={() => scrollToSection('signature-courses')} 
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A5F7A] text-white font-semibold text-sm shadow-sm hover:bg-[#154d63] transition-all hover:shadow-md group"
                        >
                            <span>Explore Tracks</span>
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* MOBILE HAMBURGER BUTTON (Responsive styling logic) */}
                    <div className="flex lg:hidden">
                        <button 
                            className={`p-2 rounded-xl transition-all ${
                                isScrolled 
                                ? 'text-slate-700 hover:bg-slate-100' 
                                : 'text-white bg-black/20 backdrop-blur-sm hover:bg-black/40'
                            }`} 
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open Menu"
                        >
                            <FiMenu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* FULLY FUNCTIONAL MOBILE DRAWER */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[200] lg:hidden bg-slate-900/50 backdrop-blur-sm"
                        />
                        
                        {/* Drawer Panel */}
                        <motion.div 
                            initial={{ x: '100%' }} 
                            animate={{ x: 0 }} 
                            exit={{ x: '100%' }} 
                            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }} 
                            className="fixed right-0 top-0 bottom-0 h-screen w-full sm:w-[380px] z-[201] lg:hidden bg-white shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                                <img src={expertcomputerlogo} className="h-9 w-auto rounded" alt="Logo" />
                                <button 
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <FiX size={22} />
                                </button>
                            </div>

                            {/* Nav Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                                <div className="space-y-1">
                                    <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2">Navigation</div>
                                    {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                        <NavLink 
                                            key={name} 
                                            to={`/${name.toLowerCase().replace(/ /g, '')}`} 
                                            onClick={() => setIsMobileMenuOpen(false)} 
                                            className={({ isActive }) => `flex items-center w-full px-3 py-3 rounded-xl text-base font-medium transition-all ${
                                                isActive ? 'bg-orange-50 text-[#F37021] font-semibold' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {name}
                                        </NavLink>
                                    ))}
                                </div>

                                {/* Accordion Segment for Mobile Courses */}
                                <div className="space-y-1">
                                    <button 
                                        className="w-full flex justify-between items-center px-3 py-3 rounded-xl text-base font-medium text-slate-600 hover:bg-slate-50 transition-all" 
                                        onClick={() => setActiveMobileDropdown(!activeMobileDropdown)}
                                    >
                                        <span>Our Programs</span>
                                        <FiChevronDown className={`transform transition-transform duration-200 ${activeMobileDropdown ? 'rotate-180 text-[#F37021]' : 'text-slate-400'}`} size={18} />
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                        {activeMobileDropdown && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden bg-slate-50 rounded-xl mt-1 mx-1"
                                            >
                                                <div className="p-2 grid grid-cols-1 gap-1">
                                                    {techCoursesData.map(c => (
                                                        <button 
                                                            key={c.id} 
                                                            onClick={() => handleCourseClick(c)} 
                                                            className="w-full text-left py-2.5 px-4 text-sm font-medium text-slate-600 hover:text-[#1A5F7A] transition-colors rounded-lg"
                                                        >
                                                            {c.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Action Buttons Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Link 
                                        to="/admin/login" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium text-xs shadow-sm"
                                    >
                                        <FiLock size={13} /> Admin
                                    </Link>
                                    <Link 
                                        to="/student-login" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-[#F37021] font-semibold text-xs shadow-sm"
                                    >
                                        <FiUser size={14} /> ERP Portal
                                    </Link>
                                </div>
                                <button 
                                    onClick={() => scrollToSection('signature-courses')} 
                                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#1A5F7A] text-white font-semibold text-sm shadow-md hover:bg-[#154d63] transition-all"
                                >
                                    <span>Get Started</span>
                                    <FiCompass size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}