import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    FiVideo, FiFileText, FiCreditCard, FiAward, 
    FiLogOut, FiMenu, FiX, FiUser, FiBell 
} from 'react-icons/fi';
import expertcomputerlogo from '../../assets/expertcomputerlogo.png';

export default function StudentLayout() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { path: '/erp/profile', icon: <FiUser />, label: 'My Profile' },
        { path: '/erp/study-material', icon: <FiBookOpen />, label: 'Study Material' },
        { path: '/erp/certificates', icon: <FiAward />, label: 'Certificates' },
        { path: '/erp/live-lectures', icon: <FiVideo />, label: 'Live Lectures' },
        { path: '/erp/fee-ledger', icon: <FiDollarSign />, label: 'Fee Ledger' },
    ];

    const handleLogout = () => {
        // Clear session/tokens here
        navigate('/student-login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
            
            {/* SIDEBAR - DESKTOP */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1A5F7A] text-white transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <img src={expertcomputerlogo} alt="ECA Logo" className="h-10 brightness-0 invert" />
                        <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><FiX size={24}/></button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 p-4 space-y-2 mt-4">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => `flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all text-sm uppercase tracking-widest ${isActive ? 'bg-[#F37021] text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
                            >
                                {item.icon} {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-white/10">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-4 w-full px-4 py-4 text-red-300 font-bold uppercase tracking-widest text-sm hover:bg-red-500/10 rounded-2xl transition-all"
                        >
                            <FiLogOut /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                
                {/* TOP BAR */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shrink-0">
                    <button className="lg:hidden text-[#1A5F7A]" onClick={() => setSidebarOpen(true)}><FiMenu size={28} /></button>
                    
                    <div className="hidden md:block">
                        <h1 className="text-[#1A5F7A] font-black uppercase tracking-tighter italic text-xl">Student <span className="text-[#F37021]">ERP</span> Portal</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-slate-400 hover:text-[#F37021] transition-colors">
                            <FiBell size={22} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 border-l pl-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-[#1A5F7A] uppercase leading-none">Aryan Kumar</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reg: ECA/2026/042</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center text-[#F37021] font-black text-sm">
                                AK
                            </div>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE VIEWPORT */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}