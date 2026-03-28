import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Video, MessageSquare, Sparkles, Zap, Globe, Music,
    ImageIcon, Wand2, Mic, X, ChevronRight, Youtube,
    Play as PlayIcon, Pause, Clock, Shield, Star, Users, Brain,
    Palette, Layers, HelpCircle, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import videoShowcase from '../assets/veo-showcase.mp4';
import avatar from '../assets/avatar.png';
import landingImg from '../assets/landing.jpg';

const Landing = () => {
    const navigate = useNavigate();
    const [playingId, setPlayingId] = React.useState(null);
    const [showArticleModal, setShowArticleModal] = React.useState(false);
    const [displayText, setDisplayText] = React.useState('');
    const [isTypingComplete, setIsTypingComplete] = React.useState(false);
    const [activeFaq, setActiveFaq] = React.useState(null);
    const audioRef = React.useRef(null);

    const fullText = "Давайте без сказок. В моей студии можно всё: генерить арты с нуля, загружать свои фото, но главное — делать реальное кино через Sora 2 и Veo 3.1. Оживляем любые идеи в 4K за секунды. Это наш Smart Edit и мощь ИИ в одном флаконе...";

    React.useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setDisplayText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                setIsTypingComplete(true);
                clearInterval(typingInterval);
            }
        }, 12);

        return () => clearInterval(typingInterval);
    }, []);

    const features = [
        {
            icon: <Zap className="text-yellow-500" />,
            title: 'Veo 3.1 & Sora 2',
            description: 'Прямой доступ к самым мощным видео-моделям современности.'
        },
        {
            icon: <Palette className="text-pink-500" />,
            title: 'Nano Banana & Flux',
            description: 'Создание безупречных артов и персонажей за секунды.'
        },
        {
            icon: <Brain className="text-purple-500" />,
            title: 'Gemini 2.0 Flash',
            description: 'Обсуждение сценариев, генерация идей и работа с сюжетом в реальном времени.'
        },
        {
            icon: <Mic className="text-blue-500" />,
            title: 'ElevenLabs & Suno',
            description: 'Профессиональная озвучка и музыка в одной экосистеме.'
        }
    ];

    const steps = [
        {
            title: "Идея и Сценарий",
            desc: "Общайтесь с Gemini 2.0 Flash — она поймет вашу задумку и превратит её в детальный сценарий и промпты.",
            icon: <Brain className="text-indigo-600" />
        },
        {
            title: "Визуальный стиль",
            desc: "Генерируйте арты в Nano Banana или Flux. Создайте идеальный образ, который станет основой вашего видео.",
            icon: <Palette className="text-pink-600" />
        },
        {
            title: "Кино-генерация",
            desc: "Используйте Sora 2 или Veo 3.1 для превращения артов в живое кино. Контролируйте каждый кадр.",
            icon: <Video className="text-emerald-600" />
        },
        {
            title: "Звуковое оформление",
            desc: "Накладывайте голоса от ElevenLabs и саундтреки от Suno v4. Профессиональный финал вашего проекта.",
            icon: <Music className="text-amber-600" />
        }
    ];

    const faqs = [
        {
            q: "Кому принадлежат права на созданные видео?",
            a: "Все права на сгенерированный контент принадлежат вам. Вы можете использовать его в коммерческих целях, на YouTube, в рекламе или кино."
        },
        {
            q: "Как быстро происходит генерация?",
            a: "В зависимости от выбранной модели (Fast или High Quality), генерация одной сцены занимает от 15 до 60 секунд."
        },
        {
            q: "Можно ли создать видео длиной более 1 минуты?",
            a: "Да, вы можете создавать неограниченное количество сцен и склеивать их. Наша система поддерживает работу с проектами любой сложности."
        }
    ];

    return (
        <>
            <Helmet>
                <title>AI Asol Studio — Нейросеть для видео (Veo 3, Sora 2), озвучка и ИИ-арты</title>
                <meta name="description" content="Профессиональная нейросеть для генерации видео из текста и фото. Эксклюзивный доступ к моделям Veo 3.1, Sora 2, Flux, Nano Banana и ElevenLabs." />
            </Helmet>
            <main className="min-h-screen relative overflow-hidden bg-[#fafafa]">
                {/* Hero Section */}
                <section className="relative pt-24 pb-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.03)_0%,transparent_50%)]" />
                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col md:flex-row items-center gap-10"
                        >
                            <div className="flex-shrink-0 relative">
                                <motion.div
                                    animate={{ scale: [1, 1.01, 1] }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                    className="w-32 h-32 md:w-44 md:h-44 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl z-10 relative"
                                >
                                    <img src={avatar} alt="AI Asol" className="w-full h-full object-cover" />
                                </motion.div>
                                <div className="absolute -inset-2 bg-indigo-500/5 rounded-[2rem] blur-xl animate-pulse" />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-xl text-[8px] font-bold uppercase tracking-widest mb-6">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                                    AI Expert
                                </div>
                                <h1 className="text-base md:text-lg font-bold text-slate-800 mb-5 leading-relaxed">
                                    {displayText}
                                    {!isTypingComplete && <span className="inline-block w-1 h-5 bg-indigo-600 ml-1 animate-pulse align-middle" />}
                                </h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isTypingComplete ? 1 : 0 }}
                                    className="text-sm text-slate-500 font-medium mb-8 max-w-xl leading-relaxed"
                                >
                                    Экосистема для творцов. <span className="text-slate-800 font-semibold underline decoration-indigo-500/20">Всё в одном месте:</span> идеи Gemini, арты Nano Banana и мощь Sora 2.
                                </motion.p>

                                <AnimatePresence>
                                    {isTypingComplete && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <Button size="lg" onClick={() => setShowArticleModal(true)} className="h-14 px-8 rounded-xl shadow-lg shadow-indigo-500/10 bg-indigo-600">
                                                Читать разбор Асоль <ChevronRight className="ml-1" size={18} />
                                            </Button>
                                            <Button variant="outline" size="lg" onClick={() => navigate('/studio')} className="h-14 px-8 rounded-xl border font-bold">
                                                В Студию <ArrowRight className="ml-1" size={18} />
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Video Demo Section */}
                <section className="py-20 bg-[#f8f9ff]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 text-center">Магия Veo 3.1 & Sora 2</h2>
                            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium text-center">Посмотрите, как наши алгоритмы оживляют воображение с кинематографической точностью.</p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white max-w-5xl mx-auto"
                        >
                            <video src={videoShowcase} autoPlay loop muted playsInline className="w-full h-auto" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 md:p-10">
                                <div className="text-white flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 font-bold uppercase tracking-[0.2em] text-[10px] opacity-90">
                                            <Sparkles size={14} className="text-yellow-400" /> 100% Generated
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold">Без камер. Только ИИ.</h3>
                                    </div>
                                    <a
                                        href="https://www.youtube.com/@BankFuture"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all shadow-xl group"
                                    >
                                        <Youtube size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="font-bold text-sm">Смотреть работы заказчика</span>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Nano Banana & Flux Section */}
                <section className="py-24 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex-1 space-y-8"
                            >
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Nano Banana & Flux</h2>
                                    <p className="text-lg text-slate-500 font-medium italic">Искусство без границ</p>
                                </div>

                                <ul className="space-y-6">
                                    {[
                                        { title: "Text-to-Image с непревзойденным фотореализмом", icon: <Sparkles className="text-pink-500" /> },
                                        { title: "Smart Edit (Загрузка своих фото и правка промптами)", icon: <Wand2 className="text-pink-500" /> },
                                        { title: "Upscale и безупречная детализация", icon: <Zap className="text-pink-500" /> },
                                        { title: "Фотосессии, генерация персонажей (Banana Pro)", icon: <Star className="text-pink-500" /> }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-4 group">
                                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-125">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm md:text-base font-bold text-slate-700">{item.title}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-4">
                                    <Button
                                        size="lg"
                                        onClick={() => navigate('/studio')}
                                        className="h-16 px-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all group"
                                    >
                                        Создать Арт <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex-1 relative"
                            >
                                <div className="absolute -inset-4 bg-indigo-500/5 rounded-[3rem] blur-3xl" />
                                <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-8 border-white">
                                    <img src={landingImg} alt="AI Art Preview" className="w-full h-auto hover:scale-105 transition-transform duration-700" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* How it Works / Steps */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <div className="mb-16">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 text-center">Как создается <span className="text-indigo-600">шедевр</span>?</h2>
                            <p className="text-sm text-slate-500 font-medium max-w-2xl mx-auto text-center">Путь от мысли до готового ролика стал в 100 раз короче. Весь продакшн в одном окне браузера.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="p-8 bg-slate-50 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all group"
                                >
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-indigo-50 transition-colors">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust/Partners */}
                <section className="py-16 border-y border-slate-50 bg-[#fafafa]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-20 grayscale">
                            {['Google DeepMind', 'ElevenLabs', 'NVIDIA', 'Runway', 'OpenAI'].map((p, i) => (
                                <span key={i} className="text-lg font-black text-slate-900 family-outfit">{p}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-slate-50">
                    <div className="max-w-3xl mx-auto px-6">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-12 text-center">Остались вопросы?</h2>
                        <div className="space-y-3">
                            {faqs.map((f, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                                    <button
                                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                        className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                                    >
                                        <span className="text-sm font-bold text-slate-900">{f.q}</span>
                                        <HelpCircle size={18} className={`text-slate-300 transition-transform ${activeFaq === i ? 'rotate-180 text-indigo-500' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {activeFaq === i && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-6 pb-6 text-sm text-slate-500 font-medium leading-relaxed"
                                            >
                                                {f.a}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Enhanced Footer CTA */}
                <section className="py-24 bg-white">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10 max-w-2xl mx-auto">
                                <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">Твоё воображение — <br />твой лимит.</h2>
                                <p className="text-sm text-slate-400 mb-10 font-medium">Присоединяйся к новым режиссерам. Начни создавать прямо сейчас.</p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <Button size="lg" onClick={() => navigate('/studio')} className="h-16 px-10 rounded-xl bg-indigo-600 text-white font-bold text-xl w-full sm:w-auto">
                                        Начать бесплатно
                                    </Button>
                                    <a
                                        href="https://www.youtube.com/@BankFuture"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        <Youtube size={18} className="text-red-500" /> Работы заказчика
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Article Modal */}
                <AnimatePresence>
                    {showArticleModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowArticleModal(false)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                                className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden relative z-10 shadow-2xl flex flex-col"
                            >
                                <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-20">
                                    <div className="flex items-center gap-4">
                                        <img src={avatar} alt="Asol" className="w-12 h-12 rounded-full border-2 border-slate-50" />
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 family-outfit leading-none uppercase">Асоль эксперт</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">AI Asol Studio • 2026</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowArticleModal(false)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-700 transition-all"><X size={24} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 md:p-16 scroll-smooth">
                                    <article className="prose prose-slate max-w-none">
                                        <header className="mb-12 text-center">
                                            <h1 className="text-xl md:text-3xl font-bold text-slate-800 mb-6 uppercase tracking-tight leading-tight">
                                                Нейросети 2026: <br />Как делать кино на коленке и не разориться
                                            </h1>
                                            <div className="h-1 w-20 bg-indigo-600 mx-auto" />
                                        </header>

                                        <div className="space-y-8 text-slate-600 text-sm md:text-base leading-relaxed">
                                            <p>
                                                Слышите этот звук? Это лопаются бюджеты старых киностудий. В 2026 году генерация видео перестала быть игрушкой для гиков — теперь это реальный инструмент, который позволяет любому пацану (или девчонке) из Ростова сделать картинку не хуже, чем в Голливуде.
                                            </p>
                                            <p>
                                                Я, Асоль, сейчас раскидаю вам по фактам, как мы работаем в <strong>AI Asol Studio</strong> и почему вам пора перестать бояться этих букв — ИИ.
                                            </p>

                                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                                    <Sparkles size={18} className="text-indigo-600" /> Что мы реально умеем (и почему это пушка)?
                                                </h2>
                                                <ul className="space-y-4">
                                                    <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" /> <strong>Магия Sora 2 & Veo 3.1:</strong> Это движки, которые рисуют картинку такой четкости, что ты в телевизоре такого не увидишь. Глубина кадра, свет, тени — всё как в настоящем кино.</li>
                                                    <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" /> <strong>Оживление "мертвых" артов:</strong> Твой персонаж буквально оживает на глазах. Заставим его дышать, моргать и двигаться в 4K.</li>
                                                    <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" /> <strong>Режиссура промптами:</strong> Контролируй камеру и динамику. Это не просто "видосик", это осознанный кадр.</li>
                                                    <li className="flex gap-3"><CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" /> <strong>Бесшовные переходы:</strong> Склеиваем сцены так, что история льется как песня, без резких скачков.</li>
                                                </ul>
                                                <p className="mt-6 text-xs text-slate-400 italic">
                                                    Реальный лимит: 10-15 секунд на один кадр. Этого за глаза хватает для клипа, рекламы или короткого метра.
                                                </p>
                                            </div>

                                            <h2 className="text-lg font-bold text-slate-800 mt-12 mb-6">Математика свободы: Продакшен для каждого</h2>
                                            <p>
                                                Зачем пугать миллионами? Технология стала настолько доступной, что бюджет перестает быть главным тормозом. В AI Asol Studio создание контента превращается в увлекательный конструктор:
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-6 bg-white border border-slate-100 rounded-2xl">
                                                    <Music className="text-indigo-600 mb-3" size={20} />
                                                    <h3 className="font-bold text-sm mb-1">Музыка</h3>
                                                    <p className="text-xs text-slate-400">Топовые треки в Suno v4.</p>
                                                </div>
                                                <div className="p-6 bg-white border border-slate-100 rounded-2xl">
                                                    <Video className="text-indigo-600 mb-3" size={20} />
                                                    <h3 className="font-bold text-sm mb-1">Видеоряд</h3>
                                                    <p className="text-xs text-slate-400">Сочные сцены через Sora или Veo.</p>
                                                </div>
                                                <div className="p-6 bg-white border border-slate-100 rounded-2xl">
                                                    <Mic className="text-indigo-600 mb-3" size={20} />
                                                    <h3 className="font-bold text-sm mb-1">Звук</h3>
                                                    <p className="text-xs text-slate-400">Голоса через ElevenLabs.</p>
                                                </div>
                                            </div>

                                            <h2 className="text-lg font-bold text-slate-800 mt-12 mb-6">Почему у нас круче?</h2>
                                            <p>
                                                Многие боятся промптов. Типа, надо быть прогером. Нифига! В нашей студии вы пишете как чувствуете, а мы под капотом <strong>правильно переводим и докручиваем</strong> промпт. Мы — ваш технический режиссер.
                                            </p>

                                            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 font-medium text-indigo-900/80 text-sm">
                                                Совет от Асоль: Звук всегда фигачьте отдельно. Это гарантия, что голос не поменяется посреди клипа.
                                            </div>

                                            <h2 className="text-lg font-bold text-slate-800 mt-12 mb-6">Это только начало</h2>
                                            <p>
                                                ИИ-клипы уже собирают по 13 миллионов просмотров. Генерация видео — это свобода. Вам больше не нужны миллионы, чтобы вас заметили. Нужна только идея и прямые руки.
                                            </p>

                                            <div className="pt-12 text-center">
                                                <p className="font-bold text-slate-900 mb-4 italic text-lg uppercase tracking-tight">Будущее за идейными.</p>
                                                <div className="flex flex-col items-center gap-4">
                                                    <Button size="lg" className="h-16 px-12 rounded-2xl bg-slate-900" onClick={() => navigate('/studio')}>Начать творить</Button>
                                                    <a
                                                        href="https://www.youtube.com/@BankFuture"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 font-bold hover:underline flex items-center gap-2"
                                                    >
                                                        <Youtube size={18} /> YouTube канал заказчика (примеры работ)
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                                <div className="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
                                    <Button size="lg" className="flex-1 h-14 rounded-xl bg-indigo-600" onClick={() => { setShowArticleModal(false); navigate('/studio'); }}>Открыть Студию</Button>
                                    <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl border" onClick={() => setShowArticleModal(false)}>Закрыть</Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </>
    );
};

export default Landing;
