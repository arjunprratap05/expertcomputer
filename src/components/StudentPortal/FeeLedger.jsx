import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    FiDollarSign, FiCalendar, FiCheckCircle, 
    FiAlertCircle, FiActivity, FiTag, FiClock 
} from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

export default function FeeLedger() {
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const savedData = localStorage.getItem("studentData");
        if (savedData) setStudent(JSON.parse(savedData));
    }, []);

    const ledger = useMemo(() => {
        if (!student) return null;

        const allProgramData = [...techCoursesData, ...universityPrograms];
        let totalPackage = 0;

        // Trust DB totalFee (Discounted) or Fallback to standard price
        if (student.totalFee && student.totalFee > 0) {
            totalPackage = Number(student.totalFee);
        } else {
            totalPackage = (student.enrollments || []).reduce((acc, curr) => {
                const courseInfo = allProgramData.find(c => 
                    c.title.trim().toLowerCase() === curr.course.trim().toLowerCase() || 
                    c.id === curr.course
                );
                const feeAmount = parseInt(courseInfo?.fee?.toString().replace(/[^0-9]/g, "")) || 0;
                return acc + feeAmount;
            }, 0);
        }

        const paid = Number(student.amountPaid || 0);
        const due = totalPackage - paid;

        return { totalPackage, paid, due };
    }, [student]);

    if (!student || !ledger) return null;

    return (
        <div className="p-6 md:p-12 font-sans bg-[#F8FAFC] min-h-screen text-left">
            {/* HEADER */}
            <div className="mb-10">
                <h2 className="text-3xl font-black text-[#1A5F7A] uppercase tracking-tighter italic">
                    Fee <span className="text-[#F37021]">Ledger</span>
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <FiActivity className="text-green-500" /> ID: {student.registrationId}
                    </p>
                    
                    {/* HIDDEN PROMO CODE: Showing generic label instead */}
                    {student.appliedCoupon?.code && (
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 border border-orange-200">
                            <FiTag size={10} /> Institutional Scholarship Applied
                        </span>
                    )}
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <SummaryCard 
                    label="Contracted Total" 
                    value={`₹${ledger.totalPackage.toLocaleString('en-IN')}`} 
                    icon={<FiDollarSign />} 
                    color="text-[#1A5F7A]"
                />
                <SummaryCard 
                    label="Amount Cleared" 
                    value={`₹${ledger.paid.toLocaleString('en-IN')}`} 
                    icon={<FiCheckCircle />} 
                    color="text-green-600"
                    bg="bg-green-50/50"
                />
                <SummaryCard 
                    label="Outstanding Due" 
                    value={`₹${ledger.due.toLocaleString('en-IN')}`} 
                    icon={<FiAlertCircle />} 
                    color={ledger.due > 0 ? "text-red-500" : "text-green-600"}
                    bg={ledger.due > 0 ? "bg-red-50/50" : "bg-green-50/50"}
                />
            </div>

            {/* TRANSACTION HISTORY */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-[#1A5F7A] uppercase text-xs tracking-widest italic flex items-center gap-2">
                        <FiClock className="text-[#F37021]" /> Payment History
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(!student.paymentLog || student.paymentLog.length === 0) && ledger.paid > 0 && (
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 text-sm font-bold text-slate-600 italic">
                                        {new Date(student.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="p-6 text-xs font-black text-[#1A5F7A] uppercase tracking-tight">
                                        Initial Fee Commitment
                                    </td>
                                    <td className="p-6 text-sm font-black text-green-600 italic text-right">
                                        + ₹{ledger.paid.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            )}

                            {student.paymentLog?.map((log, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 text-sm font-bold text-slate-600 italic">
                                        {new Date(log.date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="p-6 text-xs font-black text-[#1A5F7A] uppercase">
                                        Installment Sync
                                    </td>
                                    <td className="p-6 text-sm font-black text-green-600 italic text-right">
                                        + ₹{Number(log.amount).toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon, color, bg = "bg-white" }) {
    return (
        <div className={`${bg} p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group`}>
            <div className="z-10">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</p>
            </div>
            <div className={`text-5xl ${color} opacity-[0.08] absolute -right-3 -bottom-3 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
        </div>
    );
}