import React, { useState } from 'react';
import { FiExternalLink, FiAward, FiClock, FiCreditCard } from 'react-icons/fi';
import { universityPrograms } from '../../data/courses'

export default function UniversityDegrees() {
    const [activeTab, setActiveTab] = useState('All');
    const categories = ['All', 'Masters', 'Bachelors'];

    const filtered = activeTab === 'All' 
        ? universityPrograms 
        : universityPrograms.filter(p => p.category === activeTab);

    return (
        <section id="university-degrees" className="py-24 bg-slate-50 relative">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-block px-4 py-1 bg-orange-100 text-[#F37021] rounded-full text-xs font-black uppercase tracking-widest">
                        University Degree Pathways
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-[#1A5F7A]">
                        Expand Your <span className="text-[#F37021]">Academic Horizon</span>
                    </h2>
                    
                    {/* Filter Tabs */}
                    <div className="flex justify-center gap-3 mt-10">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-8 py-3 rounded-2xl font-bold transition-all ${
                                    activeTab === cat 
                                    ? 'bg-[#1A5F7A] text-white shadow-xl' 
                                    : 'bg-white text-[#1A5F7A] hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((prog) => (
                        <div key={prog.id} className="flex flex-col h-full p-8 border-2 border-slate-100 rounded-[3rem] bg-white hover:shadow-2xl transition-all duration-300 group">
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black text-[#1A5F7A] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 uppercase">
                                        {prog.university}
                                    </span>
                                    <span className="flex items-center gap-1 text-[#F37021] text-xs font-bold">
                                        <FiAward /> {prog.recognition}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-[#1A5F7A] group-hover:text-[#F37021] transition-colors leading-tight">
                                    {prog.title}
                                </h3>
                            </div>

                            <div className="space-y-4 mb-8 flex-grow">
                                <div className="flex items-center gap-3 text-slate-500 font-medium">
                                    <FiClock className="text-[#F37021]" /> Duration: {prog.duration}
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 font-medium">
                                    <FiCreditCard className="text-[#F37021]" /> Semester Fee: <span className="text-[#1A5F7A] font-bold">{prog.semFee}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Program Fee</span>
                                    <span className="text-2xl font-black text-[#1A5F7A]">{prog.totalFee}</span>
                                </div>
                                <a 
                                    href={prog.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full bg-[#1A5F7A] text-white py-4 rounded-2xl font-bold hover:bg-[#F37021] transition-all group/btn"
                                >
                                    University Details 
                                    <FiExternalLink className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}