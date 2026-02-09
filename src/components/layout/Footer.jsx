import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, FileText, Landmark, ShieldCheck } from 'lucide-react';

const Footer = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const documents = [
        { label: 'Политика конфиденциальности', url: 'https://docs.google.com/document/d/1jJl7UUFDr4-ZuDsfRzp34MmAKyfmxoEgRn0uE170JZM/edit?tab=t.0' },
        { label: 'Договор оферты', url: 'https://docs.google.com/document/d/1z3jdduykfVEG0Eu7ip69BODb3rAQ5_-zujhPh2uwLRg/edit?tab=t.0' },
        { label: 'Положение о платежах', url: 'https://docs.google.com/document/d/1CRl8L4flDLeqfpT5hlafYjZ8_vS2mjDmdSYBiDNv8wc/edit?tab=t.0' },
    ];

    const requisites = [
        { label: 'ИНН', value: '212913749726' },
        { label: 'ОГРНИП', value: '323210000073450' },
        { label: 'Банк', value: 'АО «ТБанк»' },
        { label: 'БИК', value: '044525974' },
        { label: 'Расчётный счёт', value: '40802810000005821724' },
        { label: 'Корр. счёт', value: '30101810145250000974' },
    ];

    return (
        <>
            <footer className="pt-20 pb-10 bg-slate-950 border-t border-white/5 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        {/* Brand Column */}
                        <div className="lg:col-span-2">
                            <h2 className="text-4xl font-black text-white mb-4 italic family-outfit tracking-tighter">
                                AI Asol Studio
                            </h2>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm italic">
                                ИИ-инструменты для вашего креатива.
                            </p>
                        </div>

                        {/* Support Column */}
                        <div>
                            <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6">Поддержка</h4>
                            <ul className="space-y-4">
                                <li>
                                    <a href="mailto:pr@ai-asol.ru" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group">
                                        <Mail size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                                        <span className="font-bold text-sm">pr@ai-asol.ru</span>
                                    </a>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group border-none bg-transparent p-0 cursor-pointer"
                                    >
                                        <Landmark size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                                        <span className="font-bold text-sm">Реквизиты</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Documents Column */}
                        <div>
                            <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6">Документы</h4>
                            <ul className="space-y-4">
                                {documents.map((doc, i) => (
                                    <li key={i}>
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                                        >
                                            <FileText size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                                            <span className="font-bold text-sm leading-tight">{doc.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-slate-500 text-xs font-bold font-medium tracking-tight">
                            © 2026 ИП Виссаров А.В. • ОГРНИП 323210000073450
                        </p>

                        <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-full shadow-lg shadow-black/50">
                            <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                AI Asol Studio — платный сервис
                            </span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Requisites Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 family-outfit tracking-tight">Реквизиты</h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                                    >
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {requisites.map((item, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                            <span className="text-slate-900 font-bold text-sm tracking-tight">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full mt-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                                >
                                    Закрыть
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Footer;
