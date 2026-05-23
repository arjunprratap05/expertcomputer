import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FiLock, FiUser, FiShield, FiArrowRight, 
    FiAlertCircle, FiEye, FiEyeOff, FiLoader 
} from "react-icons/fi";
import expertcomputerlogo from "../../assets/expertcomputerlogo.jpeg";

export default function LoginDashboard() {
    // State management
    const [regId, setRegId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    /**
     * EFFECT: Scroll to top on component mount
     */
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    /**
     * HANDLER: Real Form Submission with Axios
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
                registrationId: regId.trim(),
                password: password
            });
    
            if (response.data.success) {
                localStorage.clear(); 
                localStorage.setItem("studentToken", response.data.token);
                localStorage.setItem("studentData", JSON.stringify(response.data.student));
                
                navigate("/erp/profile");
            }
        } catch (err) {
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
        // The pt-28 wrapper prevents collision with your top navigation bar
        <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4 pt-28 pb-12 font-sans selection:bg-[#F37021]/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-[400px] w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden"
            >
                {/* --- HEADER SECTION --- */}
                <div className="bg-[#1A5F7A] pt-12 pb-8 px-8 text-center relative overflow-hidden">
                    {/* Decorative Top-Right Circle */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-black/5 rounded-full -mr-20 -mt-20 pointer-events-none" />
                    
                    {/* Logo inside White Box */}
                    <div className="bg-white inline-block px-4 py-2 rounded-sm shadow-md mb-6 relative z-10">
                        <img
                            src={expertcomputerlogo}
                            className="h-10 object-contain"
                            alt="Expert Computer Academy Logo"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150x50?text=ECA+LOGO"; }}
                        />
                    </div>
                    
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white relative z-10 flex items-center justify-center gap-1.5">
                        STUDENT <span className="text-[#F37021]">ERP</span> PORTAL
                    </h2>
                    <p className="text-blue-100/70 text-[9px] font-bold uppercase tracking-[0.2em] mt-2 relative z-10">
                        Expert Computer Academy
                    </p>
                </div>

                {/* --- FORM SECTION --- */}
                <div className="p-8 md:p-10 pt-8">
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
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400 group-focus-within:text-[#F37021] transition-colors">
                                Registration ID
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#F37021] transition-colors text-lg" />
                                <input
                                    type="text"
                                    required
                                    autoComplete="off"
                                    placeholder="ECA/2026/XXXX"
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#EEF2F6] rounded-xl border-2 border-transparent focus:border-[#F37021]/40 focus:bg-[#EEF2F6] focus:ring-0 outline-none font-bold text-slate-800 transition-all placeholder:text-slate-400"
                                    value={regId}
                                    onChange={(e) => setRegId(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="group space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-[#1A5F7A] uppercase tracking-widest group-focus-within:text-[#F37021] transition-colors">
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
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#F37021] transition-colors text-lg" />
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-12 py-3.5 bg-[#EEF2F6] rounded-xl border-2 border-transparent focus:border-[#F37021]/40 focus:bg-[#EEF2F6] focus:ring-0 outline-none font-bold text-slate-800 transition-all placeholder:text-slate-400 tracking-widest"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    tabIndex="-1"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-[#F37021] text-white py-4 mt-2 rounded-xl font-black uppercase text-[12px] tracking-[0.15em] shadow-[0_8px_20px_-6px_rgba(243,112,33,0.6)] hover:bg-[#e0631b] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <FiLoader className="animate-spin text-lg" /> Authenticating...
                                </>
                            ) : (
                                <>
                                    Access Portal <FiArrowRight className="text-lg mb-0.5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Security Note */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-2">
                            <FiShield size={14} className="text-green-500" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encrypted Gateway</span>
                        </div>
                        <p className="text-[8px] text-slate-300 uppercase font-bold tracking-wider mt-1">© 2026 Expert Computer Academy • ERP v2.4.0</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}