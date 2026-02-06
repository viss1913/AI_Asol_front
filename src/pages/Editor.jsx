import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Image as ImageIcon, Video, Wand2, Download, Share2, CornerUpLeft, Upload as UploadIcon, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import { contentService } from '../services/api';

const Editor = () => {
    const [activeTab, setActiveTab] = useState('image'); // 'image' or 'video'
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('z-image');
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setError(null);
        try {
            const data = await contentService.generateImage(prompt, model);
            // API returns result as an array of URLs: data.result = ["https://..."]
            if (data.result && data.result.length > 0) {
                setResultImage(data.result[0]);
            } else if (data.image_url || data.url) {
                setResultImage(data.image_url || data.url);
            } else {
                setError('API вернул пустой результат.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка генерации. Проверьте подключение к API.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Controls */}
                <div className="lg:col-span-5 space-y-8">
                    <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            <Wand2 className="text-[#6366f1]" size={24} />
                            Параметры генерации
                        </h2>

                        {/* Content Type Switcher */}
                        <div className="flex bg-slate-50 p-1 rounded-2xl mb-8">
                            <button
                                onClick={() => setActiveTab('image')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-semibold ${activeTab === 'image' ? 'bg-white text-[#6366f1] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <ImageIcon size={18} />
                                Картинки
                            </button>
                            <button
                                onClick={() => setActiveTab('video')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-semibold ${activeTab === 'video' ? 'bg-white text-[#6366f1] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Video size={18} />
                                Видео
                            </button>
                        </div>

                        {/* Prompt Area */}
                        <div className="space-y-4 mb-8">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block">Творческий запрос</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Опишите, что вы хотите создать во всех деталях..."
                                className="w-full h-32 p-5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-[#6366f1]/5 focus:border-[#6366f1] outline-none transition-all resize-none text-slate-800 font-medium"
                            />
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-4 mb-10">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block">Модель ИИ</label>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => setModel('z-image')}
                                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${model === 'z-image' ? 'border-[#6366f1] bg-[#6366f1]/5 ring-1 ring-[#6366f1]' : 'border-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    <div>
                                        <p className={`font-bold ${model === 'z-image' ? 'text-[#6366f1]' : 'text-slate-800'}`}>Z-Image v2</p>
                                        <p className="text-xs text-slate-500 font-medium">Фотореализм и детализация</p>
                                    </div>
                                    {model === 'z-image' && <Sparkles size={18} className="text-[#6366f1]" />}
                                </button>
                                <button
                                    onClick={() => setModel('gemini-flash-image')}
                                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${model === 'gemini-flash-image' ? 'border-[#6366f1] bg-[#6366f1]/5 ring-1 ring-[#6366f1]' : 'border-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    <div>
                                        <p className={`font-bold ${model === 'gemini-flash-image' ? 'text-[#6366f1]' : 'text-slate-800'}`}>Gemini Flash</p>
                                        <p className="text-xs text-slate-500 font-medium">Мгновенная генерация и обработка</p>
                                    </div>
                                    {model === 'gemini-flash-image' && <Sparkles size={18} className="text-[#6366f1]" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            className="w-full py-4 shadow-xl h-14"
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt}
                        >
                            {isGenerating ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Генерация...
                                </div>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Магия генерации
                                </>
                            )}
                        </Button>
                    </section>

                    {/* Upload Section */}
                    <section className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-3xl flex items-center justify-between group hover:border-[#6366f1] transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#6366f1] transition-all shadow-sm">
                                <UploadIcon size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700">Загрузить пример</p>
                                <p className="text-xs text-slate-400 font-medium tracking-tight">Использовать как референс</p>
                            </div>
                        </div>
                        <CornerUpLeft size={18} className="text-slate-300 group-hover:text-[#6366f1]" />
                    </section>
                </div>

                {/* Right Column: Preview Area */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl h-full min-h-[500px] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Результаты ИИ</span>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                                    <Share2 size={18} />
                                </button>
                                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-50 m-4 rounded-[1.5rem] flex items-center justify-center relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-[#6366f1]/10 rounded-full" />
                                            <div className="w-16 h-16 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin absolute top-0" />
                                        </div>
                                        <p className="text-slate-400 font-bold animate-pulse">ИИ создает ваш шедевр...</p>
                                    </motion.div>
                                ) : error ? (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center gap-3 text-red-500 px-6 text-center"
                                    >
                                        <AlertCircle size={48} />
                                        <p className="font-bold">{error}</p>
                                        <button onClick={handleGenerate} className="text-sm font-medium underline">Попробовать еще раз</button>
                                    </motion.div>
                                ) : resultImage ? (
                                    <motion.img
                                        key="result"
                                        initial={{ scale: 1.1, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        src={resultImage}
                                        alt="Result"
                                        className="w-full h-full object-contain p-4"
                                    />
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center text-center px-10"
                                    >
                                        <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-slate-200 mb-6">
                                            <ImageIcon size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Готовы к творчеству?</h3>
                                        <p className="text-slate-400 font-medium max-w-xs">
                                            Опишите вашу идею слева и нажмите кнопку генерации.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Editor;
