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
        <div className="bg-[#0A192F]/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-slate-800 flex h-[720px] overflow-hidden text-left">
            {/* LEFT SIDEBAR: LEAD LIST */}
            <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-950/40">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <FiMessageCircle className="text-[#F37021] text-xl" />
                    <h3 className="font-black text-white uppercase italic tracking-widest text-sm">Active Chats</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2.5">
                    {leads.length === 0 ? (
                        <p className="text-center text-slate-500 font-bold text-[10px] uppercase mt-10">No active leads</p>
                    ) : (
                        leads.map(lead => (
                            <div 
                                key={lead._id} 
                                onClick={() => loadChatHistory(lead)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                                    selectedLead?._id === lead._id 
                                    ? 'bg-[#1A5F7A]/30 border-[#F37021] shadow-lg' 
                                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className="font-black text-white uppercase text-xs italic tracking-wide truncate max-w-[130px]">
                                        {lead.name || "Unknown Lead"}
                                    </h4>
                                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-slate-700">
                                        {lead.leadStatus || "Cold Lead"}
                                    </span>
                                </div>

                                {lead.message && (
                                    <p className="text-slate-400 text-[11px] truncate italic mb-2">
                                        "{lead.message}"
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                                    <p className="text-slate-500 font-bold text-[10px]">{lead.phone}</p>
                                    {lead.isAiControlled ? (
                                        <FiCpu className="text-sky-400" title="AI Handling" size={13} />
                                    ) : (
                                        <FiUserCheck className="text-emerald-400" title="Human Handling" size={13} />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT MAIN AREA: CHAT INTERFACE */}
            <div className="w-2/3 flex flex-col bg-[#070D1D]/70 relative">
                {!selectedLead ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <FiMessageCircle size={60} className="mb-4 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-[10px]">Select a lead to view discussion stream</p>
                    </div>
                ) : (
                    <>
                        {/* CHAT HEADER */}
                        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0A192F] z-10 shadow-sm">
                            <div>
                                <h3 className="font-black text-white uppercase italic text-base leading-none">{selectedLead.name}</h3>
                                <p className="text-slate-400 font-bold text-[10px] mt-1.5 flex items-center gap-2">
                                    <span>{selectedLead.phone}</span> 
                                    <span className="text-slate-600">•</span> 
                                    <span className="text-[#F37021]">{selectedLead.message || selectedLead.course || "General Inquiry"}</span>
                                </p>
                            </div>
                            
                            <button 
                                onClick={toggleAiControl}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm border ${
                                    selectedLead.isAiControlled 
                                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                }`}
                            >
                                {selectedLead.isAiControlled ? (
                                    <><FiCpu size={13}/> AI Active (Click to Take Over)</>
                                ) : (
                                    <><FiShield size={13}/> Human Active (Return to AI)</>
                                )}
                            </button>
                        </div>

                        {/* MESSAGE HISTORY */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-[#070D1D]/90 no-scrollbar">
                            {loading ? (
                                <p className="text-center text-slate-500 text-xs font-bold uppercase mt-10">Loading history...</p>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-slate-600 mt-20 flex flex-col items-center">
                                    <FiAlertCircle size={28} className="mb-2 opacity-30" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No messages recorded yet</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isStudent = msg.sender === 'student';
                                    return (
                                        <div key={msg._id} className={`flex ${isStudent ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[70%] p-3.5 rounded-2xl shadow-sm ${
                                                isStudent 
                                                ? 'bg-slate-900 border border-slate-800 rounded-tl-none text-slate-200' 
                                                : 'bg-[#1A5F7A] text-white rounded-tr-none'
                                            }`}>
                                                <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                                                <div className={`text-[8px] font-bold mt-1.5 flex items-center gap-1 ${isStudent ? 'text-slate-500' : 'text-sky-200/60'}`}>
                                                    <FiClock size={9} />
                                                    {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {!isStudent && msg.sender === 'ai' && <span className="ml-2 uppercase tracking-widest text-[7px] bg-white/10 px-1 py-0.5 rounded">Sent by AI</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* MESSAGE INPUT AREA */}
                        <div className="p-4 bg-[#0A192F] border-t border-slate-800">
                            {selectedLead.isAiControlled ? (
                                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center justify-center gap-2">
                                        <FiCpu /> AI is currently orchestrating this conversation. Toggle control above to reply.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSendReply} className="flex items-end gap-3">
                                    <textarea 
                                        className="flex-1 p-3.5 bg-slate-900 border border-slate-800 rounded-xl outline-none focus:border-[#F37021] text-xs text-white resize-none min-h-[50px] shadow-inner placeholder:text-slate-600"
                                        placeholder="Type manual response..."
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
                                        className="h-[50px] w-[50px] flex items-center justify-center bg-[#F37021] hover:bg-orange-600 text-white rounded-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shrink-0"
                                    >
                                        <FiSend size={16} className="-ml-0.5" />
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