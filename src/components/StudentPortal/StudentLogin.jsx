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
    const [regId, setRegId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                // OPTIMIZATION 1: Target only student session tokens instead of localStorage.clear()
                localStorage.removeItem("studentToken");
                localStorage.removeItem("studentData");

                localStorage.setItem("studentToken", response.data.token);
                localStorage.setItem("studentData", JSON.stringify(response.data.student));
                
                // Release loading state prior to navigation
                setIsLoading(false);

                // OPTIMIZATION 2: Replace history entry to navigate without transition backlog
                navigate("/erp/profile", { replace: true });
            }
        } catch (err) {
            setIsLoading(false);
            if (err.response?.status === 403) {
                setError("PORTAL ACCESS PENDING: Your account is registered but awaiting admin activation.");
            } else {
                const message = err.response?.data?.msg || "Identity verification failed. Please check your credentials.";
                setError(message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#070D1D] relative overflow-hidden flex items-center justify-center p-4 pt-28 pb-12 font-sans selection:bg-[#F37021]/30 selection:text-orange-200">
            
            {/* AMBIENT MESH BACKDROP */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="max-w-[400px] w-full bg-[#0A192F]/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden relative z-10"
            >
                {/* --- HEADER SECTION --- */}
                <div className="bg-slate-900/50 border-b border-slate-800 pt-10 pb-7 px-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#F37021]/5 rounded-full -mr-20 -mt-20 pointer-events-none blur-2xl" />
                    
                    <div className="bg-white inline-block px-3 py-2 rounded-xl shadow-inner mb-5 relative z-10 border border-slate-200">
                        <img
                            src={expertcomputerlogo}
                            className="h-10 object-contain"
                            alt="Expert Computer Academy Logo"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150x50?text=ECA+LOGO"; }}
                        />
                    </div>
                    
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white relative z-10 flex items-center justify-center gap-1.5">
                        STUDENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200">ERP</span> PORTAL
                    </h2>
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5 relative z-10">
                        Expert Computer Academy
                    </p>
                </div>

                {/* --- FORM SECTION --- */}
                <div className="p-8 md:p-10 pt-7">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-5 p-3.5 bg-red-500/10 text-red-400 rounded-2xl flex items-center gap-2.5 text-xs font-bold border border-red-500/20"
                            >
                                <FiAlertCircle className="shrink-0 text-red-500" size={16} /> 
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-5">
                        
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">
                                Registration ID
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                                <input
                                    type="text"
                                    required
                                    autoComplete="username"
                                    placeholder="ECA/2026/XXXX"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/60 rounded-xl border border-slate-700 focus:border-[#F37021] outline-none font-bold text-white text-sm transition-colors placeholder:text-slate-600"
                                    value={regId}
                                    onChange={(e) => setRegId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-[9px] font-black uppercase text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-12 py-3.5 bg-slate-900/60 rounded-xl border border-slate-700 focus:border-[#F37021] outline-none font-bold text-white text-sm transition-colors placeholder:text-slate-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    tabIndex="-1"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#F37021] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 mt-2 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                        >
                            {isLoading ? (
                                <>
                                    <FiLoader className="animate-spin text-base" /> Verifying...
                                </>
                            ) : (
                                <>
                                    Access Portal <FiArrowRight className="text-base" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-5 border-t border-slate-800 flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                            <FiShield size={13} className="text-emerald-500" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encrypted</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}