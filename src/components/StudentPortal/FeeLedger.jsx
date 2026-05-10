import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    FiDollarSign, FiCalendar, FiCheckCircle, 
    FiAlertCircle, FiActivity, FiTag, FiClock, FiCreditCard
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

        // 1. Calculate Total Fee
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
        
        // --- FIX: NO NEGATIVE DUE VALUES ---
        const rawDue = totalPackage - paid;
        const due = Math.max(0, rawDue); 
        
        const isPartial = student.paymentOption === "PARTIAL" || due > 0;
        
        // Next Installment Logic
        let nextInstallmentDate = null;
        if (due > 0) {
            const baseDate = student.paymentLog && student.paymentLog.length > 0 
                ? new Date(student.paymentLog[student.paymentLog.length - 1].date)
                : new Date(student.createdAt);
            
            nextInstallmentDate = new Date(baseDate);
            nextInstallmentDate.setMonth(nextInstallmentDate.getMonth() + 1);
        }

        return { totalPackage, paid, due, isPartial, nextInstallmentDate };
    }, [student]);

    if (!student || !ledger) return null;

    return (
        <div className="p-6 md:p-12 font-sans bg-[#F8FAFC] min-h-screen text-left">
            {/* HEADER */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-[#1A5F7A] uppercase tracking-tighter italic">
                        Fee <span className="text-[#F37021]">Ledger</span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <FiActivity className="text-green-500" /> ID: {student.email || student.registrationId}
                        </p>
                        {student.appliedCoupon?.code && (
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 border border-orange-200">
                                <FiTag size={10} /> Institutional Scholarship Applied
                            </span>
                        )}
                    </div>
                </div>

                {ledger.due > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white border-l-4 border-orange-500 p-4 rounded-xl shadow-sm flex items-center gap-4"
                    >
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                            <FiClock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Next Installment Due</p>
                            <p className="text-sm font-black text-[#1A5F7A]">
                                {ledger.nextInstallmentDate?.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </motion.div>
                )}
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
                    label="Net Payable Remaining" 
                    value={`₹${ledger.due.toLocaleString('en-IN')}`} 
                    icon={<FiAlertCircle />} 
                    color={ledger.due > 0 ? "text-red-500" : "text-green-600"}
                    bg={ledger.due > 0 ? "bg-red-50/50" : "bg-green-50/50"}
                />
                <SummaryCard 
                    label="Cleared History" 
                    value={`₹${ledger.paid.toLocaleString('en-IN')}`} 
                    icon={<FiCheckCircle />} 
                    color="text-green-600"
                    bg="bg-green-50/50"
                />
            </div>

            {/* TRANSACTION HISTORY */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                    <h3 className="font-black text-[#1A5F7A] uppercase text-xs tracking-widest italic flex items-center gap-2">
                        <FiCreditCard className="text-[#F37021]" /> Statement of Account
                    </h3>
                    <div className="text-[9px] font-black uppercase text-slate-400">
                        Method: {student.paymentOption || "Full Payment"}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction Description</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Status</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {/* Registration Payment */}
                            <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-6 text-sm font-bold text-slate-600 italic">
                                    {new Date(student.createdAt).toLocaleDateString('en-IN')}
                                </td>
                                <td className="p-6">
                                    <p className="text-xs font-black text-[#1A5F7A] uppercase">Registration Commitment</p>
                                    <p className="text-[10px] text-slate-400 font-bold">Initial payment received via {student.paymentMethod || 'CASH/UPI'}</p>
                                </td>
                                <td className="p-6 text-right">
                                    <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Cleared</span>
                                </td>
                                <td className="p-6 text-sm font-black text-green-600 italic text-right">
                                    {/* Dynamically calculate initial payment if log exists, else use total paid */}
                                    + ₹{((student.paymentLog && student.paymentLog.length > 0) 
                                        ? Number(student.amountPaid - student.paymentLog.reduce((a,b) => a + Number(b.amount), 0)) 
                                        : ledger.paid).toLocaleString('en-IN')}
                                </td>
                            </tr>

                            {/* Additional Payment Logs */}
                            {student.paymentLog?.map((log, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 text-sm font-bold text-slate-600 italic">
                                        {new Date(log.date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-black text-[#1A5F7A] uppercase">Ledger Adjustment</p>
                                        <p className="text-[10px] text-slate-400 font-bold">Payment sync via Admin Central</p>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Cleared</span>
                                    </td>
                                    <td className="p-6 text-sm font-black text-green-600 italic text-right">
                                        + ₹{Number(log.amount).toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}

                            {/* Future Projected Row */}
                            {ledger.due > 0 && (
                                <tr className="bg-orange-50/30 border-t-2 border-dashed border-orange-100">
                                    <td className="p-6 text-sm font-bold text-orange-600 italic">
                                        {ledger.nextInstallmentDate?.toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-black text-orange-700 uppercase">Upcoming Installment</p>
                                        <p className="text-[10px] text-orange-500 font-bold italic">Estimated next payable cycle</p>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Pending</span>
                                    </td>
                                    <td className="p-6 text-sm font-black text-slate-300 italic text-right">
                                        --
                                    </td>
                                </tr>
                            )}
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