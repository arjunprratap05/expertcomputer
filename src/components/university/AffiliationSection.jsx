import React, { useState } from 'react';
import { FiExternalLink, FiAward, FiCheckCircle, FiX, FiInfo, FiCreditCard } from 'react-icons/fi';

export default function AffiliationSection() {
    const [selectedPartner, setSelectedPartner] = useState(null);

    const partners = [
        {
            name: "Jain University",
            desc: "Highly prestigious university offering globally recognized online degree programs with a focus on career readiness.",
            link: "https://onlinejain.com/",
            tags: ["NAAC A++ Grade", "UGC Entitled"],
            fees: {
                program: "BCA (Work Linked)",
                reg: "₹500",
                exam: "₹13,500",
                course: "₹37,500",
                total: "₹51,500",
                duration: "3 Years"
            }
        },
        {
            name: "Chandigarh University",
            desc: "One of India's fastest-growing universities providing industry-aligned online MBA and MCA programs.",
            link: "https://cuol.onlinecu.in/",
            tags: ["NAAC A+ Grade", "QS Ranked"],
            fees: {
                program: "MBA",
                reg: "Included",
                exam: "Included",
                course: "₹1,50,000",
                total: "₹1,50,000",
                duration: "2 Years"
            }
        },
        {
            name: "Uttaranchal University",
            desc: "Focuses on professional education with high-quality online degrees in management and humanities.",
            link: "https://www.uuonline.org",
            tags: ["NAAC A+ Grade", "UGC Entitled"],
            fees: {
                program: "BCA with Apprenticeship",
                reg: "Included",
                exam: "₹15,000",
                course: "₹69,000",
                total: "₹99,000", // Includes Apprenticeship 
                duration: "3 Years"
            }
        },
        {
            name: "Mizoram University",
            desc: "A Central University providing specialized online certificates and degrees.",
            link: "https://www.mzuonline.in/",
            tags: ["Central University", "NAAC A Grade"],
            fees: {
                program: "BCA",
                reg: "₹200",
                exam: "₹7,500",
                course: "₹57,000",
                total: "₹64,700",
                duration: "3 Years"
            }
        },
        {
            name: "Jamia University",
            desc: "A historic institution offering diverse undergraduate and postgraduate programs.",
            link: "https://www.jamiahamdardonline.in/",
            tags: ["NAAC A Grade", "Central University"],
            fees: {
                program: "MCA",
                reg: "₹500",
                exam: "Included",
                course: "₹87,000",
                total: "₹87,500",
                duration: "2 Years"
            }
        }
    ];

    return (
        <section className="py-20 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-block px-4 py-1 bg-orange-100 text-[#F37021] rounded-full text-xs font-black uppercase tracking-widest">
                        Academic Affiliations & Partners
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-[#1A5F7A]">
                        Our National <span className="text-[#F37021]">Recognition</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {partners.map((partner, index) => (
                        <div key={index} className="flex flex-col h-full p-8 border-2 border-slate-100 rounded-[2.5rem] bg-slate-50 hover:bg-white transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-[#1A5F7A] group-hover:text-white transition-colors">
                                    <FiAward className="text-2xl" />
                                </div>
                                <h3 className="text-xl font-bold text-[#1A5F7A]">{partner.name}</h3>
                            </div>
                            <p className="text-slate-600 mb-8 flex-grow leading-relaxed">{partner.desc}</p>
                            
                            <button 
                                onClick={() => setSelectedPartner(partner)}
                                className="mb-6 flex items-center gap-2 text-sm font-black text-[#F37021] hover:underline"
                            >
                                <FiInfo /> View Fee Structure
                            </button>

                            <div className="pt-4 border-t border-slate-200">
                                <a href={partner.link} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full text-[#1A5F7A] font-bold">
                                    <span>Official Website</span>
                                    <FiExternalLink />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FEE STRUCTURE POPUP MODAL */}
            {selectedPartner && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A5F7A]/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 bg-[#1A5F7A] text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black">{selectedPartner.name}</h2>
                                <p className="text-sm opacity-80">{selectedPartner.fees.program}</p>
                            </div>
                            <button onClick={() => setSelectedPartner(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><FiX size={24} /></button>
                        </div>
                        
                        <div className="p-8 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Duration</p>
                                    <p className="font-bold text-[#1A5F7A]">{selectedPartner.fees.duration}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Reg. Fee</p>
                                    <p className="font-bold text-[#1A5F7A]">{selectedPartner.fees.reg}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Examination Fees</span>
                                    <span className="font-bold text-[#1A5F7A]">{selectedPartner.fees.exam}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Course/Tuition Fees</span>
                                    <span className="font-bold text-[#1A5F7A]">{selectedPartner.fees.course}</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-slate-100">
                                    <span className="font-black text-[#1A5F7A]">Total Investment</span>
                                    <span className="text-xl font-black text-[#F37021]">{selectedPartner.fees.total}</span>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-4 bg-[#F37021] text-white font-black rounded-2xl shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2">
                                <FiCreditCard /> Pay Semester Installment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}