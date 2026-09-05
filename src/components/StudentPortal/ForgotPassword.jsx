import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiShield, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); 
    const [registrationId, setRegistrationId] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
    const navigate = useNavigate();

    const handleRequest = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMsg({ type: "", text: "" });
        
        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL;
            // Normalizing RegID to Uppercase to match DB
            const res = await axios.post(`${API_URL}/auth/forgot-password-request`, { 
                registrationId: registrationId.trim().toUpperCase() 
            });
            
            if (res.data.success) {
                setStep(2);
                setStatusMsg({ type: "success", text: "OTP sent to your registered email!" });
            }
        } catch (err) {
            setStatusMsg({ 
                type: "error", 
                text: err.response?.data?.msg || "Account not found or service error." 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL;
            const res = await axios.post(`${API_URL}/auth/reset-password`, { 
                registrationId: registrationId.trim().toUpperCase(), 
                otp: otp.trim(), 
                newPassword 
            });
            
            if (res.data.success) {
                setStatusMsg({ type: "success", text: "Password Reset Successful! Redirecting..." });
                setTimeout(() => navigate('/student-login'), 2000);
            }
        } catch (err) {
            setStatusMsg({ type: "error", text: err.response?.data?.msg || "Invalid OTP or Reset failed." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070D1D] relative overflow-hidden flex items-center justify-center p-6 font-sans selection:bg-[#F37021]/30 selection:text-orange-200">
            
            {/* AMBIENT GLOWS & MESH BACKDROP */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="max-w-md w-full bg-[#0A192F]/80 backdrop-blur-xl rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-10 border border-slate-800 relative z-10"
            >
                <button onClick={() => navigate(-1)} className="group text-slate-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase mb-8 transition-colors">
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Login
                </button>

                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">
                    Reset <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200">Portal</span> Access
                </h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">Follow steps to recover your account</p>

                {/* Status Messages */}
                <AnimatePresence mode="wait">
                    {statusMsg.text && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-[10px] font-bold uppercase border shadow-sm backdrop-blur-md ${
                                statusMsg.type === "error" 
                                ? "bg-red-500/10 text-red-400 border-red-500/20" 
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}
                        >
                            {statusMsg.type === "error" ? <FiAlertCircle size={16} className="shrink-0"/> : <FiCheckCircle size={16} className="shrink-0"/>}
                            <span>{statusMsg.text}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {step === 1 ? (
                    <form onSubmit={handleRequest} className="space-y-6">
                        <div className="group space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-[#F37021] transition-colors">Registration ID</label>
                            <div className="relative">
                                <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#F37021] transition-colors" />
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="ECA/2026/XXX" 
                                    value={registrationId} 
                                    onChange={(e) => setRegistrationId(e.target.value)} 
                                    className="w-full pl-12 pr-6 py-4 bg-slate-900/50 rounded-2xl border border-slate-700 outline-none focus:border-[#F37021]/50 focus:bg-slate-900 focus:ring-0 font-bold text-white text-sm transition-all placeholder:text-slate-600 shadow-inner" 
                                />
                            </div>
                        </div>
                        <button disabled={isLoading} className="w-full bg-slate-800 text-slate-300 border border-slate-700 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all disabled:opacity-50 active:scale-95">
                            {isLoading ? "Verifying ID..." : "Send Verification OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} className="space-y-6">
                        <div className="space-y-4">
                            <div className="group space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-[#F37021] transition-colors">Enter OTP</label>
                                <input 
                                    required 
                                    type="text" 
                                    maxLength="6"
                                    placeholder="000000" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)} 
                                    className="w-full px-6 py-4 bg-slate-900/50 rounded-2xl border border-slate-700 outline-none focus:border-[#F37021]/50 focus:bg-slate-900 focus:ring-0 font-bold text-white text-sm text-center tracking-[1em] transition-all placeholder:text-slate-600 placeholder:tracking-normal shadow-inner" 
                                />
                            </div>
                            
                            <div className="group space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-[#F37021] transition-colors">New Secure Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#F37021] transition-colors" />
                                    <input 
                                        required 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        className="w-full pl-12 pr-6 py-4 bg-slate-900/50 rounded-2xl border border-slate-700 outline-none focus:border-[#F37021]/50 focus:bg-slate-900 focus:ring-0 font-bold text-white text-sm transition-all placeholder:text-slate-600 tracking-widest shadow-inner" 
                                    />
                                </div>
                            </div>
                        </div>
                        <button disabled={isLoading} className="w-full bg-gradient-to-r from-[#F37021] to-orange-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[0_8px_20px_rgba(243,112,33,0.3)] hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 active:scale-95">
                            {isLoading ? "Updating..." : "Update Password & Login"}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-center gap-2 text-slate-500">
                    <FiShield size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Self-Service Recovery</span>
                </div>
            </motion.div>
        </div>
    );
}