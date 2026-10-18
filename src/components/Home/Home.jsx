import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useSpring, AnimatePresence } from "framer-motion";
import { 
    FiArrowRight, FiShield, FiCode, FiCpu, FiLayers, FiZap, 
    FiChevronUp, FiLoader, FiCalendar, FiClock, FiCheckCircle, 
    FiExternalLink, FiGrid, FiSmartphone, FiBookOpen, FiStar,
    FiBriefcase, FiUsers, FiTrendingUp, FiPlayCircle, FiAward, FiGift
} from "react-icons/fi";

// --- DATA & MODAL IMPORTS ---
import { techCoursesData, universityPrograms } from "../../data/courses";
import SyllabusModal from "../Modals/SyllabusModal";
import SEO from "../../components/SEO";

// --- ASSET IMPORTS ---
import javaPoster from "../../assets/posters/java.webp";
import htmlPoster from "../../assets/posters/html.webp";
import adcaPoster from "../../assets/posters/adca.webp";
import pythonPoster from "../../assets/posters/python.webp";
import schoolImg from '../../assets/ecosystem/schoolcourses.jpeg';
import collegeImg from '../../assets/ecosystem/collegecourses.jpeg';
import graduatesImg from '../../assets/ecosystem/graduatescourses.jpg';
import workingImg from '../../assets/ecosystem/workingprofessional.jpeg';
import homemakerImg from '../../assets/ecosystem/homemaker.jpeg';
import retiredImg from '../../assets/ecosystem/retiredpersoncourse.jpg';
import expertcomuteroffice from '../../assets/expertcomuteroffice.webp';
import suruchiImg from "../../assets/student-suruchi.jpeg";
import harshImg from "../../assets/student-harsh.jpeg";
import ankitImg from "../../assets/student-ankit.jpeg";
import tallyPoster from "../../assets/posters/Tally.webp";
import genAIPoster from "../../assets/posters/GenerativeAI.webp"; 
import expertcomputerlogo from '../../assets/expertcomputerlogo.png';
import AdvancedProgramFullStackPoster from '../../assets/posters/AdvancedProgramFullStack.webp';
import DSAPoster from '../../assets/posters/DSA.webp';
import ProgrammingusingCProgramPoster from '../../assets/posters/ProgrammingusingC++Program.webp';
import DiplomainComputerApplicationPoster from '../../assets/posters/DiplomainComputerApplication.webp';
import FoundationinITPoster from '../../assets/posters/FoundationinIT.webp';
import msofficePoster from '../../assets/posters/MS-OFFICE.webp';
import AdvanceExcelPoster from '../../assets/posters/AdvanceExcel.webp';
import tallyBootcampPoster from "../../assets/posters/TallyBootcampWebinar.jpeg";
import CProgrammingPoster from "../../assets/posters/ProgramminginC.webp";

// --- LIVE ACADEMY STATUS INDICATOR WITH DYNAMIC MULTI-YEAR HOLIDAY ENGINE ---
const AcademyStatusIndicator = () => {
    const [statusData, setStatusData] = useState({
        isOpen: false,
        text: "",
        isHoliday: false
    });

    useEffect(() => {
        const checkStatus = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth(); // 0-indexed (0 = Jan, 9 = Oct, 10 = Nov)
            const date = now.getDate();
            const day = now.getDay(); 
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const currentTimeInMinutes = hours * 60 + minutes;
            const openingTime = 8 * 60; 
            const closingTime = 20 * 60; 

            // DYNAMIC FESTIVAL CLOSURE DATES (2026-2029)
            const holidayCalendar = {
                2026: {
                    navratri: { startMonth: 9, start: 17, endMonth: 9, end: 20 },
                    diwali: { startMonth: 10, start: 6, endMonth: 10, end: 11 }
                },
                2027: {
                    navratri: { startMonth: 9, start: 6, endMonth: 9, end: 9 }, // Derived from Saptami to Dussehra relative offsets
                    diwali: { startMonth: 9, start: 29, endMonth: 10, end: 1 } // Oct 29 to Nov 1
                },
                2028: {
                    navratri: { startMonth: 8, start: 25, endMonth: 8, end: 28 }, // Sep 25 to Sep 28
                    diwali: { startMonth: 9, start: 17, endMonth: 9, end: 20 } // Oct 17 to Oct 20
                },
                2029: {
                    navratri: { startMonth: 9, start: 14, endMonth: 9, end: 17 }, // Oct 14 to Oct 17
                    diwali: { startMonth: 10, start: 12, endMonth: 10, end: 15 } // Nov 12 to Nov 15
                }
            };

            const currentYearHolidays = holidayCalendar[year];

            if (currentYearHolidays) {
                // Check Navratri
                const nav = currentYearHolidays.navratri;
                const isNavratriHoliday = (month === nav.startMonth && date >= nav.start && date <= nav.end) || 
                                          (nav.startMonth !== nav.endMonth && ((month === nav.startMonth && date >= nav.start) || (month === nav.endMonth && date <= nav.end)));
                
                if (isNavratriHoliday) {
                    setStatusData({ isOpen: false, text: `Closed • Navratri Festival ${year}`, isHoliday: true });
                    return;
                }

                // Check Diwali
                const diwali = currentYearHolidays.diwali;
                const isDiwaliHoliday = (month === diwali.startMonth && date >= diwali.start && date <= diwali.end) || 
                                        (diwali.startMonth !== diwali.endMonth && ((month === diwali.startMonth && date >= diwali.start) || (month === diwali.endMonth && date <= diwali.end)));

                if (isDiwaliHoliday) {
                    setStatusData({ isOpen: false, text: `Closed • Deepavali Festival ${year}`, isHoliday: true });
                    return;
                }
            }

            // Standard Operating Hours
            if (day === 0) { 
                setStatusData({ isOpen: false, text: "Closed • Opens tomorrow 8:00 AM", isHoliday: false }); 
            } else if (currentTimeInMinutes >= openingTime && currentTimeInMinutes < closingTime) { 
                setStatusData({ isOpen: true, text: "Open Now • Closes 8:00 PM", isHoliday: false }); 
            } else if (currentTimeInMinutes < openingTime) { 
                setStatusData({ isOpen: false, text: "Closed • Opens today 8:00 AM", isHoliday: false }); 
            } else if (currentTimeInMinutes >= closingTime) { 
                setStatusData({ isOpen: false, text: day === 6 ? "Closed • Opens Mon 8:00 AM" : "Closed • Opens tomorrow 8:00 AM", isHoliday: false }); 
            }
        };
        
        checkStatus();
        const interval = setInterval(checkStatus, 60000); 
        return () => clearInterval(interval);
    }, []);

    if (statusData.isHoliday) {
        return (
            <div className="inline-flex items-center gap-2.5 bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 px-4 py-2 rounded-full text-xs font-semibold tracking-wide shadow-inner backdrop-blur-md">
                <FiGift className="text-indigo-400" />
                <span className="text-indigo-400 font-black">HOLIDAY</span>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-300 font-medium">{statusData.text}</span>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2.5 bg-slate-900/60 border border-slate-700/60 text-slate-300 px-4 py-2 rounded-full text-xs font-semibold tracking-wide shadow-inner backdrop-blur-md">
            <span className={`flex h-2.5 w-2.5 rounded-full ${statusData.isOpen ? "bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}`} />
            <span className={statusData.isOpen ? "text-emerald-400 font-black" : "text-red-400 font-black"}>{statusData.isOpen ? "OPEN" : "CLOSED"}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-medium">{statusData.text}</span>
        </div>
    );
};

// --- RUNNING TECH TICKER ---
const RunningTicker = () => {
    const items = [ "GENERATIVE AI INTEGRATED", "100% PRACTICAL LABS", "ISO 9001:2015 CERTIFIED", "PYTHON DATA SCIENCE", "ADVANCED TALLY PRIME", "FULL STACK WEB DEVELOPMENT", "MSME RECOGNIZED INSTITUTE", "39+ YEARS OF EXCELLENCE", "DSA IN C++" ];
    const duplicatedItems = [...items, ...items, ...items];

    return (
        <div className="w-full bg-[#0A192F] py-4 overflow-hidden relative flex items-center border-y border-slate-800/60 shadow-2xl select-none">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#070D1D] to-transparent z-10 pointer-events-none hidden md:block" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#070D1D] to-transparent z-10 pointer-events-none hidden md:block" />

            <motion.div className="flex whitespace-nowrap gap-12 text-[10px] md:text-xs font-black tracking-[0.25em] uppercase items-center text-slate-400 w-max" animate={{ x: ["0%", "-33.33%"] }} transition={{ ease: "linear", duration: 35, repeat: Infinity }}>
                {duplicatedItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 group">
                        <span className="hover:text-white transition-colors">{item}</span>
                        <span className="w-1 h-1 rounded-full bg-[#F37021] shadow-[0_0_8px_#F37021]" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// --- CORPORATE PARTNER TICKER ---
const PartnerTicker = () => {
    const partners = [
        "HDFC BANK", "STATE BANK OF INDIA", "ICICI BANK", "AXIS BANK", 
        "KOTAK MAHINDRA BANK", "BANK OF BARODA", "PUNJAB NATIONAL BANK", "INDUSIND BANK"
    ];
    
    const dupes = [...partners, ...partners, ...partners];

    return (
        <div className="w-full bg-slate-950 py-6 overflow-hidden relative flex items-center select-none opacity-80 mt-10 border-y border-slate-900">
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <span className="bg-slate-950 px-4 text-[9px] font-black tracking-[0.3em] uppercase text-slate-600 border border-slate-800 rounded-full">
                    Banking Placement Network
                </span>
            </div>
            <motion.div 
                className="flex whitespace-nowrap gap-16 text-sm md:text-base font-black tracking-widest uppercase items-center text-slate-800 w-max" 
                animate={{ x: ["-33.33%", "0%"] }} 
                transition={{ ease: "linear", duration: 40, repeat: Infinity }}
            >
                {dupes.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <span>{item}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// --- PREMIUM TILT CARD ---
const PremiumTiltCard = ({ children, className }) => {
    const x = useSpring(0, { stiffness: 100, damping: 30 });
    const y = useSpring(0, { stiffness: 100, damping: 30 });
    const handleMouse = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5 * 8); 
        y.set((e.clientY - rect.top) / rect.height - 0.5 * -8);
    };
    const handleLeave = () => { x.set(0); y.set(0); };
    return <motion.div onMouseMove={handleMouse} onMouseLeave={handleLeave} style={{ rotateY: x, rotateX: y }} className={`transition-all duration-300 transform-gpu ${className}`}>{children}</motion.div>;
};

// --- OPTIMIZED IMAGE ---
const OptimizedImage = ({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
            {!isLoaded && <div className="absolute inset-0 flex items-center justify-center bg-[#0A192F] animate-pulse"><FiLoader className="text-[#F37021] animate-spin text-xl" /></div>}
            <img src={src} alt={alt} onLoad={() => setIsLoaded(true)} className={`transition-all duration-700 w-full h-full object-cover ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`} loading="lazy" />
        </div>
    );
};

export default function Home() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [pageLoading, setPageLoading] = useState(() => !sessionStorage.getItem("hasSeenHomeLoader"));
    const [selectedSyllabus, setSelectedSyllabus] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [activeSegment, setActiveSegment] = useState("All"); 
    const targetRef = useRef(null);

    const isWebinarActive = useMemo(() => new Date() < new Date("2026-04-24T16:00:00"), []);

    const posterMap = useMemo(() => ({
        "gen-ai-master": genAIPoster,"java-pro": javaPoster, "html5-web": htmlPoster, "adca-diploma": adcaPoster, "python-ds": pythonPoster,
        "tally-essential": tallyPoster, "full-stack-dev": AdvancedProgramFullStackPoster, "dsa-master": DSAPoster,
        "prog-cpp": ProgrammingusingCProgramPoster, "dca-new": DiplomainComputerApplicationPoster,
        "found-it-new": FoundationinITPoster, "ms-office-basic": msofficePoster, "adv-excel-pro": AdvanceExcelPoster,"c-programming-intro" : CProgrammingPoster
    }), []);

    const categories = useMemo(() => [
        { title: "School Students", segment: "School Students", desc: "Logic & foundational coding structures.", image: schoolImg, icon: <FiCode /> },
        { title: "College Students", segment: "College Students", desc: "Core engineering tech stacks & systems.", image: collegeImg, icon: <FiCpu /> },
        { title: "Graduates", segment: "Graduates", desc: "Career-ready production systems.", image: graduatesImg, icon: <FiLayers /> },
        { title: "Working Professionals", segment: "Working Professionals", desc: "Modernize pipelines with AI tools.", image: workingImg, icon: <FiZap /> },
        { title: "Home Makers", segment: "Home Makers", desc: "Essential computer financial tools.", image: homemakerImg, icon: <FiSmartphone /> },
        { title: "Retired Persons", segment: "Retired Persons", desc: "Secure web navigation & networks.", image: retiredImg, icon: <FiShield /> },
    ], []);

    const alumniData = useMemo(() => [
        { name: "Suruchi Rai", role: "Web Developer", text: "Mastered HTML5 at Expert Academy. The hyper-practical labs mirror real-world developer setups.", image: suruchiImg },
        { name: "Harsh Raj", role: "Systems Engineer", text: "The ADCA architecture track changed my trajectory completely. Instructors understand production scaling.", image: harshImg },
        { name: "Ankit Shubham", role: "AI Engineer", text: "The production application models are world-class and deeply configured for 2026 tech standard shifts.", image: ankitImg }
    ], []);

    const metrics = [
        { value: "12,500+", label: "Alumni Network", icon: <FiUsers /> },
        { value: "94%", label: "Placement Success", icon: <FiTrendingUp /> },
        { value: "39+", label: "Years Excellence", icon: <FiAward /> },
        { value: "150+", label: "Hiring Partners", icon: <FiBriefcase /> },
    ];

    const displayCourses = useMemo(() => {
        const featuredIds = ["gen-ai-master","java-pro", "html5-web", "adca-diploma", "python-ds", "tally-essential", "full-stack-dev", "dsa-master", "prog-cpp", "dca-new", "found-it-new", "ms-office-basic", "adv-excel-pro","c-programming-intro"];
        return activeSegment === "All" ? techCoursesData.filter(c => featuredIds.includes(c.id)) : techCoursesData.filter(course => course.segment === activeSegment);
    }, [activeSegment]);

    useEffect(() => {
        if (pageLoading) {
            const timer = setTimeout(() => { setPageLoading(false); sessionStorage.setItem("hasSeenHomeLoader", "true"); }, 1200);
            return () => clearTimeout(timer);
        }
    }, [pageLoading]);

    const handleOpenModal = (course) => setSearchParams({ course: course.id });
    const handleCloseModal = () => setSearchParams({});

    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 500);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const courseIdFromUrl = searchParams.get("course");
    useEffect(() => {
        if (courseIdFromUrl) {
            const course = techCoursesData.find(c => c.id === courseIdFromUrl);
            if (course) setSelectedSyllabus(course);
        } else setSelectedSyllabus(null);
    }, [courseIdFromUrl, searchParams]);

    // Framer Motion Variants for Staggered Grid
    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

    if (pageLoading) return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070D1D]">
            <div className="relative flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-24 h-24 border-4 border-slate-800 border-t-[#F37021] border-r-[#1A5F7A] rounded-full shadow-[0_0_30px_rgba(243,112,33,0.2)]" />
                <img src={expertcomputerlogo} className="absolute w-12 h-auto object-contain drop-shadow-md" alt="Logo Loading" />
            </div>
        </div>
    );

    return (
        <div ref={targetRef} className="relative min-h-[100dvh] bg-[#070D1D] text-slate-100 antialiased font-sans overflow-x-hidden selection:bg-[#F37021]/30 selection:text-orange-200">
            <SEO title="Expert Computer Academy | Patna's Premier IT Institute" description="Empowering students in Patna with IT excellence since 1987. 100% practical labs, ISO 9001:2015 certified, offering ADCA, Python, Java, and Full Stack Development." url="https://expertcomputeracademy.in" />

            {/* DYNAMIC AMBIENT BACKDROP */}
            <div className="absolute top-0 left-1/4 w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-gradient-to-tr from-[#F37021]/15 via-[#1A5F7A]/15 to-transparent rounded-full blur-[100px] md:blur-[160px] pointer-events-none -z-10" />
            <div className="absolute top-[30%] right-0 w-[300px] md:w-[600px] h-[400px] md:h-[800px] bg-indigo-900/20 rounded-full blur-[100px] md:blur-[180px] pointer-events-none -z-10" />

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <AnimatePresence>
                    {showBackToTop && (
                        <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="fixed bottom-6 right-6 z-50 bg-[#0A192F]/90 backdrop-blur-md text-white p-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-slate-700 hover:bg-[#F37021] hover:border-[#F37021] transition-all focus:outline-none group">
                            <FiChevronUp size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* 1. ELITE HERO SECTION */}
                <section className="pt-28 pb-16 md:pt-36 md:pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative">
                        {/* Floating Tech Orbs (Decorative) */}
                        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 right-[40%] text-5xl text-blue-500/20 hidden lg:block"><FiCode/></motion.div>
                        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-20 left-[50%] text-6xl text-orange-500/10 hidden lg:block"><FiCpu/></motion.div>

                        <div className="lg:col-span-7 space-y-8 text-center lg:text-left order-2 lg:order-1 relative z-10">
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                    className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-950/80 to-slate-900/80 border border-slate-700/60 text-slate-300 px-4 py-2 rounded-full text-xs font-bold tracking-widest shadow-inner backdrop-blur-md uppercase">
                                    <FiShield className="text-[#F37021]" /> ISO 9001:2015 & MSME Certified
                                </motion.div>
                                <AcademyStatusIndicator />
                            </div>
                            
                            <motion.h1 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                                className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black text-white tracking-tight leading-[1.05]">
                                Engineer your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200 relative inline-block">tech future<span className="absolute bottom-2 left-0 w-full h-[4px] bg-[#F37021]/30 rounded-full" /></span> with clarity.
                            </motion.h1>
                            
                            <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                                className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                                Patna's premier destination for computing proficiency since 1987. Transition safely from zero engineering literacy to industry-ready production deployment.
                            </motion.p>
                            
                            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                                <button onClick={() => navigate('/about')} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#F37021] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black uppercase tracking-wider text-sm rounded-2xl shadow-[0_10px_30px_rgba(243,112,33,0.3)] transition-all flex items-center justify-center gap-3 group">
                                    Explore Academy Path <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="flex items-center gap-3 w-full sm:w-auto px-6 py-4 bg-slate-900/60 text-slate-300 font-bold rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-sm justify-center">
                                    <div className="flex -space-x-2">
                                        <img className="w-8 h-8 rounded-full border-2 border-slate-900" src={suruchiImg} alt="Alumni" />
                                        <img className="w-8 h-8 rounded-full border-2 border-slate-900" src={harshImg} alt="Alumni" />
                                        <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-black text-white">+10k</div>
                                    </div>
                                    <div className="text-xs text-left leading-tight">
                                        <div className="text-white font-black flex items-center gap-1">4.9/5 <FiStar className="text-amber-400 fill-current text-[10px]"/></div>
                                        <div className="text-slate-500 font-medium">Alumni Rating</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        
                        <div className="lg:col-span-5 order-1 lg:order-2 w-full max-w-md lg:max-w-none mx-auto relative z-20">
                            <PremiumTiltCard className="relative p-2">
                                <div className="rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-slate-700/80 bg-slate-900 aspect-square md:aspect-[4/3] lg:aspect-[4/5] relative group">
                                    <OptimizedImage src={expertcomuteroffice} alt="Expert Academy Hub Front Office" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#070D1D]/90 via-[#070D1D]/20 to-transparent pointer-events-none" />
                                    
                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 group-hover:scale-110 group-hover:bg-[#F37021] group-hover:text-white group-hover:border-[#F37021] transition-all cursor-pointer shadow-2xl">
                                            <FiPlayCircle size={32} />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-[#0A192F]/95 backdrop-blur-xl text-white p-5 md:p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-700/80 flex flex-col items-center min-w-[120px] md:min-w-[140px]">
                                    <span className="text-3xl md:text-5xl font-black text-[#F37021] leading-none tracking-tighter">1987</span>
                                    <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-400 font-black mt-2">Established</span>
                                </div>
                            </PremiumTiltCard>
                        </div>
                    </div>
                </section>
            </div>

            <RunningTicker />
            <PartnerTicker />

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 mt-20">
                
                {/* 2. IMPACT METRICS SECTION */}
                <section className="mb-20 md:mb-32">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {metrics.map((m, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                                className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-6 md:p-8 rounded-2xl md:rounded-[2rem] text-center group hover:bg-slate-800/50 hover:border-slate-700 transition-colors shadow-lg">
                                <div className="w-12 h-12 mx-auto bg-slate-950 border border-slate-800 text-[#F37021] rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 group-hover:bg-[#F37021] group-hover:text-white transition-all shadow-inner">
                                    {m.icon}
                                </div>
                                <h4 className="text-3xl md:text-4xl font-black text-white tracking-tight">{m.value}</h4>
                                <p className="text-[10px] md:text-xs uppercase font-bold text-slate-400 tracking-widest mt-2">{m.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 3. LIVE WEBINAR NOTIFICATION */}
                {isWebinarActive && (
                    <section className="mb-20 md:mb-32">
                        <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
                            className="bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#070D1D] rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 lg:p-12 text-white relative overflow-hidden border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F37021] blur-[140px] opacity-15 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600 blur-[120px] opacity-10 pointer-events-none" />
                            
                            <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                                <div className="w-32 sm:w-40 lg:w-48 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 hidden sm:block">
                                    <OptimizedImage src={tallyBootcampPoster} alt="Tally Bootcamp Event Poster" className="w-full h-auto" />
                                </div>
                                <div className="flex-1 text-center lg:text-left space-y-4">
                                    <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest backdrop-blur-md">
                                        <FiZap className="animate-pulse text-[#F37021]" /> Live Skills Bootcamp
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                                        Accelerated Tally Masterclass Webinar
                                    </h2>
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-slate-300 font-medium">
                                        <span className="flex items-center gap-2"><FiCalendar className="text-[#F37021]" /> April 24, 2026</span>
                                        <span className="flex items-center gap-2"><FiClock className="text-[#F37021]" /> 03:00 PM IST Onwards</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-3">
                                        <button onClick={() => handleOpenModal(techCoursesData.find(c => c.id === 'tally-essential'))} className="w-full sm:w-auto px-6 py-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 text-slate-200">
                                            <FiBookOpen /> Track Curriculums
                                        </button>
                                        <button onClick={() => window.open('https://forms.gle/jPd53cxWSjje4Ssc7', '_blank')} className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-[#F37021] to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-[0_8px_20px_rgba(243,112,33,0.3)] transition-all flex items-center justify-center gap-2">
                                            Claim Secure Spot <FiExternalLink />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* 4. SEGMENT SELECTION FILTER */}
                <section className="mb-14 md:mb-18">
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <span className="text-xs uppercase font-black tracking-[0.2em] text-[#F37021] block mb-2">Targeted Roadmaps</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                            Personalized Program Segments
                        </h2>
                        <p className="text-slate-400 mt-3 text-sm md:text-base font-normal">
                            Select an ecosystem track tailored specifically to your current professional or academic standing.
                        </p>
                    </div>

                    <div className="flex items-center lg:justify-center gap-2.5 overflow-x-auto pb-4 pt-2 lg:overflow-visible no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        <button 
                            onClick={() => setActiveSegment("All")}
                            className={`px-6 py-3.5 rounded-full text-xs font-black tracking-wider uppercase transition-all shrink-0 border backdrop-blur-md ${
                                activeSegment === "All" 
                                ? "bg-[#1A5F7A] text-white border-teal-600 shadow-[0_4px_20px_rgba(26,95,122,0.4)]" 
                                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white"
                            }`}
                        >
                            All Specialized Tracks
                        </button>
                        {categories.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveSegment(cat.segment)}
                                className={`px-6 py-3.5 rounded-full text-xs font-black tracking-wider uppercase transition-all shrink-0 border flex items-center gap-2.5 backdrop-blur-md ${
                                    activeSegment === cat.segment 
                                    ? "bg-[#1A5F7A] text-white border-teal-600 shadow-[0_4px_20px_rgba(26,95,122,0.4)]" 
                                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white"
                                }`}
                            >
                                <span className={activeSegment === cat.segment ? "text-[#F37021]" : "text-slate-500"}>{cat.icon}</span>
                                {cat.title}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 5. SIGNATURE COURSES CATALOG GRID (ANIMATED) */}
                <section id="signature-courses" className="pb-20 md:pb-32 scroll-mt-8">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
                        <h3 className="text-sm md:text-base font-extrabold text-slate-200 uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F37021] shadow-[0_0_8px_#F37021]" />
                            {activeSegment === "All" ? "Core Featured Programs" : `${activeSegment} Modules`}
                        </h3>
                        {activeSegment !== "All" && (
                            <button onClick={() => setActiveSegment("All")} className="text-xs md:text-sm font-black text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition-colors uppercase tracking-wider">
                                <FiGrid /> Reset Filters
                            </button>
                        )}
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {displayCourses.map((course) => (
                                <motion.div
                                    layout
                                    variants={itemVariants}
                                    key={course.id}
                                    onClick={() => handleOpenModal(course)}
                                    className="group bg-slate-900/70 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_30px_rgba(243,112,33,0.15)] hover:border-slate-700 transition-all cursor-pointer flex flex-col h-full"
                                >
                                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-950 flex items-center justify-center p-3 border-b border-slate-800/80">
                                        <OptimizedImage 
                                            src={posterMap[course.id] || javaPoster} 
                                            alt={`${course.title} Syllabus Catalog Cover`} 
                                            className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    </div>
                                    <div className="p-5 flex flex-col flex-1 justify-between bg-gradient-to-b from-slate-900/50 to-slate-900">
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] uppercase font-black tracking-widest text-[#F37021]">
                                                {course.duration || "Certified Module"}
                                            </span>
                                            <h4 className="text-base md:text-lg font-bold text-slate-100 group-hover:text-orange-300 transition-colors leading-snug line-clamp-2">
                                                {course.title}
                                            </h4>
                                        </div>
                                        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-[#F37021] transition-colors">
                                            <span>View Full Syllabus</span>
                                            <FiArrowRight className="transform -rotate-45 group-hover:rotate-0 group-hover:translate-x-1 transition-transform text-sm" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </section>

                {/* 6. BENTO BOX ECOSYSTEM SUMMARY */}
                <section className="mb-24 md:mb-32">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-[#F37021] block mb-2">Structure Matrix</span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">The Structured Ecosystem</h2>
                    </div>

                    {/* Elite Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
                        {categories.map((cat, idx) => {
                            // Logic to make the first two items span multiple columns/rows for the Bento effect
                            const isLarge = idx === 0;
                            const isTall = idx === 1;
                            const spanClasses = isLarge 
                                ? "md:col-span-2 lg:col-span-2 md:row-span-2 bg-gradient-to-br from-[#1A5F7A] to-[#0A192F]" 
                                : isTall 
                                ? "md:col-span-1 lg:col-span-1 md:row-span-2 bg-slate-900/60" 
                                : "md:col-span-1 lg:col-span-1 bg-slate-900/60";

                            return (
                                <div 
                                    key={idx}
                                    onClick={() => { 
                                        setActiveSegment(cat.segment); 
                                        document.getElementById('signature-courses')?.scrollIntoView({ behavior: 'smooth' }); 
                                    }}
                                    className={`relative backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 overflow-hidden cursor-pointer group shadow-xl hover:border-slate-600 transition-all flex flex-col justify-between ${spanClasses}`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#070D1D]/90 via-transparent to-transparent z-10" />
                                    <OptimizedImage src={cat.image} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" alt={cat.title} />
                                    
                                    <div className="relative z-20 w-12 h-12 text-[#F37021] bg-slate-950/80 border border-slate-700/60 flex items-center justify-center text-2xl rounded-2xl shadow-inner group-hover:bg-[#F37021] group-hover:text-white transition-colors">
                                        {cat.icon}
                                    </div>

                                    <div className="relative z-20 mt-auto pt-4">
                                        <h3 className={`${isLarge ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} font-black text-white tracking-tight leading-tight`}>{cat.title}</h3>
                                        <p className="text-xs md:text-sm text-slate-300 mt-2 font-medium opacity-90 line-clamp-2">{cat.desc}</p>
                                        
                                        <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F37021] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            View Track Modules <FiArrowRight />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 7. ALUMNI PLACEMENT REVIEWS */}
                <section className="pb-20 md:pb-28">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-[#F37021] block mb-2">Verified Feedback</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Alumni Placement Verification</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {alumniData.map((student, idx) => (
                            <div key={idx} className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 p-6 md:p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col justify-between hover:border-slate-700 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 text-6xl text-slate-800/30 font-serif leading-none italic pointer-events-none">"</div>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex text-amber-400 gap-1">
                                        {[...Array(5)].map((_, i) => <FiStar key={i} className="fill-current text-xs" />)}
                                    </div>
                                    <p className="text-slate-300 text-sm md:text-base leading-relaxed italic font-normal">
                                        "{student.text}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 border-t border-slate-800 pt-6 mt-6 relative z-10">
                                    <img src={student.image} className="w-12 h-12 rounded-full object-cover bg-slate-800 border-2 border-slate-700 shadow-md" alt={student.name} />
                                    <div>
                                        <span className="block font-black text-white text-sm uppercase tracking-wide">{student.name}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1 mt-1">
                                            {student.role} <span className="w-1 h-1 bg-slate-600 rounded-full mx-1"/> <FiCheckCircle className="text-teal-400 inline" /> Verified
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 8. MINIMAL SYSTEM FOOTER */}
                <footer className="border-t border-slate-800 py-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm font-bold tracking-[0.2em] text-slate-500 uppercase">
                    <div>ESTD 1987 <span className="text-[#F37021] mx-2">•</span> PATNA HQ CORE CAMPUS</div>
                    <div className="flex items-center gap-4">
                        <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </footer>
            </div>

            {/* SYLLABUS DISCLOSURE MODAL INTERFACE */}
            {selectedSyllabus && <SyllabusModal course={selectedSyllabus} onClose={handleCloseModal} />}
        </div>
    );
}