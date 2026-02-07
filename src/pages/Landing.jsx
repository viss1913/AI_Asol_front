import { motion } from 'framer-motion';
import { ArrowRight, Book, Video, MessageSquare, Zap, Shield, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import logo from '../assets/logo.png';

const Landing = () => {
    const navigate = useNavigate();

    const products = [
        {
            id: 'book',
            title: 'AI Book',
            description: 'Автоматическая генерация книг, статей и лонгридов с помощью ИИ.',
            icon: <Book className="text-blue-500" size={32} />,
            link: 'https://aibook.ai-asol.ru/',
            external: true,
            color: 'bg-blue-50'
        },
        {
            id: 'studio',
            title: 'AI Studio',
            description: 'Профессиональное создание видео и изображений для маркетинга.',
            icon: <Video className="text-indigo-500" size={32} />,
            link: '/studio',
            external: false,
            color: 'bg-indigo-50'
        },
        {
            id: 'chat',
            title: 'AI Chat',
            description: 'Умный помощник для бизнеса и личных задач в формате диалога.',
            icon: <MessageSquare className="text-emerald-500" size={32} />,
            link: '/chat',
            external: false,
            color: 'bg-emerald-50'
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-slate-50 to-transparent -z-10" />
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex justify-center mb-8">
                            <div className="w-24 h-24 rounded-3xl bg-white shadow-2xl p-3 flex items-center justify-center border border-slate-100">
                                <img src={logo} alt="AI Asol Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>
                        <span className="inline-block px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-bold tracking-wide uppercase mb-6">
                            Экосистема AI Asol
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight family-outfit leading-tight">
                            Ваш <span className="text-indigo-600 italic font-black">Интеллект</span><br /> под Алыми Парусами
                        </h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
                            Добро пожаловать в пространство AI Asol. Мы объединили лучшие инструменты искусственного интеллекта для вашего роста и творчества.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" onClick={() => navigate('/studio')} className="px-10 h-14">
                                Начать работу
                                <ArrowRight size={20} />
                            </Button>
                            <Button variant="outline" size="lg" className="px-10 h-14 border-slate-200">
                                Узнать больше
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 family-outfit">Продукты AI Asol</h2>
                        <p className="text-slate-500 font-medium">Выберите подходящий инструмент для вашей задачи</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                onClick={() => product.external ? window.open(product.link, '_blank') : navigate(product.link)}
                                className="group cursor-pointer bg-slate-50/50 rounded-3xl p-8 border border-white hover:border-slate-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${product.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {product.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 family-outfit">{product.title}</h3>
                                <p className="text-slate-500 font-medium mb-6 leading-relaxed">
                                    {product.description}
                                </p>
                                <div className="flex items-center text-slate-900 font-bold gap-2 group-hover:gap-4 transition-all uppercase text-xs tracking-widest">
                                    Перейти <ArrowRight size={16} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-8 family-outfit">Почему выбирают AI Asol?</h2>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">Высокая скорость</h4>
                                        <p className="text-slate-500">Генерация контента за секунды, а не часы кропотливой работы.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">Надежность</h4>
                                        <p className="text-slate-500">Ваши данные в безопасности, а инструменты доступны 24/7.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-500">
                                        <Star size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">Простота</h4>
                                        <p className="text-slate-500">Интуитивно понятные интерфейсы, не требующие обучения.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-3xl bg-white shadow-2xl p-4 relative z-10 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800"
                                    alt="AI Technology"
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            </div>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-50" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
