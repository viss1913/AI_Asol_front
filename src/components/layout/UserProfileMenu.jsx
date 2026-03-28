import React, { useState, useEffect, useRef } from 'react';
import { User, ReceiptText } from 'lucide-react';
import { paymentService } from '../../services/api';

const UserProfileMenu = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await paymentService.getHistory();
            setTransactions(data || []);
        } catch (e) {
            console.error('Ошибка при получении истории транзакций:', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleMenu = () => {
        if (!isOpen) {
            fetchHistory();
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={menuRef}>
            <div
                onClick={toggleMenu}
                className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm cursor-pointer hover:bg-indigo-200 transition-colors"
                title="Профиль и история баланса"
            >
                {user?.username?.[0]?.toUpperCase() || <User size={16} />}
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <p className="font-bold text-slate-900">{user?.username || 'Пользователь'}</p>
                        <p className="text-xs text-slate-500">{user?.email || ''}</p>
                    </div>

                    <div className="p-3">
                        <div className="flex items-center gap-2 mb-3 px-1 text-sm font-bold text-slate-700">
                            <ReceiptText size={16} className="text-indigo-500" />
                            <span>История операций</span>
                        </div>

                        <div className="max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                            {loading ? (
                                <div className="text-center text-xs text-slate-400 py-4">Загрузка...</div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center text-xs text-slate-400 py-4">Нет операций</div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {transactions.map((t) => (
                                        <div key={t.id} className="flex justify-between items-start gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-xs">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 line-clamp-2" title={t.description}>
                                                    {t.description || (t.type === 'deposit' ? 'Пополнение баланса' : 'Списание')}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {new Date(t.createdAt).toLocaleString('ru-RU', {
                                                        day: '2-digit', month: '2-digit', year: '2-digit',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div className={`font-bold whitespace-nowrap mt-0.5 ${t.type === 'deposit' ? 'text-emerald-500' : 'text-slate-600'}`}>
                                                {t.type === 'deposit' ? '+' : '-'}{t.amount} ₽
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfileMenu;
