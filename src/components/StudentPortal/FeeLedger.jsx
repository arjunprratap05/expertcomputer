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
        <div className="w-full pb-20 text-left max-w-6xl mx-auto mt-4 px-1">
            {/* HEADER */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900/80 border border-slate-700 text-[#F37021] rounded-2xl shadow-inner">
                            <FiDollarSign size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase italic leading-none tracking-tighter">
                                Fee <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-[#F37021] to-amber-200">Ledger</span>
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <FiActivity className="text-emerald-400" /> ID: {student.email || student.registrationId}
                                </p>
                                {student.appliedCoupon?.code && (
                                    <span className="bg-orange-500/10 text-[#F37021] px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 border border-orange-500/20 backdrop-blur-sm">
                                        <FiTag size={10} /> Institutional Scholarship Applied
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {ledger.due > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-900/40 backdrop-blur-md border border-slate-800 border-l-[6px] border-l-[#F37021] p-5 rounded-2xl shadow-lg flex items-center gap-5"
                    >
                        <div className="bg-orange-500/10 p-2.5 rounded-xl text-[#F37021] shadow-inner border border-orange-500/20">
                            <FiClock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Installment Due</p>
                            <p className="text-sm font-black text-white tracking-wide mt-1">
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
                    color="text-white"
                    iconColor="text-blue-500"
                    bg="bg-slate-900/40"
                />
                <SummaryCard 
                    label="Net Payable Remaining" 
                    value={`₹${ledger.due.toLocaleString('en-IN')}`} 
                    icon={<FiAlertCircle />} 
                    color={ledger.due > 0 ? "text-red-400" : "text-emerald-400"}
                    iconColor={ledger.due > 0 ? "text-red-500" : "text-emerald-500"}
                    bg={ledger.due > 0 ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"}
                />
                <SummaryCard 
                    label="Cleared History" 
                    value={`₹${ledger.paid.toLocaleString('en-IN')}`} 
                    icon={<FiCheckCircle />} 
                    color="text-emerald-400"
                    iconColor="text-emerald-500"
                    bg="bg-emerald-500/5 border-emerald-500/20"
                />
            </div>

            {/* TRANSACTION HISTORY */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-slate-800 overflow-hidden">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <h3 className="font-black text-white uppercase text-xs tracking-widest italic flex items-center gap-2">
                        <FiCreditCard className="text-[#F37021]" /> Statement of Account
                    </h3>
                    <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                        Method: <span className="text-white">{student.paymentOption || "Full Payment"}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-slate-800">
                                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Date</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Transaction Description</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Status</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {/* Registration Payment */}
                            <tr className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-6 text-sm font-bold text-slate-400 italic">
                                    {new Date(student.createdAt).toLocaleDateString('en-IN')}
                                </td>
                                <td className="p-6">
                                    <p className="text-xs font-black text-white uppercase tracking-tight">Registration Commitment</p>
                                    <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">Initial payment received via {student.paymentMethod || 'CASH/UPI'}</p>
                                </td>
                                <td className="p-6 text-right">
                                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">Cleared</span>
                                </td>
                                <td className="p-6 text-sm font-black text-emerald-400 italic text-right">
                                    {/* Dynamically calculate initial payment if log exists, else use total paid */}
                                    + ₹{((student.paymentLog && student.paymentLog.length > 0) 
                                        ? Number(student.amountPaid - student.paymentLog.reduce((a,b) => a + Number(b.amount), 0)) 
                                        : ledger.paid).toLocaleString('en-IN')}
                                </td>
                            </tr>

                            {/* Additional Payment Logs */}
                            {student.paymentLog?.map((log, index) => (
                                <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-6 text-sm font-bold text-slate-400 italic">
                                        {new Date(log.date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-black text-white uppercase tracking-tight">Ledger Adjustment</p>
                                        <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">Payment sync via Admin Central</p>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">Cleared</span>
                                    </td>
                                    <td className="p-6 text-sm font-black text-emerald-400 italic text-right">
                                        + ₹{Number(log.amount).toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}

                            {/* Future Projected Row */}
                            {ledger.due > 0 && (
                                <tr className="bg-slate-900/60 border-t border-slate-700">
                                    <td className="p-6 text-sm font-bold text-orange-400 italic">
                                        {ledger.nextInstallmentDate?.toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-black text-[#F37021] uppercase tracking-tight">Upcoming Installment</p>
                                        <p className="text-[10px] text-slate-500 font-bold italic tracking-widest mt-1">Estimated next payable cycle</p>
                                    </td>
                                    <td className="p-6 text-right">
                                        <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">Pending</span>
                                    </td>
                                    <td className="p-6 text-sm font-black text-slate-600 italic text-right">
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

function SummaryCard({ label, value, icon, color, iconColor, bg }) {
    return (
        <div className={`${bg} p-8 rounded-[2rem] border border-slate-800 shadow-lg flex items-center justify-between relative overflow-hidden group backdrop-blur-md`}>
            <div className="z-10">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                <p className={`text-3xl font-black italic tracking-tighter ${color}`}>{value}</p>
            </div>
            <div className={`text-6xl ${iconColor} opacity-10 absolute -right-4 -bottom-4 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500`}>
                {icon}
            </div>
        </div>
    );
}