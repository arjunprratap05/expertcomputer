import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FiMail, FiPhone, FiMapPin, FiSend, FiLoader, 
    FiCheckCircle, FiClock, FiAlertCircle 
} from "react-icons/fi";

export default function Contact() {
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", message: ""
    });

    const [status, setStatus] = useState({ 
        loading: false, success: false, error: "" 
    });

    const [fieldErrors, setFieldErrors] = useState({
        phone: false, email: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone") {
            const numericValue = value.replace(/\D/g, "");
            if (numericValue.length <= 10) {
                setFormData(prev => ({ ...prev, [name]: numericValue }));
                setFieldErrors(prev => ({ ...prev, phone: numericValue.length !== 10 }));
            }
            return;
        }
        if (name === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setFieldErrors(prev => ({ ...prev, email: !emailRegex.test(value) && value.length > 0 }));
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.phone.length !== 10) {
            setFieldErrors(prev => ({ ...prev, phone: true }));
            setStatus(prev => ({ ...prev, error: "Please enter a valid 10-digit number." }));
            return;
        }
        setStatus({ loading: true, success: false, error: "" });
        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL;
            const response = await axios.post(`${API_URL}/inquiry/submit`, {
                ...formData,
                course: "General Inquiry",
                university: "Expert Academy Patna",
                type: "inquiry"
            });
            if (response.data.success) {
                setStatus({ loading: false, success: true, error: "" });
                setFormData({ name: "", email: "", phone: "", message: "" });
                setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
            }
        } catch (error) {
            setStatus({ 
                loading: false, success: false, 
                error: error.response?.data?.msg || "Submission failed. Please try again." 
            });
        }
    };

    return (
        <div className="relative min-h-screen bg-white flex items-center justify-center py-12 md:py-20 overflow-x-hidden selection:bg-[#F37021] selection:text-white">
            
            {/* BACKGROUND DECORATION */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-0">
                <div className="absolute -top-20 -left-20 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#F37021]/10 rounded-full blur-[80px] md:blur-[120px]" />
                <div className="absolute bottom-0 -right-20 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-[#1A5F7A]/10 rounded-full blur-[80px] md:blur-[120px]" />
            </div>

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 md:mb-16">
                        <span className="text-[#F37021] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm block mb-3">Contact Us</span>
                        <h2 className="text-4xl md:text-6xl font-black text-[#1A5F7A] leading-tight">
                            Let's Talk <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F37021] to-orange-400">Expertise</span>
                        </h2>
                    </motion.div>

                    {/* MAIN BOX: Changed rounded corners and grid behavior for mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 bg-white">
                        
                        {/* LEFT INFO PANEL: Reduced padding on mobile (p-8 vs p-12) */}
                        <div className="lg:col-span-2 bg-[#1A5F7A] p-8 md:p-12 text-white flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-6 italic">Academy Hub</h3>
                                <div className="space-y-6 md:space-y-8">
                                    <ContactItem icon={<FiMapPin />} title="Campus" detail="Kumar Tower, 2nd Floor, Boring Rd, Patna" />
                                    <ContactItem icon={<FiPhone />} title="Support" detail="+91 7282983335" isLink="tel:+917282983335" />
                                    <ContactItem icon={<FiMail />} title="Email" detail="expertcomputeracademy@gmail.com" isLink="mailto:expertcomputeracademy@gmail.com" />
                                    <ContactItem icon={<FiClock />} title="Hours" detail="Mon - Sat: 8:00 AM - 8:00 PM" />
                                </div>
                            </div>
                            <div className="mt-12 md:mt-16 pt-8 border-t border-white/10 opacity-60">
                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Est. 1987</p>
                                <p className="text-xs md:text-sm italic">"Bringing people and computers together."</p>
                            </div>
                        </div>

                        {/* RIGHT FORM PANEL: Responsive padding (p-8 vs p-16) */}
                        <div className="lg:col-span-3 p-8 md:p-16">
                            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                                <AnimatePresence mode="wait">
                                    {status.success && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 font-bold border border-green-100 text-sm">
                                            <FiCheckCircle className="shrink-0" /> Message Sent Successfully!
                                        </motion.div>
                                    )}
                                    {status.error && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 font-bold border border-red-100 text-sm">
                                            <FiAlertCircle className="shrink-0" /> {status.error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                    <InputField label="Full Name" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
                                    <InputField 
                                        label="Phone Number" name="phone" type="tel"
                                        placeholder="10-Digit Mobile" value={formData.phone} 
                                        onChange={handleChange} error={fieldErrors.phone}
                                    />
                                </div>

                                <InputField 
                                    label="Email Address" name="email" type="email"
                                    placeholder="your@email.com" value={formData.email} 
                                    onChange={handleChange} error={fieldErrors.email}
                                />

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black text-[#1A5F7A] mb-2 uppercase tracking-widest ml-1">Your Message</label>
                                    <textarea 
                                        name="message" required rows="4" 
                                        value={formData.message} onChange={handleChange} 
                                        placeholder="How can we help?" 
                                        className="py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#F37021] outline-none transition-all resize-none font-medium text-sm md:text-base"
                                    />
                                </div>

                                <button 
                                    type="submit" disabled={status.loading} 
                                    className="w-full bg-[#F37021] text-white font-black py-4 md:py-5 rounded-2xl transition-all shadow-xl hover:bg-[#1A5F7A] flex items-center justify-center gap-3 disabled:opacity-50 text-sm md:text-base uppercase tracking-widest"
                                >
                                    {status.loading ? <FiLoader className="animate-spin" /> : <FiSend />} 
                                    {status.loading ? "Sending..." : "Submit Inquiry"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function ContactItem({ icon, title, detail, isLink }) {
    return (
        <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl text-orange-400 shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">{title}</p>
                {isLink ? (
                    <a href={isLink} className="font-bold text-sm md:text-base hover:text-orange-400 transition-colors break-words block">
                        {detail}
                    </a>
                ) : (
                    <p className="font-bold text-sm md:text-base break-words">{detail}</p>
                )}
            </div>
        </div>
    );
}

function InputField({ label, name, type = "text", placeholder, value, onChange, error }) {
    return (
        <div className="flex flex-col">
            <label className="text-[10px] font-black text-[#1A5F7A] mb-2 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                <input 
                    required type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} 
                    className={`w-full py-4 px-6 rounded-2xl bg-slate-50 border text-sm md:text-base font-medium outline-none transition-all ${
                        error ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-100 focus:border-[#F37021]'
                    }`}
                />
                {error && <FiAlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />}
            </div>
        </div>
    );
}