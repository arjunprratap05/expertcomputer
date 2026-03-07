import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiChevronDown, FiBook, FiShield, FiX, FiMenu, FiUser, FiArrowRight } from 'react-icons/fi';
import { techCoursesData } from '../../data/courses';
import expertcomputerlogo from '../../assets/expertcomputerlogo.png';

export default function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobileDropdown, setActiveMobileDropdown] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCourseClick = (course) => {
        const targetId = course.sectionId || 'signature-courses';
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
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
        // FIXED: Added a distinct border-b and shadow transition to anchor the header as a separate component
        <header className={`sticky top-0 z-[60] w-full transition-all duration-500 ${
            isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border-b border-slate-200 py-0' 
            : 'bg-white border-b border-slate-100 py-1'
        }`}>
            {/* VIBRANT TOP ACCENT - Acts as the visual "roof" of the site */}
            <div className="h-[4px] w-full bg-gradient-to-r from-[#1A5F7A] via-[#F37021] to-[#1A5F7A]"></div>
            
            <nav className="max-w-screen-2xl mx-auto px-4 lg:px-10">
                <div className="flex justify-between items-center h-16 lg:h-24">
                    
                    {/* LOGO AREA */}
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center group">
                        <img 
                            src={expertcomputerlogo} 
                            className="h-12 lg:h-20 transition-transform group-hover:scale-105 duration-300" 
                            alt="Expert Computer Academy" 
                        />
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden lg:flex items-center gap-8">
                        <ul className="flex items-center space-x-8">
                            {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                <li key={name}>
                                    <NavLink 
                                        to={`/${name.toLowerCase().replace(/ /g, '')}`} 
                                        className={({ isActive }) => `text-[13px] font-extrabold uppercase tracking-widest transition-all duration-300 relative py-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#F37021] after:transition-all after:duration-300 ${isActive ? "text-[#F37021] after:w-full" : "text-[#1A5F7A] hover:text-[#F37021] after:w-0 hover:after:w-full"}`}
                                    >
                                        {name}
                                    </NavLink>
                                </li>
                            ))}
                            
                            {/* COURSES DROPDOWN */}
                            <li className="relative group" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                                <button className={`flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-widest py-8 transition-colors ${isDropdownOpen ? 'text-[#F37021]' : 'text-[#1A5F7A]'}`}>
                                    Courses <FiChevronDown className={`transition-transform duration-500 ${isDropdownOpen ? 'rotate-180 text-[#F37021]' : ''}`} />
                                </button>
                                
                                <div className={`absolute left-0 top-[90%] w-72 bg-white shadow-2xl rounded-2xl py-4 border-t-4 border-[#F37021] overflow-hidden transition-all duration-500 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
                                    <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                                        {techCoursesData.map(c => (
                                            <button 
                                                key={c.id} 
                                                onClick={() => handleCourseClick(c)} 
                                                className="w-full text-left px-6 py-3 hover:bg-orange-50 group/item flex items-center gap-3 transition-all"
                                            >
                                                <div className="p-2 rounded-lg bg-slate-50 group-hover/item:bg-white transition-colors">
                                                    <FiBook className="text-[#1A5F7A] group-hover/item:text-[#F37021]" />
                                                </div>
                                                <span className="text-[11px] font-bold text-[#1A5F7A] uppercase tracking-tighter group-hover/item:text-[#F37021]">{c.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </li>
                        </ul>

                        {/* ACTION ZONE: Visual separation with border-l */}
                        <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
                            <Link to="/admin/login" className="flex items-center gap-2 text-[#1A5F7A] bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-tighter hover:bg-[#1A5F7A] hover:text-white transition-all shadow-sm">
                                <FiShield className="text-[#F37021]" /> Admin
                            </Link>
                            
                            <Link to="/student-login" className="flex items-center gap-2 text-[#F37021] bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-tighter hover:bg-[#F37021] hover:text-white transition-all shadow-sm">
                                <FiUser /> Student ERP
                            </Link>
                            
                            <Link to="/contact" className="bg-[#1A5F7A] text-white px-6 py-3 rounded-xl font-black uppercase text-[11px] tracking-[0.15em] shadow-[0_10px_20px_-5px_rgba(26,95,122,0.3)] hover:shadow-[0_10px_20px_-5px_rgba(243,112,33,0.4)] hover:bg-[#F37021] transition-all duration-500 flex items-center gap-2">
                                Join Now <FiArrowRight />
                            </Link>
                        </div>
                    </div>

                    {/* MOBILE MENU TOGGLE */}
                    <button className="lg:hidden text-3xl text-[#1A5F7A] p-2 hover:bg-slate-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
                        <FiMenu />
                    </button>
                </div>
            </nav>

            {/* MOBILE DRAWER */}
            <div className={`lg:hidden fixed inset-0 z-[100] transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="absolute inset-0 bg-[#1A5F7A]/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <div className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    
                    <div className="flex justify-between items-center p-6 border-b border-slate-50 bg-slate-50/50">
                        <img src={expertcomputerlogo} className="h-12" alt="Logo" />
                        <button className="p-2 bg-white rounded-full shadow-md text-[#F37021]" onClick={() => setIsMobileMenuOpen(false)}>
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
                        {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                            <NavLink 
                                key={name} 
                                to={`/${name.toLowerCase().replace(/ /g, '')}`} 
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className={({ isActive }) => `block py-4 px-4 rounded-xl font-extrabold uppercase text-sm tracking-widest ${isActive ? 'bg-orange-50 text-[#F37021]' : 'text-[#1A5F7A] hover:bg-slate-50'}`}
                            >
                                {name}
                            </NavLink>
                        ))}
                        
                        <div className="pt-2">
                            <button 
                                className={`w-full flex justify-between items-center py-4 px-4 rounded-xl font-extrabold uppercase text-sm tracking-widest ${activeMobileDropdown ? 'bg-slate-50 text-[#F37021]' : 'text-[#1A5F7A]'}`} 
                                onClick={() => setActiveMobileDropdown(!activeMobileDropdown)}
                            >
                                Courses <FiChevronDown className={`transition-transform duration-300 ${activeMobileDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {activeMobileDropdown && (
                                <div className="mt-2 space-y-1 pl-4">
                                    {techCoursesData.map(c => (
                                        <button 
                                            key={c.id} 
                                            onClick={() => handleCourseClick(c)} 
                                            className="w-full text-left py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-3 border-l-2 border-slate-100 hover:border-[#F37021] hover:text-[#1A5F7A]"
                                        >
                                            <FiBook className="text-[#F37021]" size={14} /> {c.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 space-y-4 pb-10">
                            <Link to="/student-login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-orange-50 text-[#F37021] font-black text-xs uppercase tracking-widest border border-orange-100 shadow-sm active:scale-95 transition-all">
                                <FiUser size={18} /> Student Portal
                            </Link>
                            <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-slate-50 text-[#1A5F7A] font-black text-xs uppercase tracking-widest border border-slate-200 shadow-sm active:scale-95 transition-all">
                                <FiShield size={18} /> Admin Access
                            </Link>
                            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-[#1A5F7A] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
                                Join Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}