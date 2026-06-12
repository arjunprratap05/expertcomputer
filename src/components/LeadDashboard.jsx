import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// Connect to your Node.js backend URL
const socket = io('http://localhost:5000'); 

export default function LeadDashboard() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [replyText, setReplyText] = useState("");

  // 1. Fetch initial leads on load
  useEffect(() => {
    fetchLeads();
    
    // 2. Listen for real-time Socket.io messages
    socket.on('new_whatsapp_message', (data) => {
      // Refresh leads to bump the newest one to the top
      fetchLeads(); 
      
      // If the message is from the currently viewed student, update the chat window
      if (selectedLead && data.phone === selectedLead.phone) {
        setChatHistory(prev => [...prev, { sender: 'student', text: data.text }]);
      }
    });

    return () => socket.off('new_whatsapp_message');
  }, [selectedLead]);

  const fetchLeads = async () => {
    try {
      // Assuming you created a basic GET route in your studentController to fetch leads
      const response = await axios.get('/api/admin/whatsapp-leads');
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const selectStudent = async (student) => {
    setSelectedLead(student);
    try {
      // Fetch chat history for this specific student
      const response = await axios.get(`/api/admin/whatsapp-chat/${student.phone}`);
      setChatHistory(response.data);
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };

  const toggleAi = async () => {
    if (!selectedLead) return;
    const newStatus = !selectedLead.isAiControlled;
    
    try {
      // Send PATCH request to update AI status
      await axios.patch(`/api/admin/student/${selectedLead._id}/ai-toggle`, {
        isAiControlled: newStatus
      });
      
      setSelectedLead({ ...selectedLead, isAiControlled: newStatus });
      fetchLeads(); // Refresh list to show updated badge
    } catch (error) {
      console.error("Error toggling AI:", error);
    }
  };

  const sendManualReply = async () => {
    if (!replyText.trim() || !selectedLead) return;
    
    try {
      // Trigger your backend to send a message via Meta API
      await axios.post('/api/admin/send-whatsapp', {
        phone: selectedLead.phone,
        message: replyText
      });
      
      setChatHistory(prev => [...prev, { sender: 'agent', text: replyText }]);
      setReplyText("");
    } catch (error) {
      console.error("Error sending manual reply:", error);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* LEFT COLUMN: Lead List */}
      <div style={{ width: '30%', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
        <h2 style={{ padding: '20px', backgroundColor: '#f8f9fa', margin: 0 }}>
          Academy Leads
        </h2>
        {leads.map((lead) => (
          <div 
            key={lead._id}
            onClick={() => selectStudent(lead)}
            style={{
              padding: '15px',
              borderBottom: '1px solid #eee',
              cursor: 'pointer',
              backgroundColor: selectedLead?._id === lead._id ? '#e3f2fd' : 'white'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{lead.name || 'Unknown Prospect'}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>{lead.phone}</div>
            <span style={{
              display: 'inline-block',
              marginTop: '5px',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              backgroundColor: lead.leadStatus === 'Hot Lead' ? '#ffebee' : '#e8f5e9',
              color: lead.leadStatus === 'Hot Lead' ? '#c62828' : '#2e7d32'
            }}>
              {lead.leadStatus}
            </span>
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN: Detail & Chat View */}
      <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
        {selectedLead ? (
          <>
            {/* Top Bar: Controls */}
            <div style={{ padding: '20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h2>{selectedLead.name || 'Unknown Prospect'}</h2>
                <p style={{ margin: 0, color: '#666' }}>{selectedLead.phone}</p>
              </div>
              <div>
                <button 
                  onClick={toggleAi}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: selectedLead.isAiControlled ? '#4caf50' : '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {selectedLead.isAiControlled ? "🤖 AI is Active (Click to Pause)" : "👤 Human Active (Click to Resume AI)"}
                </button>
              </div>
            </div>

            {/* Chat History Window */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f5f5f5' }}>
              {!selectedLead.isAiControlled && (
                <div style={{ textAlign: 'center', marginBottom: '15px', color: '#d32f2f', fontWeight: 'bold' }}>
                  ⚠️ AI is paused. You must reply manually below.
                </div>
              )}
              
              {chatHistory.map((msg, index) => (
                <div key={index} style={{
                  marginBottom: '10px',
                  textAlign: msg.sender === 'student' ? 'left' : 'right'
                }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '10px 15px',
                    borderRadius: '15px',
                    backgroundColor: msg.sender === 'student' ? 'white' : '#daf8cb',
                    border: '1px solid #ddd',
                    maxWidth: '70%'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Manual Reply Input */}
            <div style={{ padding: '20px', borderTop: '1px solid #ccc', display: 'flex' }}>
              <input 
                type="text" 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={selectedLead.isAiControlled ? "Pause AI to type manually..." : "Type a message to the student..."}
                disabled={selectedLead.isAiControlled}
                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <button 
                onClick={sendManualReply}
                disabled={selectedLead.isAiControlled || !replyText.trim()}
                style={{ marginLeft: '10px', padding: '10px 20px', cursor: 'pointer' }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
            <h2>Select a lead from the left to view their chat history.</h2>
          </div>
        )}
      </div>
    </div>
  );
}