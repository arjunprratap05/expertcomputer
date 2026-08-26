import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FiMail, FiPhone, FiMapPin, FiSend, FiLoader, 
    FiCheckCircle, FiClock, FiAlertCircle 
} from "react-icons/fi";

// --- LIVE ACADEMY STATUS INDICATOR (OPEN/CLOSED) ---
const AcademyStatusIndicator = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [statusText, setStatusText] = useState("");

    useEffect(() => {
        const checkStatus = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const currentTimeInMinutes = hours * 60 + minutes;

            // Operating Hours: 8:00 AM (480 mins) to 8:00 PM (1200 mins)
            const openingTime = 8 * 60; 
            const closingTime = 20 * 60; 

            if (currentTimeInMinutes >= openingTime && currentTimeInMinutes < closingTime) {
                setIsOpen(true);
                setStatusText("Closes at 8:00 PM");
            } else {
                setIsOpen(false);
                setStatusText("Opens at 8:00 AM");
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="inline-flex items-center gap-2.5 bg-slate-900/80 border border-slate-700/60 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-inner backdrop-blur-md w-fit mb-6">
            <span className={`flex h-2 w-2 rounded-full ${isOpen ? "bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" : "bg-red-500 shadow-[0_0_8px_#ef4444]"}`} />
            <span className={isOpen ? "text-green-400 uppercase tracking-widest" : "text-red-400 uppercase tracking-widest"}>
                {isOpen ? "OPEN NOW" : "CLOSED"}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">{statusText}</span>
        </div>
    );
};

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
        phone: false, email: false, name: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "name") {
            const nameRegex = /^[a-zA-Z\s]{2,50}$/;
            setFieldErrors(prev => ({ ...prev, name: !nameRegex.test(value) && value.length > 0 }));
        }

        if (name === "phone") {
            const numericValue = value.replace(/\D/g, "");
            if (numericValue.length <= 10) {
                setFormData(prev => ({ ...prev, [name]: numericValue }));
                setFieldErrors(prev => ({ ...prev, phone: numericValue.length !== 10 && numericValue.length > 0 }));
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

        // 1. FRONTEND SPAM CHECK (Saves unnecessary API calls)
        const lastSubmission = localStorage.getItem("last_inquiry_submission");
        if (lastSubmission) {
            const { phone, email, timestamp } = JSON.parse(lastSubmission);
            const timePassed = new Date().getTime() - timestamp;
            
            // Block if the same phone or email is submitted within 24 hours locally
            if ((phone === formData.phone || email === formData.email) && timePassed < 86400000) {
                setStatus({ loading: false, success: false, error: "Our system shows you have already submitted an inquiry recently." });
                return;
            }
        }

        // 2. INPUT VALIDATION
        const isNameInvalid = formData.name.trim().length < 2;
        const isPhoneInvalid = formData.phone.length !== 10;
        const isEmailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

        if (isNameInvalid || isPhoneInvalid || isEmailInvalid) {
            setFieldErrors({ name: isNameInvalid, phone: isPhoneInvalid, email: isEmailInvalid });
            setStatus(prev => ({ ...prev, error: "Please fix the highlighted errors in the form." }));
            return;
        }

        setStatus({ loading: true, success: false, error: "" });
        
        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL;
            // 3. SEND TO BACKEND (Where the real Database Check happens)
            const response = await axios.post(`${API_URL}/inquiry/submit`, {
                ...formData,
                course: "General Inquiry",
                university: "Expert Academy Patna",
                type: "inquiry"
            });
            
            if (response.data.success) {
                // Cache success to prevent rapid re-clicks
                localStorage.setItem("last_inquiry_submission", JSON.stringify({
                    phone: formData.phone,
                    email: formData.email,
                    timestamp: new Date().getTime()
                }));

                setStatus({ loading: false, success: true, error: "" });
                setFormData({ name: "", email: "", phone: "", message: "" });
                setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
            }
        } catch (error) {
            // CATCHES DATABASE DUPLICATE REJECTIONS
            const errorMessage = error.response?.data?.message || error.response?.data?.msg || "Submission failed. Please try again later.";
            setStatus({ loading: false, success: false, error: errorMessage });
        }
    };

    return (
        <div className="relative min-h-screen bg-[#070D1D] text-slate-100 antialiased font-sans overflow-x-hidden selection:bg-[#F37021]/30 selection:text-orange-200 flex items-center justify-center py-12 md:py-24">
            
            {/* AMBIENT GLOWS & MESH BACKDROP */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-orange-600/10 via-blue-600/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-10 right-10 w-[500px] h-[700px] bg-indigo-900/15 rounded-full blur-[160px] pointer-events-none -z-10" />

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 md:mb-16">
                        <span className="text-[#F37021] font-extrabold tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm block mb-3">Contact Us</span>
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                            Let's Talk <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200">Expertise</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-800 bg-slate-900/40 backdrop-blur-md">
                        
                        {/* LEFT INFO PANEL */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-[#0A192F] to-[#070D1D] border-r border-slate-800 p-8 md:p-12 text-white flex flex-col justify-between relative">
                            {/* Decorative element inside panel */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#F37021]/10 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="relative z-10">
                                <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight text-white">Academy Hub</h3>
                                
                                <AcademyStatusIndicator />

                                <div className="space-y-6 md:space-y-8 mt-2">
                                    <ContactItem icon={<FiMapPin />} title="Campus" detail="Kumar Tower, 2nd Floor, Boring Road crossing, Patna - 800001" />
                                    <ContactItem icon={<FiPhone />} title="Support" detail="+91 7282983335" isLink="tel:+917282983335" />
                                    <ContactItem icon={<FiMail />} title="Email" detail="expertcomputeracademy@gmail.com" isLink="mailto:expertcomputeracademy@gmail.com" />
                                    <ContactItem icon={<FiClock />} title="Hours" detail="Mon - Sat: 8:00 AM - 8:00 PM" />
                                </div>
                            </div>
                            
                            <div className="mt-12 md:mt-16 pt-8 border-t border-slate-800/80 relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F37021]">Est. 1987</p>
                                <p className="text-xs md:text-sm italic text-slate-400 mt-1 font-medium">"Bringing people and computers together."</p>
                            </div>
                        </div>

                        {/* RIGHT FORM PANEL */}
                        <div className="lg:col-span-3 p-8 md:p-16 bg-slate-900/60 relative">
                            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10 relative z-10">
                                <AnimatePresence mode="wait">
                                    {status.success && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="p-4 bg-green-500/10 text-green-400 rounded-2xl flex items-center gap-3 font-bold border border-green-500/20 text-sm backdrop-blur-md">
                                            <FiCheckCircle className="shrink-0 text-lg" /> Message Sent Successfully!
                                        </motion.div>
                                    )}
                                    {status.error && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="p-4 bg-red-500/10 text-red-400 rounded-2xl flex items-center gap-3 font-bold border border-red-500/20 text-sm backdrop-blur-md">
                                            <FiAlertCircle className="shrink-0 text-lg" /> {status.error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
                                    <InputField 
                                        label="Full Name" name="name" placeholder="John Doe" 
                                        value={formData.name} onChange={handleChange} 
                                        error={fieldErrors.name} errorMsg="Use only letters (min 2)"
                                    />
                                    <InputField 
                                        label="Phone Number" name="phone" type="tel"
                                        placeholder="10-Digit Mobile" value={formData.phone} 
                                        onChange={handleChange} error={fieldErrors.phone}
                                        errorMsg="Enter valid 10 digits"
                                    />
                                </div>

                                <InputField 
                                    label="Email Address" name="email" type="email"
                                    placeholder="your@email.com" value={formData.email} 
                                    onChange={handleChange} error={fieldErrors.email}
                                    errorMsg="Enter a valid email"
                                />

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1">Your Message</label>
                                    <textarea 
                                        name="message" required rows="4" 
                                        value={formData.message} onChange={handleChange} 
                                        placeholder="How can we help?" 
                                        className="py-4 px-6 rounded-2xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 focus:border-[#F37021] focus:bg-slate-900/80 outline-none transition-all resize-none font-medium text-sm md:text-base shadow-inner"
                                    />
                                </div>

                                <button 
                                    type="submit" disabled={status.loading} 
                                    className="w-full bg-gradient-to-r from-[#F37021] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black py-4 md:py-5 rounded-2xl transition-all shadow-[0_10px_25px_rgba(243,112,33,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none text-sm md:text-base uppercase tracking-[0.2em]"
                                >
                                    {status.loading ? <FiLoader className="animate-spin" /> : <FiSend />} 
                                    {status.loading ? "Transmitting..." : "Submit Inquiry"}
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
        <div className="flex items-start gap-4 group">
            <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-[#F37021] shrink-0 group-hover:scale-110 transition-transform shadow-inner">{icon}</div>
            <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</p>
                {isLink ? (
                    <a href={isLink} className="font-bold text-sm md:text-base text-slate-200 hover:text-orange-400 transition-colors break-words block mt-0.5">
                        {detail}
                    </a>
                ) : (
                    <p className="font-bold text-sm md:text-base text-slate-200 break-words mt-0.5">{detail}</p>
                )}
            </div>
        </div>
    );
}

function InputField({ label, name, type = "text", placeholder, value, onChange, error, errorMsg }) {
    return (
        <div className="flex flex-col relative">
            <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1">{label}</label>
            <div className="relative">
                <input 
                    required type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} 
                    className={`w-full py-4 px-6 rounded-2xl bg-slate-950/50 border text-white placeholder-slate-600 text-sm md:text-base font-medium outline-none transition-all shadow-inner ${
                        error ? 'border-red-500/50 bg-red-500/5 focus:border-red-500' : 'border-slate-800 focus:border-[#F37021] focus:bg-slate-900/80'
                    }`}
                />
                <AnimatePresence>
                    {error && (
                        <motion.span 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -bottom-6 left-2 text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5"
                        >
                            <FiAlertCircle size={12} /> {errorMsg}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}