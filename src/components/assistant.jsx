import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiSend, FiZap, FiLoader } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function Assistant() {
    const [chatOpen, setChatOpen] = useState(false);
    const [waOpen, setWaOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Welcome! I'm the Expert Academy AI. Ask me about any course or fee structure." }
    ]);
    const chatEndRef = useRef(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

    const handleBackendRequest = async (payload) => {
        return await axios.post(`${import.meta.env.VITE_API_BASE_URL}/assistant/process`, payload);
    };

    const processChat = async (text) => {
        if (!text.trim() || isTyping) return;
        setMessages(prev => [...prev, { sender: "user", text }]);
        setInput("");
        setIsTyping(true);
        
        try {
            const { data } = await handleBackendRequest({ type: 'chat', message: text });
            
            if (data.reply === "HANDOVER_TRIGGER") {
                setMessages(prev => [...prev, { sender: "bot", text: "Connecting you to our Counselors now..." }]);
                // AUTOMATIC HANDOVER LOGIC
                setTimeout(() => {
                    setChatOpen(false);
                    setWaOpen(true); // Automatically opens the WhatsApp selection
                }, 1200);
            } else {
                setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
            }
        } catch {
            setMessages(prev => [...prev, { sender: "bot", text: "Service temporarily down. Call 9128812325." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const openWhatsApp = (agentId) => {
        handleBackendRequest({ type: 'redirect', agentId }).then(({ data }) => {
            window.open(data.url, "_blank");
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1000] font-sans">
            <AnimatePresence>
                {chatOpen && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className="bg-white w-[350px] h-[520px] rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-4">
                        <div className="bg-[#1A5F7A] p-6 text-white flex justify-between items-center shadow-lg">
                            <div className="flex items-center gap-2"><FiZap className="text-orange-400" /> <span className="font-black text-xs uppercase tracking-widest">Expert AI</span></div>
                            <button onClick={() => setChatOpen(false)}><FiX size={20}/></button>
                        </div>

                        <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.sender === "user" ? "bg-[#F37021] text-white rounded-tr-none shadow-md" : "bg-white shadow-sm rounded-tl-none border"}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && <div className="flex gap-1 ml-2"><FiLoader className="animate-spin text-slate-300" /></div>}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); processChat(input); }} className="p-4 bg-white border-t flex gap-2">
                            <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type 'Yes' to talk to us..." className="flex-grow p-3 bg-slate-50 rounded-xl outline-none text-sm" />
                            <button type="submit" className="bg-[#1A5F7A] text-white p-3 rounded-xl shadow-lg"><FiSend/></button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-4 items-center">
                <AnimatePresence>
                    {waOpen && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="bg-white p-2 pr-4 rounded-full shadow-2xl border border-slate-100 flex items-center gap-2">
                            <button onClick={() => openWhatsApp("counselor_1")} className="p-3 bg-slate-50 hover:bg-green-50 rounded-full text-[#1A5F7A] font-bold text-[10px] flex items-center gap-2 uppercase"><FaWhatsapp className="text-green-500" size={18}/> Counselor 1</button>
                            <button onClick={() => openWhatsApp("counselor_2")} className="p-3 bg-slate-50 hover:bg-green-50 rounded-full text-[#1A5F7A] font-bold text-[10px] flex items-center gap-2 uppercase"><FaWhatsapp className="text-green-500" size={18}/> Counselor 2</button>
                            <FiX className="text-slate-300 cursor-pointer" onClick={() => setWaOpen(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col gap-3">
                    {!waOpen && (
                        <button onClick={() => setWaOpen(true)} className="bg-[#25D366] text-white p-5 rounded-3xl shadow-2xl hover:scale-110 transition-all"><FaWhatsapp size={24}/></button>
                    )}
                    <button onClick={() => { setChatOpen(!chatOpen); setWaOpen(false); }} className={`${chatOpen ? 'bg-red-500' : 'bg-[#1A5F7A]'} text-white p-5 rounded-3xl shadow-2xl hover:scale-110 transition-all`}>
                        {chatOpen ? <FiX size={24}/> : <FiMessageSquare size={24}/>}
                    </button>
                </div>
            </div>
        </div>
    );
}