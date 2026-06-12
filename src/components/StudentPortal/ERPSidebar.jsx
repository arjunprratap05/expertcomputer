import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    FiUser, FiBookOpen, FiAward, FiVideo, FiDollarSign, 
    FiLogOut, FiMenu, FiX, FiActivity, FiAlertCircle, FiBell, FiClock,
    FiEdit3 // <-- Added icon for Examinations
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function ERPSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * CORE ENGINE: fetchLiveUpdates
   * Resolves the "No Token Provided" error by strictly injecting headers.
   */
  const fetchLiveUpdates = useCallback(async () => {
    const token = localStorage.getItem("studentToken");
    const data = localStorage.getItem("studentData");
    
    if (!token || !data) return;
    const savedStudent = JSON.parse(data);

    try {
      setLoading(true);
      
      // PRD FIX: Explicitly passing Authorization Header
      const res = await axios.get(`${API_URL}/admin/batches/active`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
      });

      const allActiveBatches = res.data.data || [];

      /**
       * FILTER LOGIC:
       * Validates against student's authorized streams. 
       * Supports both String ID and Object ID schemas.
       */
      const studentBatches = allActiveBatches.filter(batch => {
          const activeIds = savedStudent.activeBatches || [];
          return activeIds.some(id => 
            (typeof id === 'string' ? id : id._id) === batch._id
          );
      });

      // Transform Batch Data into Notification Items
      const liveAlerts = studentBatches.map(batch => ({
        id: batch._id,
        title: `Lecture Live: ${batch.batchCode}`,
        message: `Session for ${batch.courseId.toUpperCase()} is active.`,
        type: 'lecture',
        time: 'Now',
        unread: true
      }));

      setNotifications(liveAlerts);
    } catch (err) {
      console.error("ERP_SIDEBAR_SYNC_ERROR:", err.response?.data?.message || err.message);
      // If unauthorized, clear session
      if (err.response?.status === 403 || err.response?.status === 401) {
          console.warn("Session invalid or expired.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialization & Route Change Management
  useEffect(() => {
    const data = localStorage.getItem("studentData");
    if (data) {
        setStudentData(JSON.parse(data));
        fetchLiveUpdates(); 
    }
    // Auto-close UI elements on navigation
    setIsOpen(false);
    setShowNotifications(false);
  }, [location.pathname, fetchLiveUpdates]);

  const unreadCount = useMemo(() => notifications.length, [notifications]);

  const confirmLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/student-login');
    window.location.reload();
  };

  const menuItems = [
    { path: '/erp/profile', icon: <FiUser />, label: 'My Profile' },
    { path: '/erp/study-material', icon: <FiBookOpen />, label: 'Study Material' },
    { path: '/erp/certificates', icon: <FiAward />, label: 'Certificates' },
    { path: '/erp/live-lectures', icon: <FiVideo />, label: 'Live Lectures' },
    { path: '/erp/fee-ledger', icon: <FiDollarSign />, label: 'Fee Ledger' },
    { path: '/erp/exams', icon: <FiEdit3 />, label: 'Examinations' }, // <-- Added Exam Route
  ];

  return (
    <>
      {/* UNIFIED GLOBAL HEADER */}
      <div className="bg-white/80 backdrop-blur-md border-b h-16 px-4 md:px-8 flex justify-between items-center fixed top-0 left-0 right-0 z-[60] shadow-sm">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsOpen(true)} 
                className="lg:hidden p-2.5 bg-slate-50 text-[#1A5F7A] rounded-xl hover:bg-slate-100 transition-colors"
            >
                <FiMenu size={22} />
            </button>
            <div className="flex flex-col">
                <h1 className="text-lg font-black italic text-[#1A5F7A] uppercase tracking-tighter leading-none">
                    Expert <span className="text-[#F37021]">ERP</span>
                </h1>
                <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Student Portal v4.0</span>
            </div>
        </div>

        <div className="flex items-center gap-3 relative">
            {/* NOTIFICATION TRIGGER */}
            <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className={`p-2.5 rounded-xl relative transition-all duration-300 ${showNotifications ? 'bg-[#F37021] text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
                <FiBell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>
            
            {/* LOGOUT TRIGGER */}
            <button 
                onClick={() => setShowLogoutConfirm(true)} 
                className="p-2.5 bg-red-50 text-red-500 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all duration-300"
            >
                <FiLogOut size={18} />
            </button>

            {/* FLOATING NOTIFICATION CENTER */}
            <AnimatePresence>
                {showNotifications && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 15, scale: 0.95 }} 
                        className="fixed top-20 right-4 md:right-8 w-[320px] bg-white rounded-[2rem] shadow-2xl z-[110] border border-slate-100 overflow-hidden"
                    >
                        <div className="p-5 bg-slate-50/50 border-b flex justify-between items-center">
                            <span className="font-black text-[#1A5F7A] text-[11px] uppercase italic tracking-widest">Live Class Stream</span>
                            {loading && <FiActivity className="animate-spin text-[#F37021]" size={14}/>}
                        </div>
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            {notifications.length > 0 ? notifications.map(n => (
                                <div key={n.id} className="p-5 border-b border-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                        <p className="text-[12px] font-black text-[#1A5F7A] uppercase group-hover:text-[#F37021] transition-colors">{n.title}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed pl-5 font-medium">{n.message}</p>
                                    <div className="flex justify-between items-center mt-3 pl-5">
                                        <p className="text-[8px] font-black text-[#F37021] flex items-center gap-1 uppercase tracking-tighter"><FiClock /> {n.time}</p>
                                        <button className="text-[8px] font-black text-[#1A5F7A] uppercase underline underline-offset-2">Join Now</button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                                        <FiActivity className="text-slate-200" size={28} />
                                    </div>
                                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Vault Synchronized</p>
                                    <p className="text-slate-300 text-[9px] mt-1 italic">No active lectures found for your profile.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 text-center">
                            <button onClick={() => setShowNotifications(false)} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-[#1A5F7A]">Dismiss All</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* DYNAMIC SIDEBAR NAV */}
      <div className={`w-64 lg:w-80 h-screen bg-[#1A5F7A] text-white flex flex-col fixed left-0 top-0 shadow-[10px_0_40px_rgba(0,0,0,0.1)] z-[100] transition-transform duration-500 cubic-bezier(0.4,0,0.2,1) ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-white/5 flex justify-between items-start mt-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-[#F37021]">Expert ERP</h1>
            <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 w-fit">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <p className="text-[9px] text-white/60 font-black uppercase tracking-widest">Active Session</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-white/30 hover:text-white transition-colors"><FiX size={24}/></button>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 ml-2">Main Directory</p>
          {menuItems.map((item) => (
            <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-300 text-[13px] font-black uppercase tracking-tight relative overflow-hidden group ${isActive ? 'bg-[#F37021] text-white shadow-xl translate-x-2' : 'hover:bg-white/5 text-slate-300 hover:text-white'}`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span> 
              {item.label}
              {location.pathname === item.path && (
                  <motion.div layoutId="nav_active" className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* PROFILE MINI-WIDGET */}
        <div className="p-6 bg-black/10 m-4 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F37021] to-orange-600 flex items-center justify-center font-black italic text-lg shadow-lg">
                    {studentData?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <p className="text-[11px] font-black uppercase italic truncate">{studentData?.name || "Student User"}</p>
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest truncate">{studentData?.email || "Verification Pending"}</p>
                </div>
            </div>
        </div>
      </div>

      {/* MODAL: LOGOUT CONFIRMATION */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutConfirm(false)} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="relative bg-white rounded-[3.5rem] p-10 max-w-sm w-full text-center shadow-[0_30px_100px_rgba(0,0,0,0.4)] border-t-[12px] border-red-500 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <FiLogOut size={120} className="-rotate-12" />
                </div>
               <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500"><FiAlertCircle size={36} /></div>
               <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic leading-none">Terminate?</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 tracking-widest leading-relaxed">Closing your active session will<br/>require a new login handshake.</p>
               <div className="grid grid-cols-2 gap-4 mt-12">
                 <button onClick={() => setShowLogoutConfirm(false)} className="py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] active:scale-95 transition-all">Stay</button>
                 <button onClick={confirmLogout} className="py-4 bg-red-500 text-white font-black rounded-2xl uppercase text-[10px] shadow-xl shadow-red-200 active:scale-95 transition-all">Exit ERP</button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}