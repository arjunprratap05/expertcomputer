import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FiLock, FiUser, FiShield, FiArrowRight, 
    FiAlertCircle, FiEye, FiEyeOff, FiLoader 
} from "react-icons/fi";
import expertcomputerlogo from "../../assets/expertcomputerlogo.jpeg";

export default function StudentLogin() {
    // State management
    const [regId, setRegId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    /**
     * EFFECT: Scroll to top on component mount
     * Critical for UX when navigating from long landing pages
     */
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    /**
     * HANDLER: Form Submission
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!regId.trim() || !password) {
            setError("Please enter both Registration ID and Password.");
            return;
        }
    
        setIsLoading(true);
        setError("");
    
        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
            
            const response = await axios.post(`${API_URL}/auth/login`, {
                registrationId: regId.trim(), // Removed .toUpperCase() to let regex handle it
                password: password
            });
    
            if (response.data.success) {
                localStorage.clear(); 
                localStorage.setItem("studentToken", response.data.token);
                // studentData now includes 'activeBatches' for the Multi-Course Sync
                localStorage.setItem("studentData", JSON.stringify(response.data.student));
                
                navigate("/erp/profile");
            }
        } catch (err) {
            // --- PROD FIX: Handle Activation Status ---
            if (err.response?.status === 403) {
                setError("PORTAL ACCESS PENDING: Your account is registered but awaiting admin activation.");
            } else {
                const message = err.response?.data?.msg || "Identity verification failed. Please try again.";
                setError(message);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4 font-sans selection:bg-[#F37021]/30">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden"
            >
                {/* Header Section: High Visibility Logo */}
                <div className="bg-[#1A5F7A] p-10 text-center relative overflow-hidden">
                    {/* Decorative element for PROD feel */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                    
                    <img
                        src={expertcomputerlogo}
                        className="h-20 mx-auto mb-4 drop-shadow-2xl object-contain relative z-10"
                        alt="Expert Academy Logo"
                        // Error fallback for logo
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=ECA+LOGO"; }}
                    />
                    
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white relative z-10">
                        Student <span className="text-[#F37021]">ERP</span> Portal
                    </h2>
                    <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 relative z-10">
                        Expert Computer Academy
                    </p>
                </div>

                <div className="p-8 md:p-10">
                    {/* Error Feedback Section */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100 shadow-sm"
                            >
                                <FiAlertCircle className="shrink-0 text-red-500" size={18} /> 
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Registration ID Input */}
                        <div className="group space-y-2">
                            <label className="text-[10px] font-black text-[#1A5F7A] uppercase tracking-widest ml-1 transition-colors group-focus-within:text-[#F37021]">
                                Registration ID
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#F37021] transition-colors" />
                                <input
                                    autoFocus
                                    required
                                    type="text"
                                    placeholder="ECA/2026/XXXX"
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#F37021]/20 focus:bg-white focus:ring-4 focus:ring-[#F37021]/5 outline-none font-bold text-[#1A5F7A] transition-all placeholder:text-slate-300"
                                    value={regId}
                                    onChange={(e) => setRegId(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="group space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-[#1A5F7A] uppercase tracking-widest transition-colors group-focus-within:text-[#F37021]">
                                    Secure Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-[9px] font-black uppercase text-[#F37021] hover:text-[#1A5F7A] transition-colors tracking-tighter"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#F37021] transition-colors" />
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#F37021]/20 focus:bg-white focus:ring-4 focus:ring-[#F37021]/5 outline-none font-bold text-[#1A5F7A] transition-all placeholder:text-slate-300"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    tabIndex="-1"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1A5F7A] transition-colors p-1"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-[#F37021] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_10px_25px_-5px_rgba(243,112,33,0.4)] hover:bg-[#1A5F7A] hover:shadow-[0_10px_25px_-5px_rgba(26,95,122,0.4)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <FiLoader className="animate-spin" /> Authenticating...
                                </>
                            ) : (
                                <>
                                    Access Portal <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Security Note */}
                    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-slate-400">
                            <FiShield size={14} className="text-green-500" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">End-to-End Encrypted Gateway</span>
                        </div>
                        <p className="text-[8px] text-slate-300 uppercase font-medium">© 2026 Expert Computer Academy • ERP v2.4.0</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}