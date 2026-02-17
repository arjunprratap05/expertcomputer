import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ChatBot from './components/chatbot'; 
import expertcomputerlogo from './assets/expertcomputerlogo.png';

export default function Layout() {
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");

        // If landing on Home from Google or refreshing the session
        if (location.pathname === '/' && !hasSeenLoader) {
            document.body.style.overflow = 'hidden';
            window.scrollTo(0, 0); // Ensure they start at the top after redirect

            const timer = setTimeout(() => {
                setIsLoading(false);
                document.body.style.overflow = 'unset';
                sessionStorage.setItem("hasSeenLoader", "true");
            }, 1800);

            return () => {
                clearTimeout(timer);
                document.body.style.overflow = 'unset';
            };
        } else {
            // No animation if they come from another page or already saw it
            setIsLoading(false);
        }
    }, [location.pathname]);

    return (
        <>
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div 
                        key="global-loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.6 } }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                    >
                        {/* Background Blurs */}
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1A5F7A] rounded-full blur-[120px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F37021] rounded-full blur-[120px]"></div>
                        </div>

                        <div className="relative mb-8">
                            <motion.div 
                                animate={{ rotate: 360 }} 
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-32 h-32 md:w-44 md:h-44 border-[2px] border-slate-100 border-t-[#F37021] border-r-[#1A5F7A] rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
                                <motion.img 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    src={expertcomputerlogo} 
                                    alt="Expert Academy" 
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        </div>

                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-center"
                        >
                            <h2 className="text-[#1A5F7A] font-black tracking-[0.4em] uppercase text-[10px] md:text-xs">
                                Expert Computer Academy
                            </h2>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content reveals smoothly after loader exits */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col min-h-screen"
            >
                <Header />
                <main className="flex-grow">
                    <Outlet /> 
                </main>
                <Footer />
                {!isLoading && <ChatBot />}
            </motion.div>
        </>
    );
}