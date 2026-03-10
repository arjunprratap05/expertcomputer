import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ChatBot from './components/chatbot'; 
import expertcomputerlogo from './assets/expertcomputerlogo.png';

export default function Layout() {
    const location = useLocation();
    
    // 1. ERP DETECTION LOGIC
    // This checks if the current URL starts with /erp. 
    // When true, we hide the main website header/footer.
    const isERPPage = location.pathname.startsWith('/erp');
    
    const hasSeenLoader = useMemo(() => sessionStorage.getItem("hasSeenLoader"), []);

    const [isLoading, setIsLoading] = useState(() => {
        // Only trigger loading on the Home page and if not an ERP subpage
        return location.pathname === '/' && !hasSeenLoader;
    });

    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
            
            const timer = setTimeout(() => {
                setIsLoading(false);
                document.body.style.overflow = 'unset';
                sessionStorage.setItem("hasSeenLoader", "true");
            }, 800);

            return () => {
                clearTimeout(timer);
                document.body.style.overflow = 'unset';
            };
        }
    }, [isLoading]);

    return (
        <div className="relative min-h-screen bg-white selection:bg-[#F37021]/20">
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div 
                        key="global-loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                    >
                        <div className="relative mb-6">
                            <motion.div 
                                animate={{ rotate: 360 }} 
                                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                                className="w-24 h-24 md:w-32 md:h-32 border-[2px] border-slate-100 border-t-[#F37021] border-r-[#1A5F7A] rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
                                <img 
                                    src={expertcomputerlogo} 
                                    alt="Expert Academy" 
                                    className="w-full h-auto object-contain"
                                    fetchpriority="high"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Render site content behind loader */}
            <div className={`flex flex-col min-h-screen transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                
                {/* 2. CONDITIONAL HEADER: Hidden on ERP pages */}
                {!isERPPage && <Header />}

                <main className="flex-grow">
                    <Outlet /> 
                </main>

                {/* 3. CONDITIONAL FOOTER: Hidden on ERP pages */}
                {!isERPPage && <Footer />}
                
                {/* Delayed Load Chatbot: Also hidden on ERP pages to avoid UI overlap */}
                {!isLoading && !isERPPage && <DelayedChatBot />}
            </div>
        </div>
    );
}

function DelayedChatBot() {
    const [render, setRender] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setRender(true), 2500);
        return () => clearTimeout(t);
    }, []);
    return render ? <ChatBot /> : null;
}