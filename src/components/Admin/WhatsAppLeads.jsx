import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    FiMessageCircle, FiSend, FiUser, FiCpu, 
    FiUserCheck, FiClock, FiShield, FiAlertCircle 
} from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function WhatsAppLeads() {
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const token = localStorage.getItem("adminToken");

    // 1. Fetch All WhatsApp Leads
    const fetchLeads = async () => {
        try {
            const res = await axios.get(`${API_URL}/whatsapp/leads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(res.data.leads || []);
        } catch (error) {
            console.error("Failed to fetch WhatsApp leads", error);
        }
    };

    useEffect(() => {
        fetchLeads();
        const interval = setInterval(fetchLeads, 60000);
        return () => clearInterval(interval);
    }, []);

    // 2. Fetch Chat History
    const loadChatHistory = async (lead) => {
        setSelectedLead(lead);
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/whatsapp/messages/${lead.phone}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data.messages || []);
        } catch (error) {
            console.error("Failed to fetch chat history", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 3. Send Manual Reply
    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedLead) return;

        const currentText = replyText;
        setReplyText("");

        // OPTIMISTIC UI FIX: Perfectly matches your DB schema and is safely inside the function!
        const optimisticMsg = {
            _id: Date.now(),
            sender: 'agent', 
            text: currentText,
            timestamp: new Date().toISOString() 
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            await axios.post(`${API_URL}/whatsapp/send`, {
                phone: selectedLead.phone,
                text: currentText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadChatHistory(selectedLead);
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Failed to send message. Please check the connection.");
        }
    };

    // 4. Toggle AI Control
    const toggleAiControl = async () => {
        if (!selectedLead) return;
        try {
            const newStatus = !selectedLead.isAiControlled;
            await axios.patch(`${API_URL}/whatsapp/toggle-ai/${selectedLead._id}`, 
                { isAiControlled: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setSelectedLead({ ...selectedLead, isAiControlled: newStatus });
            setLeads(leads.map(l => l._id === selectedLead._id ? { ...l, isAiControlled: newStatus } : l));
        } catch (error) {
            console.error("Failed to toggle AI", error);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex h-[700px] overflow-hidden text-left">
            {/* LEFT SIDEBAR: LEAD LIST */}
            <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/30">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <FiMessageCircle className="text-[#F37021] text-xl" />
                    <h3 className="font-black text-[#1A5F7A] uppercase italic tracking-widest">Active Chats</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
                    {leads.length === 0 ? (
                        <p className="text-center text-slate-400 font-bold text-[10px] uppercase mt-10">No active leads</p>
                    ) : (
                        leads.map(lead => (
                            <div 
                                key={lead._id} 
                                onClick={() => loadChatHistory(lead)}
                                className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                                    selectedLead?._id === lead._id 
                                    ? 'bg-white border-[#F37021] shadow-md' 
                                    : 'bg-white border-transparent hover:border-slate-200 shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-[#1A5F7A] uppercase text-sm italic">{lead.name || "Unknown Lead"}</h4>
                                    <span className="bg-slate-100 text-slate-400 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest">
                                        {lead.leadStatus || "Cold Lead"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-400 font-bold text-[11px]">{lead.phone}</p>
                                    {lead.isAiControlled ? (
                                        <FiCpu className="text-blue-500" title="AI Handling" />
                                    ) : (
                                        <FiUserCheck className="text-green-500" title="Human Handling" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT MAIN AREA: CHAT INTERFACE */}
            <div className="w-2/3 flex flex-col bg-white relative">
                {!selectedLead ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                        <FiMessageCircle size={60} className="mb-4 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-[11px]">Select a lead to view chat history</p>
                    </div>
                ) : (
                    <>
                        {/* CHAT HEADER */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shadow-sm">
                            <div>
                                <h3 className="font-black text-[#1A5F7A] uppercase italic text-lg leading-none">{selectedLead.name}</h3>
                                <p className="text-slate-400 font-bold text-[11px] mt-1 flex items-center gap-2">
                                    {selectedLead.phone} 
                                    <span className="text-slate-200">•</span> 
                                    {selectedLead.course || "General Inquiry"}
                                </p>
                            </div>
                            
                            <button 
                                onClick={toggleAiControl}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
                                    selectedLead.isAiControlled 
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100' 
                                    : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                                }`}
                            >
                                {selectedLead.isAiControlled ? (
                                    <><FiCpu size={14}/> AI is Active (Click to Take Over)</>
                                ) : (
                                    <><FiShield size={14}/> Human Active (Click to Return to AI)</>
                                )}
                            </button>
                        </div>

                        {/* MESSAGE HISTORY */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                            {loading ? (
                                <p className="text-center text-slate-400 text-xs font-bold uppercase mt-10">Loading history...</p>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-slate-300 mt-20 flex flex-col items-center">
                                    <FiAlertCircle size={30} className="mb-2 opacity-50" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No messages recorded yet</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isStudent = msg.sender === 'student';
                                    return (
                                        <div key={msg._id} className={`flex ${isStudent ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[70%] p-4 rounded-[1.5rem] shadow-sm ${
                                                isStudent 
                                                ? 'bg-white border border-slate-100 rounded-tl-sm text-slate-600' 
                                                : 'bg-[#1A5F7A] text-white rounded-tr-sm'
                                            }`}>
                                                <p className="text-[13px] font-medium leading-relaxed">{msg.text}</p>
                                                <div className={`text-[9px] font-bold mt-2 flex items-center gap-1 ${isStudent ? 'text-slate-400' : 'text-blue-200/70'}`}>
                                                    <FiClock size={10} />
                                                    {/* TIMING FIX: Using msg.timestamp to match your DB Schema */}
                                                    {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {!isStudent && msg.sender === 'ai' && <span className="ml-2 uppercase tracking-widest text-[8px] bg-white/10 px-1.5 rounded">Sent by AI</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* MESSAGE INPUT AREA */}
                        <div className="p-6 bg-white border-t border-slate-100">
                            {selectedLead.isAiControlled ? (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-center gap-2">
                                        <FiCpu /> AI is currently handling this conversation. Take over to reply.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSendReply} className="flex items-end gap-4">
                                    <textarea 
                                        className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#F37021] focus:bg-white transition-all text-sm resize-none min-h-[60px]"
                                        placeholder="Type your message here..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendReply(e);
                                            }
                                        }}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!replyText.trim()}
                                        className="h-[60px] w-[60px] flex items-center justify-center bg-[#F37021] text-white rounded-2xl hover:bg-[#e0651c] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                    >
                                        <FiSend size={20} className="-ml-1" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}