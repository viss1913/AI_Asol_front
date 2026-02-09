import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'true');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    className="fixed bottom-6 left-6 right-6 z-[9999] md:left-auto md:right-10 md:max-w-xl"
                >
                    <div className="relative overflow-hidden group">
                        {/* Background with glassmorphism */}
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl" />

                        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed">
                                    Мы используем cookie, чтобы сделать ваш опыт на платформе <span className="font-bold text-white">AI Asol Studio</span> максимально комфортным. Оставаясь на сайте, вы соглашаетесь с нашей <a href="https://docs.google.com/document/d/1jJl7UUFDr4-ZuDsfRzp34MmAKyfmxoEgRn0uE170JZM/edit?tab=t.0" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-400/30">политикой конфиденциальности</a>.
                                </p>
                            </div>

                            <button
                                onClick={handleAccept}
                                className="whitespace-nowrap px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-sm uppercase tracking-wider"
                            >
                                Понятно
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
