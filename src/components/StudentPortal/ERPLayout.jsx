import React, { useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ERPSidebar from './ERPSidebar';
import FloatingAIBot from '../StudentPortal/FloatingAIBot.jsx';

export default function ERPLayout() {
  const navigate = useNavigate();
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
    <div className="flex bg-[#F8FAFC] h-screen w-full overflow-hidden">
      <ERPSidebar />
      
      {/* ml-0: Mobile 
          lg:ml-72: Margin for Large Desktop 
          pt-16: ALWAYS applied to create space for the universal header bar
      */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden ml-0 lg:ml-72 pt-16">
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Outlet /> 
          <FloatingAIBot />
        </div>
      </main>
    </div>
  );
}