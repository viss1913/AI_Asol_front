import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Video, Image as ImageIcon, Mic, Music, PenTool, LogOut, LayoutDashboard, User, Plus } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/api';
import TopUpModal from '../TopUpModal';
import logo from '../../assets/logo.png';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, balance, logout } = useUser();
    const [showTopUpModal, setShowTopUpModal] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { id: 'chat', label: 'Чат', icon: <MessageSquare size={18} />, path: '/chat', disabled: false },
        { id: 'video', label: 'Видео', icon: <Video size={18} />, path: '/video', disabled: false },
        { id: 'image', label: 'Изображения', icon: <ImageIcon size={18} />, path: '/image', disabled: false },
        { id: 'audio', label: 'Звук', icon: <Mic size={18} />, path: '/audio', disabled: false },
        { id: 'music', label: 'Музыка', icon: <Music size={18} />, path: '#', disabled: true, badge: 'Скоро' },
        { id: 'writer', label: 'AI Писатель', icon: <PenTool size={18} />, path: '#', disabled: true, badge: 'Скоро' },
    ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 flex items-center justify-between px-6 transition-all duration-300">
                <div className="flex items-center gap-8">
                    <div
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:shadow-md transition-all">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" />
                        </div>
                        <span className="font-black text-lg tracking-tight text-slate-900 font-outfit">AI Asol</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => !item.disabled && navigate(item.path)}
                                disabled={item.disabled}
                                className={`
                                relative px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                                ${location.pathname.startsWith(item.path)
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                ${item.disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''}
                            `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 bg-slate-100 text-slate-500 text-[8px] px-1.5 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <div className="hidden md:flex items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Баланс:</span>
                                    <span className="text-sm font-black text-slate-900">{balance?.toFixed(2) || '0.00'} ₽</span>
                                </div>
                                <button
                                    onClick={() => setShowTopUpModal(true)}
                                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-lg shadow-indigo-200/50"
                                    title="Пополнить баланс"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                                    {user.username?.[0]?.toUpperCase() || <User size={16} />}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Выйти"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                            >
                                Войти
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200/50"
                            >
                                Регистрация
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <TopUpModal
                isOpen={showTopUpModal}
                onClose={() => setShowTopUpModal(false)}
            />
        </>
    );
};

export default Header;
