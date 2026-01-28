import React from 'react';
import { Link } from 'react-router-dom';
import { FiSettings, FiArrowLeft } from 'react-icons/fi';

export default function UnderDevelopment() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <div className="bg-orange-100 p-6 rounded-full mb-6 animate-spin-slow">
                <FiSettings size={60} className="text-[#F37021]" />
            </div>
            <h1 className="text-4xl font-black text-[#1A5F7A] mb-4">Under Development</h1>
            <p className="text-slate-600 max-w-md mb-8">
                We are currently building this section to provide you with the best experience. 
                Please check back soon!
            </p>
            <Link 
                to="/" 
                className="flex items-center gap-2 bg-[#1A5F7A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#F37021] transition-all"
            >
                <FiArrowLeft /> Back to Home
            </Link>
        </div>
    );
}