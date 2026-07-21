import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTerminal, FiX, FiSend, FiCpu, FiLoader, FiMinimize2, FiImage, FiPaperclip, FiFileText } from 'react-icons/fi';

export default function AdminAIBot({ systemData, onStateChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Executive Co-Pilot online. I am connected to your live system data and can analyze PDF documents. How can I assist you?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Auto-focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Dynamic autocomplete dictionary
    const autocompleteDictionary = useMemo(() => {
        const commands = [
            "Create a coupon for ",
            "Unlock portal for ",
            "Create a new batch called ",
            "Analyze my screen",
            "Analyze this attached document",
            "Extract coupon details from this PDF"
        ];

        if (systemData) {
            const courses = systemData.availableCourses ? systemData.availableCourses.split(', ') : [];
            const students = systemData.pendingStudentsList ? systemData.pendingStudentsList.split(', ') : [];
            
            courses.forEach(c => { if (c !== "None") commands.push(`Create a coupon for ${c}`); });
            students.forEach(s => { if (s !== "None") commands.push(`Unlock portal for ${s}`); });
        }
        return commands;
    }, [systemData]);

    // Handle PDF selection & conversion to Base64
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please select a PDF document.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            setAttachedFile({
                name: file.name,
                data: uploadEvent.target.result
            });
        };
        reader.readAsDataURL(file);
    };

    const handleInput = (e) => {
        const val = e.target.value;
        setInput(val);
        
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }

        if (!val.trim()) {
            setSuggestion('');
            return;
        }

        const match = autocompleteDictionary.find(phrase => 
            phrase.toLowerCase().startsWith(val.toLowerCase()) && phrase.length > val.length
        );

        setSuggestion(match || '');
    };

    const handleKeyDown = (e) => {
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestion) {
            e.preventDefault();
            setInput(suggestion);
            setSuggestion('');
            return;
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if ((input.trim() || attachedFile) && !isLoading) {
                handleSendMessage(e);
            }
        }
    };

    const formatAIText = (text) => {
        if (!text) return null;
        return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-black text-[#1A5F7A]">{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() && !attachedFile) return;

        const userMessage = input.trim();
        const filePayload = attachedFile;

        setInput('');
        setSuggestion('');
        setAttachedFile(null);
        
        if (textareaRef.current) textareaRef.current.style.height = '54px';
        
        const displayPrompt = filePayload 
            ? `${userMessage ? userMessage + '\n' : ''}📄 [Attached Document: ${filePayload.name}]` 
            : userMessage;

        const newMessages = [...messages, { role: 'user', text: displayPrompt }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000/api";
            const token = localStorage.getItem("adminToken");

            const chatHistory = newMessages.slice(1, -1).map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.text
            }));

            const response = await fetch(`${API_URL}/admin/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    message: userMessage,
                    context: systemData,
                    chatHistory: chatHistory,
                    file: filePayload
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                // STRICT FALLBACK: Prevents 'undefined' UI leak
                const aiResponseText = data.response || "✅ Action processed successfully.";
                
                setMessages(prev => [...prev, { 
                    role: 'ai', 
                    text: aiResponseText,
                    images: data.images || []
                }]);

                // --- LIVE DASHBOARD REFRESH TRIGGER ---
                // If the AI confirms a database action was completed, refresh the dashboard instantly!
                if (onStateChange && aiResponseText.includes('System Action Completed')) {
                    onStateChange();
                }

            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "Co-Pilot Error: " + (data.error || "Unable to reach the server.") }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: "Network anomaly detected. Please check connection." }]);
        } finally {
            setIsLoading(false);
            setTimeout(() => textareaRef.current?.focus(), 100);
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
                        <div className="bg-[#1A5F7A] p-5 text-white flex items-center justify-between border-b-4 border-[#F37021]">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 shadow-inner">
                                    <FiTerminal className="text-xl text-blue-200" />
                                </div>
                                <div>
                                    <h3 className="font-black text-[15px] uppercase tracking-widest italic leading-none">Executive Co-Pilot</h3>
                                    <span className="text-[9px] text-blue-200 font-bold uppercase flex items-center gap-1.5 mt-1 tracking-wider">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]"></span> Autonomous PDF Agent Active
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <FiMinimize2 size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-slate-800 text-white rounded-br-sm shadow-md' 
                                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm'
                                    }`}>
                                        <div className="whitespace-pre-wrap break-words">
                                            {msg.role === 'ai' ? formatAIText(msg.text) : msg.text}
                                        </div>
                                        
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

                        {attachedFile && (
                            <div className="px-4 py-2 bg-orange-50 border-t border-orange-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-[#F37021] truncate max-w-[85%]">
                                    <FiFileText size={16} />
                                    <span className="truncate">{attachedFile.name}</span>
                                </div>
                                <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-red-500 text-xs font-black">
                                    <FiX size={16} />
                                </button>
                            </div>
                        )}

                        <div className="p-4 bg-slate-50 border-t border-slate-200 relative flex items-end gap-2">
                            
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                accept="application/pdf" 
                                onChange={handleFileSelect} 
                                className="hidden" 
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                title="Attach PDF Document"
                                className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:text-[#1A5F7A] hover:bg-slate-100 transition-colors shadow-sm mb-[1px]"
                            >
                                <FiPaperclip size={18} />
                            </button>

                            <div className="relative flex-1 bg-white border border-slate-200 rounded-xl shadow-inner transition-colors focus-within:border-[#1A5F7A]/50">
                                {suggestion && suggestion.toLowerCase().startsWith(input.toLowerCase()) && (
                                    <div className="absolute inset-0 py-4 pl-4 pr-12 text-slate-300 text-sm font-bold pointer-events-none whitespace-pre-wrap break-words z-0 flex">
                                        <span className="opacity-0">{input}</span>
                                        <span>{suggestion.slice(input.length)}</span>
                                    </div>
                                )}

                                <textarea 
                                    ref={textareaRef}
                                    value={input}
                                    onChange={handleInput}
                                    onKeyDown={handleKeyDown}
                                    placeholder={suggestion ? "" : "Ask or attach a PDF..."}
                                    disabled={isLoading}
                                    rows={1}
                                    style={{ minHeight: '54px' }}
                                    className="w-full bg-transparent text-slate-700 text-sm font-bold py-4 pl-4 pr-12 focus:outline-none resize-none overflow-y-auto no-scrollbar relative z-10 block"
                                />
                            </div>

                            <button 
                                onClick={handleSendMessage}
                                disabled={isLoading || (!input.trim() && !attachedFile)}
                                className="bg-[#1A5F7A] text-white p-3 rounded-xl shadow-md disabled:opacity-50 hover:bg-slate-800 transition-all mb-[1px]"
                            >
                                {isLoading ? <FiLoader className="animate-spin text-sm" /> : <FiSend className="text-sm" />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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