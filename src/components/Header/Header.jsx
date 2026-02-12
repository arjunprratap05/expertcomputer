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
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Effect to handle navigation when state is passed from another page
    useEffect(() => {
        if (location.state?.targetId) {
            // Short timeout to ensure the DOM has rendered if navigating from another page
            setTimeout(() => {
                scrollToTarget(location.state.targetId);
                // Clear state after scrolling to prevent re-scroll on refresh
                window.history.replaceState({}, document.title);
            }, 100);
        }
    }, [location]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

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
        
        // If we are already on home, scroll. If not, navigate to home with state.
        if (location.pathname === '/') {
            scrollToTarget(course.sectionId);
        } else {
            navigate('/', { state: { targetId: course.sectionId } });
        }
    };

    const scrollToTarget = (targetId) => {
        const element = document.getElementById(targetId);
        if (element) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - (headerHeight + 20);

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'}`}>
            <div className="h-1 w-full bg-gradient-to-r from-[#1A5F7A] via-[#F37021] to-[#1A5F7A]"></div>
            
            <nav className="max-w-screen-2xl mx-auto px-4 lg:px-10 py-1 lg:py-2 transition-all duration-300">
                <div className="flex justify-between items-center h-14 lg:h-20">
                    
                    {/* LOGO */}
                    <div className="flex items-center">
                        <Link to="/" onClick={handleHomeClick} className="flex items-center">
                            <img 
                                src={expertcomputerlogo} 
                                className={`transition-all duration-300 object-contain w-auto ${isScrolled ? 'h-9 lg:h-14' : 'h-11 lg:h-20'}`} 
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
                                <button className="flex items-center gap-1.5 text-[15px] font-extrabold text-[#1A5F7A] group-hover:text-[#F37021] py-4 uppercase">
                                    Courses <FiChevronDown />
                                </button>
                                <div className={`absolute left-0 top-full w-72 bg-white rounded-2xl shadow-2xl py-3 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
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
                            <Link to="/contact" className="text-white bg-[#F37021] hover:bg-[#1A5F7A] font-bold rounded-xl text-sm px-6 py-3 transition-all shadow-md uppercase">Join Now</Link>
                        </div>
                    </div>

                    {/* MOBILE HAMBURGER */}
                    <button className="lg:hidden p-2 text-[#1A5F7A] text-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </nav>

            {/* MOBILE MENU DRAWER */}
            <div className={`lg:hidden fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}>
                <div 
                    className={`absolute right-0 top-0 h-screen w-[75%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-5 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <img src={expertcomputerlogo} className="h-9 w-auto" alt="Logo" />
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-2xl text-slate-400"><FiX /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            <ul className="space-y-1">
                                <li>
                                    <NavLink to="/" onClick={handleHomeClick} className="block py-3 text-base font-bold text-[#1A5F7A] border-b border-slate-50">Home</NavLink>
                                </li>
                                {navLinks.map((link) => (
                                    <li key={link.name}>
                                        <NavLink to={link.path} className="block py-3 text-base font-bold text-[#1A5F7A] border-b border-slate-50">{link.name}</NavLink>
                                    </li>
                                ))}
                                
                                {/* ADMIN & JOIN NOW BUTTONS MOVED HERE FOR VISIBILITY */}
                                <li>
                                    <Link to="/admin/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-3 text-base font-bold text-[#1A5F7A] border-b border-slate-50">
                                        <FiShield className="text-[#F37021]" /> Admin Portal
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-3 text-base font-bold text-[#F37021] border-b border-slate-50 uppercase italic">
                                        <FiPhoneCall /> Join Now
                                    </Link>
                                </li>

                                <li className="pt-2">
                                    <button 
                                        className="w-full flex justify-between items-center py-3 text-base font-bold text-[#1A5F7A]"
                                        onClick={() => setActiveMobileDropdown(!activeMobileDropdown)}
                                    >
                                        COURSES <FiChevronDown className={`transition-transform duration-200 ${activeMobileDropdown ? 'rotate-180 text-[#F37021]' : ''}`} />
                                    </button>
                                    <div className={`space-y-1 pl-4 border-l-2 border-orange-50 overflow-hidden transition-all duration-300 ${activeMobileDropdown ? 'max-h-[600px] opacity-100 py-2' : 'max-h-0 opacity-0'}`}>
                                        {techCoursesData.map((course) => (
                                            <button key={course.id} onClick={() => handleCourseSelection(course)} className="w-full text-left py-2.5 text-sm font-semibold text-slate-500 flex items-center gap-2">
                                                <FiBook className="text-[#F37021] text-xs" /> {course.title}
                                            </button>
                                        ))}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}