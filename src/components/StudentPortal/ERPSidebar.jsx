import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiBookOpen, FiAward, FiVideo, FiDollarSign, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function ERPSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar automatically when a link is clicked (for mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { path: '/erp/profile', icon: <FiUser />, label: 'My Profile' },
    { path: '/erp/study-material', icon: <FiBookOpen />, label: 'Study Material' },
    { path: '/erp/certificates', icon: <FiAward />, label: 'Certificates' },
    { path: '/erp/live-lectures', icon: <FiVideo />, label: 'Live Lectures' },
    { path: '/erp/fee-ledger', icon: <FiDollarSign />, label: 'Fee Ledger' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/student-login');
  };

  return (
    <>
      {/* MOBILE TOP BAR (Visible only on small screens) */}
      <div className="lg:hidden bg-[#1A5F7A] text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-[60] shadow-md">
        <h1 className="text-lg font-black italic tracking-tighter">EXPERT <span className="text-[#F37021]">ERP</span></h1>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white/10 rounded-xl text-xl"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* BACKDROP (Mobile only) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[51] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <div className={`
        w-64 h-screen bg-[#1A5F7A] text-white flex flex-col fixed left-0 top-0 shadow-2xl z-[55] transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* LOGO SECTION */}
        <div className="p-8 border-b border-white/10 hidden lg:block">
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
            Expert <span className="text-[#F37021]">ERP</span>
          </h1>
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-2">Student Dashboard</p>
        </div>

        {/* MOBILE LOGO (Visible only inside drawer) */}
        <div className="p-8 border-b border-white/10 lg:hidden flex justify-between items-center">
            <span className="font-black italic">MENU</span>
            <button onClick={() => setIsOpen(false)} className="text-xl opacity-50"><FiX /></button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-4 p-4 rounded-2xl transition-all text-sm font-bold group ${
                  isActive 
                    ? 'bg-[#F37021] text-white shadow-lg lg:scale-105' 
                    : 'hover:bg-white/10 text-slate-300'
                }`
              }
            >
              <span className={`text-lg transition-transform group-hover:scale-110`}>
                {item.icon}
              </span> 
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-6 border-t border-white/10 bg-[#144d63]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white py-4 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest"
          >
            <FiLogOut size={16} /> Logout System
          </button>
        </div>
      </div>
    </>
  );
}