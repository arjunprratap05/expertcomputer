import React, { useState, useEffect } from "react"; // Added useEffect
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend, FiLoader, FiCheckCircle, FiClock } from "react-icons/fi";

export default function Contact() {
    // --- 1. FORCE SCROLL TO TOP ON MOUNT ---
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant" // Use "smooth" if you prefer a sliding effect
        });
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });
    const [status, setStatus] = useState({ loading: false, success: false });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false });

        const payload = {
            ...formData,
            course: "General Inquiry",
            university: "Expert Academy Patna",
            type: "inquiry"
        };

        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL;
            const response = await axios.post(`${API_URL}/inquiry/submit`, payload);

            if (response.data.success) {
                setStatus({ loading: false, success: true });
                setFormData({ name: "", email: "", phone: "", message: "" });
                setTimeout(() => setStatus({ loading: false, success: false }), 5000);
            }
        } catch (error) {
            console.error("Submission error:", error);
            const errorMsg = error.response?.status === 404 
                ? "Backend endpoint not found. Check server routes." 
                : "Failed to send message. Contact: 7282983335";
            alert(errorMsg);
            setStatus({ loading: false, success: false });
        }
    };

    return (
        <div className="relative min-h-screen bg-white flex items-center justify-center py-20 overflow-hidden selection:bg-[#F37021] selection:text-white">
            
            {/* DYNAMIC BACKGROUND DECO */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-0">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-[#F37021]/20 rounded-full blur-[120px]" 
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-[#1A5F7A]/20 rounded-full blur-[120px]" 
                />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    
                    {/* SECTION HEADER */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-[#F37021] font-bold tracking-[0.3em] uppercase text-sm block mb-4">Contact Us</span>
                        <h2 className="text-5xl md:text-6xl font-black text-[#1A5F7A] leading-tight">
                            Let's Talk <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F37021] to-orange-400">Expertise</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(26,95,122,0.15)] border border-slate-100">
                        
                        {/* LEFT: CONTACT INFO (2 Columns) */}
                        <div className="lg:col-span-2 bg-[#1A5F7A] p-12 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            
                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold mb-6">Academy Hub</h3>
                                <p className="text-blue-100/70 mb-12 text-lg">
                                    Visit us for a counseling session or reach out digitally for immediate support.
                                </p>

                                <div className="space-y-8">
                                    <ContactItem 
                                        icon={<FiMapPin />} 
                                        title="Visit Our Campus"
                                        detail="Kumar Tower, 2nd Floor, Boring Rd, Patna-01"
                                    />
                                    <ContactItem 
                                        icon={<FiPhone />} 
                                        title="Call Support"
                                        detail="+91 7282983335"
                                        isLink={`tel:+917282983335`}
                                    />
                                    <ContactItem 
                                        icon={<FiMail />} 
                                        title="Official Email"
                                        detail="expertcomputeracademy@gmail.com"
                                        isLink={`mailto:expertcomputeracademy@gmail.com`}
                                    />
                                    <ContactItem 
                                        icon={<FiClock />} 
                                        title="Opening Hours"
                                        detail="Mon - Sat: 8:00 AM - 8:00 PM"
                                    />
                                </div>
                            </div>

                            <div className="mt-16 pt-8 border-t border-white/10 relative z-10">
                                <p className="text-sm font-bold tracking-widest text-[#F37021] uppercase mb-2">Legacy</p>
                                <p className="text-blue-100 italic opacity-60">"38 Years of digital excellence in computer education."</p>
                            </div>
                        </div>

                        {/* RIGHT: FORM (3 Columns) */}
                        <div className="lg:col-span-3 bg-white p-12 md:p-16 flex flex-col justify-center">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AnimatePresence>
                                    {status.success && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-3 font-bold"
                                        >
                                            <FiCheckCircle className="text-xl" /> Inquiry Sent Successfully!
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField 
                                        label="Full Name" 
                                        name="name" 
                                        placeholder="John Doe" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                    />
                                    <InputField 
                                        label="Phone Number" 
                                        name="phone" 
                                        type="tel"
                                        placeholder="+91 XXXXX XXXXX" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                    />
                                </div>

                                <InputField 
                                    label="Email Address" 
                                    name="email" 
                                    type="email"
                                    placeholder="your@email.com" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                />

                                <div className="flex flex-col">
                                    <label className="text-xs font-black text-[#1A5F7A] mb-2 uppercase tracking-widest ml-1">Message</label>
                                    <textarea 
                                        name="message" 
                                        rows="4" 
                                        value={formData.message} 
                                        onChange={handleChange} 
                                        placeholder="Briefly describe your inquiry..." 
                                        className="py-4 px-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 text-gray-800 font-medium focus:border-[#F37021] focus:ring-4 focus:ring-[#F37021]/5 outline-none transition-all resize-none"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={status.loading} 
                                    className="w-full bg-[#F37021] text-white font-black py-5 rounded-[1.5rem] transition-all duration-500 flex items-center justify-center gap-3 shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                >
                                    {status.loading ? <FiLoader className="animate-spin" /> : <FiSend />} 
                                    {status.loading ? "Processing..." : "Submit Inquiry"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// SUB-COMPONENT: CONTACT ITEM
function ContactItem({ icon, title, detail, isLink }) {
    return (
        <div className="flex items-start group">
            <div className="p-3 bg-white/10 rounded-xl text-[#F37021] group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <div className="ml-5">
                <p className="text-xs font-bold text-blue-100/50 uppercase tracking-widest mb-1">{title}</p>
                {isLink ? (
                    <a href={isLink} className="text-md font-bold hover:text-[#F37021] transition-colors">{detail}</a>
                ) : (
                    <p className="text-md font-bold leading-snug">{detail}</p>
                )}
            </div>
        </div>
    );
}

// SUB-COMPONENT: INPUT FIELD
function InputField({ label, name, type = "text", placeholder, value, onChange }) {
    return (
        <div className="flex flex-col">
            <label className="text-xs font-black text-[#1A5F7A] mb-2 uppercase tracking-widest ml-1">{label}</label>
            <input 
                required 
                type={type} 
                name={name} 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder} 
                className="py-4 px-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 text-gray-800 font-medium focus:border-[#F37021] focus:ring-4 focus:ring-[#F37021]/5 outline-none transition-all" 
            />
        </div>
    );
}