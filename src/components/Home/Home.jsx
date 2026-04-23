import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import {
    FiArrowRight, FiShield, FiBookOpen, FiAward, FiStar, 
    FiCode, FiCpu, FiLayers, FiZap, FiChevronUp, FiLoader, FiCalendar, FiClock, FiCheckCircle, FiExternalLink, FiGrid
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

// --- UI HELPERS ---
const TiltCard = ({ children, className }) => {
    const x = useSpring(0, { stiffness: 150, damping: 20 });
    const y = useSpring(0, { stiffness: 150, damping: 20 });
    const handleMouse = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
        x.set(mouseX * 15); y.set(mouseY * -15);
    };
    const handleLeave = () => { x.set(0); y.set(0); };
    return (
        <motion.div onMouseMove={handleMouse} onMouseLeave={handleLeave}
            style={{ rotateY: x, rotateX: y, transformStyle: "preserve-3d" }}
            className={className}>{children}</motion.div>
    );
};

const OptimizedImage = ({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
            {!isLoaded && <div className="absolute inset-0 flex items-center justify-center bg-slate-200 animate-pulse"><FiLoader className="text-[#F37021] animate-spin" /></div>}
            <img src={src} alt={alt} onLoad={() => setIsLoaded(true)} className={`transition-opacity duration-700 ${className} ${isLoaded ? "opacity-100" : "opacity-0"}`} loading="lazy" />
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

    // Webinar Auto-Expiry
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
        { title: "School Students", segment: "School Students", desc: "Foundation coding", image: schoolImg },
        { title: "College Students", segment: "College Students", desc: "Advanced tech skills", image: collegeImg },
        { title: "Graduates", segment: "Graduates", desc: "Career-ready Master's", image: graduatesImg },
        { title: "Working Professionals", segment: "Working Professionals", desc: "Upskill with AI", image: workingImg },
        { title: "Home Makers", segment: "Home Makers", desc: "Digital literacy", image: homemakerImg },
        { title: "Retired Persons", segment: "Retired Persons", desc: "Stay tech-savvy", image: retiredImg },
    ], []);

    const alumniData = useMemo(() => [
        { name: "Suruchi Rai", text: "Mastered HTML5 at Expert Academy. Now a successful Web Developer.", image: suruchiImg },
        { name: "Harsh Raj", text: "The ADCA program changed my career path completely. Highly recommended!", image: harshImg },
        { name: "Ankit Shubham", text: "The Gen-AI curriculum is world-class and perfectly aligned with 2026 trends.", image: ankitImg }
    ], []);

    const displayCourses = useMemo(() => {
        const featuredIds = ["java-pro", "html5-web", "adca-diploma", "python-ds", "tally-essential", "full-stack-dev", "dsa-master", "prog-cpp", "dca-new", "found-it-new", "ms-office-basic", "adv-excel-pro"];
        return activeSegment === "All" 
            ? techCoursesData.filter(c => featuredIds.includes(c.id))
            : techCoursesData.filter(course => course.segment === activeSegment);
    }, [activeSegment]);

    useEffect(() => {
        if (pageLoading) {
            const timer = setTimeout(() => { setPageLoading(false); sessionStorage.setItem("hasSeenHomeLoader", "true"); }, 1500);
            return () => clearTimeout(timer);
        }
    }, [pageLoading]);

    const handleOpenModal = (course) => setSearchParams({ course: course.id });
    const handleCloseModal = () => setSearchParams({});

    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 600);
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
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-32 h-32 border-2 border-slate-100 border-t-[#F37021] border-r-[#1A5F7A] rounded-full" />
            <motion.img src={expertcomputerlogo} className="absolute w-24 h-auto" />
        </div>
    );

    return (
        <div ref={targetRef} className="relative min-h-screen bg-slate-50/20 selection:bg-[#F37021] selection:text-white font-sans overflow-x-hidden">
            <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
                
                <AnimatePresence>
                    {showBackToTop && (
                        <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="fixed bottom-10 right-10 z-50 bg-[#F37021] text-white p-5 rounded-full shadow-2xl hover:bg-[#1A5F7A] transition-all">
                            <FiChevronUp size={28} />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* 1. HERO SECTION */}
                <section className="py-16 md:py-28 relative">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 space-y-10 text-center lg:text-left order-2 lg:order-1">
                            <div className="inline-flex items-center gap-4 bg-orange-50 text-[#F37021] px-8 py-3 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] border border-orange-100 shadow-sm">
                                <FiShield className="text-2xl" /> ISO 9001:2015 & MSME Certified
                            </div>
                            <h1 className="text-7xl md:text-9xl font-black text-[#1A5F7A] leading-[0.82] tracking-tighter">
                                BUILD YOUR <span className="text-[#F37021] italic">FUTURE</span> <br /> IN TECH.
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-500/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                Patna's most trusted computer academy since 1987. Mastering 100% practical learning for the AI-driven world.
                            </p>
                            <div className="flex justify-center lg:justify-start pt-6">
                                <button onClick={() => navigate('/about')} className="bg-[#1A5F7A] text-white px-14 py-7 rounded-[2rem] font-black hover:bg-[#F37021] transition-all duration-500 shadow-2xl uppercase text-[14px] tracking-[0.3em] group flex items-center gap-5">
                                    Launch Journey <FiArrowRight className="group-hover:translate-x-3 transition-transform text-2xl" />
                                </button>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 order-1 lg:order-2">
                            <TiltCard className="relative p-4 md:p-8">
                                <div className="rounded-[4.5rem] overflow-hidden shadow-3xl border-[15px] border-white relative z-10 bg-white">
                                    <OptimizedImage src={expertcomuteroffice} alt="Campus" className="w-full aspect-square object-cover" />
                                </div>
                                <div className="absolute -bottom-4 -right-4 md:-bottom-10 md:-right-10 z-20 bg-[#1A5F7A] text-white p-10 md:p-14 rounded-[4rem] shadow-3xl border-[8px] border-white text-center">
                                    <span className="block font-black text-6xl md:text-8xl italic leading-none text-[#F37021]">38+</span>
                                    <span className="text-[12px] uppercase font-black tracking-[0.3em] text-white/80 mt-4">Years Hub</span>
                                </div>
                            </TiltCard>
                        </div>
                    </div>
                </section>

                {/* 2. WEBINAR BANNER (CONDITIONAL) */}
                {isWebinarActive && (
                    <section className="py-12 mb-20">
                        <motion.div initial={{ y: 80, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
                            className="bg-slate-900 rounded-[5rem] p-10 md:p-16 flex flex-col lg:flex-row items-center gap-14 relative overflow-hidden border border-white/10 shadow-2xl group"
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F37021] blur-[160px] opacity-20" />
                            <div className="w-full lg:w-1/4 rounded-[3rem] overflow-hidden shadow-3xl border-[6px] border-white/20 transform rotate-[-3deg] group-hover:rotate-0 transition-transform duration-700">
                                <OptimizedImage src={tallyBootcampPoster} className="w-full h-auto" />
                            </div>
                            <div className="flex-1 text-center lg:text-left space-y-8 relative z-10">
                                <div className="inline-flex items-center gap-3 bg-red-600 text-white px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-[0.1em] animate-pulse">
                                    <FiZap /> Live Exclusive Webinar
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] italic">
                                    TALLY <span className="text-[#F37021]">BOOTCAMP</span> <br /> 24 APRIL 2026
                                </h2>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-10 text-blue-100/70 font-black uppercase text-[14px] tracking-widest">
                                    <div className="flex items-center gap-4"><FiCalendar className="text-[#F37021] text-3xl"/> April 24 (Fri)</div>
                                    <div className="flex items-center gap-4"><FiClock className="text-[#F37021] text-3xl"/> 3:00 PM IST</div>
                                </div>
                                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                    <button 
                                        onClick={() => handleOpenModal(techCoursesData.find(c => c.id === 'tally-essential'))}
                                        className="bg-white/10 border border-white/20 text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-3 hover:bg-white hover:text-slate-900 transition-all shadow-xl"
                                    >
                                        <FiBookOpen /> Course Details
                                    </button>
                                    <button 
                                        onClick={() => window.open('https://forms.gle/jPd53cxWSjje4Ssc7', '_blank')}
                                        className="bg-[#F37021] text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-3 hover:bg-[#1A5F7A] transition-all shadow-2xl"
                                    >
                                        Register Now <FiExternalLink />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* 3. SIGNATURE COURSES CATALOG (FIXED: Reset Button added) */}
                <section id="signature-courses" className="py-24 scroll-mt-20">
                    <div className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
                        <div>
                            <p className="text-[#F37021] font-black uppercase text-[12px] tracking-[0.5em] mb-6 underline decoration-[6px] underline-offset-[12px]">
                                {activeSegment === "All" ? "Elite Tracks" : `${activeSegment} Specialties`}
                            </p>
                            <h2 className="text-6xl md:text-8xl font-black text-[#1A5F7A] tracking-tighter uppercase italic leading-none">Signature <span className="text-slate-300">Courses.</span></h2>
                        </div>
                        
                        {/* --- THE FIX: VIEW ALL BUTTON --- */}
                        {activeSegment !== "All" && (
                            <motion.button 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                onClick={() => setActiveSegment("All")}
                                className="flex items-center gap-3 bg-white border-2 border-slate-100 px-8 py-4 rounded-2xl text-[11px] font-black text-[#1A5F7A] uppercase tracking-widest hover:border-[#F37021] hover:text-[#F37021] transition-all shadow-sm active:scale-95"
                            >
                                <FiGrid /> View All Courses
                            </motion.button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                        {displayCourses.map((course) => (
                            <TiltCard key={course.id} className="relative aspect-[3/4] rounded-[3.5rem] overflow-hidden group cursor-pointer shadow-2xl bg-white border border-slate-100">
                                <div onClick={() => handleOpenModal(course)} className="w-full h-full relative">
                                    <OptimizedImage src={posterMap[course.id] || javaPoster} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A5F7A] via-[#1A5F7A]/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-0 left-0 p-10 space-y-4">
                                        <h3 className="text-white text-2xl font-black leading-tight uppercase italic">{course.title}</h3>
                                        <div className="flex items-center gap-4 text-orange-400 text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                            <FiBookOpen className="text-xl"/> Full Details
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                </section>

                {/* 4. ACADEMIC ECOSYSTEM SEGMENTS */}
                <section className="py-28 bg-[#0A192F] mx-[-1rem] md:mx-[-2rem] px-10 md:px-20 rounded-[5rem] text-white shadow-3xl relative overflow-hidden">
                    <div className="text-center mb-24 relative z-10">
                        <h2 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter mb-6 leading-none">Learning <span className="text-[#F37021]">Segments</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                        {categories.map((cat, i) => (
                            <motion.div key={i} whileHover={{ y: -15 }} 
                                onClick={() => { setActiveSegment(cat.segment); document.getElementById('signature-courses').scrollIntoView({ behavior: 'smooth' }); }}
                                className={`bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[4rem] group cursor-pointer transition-all hover:bg-white/10 ${activeSegment === cat.segment ? 'ring-4 ring-[#F37021]' : ''}`}>
                                <div className="flex items-center gap-8 mb-10">
                                    <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-[#F37021]"><OptimizedImage src={cat.image} className="w-full h-full object-cover" /></div>
                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">{cat.title}</h3>
                                </div>
                                <p className="text-blue-100/60 text-xl leading-relaxed mb-12 font-medium">"{cat.desc}"</p>
                                <div className="py-6 text-center bg-[#F37021] rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] group-hover:bg-white group-hover:text-slate-900 transition-all shadow-lg">Explore Track</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 5. ALUMNI VOICES */}
                <section className="py-32 bg-white">
                    <div className="text-center mb-24">
                        <p className="text-[#F37021] font-black uppercase text-[12px] tracking-[0.5em] mb-4 underline decoration-[6px] underline-offset-[12px]">Proven Success</p>
                        <h2 className="text-6xl md:text-8xl font-black text-[#1A5F7A] uppercase tracking-tighter italic">Alumni <span className="text-slate-300">Voices.</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {alumniData.map((student, i) => (
                            <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-slate-50/50 p-14 rounded-[4rem] border border-slate-100 flex flex-col justify-between shadow-sm">
                                <p className="text-slate-600 text-xl italic mb-12 leading-relaxed font-medium">"{student.text}"</p>
                                <div className="flex items-center gap-6 border-t border-slate-200 pt-10">
                                    <img src={student.image} className="w-20 h-20 rounded-full shadow-2xl border-4 border-white" alt={student.name} />
                                    <div className="text-left">
                                        <span className="block font-black text-[#1A5F7A] uppercase text-xl italic">{student.name}</span>
                                        <span className="text-[10px] font-black text-[#F37021] uppercase tracking-[0.3em] flex items-center gap-2"><FiCheckCircle /> Verified Alumnus</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 6. LEGACY FOOTER */}
                <footer className="py-32 text-center">
                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-slate-300 font-black italic uppercase tracking-[1em] text-2xl">
                        ESTD 1987 <span className="text-[#F37021] mx-6">•</span> PATNA HQ
                    </motion.p>
                </footer>
            </div>

            {selectedSyllabus && <SyllabusModal course={selectedSyllabus} onClose={handleCloseModal} />}
        </div>
    );
}