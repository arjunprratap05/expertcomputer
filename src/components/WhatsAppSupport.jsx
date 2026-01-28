import React, { useState } from "react";
import axios from "axios";
import { FaWhatsapp } from "react-icons/fa";
import { FiX, FiUser, FiMessageCircle } from "react-icons/fi";

export default function WhatsAppSupport() {
    const [isOpen, setIsOpen] = useState(false);

    const handleRedirect = async (counselorId) => {
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        const { data } = await axios.post(`${API_URL}/assistant/process`, { 
            type: 'redirect', 
            counselorId 
        });
        window.open(data.url, "_blank");
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-24 z-[1000]">
            {!isOpen ? (
                <button onClick={() => setIsOpen(true)} className="bg-[#25D366] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all">
                    <FaWhatsapp size={28} />
                </button>
            ) : (
                <div className="bg-white w-[320px] rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-5">
                    <div className="bg-[#25D366] p-6 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2"><FiMessageCircle size={20} /><h3 className="font-bold">WhatsApp Support</h3></div>
                        <button onClick={() => setIsOpen(false)}><FiX size={20} /></button>
                    </div>
                    <div className="p-4 bg-slate-50 space-y-3">
                        <button onClick={() => handleRedirect("counselor_1")} className="w-full bg-white p-4 rounded-2xl border flex items-center gap-4 hover:border-[#25D366] transition-all">
                            <div className="bg-[#25D366]/10 p-3 rounded-xl text-[#25D366]"><FiUser size={18} /></div>
                            <div><h4 className="font-bold text-[#1A5F7A] text-sm">Counselor 1</h4><p className="text-[10px] text-slate-500">Registrations</p></div>
                        </button>
                        <button onClick={() => handleRedirect("counselor_2")} className="w-full bg-white p-4 rounded-2xl border flex items-center gap-4 hover:border-[#25D366] transition-all">
                            <div className="bg-[#25D366]/10 p-3 rounded-xl text-[#25D366]"><FiUser size={18} /></div>
                            <div><h4 className="font-bold text-[#1A5F7A] text-sm">Counselor 2</h4><p className="text-[10px] text-slate-500">Technical Info</p></div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}