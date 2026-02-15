import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiSend, FiCpu } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hi! I'm Expert AI. I can help you with ADCA, Tally, or our new Gen-AI courses. What would you like to learn today?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleAction = async (msg) => {
        if (!msg.trim()) return;
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        
        setMessages(prev => [...prev, { sender: "user", text: msg }]);
        setInput("");
        setIsTyping(true);

        try {
            const { data } = await axios.post(`${API_URL}/assistant/process`, { type: 'chat', message: msg });
            
            setIsTyping(false);
            if (data.reply === "HANDOVER_TRIGGER") {
                setMessages(prev => [...prev, { 
                    sender: "bot", 
                    text: "I'll connect you with a senior counselor who can assist you further via WhatsApp.", 
                    isHandover: true 
                }]);
            } else {
                setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
            }
        } catch (error) {
            setIsTyping(false);
            setMessages(prev => [...prev, { sender: "bot", text: "I'm having a bit of trouble connecting. Please try again or visit our Contact page." }]);
        }
    };

    const secureRedirect = async () => {
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        const { data } = await axios.post(`${API_URL}/assistant/process`, { type: 'redirect', counselorId: 'counselor_1' });
        window.open(data.url, "_blank");
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1000] font-sans">
            <AnimatePresence>
                {!isOpen ? (
                    <motion.button 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)} 
                        className="bg-[#1A5F7A] text-white p-5 rounded-full shadow-2xl relative group overflow-hidden"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                        <FiMessageSquare size={28} />
                    </motion.button>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="bg-white w-[350px] md:w-[380px] h-[550px] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-slate-100"
                    >
                        {/* Header */}
                        <div className="bg-[#1A5F7A] p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <FiCpu className="animate-pulse" />
                                </div>
                                <div>
                                    <p className="font-black uppercase tracking-widest text-[10px]">Expert Academy</p>
                                    <h3 className="text-sm font-bold">AI Counselor</h3>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div ref={scrollRef} className="flex-grow p-5 overflow-y-auto bg-[#F8FAFC] space-y-4 no-scrollbar">
                            {messages.map((m, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: m.sender === "user" ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i} 
                                    className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[85%] p-4 text-[13px] leading-relaxed shadow-sm ${
                                        m.sender === "user" 
                                        ? "bg-[#F37021] text-white rounded-[1.5rem_1.5rem_0_1.5rem]" 
                                        : "bg-white text-slate-700 rounded-[1.5rem_1.5rem_1.5rem_0]"
                                    }`}>
                                        {m.text}
                                        {m.isHandover && (
                                            <button 
                                                onClick={secureRedirect} 
                                                className="mt-4 bg-[#25D366] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest w-full flex items-center justify-center gap-2 hover:bg-[#1eb954] transition-colors"
                                            >
                                                <FaWhatsapp size={16} /> Chat Now
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-[1.5rem_1.5rem_1.5rem_0] shadow-sm flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleAction(input); }} 
                            className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center"
                        >
                            <input 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)} 
                                placeholder="Ask about courses..." 
                                className="flex-grow p-3 bg-slate-50 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:ring-1 focus:ring-[#1A5F7A] transition-all"
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isTyping}
                                className="bg-[#1A5F7A] text-white p-3 rounded-2xl hover:bg-[#F37021] disabled:opacity-50 disabled:hover:bg-[#1A5F7A] transition-all"
                            >
                                <FiSend />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}