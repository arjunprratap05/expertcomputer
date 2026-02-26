import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ERPSidebar from './ERPSidebar';

export default function ERPLayout() {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!localStorage.getItem("studentData")) {
      navigate('/student-login');
    }
  }, [navigate]);

  return (
    /* h-screen + overflow-hidden on the wrapper stops the whole page from shaking */
    <div className="flex bg-[#F8FAFC] h-screen w-full overflow-hidden">
      <ERPSidebar />
      
      {/* 1. ml-0 lg:ml-64: Responsive margin
          2. min-w-0: THE FIX. Allows the main area to shrink.
          3. overflow-y-auto: Allows vertical scrolling while keeping horizontal locked.
      */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden ml-0 lg:ml-64 pt-20 lg:pt-0">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}