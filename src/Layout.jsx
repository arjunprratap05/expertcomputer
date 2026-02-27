import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ChatBot from './components/chatbot'; 
import expertcomputerlogo from './assets/expertcomputerlogo.png';

export default function Layout() {
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    // Memoized loader closer to prevent unnecessary re-renders
    const closeLoader = useCallback(() => {
        setIsLoading(false);
        document.body.style.overflow = 'unset';
        sessionStorage.setItem("hasSeenLoader", "true");
    }, []);

    useEffect(() => {
        const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");

        // Strategy: Only show heavy loader on the very first landing (Home Page)
        if (location.pathname === '/' && !hasSeenLoader) {
            document.body.style.overflow = 'hidden';
            window.scrollTo(0, 0);

            // EVENT-BASED TRIGGER:
            // Checks if the document is already fully loaded (from cache)
            if (document.readyState === 'complete') {
                // Minor 400ms buffer for visual smoothness of the logo animation
                const timer = setTimeout(closeLoader, 400); 
                return () => clearTimeout(timer);
            } else {
                // If not loaded, wait for the window 'load' event (all assets ready)
                window.addEventListener('load', closeLoader);
                
                // PERFORMANCE FALLBACK: 
                // Don't keep the user waiting more than 2.5s if a slow script hangs
                const fallback = setTimeout(closeLoader, 2500); 

                return () => {
                    window.removeEventListener('load', closeLoader);
                    clearTimeout(fallback);
                    document.body.style.overflow = 'unset';
                };
            }
        } else {
            // Instant access for internal navigation
            setIsLoading(false);
            document.body.style.overflow = 'unset';
        }
    }, [location.pathname, closeLoader]);

    return (
        <div className="relative min-h-screen bg-white">
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div 
                        key="global-loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                    >
                        {/* High-Performance Blurs (Optimized for GPU) */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
                            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1A5F7A] rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F37021] rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative mb-6">
                            {/* SVG-based Border for better performance than heavy Div borders */}
                            <motion.div 
                                animate={{ rotate: 360 }} 
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="w-28 h-28 md:w-36 md:h-36 border-[1.5px] border-slate-100 border-t-[#F37021] border-r-[#1A5F7A] rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
                                <motion.img 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    src={expertcomputerlogo} 
                                    alt="Expert Academy" 
                                    className="w-full h-auto object-contain"
                                    fetchpriority="high" // Tells browser to download this first
                                />
                            </div>
                        </div>

                        <motion.h2 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[#1A5F7A] font-black tracking-[0.3em] uppercase text-[9px] md:text-[11px]"
                        >
                            Expert Computer Academy
                        </motion.h2>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Application Container */}
            <motion.div 
                initial={false}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col min-h-screen"
            >
                <Header />
                <main className="flex-grow">
                    <Outlet /> 
                </main>
                <Footer />
                {!isLoading && <ChatBot />}
            </motion.div>
        </div>
    );
}