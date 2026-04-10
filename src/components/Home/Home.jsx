import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
    FiArrowRight, FiShield, FiBookOpen, FiAward, FiStar, 
    FiCode, FiCpu, FiLayers, FiZap, FiChevronUp, FiLoader
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
import msofficePoster from '../../assets/posters/MSOffice.jpeg';
import AdvanceExcelPoster from '../../assets/posters/AdvanceExcel.jpeg';

const OptimizedImage = ({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-200 animate-pulse">
                    <FiLoader className="text-[#F37021] animate-spin" />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                className={`transition-opacity duration-700 ${className} ${isLoaded ? "opacity-100" : "opacity-0"}`}
                loading="lazy"
            />
        </div>
    );
};

const BrandItem = ({ icon, text }) => (
    <div className="flex items-center gap-4 group cursor-default px-8">
        <div className="bg-slate-50 p-2.5 rounded-xl group-hover:bg-orange-50 transition-colors">
            {icon ? React.cloneElement(icon, { className: "text-[#F37021] text-2xl" }) : <FiStar className="text-orange-300" />}
        </div>
        <span className="text-xl md:text-3xl font-black text-slate-300 group-hover:text-[#1A5F7A] transition-all tracking-tighter uppercase italic select-none">
            {text}
        </span>
    </div>
);

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [pageLoading, setPageLoading] = useState(() => !sessionStorage.getItem("hasSeenHomeLoader"));
    const [selectedSyllabus, setSelectedSyllabus] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [activeSegment, setActiveSegment] = useState("All"); 

    const targetRef = useRef(null);

    // Image Map to handle dynamic imports correctly
    const posterMap = useMemo(() => ({
        "java-pro": javaPoster,
        "html5-web": htmlPoster,
        "adca-diploma": adcaPoster,
        "python-ds": pythonPoster,
        "tally-essential": tallyPoster,
        "full-stack-dev": AdvancedProgramFullStackPoster,
        "dsa-master": DSAPoster,
        "prog-cpp": ProgrammingusingCProgramPoster,
        "dca-new": DiplomainComputerApplicationPoster,
        "found-it-new": FoundationinITPoster,
        "ms-office-basic": msofficePoster,
        "adv-excel-pro": AdvanceExcelPoster,
    }), []);

    const displayCourses = useMemo(() => {
        if (activeSegment === "All") {
            const featuredIds = ["java-pro", "html5-web", "adca-diploma", "python-ds", "tally-essential", "full-stack-dev", "dsa-master", "prog-cpp", "dca-new", "found-it-new"];
            return techCoursesData.filter(c => featuredIds.includes(c.id));
        }
        return techCoursesData.filter(course => course.segment === activeSegment);
    }, [activeSegment]);

    const alumniData = useMemo(() => [
        { name: "Suruchi Rai", text: "Mastered HTML5 at Expert Academy. Now a Web Dev.", image: suruchiImg },
        { name: "Harsh Raj", text: "ADCA changed my career path completely.", image: harshImg },
        { name: "Ankit Shubham", text: "Gen-AI ready curriculum is world-class.", image: ankitImg }
    ], []);

    const categories = useMemo(() => [
        { title: "School Students", segment: "School Students", desc: "Foundation coding", image: schoolImg },
        { title: "College Students", segment: "College Students", desc: "Advanced tech skills", image: collegeImg },
        { title: "Graduates", segment: "Graduates", desc: "Career-ready Master's", image: graduatesImg },
        { title: "Working Professionals", segment: "Working Professionals", desc: "Upskill with AI", image: workingImg },
        { title: "Home Makers", segment: "Home Makers", desc: "Digital literacy", image: homemakerImg },
        { title: "Retired Persons", segment: "Retired Persons", desc: "Stay tech-savvy", image: retiredImg },
    ], []);

    useEffect(() => {
        if (pageLoading) {
            const timer = setTimeout(() => {
                setPageLoading(false);
                sessionStorage.setItem("hasSeenHomeLoader", "true");
            }, 1500); 
            return () => clearTimeout(timer);
        }
    }, [pageLoading]);

    const courseIdFromUrl = searchParams.get("course");
    useEffect(() => {
        if (courseIdFromUrl) {
            const course = techCoursesData.find(c => c.id === courseIdFromUrl);
            if (course) setSelectedSyllabus(course);
        } else setSelectedSyllabus(null);
    }, [courseIdFromUrl]);

    const handleOpenModal = (course) => setSearchParams({ course: course.id });
    const handleCloseModal = () => setSearchParams({});

    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 600);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

    if (pageLoading) return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
            <div className="relative mb-8">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-32 h-32 md:w-40 md:h-40 border-[2px] border-slate-100 border-t-[#F37021] border-r-[#1A5F7A] rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={expertcomputerlogo} alt="Expert Academy" className="w-full h-auto object-contain" />
                </div>
            </div>
            <div className="text-center">
                <h2 className="text-[#1A5F7A] font-black tracking-[0.4em] uppercase text-[10px] md:text-xs">Expert Computer Academy</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">ESTD 1987</p>
            </div>
        </div>
    );

    return (
        <div ref={targetRef} className="mx-auto w-full max-w-7xl px-4 md:px-6 font-sans text-slate-900 bg-white overflow-x-hidden relative selection:bg-[#F37021] selection:text-white">
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="fixed bottom-8 right-8 z-50 bg-[#F37021] text-white p-4 rounded-full shadow-2xl hover:bg-[#1A5F7A] transition-all">
                        <FiChevronUp size={24} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* 1. HERO SECTION */}
            <section className="py-12 md:py-20 relative">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left order-2 lg:order-1">
                        <div className="inline-flex items-center gap-3 bg-orange-50 text-[#F37021] px-6 py-2.5 rounded-full text-[13px] md:text-sm font-black uppercase tracking-[0.1em] border border-orange-100 shadow-sm transition-transform hover:scale-105">
                            <FiShield className="text-lg" /> ISO 9001:2015 Certified & MSME Certified
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-[#1A5F7A] leading-[0.95] tracking-tighter">
                            Build Your <span className="text-[#F37021] italic">Future</span> <br /> In Technology
                        </h1>
                        <p className="text-base md:text-lg text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                            Patna's most trusted computer academy since 1987. Mastering 100% practical learning for the AI-driven world.
                        </p>
                        <div className="flex justify-center lg:justify-start pt-4">
                            <button onClick={() => navigate('/about')} className="bg-[#1A5F7A] text-white px-10 py-5 rounded-2xl font-black hover:bg-[#F37021] transition-all duration-500 flex items-center justify-center gap-3 shadow-lg uppercase text-[12px] tracking-[0.2em] group">
                                Start Your Journey <FiArrowRight className="group-hover:translate-x-2 transition-transform text-lg"/>
                            </button>
                        </div>
                    </div>
                    <motion.div style={{ opacity: heroOpacity }} className="w-full lg:w-1/2 order-1 lg:order-2">
                        <div className="relative pb-8 pr-8"> 
                            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-[10px] border-white relative group z-10">
                                <OptimizedImage src={expertcomuteroffice} alt="Campus" className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
                            </div>
                            <motion.div animate={{ scale: [1, 1.05, 1], boxShadow: ["0px 10px 30px rgba(0,0,0,0.1)", "0px 15px 45px rgba(243,112,33,0.2)", "0px 10px 30px rgba(0,0,0,0.1)"] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="absolute bottom-0 right-0 z-20 bg-[#1A5F7A] text-white p-5 md:p-7 rounded-3xl shadow-2xl flex flex-col items-center transform translate-x-1/3 translate-y-1/3 border-4 border-white">
                                <span className="font-black text-3xl md:text-5xl italic leading-none text-[#F37021]">38+</span>
                                <span className="text-[9px] md:text-[11px] uppercase font-black tracking-widest text-white mt-1 whitespace-nowrap">Years Legacy</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. GEN-AI SECTION */}
            <section id="gen-ai-course" className="py-12 scroll-mt-24">
                <div className="bg-slate-900 rounded-[3rem] overflow-hidden relative border border-white/10 group shadow-2xl">
                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="w-full lg:w-1/2 p-10 md:p-20 space-y-8">
                            <div className="inline-flex items-center gap-2 bg-[#F37021] text-white px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tighter">
                                <FiZap className="animate-pulse" /> New Launch 2026
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.9] uppercase italic tracking-tighter">
                                <span className="text-[#F37021]">Advanced Diploma</span> <br />Program in Generative AI
                            </h2>
                            <p className="text-blue-100/60 text-base md:text-lg font-medium max-w-md leading-relaxed">Join our industry-first Gen-AI curriculum.</p>
                            <div className="flex flex-wrap gap-5 pt-4">
                                <button onClick={() => handleOpenModal(techCoursesData.find(c => c.id === 'gen-ai-master'))} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:bg-[#F37021] hover:text-white transition-all shadow-xl">
                                    <FiBookOpen /> View Syllabus
                                </button>
                                <button onClick={() => navigate('/registration', { state: { prefillCourse: 'gen-ai-master' } })} className="border border-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white/5 transition-all">Enroll Now</button>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 h-[350px] lg:h-[550px] relative overflow-hidden">
                            <OptimizedImage src={genAIPoster} alt="Gen AI" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. INFINITE TECH SLIDER */}
            <section className="py-10 bg-white border-y border-slate-100 relative overflow-hidden">
                <motion.div className="flex whitespace-nowrap gap-16 md:gap-24 items-center w-max" animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }}>
                    {[0, 1].map((idx) => (
                        <div key={`slider-group-${idx}`} className="flex gap-16 md:gap-24 items-center pr-16 md:pr-24">
                            <BrandItem icon={<FiCode />} text="React.js" />
                            <BrandItem icon={<FiCpu />} text="Python AI" />
                            <BrandItem icon={<FiLayers />} text="Full Stack" />
                            <BrandItem text="Java Pro" />
                            <BrandItem text="MySQL" />
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* 4. UNIVERSITY TRACKS */}
            <section id="university-programs" className="py-16 bg-slate-50/50 mx-0 md:-mx-4 px-6 md:px-12 rounded-[3rem] overflow-hidden scroll-mt-20">
                <div className="mb-12"><p className="text-[#F37021] font-black uppercase text-[11px] tracking-[0.3em] mb-3">Higher Education</p>
                <h2 className="text-4xl md:text-5xl font-black text-[#1A5F7A] uppercase tracking-tighter italic leading-none">University Degree</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {universityPrograms.map((program) => (
                        <div key={program.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between group">
                            <div><div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-50 transition-colors"><FiAward className="text-3xl text-[#1A5F7A]" /></div>
                            <h3 className="text-2xl font-black text-[#1A5F7A] uppercase tracking-tighter mb-2 leading-tight">{program.title}</h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">{program.university}</p></div>
                            <button onClick={() => navigate('/registration', { state: { prefillCourse: program.id } })} className="w-full py-4 bg-[#1A5F7A] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-[#F37021] transition-all shadow-lg active:scale-95">Apply Now</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. SIGNATURE COURSES (FILTERED) */}
            <section id="signature-courses" className="py-16 overflow-hidden scroll-mt-20 px-4 md:px-0">
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <p className="text-[#F37021] font-black uppercase text-[11px] tracking-[0.3em] mb-3">{activeSegment === "All" ? "Our Expertise" : activeSegment}</p>
                        <h2 className="text-4xl md:text-5xl font-black text-[#1A5F7A] uppercase tracking-tighter italic leading-none">Signature Courses</h2>
                    </div>
                    {activeSegment !== "All" && (
                        <button onClick={() => setActiveSegment("All")} className="text-[10px] font-bold uppercase text-[#F37021] hover:underline">View All</button>
                    )}
                </div>
                <AnimatePresence mode="wait">
                    <motion.div key={activeSegment} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                        {displayCourses.map((course) => (
                            <div key={`course-${course.id}`} onClick={() => handleOpenModal(course)} className="group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-xl aspect-[4/5] bg-slate-50 transition-all duration-500 hover:-translate-y-2">
                                <OptimizedImage src={posterMap[course.id] || javaPoster} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6 text-left">
                                    <h3 className="text-white text-sm md:text-lg font-black uppercase tracking-tight leading-tight mb-2">{course.title}</h3>
                                    <div className="text-orange-400 text-[10px] font-black flex items-center gap-2 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"><FiBookOpen /> View Syllabus</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </section>

            {/* 6. ACADEMIC ECOSYSTEM */}
            <section className="py-20 bg-[#0A192F] mx-0 md:-mx-4 px-6 md:px-12 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
                <div className="text-center mb-16 relative z-10">
                    <p className="text-[#F37021] font-black uppercase text-[11px] tracking-[0.4em] mb-4">Life at Academy</p>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">Academic Ecosystem</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 px-4">
                    {categories.map((cat, index) => (
                        <div key={`cat-${index}`} onClick={() => { setActiveSegment(cat.segment); document.getElementById('signature-courses').scrollIntoView({ behavior: 'smooth' }); }}
                            className={`bg-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/10 p-10 flex flex-col justify-between hover:bg-white/10 transition-all duration-500 group cursor-pointer ${activeSegment === cat.segment ? 'ring-2 ring-[#F37021]' : ''}`}>
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20"><OptimizedImage src={cat.image} className="w-full h-full object-cover" alt={cat.title} /></div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">{cat.title}</h3>
                            </div>
                            <p className="text-blue-100/60 text-sm leading-relaxed mb-8 italic font-medium">"{cat.desc}"</p>
                            <div className="w-full py-4 bg-[#F37021] text-center text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl group-hover:bg-white group-hover:text-slate-900 transition-all">Explore Segment</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. ALUMNI VOICES */}
            <section id="alumni-voices" className="py-24 bg-white">
                <div className="text-center mb-16">
                    <p className="text-[#F37021] font-black uppercase text-[11px] tracking-[0.4em] mb-4">Student Stories</p>
                    <h2 className="text-4xl md:text-6xl font-black text-[#1A5F7A] uppercase tracking-tighter italic">Alumni <span className="text-[#F37021]">Voices</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4">
                    {alumniData.map((student, i) => (
                        <motion.div key={`alumni-card-${i}`} whileHover={{ y: -12 }} className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-2xl transition-all duration-500">
                            <p className="text-slate-600 text-lg italic mb-10 leading-relaxed font-medium">"{student.text}"</p>
                            <div className="flex items-center gap-5 border-t border-slate-200 pt-8">
                                <img src={student.image} className="w-16 h-16 rounded-full shadow-lg" alt={student.name} />
                                <div className="text-left">
                                    <span className="block font-black text-[#1A5F7A] uppercase text-base">{student.name}</span>
                                    <span className="text-[10px] font-bold text-[#F37021] uppercase tracking-[0.2em]">Verified Alumnus</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {selectedSyllabus && <SyllabusModal course={selectedSyllabus} onClose={handleCloseModal} />}
        </div>
    );
}