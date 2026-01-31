import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    FiArrowRight, FiShield, FiBookOpen, FiAward, FiCheckCircle, FiStar, 
    FiCode, FiCpu, FiLayers
} from "react-icons/fi";
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

// --- HELPER COMPONENT: BRAND ITEM ---
const BrandItem = ({ icon, text }) => (
    <div className="flex items-center gap-4 group transition-all duration-500 cursor-default">
        <div className="bg-slate-50 p-2.5 rounded-xl group-hover:bg-orange-50 transition-colors duration-300">
            {icon || <FiStar className="text-orange-300 group-hover:text-orange-400" />}
        </div>
        <span className="text-3xl font-black text-slate-300 group-hover:text-[#1A5F7A] transition-all duration-300 tracking-tighter uppercase italic select-none">
            {text}
        </span>
    </div>
);

export default function Home() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [selectedSyllabus, setSelectedSyllabus] = useState(null);
    const targetRef = useRef(null);

    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

    const featuredPosters = [
        { title: "Java Programming", image: javaPoster, id: "java-pro" },
        { title: "HTML5 Web", image: htmlPoster, id: "html5-web" },
        { title: "ADCA Diploma", image: adcaPoster, id: "adca-diploma" },
        { title: "Python & DS", image: pythonPoster, id: "python-ds" }
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
        <div ref={targetRef} className="mx-auto w-full max-w-7xl px-4 font-sans text-slate-900 bg-white overflow-x-hidden">

            {/* 1. HERO SECTION - UPDATED CTA */}
            <section className="py-6 md:py-10">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="w-full lg:w-1/2 space-y-5 text-center lg:text-left order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 bg-orange-50 text-[#F37021] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <FiShield /> ISO 9001:2015 Certified
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#1A5F7A] leading-tight">
                            Build Your <span className="text-[#F37021] italic">Future</span> In Tech.
                        </h1>
                        <p className="text-base text-slate-500 max-w-lg mx-auto lg:mx-0">
                            Patna's legacy academy since 1987. Traditional excellence meets Gen-AI innovation. 
                            Join 2 Lakh+ successful alumni today.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                            {/* UPDATED: Catchy text & Redirect to About Page */}
                            <button 
                                onClick={() => navigate('/about')} 
                                className="bg-[#1A5F7A] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#F37021] transition-all flex items-center gap-2 shadow-lg uppercase text-[11px] tracking-widest group"
                            >
                                Start Your Journey <FiArrowRight className="group-hover:translate-x-1 transition-transform"/>
                            </button>
                            
                            <div className="flex -space-x-2 items-center">
                                {[suruchiImg, harshImg, gauravImg].map((img, i) => (
                                    <img key={i} src={img} className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" alt="student" />
                                ))}
                                <button 
                                    onClick={() => navigate('/achievements')}
                                    className="pl-4 text-[11px] font-black text-slate-400 hover:text-[#1A5F7A] transition-colors uppercase tracking-tighter cursor-pointer"
                                >
                                    Meet Our Alumni
                                </button>
                            </div>
                        </div>
                    </div>
                    <motion.div style={{ opacity: heroOpacity }} className="w-full lg:w-1/2 order-1 lg:order-2">
                        <div className="relative p-2">
                            <img src={expertcomuteroffice} alt="Office" className="rounded-[2rem] shadow-xl w-full object-cover aspect-video" />
                            <div className="absolute -bottom-4 -right-2 bg-[#1A5F7A] text-white p-4 rounded-2xl shadow-2xl flex flex-col items-center min-w-[100px]">
                                <span className="font-black text-2xl">38+</span>
                                <span className="text-[9px] uppercase font-bold tracking-tighter text-center">Years Legacy</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. INFINITE TECH SLIDER */}
            <section className="py-8 overflow-hidden bg-white border-y border-slate-100 relative">
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none"></div>
                
                <motion.div 
                    className="flex whitespace-nowrap gap-16 items-center min-w-max"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    whileHover={{ transition: { duration: 80 } }} 
                >
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex gap-16 items-center pr-16">
                            <BrandItem icon={<FiCode className="text-[#F37021]"/>} text="React.js" />
                            <BrandItem icon={<FiCpu className="text-[#1A5F7A]"/>} text="Python AI" />
                            <BrandItem icon={<FiLayers className="text-blue-500"/>} text="Full Stack" />
                            <BrandItem text="Java Pro" />
                            <BrandItem icon={<FiShield className="text-green-600"/>} text="ISO 9001" />
                            <BrandItem text="Gen-AI" />
                            <BrandItem text="SQL" />
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* 3. THE EXPERT ADVANTAGE */}
            <section className="py-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 bg-slate-50 p-8 rounded-[2rem] flex flex-col justify-center">
                        <h2 className="text-2xl font-black text-[#1A5F7A] uppercase tracking-tighter italic leading-none">Why Choose Us</h2>
                        <p className="text-slate-500 text-sm font-medium mt-2">Patna's ISO 9001:2015 Benchmark center for IT training.</p>
                    </div>
                    {[
                        { icon: <FiCheckCircle className="text-orange-500 text-2xl"/>, title: "100% Practical", desc: "Hands-on lab focus." },
                        { icon: <FiAward className="text-blue-500 text-2xl"/>, title: "Global Certs", desc: "Industry recognized." }
                    ].map((item, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                            {item.icon}
                            <h3 className="text-sm font-black text-[#1A5F7A] mt-3 uppercase tracking-tighter">{item.title}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. UNIVERSITY TRACKS */}
            <section className="py-10 bg-slate-50/50 -mx-4 px-4 rounded-[3rem]">
                <h2 className="text-3xl font-black text-[#1A5F7A] mb-8 uppercase tracking-tighter italic px-4">University Degrees</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {universityPrograms.map((program) => (
                        <div key={program.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <FiAward className="text-2xl text-[#1A5F7A]" />
                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest border border-orange-100 px-2 py-0.5 rounded-full">Degree</span>
                            </div>
                            <h3 className="text-xl font-black text-[#1A5F7A] uppercase tracking-tighter mb-1 leading-tight">{program.title}</h3>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-4">{program.university}</p>
                            <button onClick={() => navigate('/registration', { state: { prefillCourse: program.id } })} className="w-full py-3 bg-[#1A5F7A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F37021] transition-all">Apply Now</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. SIGNATURE TRACKS */}
            <section className="py-10">
                <h2 className="text-3xl font-black text-[#1A5F7A] mb-8 uppercase tracking-tighter italic">Signature Courses</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {featuredPosters.map((poster, index) => {
                        const courseObj = techCoursesData.find(c => c.id === poster.id);
                        return (
                            <div key={index} onClick={() => setSelectedSyllabus(courseObj)} className="group relative rounded-[1.5rem] overflow-hidden cursor-pointer shadow-md aspect-[4/5]">
                                <img src={poster.image} alt={poster.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-4">
                                    <h3 className="text-white text-sm font-black uppercase tracking-tight leading-tight">{poster.title}</h3>
                                    <div className="text-orange-400 text-[8px] font-black flex items-center gap-1 uppercase tracking-widest mt-1"><FiBookOpen /> View Syllabus</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 6. ACADEMIC ECOSYSTEM */}
            <section className="py-12 bg-[#0A192F] -mx-4 px-6 md:px-12 rounded-[3rem] text-white">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Academic Ecosystem</h2>
                    <p className="text-blue-200/50 text-xs font-bold uppercase tracking-widest mt-2">Personalized learning stages</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat, index) => (
                        <div key={index} className="bg-white/5 backdrop-blur-sm rounded-[2rem] overflow-hidden border border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-all group">
                            <div className="flex items-center gap-4 mb-3">
                                <img src={cat.image} className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0" alt={cat.title} />
                                <h3 className="text-base font-black uppercase tracking-tighter">{cat.title}</h3>
                            </div>
                            <p className="text-blue-100/60 text-xs leading-relaxed mb-4">{cat.desc}</p>
                            <button onClick={() => navigate('/registration')} className="w-full py-2.5 bg-[#F37021] text-[10px] font-black uppercase tracking-widest rounded-lg">Enroll Now</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. ALUMNI VOICES */}
            <section className="py-10 pb-16">
                <h2 className="text-3xl font-black text-[#1A5F7A] mb-8 uppercase tracking-tighter italic text-center">Alumni Voices</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {alumniSuccess.map((student, i) => (
                        <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <div className="flex gap-0.5 text-orange-400 text-xs mb-3"><FiStar/><FiStar/><FiStar/><FiStar/><FiStar/></div>
                            <p className="text-slate-600 text-sm italic mb-4">"{student.text}"</p>
                            <div className="flex items-center gap-3">
                                <img src={student.image} className="w-8 h-8 rounded-full object-cover shadow-sm" alt={student.name} />
                                <span className="font-black text-[#1A5F7A] uppercase text-[9px] tracking-widest italic">{student.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SYLLABUS MODAL */}
            {selectedSyllabus && (
                <SyllabusModal course={selectedSyllabus} onClose={() => setSelectedSyllabus(null)} />
            )}
        </div>
    );
}