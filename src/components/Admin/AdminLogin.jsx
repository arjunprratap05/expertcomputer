import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiUser, FiShield } from 'react-icons/fi';

export default function AdminLogin() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL;
            const res = await axios.post(`${API_URL}/admin/login`, credentials);
            
            if (res.data.success) {
                // Store all necessary session data
                localStorage.setItem("adminToken", res.data.token);
                localStorage.setItem("userRole", res.data.role); 
                localStorage.setItem("isAdminAuthenticated", "true");
                navigate('/admin/dashboard');
            }
        } catch (err) {
            alert(err.response?.data?.message || "Login failed. Check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <form onSubmit={handleLogin} className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-100">
                <div className="flex justify-center mb-6">
                    <div className="bg-[#F37021]/10 p-4 rounded-full">
                        <FiShield className="text-4xl text-[#F37021]" />
                    </div>
                </div>
                <h2 className="text-3xl font-black mb-2 text-[#1A5F7A] text-center tracking-tighter uppercase">Admin Access</h2>
                <p className="text-slate-500 text-center mb-8 text-xs font-bold uppercase tracking-widest">Expert Computer Academy</p>
                
                <div className="space-y-4">
                    <div className="relative">
                        <FiUser className="absolute left-4 top-4 text-slate-400" />
                        <input 
                            type="text" placeholder="Username" required
                            className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#F37021] font-bold"
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        />
                    </div>
                    <div className="relative">
                        <FiLock className="absolute left-4 top-4 text-slate-400" />
                        <input 
                            type="password" placeholder="Password" required
                            className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#F37021] font-bold"
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        />
                    </div>
                    <button 
                        disabled={loading}
                        className="w-full py-5 bg-[#F37021] text-white font-black rounded-2xl hover:bg-[#1A5F7A] transition-all shadow-xl uppercase tracking-widest"
                    >
                        {loading ? "Verifying..." : "Authorize Access"}
                    </button>
                </div>
            </form>
        </div>
    );
}