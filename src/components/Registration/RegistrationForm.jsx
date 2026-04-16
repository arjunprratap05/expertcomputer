import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { 
    FiUser, FiMail, FiCheckCircle, FiFileText, 
    FiCamera, FiCalendar, FiX, FiRefreshCw, 
    FiAward, FiDollarSign, FiShield, FiArrowRight, FiLock,
    FiPhone, FiUpload, FiAlertTriangle, FiCheck, FiLoader, FiTag, FiCreditCard, FiSmartphone
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

    // --- PAYMENT STATES ---
    const [showPayment, setShowPayment] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');

    // --- COUPON STATES ---
    const [couponCode, setCouponCode] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [discountInfo, setDiscountInfo] = useState({ applied: false, amount: 0, code: '', type: '' });

    const [formData, setFormData] = useState({
        name: '', fatherName: '', dob: '', email: '', phone: '', aadhaarNo: '', address: '',
        highSchoolBoard: '', highSchoolYear: '', highSchoolPercent: '', highSchoolStatus: 'COMPLETED',
        interBoard: '', interYear: '', interPercent: '', interStatus: 'COMPLETED',
        course: '', studentImage: null
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
            const rawPrice = match ? (match.price || match.fee) : (coursePrice || 0);
            setSelectedPrice(Number(rawPrice.toString().replace(/[^0-9]/g, "")));
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

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/coupons/validate`, {
                code: couponCode.toUpperCase(),
                courseTitle: formData.course
            });
            if (res.data.success) {
                const { discountType, discountValue } = res.data;
                let finalDiscount = discountType === 'PERCENTAGE' ? (selectedPrice * Number(discountValue)) / 100 : Number(discountValue);
                setDiscountInfo({ applied: true, amount: finalDiscount, code: couponCode.toUpperCase(), type: discountType });
                triggerToast("Promo Code Applied Successfully!", "success");
            }
        } catch (err) {
            setDiscountInfo({ applied: false, amount: 0, code: '', type: '' });
            triggerToast(err.response?.data?.message || "Invalid or Expired Code");
        } finally { setIsValidatingCoupon(false); }
    };

    const finalPayable = selectedPrice - discountInfo.amount;

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
        const num = parseFloat(val);
        if (num > 100) return triggerToast("Percentage cannot exceed 100%");
        setFormData({ ...formData, [`${prefix}Percent`]: val });
    };

    const handleSendOtp = async () => {
        if (!formData.email) return triggerToast("Please enter Email Id");
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
        } catch (err) { triggerToast("Verification failed. Check code."); }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsValidatingImage(true);
        setPreviewImage(null);
        try {
            const img = await faceapi.bufferToImage(file);
            const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
            if (detections.length === 0) {
                triggerToast("Face not detected. Clear portrait required.");
                e.target.value = "";
                setFormData({ ...formData, studentImage: null });
            } else {
                setFormData({ ...formData, studentImage: file });
                setPreviewImage(URL.createObjectURL(file));
                triggerToast("Biometric Scan Verified", "success");
            }
        } catch (err) { triggerToast("Scanning Error. Use JPG/PNG."); e.target.value = ""; } 
        finally { setIsValidatingImage(false); }
    };

    const validateForm = () => {
        let tmp = {};
        if (!formData.name || formData.name.length < 3) tmp.name = "Full name required";
        if (!/^[6-9]\d{9}$/.test(formData.phone)) tmp.phone = "Invalid Mobile Number";
        if (!validateAadhaar(formData.aadhaarNo)) tmp.aadhaarNo = "Valid 12-Digit ID required";
        if (!formData.studentImage) tmp.image = "Identity photo required";
        setErrors(tmp);
        return Object.keys(tmp).length === 0;
    };

    const handleFinalSubmit = async () => {
        if (!transactionId && paymentMethod === 'UPI') return triggerToast("Please enter Transaction ID to continue");
        setIsSubmitting(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => { if (key !== 'studentImage') data.append(key, formData[key]); });
        if (formData.studentImage) data.append('studentImage', formData.studentImage);
        data.append('totalFee', finalPayable);
        data.append('transactionId', transactionId);
        data.append('paymentMethod', paymentMethod);

        if (discountInfo.applied) {
            data.append('appliedCoupon', JSON.stringify({ code: discountInfo.code, discountValue: discountInfo.amount }));
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/registration/submit`, data);
            if (res.data.success) {
                setRegSuccessData({ regId: res.data.registrationId, pass: res.data.rawPassword, isReturning: res.data.isReturning });
                setShowPayment(false);
            }
        } catch (err) { triggerToast(err.response?.data?.message || "Internal Server Failure"); } 
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="min-h-screen py-10 bg-slate-50 relative overflow-x-hidden font-sans text-left">
            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ y: -100, x: '-50%' }} animate={{ y: 20, x: '-50%' }} exit={{ y: -100, x: '-50%' }}
                        className={`fixed top-0 left-1/2 z-[3000] px-6 py-4 rounded-2xl shadow-2xl font-black text-white flex items-center gap-3 ${toast.type === 'success' ? 'bg-[#1A5F7A]' : 'bg-red-600'}`}>
                        {toast.type === 'success' ? <FiCheckCircle /> : <FiAlertTriangle />} {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PAYMENT POPUP MODAL */}
            <AnimatePresence>
                {showPayment && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[2500] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[3rem] p-8 max-w-lg w-full shadow-2xl overflow-hidden border-t-[12px] border-[#1A5F7A]">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-slate-800 uppercase italic leading-none">Complete Payment</h2>
                                <button onClick={() => setShowPayment(false)} className="text-slate-400 hover:text-red-500"><FiX size={24}/></button>
                            </div>
                            
                            <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-dashed border-slate-300 flex flex-col items-center">
                                <p className="text-[10px] font-black text-[#1A5F7A] uppercase tracking-widest mb-4">EXPERT COMPUTER ACADEMY</p>
                                <div className="w-48 h-48 bg-white p-2 rounded-2xl shadow-inner mb-4 relative">
                                    {/* GENERATING QR FOR: 318334639811970@cnrb */}
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=318334639811970@cnrb%26pn=EXPERT%20COMPUTER%20ACADEMY%26am=${finalPayable}%26cu=INR`} alt="Expert Academy QR" className="w-full h-full" />
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 mt-2">UPI ID: 318334639811970@cnrb</p>
                                <div className="mt-4 flex gap-2">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">GPay</span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-full">PhonePe</span>
                                    <span className="px-3 py-1 bg-cyan-100 text-cyan-600 text-[10px] font-bold rounded-full">Paytm</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <InputField label="Transaction ID / UTR" icon={<FiSmartphone />} value={transactionId} onChange={setTransactionId} placeholder="Enter 12-digit UTR number" />
                                <div className="flex gap-4">
                                    <button onClick={() => setPaymentMethod('UPI')} className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${paymentMethod === 'UPI' ? 'border-[#1A5F7A] bg-blue-50 text-[#1A5F7A]' : 'border-slate-100 text-slate-400'}`}>UPI Scan</button>
                                    <button onClick={() => setPaymentMethod('CASH')} className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${paymentMethod === 'CASH' ? 'border-[#1A5F7A] bg-blue-50 text-[#1A5F7A]' : 'border-slate-100 text-slate-400'}`}>Cash</button>
                                </div>
                                <button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full py-5 bg-[#1A5F7A] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
                                    {isSubmitting ? <FiRefreshCw className="animate-spin" /> : "Deploy Enrollment Profile"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* REGISTRATION SUCCESS DIALOG */}
            <AnimatePresence>
                {regSuccessData && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[2000] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center border-t-[12px] border-[#1A5F7A]">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><FiCheck size={40} /></div>
                            <h2 className="text-3xl font-black text-slate-800 uppercase italic leading-none">{regSuccessData.isReturning ? "Enrolled!" : "Accepted!"}</h2>
                            <div className="mt-8 space-y-4 text-left bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrollment ID</p><p className="text-2xl font-mono font-bold text-[#1A5F7A]">{regSuccessData.regId}</p></div>
                                <div className="mt-4"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Security Pin</p><p className="text-2xl font-mono font-bold text-orange-600 tracking-tighter">{regSuccessData.isReturning ? "Existing Account" : regSuccessData.pass}</p></div>
                            </div>
                            <button onClick={() => navigate('/student-login')} className="w-full mt-8 py-5 bg-[#1A5F7A] text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 shadow-xl shadow-blue-900/10">Access Dashboard</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto px-4">
                <AnimatePresence mode="wait">
                    {!isVerified ? (
                        <motion.div key="gate" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto mt-12 bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
                            <div className="w-16 h-16 bg-[#1A5F7A] text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"><FiShield size={32} /></div>
                            <h2 className="text-2xl font-black text-[#1A5F7A] uppercase text-center italic">Email Verification</h2>
                            <div className="space-y-6 mt-10">
                                <InputField label="Official Email" icon={<FiMail />} value={formData.email} onChange={(v) => setFormData({...formData, email: v})} placeholder="Enter email address" />
                                {otpSent && <InputField label="6-Digit OTP" icon={<FiLock />} value={otp} onChange={setOtp} placeholder="Verify code" />}
                                {!otpSent ? (
                                    <button onClick={handleSendOtp} disabled={isVerifying} className="w-full py-5 bg-[#1A5F7A] text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl">
                                        {isVerifying ? <FiRefreshCw className="animate-spin" /> : "Request OTP"} <FiArrowRight />
                                    </button>
                                ) : (
                                    <button onClick={handleVerifyOtp} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Verify identity</button>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="form" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] shadow-4xl overflow-hidden mb-10 border border-slate-100">
                            <div className="bg-[#1A5F7A] p-10 md:p-14 text-white relative">
                                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><FiAward size={180} /></div>
                                <span className="bg-orange-500 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] mb-4 inline-block shadow-lg shadow-orange-900/20">Session 2026 Active</span>
                                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">Admission Enrollment</h2>
                            </div>

                            <div className="p-8 md:p-16 space-y-16">
                                <div className="flex flex-col items-center">
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
                                    <div className="relative cursor-pointer group" onClick={() => !isValidatingImage && fileInputRef.current.click()}>
                                        <div className={`w-40 h-40 md:w-52 md:h-52 bg-slate-50 rounded-[3.5rem] border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center transition-all ${isValidatingImage ? 'scale-90 opacity-50' : 'group-hover:scale-105 group-hover:rotate-2'}`}>
                                            {isValidatingImage ? <FiLoader className="text-4xl text-[#F37021] animate-spin" /> : previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <FiCamera className="text-5xl text-slate-200" />}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-orange-600 p-4 rounded-2xl text-white shadow-xl group-hover:scale-110 transition-transform"><FiUpload size={22} /></div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mt-6 tracking-[0.2em] italic">Biometric Facial Data Required</p>
                                </div>

                                <div className="space-y-16">
                                    <section>
                                        <SectionTitle title="1. Identity Credentials" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                            <InputField label="Student Name" icon={<FiUser />} value={formData.name} error={errors.name} onChange={(v) => setFormData({...formData, name: v})} />
                                            <InputField label="Father's Name" icon={<FiUser />} value={formData.fatherName} onChange={(v) => setFormData({...formData, fatherName: v})} />
                                            <InputField label="Date of Birth" icon={<FiCalendar />} type="date" value={formData.dob} onChange={handleDobChange} max={today} />
                                            <InputField label="Aadhaar ID" icon={<FiFileText />} maxLength={12} value={formData.aadhaarNo} error={errors.aadhaarNo} onChange={(v) => setFormData({...formData, aadhaarNo: v})} placeholder="12-Digit Number" />
                                            <InputField label="Phone Number" icon={<FiPhone />} maxLength={10} value={formData.phone} error={errors.phone} onChange={(v) => setFormData({...formData, phone: v})} />
                                            <InputField label="Local Address" placeholder="Current residential address" value={formData.address} onChange={(v) => setFormData({...formData, address: v})} />
                                        </div>
                                    </section>

                                    <section>
                                        <SectionTitle title="2. Academic Pulse" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                            <AcademicBox title="Class X" prefix="highSchool" formData={formData} setFormData={setFormData} onYear={handleAcademicYear} onPercent={handlePercent} />
                                            <AcademicBox title="Class XII" prefix="inter" formData={formData} setFormData={setFormData} onYear={handleAcademicYear} onPercent={handlePercent} />
                                        </div>
                                    </section>

                                    <section className="pt-6">
                                        <div className="bg-slate-900 rounded-[3rem] text-white shadow-3xl relative overflow-hidden flex flex-col">
                                            <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-10">
                                                <div className="z-10 text-center md:text-left">
                                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                                        <FiAward className="text-orange-400" size={20} />
                                                        <p className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Target Program</p>
                                                    </div>
                                                    <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none">{formData.course}</h3>
                                                </div>
                                                <div className="text-center md:text-right z-10">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Normalized Fee</p>
                                                    <p className={`text-4xl font-black ${discountInfo.applied ? 'line-through text-slate-500 text-2xl' : 'text-white'}`}>₹{selectedPrice?.toLocaleString()}</p>
                                                    {discountInfo.applied && <p className="text-5xl font-black text-orange-500 tracking-tighter mt-1 italic">₹{finalPayable.toLocaleString()}</p>}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white/5 p-8 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center">
                                                <div className="relative flex-1 w-full">
                                                    <FiTag className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" />
                                                    <input type="text" placeholder="HAVE A PROMO CODE?" className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-5 pl-14 pr-4 font-black uppercase text-sm focus:border-orange-500 outline-none transition-all placeholder:text-white/20" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                                                </div>
                                                <button onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode} className="w-full md:w-auto px-12 py-5 bg-orange-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                                                    {isValidatingCoupon ? <FiRefreshCw className="animate-spin" /> : "Apply Code"}
                                                </button>
                                            </div>
                                            
                                            {discountInfo.applied && (
                                                <div className="bg-green-500/10 p-4 text-center border-t border-white/5">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 flex items-center justify-center gap-2">
                                                        <FiCheckCircle /> Verified: You saved ₹{discountInfo.amount.toLocaleString()} on this program
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                <button onClick={() => { if(validateForm()) setShowReview(true); }} className="w-full py-8 bg-[#1A5F7A] text-white rounded-[2.5rem] text-xl font-black uppercase shadow-3xl flex items-center justify-center gap-5 transition-all hover:bg-slate-800 active:scale-[0.98] shadow-blue-900/10">
                                    Final Review & Confirm <FiArrowRight />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* APPLICATION REVIEW MODAL */}
            <AnimatePresence>
                {showReview && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1500] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} className="bg-white rounded-[3.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
                                <h2 className="text-2xl font-black text-[#1A5F7A] uppercase italic">Final Data Check</h2>
                                <button onClick={() => setShowReview(false)} className="p-3 bg-white rounded-full shadow-md text-slate-400 hover:text-red-500"><FiX size={20}/></button>
                            </div>
                            <div className="p-8 md:p-12 overflow-y-auto space-y-10 flex-1">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-lg"><img src={previewImage} className="w-full h-full object-cover" /></div>
                                    <div><p className="text-3xl font-black text-[#1A5F7A] uppercase italic leading-none">{formData.name}</p><p className="text-sm font-bold text-orange-600 mt-2 uppercase tracking-widest">{formData.course}</p></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ReviewItem label="Email" value={formData.email} />
                                    <ReviewItem label="Aadhaar ID" value={formData.aadhaarNo} />
                                    <ReviewItem label="Mobile" value={formData.phone} />
                                    <ReviewItem label="Father" value={formData.fatherName} />
                                </div>
                                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white border-b-[6px] border-orange-600">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Financial Overview</p>
                                    <div className="flex justify-between items-center text-sm font-bold opacity-60"><span>Original Fee</span><span>₹{selectedPrice.toLocaleString()}</span></div>
                                    {discountInfo.applied && <div className="flex justify-between items-center text-sm font-bold text-orange-400 mt-1"><span>Promo Discount ({discountInfo.code})</span><span>- ₹{discountInfo.amount.toLocaleString()}</span></div>}
                                    <div className="h-px bg-white/10 my-4"></div>
                                    <div className="flex justify-between items-center"><span className="text-xl font-black uppercase italic tracking-tighter">Net Payable</span><span className="text-4xl font-black text-orange-500">₹{finalPayable.toLocaleString()}</span></div>
                                </div>
                            </div>
                            <div className="p-10 bg-slate-50 border-t">
                                <button onClick={() => { setShowReview(false); setShowPayment(true); }} className="w-full py-6 bg-[#1A5F7A] text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform">
                                    Proceed to Payment <FiCreditCard />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// SHARED INTERFACE COMPONENTS
function SectionTitle({ title }) {
    return <h4 className="text-[12px] font-black text-[#1A5F7A] uppercase flex items-center gap-4 tracking-[0.2em]"><span className="h-6 w-1.5 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></span>{title}</h4>;
}

function InputField({ label, icon, type = "text", value, onChange, maxLength, error, placeholder, max }) {
    return (
        <div className="w-full text-left">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 mb-3 block tracking-widest">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
                <input type={type} max={max} maxLength={maxLength} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} 
                    className={`w-full text-sm ${icon ? 'pl-14' : 'px-8'} py-5 bg-slate-50 border-2 rounded-[1.5rem] md:rounded-[2.5rem] outline-none font-bold text-slate-700 transition-all ${error ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-orange-500 focus:bg-white focus:shadow-2xl focus:shadow-orange-500/10'}`} />
            </div>
            {error && <p className="text-[10px] text-red-500 font-black mt-3 ml-6 italic flex items-center gap-2 animate-bounce"><FiAlertTriangle size={12} /> {error}</p>}
        </div>
    );
}

function AcademicBox({ title, prefix, formData, setFormData, onYear, onPercent }) {
    const isPursuing = formData[`${prefix}Status`] === 'PURSUING';
    
    return (
        <div className="p-8 bg-slate-50/50 rounded-[3rem] border-2 border-slate-100 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
                <p className="text-[11px] font-black text-[#1A5F7A] uppercase tracking-widest flex items-center gap-3"><FiAward className="text-orange-500" /> {title}</p>
                <select value={formData[`${prefix}Status`]} onChange={(e) => setFormData({...formData, [`${prefix}Status`]: e.target.value})} className="text-[10px] font-black uppercase bg-white border-2 border-slate-100 rounded-full px-3 py-1 outline-none text-[#1A5F7A]">
                    <option value="COMPLETED">Completed</option>
                    <option value="PURSUING">Pursuing</option>
                </select>
            </div>
            <InputField label="Board / University" value={formData[`${prefix}Board`]} onChange={(v) => setFormData({...formData, [`${prefix}Board`]: v})} />
            <div className="grid grid-cols-2 gap-5">
                <InputField label={isPursuing ? "Target Year" : "Pass Year"} maxLength={4} value={formData[`${prefix}Year`]} onChange={(v) => onYear(prefix, v)} />
                <InputField label="Score (%)" value={isPursuing ? '0' : formData[`${prefix}Percent`]} onChange={(v) => !isPursuing && onPercent(prefix, v)} placeholder={isPursuing ? "N/A" : "00.00"} />
            </div>
        </div>
    );
}

function ReviewItem({ label, value }) {
    return (
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">{label}</p>
            <p className="font-bold text-[#1A5F7A] truncate text-sm leading-none">{value || 'Pending'}</p>
        </div>
    );
}