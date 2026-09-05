import React, { useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ERPSidebar from './ERPSidebar';
import FloatingAIBot from '../StudentPortal/FloatingAIBot.jsx';

export default function ERPLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);
  const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;

  const handleAutoLogout = useCallback(() => {
    localStorage.clear();
    alert("Session expired due to inactivity. Please login again.");
    navigate('/student-login', { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(handleAutoLogout, SESSION_TIMEOUT);
  }, [handleAutoLogout]);

  useEffect(() => {
    if (!localStorage.getItem("studentData")) {
      navigate('/student-login');
      return;
    }
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    resetTimer();
    events.forEach(event => window.addEventListener(event, resetTimer));
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer, navigate]);

  return (
    // Applied Dark Theme background and selection colors
    <div className="flex bg-[#070D1D] text-slate-100 h-screen w-full overflow-hidden selection:bg-[#F37021]/30 selection:text-orange-200">
      
      {/* Your Externalized Sidebar */}
      <ERPSidebar />
      
      {/* 
        ml-0: Mobile 
        lg:ml-72: Margin for Large Desktop 
        pt-16: ALWAYS applied to create space for the universal header bar
      */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden ml-0 lg:ml-72 pt-16 relative">
        
        {/* Ambient Dashboard Background Glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          
          {/* Framer Motion Route Transitions for the ERP */}
          <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Outlet /> 
            </motion.div>
          </AnimatePresence>

        </div>
        
        {/* Your Floating AI Bot */}
        <FloatingAIBot />
      </main>
    </div>
  );
}