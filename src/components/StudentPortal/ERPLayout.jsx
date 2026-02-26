import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ERPSidebar from './ERPSidebar';

export default function ERPLayout() {
  const navigate = useNavigate();

  // Guard: Redirect to login if student data is missing
  React.useEffect(() => {
    if (!localStorage.getItem("studentData")) {
      navigate('/student-login');
    }
  }, [navigate]);

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen">
      {/* Fix 1: Left Side Banner stays fixed */}
      <ERPSidebar />
      
      {/* Fix 2: Content Area with margin-left to make room for Sidebar */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* IMPORTANT: This renders the profile, lectures, etc. */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}