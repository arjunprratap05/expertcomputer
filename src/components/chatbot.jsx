import React, { useState } from "react";
import axios from "axios";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: "bot", text: "Hi! I'm the Expert AI. Ask me about ADCA or Tally!" }]);
    const [input, setInput] = useState("");

    const handleAction = async (msg) => {
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        setMessages(prev => [...prev, { sender: "user", text: msg }]);
        
        const { data } = await axios.post(`${API_URL}/assistant/process`, { type: 'chat', message: msg });
        
        if (data.reply === "HANDOVER_TRIGGER") {
            setMessages(prev => [...prev, { sender: "bot", text: "Connecting you to an executive...", isHandover: true }]);
        } else {
            setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
        }
    };

    const secureRedirect = async () => {
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        const { data } = await axios.post(`${API_URL}/assistant/process`, { type: 'redirect', counselorId: 'counselor_1' });
        window.open(data.url, "_blank");
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1000]">
            {!isOpen ? (
                <button onClick={() => setIsOpen(true)} className="bg-[#1A5F7A] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all"><FiMessageSquare size={28} /></button>
            ) : (
                <div className="bg-white w-[350px] h-[500px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border">
                    <div className="bg-[#1A5F7A] p-6 text-white flex justify-between">
                        <span className="font-bold">Academy Bot</span>
                        <button onClick={() => setIsOpen(false)}><FiX size={24} /></button>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.sender === "user" ? "bg-[#F37021] text-white" : "bg-white shadow-sm"}`}>
                                    {m.text}
                                    {m.isHandover && <button onClick={secureRedirect} className="mt-3 bg-[#25D366] text-white p-2 rounded-xl font-bold w-full flex items-center justify-center gap-2"><FaWhatsapp /> Chat Now</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleAction(input); setInput(""); }} className="p-4 bg-white border-t flex gap-2">
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type here..." className="flex-grow p-2 bg-slate-50 rounded-xl outline-none" />
                        <button type="submit" className="bg-[#1A5F7A] text-white p-2 rounded-xl"><FiSend /></button>
                    </form>
                </div>
            )}
        </div>
    );
}