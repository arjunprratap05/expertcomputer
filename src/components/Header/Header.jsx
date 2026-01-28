import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiPhoneCall, FiChevronDown, FiBook, FiAward, FiShield } from 'react-icons/fi';
import { techCoursesData } from '../../data/courses';
import expertcomputerlogo from '../../assets/expertcomputerlogo.png'; 

export default function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // FIXED: Ensured 'Hall of Fame' is in the primary navLinks array
    const navLinks = [
        { name: 'About', path: '/about' },
        { name: 'Founder', path: '/founder' },
        { name: 'Hall of Fame', path: '/achievements' }, 
        { name: 'Contact', path: '/contact' },
    ];

    const handleHomeClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault(); 
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    };

    const handleCourseSelection = (course) => {
        setIsDropdownOpen(false);
        if (location.pathname !== '/') {
            navigate('/', { state: { targetId: course.sectionId, courseId: course.id } });
        } else {
            scrollToTarget(course.sectionId, course.id);
        }
    };

    const scrollToTarget = (sectionId, courseId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            const card = document.getElementById(courseId);
            if (card) {
                card.classList.add('ring-4', 'ring-[#F37021]', 'ring-offset-4', 'scale-105', 'duration-500');
                setTimeout(() => card.classList.remove('ring-4', 'ring-[#F37021]', 'ring-offset-4', 'scale-105'), 3000);
            }
        }
    };

    return (
        <header className="shadow-lg sticky z-50 top-0 bg-white/95 backdrop-blur-md">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#1A5F7A] via-[#F37021] to-[#1A5F7A]"></div>
            <nav className="max-w-screen-xl mx-auto px-4 lg:px-8 py-4 border-b border-slate-100">
                <div className="flex flex-wrap justify-between items-center">
                    
                    {/* LOGO & ADMIN PORTAL LINK */}
                    <div className="flex items-center gap-4">
                        <Link to="/" onClick={handleHomeClick} className="flex items-center transform transition hover:scale-105">
                            <img src={expertcomputerlogo} className="h-10 lg:h-14 w-auto object-contain" alt="Logo" />
                        </Link>
                        
                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

                        <Link 
                            to="/admin/login" 
                            className="flex items-center gap-1.5 text-[#1A5F7A] hover:text-[#F37021] transition-colors"
                        >
                            <FiShield className="text-sm" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Admin Portal</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 lg:order-2">
                        <Link to="/niit-university" className="hidden md:flex items-center gap-2 bg-blue-50 text-[#1A5F7A] px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                            <FiAward className="text-[#F37021]" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-left leading-tight">Associated University <br/> Partners</span>
                        </Link>
                        <Link to="/contact" className="flex items-center gap-2 text-white bg-[#F37021] hover:bg-[#1A5F7A] font-bold rounded-xl text-sm px-6 py-3 transition-all shadow-md">
                            <FiPhoneCall /> <span>Join Now</span>
                        </Link>
                    </div>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden lg:flex lg:w-auto lg:order-1">
                        <ul className="flex flex-row space-x-8 items-center">
                            <li>
                                <NavLink 
                                    to="/" 
                                    onClick={handleHomeClick}
                                    className={({ isActive }) => `font-extrabold transition-colors ${isActive && location.pathname === '/' ? "text-[#F37021]" : "text-[#1A5F7A] hover:text-[#F37021]"}`}
                                >
                                    Home
                                </NavLink>
                            </li>

                            {/* This loop now includes Hall of Fame */}
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <NavLink to={link.path} className={({ isActive }) => `font-extrabold transition-colors ${isActive ? "text-[#F37021]" : "text-[#1A5F7A] hover:text-[#F37021]"}`}>
                                        {link.name}
                                    </NavLink>
                                </li>
                            ))}

                            <li className="relative group" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                                <button className="flex items-center gap-1 font-extrabold text-[#1A5F7A] hover:text-[#F37021]">
                                    Courses <FiChevronDown />
                                </button>
                                <div className={`absolute left-0 w-64 bg-white rounded-2xl shadow-2xl py-4 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                    {techCoursesData.map((course) => (
                                        <button 
                                            key={course.id} 
                                            onClick={() => handleCourseSelection(course)} 
                                            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#1A5F7A] hover:bg-slate-50 hover:text-[#F37021]"
                                        >
                                            <FiBook className="text-[#F37021] opacity-70" /> {course.title}
                                        </button>
                                    ))}
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}