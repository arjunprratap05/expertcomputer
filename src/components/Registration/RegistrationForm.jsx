import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FiUser, FiMail, FiPhone, FiCheckCircle, FiUpload, 
    FiFileText, FiCreditCard, FiCamera, FiBookOpen, FiAward, FiCalendar 
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';
import axios from 'axios';

export default function RegistrationForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCourseLocked, setIsCourseLocked] = useState(false);
    const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
    
    const [formData, setFormData] = useState({
        // Personal Details
        name: '', fatherName: '', dob: '', email: '', phone: '', address: '',
        aadhaarNo: '', 
        // Academic Record (10th)
        highSchoolBoard: '', highSchoolYear: '', highSchoolPercent: '',
        // Academic Record (12th)
        interBoard: '', interYear: '', interPercent: '',
        // Course & Image
        course: '', studentImage: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    const allAvailablePrograms = [...techCoursesData, ...universityPrograms];

    // --- AUTO-BINDING & TOP SCROLL ---
    useEffect(() => {
        window.scrollTo(0, 0);
        let target = location.state?.prefillCourse || location.state?.prefillData?.course;
        
        if (location.state?.prefillData) {
            setFormData(prev => ({ 
                ...prev, 
                name: location.state.prefillData.name || '', 
                phone: location.state.prefillData.phone || '' 
            }));
        }

        if (target) {
            const matched = allAvailablePrograms.find(c => c.title === target || c.id === target);
            if (matched) {
                setFormData(prev => ({ ...prev, course: matched.title }));
                setSelectedCourseDetails(matched);
                setIsCourseLocked(true);
            } else {
                setFormData(prev => ({ ...prev, course: target }));
            }
        }
    }, [location]);

    // Secondary Sync for manual selection
    useEffect(() => {
        const details = allAvailablePrograms.find(c => c.title === formData.course);
        setSelectedCourseDetails(details || null);
    }, [formData.course]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= 2 * 1024 * 1024) {
            setFormData({ ...formData, studentImage: file });
            setPreviewImage(URL.createObjectURL(file));
        } else if (file) alert("Image too large (>2MB)");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.studentImage) return alert("Student Photo is required.");
        
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/registration/submit`, data);
            if (res.data.success) {
                setIsSubmitted(true);
                setTimeout(() => navigate('/'), 6000);
            }
        } catch (err) { 
            alert("Submission error. Ensure Aadhaar, DOB, and Address are provided."); 
        }
    };

    if (isSubmitted) return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} className="text-center p-12 bg-slate-50 rounded-[4rem] shadow-2xl border border-slate-100">
                <FiCheckCircle className="text-7xl text-green-500 mx-auto mb-6" />
                <h2 className="text-4xl font-black text-[#1A5F7A] uppercase tracking-tighter">Success!</h2>
                <p className="text-slate-500 font-medium italic">ISO Enrollment Record created for {formData.name}.</p>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen py-20 bg-slate-50 font-sans">
            <div className="max-w-6xl mx-auto px-6">
                <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100">
                    <div className="bg-[#1A5F7A] p-12 text-white text-center">
                        <h2 className="text-4xl font-black uppercase tracking-tighter italic">Official Student Enrollment</h2>
                        <p className="text-blue-100/70 text-xs font-bold uppercase tracking-widest leading-loose">Patna Boring Road Campus | ISO Certified Records</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 md:p-20 space-y-16">
                        
                        {/* PHOTO UPLOAD */}
                        <div className="flex flex-col items-center border-b pb-12 border-slate-50">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                            <div className="relative cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                <div className="w-44 h-44 bg-slate-50 rounded-[2.5rem] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                    {previewImage ? <img src={previewImage} className="w-full h-full object-cover" alt="Student" /> : <FiCamera className="text-4xl text-slate-300" />}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-[#F37021] p-4 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110"><FiUpload size={22} /></div>
                            </div>
                            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Profile Photo</p>
                        </div>

                        {/* 1. PERSONAL IDENTITY */}
                        <div className="space-y-8">
                            <SectionTitle title="1. Identity & Contact Details" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <InputField label="Student Name" icon={<FiUser />} value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
                                <InputField label="Father's Name" icon={<FiUser />} value={formData.fatherName} onChange={(v) => setFormData({...formData, fatherName: v})} />
                                <InputField label="Date of Birth" icon={<FiCalendar />} type="date" value={formData.dob} onChange={(v) => setFormData({...formData, dob: v})} />
                                <InputField label="WhatsApp No" icon={<FiPhone />} value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
                                <InputField label="Aadhaar Number" icon={<FiFileText />} placeholder="XXXX-XXXX-XXXX" value={formData.aadhaarNo} onChange={(v) => setFormData({...formData, aadhaarNo: v})} />
                                <InputField label="Email Address" icon={<FiMail />} value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Full Permanent Address</label>
                                <textarea required placeholder="House No, Colony, City, Pin Code..." className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-700 focus:border-orange-400 transition-all" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                            </div>
                        </div>

                        {/* 2. ACADEMIC RECORD */}
                        <div className="space-y-8">
                            <SectionTitle title="2. Academic Background" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                                <div className="md:col-span-3 text-[10px] font-black uppercase text-[#1A5F7A] flex gap-2 border-b pb-2 tracking-widest"><FiAward /> High School (10th)</div>
                                <InputField label="Board Name" placeholder="e.g. CBSE/BSEB" value={formData.highSchoolBoard} onChange={(v) => setFormData({...formData, highSchoolBoard: v})} />
                                <InputField label="Passing Year" placeholder="YYYY" value={formData.highSchoolYear} onChange={(v) => setFormData({...formData, highSchoolYear: v})} />
                                <InputField label="Percent %" placeholder="00.00" value={formData.highSchoolPercent} onChange={(v) => setFormData({...formData, highSchoolPercent: v})} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                                <div className="md:col-span-3 text-[10px] font-black uppercase text-[#1A5F7A] flex gap-2 border-b pb-2 tracking-widest"><FiAward /> Intermediate (12th)</div>
                                <InputField label="Board Name" placeholder="e.g. CBSE/BSEB" value={formData.interBoard} onChange={(v) => setFormData({...formData, interBoard: v})} />
                                <InputField label="Passing Year" placeholder="YYYY" value={formData.interYear} onChange={(v) => setFormData({...formData, interYear: v})} />
                                <InputField label="Percent %" placeholder="00.00" value={formData.interPercent} onChange={(v) => setFormData({...formData, interPercent: v})} />
                            </div>
                        </div>

                        {/* 3. COURSE & FEE BINDING */}
                        <div className="space-y-8">
                            <SectionTitle title="3. Program & Fee Binding" />
                            <div className="relative">
                                <select required disabled={isCourseLocked} className={`w-full p-6 font-black text-[#1A5F7A] outline-none rounded-3xl appearance-none ${isCourseLocked ? 'bg-slate-200 opacity-70 cursor-not-allowed shadow-inner' : 'bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-orange-400'}`} value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})}>
                                    <option value="">Select Official Program</option>
                                    <optgroup label="Technical Diplomas">{techCoursesData.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}</optgroup>
                                    <optgroup label="University Programs">{universityPrograms.map(u => <option key={u.id} value={u.title}>{u.title}</option>)}</optgroup>
                                </select>
                                
                                {selectedCourseDetails && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <FiCreditCard className="text-[#F37021] text-2xl" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">Admission Fee (Locked)</span>
                                                    <span className="text-3xl font-black text-[#1A5F7A]">₹{Number(selectedCourseDetails.fee).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            {isCourseLocked && <button type="button" onClick={() => setIsCourseLocked(false)} className="text-[10px] font-black text-[#F37021] underline uppercase tracking-widest">Change Program</button>}
                                        </div>
                                        {selectedCourseDetails.modules && (
                                            <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
                                                <h5 className="text-[10px] font-black uppercase text-[#1A5F7A] mb-4 tracking-widest italic"><FiBookOpen className="inline mr-2" /> Curriculum Preview:</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedCourseDetails.modules.map((m, i) => <div key={i} className="flex gap-2 text-[11px] font-bold text-slate-500 italic"><FiCheckCircle className="text-green-500 shrink-0" /> {m}</div>)}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="w-full py-8 bg-[#F37021] text-white font-black rounded-[3rem] text-xl uppercase tracking-widest shadow-2xl hover:bg-[#1A5F7A] transition-all shadow-orange-100">Confirm Official Enrollment</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ title }) { return <h4 className="text-lg font-black text-[#1A5F7A] border-l-8 border-[#F37021] pl-4 uppercase tracking-tighter mb-4 italic">{title}</h4>; }
function InputField({ label, icon, type = "text", placeholder, value, onChange }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
                <input required type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${icon ? 'pl-14' : 'px-6'} py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:border-orange-400 font-bold text-slate-700 transition-all`} />
            </div>
        </div>
    );
}