import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Video, Image as ImageIcon, Mic, Music, PenTool, Sparkles, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useUser();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const features = [
        {
            id: 'chat',
            title: 'AI Чат',
            description: 'Общайтесь с Ассоль, получайте ответы и идеи.',
            icon: MessageSquare,
            color: 'bg-indigo-500',
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            link: '/chat',
            active: true
        },
        {
            id: 'video',
            title: 'Видео Студия',
            description: 'Создавайте кинематографичные видео с Veo.',
            icon: Video,
            color: 'bg-violet-500',
            bg: 'bg-violet-50',
            text: 'text-violet-600',
            link: '/video',
            active: true
        },
        {
            id: 'image',
            title: 'Изображения',
            description: 'Генерируйте профессиональные арты с Flux.',
            icon: ImageIcon,
            color: 'bg-pink-500',
            bg: 'bg-pink-50',
            text: 'text-pink-600',
            link: '/image',
            active: true
        },
        {
            id: 'voice',
            title: 'Звук',
            description: 'Клонирование и синтез речи (ElevenLabs).',
            icon: Mic,
            color: 'bg-emerald-500',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            link: '/audio',
            active: true
        },
        {
            id: 'music',
            title: 'Музыка',
            description: 'Создание треков и саунд-дизайна.',
            icon: Music,
            color: 'bg-amber-500',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            link: '#',
            active: false,
            tag: 'Скоро'
        },
        {
            id: 'script',
            title: 'Сценарист',
            description: 'Помощь в написании сценариев.',
            icon: PenTool,
            color: 'bg-cyan-500',
            bg: 'bg-cyan-50',
            text: 'text-cyan-600',
            link: '#',
            active: false,
            tag: 'Скоро'
        }
    ];

    return (
        <div className="min-h-screen bg-white pt-32 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center md:text-left"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black tracking-widest uppercase mb-4">
                        <Sparkles size={12} />
                        Workspace
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 family-outfit tracking-tight">
                        Добро пожаловать, <span className="text-indigo-600">{user?.name || 'Творец'}</span>!
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-2xl">
                        Выберите инструмент для начала работы. Все необходимые сервисы теперь под рукой.
                    </p>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.id}
                            variants={item}
                            onClick={() => feature.active && navigate(feature.link)}
                            className={`group relative overflow-hidden rounded-[2.5rem] border border-slate-100 p-8 transition-all duration-300 ${feature.active
                                ? 'cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 bg-white'
                                : 'cursor-not-allowed opacity-80 bg-slate-50/50'
                                }`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.bg} ${feature.text}`}>
                                <feature.icon size={32} />
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{feature.title}</h3>
                                {feature.tag && (
                                    <span className="px-3 py-1 bg-slate-200 text-slate-600 text-[10px] uppercase font-black tracking-wider rounded-full">
                                        {feature.tag}
                                    </span>
                                )}
                            </div>

                            <p className="text-slate-500 font-medium leading-relaxed mb-6">
                                {feature.description}
                            </p>

                            {feature.active && (
                                <div className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${feature.text} opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0`}>
                                    Открыть <ArrowRight size={16} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
