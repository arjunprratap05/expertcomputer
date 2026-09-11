import React, { useState, useEffect, useMemo, memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ChatBot from './components/chatbot'; 
import expertcomputerlogo from './assets/expertcomputerlogo.jpeg';

// Text Animation Variants for Initial Splash
const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
};

const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { type: "spring", stiffness: 100 }
    }
};

export default function Layout() {
    const location = useLocation();
    const isERPPage = location.pathname.startsWith('/erp');

    // 1. Persistent Check: Has the user visited before or logged in/out?
    const hasSeenLoader = useMemo(() => {
        return (
            sessionStorage.getItem("hasSeenLoader") === "true" ||
            localStorage.getItem("hasSeenLoader") === "true"
        );
    }, []);

    // Only allow loader strictly on the very first visit to the bare root "/"
    const [isLoading, setIsLoading] = useState(() => {
        return location.pathname === '/' && !hasSeenLoader;
    });

    useEffect(() => {
        // Once the user hits any path other than root (login, erp, courses, etc.),
        // permanently suppress the splash animation across tabs and sessions.
        if (location.pathname !== '/') {
            sessionStorage.setItem("hasSeenLoader", "true");
            localStorage.setItem("hasSeenLoader", "true");
        }
    }, [location.pathname]);

    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
            
            const timer = setTimeout(() => {
                setIsLoading(false);
                document.body.style.overflow = 'unset';
                sessionStorage.setItem("hasSeenLoader", "true");
                localStorage.setItem("hasSeenLoader", "true");
            }, 2000); 

            return () => {
                clearTimeout(timer);
                document.body.style.overflow = 'unset';
            };
        }
    }, [isLoading]);

    return (
        <div className="relative min-h-screen bg-[#070D1D] selection:bg-[#F37021]/20">
            
            {/* --- INITIAL ONE-TIME SPLASH LOADER --- */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div 
                        key="global-loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                    >
                        <div className="relative mb-8">
                            <motion.div 
                                animate={{ rotate: 360 }} 
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="w-28 h-28 md:w-36 md:h-36 border-[2px] border-slate-100 border-t-[#F37021] border-r-[#1A5F7A] rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-7 md:p-9">
                                <motion.img 
                                    initial={{ scale: 0.85, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    src={expertcomputerlogo} 
                                    alt="Expert Academy" 
                                    className="w-full h-auto object-contain"
                                    fetchpriority="high"
                                />
                            </div>
                        </div>

                        <motion.div 
                            variants={textContainerVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-center"
                        >
                            <h2 className="flex flex-wrap justify-center gap-x-2 text-lg md:text-xl font-black uppercase tracking-[0.25em] text-[#0A0A0A]">
                                {"EXPERT COMPUTER ACADEMY".split(" ").map((word, i) => (
                                    <span key={i} className="flex">
                                        {word.split("").map((char, j) => (
                                            <motion.span variants={letterVariants} key={j}>{char}</motion.span>
                                        ))}
                                    </span>
                                ))}
                            </h2>
                            <motion.div 
                                variants={letterVariants}
                                className="mt-2 flex items-center justify-center gap-3"
                            >
                                <span className="h-px w-8 bg-neutral-200" />
                                <span className="text-[10px] font-bold tracking-[0.5em] text-neutral-400 uppercase italic">Patna</span>
                                <span className="h-px w-8 bg-neutral-200" />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MAIN APP CONTAINER --- */}
            <div className={`flex flex-col min-h-screen ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {!isERPPage && <Header />}
                
                <main className="flex-grow flex flex-col relative w-full overflow-hidden">
                    {/* ERP views mount instantly without transition delays */}
                    {isERPPage ? (
                        <Outlet />
                    ) : (
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            className="flex-grow flex flex-col w-full"
                        >
                            <Outlet /> 
                        </motion.div>
                    )}
                </main>

                {!isERPPage && <Footer />}
                {!isLoading && !isERPPage && <DelayedChatBot />}
            </div>
        </div>
    );
}

// Deferred Chatbot Initialization to Free Main-Thread on Cold Load
const DelayedChatBot = memo(() => {
    const [render, setRender] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setRender(true), 2000);
        return () => clearTimeout(t);
    }, []);
    return render ? <ChatBot /> : null;
});