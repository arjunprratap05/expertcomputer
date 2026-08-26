import React, { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { FiCheckCircle, FiTarget, FiEye, FiUsers, FiBriefcase, FiCalendar, FiShield, FiZap } from "react-icons/fi";
import expertcomputerlogo from '../../assets/expertcomputerlogo.png';

// --- Animated Counter Sub-Component ---
const Counter = ({ value, duration = 2 }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (inView) {
            animate(count, value, { duration: duration, ease: "circOut" });
        }
    }, [inView, count, value, duration]);

    return <motion.span ref={ref}>{rounded}</motion.span>;
};

// --- AUTOMATED YEARS CALCULATION ---
const calculateYearsOfExperience = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 = Jan, 1 = Feb, 2 = Mar...
    
    // Base subtraction from establishment year (1987)
    let years = currentYear - 1987;
    
    // If we are in January (0) or February (1), the milestone in March hasn't hit yet
    if (currentMonth < 2) {
        years--;
    }
    
    return years;
};

export default function About() {
    // Force scroll to top on mount
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        });
    }, []);

    const yearsOfExperience = calculateYearsOfExperience();

    const advantages = [
        `${yearsOfExperience}+ Years of Experience`, "2 Lac Alumni", "1,00,000+ Placements",
        "100% Placement Assistance", "100% Practical Classes", "Certified Faculty / 28 Years of Experience",
        "Internship Available", "Premium Quality Classrooms", "Personality Development & Interview Success Training",
        "Customized Flexible Batches", "Recognized Certificates", "Authorized Partner of Tally LTD"
    ];

    const stats = [
        { label: "Years Experience", value: yearsOfExperience, suffix: "+", icon: <FiCalendar /> },
        { label: "Total Alumni", value: 2, suffix: " Lac", icon: <FiUsers /> },
        { label: "Placements", value: 1, suffix: " Lac+", icon: <FiBriefcase /> },
    ];

    return (
        <div className="relative min-h-screen bg-[#070D1D] text-slate-100 antialiased font-sans overflow-x-hidden selection:bg-[#F37021]/30 selection:text-orange-200">
            
            {/* AMBIENT GLOWS & MESH BACKDROP */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-orange-600/10 via-blue-600/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute top-[45%] right-0 w-[500px] h-[700px] bg-indigo-900/15 rounded-full blur-[160px] pointer-events-none -z-10" />
            <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

                {/* HERO SECTION */}
                <section className="py-20 md:py-28 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="w-full lg:w-1/2"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#F37021] to-[#1A5F7A] rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                                <div className="relative bg-slate-900/80 backdrop-blur-md rounded-[2.5rem] p-6 shadow-2xl border border-slate-700/80">
                                    <img
                                        src={expertcomputerlogo}
                                        alt="Expert Computer Academy"
                                        className="rounded-2xl w-full transform group-hover:scale-[1.02] transition-transform duration-700 object-contain max-h-[350px] mx-auto"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="px-4 py-2 bg-orange-500/10 text-[#F37021] rounded-full font-bold text-xs uppercase tracking-[0.2em] border border-orange-500/20 backdrop-blur-md inline-flex items-center gap-2">
                                    <FiShield /> ESTABLISHED 1987
                                </span>
                                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mt-6 tracking-tight">
                                    Legacy of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200">Excellence</span>
                                </h2>
                            </motion.div>

                            <motion.p 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-300 text-lg md:text-xl leading-relaxed font-normal"
                            >
                                For over <span className="font-bold text-white">{yearsOfExperience}+ years</span>, we've bridged the gap between raw potential and professional mastery. As a premier partner with NIIT Ltd, we've shaped the tech skyline of Patna.
                            </motion.p>
                        </div>
                    </div>
                </section>

                {/* MODERN STATS BANNER */}
                <section className="py-10 relative z-10">
                    <div className="bg-gradient-to-br from-[#0A192F] via-[#0F2C59] to-[#070D1D] rounded-2xl md:rounded-[2.5rem] p-10 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F37021] blur-[140px] opacity-15 pointer-events-none" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                            {stats.map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", stiffness: 100, delay: i * 0.1 }}
                                    className="flex flex-col items-center text-center text-white bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-lg"
                                >
                                    <div className="w-16 h-16 bg-slate-900/80 border border-slate-700/60 rounded-2xl flex items-center justify-center text-2xl text-[#F37021] mb-4 shadow-inner">
                                        {stat.icon}
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black mb-1 text-white tracking-tight">
                                        <Counter value={stat.value} />
                                        <span className="text-[#F37021]">{stat.suffix}</span>
                                    </h3>
                                    <p className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase mt-1">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* THE EXPERT ADVANTAGE GRID */}
                <section className="py-20 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-[#F37021] block mb-2">Why Choose Us</span>
                        <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">The Expert Advantages</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {advantages.map((adv, index) => (
                            <motion.div 
                                key={index}
                                whileHover={{ scale: 1.03, y: -4 }}
                                className="p-6 bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-orange-500/40 transition-all cursor-default flex flex-col items-center text-center group"
                            >
                                <div className="p-3 rounded-xl bg-orange-500/10 text-[#F37021] mb-4 border border-orange-500/20 group-hover:scale-110 transition-transform">
                                    <FiCheckCircle size={22} />
                                </div>
                                <p className="font-bold text-slate-200 text-sm leading-relaxed">{adv}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* VISION CARDS */}
                <section className="py-20 mb-20 relative z-10">
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { title: "Our Mission", icon: <FiTarget />, color: "from-blue-600 to-teal-600", text: "To democratize high-end tech education and equip students with real-world skills." },
                            { title: "Our Vision", icon: <FiEye />, color: "from-orange-500 to-amber-600", text: "To be India's benchmark for digital excellence and industry-ready professionals." }
                        ].map((card, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ y: -6 }}
                                className="bg-slate-900/70 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-slate-800 flex flex-col items-start gap-6 group"
                            >
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} text-white text-3xl shadow-lg`}>
                                    {card.icon}
                                </div>
                                <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight">{card.title}</h4>
                                <p className="text-slate-300 text-base md:text-lg leading-relaxed font-normal">{card.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* MINIMAL SYSTEM FOOTER */}
                <footer className="border-t border-slate-800 py-12 text-center text-xs md:text-sm font-bold tracking-[0.2em] text-slate-500 uppercase">
                    ESTD 1987 <span className="text-[#F37021] mx-2">•</span> PATNA HQ CORE CAMPUS DEVELOPMENT SYSTEMS
                </footer>
            </div>
        </div>
    );
}