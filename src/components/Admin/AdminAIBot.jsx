import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTerminal, FiX, FiSend, FiCpu, FiLoader, FiMinimize2, FiImage } from 'react-icons/fi';

export default function AdminAIBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Executive Co-Pilot online. Do you need help analyzing data, drafting communications, or planning curriculum?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

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
        
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";
            const token = localStorage.getItem("adminToken");

            // Pointing to a dedicated admin AI route!
            const response = await fetch(`${API_URL}/admin/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMessage })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessages(prev => [...prev, { 
                    role: 'ai', 
                    text: data.response,
                    images: data.images || []
                }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "Co-Pilot Error: Unable to reach the server." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: "Network anomaly detected. Please check connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[99999] font-sans" style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 w-[350px] md:w-[450px] h-[600px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
                    >
                        {/* Admin Header */}
                        <div className="bg-[#1A5F7A] p-5 text-white flex items-center justify-between border-b-4 border-[#F37021]">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 shadow-inner">
                                    <FiTerminal className="text-xl text-blue-200" />
                                </div>
                                <div>
                                    <h3 className="font-black text-[15px] uppercase tracking-widest italic leading-none">Executive Co-Pilot</h3>
                                    <span className="text-[9px] text-blue-200 font-bold uppercase flex items-center gap-1.5 mt-1 tracking-wider">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]"></span> Secure Line
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <FiMinimize2 size={20} />
                            </button>
                        </div>

                        {/* Chat History Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-slate-800 text-white rounded-br-sm shadow-md' 
                                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm'
                                    }`}>
                                        <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                                        
                                        {msg.images && msg.images.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <div className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 border-b border-slate-100 pb-1 tracking-widest">
                                                    <FiImage /> Intel Visuals
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {msg.images.map((imgUrl, i) => (
                                                        <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:opacity-90 transition-opacity">
                                                            <img src={imgUrl} alt={`Intel Diagram ${i + 1}`} className="w-full h-auto object-cover max-h-48 bg-slate-100" loading="lazy" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-sm shadow-sm flex gap-2">
                                        <span className="w-2 h-2 bg-[#1A5F7A] rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-[#1A5F7A] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-2 h-2 bg-[#1A5F7A] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 relative">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Issue a command or query..."
                                disabled={isLoading}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl py-4 pl-5 pr-14 focus:outline-none focus:border-[#1A5F7A]/50 transition-colors shadow-inner"
                            />
                            <button 
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-[#1A5F7A] text-white p-2.5 rounded-lg shadow-md disabled:opacity-50 hover:bg-slate-800 transition-all"
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
                className="w-16 h-16 bg-[#1A5F7A] rounded-[1.5rem] shadow-2xl flex items-center justify-center text-white border-2 border-white/20 relative"
            >
                {isOpen ? <FiX size={26} /> : <FiCpu size={26} />}
            </motion.button>
            
        </div>
    );
}