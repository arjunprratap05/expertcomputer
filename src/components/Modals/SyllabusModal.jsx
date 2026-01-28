import React from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function SyllabusModal({ course, onClose }) {
    if (!course) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#1A5F7A]/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                <div className="p-8 bg-[#1A5F7A] text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black leading-tight">{course.title}</h2>
                        <p className="text-blue-200 text-xs mt-1 uppercase tracking-widest font-bold">Official Curriculum</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><FiX size={24} /></button>
                </div>

                <div className="p-8 overflow-y-auto bg-slate-50 flex-grow">
                    <ul className="space-y-3">
                        {course.modules?.map((m, i) => (
                            <li key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-[#F37021]/30">
                                <FiCheckCircle className="text-[#F37021] mt-1 shrink-0" /> 
                                <span className="font-bold text-slate-700 text-sm">{m}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-8 border-t border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
                    <Link to="/contact" onClick={onClose} className="text-center py-4 border-2 border-[#1A5F7A] text-[#1A5F7A] font-bold rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">Enquire</Link>
                    
                    <Link 
                        to="/registration" 
                        state={{ prefillCourse: course.id }} 
                        onClick={onClose} 
                        className="text-center py-4 bg-[#F37021] text-white font-black rounded-2xl shadow-lg uppercase text-[10px] tracking-widest flex items-center justify-center gap-1 hover:bg-[#1A5F7A] transition-all"
                    >
                        Enroll Now <FiArrowRight />
                    </Link>

                    <button onClick={onClose} className="py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
}