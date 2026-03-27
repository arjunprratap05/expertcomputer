import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiUser, FiShield, FiEye, FiEyeOff } from 'react-icons/fi'; // Added Eye icons

export default function AdminLogin() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for visibility toggle
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
            const res = await axios.post(`${API_URL}/admin/login`, credentials);
            
            if (res.data.success) {
                localStorage.setItem("adminToken", res.data.token);
                localStorage.setItem("userRole", res.data.role); 
                localStorage.setItem("isAdminAuthenticated", "true");
                // Optional: Store name if your backend returns it to match your Dashboard
                if(res.data.name) localStorage.setItem("adminName", res.data.name); 
                
                navigate('/admin/dashboard');
            }
        } catch (err) {
            alert(err.response?.data?.message || "Login failed. Check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-left">
            <form onSubmit={handleLogin} className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-100">
                <div className="flex justify-center mb-6">
                    <div className="bg-[#F37021]/10 p-4 rounded-full">
                        <FiShield className="text-4xl text-[#F37021]" />
                    </div>
                </div>
                
                <h2 className="text-3xl font-black mb-2 text-[#1A5F7A] text-center tracking-tighter uppercase italic">Admin Access</h2>
                <p className="text-slate-500 text-center mb-8 text-xs font-bold uppercase tracking-widest">Expert Computer Academy</p>
                
                <div className="space-y-4">
                    {/* USERNAME INPUT */}
                    <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Username" 
                            required
                            className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#F37021] font-bold transition-all"
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        />
                    </div>

                    {/* PASSWORD INPUT WITH TOGGLE */}
                    <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password" 
                            required
                            className="w-full p-4 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#F37021] font-bold transition-all"
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        />
                        {/* TOGGLE BUTTON */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1A5F7A] transition-colors"
                        >
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full py-5 bg-[#F37021] text-white font-black rounded-2xl hover:bg-[#1A5F7A] transition-all shadow-xl uppercase tracking-widest active:scale-95 disabled:opacity-70"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Verifying...
                            </span>
                        ) : "Authorize Access"}
                    </button>
                </div>
            </form>
        </div>
    );
}