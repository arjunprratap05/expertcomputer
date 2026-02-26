import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCalendar, FiCheckCircle, FiFileText } from 'react-icons/fi';

export default function FeeLedger() {
    const [student, setStudent] = useState(null);

    useEffect(() => {
        const savedData = localStorage.getItem("studentData");
        if (savedData) setStudent(JSON.parse(savedData));
    }, []);

    if (!student) return null;

    // Only tracking what has been paid
    const amountPaid = Number(student.amountPaid || 0);

    return (
        <div className="p-6 md:p-12 font-sans bg-[#F8FAFC] min-h-screen">
            {/* Header */}
            <div className="mb-10">
                <h2 className="text-3xl font-black text-[#1A5F7A] uppercase tracking-tighter italic">
                    Fee <span className="text-[#F37021]">Ledger</span>
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">
                    Official Payment Records
                </p>
            </div>

            {/* Summary Card - Only Amount Paid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <SummaryCard 
                    label="Total Amount Paid" 
                    value={`₹${amountPaid.toLocaleString('en-IN')}`} 
                    icon={<FiCheckCircle />} 
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <div className="hidden md:flex bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm items-center">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                       Status: Admission Fee Verified
                   </p>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                    <h3 className="font-black text-[#1A5F7A] uppercase text-sm italic">Transaction History</h3>
                </div>

                <div className="overflow-x-auto">
                    {amountPaid > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="p-6 text-sm font-bold text-slate-600">
                                        {new Date(student.createdAt || student.enrollmentDate).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="p-6 text-sm font-bold text-[#1A5F7A]">
                                        Admission Fee - {student.course}
                                    </td>
                                    <td className="p-6 text-sm font-black text-[#1A5F7A]">
                                        ₹{amountPaid.toLocaleString('en-IN')}
                                    </td>
                                    <td className="p-6">
                                        <span className="bg-green-100 text-green-600 text-[9px] font-black px-3 py-1 rounded-full uppercase">
                                            Success
                                        </span>
                                    </td>
                                </motion.tr>
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-20 text-center text-slate-400 font-bold uppercase italic">
                            No Payments Recorded
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon, color, bg = "bg-white" }) {
    return (
        <div className={`${bg} p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between`}>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</p>
            </div>
            <div className={`text-2xl ${color} opacity-20`}>{icon}</div>
        </div>
    );
}