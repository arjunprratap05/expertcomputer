import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiCpu, FiLoader, FiMinimize2 } from 'react-icons/fi';

export default function FloatingAIBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! I am your Expert Academy AI Assistant. Need help with your syllabus or code?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to the bottom when a new message appears
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        
        // Add user message to chat
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            // BEST PRACTICE: Dynamically fetch the Base URL from Vite's environment variables
            // It falls back to localhost:5000 strictly for local development if the env var isn't loaded yet
            const API_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/lms/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting to the server." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: "Network error. Please check your connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[99999] font-sans" style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
            
            <AnimatePresence>
                {/* THE EXPANDED CHAT WINDOW */}
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#1A5F7A] p-4 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <FiCpu className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-widest italic leading-none">ECA AI Tutor</h3>
                                    <span className="text-[10px] text-blue-200 font-bold uppercase flex items-center gap-1 mt-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <FiMinimize2 size={18} />
                            </button>
                        </div>

                        {/* Chat History Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-[#F37021] text-white rounded-br-sm shadow-md' 
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm shadow-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-sm shadow-sm flex gap-2">
                                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 relative">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a technical question..."
                                disabled={isLoading}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-2xl py-3.5 pl-4 pr-14 focus:outline-none focus:border-[#1A5F7A]/30 transition-colors"
                            />
                            <button 
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-[#1A5F7A] text-white p-2 rounded-xl shadow-md disabled:opacity-50 hover:scale-105 transition-all"
                            >
                                {isLoading ? <FiLoader className="animate-spin text-sm" /> : <FiSend className="text-sm" />}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* THE FLOATING TRIGGER BUTTON */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 bg-gradient-to-r from-[#F37021] to-amber-500 rounded-full shadow-2xl flex items-center justify-center text-white border-4 border-white relative"
            >
                {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
                
                {/* Notification dot (optional, to draw attention) */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
            </motion.button>
            
        </div>
    );
}