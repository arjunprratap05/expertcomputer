import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiPhoneCall, FiChevronDown, FiBook, FiAward, FiShield, FiX, FiMenu } from 'react-icons/fi';
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

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'About', path: '/about' },
        { name: 'Founder', path: '/founder' },
        { name: 'Hall of Fame', path: '/achievements' },
        { name: 'Contact', path: '/contact' },
    ];

    const handleHomeClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        setIsMobileMenuOpen(false);
    };

    const handleCourseSelection = (course) => {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        if (location.pathname !== '/') {
            navigate('/', { state: { targetId: course.sectionId, courseId: course.id } });
        } else {
            scrollToTarget(course.sectionId, course.id);
        }
    };

    const scrollToTarget = (sectionId, courseId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = 110;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    return (
        <header className={`shadow-lg sticky z-50 top-0 transition-all duration-300 ${isScrolled ? 'bg-white/95 py-1' : 'bg-white py-3'} backdrop-blur-md`}>
            <div className="h-1.5 w-full bg-gradient-to-r from-[#1A5F7A] via-[#F37021] to-[#1A5F7A]"></div>
            
            <nav className="max-w-screen-2xl mx-auto px-4 lg:px-10">
                <div className="flex justify-between items-center">
                    
                    {/* LOGO */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        <Link to="/" onClick={handleHomeClick} className="flex items-center transform transition hover:scale-[1.02]">
                            <img 
                                src={expertcomputerlogo} 
                                className={`transition-all duration-300 object-contain ${isScrolled ? 'h-10 lg:h-16' : 'h-14 lg:h-24'}`} 
                                alt="Expert Computer Academy"
                            />
                        </Link>
                    </div>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden lg:flex items-center gap-10">
                        <ul className="flex items-center space-x-8">
                            <li>
                                <NavLink to="/" onClick={handleHomeClick} className={({ isActive }) => `text-[15px] font-extrabold tracking-tight transition-colors ${isActive && location.pathname === '/' ? "text-[#F37021]" : "text-[#1A5F7A] hover:text-[#F37021]"}`}>Home</NavLink>
                            </li>
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <NavLink to={link.path} className={({ isActive }) => `text-[15px] font-extrabold tracking-tight transition-colors ${isActive ? "text-[#F37021]" : "text-[#1A5F7A] hover:text-[#F37021]"}`}>{link.name}</NavLink>
                                </li>
                            ))}
                            <li className="relative group" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                                <button className="flex items-center gap-1.5 text-[15px] font-extrabold text-[#1A5F7A] group-hover:text-[#F37021]">
                                    Courses <FiChevronDown />
                                </button>
                                <div className={`absolute left-0 w-72 bg-white rounded-2xl shadow-2xl py-3 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible translate-y-2' : 'opacity-0 invisible translate-y-0'}`}>
                                    {techCoursesData.map((course) => (
                                        <button key={course.id} onClick={() => handleCourseSelection(course)} className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm font-bold text-[#1A5F7A] hover:bg-orange-50 hover:text-[#F37021]">
                                            <FiBook className="text-[#F37021]" /> {course.title}
                                        </button>
                                    ))}
                                </div>
                            </li>
                        </ul>
                        <div className="flex items-center gap-4 border-l pl-8">
                            <Link to="/admin/login" className="flex items-center gap-2 text-[#1A5F7A] hover:text-[#F37021] font-bold text-sm"><FiShield /> Admin</Link>
                            <Link to="/contact" className="text-white bg-[#F37021] hover:bg-[#1A5F7A] font-bold rounded-xl text-sm px-6 py-3.5 shadow-md">Join Now</Link>
                        </div>
                    </div>

                    {/* MOBILE HAMBURGER TOGGLE */}
                    <button 
                        className="lg:hidden p-2 text-[#1A5F7A] text-2xl focus:outline-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </nav>

            {/* MOBILE MENU DRAWER */}
            <div className={`lg:hidden fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}>
                <div 
                    className={`absolute right-0 top-0 h-screen w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-8">
                            <img src={expertcomputerlogo} className="h-12 w-auto" alt="Logo" />
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-2xl text-slate-500"><FiX /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <ul className="space-y-4">
                                <li>
                                    <NavLink to="/" onClick={handleHomeClick} className="block text-lg font-bold text-[#1A5F7A]">Home</NavLink>
                                </li>
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <NavLink to={link.path} className="block text-lg font-bold text-[#1A5F7A]">{link.name}</NavLink>
                                    </li>
                                ))}
                                
                                {/* Mobile Courses Dropdown */}
                                <li>
                                    <button 
                                        className="w-full flex justify-between items-center text-lg font-bold text-[#1A5F7A]"
                                        onClick={() => setActiveMobileDropdown(!activeMobileDropdown)}
                                    >
                                        Courses <FiChevronDown className={`transition-transform ${activeMobileDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`mt-2 space-y-2 pl-4 border-l-2 border-orange-100 overflow-hidden transition-all ${activeMobileDropdown ? 'max-h-[500px] py-2' : 'max-h-0'}`}>
                                        {techCoursesData.map((course) => (
                                            <button key={course.id} onClick={() => handleCourseSelection(course)} className="w-full text-left py-2 text-sm font-semibold text-slate-600 flex items-center gap-2">
                                                <FiBook className="text-[#F37021] text-xs" /> {course.title}
                                            </button>
                                        ))}
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-auto space-y-4 pt-6 border-t border-slate-100">
                            <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 text-[#1A5F7A] font-bold">
                                <FiShield /> Admin Portal
                            </Link>
                            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#F37021] text-white font-bold shadow-lg">
                                <FiPhoneCall /> Join Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}