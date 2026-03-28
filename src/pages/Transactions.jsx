import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, Search, Filter, Loader2, Sparkles, ReceiptText } from 'lucide-react';
import { authService } from '../services/api';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await authService.getTransactions();
            setTransactions(data || []);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'income') return t.amount > 0;
        if (filter === 'expense') return t.amount < 0;
        return true;
    });

    return (
        <div className="max-w-5xl mx-auto px-6 pt-32 pb-12 min-h-screen font-primary">
            <header className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black tracking-widest uppercase mb-4">
                            <ReceiptText size={12} />
                            Billing
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2 family-outfit tracking-tight">История списаний</h1>
                        <p className="text-slate-500 font-medium">Контролируйте свои расходы и пополнения</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-2xl self-start">
                        {[
                            { id: 'all', label: 'Все' },
                            { id: 'income', label: 'Пополнения' },
                            { id: 'expense', label: 'Списания' },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setFilter(t.id)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                    <p className="text-lg font-bold text-slate-400">Загружаем историю...</p>
                </div>
            ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-slate-100">
                    <Clock size={64} className="mx-auto text-slate-200 mb-6" />
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Операций пока нет</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto">Здесь будет отображаться история ваших платежей и затрат на генерацию контента.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTransactions.map((t, index) => (
                        <motion.div
                            key={t.id || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-wrap items-center gap-6 group hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                                {t.amount > 0 ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <h4 className="font-bold text-slate-900 mb-0.5">{t.description || (t.amount > 0 ? 'Пополнение баланса' : 'Списание за услуги')}</h4>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>#{t.id}</span>
                                    <span>•</span>
                                    <span>{new Date(t.createdAt).toLocaleString('ru-RU')}</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className={`text-xl font-black ${t.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} ₽
                                </p>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Статус: {t.status === 'completed' ? 'Успешно' : 'В обработке'}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Transactions;
