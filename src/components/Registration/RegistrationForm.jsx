import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from 'face-api.js';
import { 
    FiUser, FiMail, FiPhone, FiCheckCircle, FiUpload, 
    FiFileText, FiCamera, FiAward, FiCalendar, FiLock, FiAlertTriangle, FiBookOpen 
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';
import axios from 'axios';

// --- ROBUST AADHAAR VERHOEFF ALGORITHM ---
const validateAadhaar = (aadhaarString) => {
    if (!aadhaarString || aadhaarString.length !== 12 || !/^\d+$/.test(aadhaarString)) {
        return false;
    }

    const d = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];
    const p = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];

    let c = 0;
    const invertedArray = aadhaarString.split('').map(Number).reverse();

    for (let i = 0; i < invertedArray.length; i++) {
        c = d[c][p[i % 8][invertedArray[i]]];
    }

    return c === 0;
};

export default function RegistrationForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);
    
    const today = new Date().toISOString().split('T')[0]; 
    const dynamicCurrentYear = new Date().getFullYear(); 
    
    const [isVerified, setIsVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isValidatingImage, setIsValidatingImage] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, msg: "" });
    const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '', fatherName: '', dob: '', email: '', phone: '', aadhaarNo: '', address: '',
        highSchoolBoard: '', highSchoolYear: '', highSchoolPercent: '',
        interBoard: '', interYear: '', interPercent: '',
        course: '', studentImage: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    // Scroll to Top Logic
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (toast.show) {
            const t = setTimeout(() => setToast({ show: false, msg: "" }), 4000);
            return () => clearTimeout(t);
        }
    }, [toast.show]);

    useEffect(() => {
        let interval;
        if (timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        const target = location.state?.prefillCourse;
        if (target) {
            const matched = [...techCoursesData, ...universityPrograms].find(c => c.id === target || c.title === target);
            if (matched) { setSelectedCourseDetails(matched); setFormData(p => ({...p, course: matched.title})); }
        }
        const loadModels = async () => {
            await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
        };
        loadModels();
    }, [location]);

    const triggerToast = (msg) => setToast({ show: true, msg });

    const handleDobChange = (val) => {
        const selectedDate = new Date(val);
        if (selectedDate > new Date()) {
            triggerToast("Error: DOB cannot be in the future.");
            return;
        }
        setFormData({...formData, dob: val});
    };

    const validateForm = () => {
        let tempErrors = {};
        if (!formData.name || formData.name.trim().length < 3) tempErrors.name = "Enter a valid full name.";
        if (!/^[6-9]\d{9}$/.test(formData.phone)) tempErrors.phone = "Invalid 10-digit mobile number.";
        
        // Final Aadhaar Check on Submit
        if (!validateAadhaar(formData.aadhaarNo)) {
            tempErrors.aadhaarNo = "Invalid Aadhaar Checksum.";
        }

        const checkAcademic = (yr, pct, prefix) => {
            const y = parseInt(yr);
            const p = parseFloat(pct);
            if (!yr || y < 1960 || y > dynamicCurrentYear) tempErrors[`${prefix}Year`] = "Invalid year.";
            if (!pct || p < 0 || p > 100) tempErrors[`${prefix}Percent`] = "Percentage invalid.";
        };
        checkAcademic(formData.highSchoolYear, formData.highSchoolPercent, 'highSchool');
        checkAcademic(formData.interYear, formData.interPercent, 'inter');

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const sendOTP = async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return triggerToast("Invalid Email Format");
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/send-otp`, { email: formData.email });
            setOtpSent(true); setTimer(30);
        } catch (err) { triggerToast(err.response?.data?.msg || "Server is busy. Try later."); }
    };

    const verifyOTP = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, { email: formData.email, otp });
            if (res.data.success) setIsVerified(true);
        } catch (err) { triggerToast("Incorrect OTP entered."); }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsValidatingImage(true);
        try {
            const img = await faceapi.bufferToImage(file);
            const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
            if (detections.length !== 1) {
                triggerToast("Upload clear photo with exactly ONE face.");
                e.target.value = "";
            } else {
                setFormData({ ...formData, studentImage: file });
                setPreviewImage(URL.createObjectURL(file));
            }
        } catch (e) { triggerToast("AI Face detection failed."); }
        setIsValidatingImage(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isVerified) return triggerToast("Verify email before submission.");
        if (!validateForm()) return window.scrollTo({ top: 300, behavior: 'smooth' });
        
        const data = new FormData();
        Object.keys(formData).forEach(k => data.append(k, formData[k]));
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/registration/submit`, data);
            setIsSubmitted(true);
            setTimeout(() => navigate('/'), 5000);
        } catch (err) { triggerToast("Submission failed. Ensure Aadhaar is unique."); }
    };

    if (isSubmitted) return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <motion.div initial={{scale:0.8}} animate={{scale:1}} className="text-center p-12 bg-slate-50 rounded-[4rem] border shadow-xl">
                <FiCheckCircle className="text-7xl text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-[#1A5F7A]">SUCCESSFUL</h2>
                <p className="text-slate-500 italic">Welcome to the Academy!</p>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen py-16 bg-slate-50 font-sans relative">
            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 50 }} exit={{ opacity: 0, y: -50 }}
                        className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-[#1A5F7A] text-white px-8 py-4 rounded-b-3xl shadow-2xl flex items-center gap-3 font-bold uppercase text-xs tracking-widest border-t-4 border-orange-500">
                        <FiAlertTriangle className="text-orange-400" size={20} /> {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100">
                    <div className="bg-[#1A5F7A] py-12 text-white text-center">
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Student Enrollment</h2>
                        <p className="text-[10px] font-bold tracking-[0.3em] opacity-60 mt-1 uppercase">Official Academic Records</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-16 space-y-12">
                        {/* 1. IDENTITY VERIFICATION */}
                        <div className="p-8 bg-blue-50/40 rounded-[2.5rem] border border-blue-100 shadow-inner">
                            <SectionTitle title="1. Contact Verification" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div className="space-y-1">
                                    <InputField label="Official Email" icon={<FiMail />} value={formData.email} disabled={isVerified} onChange={(v) => setFormData({...formData, email: v})} />
                                    {!isVerified && (
                                        <button type="button" onClick={sendOTP} disabled={timer > 0} className={`text-[10px] font-black uppercase underline ml-2 mt-2 ${timer > 0 ? 'text-slate-400' : 'text-[#F37021]'}`}>
                                            {timer > 0 ? `Resend in ${timer}s` : (otpSent ? "Resend OTP" : "Send OTP")}
                                        </button>
                                    )}
                                </div>
                                {otpSent && !isVerified && (
                                    <div className="flex gap-2 items-end">
                                        <InputField label="OTP Code" icon={<FiLock />} value={otp} onChange={setOtp} />
                                        <button type="button" onClick={verifyOTP} className="bg-[#1A5F7A] text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase shadow-lg">Verify</button>
                                    </div>
                                )}
                                {isVerified && <div className="text-green-600 font-black text-xs uppercase ml-2 flex items-center gap-2 mt-4"><FiCheckCircle /> Verified</div>}
                            </div>
                        </div>

                        {isVerified && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                                <div className="flex flex-col items-center">
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                        <div className={`w-40 h-40 bg-slate-50 rounded-[3rem] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center ${isValidatingImage ? 'animate-pulse' : ''}`}>
                                            {previewImage ? <img src={previewImage} className="w-full h-full object-cover" alt="Student" /> : <FiCamera className="text-4xl text-slate-200" />}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-[#F37021] p-3 rounded-2xl text-white shadow-lg"><FiUpload /></div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mt-4 italic">Passport Photo</p>
                                </div>

                                <div className="space-y-8">
                                    <SectionTitle title="2. Personal Identity" />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <InputField label="Student Name" icon={<FiUser />} value={formData.name} error={errors.name} onChange={(v) => setFormData({...formData, name: v.replace(/[^a-zA-Z\s]/g, '')})} />
                                        <InputField label="Father's Name" icon={<FiUser />} value={formData.fatherName} onChange={(v) => setFormData({...formData, fatherName: v.replace(/[^a-zA-Z\s]/g, '')})} />
                                        <InputField label="Date of Birth" icon={<FiCalendar />} type="date" max={today} value={formData.dob} error={errors.dob} onChange={handleDobChange} />
                                        <InputField label="Aadhaar Number" icon={<FiFileText />} maxLength={12} value={formData.aadhaarNo} error={errors.aadhaarNo} onChange={(v) => setFormData({...formData, aadhaarNo: v.replace(/\D/g, '')})} />
                                        <InputField label="WhatsApp No" icon={<FiPhone />} maxLength={10} value={formData.phone} error={errors.phone} onChange={(v) => setFormData({...formData, phone: v.replace(/\D/g, '')})} />
                                    </div>
                                    <InputField label="Full Address" placeholder="Landmark, Pincode..." value={formData.address} onChange={(v) => setFormData({...formData, address: v})} />
                                </div>

                                <div className="space-y-8">
                                    <SectionTitle title="3. Academic Background" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <AcademicBox title="Class 10th" board={formData.highSchoolBoard} year={formData.highSchoolYear} pct={formData.highSchoolPercent} yearErr={errors.highSchoolYear} pctErr={errors.highSchoolPercent} maxYear={dynamicCurrentYear} triggerToast={triggerToast} onChange={(f, v) => setFormData({...formData, [f]: v})} />
                                        <AcademicBox title="Class 12th" board={formData.interBoard} year={formData.interYear} pct={formData.interPercent} yearErr={errors.interYear} pctErr={errors.interPercent} maxYear={dynamicCurrentYear} triggerToast={triggerToast} onChange={(f, v) => setFormData({...formData, [f]: v})} />
                                    </div>
                                </div>

                                {selectedCourseDetails && (
                                    <div className="bg-orange-50/50 p-8 rounded-[3rem] border border-orange-100 space-y-6 shadow-sm">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-white rounded-2xl shadow-sm"><FiAward className="text-4xl text-[#F37021]" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest italic mb-1">Enrolling In</p>
                                                    <h3 className="text-3xl font-black text-[#1A5F7A] uppercase italic leading-none">{selectedCourseDetails.title}</h3>
                                                </div>
                                            </div>
                                            <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-orange-200 pt-4 md:pt-0 md:pl-8">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Fee</p>
                                                <p className="text-5xl font-black text-[#1A5F7A] leading-none tracking-tighter">₹{selectedCourseDetails.fee?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button type="submit" disabled={isValidatingImage} className="w-full py-8 bg-[#F37021] text-white font-black rounded-[2.5rem] text-xl uppercase tracking-[0.25em] shadow-2xl hover:bg-[#1A5F7A] transition-all">Confirm Official Enrollment</button>
                            </motion.div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

// UI Sub-components
function SectionTitle({ title }) { return <h4 className="text-sm font-black text-[#1A5F7A] uppercase tracking-widest mb-4 italic flex items-center gap-2"><span className="h-5 w-1.5 bg-[#F37021] rounded-full"></span>{title}</h4>; }

function InputField({ label, icon, type = "text", value, onChange, maxLength, error, disabled, placeholder, max }) {
    return (
        <div className="flex flex-col gap-1 w-full">
            <label className="text-[8px] font-black uppercase text-slate-400 ml-3 tracking-widest">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
                <input disabled={disabled} type={type} max={max} maxLength={maxLength} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} 
                className={`w-full ${icon ? 'pl-12' : 'px-5'} pr-4 py-5 bg-slate-50 border rounded-3xl outline-none font-bold text-sm ${error ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-100 focus:border-[#F37021] transition-all shadow-sm'}`} />
            </div>
            {error && <span className="text-[7px] font-bold text-red-500 uppercase ml-4 tracking-tighter">{error}</span>}
        </div>
    );
}

function AcademicBox({ title, board, year, pct, yearErr, pctErr, onChange, maxYear, triggerToast }) {
    const prefix = title === "Class 10th" ? "highSchool" : "inter";

    const handleYearChange = (val) => {
        const numeric = val.replace(/\D/g, '');
        if (numeric.length > 4) return;
        if (numeric.length === 4 && parseInt(numeric) > maxYear) {
            triggerToast(`Error: ${title} year cannot exceed ${maxYear}.`);
            return;
        }
        onChange(`${prefix}Year`, numeric);
    };

    const handlePctChange = (val) => {
        if (val === "") { onChange(`${prefix}Percent`, ""); return; }
        const numeric = val.replace(/[^0-9.]/g, '');
        if (parseFloat(numeric) > 100) {
            triggerToast("Error: Percentage cannot exceed 100%.");
            return;
        }
        onChange(`${prefix}Percent`, numeric);
    };

    return (
        <div className="p-8 bg-slate-50/50 rounded-[3rem] border border-slate-100 space-y-5 shadow-sm">
            <p className="text-[10px] font-black text-[#1A5F7A] uppercase border-b border-slate-200 pb-3 tracking-widest italic">{title} Credentials</p>
            <InputField label="Board Name" placeholder="CBSE / BSEB / ICSE" value={board} onChange={(v) => onChange(`${prefix}Board`, v)} />
            <div className="grid grid-cols-2 gap-5">
                <InputField label="Passing Year" maxLength={4} placeholder="YYYY" value={year} error={yearErr} onChange={handleYearChange} />
                <InputField label="Score (%)" placeholder="00.00" value={pct} error={pctErr} onChange={handlePctChange} />
            </div>
        </div>
    );
}