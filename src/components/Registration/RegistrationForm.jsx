import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { 
    FiUser, FiMail, FiCheckCircle, FiFileText, 
    FiCamera, FiCalendar, FiX, FiRefreshCw, 
    FiShield, FiArrowRight, FiLock, FiPhone, 
    FiUpload, FiAlertTriangle, FiCheck, FiLoader, 
    FiTag, FiSmartphone
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

/** * UTILS: Verhoeff Algorithm for Aadhaar Validation 
 */
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

    // --- STATES ---
    const [isVerified, setIsVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isValidatingImage, setIsValidatingImage] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, msg: "", type: "error" });
    const [selectedPrice, setSelectedPrice] = useState(0);
    const [showReview, setShowReview] = useState(false);
    const [regSuccessData, setRegSuccessData] = useState(null);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentOption, setPaymentOption] = useState('FULL'); 
    const [emiInterval, setEmiInterval] = useState(3);
    const [isConfirming, setIsConfirming] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);
    const [transactionId, setTransactionId] = useState('');
    const [cashPaidAmount, setCashPaidAmount] = useState('');

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

    // --- CALCULATIONS ---
    const finalPayable = selectedPrice - discountInfo.amount;
    const partialPayable = Math.round(finalPayable / emiInterval);

    // --- EFFECTS ---
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const courseTitle = location.state?.selectedCourse || location.state?.prefillCourse;
        if (courseTitle) {
            const allCourses = [...(techCoursesData || []), ...(universityPrograms || [])];
            const match = allCourses.find(c => c.title === courseTitle || c.id === courseTitle);
            setFormData(prev => ({ ...prev, course: match ? match.title : courseTitle }));
            const rawPrice = match ? (match.price || match.fee) : (location.state?.price || 0);
            setSelectedPrice(Number(rawPrice.toString().replace(/[^0-9]/g, "")));
        }
    }, [location.state]);

    useEffect(() => {
        return () => { if (previewImage) URL.revokeObjectURL(previewImage); };
    }, [previewImage]);

    useEffect(() => {
        if (showPaymentModal && paymentOption !== 'CASH' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, showPaymentModal, paymentOption]);

    // --- HANDLERS & INPUT VALIDATORS ---
    const triggerToast = (msg, type = "error") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "error" }), 5000);
    };

    const handleDobChange = (val) => {
        const year = new Date(val).getFullYear();
        if (year > currentYear) return triggerToast(`DOB year cannot be more than ${currentYear}`);
        setFormData({ ...formData, dob: val });
    };

    const handleYearInput = (key, val) => {
        const numericVal = val.replace(/\D/g, '');
        if (parseInt(numericVal) > currentYear) return triggerToast(`Year cannot be more than ${currentYear}`);
        setFormData({ ...formData, [key]: numericVal });
    };

    const handlePercentInput = (key, val) => {
        const num = parseFloat(val);
        if (num > 100) return triggerToast("Percentage cannot exceed 100%");
        setFormData({ ...formData, [key]: val });
    };

    const handleSendOtp = async () => {
        if (!formData.email) return triggerToast("Enter Email Id");
        setIsVerifying(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/send-otp`, { email: formData.email });
            if (res.data.success) { setOtpSent(true); triggerToast("OTP Sent Successfully", "success"); }
        } catch (err) { triggerToast("OTP Request Failed"); } finally { setIsVerifying(false); }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, { email: formData.email, otp });
            if (res.data.success) setIsVerified(true);
        } catch (err) { triggerToast("Invalid Code"); }
    };

    const handleApplyCoupon = async () => {
        if (discountInfo.applied) {
            setDiscountInfo({ applied: false, amount: 0, code: '', type: '' });
            setCouponCode('');
            return triggerToast("Coupon Removed", "success");
        }
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
                triggerToast("Promo Code Applied!", "success");
            }
        } catch (err) { triggerToast("Coupon Invalid"); } finally { setIsValidatingCoupon(false); }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsValidatingImage(true);
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
            const img = await faceapi.bufferToImage(file);
            const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
            if (detections.length === 0) {
                triggerToast("Face not detected. Use a clear portrait.");
            } else {
                setFormData({ ...formData, studentImage: file });
                setPreviewImage(URL.createObjectURL(file));
                triggerToast("Identity Verified", "success");
            }
        } catch (err) { triggerToast("Scanning Error"); } finally { setIsValidatingImage(false); }
    };

    const validateForm = () => {
        let tmp = {};
        if (!formData.name || formData.name.length < 3) tmp.name = "Full name required";
        if (!/^[6-9]\d{9}$/.test(formData.phone)) tmp.phone = "Invalid Mobile Number";
        if (!validateAadhaar(formData.aadhaarNo)) tmp.aadhaarNo = "Invalid 12-digit Aadhaar";
        if (!formData.studentImage) tmp.image = "Identity photo required";

        if (formData.highSchoolStatus === 'COMPLETED') {
            if (!formData.highSchoolYear || parseInt(formData.highSchoolYear) > currentYear) tmp.highSchoolYear = "Invalid Year";
            if (!formData.highSchoolPercent || parseFloat(formData.highSchoolPercent) > 100) tmp.highSchoolPercent = "Invalid %";
        }
        if (formData.interStatus === 'COMPLETED') {
            if (!formData.interYear || parseInt(formData.interYear) > currentYear) tmp.interYear = "Invalid Year";
            if (!formData.interPercent || parseFloat(formData.interPercent) > 100) tmp.interPercent = "Invalid %";
        }

        setErrors(tmp);
        return Object.keys(tmp).length === 0;
    };

    const handleFinalSubmit = async () => {
        const cleanUTR = transactionId.trim();
        
        if (paymentOption === 'CASH') {
            const cashAmt = Number(cashPaidAmount);
            if (!cashPaidAmount || cashAmt <= 0) {
                return triggerToast("Please enter a valid cash amount");
            }
            if (cashAmt > finalPayable) {
                return triggerToast(`Cash receipt cannot exceed the course net payable of ₹${finalPayable.toLocaleString()}`);
            }
        }

        if (paymentOption !== 'CASH' && cleanUTR.length !== 12) {
            return triggerToast("UTR must be exactly 12 digits");
        }
    
        setIsConfirming(true);
    
        const finalAmt = paymentOption === 'PARTIAL' ? partialPayable : finalPayable;
        const actualAmountPaid = paymentOption === 'CASH' ? Number(cashPaidAmount) : finalAmt;
    
        const data = new FormData();
        const cleanForm = { ...formData };
        
        if (cleanForm.highSchoolStatus === 'PURSUING') { 
            cleanForm.highSchoolBoard = ''; 
            cleanForm.highSchoolYear = ''; 
            cleanForm.highSchoolPercent = ''; 
        }
        if (cleanForm.interStatus === 'PURSUING') { 
            cleanForm.interBoard = ''; 
            cleanForm.interYear = ''; 
            cleanForm.interPercent = ''; 
        }
    
        Object.keys(cleanForm).forEach(key => { 
            if (key !== 'studentImage') data.append(key, cleanForm[key]); 
        });
        
        if (formData.studentImage) data.append('studentImage', formData.studentImage);
        
        data.append('amountPaid', actualAmountPaid); 
        data.append('totalFee', finalPayable); // Total Fee is mapped to Net Payable (with discounts deducted)
        data.append('paymentOption', paymentOption);
        data.append('transactionId', paymentOption === 'CASH' ? 'CASH-PAYMENT' : cleanUTR);
        data.append('emiInterval', emiInterval);
        
        if (discountInfo.applied) {
            data.append('appliedCoupon', JSON.stringify({ 
                code: discountInfo.code, 
                discountValue: discountInfo.amount 
            }));
        }
    
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/registration/submit`, data);
            if (res.data.success) {
                setRegSuccessData({ 
                    regId: res.data.registrationId, 
                    pass: res.data.rawPassword || "Check Email", 
                    isReturning: res.data.isReturning 
                });
                setShowPaymentModal(false);
            }
        } catch (err) {
            triggerToast(err.response?.data?.message || "Internal Server Failure");
        } finally { setIsConfirming(false); }
    };
    
    return (
        <div className="min-h-screen py-10 bg-slate-50 font-sans relative overflow-x-hidden">
            <AnimatePresence>{toast.show && <ToastUI msg={toast.msg} type={toast.type} />}</AnimatePresence>

            {/* PAYMENT MODAL */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[4000] bg-slate-900/98 backdrop-blur-xl flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-4xl relative border-t-[12px] border-[#1A5F7A]">
                            {isConfirming && <ConfirmingOverlay />}
                            <div className="p-10 md:p-14">
                                <div className="flex justify-between items-center mb-10 text-center md:text-left">
                                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-[#1A5F7A]">Expert Computer Academy Payment Gateway</h2>
                                    <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-red-500"><FiX size={24}/></button>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-10">
                                    {['FULL', 'PARTIAL', 'CASH'].map(opt => (
                                        <button key={opt} onClick={() => {setPaymentOption(opt); setTimeLeft(300);}} 
                                            className={`py-5 rounded-3xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${paymentOption === opt ? 'border-[#1A5F7A] bg-blue-50 text-[#1A5F7A]' : 'border-slate-100 text-slate-400'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>

                                {paymentOption !== 'CASH' ? (
                                    <div className="space-y-8">
                                        {paymentOption === 'PARTIAL' && (
                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-4">
                                                {[3, 6].map(m => (
                                                    <button key={m} onClick={() => setEmiInterval(m)} className={`flex-1 py-3 rounded-2xl font-black ${emiInterval === m ? 'bg-[#1A5F7A] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>{m} Months</button>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex flex-col md:flex-row gap-10 items-center bg-slate-50 p-10 rounded-[3rem] border-2 border-dashed border-slate-200">
                                            <div className="relative">
                                                <div className="w-40 h-40 bg-white p-3 rounded-[2rem] shadow-inner flex items-center justify-center">
                                                    {timeLeft > 0 ? (
                                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=318334639811970@cnrb%26pn=EXPERT%20COMPUTER%20ACADEMY%26am=${paymentOption === 'FULL' ? finalPayable : partialPayable}%26cu=INR`} alt="QR" className="w-full h-full" />
                                                    ) : <div className="text-red-500 font-black text-xs">TIMEOUT</div>}
                                                </div>
                                                {timeLeft > 0 && <div className="absolute -top-3 -right-3 bg-orange-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg">0{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Payable Now</p>
                                                <h4 className="text-5xl font-black italic text-[#1A5F7A]">₹{(paymentOption === 'FULL' ? finalPayable : partialPayable).toLocaleString()}</h4>
                                            </div>
                                        </div>
                                        <InputField 
                                            label="Enter 12-Digit Transaction UTR" 
                                            icon={<FiSmartphone />} 
                                            value={transactionId} 
                                            maxLength={12}
                                            onChange={(v) => setTransactionId(v.replace(/\D/g, '').slice(0, 12))} 
                                            placeholder="From PhonePe / Paytm / GPay" 
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="text-center py-8 px-8 bg-orange-50 rounded-[3rem] border border-orange-100">
                                            <FiUser size={40} className="mx-auto text-orange-500 mb-4" />
                                            <h3 className="text-xl font-black italic uppercase text-orange-700">Walk-in Payment</h3>
                                            <p className="text-orange-600/70 font-bold mt-1 text-[10px] uppercase tracking-tighter">Enter collection amount received at front desk</p>
                                        </div>

                                        <InputField 
                                            label="Cash Amount Received (₹)" 
                                            icon={<FiCheckCircle />} 
                                            placeholder="e.g. 5000"
                                            value={cashPaidAmount}
                                            onChange={(v) => {
                                                const cleanVal = v.replace(/\D/g, '');
                                                if (Number(cleanVal) > finalPayable) {
                                                    setCashPaidAmount(finalPayable.toString());
                                                    triggerToast(`Maximum balance allowable is ₹${finalPayable.toLocaleString()}`);
                                                } else {
                                                    setCashPaidAmount(cleanVal);
                                                }
                                            }}
                                        />

                                        <div className="bg-slate-900 p-6 rounded-3xl text-white flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-slate-400">Balance Remaining</span>
                                            <span className={`text-xl font-black ${Number(cashPaidAmount) === finalPayable ? 'text-green-400' : 'text-orange-500'}`}>
                                                ₹{(finalPayable - (Number(cashPaidAmount) || 0)).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <button onClick={handleFinalSubmit} disabled={isConfirming || (paymentOption !== 'CASH' && timeLeft <= 0)} 
                                    className="w-full mt-10 py-8 bg-[#1A5F7A] text-white rounded-[2.5rem] font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                    {paymentOption === 'CASH' ? 'Confirm Walk-in Receipt' : 'Validate Transaction'} <FiArrowRight />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FORM BODY */}
            <div className="max-w-4xl mx-auto px-4">
                <AnimatePresence mode="wait">
                    {!isVerified ? (
                        <VerificationGate formData={formData} setFormData={setFormData} otp={otp} setOtp={setOtp} otpSent={otpSent} setOtpSent={setOtpSent} isVerifying={isVerifying} handleSendOtp={handleSendOtp} handleVerifyOtp={handleVerifyOtp} />
                    ) : (
                        <motion.div key="form" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[4rem] shadow-4xl overflow-hidden border border-slate-100">
                            <div className="bg-[#1A5F7A] p-12 text-white relative">
                                <span className="bg-orange-500 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest mb-6 inline-block">Session {currentYear}</span>
                                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">Admission Profile</h2>
                            </div>

                            <div className="p-8 md:p-16 space-y-20">
                                <div className="flex flex-col items-center">
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
                                    <div className="relative cursor-pointer group" onClick={() => !isValidatingImage && fileInputRef.current.click()}>
                                        <div className={`w-48 h-48 md:w-60 md:h-60 bg-slate-50 rounded-[4rem] border-8 border-white shadow-3xl overflow-hidden flex items-center justify-center transition-all ${isValidatingImage ? 'scale-90 opacity-50' : 'group-hover:scale-105'}`}>
                                            {isValidatingImage ? <FiLoader className="text-4xl text-orange-500 animate-spin" /> : previewImage ? <img src={previewImage} className="w-full h-full object-cover" alt="Profile" /> : <FiCamera className="text-6xl text-slate-200" />}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-orange-600 p-5 rounded-[1.5rem] text-white shadow-2xl"><FiUpload size={24} /></div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mt-8 italic text-center tracking-widest">Biometric Data Required</p>
                                </div>

                                <div className="space-y-20">
                                    <section><SectionTitle title="1. Identity Credentials" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                            <InputField label="Student Name" icon={<FiUser />} value={formData.name} error={errors.name} onChange={(v) => setFormData({...formData, name: v})} />
                                            <InputField label="Father's Name" icon={<FiUser />} value={formData.fatherName} onChange={(v) => setFormData({...formData, fatherName: v})} />
                                            <InputField label="Date of Birth" icon={<FiCalendar />} type="date" value={formData.dob} max={today} onChange={handleDobChange} />
                                            <InputField label="Aadhaar ID" icon={<FiFileText />} maxLength={12} value={formData.aadhaarNo} error={errors.aadhaarNo} onChange={(v) => setFormData({...formData, aadhaarNo: v.replace(/\D/g, '')})} />
                                            <InputField label="Mobile Number" icon={<FiPhone />} maxLength={10} value={formData.phone} error={errors.phone} onChange={(v) => setFormData({...formData, phone: v.replace(/\D/g, '')})} />
                                            <InputField label="Address" placeholder="Current residential address" value={formData.address} onChange={(v) => setFormData({...formData, address: v})} />
                                        </div>
                                    </section>
                                    
                                    <section><SectionTitle title="2. Academic Pulse" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                            <AcademicBox title="Class X" prefix="highSchool" formData={formData} setFormData={setFormData} onYear={handleYearInput} onPercent={handlePercentInput} />
                                            <AcademicBox title="Class XII" prefix="inter" formData={formData} setFormData={setFormData} onYear={handleYearInput} onPercent={handlePercentInput} />
                                        </div>
                                    </section>

                                    <section className="pt-10">
                                        <div className="bg-slate-900 rounded-[3.5rem] text-white p-10 md:p-14 shadow-3xl">
                                            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                                                <div><p className="text-[11px] font-black text-orange-400 uppercase mb-2">Course</p><h3 className="text-3xl font-black italic uppercase">{formData.course}</h3></div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Net Payable</p>
                                                    <h4 className={`text-5xl font-black ${discountInfo.applied ? 'text-orange-500' : 'text-white'}`}>₹{finalPayable.toLocaleString()}</h4>
                                                </div>
                                            </div>
                                            <div className="mt-12 flex flex-col md:flex-row gap-4">
                                                <div className="relative flex-1">
                                                    <FiTag className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" />
                                                    <input type="text" disabled={discountInfo.applied} placeholder="PROMO CODE?" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="w-full bg-white/5 border-2 border-white/10 rounded-3xl py-6 pl-16 pr-6 font-black outline-none focus:border-orange-500 transition-all placeholder:text-white/20" />
                                                </div>
                                                <button onClick={handleApplyCoupon} className={`px-12 py-6 rounded-3xl font-black uppercase text-xs transition-all ${discountInfo.applied ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-orange-600 text-white hover:bg-orange-700'}`}>
                                                    {isValidatingCoupon ? <FiRefreshCw className="animate-spin" /> : discountInfo.applied ? 'Remove' : 'Apply'}
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                    <button onClick={() => { if(validateForm()) setShowReview(true); }} className="w-full py-10 bg-[#1A5F7A] text-white rounded-[3rem] text-2xl font-black uppercase shadow-4xl flex items-center justify-center gap-6 active:scale-95 transition-all">Final Review <FiArrowRight /></button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* REVIEW MODAL */}
            <AnimatePresence>
                {showReview && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[2500] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[4rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-10 border-b flex justify-between bg-slate-50">
                                <h2 className="text-3xl font-black text-[#1A5F7A] italic uppercase">Profile Verification</h2>
                                <button onClick={() => setShowReview(false)} className="p-4 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-md"><FiX size={20}/></button>
                            </div>
                            <div className="p-10 md:p-14 overflow-y-auto flex-1 space-y-12">
                                <div className="flex items-center gap-8">
                                    <img src={previewImage} className="w-28 h-28 rounded-[2.5rem] object-cover border-4 border-slate-100 shadow-xl" alt="Preview" />
                                    <div><h3 className="text-4xl font-black text-[#1A5F7A] uppercase leading-none">{formData.name}</h3><p className="text-orange-600 font-black uppercase tracking-widest mt-2">{formData.course}</p></div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <ReviewItem label="Email" value={formData.email} />
                                    <ReviewItem label="Phone" value={formData.phone} />
                                    <ReviewItem label="Aadhaar" value={formData.aadhaarNo} />
                                    <ReviewItem label="DOB" value={formData.dob} />
                                </div>
                                <div className="bg-slate-900 rounded-[3rem] p-10 text-white border-b-8 border-orange-600 flex justify-between items-center">
                                    <span className="text-2xl font-black uppercase italic">Payable Total</span>
                                    <span className="text-5xl font-black text-orange-500">₹{finalPayable.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="p-10 bg-slate-50 border-t flex gap-4">
                                <button onClick={() => { setShowReview(false); setShowPaymentModal(true); }} className="w-full py-6 bg-[#1A5F7A] text-white rounded-[2.5rem] font-black uppercase text-sm shadow-2xl active:scale-95 transition-all">Proceed For Payment</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SUCCESS MODAL */}
            <AnimatePresence>
                {regSuccessData && (
                    <div className="fixed inset-0 z-[6000] bg-slate-900/98 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[4rem] p-12 max-w-md w-full text-center shadow-4xl border-t-[16px] border-green-500">
                            <FiCheckCircle size={60} className="mx-auto text-green-500 mb-8" />
                            <h2 className="text-4xl font-black text-slate-800 uppercase italic mb-10 leading-tight">Application Success</h2>
                            <div className="space-y-6 text-left bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment ID</p>
                                    <p className="text-xl md:text-2xl font-mono font-bold text-[#1A5F7A] break-all leading-tight">{regSuccessData.regId}</p>
                                </div>
                                {!regSuccessData.isReturning ? (
                                    <div className="pt-4 border-t border-slate-200">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Pin</p>
                                        <p className="text-3xl font-mono font-bold text-orange-600">{regSuccessData.pass}</p>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t border-slate-200 bg-blue-50/50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-[#1A5F7A] uppercase italic">Returning Student</p>
                                        <p className="text-xs font-bold text-slate-500 mt-1">Use your existing portal password.</p>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => navigate('/student-login')} className="w-full mt-10 py-6 bg-[#1A5F7A] text-white rounded-[2rem] font-black uppercase text-sm tracking-widest shadow-2xl transition-all">Access Dashboard</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- SUB-COMPONENTS ---
function ToastUI({ msg, type }) {
    return <motion.div initial={{ y: -50, x: '-50%', opacity: 0 }} animate={{ y: 20, x: '-50%', opacity: 1 }} exit={{ y: -50, x: '-50%', opacity: 0 }} className={`fixed top-0 left-1/2 z-[5000] px-8 py-4 rounded-2xl text-white font-black shadow-2xl flex items-center gap-3 ${type === 'success' ? 'bg-[#1A5F7A]' : 'bg-red-600'}`}>{type === 'success' ? <FiCheck /> : <FiAlertTriangle />}{msg}</motion.div>;
}

function SectionTitle({ title }) {
    return <h4 className="text-[12px] font-black text-[#1A5F7A] uppercase flex items-center gap-4 tracking-widest"><span className="h-6 w-1.5 bg-orange-500 rounded-full shadow-lg"></span>{title}</h4>;
}

function ConfirmingOverlay() {
    return <div className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-10"><FiRefreshCw className="text-[#1A5F7A] animate-spin mb-6" size={60} /><h3 className="text-3xl font-black italic uppercase text-[#1A5F7A]">Validating...</h3><p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-widest italic">Expert Academy is verifying data with servers...</p></div>;
}

function InputField({ label, icon, type = "text", value, onChange, maxLength, placeholder, max, error }) {
    return (
        <div className="w-full text-left">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-5 mb-2 block tracking-widest">{label} {error && <span className="text-red-500 lowercase italic">- {error}</span>}</label>
            <div className="relative">
                {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
                <input type={type} max={max} maxLength={maxLength} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} 
                    className={`w-full text-sm ${icon ? 'pl-14' : 'px-8'} py-5 bg-slate-50 border-2 rounded-[2.5rem] outline-none font-bold text-slate-700 transition-all ${error ? 'border-red-200' : 'border-slate-100 focus:border-orange-500'}`} />
            </div>
        </div>
    );
}

function AcademicBox({ title, prefix, formData, setFormData, onYear, onPercent }) {
    const isP = formData[`${prefix}Status`] === 'PURSUING';
    return (
        <div className="p-8 bg-slate-50/50 rounded-[3rem] border-2 border-slate-100 space-y-6">
            <div className="flex justify-between items-center"><p className="text-[11px] font-black text-[#1A5F7A] uppercase tracking-widest">{title}</p><select value={formData[`${prefix}Status`]} onChange={(e) => setFormData({...formData, [`${prefix}Status`]: e.target.value})} className="text-[10px] font-black uppercase bg-white border-2 border-slate-100 rounded-full px-3 py-1 outline-none text-[#1A5F7A]"><option value="COMPLETED">Completed</option><option value="PURSUING">Pursuing</option></select></div>
            <InputField label="Board / University" value={isP ? '' : formData[`${prefix}Board`]} onChange={(v) => !isP && setFormData({...formData, [`${prefix}Board`]: v})} placeholder={isP ? "NOT APPLICABLE" : "e.g. CBSE / BSEB"} />
            <div className="grid grid-cols-2 gap-5"><InputField label="Year" value={isP ? '' : formData[`${prefix}Year`]} onChange={(v) => !isP && onYear(`${prefix}Year`, v)} placeholder={isP ? "N/A" : "YYYY"} /><InputField label="Score (%)" value={isP ? '' : formData[`${prefix}Percent`]} onChange={(v) => !isP && onPercent(`${prefix}Percent`, v)} placeholder={isP ? "N/A" : "00.00"} /></div>
        </div>
    );
}

// Subcomponent formatting references
function ReviewItem({ label, value }) {
    return <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">{label}</p><p className="font-bold text-[#1A5F7A] truncate text-sm">{value || 'N/A'}</p></div>;
}

function VerificationGate({ formData, setFormData, otp, setOtp, otpSent, setOtpSent, isVerifying, handleSendOtp, handleVerifyOtp }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto mt-20 bg-white rounded-[3.5rem] shadow-4xl p-12 border border-slate-100 text-center">
            <div className="w-20 h-20 bg-[#1A5F7A] text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-xl"><FiShield size={36} /></div>
            <h2 className="text-2xl font-black text-[#1A5F7A] uppercase italic leading-none">Identity Gate</h2>
            <div className="space-y-8 mt-12">
                <InputField label="Official Email" icon={<FiMail />} value={formData.email} onChange={(v) => setFormData({...formData, email: v})} placeholder="student@example.com" />
                {otpSent && (
                    <InputField 
                        label="6-Digit OTP" 
                        icon={<FiLock />} 
                        value={otp} 
                        onChange={setOtp} 
                        placeholder="ENTER CODE" 
                        maxLength={6}
                    />
                )}
                <button onClick={otpSent ? handleVerifyOtp : handleSendOtp} disabled={isVerifying} className="w-full py-6 bg-[#1A5F7A] text-white rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all">
                    {isVerifying ? <FiRefreshCw className="animate-spin" /> : otpSent ? "Verify Identity" : "Generate OTP"} <FiArrowRight />
                </button>
            </div>
            <div className="mt-10 pt-8 border-t border-slate-100"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Secured by Expert Computer Academy Auth System</p></div>
        </motion.div>
    );
}