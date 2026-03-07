import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ChatBot from './components/chatbot'; 
import expertcomputerlogo from './assets/expertcomputerlogo.png';

export default function Layout() {
    const location = useLocation();
    
    // Memoize hasSeen status to prevent re-reading during render
    const hasSeenLoader = useMemo(() => sessionStorage.getItem("hasSeenLoader"), []);

    // Only trigger loading on the Home page ('/') and if not seen before
    const [isLoading, setIsLoading] = useState(() => {
        return location.pathname === '/' && !hasSeenLoader;
    });

    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
            
            // Fixed Fast-Track: 800ms is the sweet spot for perceived speed
            // while allowing the logo animation to finish.
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
                            {/* Static Spinner for GPU efficiency */}
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

            {/* Render site content behind loader for instant visibility when loader fades */}
            <div className={`flex flex-col min-h-screen transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <Header />
                <main className="flex-grow">
                    <Outlet /> 
                </main>
                <Footer />
                
                {/* Delayed Load: Prevents Chatbot scripts from slowing down First Contentful Paint */}
                {!isLoading && <DelayedChatBot />}
            </div>
        </div>
    );
}

// Small sub-component to lazy-load the chatbot after the main UI is stable
function DelayedChatBot() {
    const [render, setRender] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setRender(true), 2500); // Wait 2.5s
        return () => clearTimeout(t);
    }, []);
    return render ? <ChatBot /> : null;
}