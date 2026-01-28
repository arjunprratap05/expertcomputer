import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
    FiArrowRight, FiCode, FiLayers, FiCpu, FiShield, FiSearch,
    FiBookOpen, FiAward, FiExternalLink, FiCheckCircle, FiHeart, FiX, FiUsers, FiStar
} from "react-icons/fi";
import { techCoursesData, universityPrograms } from "../../data/courses";
import SyllabusModal from "../Modals/SyllabusModal";

// --- ASSET IMPORTS MAINTAINED ---
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
import expertcomuteroffice from "../../assets/expertcomuteroffice.jpeg";
import suruchiImg from "../../assets/student-suruchi.jpeg";
import harshImg from "../../assets/student-harsh.jpeg";
import gauravImg from "../../assets/student-gaurav.jpeg";
import arpitaImg from "../../assets/student-arpita.jpeg";
import ankitImg from "../../assets/student-ankit.jpeg";
import ghanshyamImg from "../../assets/student-ghanshyam.jpeg";
import schoolStudent from '../../assets/school.jpeg';

export default function Home() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [selectedSyllabus, setSelectedSyllabus] = useState(null);
    const targetRef = useRef(null);

    // --- 1. AUTO-SCROLL TO TOP ON ENTRY ---
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    // --- DATA CONFIGURATION ---
    const featuredPosters = [
        { title: "Programming in Java", image: javaPoster, id: "java-pro" },
        { title: "HTML5 Programming", image: htmlPoster, id: "html5-web" },
        { title: "Advanced Diploma in Computer Application", image: adcaPoster, id: "adca-diploma" },
        { title: "Python Programming & Data Exploration in Python", image: pythonPoster, id: "python-ds" }
    ];

    const alumniSuccess = [
        { name: "Suruchi Rai", text: "The practical classes helped me master HTML5. Now working as a web dev.", image: suruchiImg },
        { name: "Harsh Raj", text: "ADCA at Expert Academy changed my career path completely. Best ISO center in Patna.", image: harshImg },
        { name: "Ankit Shubham", text: "Gen-AI ready curriculum is what makes this place special.", image: ankitImg }
    ];

    const categories = [
        { title: "School Students", desc: "Foundation coding & logical thinking.", image: schoolImg },
        { title: "College Students", desc: "Degree programs & advanced tech skills.", image: collegeImg },
        { title: "Graduates", desc: "Career-ready Master's programs.", image: graduatesImg },
        { title: "Working Professionals", desc: "Upskill with MBA and AI Diplomas.", image: workingImg },
        { title: "Home Makers", desc: "Digital literacy & foundational coding.", image: homemakerImg },
        { title: "Retired Persons", desc: "Stay tech-savvy with coding basics.", image: retiredImg },
    ];

    const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] });
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <div ref={targetRef} className="mx-auto w-full max-w-7xl px-4 font-sans text-slate-900 bg-white">

            {/* 1. HERO SECTION */}
            <section className="min-h-[85vh] flex items-center py-12 md:py-20">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 w-full">
                    <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="relative w-full lg:w-1/2 group">
                        <div className="relative z-10">
                            <div className="absolute -inset-2 bg-gradient-to-r from-[#F37021] to-[#1A5F7A] rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <img src={expertcomuteroffice} alt="Office" className="rounded-[2.5rem] shadow-2xl w-full border border-white/50 object-cover aspect-video" />
                            <div className="absolute -top-6 -right-4 bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-xl z-20 border border-white flex flex-col items-center">
                                <span className="text-[#1A5F7A] font-black text-3xl">38</span>
                                <span className="text-[10px] uppercase font-bold text-slate-500 text-center tracking-tighter leading-none">Years of<br/>Legacy</span>
                            </div>
                        </div>
                    </motion.div>
                    <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 bg-slate-50 text-[#F37021] px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-orange-100">
                            <FiShield /> ISO 9001:2015 Certified
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[#1A5F7A] leading-[1]">
                            Build Your <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#f37021] to-[#ff9f67] italic">Future</span> Now.
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 italic">Patna's premier academy where tradition meets Gen-AI training.</p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            {/* UPDATED ACTION: Redirect to About Page */}
                            <button onClick={() => navigate('/about')} className="bg-[#1A5F7A] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#F37021] transition-all flex items-center gap-2 shadow-lg uppercase text-xs tracking-widest">Get Started <FiArrowRight/></button>
                            <div className="flex -space-x-3 items-center">
                                {[suruchiImg, harshImg, gauravImg].map((img, i) => (
                                    <img key={i} src={img} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="student" />
                                ))}
                                <span className="pl-5 text-sm font-bold text-slate-500 uppercase tracking-tighter">+2 Lac Alumni</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. THE EXPERT ADVANTAGE */}
            <section className="py-20 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2 bg-slate-50 p-10 rounded-[3rem] flex flex-col justify-center">
                        <h2 className="text-4xl font-black text-[#1A5F7A] mb-4 uppercase tracking-tighter italic">Why Patna Trusts Us?</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">Since 1987, Expert Computer Academy has been the benchmark for digital excellence in Bihar.</p>
                    </div>
                    {[
                        { icon: <FiCheckCircle className="text-orange-500 text-3xl"/>, title: "100% Practical", desc: "Hands-on lab sessions for every module." },
                        { icon: <FiAward className="text-blue-500 text-3xl"/>, title: "ISO Certified", desc: "Recognized certificates worldwide." }
                    ].map((item, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm hover:shadow-xl transition-all">
                            {item.icon}
                            <h3 className="text-xl font-bold text-[#1A5F7A] mt-4 mb-2 uppercase tracking-tighter">{item.title}</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. UNIVERSITY DEGREE TRACKS */}
            <section className="py-20 border-t border-slate-100">
                <h2 className="text-4xl md:text-5xl font-black text-[#1A5F7A] mb-12 uppercase tracking-tighter italic text-center md:text-left">University Degree Tracks</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {universityPrograms.map((program) => (
                        <motion.div key={program.id} whileHover={{ y: -10 }} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                            <div className="bg-[#1A5F7A]/5 w-12 h-12 rounded-2xl flex items-center justify-center text-[#1A5F7A] mb-6"><FiAward className="text-2xl" /></div>
                            <h3 className="text-3xl font-black text-[#1A5F7A] mb-1 uppercase tracking-tighter">{program.title}</h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6">{program.university}</p>
                            <button 
                                onClick={() => navigate('/registration', { state: { prefillCourse: program.id || program.title } })} 
                                className="w-full bg-[#1A5F7A] text-white py-4 rounded-xl text-xs font-bold hover:bg-[#F37021] transition-all uppercase tracking-widest shadow-md"
                            >
                                Enroll Now
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 4. SIGNATURE TRACKS */}
            <section className="py-20 border-t border-slate-100">
                <h2 className="text-4xl md:text-5xl font-black text-[#1A5F7A] mb-12 uppercase tracking-tighter italic text-center md:text-left">Signature Tracks</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredPosters.map((poster, index) => {
                        const courseObj = techCoursesData.find(c => c.id === poster.id);
                        return (
                            <motion.div 
                                key={index} 
                                whileHover={{ y: -10 }} 
                                className="group relative rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl" 
                                onClick={() => setSelectedSyllabus(courseObj)}
                            >
                                <img src={poster.image} alt={poster.title} className="w-full h-full object-cover aspect-[3/4]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A5F7A] to-transparent"></div>
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    <h3 className="text-white text-2xl font-black uppercase tracking-tighter leading-tight">{poster.title}</h3>
                                    <div className="text-white/80 text-[10px] font-bold mt-2 flex items-center gap-2 uppercase tracking-widest leading-none"><FiBookOpen /> VIEW CURRICULUM</div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* 5. ACADEMIC ECOSYSTEM - PRODUCTION SYNC */}
            <section className="py-20 bg-[#0A192F] -mx-4 px-6 md:px-12 rounded-[5rem] text-white">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter">Academic Ecosystem</h2>
                    <p className="text-blue-200/60 text-lg font-medium italic">Precision learning designed for your specific life-stage.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {categories.map((cat, index) => {
                        const categoryCourses = techCoursesData?.filter(t => t.mappedCategories?.includes(cat.title)) || [];
                        const primaryCourse = categoryCourses[0];
                        return (
                            <motion.div key={index} whileHover={{ y: -5 }} className="group bg-white/5 backdrop-blur-md rounded-[3rem] overflow-hidden border border-white/10 p-8 flex flex-col shadow-2xl">
                                <div className="h-48 -mx-8 -mt-8 mb-8 overflow-hidden relative">
                                    <img src={cat.image} alt={cat.title} className="w-full h-full object-cover opacity-50 transition-transform group-hover:scale-110 duration-700" />
                                    <h3 className="absolute bottom-4 left-8 text-2xl font-black uppercase tracking-tighter">{cat.title}</h3>
                                </div>
                                <p className="text-blue-100/70 mb-8 text-sm leading-relaxed font-medium">{cat.desc}</p>
                                <div className="flex gap-4 mt-auto">
                                    <button 
                                        onClick={() => setSelectedSyllabus({
                                            title: cat.title,
                                            // FIX: Flatten modules from all related programs for this stage
                                            modules: categoryCourses.length > 0 
                                                ? categoryCourses.flatMap(s => s.modules || []) 
                                                : ["Curriculum details being updated..."],
                                            id: primaryCourse?.id || cat.title 
                                        })} 
                                        className="flex-1 py-4 bg-white/10 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                                    >
                                        Syllabus
                                    </button>
                                    <button 
                                        onClick={() => navigate('/registration', { 
                                            state: { prefillCourse: primaryCourse?.id || cat.title } 
                                        })} 
                                        className="flex-1 py-4 bg-[#F37021] text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg hover:bg-orange-500 transition-all"
                                    >
                                        Enroll
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* 6. ALUMNI VOICES */}
            <section className="py-24 border-t border-slate-100">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-[#1A5F7A] mb-4 uppercase tracking-tighter italic">Alumni Voices</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Verified Success Stories from Boring Road Campus</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {alumniSuccess.map((student, i) => (
                        <div key={i} className="bg-slate-50 p-10 rounded-[3rem] relative border border-slate-100">
                            <div className="flex gap-1 text-orange-400 mb-6"><FiStar/><FiStar/><FiStar/><FiStar/><FiStar/></div>
                            <p className="text-slate-600 font-medium italic mb-8 leading-relaxed">"{student.text}"</p>
                            <div className="flex items-center gap-4">
                                <img src={student.image} className="w-12 h-12 rounded-full object-cover ring-4 ring-white shadow-md" alt={student.name} />
                                <span className="font-black text-[#1A5F7A] uppercase text-[10px] tracking-widest italic">{student.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SYLLABUS MODAL */}
            {selectedSyllabus && (
                <SyllabusModal 
                    course={selectedSyllabus} 
                    onClose={() => setSelectedSyllabus(null)} 
                />
            )}
        </div>
    );
}