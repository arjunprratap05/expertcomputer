import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiChevronDown, FiBook, FiShield, FiX, FiMenu, FiUser, FiLogIn } from 'react-icons/fi';
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
        <header className={`sticky top-0 z-[60] w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'}`}>
            <div className="h-1 w-full bg-gradient-to-r from-[#1A5F7A] via-[#F37021] to-[#1A5F7A]"></div>
            <nav className="max-w-screen-2xl mx-auto px-4 lg:px-10 py-2">
                <div className="flex justify-between items-center h-14 lg:h-20">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                        <img src={expertcomputerlogo} className="h-10 lg:h-16" alt="Logo" />
                    </Link>

                    {/* DESKTOP NAV */}
                    <div className="hidden lg:flex items-center gap-6">
                        <ul className="flex items-center space-x-6">
                            {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                <li key={name}>
                                    <NavLink to={`/${name.toLowerCase().replace(/ /g, '')}`} className={({ isActive }) => `text-[13px] font-bold uppercase tracking-tight ${isActive ? "text-[#F37021]" : "text-[#1A5F7A] hover:text-[#F37021]"}`}>{name}</NavLink>
                                </li>
                            ))}
                            <li className="relative group" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                                <button className={`flex items-center gap-1 text-[13px] font-bold uppercase py-4 ${isDropdownOpen ? 'text-[#F37021]' : 'text-[#1A5F7A]'}`}>
                                    Courses <FiChevronDown className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`absolute left-0 top-full w-64 bg-white shadow-2xl rounded-xl py-2 border border-slate-50 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                    {techCoursesData.map(c => (
                                        <button key={c.id} onClick={() => handleCourseClick(c)} className="w-full text-left px-4 py-2.5 hover:bg-orange-50 text-xs font-bold text-[#1A5F7A] flex items-center gap-2 transition-colors">
                                            <FiBook className="text-[#F37021]" /> {c.title}
                                        </button>
                                    ))}
                                </div>
                            </li>
                        </ul>

                        {/* PORTAL ACCESS BUTTONS */}
                        <div className="flex items-center gap-3 border-l pl-6">
                            <Link to="/admin/login" className="flex items-center gap-2 text-slate-500 border-2 border-slate-100 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-tight hover:bg-slate-50 hover:text-[#1A5F7A] transition-all">
                                <FiShield /> Admin
                            </Link>
                            <Link to="/student-login" className="flex items-center gap-2 text-[#1A5F7A] border-2 border-[#1A5F7A]/10 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-tight hover:bg-slate-50 transition-all">
                                <FiUser /> Student ERP
                            </Link>
                            <Link to="/contact" className="bg-[#F37021] text-white px-5 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg hover:bg-[#1A5F7A] transition-all">
                                Join Now
                            </Link>
                        </div>
                    </div>

                    <button className="lg:hidden text-2xl text-[#1A5F7A] p-2" onClick={() => setIsMobileMenuOpen(true)}><FiMenu /></button>
                </div>
            </nav>

            {/* MOBILE DRAWER */}
            <div className={`lg:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={`absolute right-0 top-0 h-screen w-[85%] max-w-sm bg-white p-6 shadow-2xl flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-8 border-b pb-4">
                        <img src={expertcomputerlogo} className="h-10" alt="Logo" />
                        <button onClick={() => setIsMobileMenuOpen(false)}><FiX size={24} className="text-slate-400" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <ul className="flex flex-col gap-1">
                            {['About', 'Founder', 'Hall of Fame', 'Contact'].map((name) => (
                                <NavLink key={name} to={`/${name.toLowerCase().replace(/ /g, '')}`} onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `py-4 border-b border-slate-50 font-bold uppercase text-sm ${isActive ? 'text-[#F37021]' : 'text-[#1A5F7A]'}`}>{name}</NavLink>
                            ))}
                            
                            <li className="py-4 border-b border-slate-50">
                                <button className={`w-full flex justify-between items-center font-bold uppercase text-sm ${activeMobileDropdown ? 'text-[#F37021]' : 'text-[#1A5F7A]'}`} onClick={() => setActiveMobileDropdown(!activeMobileDropdown)}>
                                    Courses <FiChevronDown className={`transition-transform duration-300 ${activeMobileDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {activeMobileDropdown && (
                                    <div className="mt-4 flex flex-col gap-1 pl-4 border-l-2 border-orange-100">
                                        {techCoursesData.map(c => (
                                            <button key={c.id} onClick={() => handleCourseClick(c)} className="text-left py-3 text-xs font-bold text-slate-500 flex items-center gap-2"><FiBook className="text-[#F37021] text-xs" /> {c.title}</button>
                                        ))}
                                    </div>
                                )}
                            </li>

                            {/* MOBILE BUTTONS - BOTH VISIBLE IN LIST */}
                            <div className="mt-6 flex flex-col gap-3 pb-10">
                                <Link to="/student-login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-slate-50 text-[#1A5F7A] font-bold border border-slate-200 text-xs uppercase tracking-widest shadow-sm">
                                    <FiUser /> Student Portal
                                </Link>
                                <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-slate-50 text-slate-600 font-bold border border-slate-200 text-xs uppercase tracking-widest shadow-sm">
                                    <FiShield /> Admin Portal
                                </Link>
                                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#F37021] text-white font-bold shadow-lg uppercase text-xs italic">
                                    Join Now
                                </Link>
                            </div>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
}