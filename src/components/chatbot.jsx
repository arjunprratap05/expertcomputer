import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const generateSessionId = () => Math.random().toString(36).substring(2, 15);

// Helper to get formatted current time (e.g., "10:26 AM")
const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

import expertcomputerlogo from '../assets/expertcomputerlogo.png'; 

export default function ChatBot() {
    const location = useLocation();
    const path = location.pathname;

    const hideChatPaths = ['/admin', '/student', '/login', '/dashboard'];
    const shouldHideChat = hideChatPaths.some((restrictedRoute) => 
        path.startsWith(restrictedRoute)
    );

    if (shouldHideChat) {
        return null;
    }

    const [isOpen, setIsOpen] = useState(false);
    const [sessionId] = useState(() => {
        const saved = sessionStorage.getItem("eca_ai_session");
        if (saved) return saved;
        const newId = generateSessionId();
        sessionStorage.setItem("eca_ai_session", newId);
        return newId;
    });

    // Added timestamp to initial state
    const [messages, setMessages] = useState([
        { 
            sender: "bot", 
            text: "Hi! I'm Expert Academy AI. What course would you like to learn about today?",
            timestamp: getCurrentTime()
        }
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
        
        // Save user message with current time
        setMessages(prev => [...prev, { sender: "user", text: msg, timestamp: getCurrentTime() }]);
        setInput("");
        setIsTyping(true);

        try {
            const { data } = await axios.post(`${API_URL}/assistant/chat`, { 
                type: 'chat', 
                message: msg,
                sessionId: sessionId 
            });
            
            setIsTyping(false);
            
            // Save bot response with current time
            if (data.reply === "HANDOVER_TRIGGER") {
                setMessages(prev => [...prev, { 
                    sender: "bot", 
                    text: "Connecting you to our senior counselor...", 
                    isHandover: true,
                    timestamp: getCurrentTime()
                }]);
            } else {
                setMessages(prev => [...prev, { 
                    sender: "bot", 
                    text: data.reply,
                    timestamp: getCurrentTime()
                }]);
            }
        } catch (error) {
            setIsTyping(false);
            setMessages(prev => [...prev, { 
                sender: "bot", 
                text: "Expert AI is syncing. Please try again or visit us at our Patna center.",
                timestamp: getCurrentTime()
            }]);
        }
    };

    const secureRedirect = async () => {
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        try {
            const { data } = await axios.post(`${API_URL}/assistant/chat`, { 
                type: 'redirect', 
                agentId: 'counselor_1' 
            });
            if (data.url) {
                window.open(data.url, "_blank");
            }
        } catch (err) {
            window.open("https://wa.me/917282983335", "_blank");
        }
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
                        className="bg-[#1A5F7A] text-white p-5 rounded-full shadow-2xl relative group overflow-hidden cursor-pointer"
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
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer">
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
                                    <div className="flex flex-col max-w-[85%]">
                                        <div className={`p-4 text-[12px] font-medium leading-relaxed shadow-sm ${
                                            m.sender === "user" 
                                                ? "bg-[#F37021] text-white rounded-[1.5rem_1.5rem_0_1.5rem]" 
                                                : "bg-white text-slate-700 rounded-[1.5rem_1.5rem_1.5rem_0]"
                                        }`}>
                                            {m.text}
                                            {m.isHandover && (
                                                <button 
                                                    onClick={secureRedirect} 
                                                    className="mt-4 bg-[#25D366] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest w-full flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer"
                                                >
                                                    <FaWhatsapp size={16} /> Contact Human
                                                </button>
                                            )}
                                        </div>
                                        {/* Timestamp Display */}
                                        <span className={`text-[9px] text-slate-400 mt-1.5 px-1 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                                            {m.timestamp}
                                        </span>
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
                                placeholder="Ask about our courses or leave your name..." 
                                className="flex-grow p-3 bg-slate-50 rounded-2xl outline-none text-sm font-medium focus:bg-white transition-all text-slate-900"
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isTyping}
                                className="bg-[#1A5F7A] text-white p-3 rounded-2xl hover:bg-[#F37021] transition-all disabled:opacity-40 cursor-pointer"
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
            <div className="bg-white p-4 rounded-[1.5rem_1.5rem_1.5rem_0] shadow-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
        </div>
    );
}