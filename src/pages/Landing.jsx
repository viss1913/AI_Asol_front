import { motion } from 'framer-motion';
import { ArrowRight, Video, MessageSquare, Sparkles, Zap, Globe, Music, Image as ImageIcon, Wand2, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import videoShowcase from '../assets/veo-showcase.mp4';
import landing from '../assets/landing.jpg';

const Landing = () => {
    const navigate = useNavigate();

    const services = [
        {
            icon: <Video className="text-indigo-600" />,
            title: 'Видео',
            description: 'Veo 3.1 & Sora 2',
            link: '/studio'
        },
        {
            icon: <ImageIcon className="text-pink-600" />,
            title: 'Изображения',
            description: 'Nano Banana & Flux',
            link: '/image'
        },
        {
            icon: <Mic className="text-amber-600" />,
            title: 'Звук',
            description: 'ElevenLabs & SFX',
            link: '/audio'
        },
        {
            icon: <MessageSquare className="text-purple-600" />,
            title: 'Чат',
            description: 'Gemini 2.0 Flash',
            link: '/chat'
        },
        {
            icon: <Wand2 className="text-emerald-600" />,
            title: 'Редактор',
            description: 'Smart Edit',
            link: '/editor'
        },
        {
            icon: <Globe className="text-cyan-500" />,
            title: 'API',
            description: 'Интеграция',
            link: '#'
        },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter family-outfit leading-[1.05] relative z-10">
                            Твоё пространство <br />
                            <span className="text-gradient">свободного творчества</span>
                        </h1>

                        <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-12 font-medium leading-relaxed relative z-10">
                            Эксклюзивный доступ к технологиям будущего: <strong>Veo 3.1</strong>, <strong>Sora 2</strong>, <strong>Gemini</strong> и <strong>ElevenLabs</strong>. Создавайте кинематографичные видео и реалистичную озвучку в одной экосистеме.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
                            <Button size="lg" onClick={() => navigate('/studio')} className="px-12 h-16 text-lg rounded-2xl bg-slate-900 text-white shadow-xl hover:bg-slate-800">
                                Открыть Студию
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => navigate('/chat')} className="px-12 h-16 text-lg rounded-2xl border-slate-200 bg-white/50 backdrop-blur-sm">
                                Умный Чат <ArrowRight size={20} className="ml-2" />
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <div>
                                <div className="text-4xl font-black text-slate-900 mb-2">99.9%</div>
                                <div className="text-sm text-slate-500 font-medium">Uptime</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black text-slate-900 mb-2">&lt; 25s</div>
                                <div className="text-sm text-slate-500 font-medium">Генерация</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black text-slate-900 mb-2">24/7</div>
                                <div className="text-sm text-slate-500 font-medium">Поддержка</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black text-slate-900 mb-2">SSL</div>
                                <div className="text-sm text-slate-500 font-medium">Безопасность</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Video Showcase Section */}
            <section className="py-12 bg-gradient-to-b from-white to-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                            <video
                                src={videoShowcase}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-auto"
                            />
                        </div>

                        <div>
                            <h2 className="text-5xl font-black text-slate-900 mb-6 family-outfit">
                                Лучшие решения: Veo 3.1 & Sora 2
                            </h2>
                            <p className="text-xl text-slate-600 mb-4 font-medium leading-relaxed">
                                Кинематографическое качество и безграничное творчество
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <Sparkles className="text-indigo-600 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-600 font-medium text-lg">Text-to-Video: создавайте невероятные миры по текстовому описанию</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Sparkles className="text-indigo-600 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-600 font-medium text-lg">Image-to-Video: оживляйте ваши фотографии и превращайте их в кино</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Sparkles className="text-indigo-600 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-600 font-medium text-lg">Storytelling: создавайте плавные переходы между двумя изображениями</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Sparkles className="text-indigo-600 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-600 font-medium text-lg">Русская озвучка: профессиональный голос для ваших роликов</span>
                                </li>
                            </ul>
                            <Button size="lg" onClick={() => navigate('/studio')} className="px-10 h-14 rounded-2xl">
                                Создать Видео <ArrowRight size={20} className="ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Image Showcase Section */}
            <section className="py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        <div className="order-2 lg:order-1">
                            <h2 className="text-5xl font-black text-slate-900 mb-6 family-outfit">
                                Nano Banana & Flux
                            </h2>
                            <p className="text-xl text-slate-600 mb-4 font-medium leading-relaxed">
                                Искусство без границ
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <Sparkles className="text-pink-600 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-600 font-medium text-lg">Text-to-Image с непревзойденным фотореализмом</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Sparkles className="text-pink-600 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-600 font-medium text-lg">Smart Edit (Редактирование своей картинки)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Sparkles className="text-pink-600 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-600 font-medium text-lg">Upscale и безупречная детализация</span>
                                </li>
                            </ul>
                            <Button size="lg" onClick={() => navigate('/image')} className="px-10 h-14 rounded-2xl">
                                Создать Арт <ArrowRight size={20} className="ml-2" />
                            </Button>
                        </div>

                        <div className="relative rounded-3xl overflow-hidden shadow-2xl order-1 lg:order-2">
                            <img
                                src={landing}
                                alt="AI Generated Art"
                                className="w-full h-auto"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Audio Showcase Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 p-8 flex items-center justify-center min-h-[400px]">
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center animate-pulse">
                                    <Music size={64} className="text-amber-500" />
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-1.5 h-12 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-5xl font-black text-slate-900 mb-6 family-outfit">
                                Профессиональный Звук
                            </h2>
                            <p className="text-xl text-slate-600 mb-4 font-medium leading-relaxed">
                                Голос вашего бренда от ElevenLabs
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <Sparkles className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-600 font-medium text-lg">Реалистичная озвучка на русском языке с эмоциями</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Sparkles className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-600 font-medium text-lg">Генерация живых диалогов для ваших проектов</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Sparkles className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-600 font-medium text-lg">Создание уникальных звуковых эффектов (SFX) по описанию</span>
                                </li>
                            </ul>
                            <Button size="lg" onClick={() => navigate('/audio')} className="px-10 h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white border-none shadow-amber-200">
                                Создать Звук <ArrowRight size={20} className="ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black text-slate-900 mb-6 family-outfit">Все сервисы в одном месте</h2>
                        <p className="text-xl text-slate-500 font-medium">Выберите инструмент для вашей задачи</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                onClick={() => service.link !== '#' && navigate(service.link)}
                                className="group cursor-pointer bg-white border-2 border-slate-100 rounded-3xl p-8 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2 family-outfit">{service.title}</h3>
                                <p className="text-slate-500 font-medium">{service.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-5xl md:text-6xl font-black text-white mb-8 family-outfit">
                            Готовы начать творить?
                        </h2>
                        <p className="text-xl text-white/90 mb-12 font-medium">
                            Присоединяйтесь к тысячам создателей, которые уже используют AI Asol для воплощения своих идей
                        </p>
                        <Button
                            size="lg"
                            onClick={() => navigate('/studio')}
                            className="px-12 h-16 text-lg rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-2xl"
                        >
                            Начать бесплатно <Zap size={20} className="ml-2" />
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
