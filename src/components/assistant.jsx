import React, { useState } from "react";
import axios from "axios";
import { FiMessageSquare, FiX, FiSend, FiUser } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function Assistant() {
    const [chatOpen, setChatOpen] = useState(false);
    const [waOpen, setWaOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([{ sender: "bot", text: "Welcome! How can I help you?" }]);

    const handleBackendRequest = async (payload) => {
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        return await axios.post(`${API_URL}/assistant/process`, payload);
    };

    const triggerRedirect = async (agentId) => {
        const { data } = await handleBackendRequest({ type: 'redirect', agentId });
        window.open(data.url, "_blank");
        setWaOpen(false);
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages([...messages, { sender: "user", text: input }]);
        
        try {
            const { data } = await handleBackendRequest({ type: 'chat', message: input });
            if (data.reply === "HANDOVER_TRIGGER") {
                setMessages(prev => [...prev, { 
                    sender: "bot", 
                    text: "Connecting you for a detailed discussion...", 
                    isHandover: true 
                }]);
            } else {
                setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
            }
        } catch {
            setMessages(prev => [...prev, { sender: "bot", text: "System error. Call 9128812325." }]);
        }
        setInput("");
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-4">
            {/* WhatsApp Popup */}
            {waOpen && (
                <div className="bg-white w-72 rounded-[2rem] shadow-2xl border p-4 animate-in slide-in-from-bottom-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 tracking-widest">Connect with Counselors</p>
                    <button onClick={() => triggerRedirect("counselor_1")} className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-2 hover:bg-[#25D366]/10 font-bold text-sm text-[#1A5F7A]"><FaWhatsapp className="text-[#25D366]"/> Counselor 1</button>
                    <button onClick={() => triggerRedirect("counselor_2")} className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-[#25D366]/10 font-bold text-sm text-[#1A5F7A]"><FaWhatsapp className="text-[#25D366]"/> Counselor 2</button>
                </div>
            )}

            {/* Chatbot Window */}
            {chatOpen && (
                <div className="bg-white w-[350px] h-[500px] rounded-[2.5rem] shadow-2xl border flex flex-col overflow-hidden mb-2">
                    <div className="bg-[#1A5F7A] p-6 text-white flex justify-between">
                        <span className="font-bold">Expert AI</span>
                        <button onClick={() => setChatOpen(false)}><FiX/></button>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`p-4 rounded-2xl text-sm ${m.sender === "user" ? "bg-[#F37021] text-white" : "bg-white shadow-sm"}`}>
                                    {m.text}
                                    {m.isHandover && <button onClick={() => triggerRedirect("counselor_1")} className="mt-3 block w-full bg-[#25D366] text-white p-2 rounded-xl font-bold">Chat with Executive</button>}
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t flex gap-2">
                        <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type a message..." className="flex-grow p-2 bg-slate-50 rounded-xl outline-none" />
                        <button type="submit" className="bg-[#1A5F7A] text-white p-2 rounded-xl font-bold"><FiSend/></button>
                    </form>
                </div>
            )}

            {/* Floating Action Buttons */}
            <div className="flex gap-3">
                <button onClick={() => setWaOpen(!waOpen)} className="bg-[#25D366] text-white p-5 rounded-full shadow-lg hover:scale-110 transition-all"><FaWhatsapp size={24}/></button>
                <button onClick={() => setChatOpen(!chatOpen)} className="bg-[#1A5F7A] text-white p-5 rounded-full shadow-lg hover:scale-110 transition-all"><FiMessageSquare size={24}/></button>
            </div>
        </div>
    );
}