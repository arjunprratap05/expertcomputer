import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    FiArrowRight, FiShield, FiBookOpen, FiAward, FiCheckCircle, FiStar, 
    FiCode, FiCpu, FiLayers, FiZap
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
import gauravImg from "../../assets/student-gaurav.jpeg";
import ankitImg from "../../assets/student-ankit.jpeg";
import tallyPoster from "../../assets/posters/Tally.jpeg";
import genAIPoster from "../../assets/posters/GenerativeAI.jpeg"; 

const BrandItem = ({ icon, text }) => (
    <div className="flex items-center gap-3 md:gap-4 group cursor-default">
        <div className="bg-slate-50 p-2 md:p-2.5 rounded-xl group-hover:bg-orange-50 transition-colors">
            {icon || <FiStar className="text-orange-300" />}
        </div>
        <span className="text-xl md:text-3xl font-black text-slate-300 group-hover:text-[#1A5F7A] transition-all tracking-tighter uppercase italic select-none">
            {text}
        </span>
    </div>
);

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedSyllabus, setSelectedSyllabus] = useState(null);
    const targetRef = useRef(null);

    // --- 1. SYNC SCROLL LOGIC ---
    useEffect(() => {
        if (!location.state?.targetId) {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        } else {
            const timer = setTimeout(() => {
                const element = document.getElementById(location.state.targetId);
                if (element) {
                    const headerOffset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
                window.history.replaceState({}, document.title);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [location.pathname, location.state]);

    // --- 2. DATA SELECTORS ---
    const genAiData = techCoursesData.find(c => c.id === 'gen-ai-master');
    
    const featuredPosters = [
        { title: "Java Programming", image: javaPoster, id: "java-pro" },
        { title: "HTML5 Web", image: htmlPoster, id: "html5-web" },
        { title: "ADCA Diploma", image: adcaPoster, id: "adca-diploma" },
        { title: "Python & DS", image: pythonPoster, id: "python-ds" },
        { title: "Tally Essential", image: tallyPoster, id: "tally-essential" }
    ];

    const alumniSuccess = [
        { name: "Suruchi Rai", text: "Mastered HTML5 at Expert Academy. Now a Web Dev.", image: suruchiImg },
        { name: "Harsh Raj", text: "ADCA changed my career path completely.", image: harshImg },
        { name: "Ankit Shubham", text: "Gen-AI ready curriculum is world-class.", image: ankitImg }
    ];

    const categories = [
        { title: "School Students", desc: "Foundation coding.", image: schoolImg },
        { title: "College Students", desc: "Advanced tech skills.", image: collegeImg },
        { title: "Graduates", desc: "Career-ready Master's.", image: graduatesImg },
        { title: "Working Professionals", desc: "Upskill with AI.", image: workingImg },
        { title: "Home Makers", desc: "Digital literacy.", image: homemakerImg },
        { title: "Retired Persons", desc: "Stay tech-savvy.", image: retiredImg },
    ];

    const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

    return (
        <div ref={targetRef} className="mx-auto w-full max-w-7xl px-4 md:px-6 font-sans text-slate-900 bg-white overflow-x-hidden relative">

            {/* 1. HERO SECTION */}
            <section className="py-6 md:py-10 overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="w-full lg:w-1/2 space-y-5 text-center lg:text-left order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 bg-orange-50 text-[#F37021] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <FiShield /> ISO 9001:2015 Certified
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#1A5F7A] leading-tight">
                            Build Your <span className="text-[#F37021] italic">Future</span> In Tech.
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            Patna's legacy academy since 1987. Traditional excellence meets Gen-AI innovation. 
                        </p>
                        <div className="flex justify-center lg:justify-start pt-2">
                            <button onClick={() => navigate('/about')} className="bg-[#1A5F7A] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#F37021] transition-all flex items-center justify-center gap-2 shadow-lg uppercase text-[11px] tracking-widest group">
                                Start Your Journey <FiArrowRight className="group-hover:translate-x-1 transition-transform"/>
                            </button>
                        </div>
                    </div>
                    <motion.div style={{ opacity: heroOpacity }} className="w-full lg:w-1/2 order-1 lg:order-2">
                        <div className="relative p-2">
                            <img src={expertcomuteroffice} alt="Office" className="rounded-[1.5rem] md:rounded-[2rem] shadow-xl w-full object-cover aspect-video bg-slate-100" loading="eager" />
                            <div className="absolute -bottom-3 -right-1 md:-bottom-4 md:-right-2 bg-[#1A5F7A] text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl flex flex-col items-center">
                                <span className="font-black text-xl md:text-2xl leading-none">38+</span>
                                <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-tighter text-center mt-1">Years Legacy</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. GEN-AI LAUNCH SECTION (WITH PRICING) */}
            <section id="gen-ai-course" className="py-10 scroll-mt-24">
                <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden relative border border-white/10 group shadow-2xl">
                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="w-full lg:w-1/2 p-8 md:p-16 space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 bg-[#F37021] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                    <FiZap className="animate-pulse" /> New Launch 2026
                                </div>
                                <div className="inline-flex items-center gap-2 bg-white/10 text-orange-300 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                   ₹{genAiData?.fee || "42,500"}/-
                                </div>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase italic tracking-tighter">
                                Master <span className="text-[#F37021]">Generative AI</span> From Scratch.
                            </h2>
                            <p className="text-blue-100/60 text-sm md:text-base font-medium max-w-md leading-relaxed">
                                Unlock the future. Create, Innovate, and Earn with our industry-leading Gen-AI Master Curriculum.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <button 
                                    onClick={() => setSelectedSyllabus(genAiData)}
                                    className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-[#F37021] hover:text-white transition-all shadow-xl"
                                >
                                    <FiBookOpen /> View Syllabus
                                </button>
                                <button 
                                    onClick={() => navigate('/registration', { state: { prefillCourse: 'gen-ai-master' } })} 
                                    className="border border-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
                                >
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 h-[300px] lg:h-[500px] relative overflow-hidden">
                            <img 
                                src={genAIPoster} 
                                alt="Generative AI" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                loading="eager"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent lg:block hidden"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. INFINITE TECH SLIDER */}
            <section className="py-8 bg-white border-y border-slate-100 relative overflow-hidden">
                <motion.div 
                    className="flex whitespace-nowrap gap-12 md:gap-16 items-center w-max"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                >
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex gap-12 md:gap-16 items-center pr-12 md:pr-16">
                            <BrandItem icon={<FiCode className="text-[#F37021]"/>} text="React.js" />
                            <BrandItem icon={<FiCpu className="text-[#1A5F7A]"/>} text="Python AI" />
                            <BrandItem icon={<FiLayers className="text-blue-500"/>} text="Full Stack" />
                            <BrandItem text="Java Pro" />
                            <BrandItem text="SQL" />
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* 4. UNIVERSITY TRACKS */}
            <section id="university-programs" className="py-10 bg-slate-50/50 mx-0 md:-mx-4 px-4 md:px-12 rounded-[2rem] md:rounded-[3rem] overflow-hidden scroll-mt-20">
                <h2 className="text-2xl md:text-3xl font-black text-[#1A5F7A] mb-8 uppercase tracking-tighter italic px-4">University Degrees</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                    {universityPrograms.map((program) => (
                        <div key={program.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
                            <div>
                                <FiAward className="text-2xl text-[#1A5F7A] mb-4" />
                                <h3 className="text-xl font-black text-[#1A5F7A] uppercase tracking-tighter mb-1 leading-tight">{program.title}</h3>
                                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-6">{program.university}</p>
                            </div>
                            <button onClick={() => navigate('/registration', { state: { prefillCourse: program.id } })} className="w-full py-3 bg-[#1A5F7A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F37021] transition-all">Apply Now</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. SIGNATURE TRACKS */}
            <section id="signature-courses" className="py-10 overflow-hidden scroll-mt-20 px-4 md:px-0">
                <h2 className="text-2xl md:text-3xl font-black text-[#1A5F7A] mb-8 uppercase tracking-tighter italic">Signature Courses</h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {featuredPosters.map((poster, index) => {
                        const courseObj = techCoursesData.find(c => c.id === poster.id);
                        return (
                            <div key={index} onClick={() => setSelectedSyllabus(courseObj)} className="group relative rounded-xl md:rounded-[1.5rem] overflow-hidden cursor-pointer shadow-md aspect-[3/4] md:aspect-[4/5] bg-slate-50">
                                <img src={poster.image} alt={poster.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-3 md:p-4 text-left">
                                    <h3 className="text-white text-[10px] md:text-sm font-black uppercase tracking-tight leading-tight">{poster.title}</h3>
                                    <div className="text-orange-400 text-[8px] font-black flex items-center gap-1 uppercase tracking-widest mt-1"><FiBookOpen /> View Syllabus</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 6. ACADEMIC ECOSYSTEM */}
            <section className="py-12 bg-[#0A192F] mx-0 md:-mx-4 px-6 md:px-12 rounded-[2rem] md:rounded-[3rem] text-white overflow-hidden relative">
                <div className="text-center mb-10 relative z-10">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">Academic Ecosystem</h2>
                    <p className="text-blue-200/50 text-xs font-bold uppercase tracking-widest mt-3">Personalized learning stages</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 px-4">
                    {categories.map((cat, index) => (
                        <div key={index} className="bg-white/5 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-all group">
                            <div className="flex items-center gap-4 mb-3">
                                <img src={cat.image} className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 bg-slate-800" alt={cat.title} loading="lazy" />
                                <h3 className="text-base font-black uppercase tracking-tighter">{cat.title}</h3>
                            </div>
                            <p className="text-blue-100/60 text-xs leading-relaxed mb-6 italic">{cat.desc}</p>
                            <button onClick={() => navigate('/registration')} className="w-full py-3 bg-[#F37021] text-[10px] font-black uppercase tracking-widest rounded-lg">Enroll Now</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. ALUMNI VOICES */}
            <section id="alumni-voices" className="py-16 md:py-24 scroll-mt-20 bg-white">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-[#1A5F7A] uppercase tracking-tighter italic">
                        Alumni <span className="text-[#F37021]">Voices</span>
                    </h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Success stories from 38 years of excellence</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {alumniSuccess.map((student, i) => (
                        <motion.div 
                            key={i} 
                            whileHover={{ y: -8 }}
                            className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className="text-left">
                                <div className="flex gap-1 text-orange-400 text-xs mb-5">
                                    <FiStar fill="currentColor" /><FiStar fill="currentColor" /><FiStar fill="currentColor" /><FiStar fill="currentColor" /><FiStar fill="currentColor" />
                                </div>
                                <p className="text-slate-600 text-[15px] md:text-base italic mb-8 leading-relaxed font-medium">
                                    "{student.text}"
                                </p>
                            </div>
                            <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
                                <img 
                                    src={student.image} 
                                    className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-white bg-slate-200" 
                                    alt={student.name}
                                    loading="lazy"
                                />
                                <div className="text-left">
                                    <span className="block font-black text-[#1A5F7A] uppercase text-sm tracking-tight leading-none mb-1">
                                        {student.name}
                                    </span>
                                    <span className="text-[9px] font-bold text-[#F37021] uppercase tracking-widest">
                                        Verified Alumnus
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* MODAL */}
            {selectedSyllabus && (
                <SyllabusModal course={selectedSyllabus} onClose={() => setSelectedSyllabus(null)} />
            )}
        </div>
    );
}