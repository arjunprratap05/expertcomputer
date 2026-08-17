import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

// PROD TIP: Use a simple random string or install 'uuid'
const generateSessionId = () => Math.random().toString(36).substring(2, 15);

import expertcomputerlogo from '../assets/expertcomputerlogo.png'; 

export default function ChatBot() {
    const location = useLocation();
    const path = location.pathname;

    // Define paths where the chatbot should NOT appear (prevents overlapping admin/student logins)
    const hideChatPaths = ['/admin', '/student', '/login', '/dashboard'];
    const shouldHideChat = hideChatPaths.some((restrictedRoute) => 
        path.startsWith(restrictedRoute)
    );

    // If on admin or student portals, do not render the widget at all
    if (shouldHideChat) {
        return null;
    }

    const [isOpen, setIsOpen] = useState(false);
    // Persist sessionId for the duration of the browser tab
    const [sessionId] = useState(() => {
        const saved = sessionStorage.getItem("eca_ai_session");
        if (saved) return saved;
        const newId = generateSessionId();
        sessionStorage.setItem("eca_ai_session", newId);
        return newId;
    });

    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hi! I'm Expert Academy AI. What course would you like to learn about today?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

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
            // SYNCED WITH BACKEND: Added sessionId to the payload
            const { data } = await axios.post(`${API_URL}/assistant/process`, { 
                type: 'chat', 
                message: msg,
                sessionId: sessionId // CRITICAL: Keeps the Name -> Email flow alive
            });
            
            setIsTyping(false);
            
            if (data.reply === "HANDOVER_TRIGGER") {
                setMessages(prev => [...prev, { 
                    sender: "bot", 
                    text: "Connecting you to our senior counselor...", 
                    isHandover: true 
                }]);
            } else {
                setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
            }
        } catch (error) {
            setIsTyping(false);
            setMessages(prev => [...prev, { sender: "bot", text: "Expert AI is syncing. Please try again or visit us at our Patna center." }]);
        }
    };

    const secureRedirect = async () => {
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        const { data } = await axios.post(`${API_URL}/assistant/process`, { 
            type: 'redirect', 
            agentId: 'counselor_1' // Updated to match your backend agentId logic
        });
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
                        <FiMessageSquare size={28} />
                    </motion.button>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="bg-white w-[350px] md:w-[380px] h-[550px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100"
                    >
                        {/* Header */}
                        <div className="bg-[#1A5F7A] p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-1.5 rounded-xl shadow-inner">
                                    <img src={expertcomputerlogo} alt="Logo" className="w-8 h-8 object-contain" />
                                </div>
                                <div>
                                    <p className="font-black uppercase tracking-tighter text-[9px] opacity-70">Expert Computer Academy</p>
                                    <h3 className="text-sm font-bold italic">AI Admissions Desk</h3>
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
                                    <div className={`max-w-[85%] p-4 text-[12px] font-medium leading-relaxed shadow-sm ${
                                        m.sender === "user" 
                                        ? "bg-[#F37021] text-white rounded-[1.5rem_1.5rem_0_1.5rem]" 
                                        : "bg-white text-slate-700 rounded-[1.5rem_1.5rem_1.5rem_0]"
                                    }`}>
                                        {m.text}
                                        {m.isHandover && (
                                            <button 
                                                onClick={secureRedirect} 
                                                className="mt-4 bg-[#25D366] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest w-full flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                                            >
                                                <FaWhatsapp size={16} /> Contact Human
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && <TypingIndicator />}
                        </div>

                        {/* Input Area */}
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleAction(input); }} 
                            className="p-4 bg-white border-t border-slate-100 flex gap-2"
                        >
                            <input 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)} 
                                placeholder="Tell me your name or ask about fees..." 
                                className="flex-grow p-3 bg-slate-50 rounded-2xl outline-none text-sm font-medium focus:bg-white transition-all"
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isTyping}
                                className="bg-[#1A5F7A] text-white p-3 rounded-2xl hover:bg-[#F37021] transition-all"
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

function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="bg-white p-4 rounded-[1.5rem_1.5rem_1.5rem_0] shadow-sm flex gap-1">
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
        </div>
    );
}