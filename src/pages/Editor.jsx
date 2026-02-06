import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Sparkles, Image as ImageIcon, Video, Wand2, Download, Share2, CornerUpLeft, Upload as UploadIcon, AlertCircle, Clock, Volume2, VolumeX, Maximize2, Zap, Loader2 } from 'lucide-react';
import Button from '../components/common/Button';
import { contentService, projectService } from '../services/api';
import { useUser } from '../context/UserContext';
import { Folder, Plus, CreditCard, X } from 'lucide-react';

const Editor = () => {
    const { updateBalance } = useUser();
    const [activeTab, setActiveTab] = useState('image'); // 'image' or 'video' or 'history'
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('z-image');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState(null); // { url: string, type: 'image' | 'video' }
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);

    // Video specific states
    const [duration, setDuration] = useState(5);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [audio, setAudio] = useState(true);
    const [fastMode, setFastMode] = useState(false);
    const [imageUrl, setImageUrl] = useState(''); // For Image-to-Video
    const [projects, setProjects] = useState([]);
    const location = useLocation();
    const [selectedProjectId, setSelectedProjectId] = useState(location.state?.projectId || '');
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const savedHistory = localStorage.getItem('generation_history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const data = await projectService.list();
            setProjects(data || []);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectTitle.trim()) return;
        try {
            const project = await projectService.create({ title: newProjectTitle });
            setProjects([project, ...projects]);
            setSelectedProjectId(project.id);
            setNewProjectTitle('');
            setIsCreatingProject(false);
        } catch (err) {
            console.error("Failed to create project:", err);
        }
    };

    const saveToHistory = (item) => {
        const newHistory = [item, ...history].slice(0, 50); // Keep last 50
        setHistory(newHistory);
        localStorage.setItem('generation_history', JSON.stringify(newHistory));
    };

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        try {
            const data = await contentService.uploadFile(file);
            setImageUrl(data.url);
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Ошибка загрузки файла. Попробуйте снова.");
        } finally {
            setUploading(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setError(null);
        try {
            let data;
            if (activeTab === 'image') {
                data = await contentService.generateImage(prompt, model, selectedProjectId || undefined);
                const url = data.result?.[0] || data.image_url || data.url;
                if (url) {
                    const resultData = { url, type: 'image', prompt, timestamp: Date.now(), projectId: selectedProjectId };
                    setResult(resultData);
                    saveToHistory(resultData);
                } else {
                    throw new Error('API вернул пустой результат.');
                }
            } else {
                data = await contentService.generateVideo({
                    model: "veo-3.1",
                    prompt,
                    image_urls: imageUrl ? [imageUrl] : undefined,
                    duration,
                    audio,
                    aspect_ratio: aspectRatio,
                    fast_mode: fastMode,
                    projectId: selectedProjectId || undefined
                });
                if (data.resultUrl) {
                    const resultData = { url: data.resultUrl, type: 'video', prompt, timestamp: Date.now(), cost: data.cost, projectId: selectedProjectId };
                    setResult(resultData);
                    saveToHistory(resultData);
                } else {
                    throw new Error('API вернул пустой результат.');
                }
            }

            if (data.newBalance !== undefined) {
                updateBalance(data.newBalance);
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403 && err.response?.data?.requireTopUp) {
                setShowTopUpModal(true);
                setError('⚠️ ' + (err.response.data.error || 'Недостаточно средств. Пожалуйста, пополните баланс.'));
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Ошибка генерации. Проверьте подключение к API.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const videoCost = duration * (audio ? 200 : 100);

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

                        {/* Project Selection */}
                        <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Folder size={12} />
                                    Проект
                                </label>
                                {!isCreatingProject && (
                                    <button
                                        onClick={() => setIsCreatingProject(true)}
                                        className="text-[10px] font-bold text-[#6366f1] hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={10} />
                                        Новый
                                    </button>
                                )}
                            </div>

                            {isCreatingProject ? (
                                <form onSubmit={handleCreateProject} className="flex gap-2">
                                    <input
                                        autoFocus
                                        value={newProjectTitle}
                                        onChange={(e) => setNewProjectTitle(e.target.value)}
                                        placeholder="Название проекта..."
                                        className="flex-1 bg-white border border-indigo-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-[#6366f1] text-white p-2 rounded-xl hover:bg-[#4f46e5] transition-all"
                                    >
                                        <Plus size={18} />
                                    </button>
                                    <button
                                        onClick={() => setIsCreatingProject(false)}
                                        className="bg-slate-200 text-slate-500 p-2 rounded-xl hover:bg-slate-300 transition-all"
                                    >
                                        <X size={18} />
                                    </button>
                                </form>
                            ) : (
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#6366f1] transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Без проекта</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            )}
                        </div>

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
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-semibold ${activeTab === 'history' ? 'bg-white text-[#6366f1] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Clock size={18} />
                                История
                            </button>
                        </div>

                        {/* Prompt Area */}
                        {activeTab !== 'history' && (
                            <>
                                <div className="space-y-4 mb-8">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block">Творческий запрос</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder={activeTab === 'video' ? "Опишите видео. Например: Девушка улыбается и говорит: 'Привет, я Ассоль'" : "Опишите, что вы хотите создать во всех деталях..."}
                                        className="w-full h-32 p-5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-[#6366f1]/5 focus:border-[#6366f1] outline-none transition-all resize-none text-slate-800 font-medium"
                                    />
                                </div>

                                {activeTab === 'image' ? (
                                    /* Model Selection for Images */
                                    <div className="space-y-4 mb-10">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block">Модель ИИ</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { id: 'z-image', name: 'Z-Image v2', desc: 'Фотореализм и детализация' },
                                                { id: 'gemini-flash-image', name: 'Gemini Flash', desc: 'Мгновенная генерация' }
                                            ].map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setModel(m.id)}
                                                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${model === m.id ? 'border-[#6366f1] bg-[#6366f1]/5 ring-1 ring-[#6366f1]' : 'border-slate-100 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div>
                                                        <p className={`font-bold ${model === m.id ? 'text-[#6366f1]' : 'text-slate-800'}`}>{m.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium">{m.desc}</p>
                                                    </div>
                                                    {model === m.id && <Sparkles size={18} className="text-[#6366f1]" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* Video Settings for Veo 3.1 */
                                    <div className="space-y-6 mb-10">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Длительность</label>
                                                <div className="flex bg-slate-50 p-1 rounded-xl">
                                                    {[5, 10].map(d => (
                                                        <button
                                                            key={d}
                                                            onClick={() => setDuration(d)}
                                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${duration === d ? 'bg-white text-[#6366f1] shadow-sm' : 'text-slate-400'}`}
                                                        >
                                                            {d} сек
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Формат</label>
                                                <div className="flex bg-slate-50 p-1 rounded-xl">
                                                    {['16:9', '9:16', '1:1'].map(r => (
                                                        <button
                                                            key={r}
                                                            onClick={() => setAspectRatio(r)}
                                                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${aspectRatio === r ? 'bg-white text-[#6366f1] shadow-sm' : 'text-slate-400'}`}
                                                        >
                                                            {r}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${audio ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                                                    {audio ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">Звук и речь</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Генерация голоса и шумов</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAudio(!audio)}
                                                className={`w-12 h-6 rounded-full transition-all relative ${audio ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${audio ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${fastMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                                                    <Zap size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">Fast Mode</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Быстрее, но меньше деталей</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setFastMode(!fastMode)}
                                                className={`w-12 h-6 rounded-full transition-all relative ${fastMode ? 'bg-amber-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${fastMode ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                                            <span className="text-xs font-bold text-indigo-600">Стоимость генерации:</span>
                                            <span className="text-sm font-black text-indigo-700">{videoCost} ₽</span>
                                        </div>
                                    </div>
                                )}

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
                            </>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {history.length === 0 ? (
                                    <div className="text-center py-20">
                                        <Clock size={40} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-bold">История пуста</p>
                                    </div>
                                ) : (
                                    history.map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setResult(item)}
                                            className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all cursor-pointer group"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
                                                    {item.type === 'video' ? (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                                            <Video size={24} />
                                                        </div>
                                                    ) : (
                                                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-indigo-600 uppercase mb-1">{item.type === 'video' ? 'Видео' : 'Картинка'}</p>
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight">{item.prompt}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2">{new Date(item.timestamp).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </section>

                    {/* Image-to-Video / Reference Section */}
                    {activeTab === 'video' && (
                        <section
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-3xl group hover:border-[#6366f1] transition-all cursor-pointer overflow-hidden relative"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#6366f1] transition-all shadow-sm">
                                        {uploading ? <Loader2 size={24} className="animate-spin text-indigo-500" /> : <UploadIcon size={24} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">Оживить фото</p>
                                        <p className="text-xs text-slate-400 font-medium tracking-tight">
                                            {uploading ? 'Загрузка...' : 'Image-to-Video режим'}
                                        </p>
                                    </div>
                                </div>
                                <CornerUpLeft size={18} className="text-slate-300 group-hover:text-[#6366f1]" />
                            </div>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Вставьте URL изображения..."
                                className="w-full p-3 text-xs bg-white border border-slate-100 rounded-xl outline-none focus:border-indigo-300"
                                onClick={(e) => e.stopPropagation()}
                            />
                            {imageUrl && (
                                <div className="mt-4 relative h-32 rounded-xl overflow-hidden border border-slate-200">
                                    <img src={imageUrl} alt="Ref" className="w-full h-full object-cover" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setImageUrl(''); }}
                                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black"
                                    >
                                        <VolumeX size={12} />
                                    </button>
                                </div>
                            )}
                        </section>
                    )}
                </div>

                {/* Right Column: Preview Area */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl h-full min-h-[600px] flex flex-col overflow-hidden sticky top-32">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Предпросмотр</span>
                                {result && <span className="text-[10px] font-bold text-indigo-500 uppercase">{result.type === 'video' ? 'Veo 3.1 Video' : 'AI Image'}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                {result && (
                                    <>
                                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                                            <Share2 size={18} />
                                        </button>
                                        <a
                                            href={result.url}
                                            download={`asol-creation-${Date.now()}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-all"
                                        >
                                            <Download size={18} />
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-50 m-4 rounded-[1.5rem] flex items-center justify-center relative overflow-hidden group/preview">
                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center gap-6"
                                    >
                                        <div className="relative">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                                className="absolute -inset-8 bg-indigo-500 rounded-full blur-3xl"
                                            />
                                            <div className="w-20 h-20 border-4 border-indigo-100 rounded-full" />
                                            <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles className="text-indigo-600 animate-pulse" size={30} />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-slate-800 font-black text-lg mb-1">{activeTab === 'video' ? 'Рендерим видео...' : 'Генерируем шедевр...'}</p>
                                            <p className="text-slate-400 text-sm font-medium">Это может занять до минуты</p>
                                        </div>
                                    </motion.div>
                                ) : error ? (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center gap-4 text-red-500 px-10 text-center"
                                    >
                                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                                            <AlertCircle size={32} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg mb-1">Упс! Ошибка</p>
                                            <p className="font-medium text-sm text-slate-500 max-w-xs mx-auto">{error}</p>
                                        </div>
                                        <button
                                            onClick={handleGenerate}
                                            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                                        >
                                            Попробовать еще раз
                                        </button>
                                    </motion.div>
                                ) : result ? (
                                    <motion.div
                                        key="result"
                                        initial={{ scale: 1.05, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="w-full h-full p-4"
                                    >
                                        {result.type === 'video' ? (
                                            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black shadow-2xl group/player">
                                                <video
                                                    src={result.url}
                                                    controls
                                                    autoPlay
                                                    loop
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10 opacity-0 group-hover/player:opacity-100 transition-all">
                                                    Veo 3.1 • 1080p
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-2xl">
                                                <img
                                                    src={result.url}
                                                    alt="Result"
                                                    className="w-full h-full object-contain"
                                                />
                                                <button className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl text-slate-800 shadow-xl opacity-0 group-hover/preview:opacity-100 transition-all hover:scale-110 active:scale-95">
                                                    <Maximize2 size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center text-center px-10"
                                    >
                                        <div className="w-24 h-24 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center text-slate-100 mb-8 border border-slate-50">
                                            {activeTab === 'video' ? <Video size={48} /> : <ImageIcon size={48} />}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                            {activeTab === 'video' ? 'Оживите воображение' : 'Создайте нечто вечное'}
                                        </h3>
                                        <p className="text-slate-400 font-bold max-w-sm leading-relaxed">
                                            {activeTab === 'video'
                                                ? 'Опишите ваше видео. Veo 3.1 создаст кинематографичный ролик с качеством 1080p и чистым звуком.'
                                                : 'Генерируйте профессиональные изображения за считанные секунды с помощью моделей нового поколения.'}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

            </div>

            {/* Top Up Modal */}
            <AnimatePresence>
                {showTopUpModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowTopUpModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10"
                        >
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-6">
                                    <CreditCard size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Пополните баланс</h3>
                                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                    Для генерации видео или фото высокого качества требуется больше средств на вашем счету.
                                </p>

                                <div className="space-y-3 mb-8 text-left">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <span className="font-bold text-slate-600">Ваш баланс:</span>
                                        <span className="font-black text-slate-900">0.00 ₽</span>
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between text-indigo-700">
                                        <span className="font-bold">Минимум:</span>
                                        <span className="font-black">500 ₽</span>
                                    </div>
                                </div>

                                <button
                                    className="w-full py-4 bg-[#6366f1] text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-[#4f46e5] transition-all active:scale-95 mb-4"
                                    onClick={() => {
                                        window.open('https://recharge.example.com', '_blank');
                                        setShowTopUpModal(false);
                                    }}
                                >
                                    Пополнить сейчас
                                </button>
                                <button
                                    onClick={() => setShowTopUpModal(false)}
                                    className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                                >
                                    Позже
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Editor;
