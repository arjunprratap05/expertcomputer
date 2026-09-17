import React, { useState, useEffect, useMemo, memo, lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header/Header';
// 1. Structural change: Lazy import non-critical components
const Footer = lazy(() => import('./components/Footer/Footer'));
const ChatBot = lazy(() => import('./components/chatbot'));

import expertcomputerlogo from './assets/expertcomputerlogo.jpeg';

// Text Animation Variants... [No change needed here]
const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 } // Sped up slightly
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

    const hasSeenLoader = useMemo(() => {
        return (
            sessionStorage.getItem("hasSeenLoader") === "true" ||
            localStorage.getItem("hasSeenLoader") === "true"
        );
    }, []);

    const [isLoading, setIsLoading] = useState(() => {
        return location.pathname === '/' && !hasSeenLoader;
    });

    useEffect(() => {
        if (location.pathname !== '/' && !hasSeenLoader) {
            sessionStorage.setItem("hasSeenLoader", "true");
            localStorage.setItem("hasSeenLoader", "true");
        }
    }, [location.pathname, hasSeenLoader]);

    // OPTIMIZATION 2: Heavy Reduction in arbitrary delay.
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
            
            // Old 2s delay was the single biggest bottleneck.
            // Reduced to 400ms to allow branding FCP without hindering perceived performance.
            // Ideally, this finishes when the first route component mounts, but 400ms is a safe universal improvement.
            const timer = setTimeout(() => {
                setIsLoading(false);
                document.body.style.overflow = 'unset';
                sessionStorage.setItem("hasSeenLoader", "true");
                localStorage.setItem("hasSeenLoader", "true");
            }, 400); // reduced from 2000

            return () => {
                clearTimeout(timer);
                document.body.style.overflow = 'unset';
            };
        }
    }, [isLoading]);

    return (
        // selection:bg-neutral-800 to fix unreadable contrast with Orange
        <div className="relative min-h-screen bg-[#070D1D] selection:bg-neutral-800 selection:text-[#F37021]">
            
            {/* --- INITIAL ONE-TIME SPLASH LOADER --- */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div 
                        key="global-loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }} // Faster exit
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                    >
                        {/* Logo Animation ... [Keep standard] */}
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
                                    transition={{ duration: 0.2 }}
                                    src={expertcomputerlogo} 
                                    alt="Expert Computer Academy Patna" 
                                    className="w-full h-auto object-contain"
                                    fetchpriority="high" // Critical for logo FCP
                                />
                            </div>
                        </div>

                        {/* Text Animations ... [Keep standard] */}
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
            {/* OPTIMIZATION 3: Removed 'opacity-0'. Allows browser to start rendering paths IMMEDIATELY under splash.
                z-index ensures main content fetches data but doesn't show visually until ready. */}
            <div className={`flex flex-col min-h-screen ${isLoading ? 'relative z-[-1]' : 'relative z-0'}`}>
                {!isERPPage && <Header />}
                
                <main className="flex-grow flex flex-col relative w-full overflow-hidden">
                    {/* OPTIMIZATION 4: Outlet already eager inside, no need to add motion delays globally */}
                    <Outlet />
                </main>

                {/* OPTIMIZATION 5: Suspense handles lazy loaded Footer/Chatbot bundle */}
                <Suspense fallback={null}>
                    {!isERPPage && <Footer />}
                    {!isLoading && !isERPPage && <DelayedChatBot lazyComponent={ChatBot} />}
                </Suspense>
            </div>
        </div>
    );
}

// Deferred Chatbot Initialization to Free Main-Thread on Cold Load
const DelayedChatBot = memo(({ lazyComponent: Component }) => {
    const [render, setRender] = useState(false);
    useEffect(() => {
        // Chatbot usually secondary interaction. Defer longer if necessary to free main thread.
        // OLD was 2s. Keep 2s delay here, but now it's relative to the app showing, not the arbitrary loader timer.
        const t = setTimeout(() => setRender(true), 2000);
        return () => clearTimeout(t);
    }, []);
    return render ? <Component /> : null;
});