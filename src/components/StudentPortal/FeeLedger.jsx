import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCalendar, FiCheckCircle, FiAlertCircle, FiActivity } from 'react-icons/fi';
import { techCoursesData, universityPrograms } from '../../data/courses';

export default function FeeLedger() {
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const savedData = localStorage.getItem("studentData");
        if (savedData) setStudent(JSON.parse(savedData));
    }, []);

    // PROD LOGIC: Aggregate Ledger Calculation
    const ledger = useMemo(() => {
        if (!student) return null;
        const allProgramData = [...techCoursesData, ...universityPrograms];
        
        // 1. Calculate Total Fee based on all enrollments
        const totalPackage = (student.enrollments || []).reduce((acc, curr) => {
            const courseInfo = allProgramData.find(c => c.title === curr.course || c.id === curr.course);
            const feeAmount = parseInt(courseInfo?.fee?.replace(/[^0-9]/g, "")) || 0;
            return acc + feeAmount;
        }, 0);

        const paid = Number(student.amountPaid || 0);
        const due = totalPackage - paid;

        return { totalPackage, paid, due };
    }, [student]);

    if (!student || !ledger) return null;

    return (
        <div className="p-6 md:p-12 font-sans bg-[#F8FAFC] min-h-screen text-left">
            {/* Header */}
            <div className="mb-10">
                <h2 className="text-3xl font-black text-[#1A5F7A] uppercase tracking-tighter italic leading-none">
                    Fee <span className="text-[#F37021]">Ledger</span>
                </h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                    <FiActivity className="text-green-500" /> Account ID: {student.registrationId}
                </p>
            </div>

            {/* Financial Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <SummaryCard 
                    label="Total Package Fee" 
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

            {/* Transaction History */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-[#1A5F7A] uppercase text-xs tracking-widest italic flex items-center gap-2">
                        <FiCalendar className="text-[#F37021]" /> Installment History
                    </h3>
                    <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-lg uppercase">
                        Verified by Accounts Dept
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment Date</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Sync Description</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {/* 1. Map through payment logs if they exist ( installments ) */}
                            {student.paymentLog && student.paymentLog.length > 0 ? (
                                student.paymentLog.map((log, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6 text-sm font-bold text-slate-600 italic">
                                            {new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-6 text-xs font-black text-[#1A5F7A] uppercase">
                                            Installment Sync - {log.mode || 'Online'}
                                        </td>
                                        <td className="p-6 text-sm font-black text-green-600 italic">
                                            + ₹{Number(log.amount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className="bg-green-100 text-green-600 text-[8px] font-black px-3 py-1 rounded-lg uppercase">Success</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* Fallback to basic admission fee row if no log exists yet */
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 text-sm font-bold text-slate-600 italic">
                                        {new Date(student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-6 text-xs font-black text-[#1A5F7A] uppercase">
                                        Initial Admission Fee Sync
                                    </td>
                                    <td className="p-6 text-sm font-black text-green-600 italic">
                                        ₹{ledger.paid.toLocaleString('en-IN')}
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className="bg-green-100 text-green-600 text-[8px] font-black px-3 py-1 rounded-lg uppercase">Success</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {ledger.due > 0 && (
                    <div className="p-8 bg-orange-50/50 border-t border-orange-100 flex items-center justify-between">
                        <p className="text-[10px] font-black text-orange-700 uppercase tracking-widest">
                            Note: Next installment sync pending. Please contact accounts for queries.
                        </p>
                    </div>
                )}
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
            <div className={`text-5xl ${color} opacity-[0.05] absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform`}>{icon}</div>
        </div>
    );
}