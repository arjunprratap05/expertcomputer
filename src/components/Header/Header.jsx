import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiPhoneCall, FiChevronDown, FiBook, FiShield, FiX, FiMenu } from 'react-icons/fi';
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

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const target = location.state?.targetId;
        if (location.pathname === '/' && target) {
            const timer = setTimeout(() => {
                scrollToSection(target);
                window.history.replaceState({}, document.title);
            }, 500); 
            return () => clearTimeout(timer);
        }
    }, [location.pathname, location.state]);

    const handleCourseClick = (course) => {
        const targetId = course.sectionId || 'signature-courses';
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
        if (location.pathname === '/') {
            scrollToSection(targetId);
        } else {
            navigate('/', { state: { targetId } });
        }
    };

    const navLinks = [
        { name: 'About', path: '/about' },
        { name: 'Founder', path: '/founder' },
        { name: 'Hall of Fame', path: '/achievements' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <header className={`sticky top-0 z-[60] w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'}`}>
            <div className="h-1 w-full bg-gradient-to-r from-[#1A5F7A] via-[#F37021] to-[#1A5F7A]"></div>
            <nav className="max-w-screen-2xl mx-auto px-4 lg:px-10 py-2">
                <div className="flex justify-between items-center h-14 lg:h-20">
                    <Link to="/" onClick={() => { setIsMobileMenuOpen(false); if(location.pathname === '/') window.scrollTo({top:0, behavior:'smooth'}) }} className="flex items-center">
                        <img src={expertcomputerlogo} className={`transition-all duration-300 h-10 lg:h-16 ${isScrolled ? 'scale-95' : 'scale-100'}`} alt="Expert Academy Logo" />
                    </Link>

                    <div className="hidden lg:flex items-center gap-6">
                        <ul className="flex items-center space-x-6">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <NavLink to={link.path} className={({ isActive }) => `text-[13px] font-bold uppercase tracking-tight ${isActive ? "text-[#F37021]" : "text-[#1A5F7A] hover:text-[#F37021]"}`}>{link.name}</NavLink>
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
                        <div className="flex items-center gap-4 border-l pl-6">
                            <Link to="/admin/login" className="flex items-center gap-2 text-[#1A5F7A] hover:text-[#F37021] font-bold text-sm"><FiShield /> Admin</Link>
                            <Link to="/contact" className="bg-[#F37021] text-white px-5 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg hover:bg-[#1A5F7A] transition-all">Join Now</Link>
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
                        <button onClick={() => setIsMobileMenuOpen(false)}><FiX className="text-2xl text-slate-400" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <ul className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <NavLink key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `py-4 border-b border-slate-50 font-bold uppercase text-sm ${isActive ? 'text-[#F37021]' : 'text-[#1A5F7A]'}`}>{link.name}</NavLink>
                            ))}
                            <li className="py-4 border-b border-slate-50">
                                <button className={`w-full flex justify-between items-center font-bold uppercase text-sm ${activeMobileDropdown ? 'text-[#F37021]' : 'text-[#1A5F7A]'}`} onClick={() => setActiveMobileDropdown(!activeMobileDropdown)}>
                                    Courses <FiChevronDown className={`transition-transform duration-300 ${activeMobileDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${activeMobileDropdown ? 'max-h-[800px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="grid grid-cols-1 gap-1 pl-4 border-l-2 border-orange-100">
                                        {techCoursesData.map(c => (
                                            <button key={c.id} onClick={() => handleCourseClick(c)} className="text-left py-3 text-xs font-bold text-slate-500 flex items-center gap-2"><FiBook className="text-[#F37021] text-xs" /> {c.title}</button>
                                        ))}
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="mt-auto pt-6 flex flex-col gap-3">
                        <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-slate-50 text-[#1A5F7A] font-bold border border-slate-100 text-xs uppercase tracking-widest"><FiShield /> Admin Portal</Link>
                        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#F37021] text-white font-bold shadow-lg uppercase text-[11px] tracking-[0.15em] italic"><FiPhoneCall /> Join Now</Link>
                    </div>
                </div>
            </div>
        </header>
    );
}