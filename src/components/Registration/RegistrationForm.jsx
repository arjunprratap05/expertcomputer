import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { 
    FiUser, FiMail, FiCheckCircle, FiFileText, 
    FiCamera, FiCalendar, FiX, FiRefreshCw, 
    FiAward, FiDollarSign, FiShield, FiArrowRight, FiLock,
    FiPhone, FiUpload, FiAlertTriangle, FiCheck
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

// --- AADHAAR VERIFICATION ALGORITHM ---
const validateAadhaar = (aadhaarString) => {
    if (!aadhaarString || aadhaarString.length !== 12 || !/^\d+$/.test(aadhaarString)) return false;
    const d = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]];
    const p = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]];
    let c = 0;
    const invertedArray = aadhaarString.split('').map(Number).reverse();
    for (let i = 0; i < invertedArray.length; i++) c = d[c][p[i % 8][invertedArray[i]]];
    return c === 0;
};

export default function RegistrationForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);
    const currentYear = 2026;
    const today = new Date().toISOString().split('T')[0];

    const [isVerified, setIsVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isValidatingImage, setIsValidatingImage] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, msg: "", type: "error" });
    const [selectedPrice, setSelectedPrice] = useState(0);
    const [showReview, setShowReview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [regSuccessData, setRegSuccessData] = useState(null);

    const [formData, setFormData] = useState({
        name: '', fatherName: '', dob: '', email: '', phone: '', aadhaarNo: '', address: '',
        highSchoolBoard: '', highSchoolYear: '', highSchoolPercent: '',
        interBoard: '', interYear: '', interPercent: '', course: '', studentImage: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const courseTitle = location.state?.selectedCourse || location.state?.prefillCourse;
        const coursePrice = location.state?.price || location.state?.fee;

        if (courseTitle) {
            const allCourses = [...(techCoursesData || []), ...(universityPrograms || [])];
            const match = allCourses.find(c => c.title === courseTitle || c.id === courseTitle);
            setFormData(prev => ({ ...prev, course: match ? match.title : courseTitle }));
            setSelectedPrice(match ? (match.price || match.fee) : (coursePrice || 0));
        }
    }, [location.state]);

    useEffect(() => {
        const loadModels = async () => {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
            } catch (err) { console.error("FaceAPI Load Error", err); }
        };
        loadModels();
    }, []);

    const triggerToast = (msg, type = "error") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "error" }), 5000);
    };

    const handleDobChange = (val) => {
        const year = new Date(val).getFullYear();
        if (year > currentYear) return triggerToast(`Year cannot be more than ${currentYear}`);
        setFormData({ ...formData, dob: val });
    };

    const handleAcademicYear = (prefix, val) => {
        const clean = val.replace(/\D/g, '');
        if (clean.length === 4 && parseInt(clean) > currentYear) return triggerToast(`Year cannot be more than ${currentYear}`);
        setFormData({ ...formData, [`${prefix}Year`]: clean });
    };

    const handlePercent = (prefix, val) => {
        if (parseFloat(val) > 100) return triggerToast("Percentage cannot exceed 100");
        setFormData({ ...formData, [`${prefix}Percent`]: val });
    };

    const handleSendOtp = async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return triggerToast("Invalid Email Format");
        setIsVerifying(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/send-otp`, { email: formData.email });
            if (res.data.success) { setOtpSent(true); triggerToast("OTP Sent Successfully", "success"); }
        } catch (err) { triggerToast(err.response?.data?.message || "Error sending OTP"); }
        finally { setIsVerifying(false); }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, { email: formData.email, otp });
            if (res.data.success) { setIsVerified(true); }
        } catch (err) { triggerToast("Invalid Verification Code."); }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsValidatingImage(true);
        try {
            const img = await faceapi.bufferToImage(file);
            const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
            if (detections.length !== 1) {
                triggerToast("Upload a clear photo with exactly one face.");
                e.target.value = "";
            } else {
                setFormData({ ...formData, studentImage: file });
                setPreviewImage(URL.createObjectURL(file));
            }
        } catch (e) { triggerToast("Biometric analysis failed."); }
        setIsValidatingImage(false);
    };

    const validateForm = () => {
        let tmp = {};
        if (!formData.name || formData.name.length < 3) tmp.name = "Enter valid name";
        if (!/^[6-9]\d{9}$/.test(formData.phone)) tmp.phone = "Enter 10-digit mobile";
        if (!validateAadhaar(formData.aadhaarNo)) tmp.aadhaarNo = "Invalid 12-digit Aadhaar";
        if (!formData.studentImage) tmp.image = "Photo Required";
        setErrors(tmp);
        return Object.keys(tmp).length === 0;
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'studentImage') data.append(key, formData[key]);
        });
        if (formData.studentImage) data.append('studentImage', formData.studentImage);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/registration/submit`, data);
            
            if (res.data.success) {
                setRegSuccessData({ 
                    regId: res.data.registrationId, 
                    pass: res.data.rawPassword,
                    isReturning: res.data.isReturning // Capture multi-enrollment flag
                });
                setShowReview(false);
            }
        } catch (err) { 
            const serverMsg = err.response?.data?.message || "Internal Server Error";
            triggerToast(serverMsg); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    return (
        <div className="min-h-screen py-6 bg-slate-50 relative overflow-x-hidden font-sans">
            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ y: -100, x: '-50%' }} animate={{ y: 20, x: '-50%' }} exit={{ y: -100, x: '-50%' }}
                        className={`fixed top-0 left-1/2 z-[3000] px-6 py-4 rounded-2xl shadow-2xl font-bold text-white flex items-center gap-3 ${toast.type === 'success' ? 'bg-[#1A5F7A]' : 'bg-red-600'}`}>
                        {toast.type === 'success' ? <FiCheckCircle /> : <FiAlertTriangle />} {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {regSuccessData && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[2000] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center border-t-[12px] border-[#1A5F7A]">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><FiCheck size={40} /></div>
                            <h2 className="text-3xl font-black text-slate-800 uppercase italic">
                                {regSuccessData.isReturning ? "Course Added!" : "Welcome!"}
                            </h2>
                            <p className="text-slate-500 font-bold mt-2 leading-relaxed">
                                {regSuccessData.isReturning 
                                    ? "Your profile has been updated with the new program. Access all your courses with one login." 
                                    : "Your enrollment is recorded. Credentials have been mailed to your official address."}
                            </p>
                            <div className="mt-8 space-y-4">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Registration ID</p>
                                    <p className="text-2xl font-mono font-bold text-[#1A5F7A]">{regSuccessData.regId}</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Access Key</p>
                                    <p className="text-2xl font-mono font-bold text-orange-600">
                                        {regSuccessData.isReturning ? "Use Existing Password" : regSuccessData.pass}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => navigate('/student-login')} className="w-full mt-8 py-5 bg-[#1A5F7A] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-transform">Enter Learning Portal</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto px-4">
                <AnimatePresence mode="wait">
                    {!isVerified ? (
                        <motion.div key="gate" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto mt-12 bg-white rounded-[2.5rem] shadow-2xl p-10 border border-orange-100">
                            <div className="w-16 h-16 bg-[#1A5F7A] text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-900/20"><FiShield size={32} /></div>
                            <h2 className="text-2xl font-black text-[#1A5F7A] uppercase text-center italic">Identity Verification</h2>
                            <div className="space-y-6 mt-10">
                                <InputField label="Official Email" icon={<FiMail />} value={formData.email} onChange={(v) => setFormData({...formData, email: v})} placeholder="Enter email to begin" />
                                {otpSent && <InputField label="Verification OTP" icon={<FiLock />} value={otp} onChange={setOtp} placeholder="6-digit code" />}
                                {!otpSent ? (
                                    <button onClick={handleSendOtp} disabled={isVerifying} className="w-full py-5 bg-[#1A5F7A] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20">
                                        {isVerifying ? <FiRefreshCw className="animate-spin" /> : "Request Access Code"} <FiArrowRight />
                                    </button>
                                ) : (
                                    <button onClick={handleVerifyOtp} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-green-900/20">Verify & Proceed</button>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="form" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] shadow-4xl overflow-hidden mb-10 border border-slate-100">
                            <div className="bg-[#1A5F7A] p-10 md:p-14 text-white relative">
                                <div className="absolute top-0 right-0 p-10 opacity-10"><FiAward size={150} /></div>
                                <span className="bg-orange-500 text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">Session 2026-27</span>
                                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">Admission Enrollment</h2>
                            </div>

                            <div className="p-8 md:p-16 space-y-16">
                                <div className="flex flex-col items-center">
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
                                    <div className="relative cursor-pointer group" onClick={() => fileInputRef.current.click()}>
                                        <div className={`w-40 h-40 md:w-52 md:h-52 bg-slate-50 rounded-[3.5rem] border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform ${isValidatingImage ? 'animate-pulse' : ''}`}>
                                            {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <FiCamera className="text-5xl text-slate-200" />}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-orange-600 p-4 rounded-2xl text-white shadow-xl group-hover:rotate-12 transition-transform"><FiUpload size={22} /></div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mt-6 tracking-[0.2em] italic">Biometric Facial Identity Required</p>
                                </div>

                                <div className="space-y-16">
                                    <section>
                                        <SectionTitle title="1. Identity & Physical Address" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                            <InputField label="Student Full Name" icon={<FiUser />} value={formData.name} error={errors.name} onChange={(v) => setFormData({...formData, name: v.replace(/[^a-zA-Z\s]/g, '')})} />
                                            <InputField label="Father's Full Name" icon={<FiUser />} value={formData.fatherName} onChange={(v) => setFormData({...formData, fatherName: v.replace(/[^a-zA-Z\s]/g, '')})} />
                                            <InputField label="Birth Date" icon={<FiCalendar />} type="date" value={formData.dob} onChange={handleDobChange} max={today} />
                                            <InputField label="Aadhaar ID Number" icon={<FiFileText />} maxLength={12} value={formData.aadhaarNo} error={errors.aadhaarNo} onChange={(v) => setFormData({...formData, aadhaarNo: v.replace(/\D/g, '')})} placeholder="12 Digit ID" />
                                            <InputField label="Primary Mobile" icon={<FiPhone />} maxLength={10} value={formData.phone} error={errors.phone} onChange={(v) => setFormData({...formData, phone: v.replace(/\D/g, '')})} />
                                            <InputField label="Home Address" placeholder="Street, City, Pincode" value={formData.address} onChange={(v) => setFormData({...formData, address: v})} />
                                        </div>
                                    </section>

                                    <section>
                                        <SectionTitle title="2. Academic History" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                            <AcademicBox title="X (Secondary)" prefix="highSchool" formData={formData} setFormData={setFormData} onYear={handleAcademicYear} onPercent={handlePercent} />
                                            <AcademicBox title="XII (Higher Secondary)" prefix="inter" formData={formData} setFormData={setFormData} onYear={handleAcademicYear} onPercent={handlePercent} />
                                        </div>
                                    </section>

                                    <section className="pt-6">
                                        <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-10 border-b-[8px] border-orange-500 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                                            <div className="text-center md:text-left z-10">
                                                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                                    <FiAward className="text-orange-400" size={20} />
                                                    <p className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Selected Program</p>
                                                </div>
                                                <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-tight">{formData.course}</h3>
                                            </div>
                                            <div className="h-px w-2/3 md:h-20 md:w-px bg-slate-700"></div>
                                            <div className="text-center md:text-right z-10">
                                                <div className="flex items-center justify-center md:justify-end gap-3 mb-3">
                                                    <FiDollarSign className="text-slate-400" size={20} />
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Course Fee</p>
                                                </div>
                                                <p className="text-5xl font-black text-orange-500 tracking-tighter">₹{selectedPrice?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <button onClick={() => { if(validateForm()) setShowReview(true); }} className="w-full py-8 bg-[#1A5F7A] text-white rounded-[2.5rem] text-xl font-black uppercase shadow-3xl flex items-center justify-center gap-5 transition-all hover:bg-slate-800 active:scale-95 shadow-blue-900/20">
                                    Continue to Final Review <FiArrowRight />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* FINAL REVIEW SLIDE-UP */}
            <AnimatePresence>
                {showReview && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1500] bg-slate-950/90 backdrop-blur-md flex items-end md:items-center justify-center">
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} className="bg-white rounded-t-[3rem] md:rounded-[4rem] w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
                            <div className="p-10 bg-orange-50 flex justify-between items-center border-b">
                                <h2 className="text-2xl font-black text-slate-800 uppercase italic">Confirm Enrollment Details</h2>
                                <button onClick={() => setShowReview(false)} className="p-3 bg-white rounded-full text-slate-400 shadow-md hover:text-red-500 transition-colors"><FiX size={24} /></button>
                            </div>
                            <div className="p-8 md:p-12 overflow-y-auto space-y-10">
                                <div className="flex items-center gap-6 pb-8 border-b">
                                    <img src={previewImage} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-xl" />
                                    <div>
                                        <p className="text-3xl font-black text-slate-800 leading-none">{formData.name}</p>
                                        <p className="text-sm font-bold text-orange-600 mt-2 uppercase tracking-widest">{formData.course}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <ReviewItem label="Email Identity" value={formData.email} />
                                    <ReviewItem label="Aadhaar ID" value={formData.aadhaarNo} />
                                    <ReviewItem label="Phone Contact" value={formData.phone} />
                                    <ReviewItem label="Birth Date" value={formData.dob} />
                                    <ReviewItem label="Parent Name" value={formData.fatherName} />
                                    <ReviewItem label="Residential Address" value={formData.address} />
                                </div>
                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800 text-[11px] font-bold leading-relaxed">
                                    By confirming, you agree that your facial biometric and Aadhaar identity will be used for session security and certificate generation.
                                </div>
                            </div>
                            <div className="p-8 md:p-12 bg-slate-50 flex flex-col-reverse sm:flex-row gap-6 border-t">
                                <button onClick={() => setShowReview(false)} className="flex-1 py-5 font-black uppercase text-xs tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Modify Profile</button>
                                <button onClick={handleFinalSubmit} disabled={isSubmitting} className="flex-[2] py-5 bg-[#1A5F7A] text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 active:scale-95 transition-transform">
                                    {isSubmitting ? <FiRefreshCw className="animate-spin" /> : "Confirm & Send Credentials"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SectionTitle({ title }) {
    return <h4 className="text-[12px] font-black text-[#1A5F7A] uppercase flex items-center gap-4 tracking-[0.2em]"><span className="h-6 w-2 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></span>{title}</h4>;
}

function InputField({ label, icon, type = "text", value, onChange, maxLength, error, placeholder, max }) {
    return (
        <div className="w-full text-left">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 mb-3 block tracking-widest">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
                <input type={type} max={max} maxLength={maxLength} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} 
                    className={`w-full text-sm ${icon ? 'pl-14' : 'px-8'} py-5 bg-slate-50 border-2 rounded-[1.5rem] md:rounded-[2rem] outline-none font-bold text-slate-700 transition-all ${error ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-orange-500 focus:bg-white focus:shadow-xl focus:shadow-orange-500/5'}`} />
            </div>
            {error && <p className="text-[10px] text-red-500 font-black mt-3 ml-6 italic flex items-center gap-2"><FiAlertTriangle size={12} /> {error}</p>}
        </div>
    );
}

function AcademicBox({ title, prefix, formData, setFormData, onYear, onPercent }) {
    return (
        <div className="p-8 bg-slate-50/50 rounded-[3rem] border-2 border-slate-100 space-y-6 shadow-sm">
            <p className="text-[11px] font-black text-[#1A5F7A] uppercase tracking-widest flex items-center gap-3"><FiAward className="text-orange-500" /> {title}</p>
            <InputField label="Full Board Name" value={formData[`${prefix}Board`]} onChange={(v) => setFormData({...formData, [`${prefix}Board`]: v})} />
            <div className="grid grid-cols-2 gap-5">
                <InputField label="Pass Year" maxLength={4} value={formData[`${prefix}Year`]} onChange={(v) => onYear(prefix, v)} />
                <InputField label="Percentage" value={formData[`${prefix}Percent`]} onChange={(v) => onPercent(prefix, v)} />
            </div>
        </div>
    );
}

function ReviewItem({ label, value }) {
    return (
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">{label}</p>
            <p className="font-bold text-slate-700 truncate text-sm leading-none">{value || 'Not Specified'}</p>
        </div>
    );
}