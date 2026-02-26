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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100"
            >
                <button onClick={() => navigate(-1)} className="group text-slate-400 hover:text-[#1A5F7A] flex items-center gap-2 text-xs font-bold uppercase mb-8 transition-colors">
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Login
                </button>

                <h2 className="text-2xl font-black text-[#1A5F7A] uppercase tracking-tighter italic mb-2">
                    Reset <span className="text-[#F37021]">Portal</span> Access
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">Follow steps to recover your account</p>

                {/* Status Messages */}
                <AnimatePresence mode="wait">
                    {statusMsg.text && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-[10px] font-bold uppercase border ${
                                statusMsg.type === "error" ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-700 border-green-100"
                            }`}
                        >
                            {statusMsg.type === "error" ? <FiAlertCircle size={16}/> : <FiCheckCircle size={16}/>}
                            {statusMsg.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {step === 1 ? (
                    <form onSubmit={handleRequest} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#1A5F7A] uppercase tracking-widest ml-1">Registration ID</label>
                            <div className="relative">
                                <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="ECA/2026/XXX" 
                                    value={registrationId} 
                                    onChange={(e) => setRegistrationId(e.target.value)} 
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#F37021] font-bold text-sm transition-all" 
                                />
                            </div>
                        </div>
                        <button disabled={isLoading} className="w-full bg-[#1A5F7A] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-[#F37021] transition-all disabled:opacity-50">
                            {isLoading ? "Verifying ID..." : "Send Verification OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#1A5F7A] uppercase tracking-widest ml-1">Enter OTP</label>
                                <input 
                                    required 
                                    type="text" 
                                    maxLength="6"
                                    placeholder="000000" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)} 
                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#F37021] font-bold text-sm text-center tracking-[1em]" 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#1A5F7A] uppercase tracking-widest ml-1">New Secure Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        required 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#F37021] font-bold text-sm transition-all" 
                                    />
                                </div>
                            </div>
                        </div>
                        <button disabled={isLoading} className="w-full bg-[#F37021] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-[#1A5F7A] transition-all disabled:opacity-50">
                            {isLoading ? "Updating..." : "Update Password & Login"}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
                    <FiShield size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Self-Service Recovery</span>
                </div>
            </motion.div>
        </div>
    );
}