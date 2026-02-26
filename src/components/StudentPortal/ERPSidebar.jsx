import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiUser, FiBookOpen, FiAward, FiVideo, FiDollarSign, FiLogOut } from 'react-icons/fi';

export default function ERPSidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/erp/profile', icon: <FiUser />, label: 'My Profile' },
    { path: '/erp/study-material', icon: <FiBookOpen />, label: 'Study Material' },
    { path: '/erp/certificates', icon: <FiAward />, label: 'Certificates' },
    { path: '/erp/live-lectures', icon: <FiVideo />, label: 'Live Lectures' },
    { path: '/erp/fee-ledger', icon: <FiDollarSign />, label: 'Fee Ledger' },
  ];

  return (
    <div className="w-64 h-screen bg-[#1A5F7A] text-white flex flex-col fixed left-0 top-0 shadow-2xl z-50">
      <div className="p-8 border-b border-white/10">
        <h1 className="text-xl font-black italic tracking-tighter">EXPERT <span className="text-[#F37021]">ERP</span></h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-4 p-4 rounded-2xl transition-all text-sm font-bold ${
                isActive ? 'bg-[#F37021] text-white shadow-lg scale-105' : 'hover:bg-white/10 text-slate-300'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span> {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10">
        <button 
          onClick={() => { localStorage.clear(); navigate('/student-login'); }}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white py-3 rounded-xl text-[10px] font-black transition-all uppercase"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}