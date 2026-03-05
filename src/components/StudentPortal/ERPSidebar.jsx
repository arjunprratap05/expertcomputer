import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
    FiUser, FiBookOpen, FiAward, FiVideo, FiDollarSign, 
    FiLogOut, FiMenu, FiX, FiTarget, FiActivity, FiAlertCircle 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function ERPSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // Verification state
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("studentData");
    if (data) setStudentData(JSON.parse(data));
    setIsOpen(false);
  }, [location.pathname]);

  const syncProgress = useMemo(() => {
    if (!studentData?.enrollments?.length) return 0;
    const total = studentData.enrollments.length;
    const authorized = studentData.activeBatches?.length || 0;
    return Math.min(Math.round((authorized / total) * 100), 100);
  }, [studentData]);

  const menuItems = [
    { path: '/erp/profile', icon: <FiUser />, label: 'My Profile' },
    { path: '/erp/study-material', icon: <FiBookOpen />, label: 'Study Material' },
    { path: '/erp/certificates', icon: <FiAward />, label: 'Certificates' },
    { path: '/erp/live-lectures', icon: <FiVideo />, label: 'Live Lectures' },
    { path: '/erp/fee-ledger', icon: <FiDollarSign />, label: 'Fee Ledger' },
  ];

  // FINAL LOGOUT LOGIC
  const confirmLogout = () => {
    localStorage.clear();
    navigate('/student-login');
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden bg-[#1A5F7A] text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-[60] shadow-md border-b border-white/10">
        <h1 className="text-lg font-black italic tracking-tighter uppercase">Expert <span className="text-[#F37021]">Portal</span></h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-3 bg-white/10 rounded-2xl text-xl">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* SIDEBAR CONTAINER */}
      <div className={`w-72 h-screen bg-[#1A5F7A] text-white flex flex-col fixed left-0 top-0 shadow-2xl z-[55] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-white/10">
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Expert <span className="text-[#F37021]">ERP</span></h1>
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5"><FiActivity className="text-green-500"/> Session Active</p>
        </div>

        {/* PROGRESS WIDGET */}
        <div className="px-6 py-6 bg-[#154a5e] border-b border-white/5">
            <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Sync Readiness</span>
                <span className="text-xs font-black text-[#F37021] italic">{syncProgress}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: `${syncProgress}%` }} className="h-full bg-gradient-to-r from-orange-500 to-[#F37021]"/>
            </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-1.5 mt-4 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl transition-all text-[13px] font-black uppercase tracking-tight ${isActive ? 'bg-[#F37021] text-white shadow-xl' : 'hover:bg-white/5 text-slate-300'}`}>
              <span className="text-lg">{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER & LOGOUT TRIGGER */}
        <div className="p-6 border-t border-white/10 bg-[#144d63]">
          <button 
            onClick={() => setShowLogoutConfirm(true)} // Open Confirmation
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white py-4 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest"
          >
            <FiLogOut size={14} /> Exit Portal
          </button>
        </div>
      </div>

      {/* --- LOGOUT VERIFICATION MODAL --- */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border-t-[12px] border-red-500"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
                <FiAlertCircle size={40} />
              </div>
              
              <h3 className="text-2xl font-black text-[#1A5F7A] uppercase italic leading-none">Terminate Session?</h3>
              <p className="text-slate-400 text-[10px] font-bold mt-4 uppercase tracking-[0.2em] leading-relaxed">
                Your learning progress is synced. Are you sure you want to exit the ERP?
              </p>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button 
                  onClick={() => setShowLogoutConfirm(false)} // Close if it was a mistake
                  className="py-5 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors"
                >
                  No, Stay
                </button>
                <button 
                  onClick={confirmLogout} // Final Logout
                  className="py-5 bg-red-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-red-200 hover:bg-red-600 active:scale-95 transition-all"
                >
                  Yes, Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}