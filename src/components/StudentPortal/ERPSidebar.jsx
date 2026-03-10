import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    FiUser, FiBookOpen, FiAward, FiVideo, FiDollarSign, 
    FiLogOut, FiMenu, FiX, FiActivity, FiAlertCircle, FiBell, FiClock 
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

  // 1. FETCH LIVE LECTURE UPDATES FROM EXISTING API
  const fetchLiveUpdates = useCallback(async () => {
    const token = localStorage.getItem("studentToken"); // Assuming token-based auth
    const savedStudent = JSON.parse(localStorage.getItem("studentData"));
    
    if (!savedStudent) return;

    try {
      setLoading(true);
      // Fetching from your existing batches endpoint
      const res = await axios.get(`${API_URL}/admin/batches/active`);
      const allActiveBatches = res.data.data || [];

      // Logic: Filter batches that belong to this specific student
      const studentBatches = allActiveBatches.filter(batch => 
        savedStudent.activeBatches?.includes(batch._id)
      );

      // Transform batch data into Notifications
      const liveAlerts = studentBatches.map(batch => ({
        id: batch._id,
        title: `Lecture: ${batch.batchCode}`,
        message: `Your class for ${batch.courseId} is scheduled/live.`,
        type: 'lecture',
        time: 'Live Now',
        unread: true
      }));

      setNotifications(liveAlerts);
    } catch (err) {
      console.error("Failed to fetch live updates", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const data = localStorage.getItem("studentData");
    if (data) {
        setStudentData(JSON.parse(data));
        fetchLiveUpdates(); // Load on mount
    }
    setIsOpen(false);
    setShowNotifications(false);
  }, [location.pathname, fetchLiveUpdates]);

  const unreadCount = useMemo(() => notifications.length, [notifications]);

  const confirmLogout = () => {
    localStorage.clear();
    navigate('/student-login');
  };

  const menuItems = [
    { path: '/erp/profile', icon: <FiUser />, label: 'My Profile' },
    { path: '/erp/study-material', icon: <FiBookOpen />, label: 'Study Material' },
    { path: '/erp/certificates', icon: <FiAward />, label: 'Certificates' },
    { path: '/erp/live-lectures', icon: <FiVideo />, label: 'Live Lectures' },
    { path: '/erp/fee-ledger', icon: <FiDollarSign />, label: 'Fee Ledger' },
  ];

  return (
    <>
      {/* UNIFIED TOP BAR */}
      <div className="bg-white border-b h-16 px-4 md:px-8 flex justify-between items-center fixed top-0 left-0 right-0 z-[60] shadow-sm">
        <div className="flex items-center gap-3">
            <button onClick={() => setIsOpen(true)} className="lg:hidden p-2.5 bg-slate-50 text-[#1A5F7A] rounded-xl">
                <FiMenu size={22} />
            </button>
            <h1 className="text-lg font-black italic text-[#1A5F7A] uppercase tracking-tighter">Expert <span className="text-[#F37021]">ERP</span></h1>
        </div>

        <div className="flex items-center gap-3 relative">
            {/* BELL WITH LIVE API COUNT */}
            <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className={`p-2.5 rounded-xl relative transition-all ${showNotifications ? 'bg-[#F37021] text-white' : 'bg-slate-50 text-slate-400'}`}
            >
                <FiBell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>
            
            <button onClick={() => setShowLogoutConfirm(true)} className="p-2.5 bg-red-50 text-red-500 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all">
                <FiLogOut size={18} />
            </button>

            {/* NOTIFICATION POPUP */}
            <AnimatePresence>
                {showNotifications && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed top-20 right-4 md:right-8 w-[300px] bg-white rounded-3xl shadow-2xl z-[110] border border-slate-100 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                            <span className="font-black text-[#1A5F7A] text-[10px] uppercase italic">Updates</span>
                            {loading && <FiActivity className="animate-spin text-[#F37021]" size={12}/>}
                        </div>
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            {notifications.length > 0 ? notifications.map(n => (
                                <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <p className="text-[11px] font-black text-[#1A5F7A] uppercase">{n.title}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-tight">{n.message}</p>
                                    <p className="text-[8px] font-bold text-[#F37021] mt-2 flex items-center gap-1 uppercase"><FiClock /> {n.time}</p>
                                </div>
                            )) : (
                                <div className="p-12 text-center">
                                    <FiActivity className="mx-auto text-slate-200 mb-2" size={24} />
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-none">No Live Notifications</p>
                                    <p className="text-slate-300 text-[8px] mt-1">Everything is up to date.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* SIDEBAR CONTAINER */}
      <div className={`w-64 lg:w-72 h-screen bg-[#1A5F7A] text-white flex flex-col fixed left-0 top-0 shadow-2xl z-[100] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-white/10 flex justify-between items-center mt-4">
          <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Expert <span className="text-[#F37021]">ERP</span></h1>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5"><FiActivity className="text-green-500"/> Session Active</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-white/40 hover:text-white"><FiX size={24}/></button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 mt-4 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl transition-all text-[13px] font-black uppercase tracking-tight ${isActive ? 'bg-[#F37021] text-white shadow-xl' : 'hover:bg-white/5 text-slate-300'}`}>
              <span className="text-lg">{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutConfirm(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border-t-[12px] border-red-500">
               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500"><FiAlertCircle size={32} /></div>
               <h3 className="text-xl font-black text-[#1A5F7A] uppercase italic leading-none">Terminate?</h3>
               <div className="grid grid-cols-2 gap-4 mt-10">
                 <button onClick={() => setShowLogoutConfirm(false)} className="py-4 bg-slate-100 text-slate-500 font-black rounded-xl uppercase text-[10px]">Stay</button>
                 <button onClick={confirmLogout} className="py-4 bg-red-500 text-white font-black rounded-xl uppercase text-[10px] shadow-xl">Exit</button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}