import React from 'react';
import Sidebar from './Sidebar';
import FloatingAIBot from './FloatingAIBot'; // <-- Import it here

export default function StudentLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
            
            {/* Drop it right before the closing tag! */}
            <FloatingAIBot /> 
        </div>
    );
}