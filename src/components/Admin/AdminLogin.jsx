import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiUser, FiShield, FiEye, FiEyeOff, FiArrowRight, FiLoader, FiAlertCircle } from 'react-icons/fi';
import expertcomputerlogo from '../../assets/expertcomputerlogo.jpeg';

export default function AdminLogin() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const rawApi = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
            const API_BASE = rawApi.endsWith('/api') ? rawApi : `${rawApi}/api`;

            const res = await axios.post(`${API_BASE}/admin/login`, credentials);
            
            if (res.data.success) {
                // Ensure intro splash animation does not trigger when arriving from portal
                sessionStorage.setItem("hasSeenLoader", "true");
                localStorage.setItem("hasSeenLoader", "true");

                localStorage.setItem("adminToken", res.data.token);
                localStorage.setItem("userRole", res.data.role); 
                localStorage.setItem("isAdminAuthenticated", "true");
                if (res.data.name) localStorage.setItem("adminName", res.data.name); 
                
                navigate('/admin/dashboard', { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Identity verification failed. Please check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070D1D] relative overflow-hidden flex items-center justify-center p-4 font-sans text-left selection:bg-[#F37021]/30 selection:text-orange-200">
            
            {/* AMBIENT GLOW BACKDROP */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="max-w-[420px] w-full bg-[#0A192F]/85 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-slate-800 overflow-hidden relative z-10"
            >
                {/* HEADER SECTION */}
                <div className="bg-slate-900/60 border-b border-slate-800 pt-10 pb-7 px-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#F37021]/5 rounded-full -mr-20 -mt-20 pointer-events-none blur-2xl" />

                    <div className="bg-white inline-block px-3.5 py-2 rounded-xl shadow-inner mb-5 relative z-10 border border-slate-200">
                        <img 
                            src={expertcomputerlogo} 
                            alt="Expert Academy" 
                            className="h-10 object-contain"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150x50?text=ECA+LOGO"; }}
                        />
                    </div>

                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white relative z-10 flex items-center justify-center gap-1.5">
                        ADMIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200">PORTAL</span>
                    </h2>
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.25em] mt-1.5 relative z-10">
                        Expert Computer Academy Central
                    </p>
                </div>

                {/* FORM SECTION */}
                <div className="p-8 md:p-10 pt-7">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
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
                        {/* USERNAME */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">
                                Administrative Username
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                                <input 
                                    type="text" 
                                    placeholder="Username or Staff ID" 
                                    required
                                    autoComplete="username"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/60 rounded-xl border border-slate-700 focus:border-[#F37021] outline-none font-bold text-white text-sm transition-colors placeholder:text-slate-600 shadow-inner"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">
                                Master Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    required
                                    autoComplete="current-password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    className="w-full pl-11 pr-12 py-3.5 bg-slate-900/60 rounded-xl border border-slate-700 focus:border-[#F37021] outline-none font-bold text-white text-sm tracking-widest transition-colors placeholder:text-slate-600 shadow-inner"
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

                        {/* SUBMIT BUTTON */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#F37021] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 mt-2 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-orange-950/40 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin text-base" /> Verifying Credentials...
                                </>
                            ) : (
                                <>
                                    Authorize Access <FiArrowRight className="text-base" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* FOOTER ENCRYPTION BADGE */}
                    <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                            <FiShield size={13} className="text-emerald-500" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                Role-Based Access Control
                            </span>
                        </div>
                        <p className="text-[8px] text-slate-600 uppercase font-bold tracking-wider mt-1">
                            © 2026 Expert Computer Academy • Admin Suite
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}