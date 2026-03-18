import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiTag, FiChevronRight, FiChevronLeft, FiSave, FiTrash2, 
    FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function CouponManager({ triggerToast }) {
    const [step, setStep] = useState(1);
    const [coupons, setCoupons] = useState([]);
    const token = localStorage.getItem("adminToken");

    // Unified Form State to prevent data loss between steps
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        validFrom: "",
        validTo: "",
        maxUsage: "",
        type: "PROMOTIONAL",
        courseCode: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        isActive: true
    });

    const allCourses = useMemo(() => [...techCoursesData, ...universityPrograms], []);

    // Validate if Step 1 is complete
    const isStep1Valid = formData.code && formData.validFrom && formData.validTo && formData.maxUsage;

    useEffect(() => { fetchCoupons(); }, []);

    const fetchCoupons = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/coupons`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(res.data.data || []);
        } catch (err) { console.error("Sync Error"); }
    };

    const handleFinalSave = async () => {
        // 1. Prepare Final Payload with Number conversion
        const finalPayload = { 
            ...formData,
            maxUsage: Number(formData.maxUsage),
            discountValue: Number(formData.discountValue)
        };

        // 2. Log for debugging (Check your browser console!)
        console.log("SENDING TO BACKEND:", finalPayload);

        try {
            const res = await axios.post(`${API_URL}/admin/coupons`, finalPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data.success) {
                triggerToast("COUPON ACTIVATED SUCCESSFULLY");
                setStep(1);
                setFormData({
                    code: "", description: "", validFrom: "", validTo: "", 
                    maxUsage: "", type: "PROMOTIONAL", courseCode: "", 
                    discountType: "PERCENTAGE", discountValue: "", isActive: true
                });
                fetchCoupons();
            }
        } catch (err) { 
            console.error("API ERROR:", err.response?.data);
            alert(`Error: ${err.response?.data?.message || "Check console for details"}`); 
        }
    };

    return (
        <div className="space-y-6 text-left pb-20">
            {/* Step Progress Bar */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm w-fit">
                <div className={`px-4 py-1 rounded-full text-[10px] font-black ${step === 1 ? 'bg-[#1A5F7A] text-white' : 'bg-slate-100 text-slate-400'}`}>1. PARAMETERS</div>
                <FiChevronRight className="text-slate-300" />
                <div className={`px-4 py-1 rounded-full text-[10px] font-black ${step === 2 ? 'bg-[#F37021] text-white' : 'bg-slate-100 text-slate-400'}`}>2. MAPPING</div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2rem] border shadow-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Coupon Code*</label>
                            <input className="w-full p-3 bg-slate-50 border rounded-xl font-bold uppercase" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="E.G. FESTIVE50" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Usage Limit*</label>
                            <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.maxUsage} onChange={e => setFormData({...formData, maxUsage: e.target.value})} placeholder="How many students can use this?" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Valid From*</label>
                            <input type="date" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Valid To*</label>
                            <input type="date" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.validTo} onChange={e => setFormData({...formData, validTo: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Description*</label>
                            <input className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="E.G. Diwali Special Discount" />
                        </div>
                        <div className="md:col-span-2 flex justify-end pt-4 border-t">
                            <button disabled={!isStep1Valid} onClick={() => setStep(2)} className="bg-[#1A5F7A] text-white px-10 py-3 rounded-xl font-black text-xs shadow-lg disabled:opacity-20 hover:bg-[#F37021] transition-all">
                                NEXT: MAP COURSES <FiChevronRight className="inline ml-1"/>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2rem] border shadow-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Target Course*</label>
                            <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})}>
                                <option value="">-- Select Course --</option>
                                <option value="ALL">All Courses</option>
                                {allCourses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Discount Value*</label>
                            <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl font-black text-[#F37021]" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} placeholder="Value in % or ₹" />
                        </div>
                        
                        {/* Summary Box */}
                        <div className="md:col-span-2 bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden mt-4">
                           <div className="relative z-10">
                                <p className="text-[9px] font-black text-[#F37021] uppercase tracking-widest">Final Deploy Review</p>
                                <h4 className="text-2xl font-black italic">{formData.code}</h4>
                                <p className="text-xs opacity-60">Course: {formData.courseCode || "N/A"} | Value: {formData.discountValue}%</p>
                           </div>
                           <FiTag className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12" />
                        </div>

                        <div className="md:col-span-2 flex justify-between pt-6 border-t mt-4">
                            <button onClick={() => setStep(1)} className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1"><FiChevronLeft/> Edit Parameters</button>
                            <button onClick={handleFinalSave} className="bg-green-600 text-white px-10 py-3 rounded-xl font-black text-xs shadow-xl flex items-center gap-2">
                                <FiSave /> ACTIVATE COUPON
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Registry Table (Matches Image 1) */}
            <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden mt-10">
                <div className="bg-[#1A5F7A] p-4 text-white font-black text-[10px] uppercase tracking-widest">Live Coupon Registry</div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
                        <tr><th className="p-4">Course Code</th><th>Coupon Code</th><th>Disc Type</th><th>Value</th><th>Status</th></tr>
                    </thead>
                    <tbody className="divide-y text-[11px] font-bold">
                        {coupons.map(c => (
                            <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 uppercase text-[#1A5F7A]">{c.courseCode}</td>
                                <td className="font-black italic text-slate-400">{c.code}</td>
                                <td>{c.discountType}</td>
                                <td className="text-[#F37021]">{c.discountValue}%</td>
                                <td><span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-lg text-[9px]">ACTIVE</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}