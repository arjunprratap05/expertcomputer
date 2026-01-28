import React, { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { FiCheckCircle, FiTarget, FiEye, FiUsers, FiBriefcase, FiCalendar, FiArrowRight } from "react-icons/fi";
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

export default function About() {
    // --- 1. FORCE SCROLL TO TOP ON MOUNT ---
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant" // Use "smooth" if you prefer a sliding effect
        });
    }, []);

    const advantages = [
        "38 Years of Experience", "2 Lac Alumni", "1,00,000+ Placements",
        "100% Placement Assistance", "100% Practical Classes", "28 Years Expert Faculty",
        "Uninterrupted Power", "AC Classrooms", "Personality Grooming",
        "Flexible Batches", "Recognized Certificates", "TEPL Partner"
    ];

    const stats = [
        { label: "Years Experience", value: 38, suffix: "+", icon: <FiCalendar /> },
        { label: "Total Alumni", value: 2, suffix: " Lac", icon: <FiUsers /> },
        { label: "Placements", value: 1, suffix: " Lac+", icon: <FiBriefcase /> },
    ];

    return (
        <div className="bg-white overflow-hidden relative">
            {/* DYNAMIC BACKGROUND BLOBS */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <motion.div 
                    animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[100px]"
                />
                <motion.div 
                    animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute top-1/2 -right-20 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[100px]"
                />
            </div>

            {/* HERO SECTION */}
            <section className="py-24 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="w-full lg:w-1/2"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#F37021] to-[#1A5F7A] rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <div className="relative bg-white rounded-[2rem] p-4 shadow-2xl">
                                    <img
                                        src={expertcomputerlogo}
                                        alt="Expert Computer Academy"
                                        className="rounded-2xl w-full transform group-hover:scale-[1.02] transition-transform duration-700"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <div className="w-full lg:w-1/2 space-y-8">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="px-4 py-2 bg-orange-50 text-[#F37021] rounded-full font-bold text-xs uppercase tracking-widest border border-orange-100">
                                    ESTABLISHED 1987
                                </span>
                                <h2 className="text-5xl md:text-6xl font-black text-[#1A5F7A] leading-tight mt-6">
                                    Legacy of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F37021] to-orange-400">Excellence</span>
                                </h2>
                            </motion.div>

                            <motion.p 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-gray-600 text-xl leading-relaxed font-light"
                            >
                                For over <span className="font-bold text-gray-800">38 years</span>, we've bridged the gap between raw potential and professional mastery. As a premier partner with NIIT Ltd, we've shaped the tech skyline of Patna.
                            </motion.p>

                            {/* <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 text-[#F37021] font-bold group cursor-pointer"
                            >
                                <span>Learn our full story</span>
                                <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </motion.div> */}
                        </div>
                    </div>
                </div>
            </section>

            {/* MODERN STATS BANNER */}
            <section className="py-12 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="bg-[#1A5F7A] rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
                        {/* Glassmorphic overlay */}
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            {stats.map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 100, delay: i * 0.1 }}
                                    className="flex flex-col items-center text-center text-white"
                                >
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl text-[#F37021] mb-4 border border-white/20">
                                        {stat.icon}
                                    </div>
                                    <h3 className="text-5xl font-black mb-1">
                                        <Counter value={stat.value} />
                                        <span className="text-[#F37021]">{stat.suffix}</span>
                                    </h3>
                                    <p className="text-blue-100/70 text-sm font-medium tracking-tighter uppercase">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* THE EXPERT ADVANTAGE GRID */}
            <section className="py-24 relative z-10">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="text-4xl font-bold text-[#1A5F7A] mb-12">The Expert Advantage</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {advantages.map((adv, index) => (
                            <motion.div 
                                key={index}
                                whileHover={{ scale: 1.05, rotate: [0, 1, -1, 0] }}
                                className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-[#F37021]/30 transition-all cursor-default"
                            >
                                <FiCheckCircle className="text-[#F37021] text-2xl mx-auto mb-3" />
                                <p className="font-bold text-gray-700 text-sm">{adv}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VISION CARDS */}
            <section className="py-24 bg-gray-50/50 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-10">
                        {[
                            { title: "Our Mission", icon: <FiTarget />, color: "from-blue-600 to-indigo-700", text: "To democratize high-end tech education and equip students with real-world skills." },
                            { title: "Our Vision", icon: <FiEye />, color: "from-orange-500 to-red-600", text: "To be India's benchmark for digital excellence and industry-ready professionals." }
                        ].map((card, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-start gap-6"
                            >
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} text-white text-3xl`}>
                                    {card.icon}
                                </div>
                                <h4 className="text-3xl font-bold text-gray-900">{card.title}</h4>
                                <p className="text-gray-500 text-lg leading-relaxed">{card.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}