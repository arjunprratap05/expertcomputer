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

    // Scroll listener for sticky effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Navigation logic: Handles scrolling when arriving from other pages
    useEffect(() => {
        if (location.pathname === '/' && location.state?.targetId) {
            const target = location.state.targetId;
            // Timeout ensures the home page content is fully mounted before scrolling
            const timer = setTimeout(() => {
                scrollToSection(target);
                // Clear state so it doesn't re-scroll on manual refresh
                window.history.replaceState({}, document.title);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [location]);

    const navLinks = [
        { name: 'About', path: '/about' },
        { name: 'Founder', path: '/founder' },
        { name: 'Hall of Fame', path: '/achievements' },
        { name: 'Contact', path: '/contact' },
    ];

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Adjust based on header height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const handleCourseClick = (course) => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);

        if (location.pathname === '/') {
            scrollToSection(course.sectionId);
        } else {
            // Navigate to home and pass the targetId in state
            navigate('/', { state: { targetId: course.sectionId } });
        }
    };

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'}`}>
            <div className="h-1 w-full bg-gradient-to-r from-[#1A5F7A] via-[#F37021] to-[#1A5F7A]"></div>
            
            <nav className="max-w-screen-2xl mx-auto px-4 lg:px-10 py-2">
                <div className="flex justify-between items-center h-14 lg:h-20">
                    {/* LOGO */}
                    <Link to="/" className="flex items-center">
                        <img src={expertcomputerlogo} className={`transition-all duration-300 h-11 lg:h-20 ${isScrolled ? 'scale-90' : 'scale-100'}`} alt="Logo" />
                    </Link>

                    {/* DESKTOP NAV (Hidden on Mobile) */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <NavLink key={link.name} to={link.path} className="font-bold text-[#1A5F7A] hover:text-[#F37021]">{link.name}</NavLink>
                        ))}
                        <div className="relative group" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                            <button className="flex items-center gap-1 font-bold text-[#1A5F7A] py-4 uppercase">Courses <FiChevronDown /></button>
                            <div className={`absolute left-0 top-full w-64 bg-white shadow-xl rounded-xl py-2 transition-all ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                {techCoursesData.map(c => (
                                    <button key={c.id} onClick={() => handleCourseClick(c)} className="w-full text-left px-4 py-2 hover:bg-orange-50 text-sm font-bold text-[#1A5F7A]">{c.title}</button>
                                ))}
                            </div>
                        </div>
                        <Link to="/contact" className="bg-[#F37021] text-white px-6 py-2.5 rounded-xl font-bold uppercase text-sm shadow-lg">Join Now</Link>
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button className="lg:hidden text-2xl text-[#1A5F7A]" onClick={() => setIsMobileMenuOpen(true)}><FiMenu /></button>
                </div>
            </nav>

            {/* MOBILE DRAWER */}
            <div className={`lg:hidden fixed inset-0 z-[100] bg-black/40 transition-opacity ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}>
                <div className="absolute right-0 top-0 h-screen w-[80%] bg-white p-6 shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-8">
                        <img src={expertcomputerlogo} className="h-10" alt="Logo" />
                        <button onClick={() => setIsMobileMenuOpen(false)}><FiX className="text-2xl" /></button>
                    </div>

                    <ul className="flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <NavLink key={link.name} to={link.path} className="py-3 border-b border-slate-50 font-bold text-[#1A5F7A]">{link.name}</NavLink>
                        ))}

                        {/* COURSES DROPDOWN */}
                        <li className="py-3 border-b border-slate-50">
                            <button 
                                className="w-full flex justify-between items-center font-bold text-[#1A5F7A] uppercase"
                                onClick={() => setActiveMobileDropdown(!activeMobileDropdown)}
                            >
                                Courses <FiChevronDown className={`transition-transform ${activeMobileDropdown ? 'rotate-180 text-[#F37021]' : ''}`} />
                            </button>
                            
                            <div className={`overflow-hidden transition-all duration-300 ${activeMobileDropdown ? 'max-h-[800px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="grid grid-cols-1 gap-2 pl-4 border-l-2 border-orange-100">
                                    {techCoursesData.map(c => (
                                        <button key={c.id} onClick={() => handleCourseClick(c)} className="text-left py-2 text-sm font-bold text-slate-500 hover:text-[#F37021] flex items-center gap-2">
                                            <FiBook className="text-[#F37021] text-xs" /> {c.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </li>

                        {/* DYNAMIC SHIFTING BUTTONS: Placed after Courses */}
                        <div className="mt-4 flex flex-col gap-4">
                            <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 text-[#1A5F7A] font-bold border border-slate-100">
                                <FiShield /> Admin Portal
                            </Link>
                            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#F37021] text-white font-bold shadow-lg uppercase tracking-widest italic">
                                <FiPhoneCall /> Join Now
                            </Link>
                        </div>
                    </ul>
                </div>
            </div>
        </header>
    );
}