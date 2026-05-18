import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import {
    FiArrowRight, FiShield, FiBookOpen, FiAward, FiStar, 
    FiCode, FiCpu, FiLayers, FiZap, FiChevronUp, FiLoader, FiCalendar, FiClock, FiCheckCircle, FiExternalLink, FiGrid, FiUser, FiSmartphone
} from "react-icons/fi";

// --- DATA & MODAL IMPORTS ---
import { techCoursesData, universityPrograms } from "../../data/courses";
import SyllabusModal from "../Modals/SyllabusModal";

// --- ASSET IMPORTS ---
import javaPoster from "../../assets/posters/java.png";
import htmlPoster from "../../assets/posters/html.png";
import adcaPoster from "../../assets/posters/adca.jpeg";
import pythonPoster from "../../assets/posters/python.jpeg";
import schoolImg from '../../assets/ecosystem/schoolcourses.jpeg';
import collegeImg from '../../assets/ecosystem/collegecourses.jpeg';
import graduatesImg from '../../assets/ecosystem/graduatescourses.jpg';
import workingImg from '../../assets/ecosystem/workingprofessional.jpeg';
import homemakerImg from '../../assets/ecosystem/homemaker.jpeg';
import retiredImg from '../../assets/ecosystem/retiredpersoncourse.jpg';
import expertcomuteroffice from "../../assets/expertcomputerfrontoffice.jpeg";
import suruchiImg from "../../assets/student-suruchi.jpeg";
import harshImg from "../../assets/student-harsh.jpeg";
import ankitImg from "../../assets/student-ankit.jpeg";
import tallyPoster from "../../assets/posters/Tally.jpeg";
import genAIPoster from "../../assets/posters/GenerativeAI.jpeg"; 
import expertcomputerlogo from '../../assets/expertcomputerlogo.png';
import AdvancedProgramFullStackPoster from '../../assets/posters/AdvancedProgramFullStack.jpeg';
import DSAPoster from '../../assets/posters/DSA.jpeg';
import ProgrammingusingCProgramPoster from '../../assets/posters/ProgrammingusingC++Program.jpeg';
import DiplomainComputerApplicationPoster from '../../assets/posters/DiplomainComputerApplication.jpeg';
import FoundationinITPoster from '../../assets/posters/FoundationinIT.jpeg';
import msofficePoster from '../../assets/posters/MS-OFFICE.jpeg';
import AdvanceExcelPoster from '../../assets/posters/AdvanceExcel.jpeg';
import tallyBootcampPoster from "../../assets/posters/TallyBootcampWebinar.jpeg";

// --- NEW COMPONENT: INFINITE RUNNING TICKER ---
const RunningTicker = () => {
    const tickerItems = [
        "GENERATIVE AI INTEGRATED", "100% PRACTICAL LABS", "ISO 9001:2015 CERTIFIED", 
        "PYTHON DATA SCIENCE", "ADVANCED TALLY PRIME", "FULL STACK WEB DEVELOPMENT", 
        "MSME RECOGNIZED INSTITUTE", "38+ YEARS OF EXCELLENCE", "DSA IN C++"
    ];

    // Duplicate list to create seamless looping illusion
    const duplicatedItems = [...tickerItems, ...tickerItems];

    return (
        <div className="w-full bg-[#0F2C59] text-white py-4 overflow-hidden relative flex items-center shadow-inner select-none">
            {/* Ambient edge masking for smooth fade-in/fade-out */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0F2C59] to-transparent z-10 pointer-events-none hidden sm:block" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0F2C59] to-transparent z-10 pointer-events-none hidden sm:block" />

            <motion.div 
                className="flex whitespace-nowrap gap-12 text-xs md:text-sm font-extrabold tracking-[0.15em] uppercase items-center"
                animate={{ x: [0, -1000] }}
                transition={{
                    ease: "linear",
                    duration: 25,
                    repeat: Infinity,
                }}
            >
                {duplicatedItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <span>{item}</span>
                        <span className="w-2 h-2 rounded-full bg-[#F37021]" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// --- PREMIUM TILT CARD ---
const PremiumTiltCard = ({ children, className }) => {
    const x = useSpring(0, { stiffness: 120, damping: 25 });
    const y = useSpring(0, { stiffness: 120, damping: 25 });
    
    const handleMouse = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
        x.set(mouseX * 10); 
        y.set(mouseY * -10);
    };
    
    const handleLeave = () => { x.set(0); y.set(0); };
    
    return (
        <motion.div 
            onMouseMove={handleMouse} 
            onMouseLeave={handleLeave}
            style={{ rotateY: x, rotateX: y, transformStyle: "preserve-3d" }}
            className={`transition-shadow duration-300 ${className}`}
        >
            {children}
        </motion.div>
    );
};

// --- OPTIMIZED IMAGE LOADER ---
const OptimizedImage = ({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <div className={`relative overflow-hidden bg-slate-900/5 ${className}`}>
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse">
                    <FiLoader className="text-[#F37021] animate-spin text-xl" />
                </div>
            )}
            <img 
                src={src} 
                alt={alt} 
                onLoad={() => setIsLoaded(true)} 
                className={`transition-all duration-700 object-cover ${className} ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`} 
                loading="lazy" 
            />
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

    const isWebinarActive = useMemo(() => {
        const expiryDate = new Date("2026-04-24T16:00:00"); 
        const now = new Date();
        return now < expiryDate;
    }, []);

    const posterMap = useMemo(() => ({
        "java-pro": javaPoster, "html5-web": htmlPoster, "adca-diploma": adcaPoster, "python-ds": pythonPoster,
        "tally-essential": tallyPoster, "full-stack-dev": AdvancedProgramFullStackPoster, "dsa-master": DSAPoster,
        "prog-cpp": ProgrammingusingCProgramPoster, "dca-new": DiplomainComputerApplicationPoster,
        "found-it-new": FoundationinITPoster, "ms-office-basic": msofficePoster, "adv-excel-pro": AdvanceExcelPoster,
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

    const displayCourses = useMemo(() => {
        const featuredIds = ["java-pro", "html5-web", "adca-diploma", "python-ds", "tally-essential", "full-stack-dev", "dsa-master", "prog-cpp", "dca-new", "found-it-new", "ms-office-basic", "adv-excel-pro"];
        return activeSegment === "All" 
            ? techCoursesData.filter(c => featuredIds.includes(c.id))
            : techCoursesData.filter(course => course.segment === activeSegment);
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

    if (pageLoading) return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B132B]">
            <div className="relative flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-24 h-24 border-4 border-slate-800 border-t-[#F37021] border-r-[#1A5F7A] rounded-full" />
                <img src={expertcomputerlogo} className="absolute w-12 h-auto object-contain" alt="Logo Loading" />
            </div>
        </div>
    );

    return (
        <div ref={targetRef} className="relative min-h-screen bg-[#FAF9F6] text-slate-900 antialiased font-sans overflow-x-hidden selection:bg-[#F37021]/20 selection:text-[#F37021]">
            
            {/* BACKGROUND BLUR DECORATIONS */}
            <div className="hidden md:block absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-orange-200/20 to-teal-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="hidden md:block absolute top-[40%] right-0 w-[400px] h-[600px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                
                {/* BACK TO TOP BUTTON */}
                <AnimatePresence>
                    {showBackToTop && (
                        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="fixed bottom-6 right-6 z-50 bg-[#1A5F7A] text-white p-3.5 rounded-full shadow-xl hover:bg-[#F37021] transition-colors focus:outline-none">
                            <FiChevronUp size={24} />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* 1. HERO SECTION */}
                <section className="pt-8 pb-12 md:pt-20 md:pb-16 lg:pt-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 bg-[#1A5F7A]/5 border border-[#1A5F7A]/10 text-[#1A5F7A] px-4 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide">
                                <FiShield className="text-base text-[#F37021]" /> ISO 9001:2015 & MSME Certified Group
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0F2C59] tracking-tight leading-[1.1]">
                                Build your <span className="text-[#F37021] relative inline-block">tech future<span className="absolute bottom-1 left-0 w-full h-[6px] bg-orange-200 -z-10 rounded-full" /></span> with clarity.
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Patna's premier destination for computing proficiency since 1987. Transition safely from zero engineering literacy to industry-ready deployment.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                                <button onClick={() => navigate('/about')} className="w-full sm:w-auto px-8 py-4 bg-[#1A5F7A] hover:bg-[#154F66] text-white font-bold rounded-xl shadow-lg shadow-teal-900/10 transition-all flex items-center justify-center gap-3 group">
                                    Explore Academy Path <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <a href="#signature-courses" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-sm text-center transition-colors">
                                    View Courses
                                </a>
                            </div>
                        </div>
                        <div className="lg:col-span-5 order-1 lg:order-2 w-full max-w-md lg:max-w-none mx-auto">
                            <PremiumTiltCard className="relative p-2">
                                <div className="rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white bg-white aspect-square md:aspect-[4/3] lg:aspect-square">
                                    <OptimizedImage src={expertcomuteroffice} alt="Expert Academy Hub Front Office" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-[#0F2C59] text-white p-5 md:p-6 rounded-2xl shadow-xl border-4 border-white flex flex-col items-center min-w-[110px] md:min-w-[130px]">
                                    <span className="text-3xl md:text-4xl font-extrabold text-[#F37021] leading-none">1987</span>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold mt-1">Established</span>
                                </div>
                            </PremiumTiltCard>
                        </div>
                    </div>
                </section>
            </div>

            {/* --- INTEGRATED RUNNING TICKER BANNER --- */}
            {/* This spans full viewport width breaking container grid intentionally for dynamic premium aesthetic */}
            <div className="my-10 md:my-14">
                <RunningTicker />
            </div>

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* 2. LIVE WEBINAR NOTIFICATION (CONDITIONAL) */}
                {isWebinarActive && (
                    <section className="mb-16 md:mb-24">
                        <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
                            className="bg-gradient-to-br from-[#0F2C59] to-[#0A1D3A] rounded-2xl md:rounded-[2rem] p-6 md:p-10 lg:p-12 text-white relative overflow-hidden shadow-xl"
                        >
                            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F37021] blur-[120px] opacity-20 pointer-events-none" />
                            <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                                <div className="w-32 sm:w-40 lg:w-48 shrink-0 rounded-xl overflow-hidden shadow-md border-2 border-white/10 hidden sm:block">
                                    <OptimizedImage src={tallyBootcampPoster} alt="Tally Bootcamp Event Poster" className="w-full h-auto" />
                                </div>
                                <div className="flex-1 text-center lg:text-left space-y-4">
                                    <div className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        <FiZap className="animate-pulse text-[#F37021]" /> Live Skills Bootcamp
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                                        Accelerated Tally Masterclass Webinar
                                    </h2>
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-slate-300 font-medium">
                                        <span className="flex items-center gap-2"><FiCalendar className="text-[#F37021]" /> April 24, 2026</span>
                                        <span className="flex items-center gap-2"><FiClock className="text-[#F37021]" /> 03:00 PM IST Onwards</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                                        <button onClick={() => handleOpenModal(techCoursesData.find(c => c.id === 'tally-essential'))} className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                                            <FiBookOpen /> Track Curriculums
                                        </button>
                                        <button onClick={() => window.open('https://forms.gle/jPd53cxWSjje4Ssc7', '_blank')} className="w-full sm:w-auto px-5 py-3 bg-[#F37021] hover:bg-orange-600 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-md transition-colors flex items-center justify-center gap-2">
                                            Claim Secure Spot <FiExternalLink />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* 3. SEGMENT SELECTION FILTER */}
                <section className="mb-12 md:mb-16">
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
                            Personalized Program Segments
                        </h2>
                        <p className="text-slate-600 mt-2 text-sm md:text-base">
                            Select an ecosystem track tailored specifically to your current professional or academic standing.
                        </p>
                    </div>

                    <div className="flex items-center lg:justify-center gap-2 overflow-x-auto pb-4 pt-2 mask-linear-right lg:overflow-visible no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        <button 
                            onClick={() => setActiveSegment("All")}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 border ${
                                activeSegment === "All" 
                                ? "bg-[#1A5F7A] text-white border-[#1A5F7A] shadow-md" 
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            }`}
                        >
                            All Specialized Tracks
                        </button>
                        {categories.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveSegment(cat.segment)}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 border flex items-center gap-2 ${
                                    activeSegment === cat.segment 
                                    ? "bg-[#1A5F7A] text-white border-[#1A5F7A] shadow-md" 
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                <span className={activeSegment === cat.segment ? "text-[#F37021]" : "text-slate-400"}>{cat.icon}</span>
                                {cat.title}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 4. SIGNATURE COURSES CATALOG GRID */}
                <section id="signature-courses" className="pb-20 md:pb-28 scroll-mt-6">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-8">
                        <h3 className="text-lg md:text-xl font-bold text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F37021]" />
                            {activeSegment === "All" ? "Core Featured Programs" : `${activeSegment} Modules`}
                        </h3>
                        {activeSegment !== "All" && (
                            <button onClick={() => setActiveSegment("All")} className="text-xs md:text-sm font-bold text-[#1A5F7A] hover:text-[#F37021] flex items-center gap-1.5 transition-colors">
                                <FiGrid /> Reset Filters
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                        <AnimatePresence mode="popLayout">
                            {displayCourses.map((course) => (
                                <motion.div
                                    layout
                                    key={course.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => handleOpenModal(course)}
                                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer flex flex-col h-full"
                                >
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                                        <OptimizedImage src={posterMap[course.id] || javaPoster} alt={`${course.title} Syllabus Catalog Cover`} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="p-5 flex flex-col flex-1 justify-between bg-white">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#F37021]">
                                                {course.duration || "Certified Module"}
                                            </span>
                                            <h4 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-[#1A5F7A] transition-colors leading-snug line-clamp-2">
                                                {course.title}
                                            </h4>
                                        </div>
                                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-[#F37021] transition-colors">
                                            <span>View Full Syllabus</span>
                                            <FiArrowRight className="transform -rotate-45 group-hover:rotate-0 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>

                {/* 5. SEGMENT INFRASTRUCTURE SUMMARY CARDS */}
                <section className="py-16 bg-[#0F2C59] mx-[-1rem] sm:mx-[-1.5rem] md:mx-0 px-6 sm:px-10 md:px-12 lg:px-16 rounded-2xl md:rounded-[2.5rem] text-white shadow-xl mb-24 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#1A5F7A]/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="max-w-2xl mb-12">
                        <span className="text-xs uppercase font-bold tracking-widest text-[#F37021] block mb-2">Structure Matrix</span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Structured Learning Ecosystem</h2>
                        <p className="text-slate-300 mt-2 text-sm md:text-base">
                            Click individual track profiles to auto-filter and reveal active certifications matching that category above.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((cat, idx) => (
                            <div 
                                key={idx}
                                onClick={() => { 
                                    setActiveSegment(cat.segment); 
                                    document.getElementById('signature-courses')?.scrollIntoView({ behavior: 'smooth' }); 
                                }}
                                className={`bg-white/5 border rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer group flex flex-col justify-between ${
                                    activeSegment === cat.segment ? "border-[#F37021] bg-white/10" : "border-white/10"
                                }`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-2xl text-[#F37021] bg-white/10 p-3 rounded-lg group-hover:scale-105 transition-transform">
                                            {cat.icon}
                                        </div>
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                                            <img src={cat.image} className="w-full h-full object-cover" alt="" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold tracking-wide">{cat.title}</h3>
                                        <p className="text-sm text-slate-300 mt-1 leading-relaxed font-normal">{cat.desc}</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5 text-xs font-bold text-[#F37021] flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                    Browse Active Modules <FiArrowRight />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. ALUMNI PLACEMENT REVIEWS */}
                <section className="pb-20 md:pb-28">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-xs uppercase font-bold tracking-widest text-[#F37021] block mb-2">Verified Feedback</span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0F2C59]">Alumni Placement Verification</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {alumniData.map((student, idx) => (
                            <div key={idx} className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="space-y-4">
                                    <div className="flex text-amber-500 gap-0.5">
                                        {[...Array(5)].map((_, i) => <FiStar key={i} className="fill-current text-xs" />)}
                                    </div>
                                    <p className="text-slate-600 text-sm md:text-base leading-relaxed italic">
                                        "{student.text}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 border-t border-slate-100 pt-6 mt-6">
                                    <img src={student.image} className="w-11 h-11 rounded-full object-cover bg-slate-50 border border-slate-200 shadow-sm" alt={student.name} />
                                    <div>
                                        <span className="block font-bold text-slate-900 text-sm">{student.name}</span>
                                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                            {student.role} • <FiCheckCircle className="text-teal-600 inline" /> Verified Track
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 7. MINIMAL SYSTEM FOOTER */}
                <footer className="border-t border-slate-200/60 py-12 text-center text-xs md:text-sm font-semibold tracking-widest text-slate-400 uppercase">
                    ESTD 1987 <span className="text-[#F37021] mx-2">•</span> PATNA HQ CORE CAMPUS DEVELOPMENT SYSTEMS
                </footer>
            </div>

            {/* SYLLABUS DISCLOSURE MODAL INTERFACE */}
            {selectedSyllabus && <SyllabusModal course={selectedSyllabus} onClose={handleCloseModal} />}
        </div>
    );
}