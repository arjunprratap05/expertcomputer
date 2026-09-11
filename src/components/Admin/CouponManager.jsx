import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiTag, FiChevronRight, FiChevronLeft, FiSave, FiTrash2, 
    FiCheckCircle, FiAlertCircle, FiLayers, FiCalendar, FiUsers, FiLoader 
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

// Normalizes API base URL to prevent duplicate or missing '/api' paths
const rawApiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`;

export default function CouponManager({ triggerToast }) {
    const [step, setStep] = useState(1);
    const [coupons, setCoupons] = useState([]);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState("");
    const token = localStorage.getItem("adminToken");

    const showToast = (msg) => {
        if (triggerToast) {
            triggerToast(msg);
        } else {
            setNotification(msg);
            setTimeout(() => setNotification(""), 3500);
        }
    };

    const [formData, setFormData] = useState({
        code: "",
        description: "",
        validFrom: "",
        validTo: "",
        maxUsage: "",
        type: "PROMOTIONAL",
        courseCode: "ALL", // Default to "ALL" so it's always valid
        discountType: "PERCENTAGE",
        discountValue: "",
        isActive: true
    });

    const allCourses = useMemo(() => [...techCoursesData, ...universityPrograms], []);

    // 1. Fetch live coupons
    const fetchCoupons = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/coupons`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(res.data.data || res.data.coupons || []);
        } catch (err) { 
            console.error("Coupon Sync Error:", err); 
        }
    };

    useEffect(() => { 
        fetchCoupons(); 
    }, []);

    // 2. Real-time Duplicate Checking
    useEffect(() => {
        const cleanCode = (formData.code || "").trim().toUpperCase();
        if (!cleanCode) {
            setIsDuplicate(false);
            return;
        }
        const duplicate = coupons.some(c => (c.code || "").toUpperCase().trim() === cleanCode);
        setIsDuplicate(duplicate);
    }, [formData.code, coupons]);

    const isStep1Valid = Boolean(
        formData.code.trim() && 
        formData.validFrom && 
        formData.validTo && 
        formData.maxUsage && 
        !isDuplicate
    );

    const handleFinalSave = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        const cleanCode = formData.code.trim().toUpperCase();
        if (!cleanCode) return showToast("ENTER A VALID COUPON CODE");
        if (!formData.discountValue || Number(formData.discountValue) <= 0) {
            return showToast("ENTER A VALID DISCOUNT VALUE");
        }
        if (!formData.maxUsage || Number(formData.maxUsage) <= 0) {
            return showToast("ENTER USAGE LIMIT");
        }

        setLoading(true);
        const finalPayload = { 
            ...formData,
            code: cleanCode,
            courseCode: formData.courseCode || "ALL",
            maxUsage: Number(formData.maxUsage),
            discountValue: Number(formData.discountValue)
        };

        try {
            const res = await axios.post(`${API_BASE}/admin/coupons`, finalPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data?.success || res.status === 200 || res.status === 201) {
                showToast("COUPON ACTIVATED SUCCESSFULLY");
                setStep(1);
                setFormData({
                    code: "", 
                    description: "", 
                    validFrom: "", 
                    validTo: "", 
                    maxUsage: "", 
                    type: "PROMOTIONAL", 
                    courseCode: "ALL", 
                    discountType: "PERCENTAGE", 
                    discountValue: "", 
                    isActive: true
                });
                fetchCoupons();
            }
        } catch (err) { 
            console.error("Coupon Save Error:", err);
            showToast(err.response?.data?.message?.toUpperCase() || "DEPLOYMENT FAILED");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Permanently deactivate this voucher?")) return;
        try {
            await axios.delete(`${API_BASE}/admin/coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("COUPON REMOVED");
            fetchCoupons();
        } catch (err) {
            showToast("FAILED TO DELETE COUPON");
        }
    };

    return (
        <div className="space-y-8 text-left pb-20 max-w-6xl mx-auto">
            {/* LOCAL TOAST FALLBACK */}
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ y: -30, opacity: 0, x: "-50%" }} 
                        animate={{ y: 20, opacity: 1, x: "-50%" }} 
                        exit={{ y: -30, opacity: 0, x: "-50%" }} 
                        className="fixed top-4 left-1/2 bg-[#0A192F] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2.5 z-[9999] border border-slate-700 border-b-4 border-b-[#F37021]"
                    >
                        <FiAlertCircle className="text-[#F37021] text-base" /> {notification}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* 1. LIVE REGISTRY CARD */}
            <div className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="bg-slate-950 p-5 border-b border-slate-800 text-white font-black text-xs uppercase tracking-widest flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <FiTag className="text-[#F37021]" size={16} />
                        <span>Live Coupon Registry</span>
                    </div>
                    <span className="bg-orange-500/10 text-[#F37021] border border-orange-500/30 px-3 py-1 rounded-full text-[10px]">
                        {coupons.length} Active
                    </span>
                </div>
                
                <div className="max-h-64 overflow-y-auto no-scrollbar">
                    <table className="w-full text-left text-xs min-w-[650px]">
                        <thead className="bg-slate-900/90 text-[9px] font-black uppercase text-slate-400 border-b border-slate-800 sticky top-0 tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">Target Course</th>
                                <th>Coupon Code</th>
                                <th>Type</th>
                                <th>Discount</th>
                                <th className="pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 font-bold">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-500 uppercase tracking-widest text-[10px]">
                                        No coupons deployed yet. Initialize your first promotion below.
                                    </td>
                                </tr>
                            ) : (
                                coupons.map(c => (
                                    <tr key={c._id} className="hover:bg-slate-900/50 transition-colors">
                                        <td className="p-4 pl-6 uppercase text-slate-300 font-bold">
                                            {c.courseCode || "Global (All)"}
                                        </td>
                                        <td className="font-black italic text-white tracking-wider">
                                            {c.code}
                                        </td>
                                        <td className="text-slate-400 text-[10px]">
                                            {c.discountType}
                                        </td>
                                        <td className="text-[#F37021] font-black">
                                            {c.discountType === 'FLAT' ? `₹${c.discountValue}` : `${c.discountValue}%`}
                                        </td>
                                        <td className="pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md text-[9px] font-black tracking-wider">
                                                    ACTIVE
                                                </span>
                                                <button 
                                                    onClick={() => handleDeleteCoupon(c._id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors hover:bg-red-500/10"
                                                    title="Delete Voucher"
                                                >
                                                    <FiTrash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. STEPPER PROGRESS NAV */}
            <div className="flex items-center gap-3 bg-[#0A192F] p-2 rounded-2xl border border-slate-800 w-fit shadow-md">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-wider transition-all uppercase ${
                        step === 1 
                            ? 'bg-[#1A5F7A] text-white shadow-md' 
                            : 'text-slate-400 hover:text-white'
                    }`}
                >
                    1. Campaign Parameters
                </button>
                <FiChevronRight className="text-slate-600" />
                <button
                    type="button"
                    disabled={!isStep1Valid}
                    onClick={() => isStep1Valid && setStep(2)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-wider transition-all uppercase ${
                        step === 2 
                            ? 'bg-[#F37021] text-white shadow-md' 
                            : 'text-slate-500 disabled:opacity-40'
                    }`}
                >
                    2. Course Mapping & Finalize
                </button>
            </div>

            {/* 3. STEPPER FORM VIEWPORT */}
            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div 
                        key="s1" 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden"
                    >
                        <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Coupon Code*
                            </label>
                            <div className="relative">
                                <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-900 border rounded-2xl font-black uppercase text-sm text-white outline-none focus:border-[#F37021] transition-all shadow-inner placeholder:text-slate-600 ${
                                        isDuplicate ? 'border-red-500 ring-1 ring-red-500/50' : 'border-slate-800'
                                    }`} 
                                    value={formData.code} 
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
                                    placeholder="E.G. FESTIVE50" 
                                />
                            </div>
                            {isDuplicate && (
                                <p className="text-red-400 text-[10px] font-bold mt-1.5 flex items-center gap-1 ml-1">
                                    <FiAlertCircle /> CODE ALREADY REGISTERED IN VAULT
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Total Redemptions Allowed*
                            </label>
                            <div className="relative">
                                <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="number" 
                                    min="1"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl font-bold text-sm text-white outline-none focus:border-[#F37021] transition-all shadow-inner placeholder:text-slate-600" 
                                    value={formData.maxUsage} 
                                    onChange={e => setFormData({ ...formData, maxUsage: e.target.value })} 
                                    placeholder="e.g. 100" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Valid From*
                            </label>
                            <input 
                                type="date" 
                                className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-2xl font-bold text-xs text-white outline-none focus:border-[#F37021] shadow-inner" 
                                value={formData.validFrom} 
                                onChange={e => setFormData({ ...formData, validFrom: e.target.value })} 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Valid To (Expiry)*
                            </label>
                            <input 
                                type="date" 
                                className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-2xl font-bold text-xs text-white outline-none focus:border-[#F37021] shadow-inner" 
                                value={formData.validTo} 
                                onChange={e => setFormData({ ...formData, validTo: e.target.value })} 
                            />
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Promotion Summary / Notes
                            </label>
                            <input 
                                className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-2xl font-bold text-xs text-white outline-none focus:border-[#F37021] shadow-inner placeholder:text-slate-600" 
                                value={formData.description} 
                                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                                placeholder="e.g. Exclusive Diwali Admission Discount" 
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-800">
                            <button 
                                type="button"
                                disabled={!isStep1Valid} 
                                onClick={() => setStep(2)} 
                                className="bg-[#1A5F7A] hover:bg-[#F37021] text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg disabled:opacity-30 transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                            >
                                Next: Map Program & Value <FiChevronRight />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="s2" 
                        initial={{ opacity: 0, x: 10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -10 }}
                        className="bg-[#0A192F]/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Applicable Academic Track*
                            </label>
                            <select 
                                className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-2xl font-bold text-xs text-white outline-none focus:border-[#F37021] cursor-pointer shadow-inner" 
                                value={formData.courseCode} 
                                onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                            >
                                <option value="ALL">All Programs (Global Voucher)</option>
                                {allCourses.map(c => (
                                    <option key={c.id || c.title} value={c.title}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                Deduction Strategy
                            </label>
                            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                                <button 
                                    type="button" 
                                    onClick={() => setFormData({ ...formData, discountType: 'PERCENTAGE' })} 
                                    className={`flex-1 py-2.5 rounded-lg font-black text-[10px] uppercase transition-all ${
                                        formData.discountType === 'PERCENTAGE' ? 'bg-[#1A5F7A] text-white shadow-sm' : 'text-slate-400'
                                    }`}
                                >
                                    % Percentage
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setFormData({ ...formData, discountType: 'FLAT' })} 
                                    className={`flex-1 py-2.5 rounded-lg font-black text-[10px] uppercase transition-all ${
                                        formData.discountType === 'FLAT' ? 'bg-[#1A5F7A] text-white shadow-sm' : 'text-slate-400'
                                    }`}
                                >
                                    ₹ Flat Amount
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-[#F37021] tracking-widest ml-1">
                                Discount Magnitude ({formData.discountType === 'PERCENTAGE' ? '%' : '₹'})*
                            </label>
                            <input 
                                type="number" 
                                min="1"
                                className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-2xl font-black text-xl text-white outline-none focus:border-[#F37021] text-center shadow-inner" 
                                value={formData.discountValue} 
                                onChange={e => setFormData({ ...formData, discountValue: e.target.value })} 
                                placeholder={formData.discountType === 'PERCENTAGE' ? "e.g. 20" : "e.g. 2000"} 
                            />
                        </div>

                        {/* FINAL PREVIEW CONTAINER */}
                        <div className="md:col-span-2 bg-slate-950 p-6 rounded-3xl border border-slate-800 text-white relative overflow-hidden mt-2 shadow-inner">
                            <div className="relative z-10">
                                <p className="text-[9px] font-black text-[#F37021] uppercase tracking-[0.2em]">Deployment Review</p>
                                <h4 className="text-2xl font-black italic tracking-wide mt-1 text-white">{formData.code}</h4>
                                <p className="text-xs text-slate-400 mt-1">
                                    Target: <span className="text-slate-200 font-bold">{formData.courseCode === "ALL" ? "All Programs (Global)" : formData.courseCode}</span> • Value: <span className="text-emerald-400 font-bold">{formData.discountType === 'FLAT' ? `₹${formData.discountValue || 0}` : `${formData.discountValue || 0}%`}</span>
                                </p>
                            </div>
                            <FiTag className="absolute -right-4 -bottom-4 text-9xl text-slate-900 pointer-events-none rotate-12" />
                        </div>

                        <div className="md:col-span-2 flex justify-between items-center pt-6 border-t border-slate-800 mt-2">
                            <button 
                                type="button"
                                onClick={() => setStep(1)} 
                                className="text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <FiChevronLeft /> Back to Parameters
                            </button>
                            <button 
                                type="button"
                                disabled={loading || !formData.discountValue || Number(formData.discountValue) <= 0}
                                onClick={handleFinalSave} 
                                className="bg-[#F37021] hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-950/40 flex items-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                {loading ? (
                                    <><FiLoader className="animate-spin text-base" /> Committing...</>
                                ) : (
                                    <><FiSave /> Activate Coupon</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}