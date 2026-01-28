import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function CategoryPage() {
    const { categoryId } = useParams();

    // Map the URL ID back to a readable title
    const displayTitle = categoryId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <Link to="/" className="flex items-center gap-2 text-[#1A5F7A] font-bold mb-8 hover:text-[#f37021] transition">
                <FiArrowLeft /> Back to Home
            </Link>

            <h1 className="text-4xl font-black text-[#1A5F7A] mb-4">Modules for {displayTitle}</h1>
            <p className="text-slate-600 mb-12 text-lg">Detailed curriculum curated specifically for {displayTitle} needs.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Example Module Card - You can map your actual course data here */}
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
                    <h3 className="text-2xl font-bold text-[#1A5F7A] mb-4">Core Digital Literacy</h3>
                    <ul className="space-y-4">
                        {["Operating Systems Basics", "Internet & Cyber Security", "Microsoft Office Suite"].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 font-semibold text-slate-700">
                                <FiCheckCircle className="text-[#f37021]" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}