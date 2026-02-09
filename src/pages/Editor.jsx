import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Sparkles, Image as ImageIcon, Video, Wand2, Download, Share2, CornerUpLeft, Upload as UploadIcon, AlertCircle, Clock, Volume2, VolumeX, Maximize2, Zap, Loader2 } from 'lucide-react';
import Button from '../components/common/Button';
import { contentService, projectService, historyService, configService } from '../services/api';
import { useUser } from '../context/UserContext';
import { useTasks } from '../context/TaskContext';
import { Folder, Plus, CreditCard, X } from 'lucide-react';

const Editor = ({ defaultTab }) => {
    const { updateBalance } = useUser();
    const [activeTab, setActiveTab] = useState(defaultTab || 'image'); // 'image' or 'video' or 'history'
    const { tasks, addTask } = useTasks();
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('google/nano-banana');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState(null); // { url: string, type: 'image' | 'video' }
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);

    // Video specific states
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [audio, setAudio] = useState(true);
    const [fastMode, setFastMode] = useState(false);
    const [projects, setProjects] = useState([]);
    const location = useLocation();
    const [selectedProjectId, setSelectedProjectId] = useState(location.state?.projectId || '');
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const fileInputRef = useRef(null);
    const endFileInputRef = useRef(null);

    // Video model selection
    const [videoModel, setVideoModel] = useState('veo3'); // 'veo3', 'veo3_fast', 'sora-2-pro'
    const [soraDuration, setSoraDuration] = useState(10); // 10 or 15
    const [soraQuality, setSoraQuality] = useState('standard'); // 'standard' or 'high'
    const [imageUrl, setImageUrl] = useState('');
    const [imageEndUrl, setImageEndUrl] = useState('');
    const [videoCost, setVideoCost] = useState(250); // Dynamic cost
    const [imageCost, setImageCost] = useState(50); // Default image cost
    const [uploading, setUploading] = useState(false);
    const [uploadingEnd, setUploadingEnd] = useState(false);

    // Calculate video cost when model or options change
    useEffect(() => {
        const fetchCost = async () => {
            try {
                const options = videoModel === 'sora-2-pro' ? {
                    duration: soraDuration,
                    quality: soraQuality
                } : { duration: "8" };

                const data = await configService.calculateCost(videoModel, options);
                setVideoCost(data.cost || (videoModel === 'veo3' ? 250 : videoModel === 'veo3_fast' ? 65 : 150));
            } catch (error) {
                console.error('Video cost calculation error:', error);
            }
        };
        fetchCost();
    }, [videoModel, soraDuration, soraQuality]);

    // Calculate image cost when model changes
    useEffect(() => {
        const fetchCost = async () => {
            try {
                const data = await configService.calculateCost(model);
                setImageCost(data.cost || (model === 'google/nano-banana' ? 0.35 : 0.85));
            } catch (error) {
                console.error('Image cost calculation error:', error);
            }
        };
        fetchCost();
    }, [model]);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isGenerating) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isGenerating]);

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

    const handleFileUpload = async (e, type = 'main') => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'end') setUploadingEnd(true);
        else setUploading(true);

        setError(null);
        try {
            const data = await contentService.uploadFile(file);
            if (type === 'end') setImageEndUrl(data.url);
            else setImageUrl(data.url);
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Ошибка загрузки файла. Попробуйте снова.");
        } finally {
            if (type === 'end') setUploadingEnd(false);
            else setUploading(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setError(null);
        // We don't clear the result here, we just add a new task to the background

        try {
            let initialData;
            if (activeTab === 'image') {
                const finalModel = imageUrl ? 'google/nano-banana-edit' : model;
                const imageParams = {
                    prompt,
                    model: finalModel,
                    projectId: selectedProjectId || undefined,
                    aspect_ratio: aspectRatio,
                    image_url: imageUrl || undefined
                };
                initialData = await contentService.generateImage(imageParams);
            } else {
                const videoParams = {
                    model: videoModel,
                    prompt,
                    image_url: imageUrl || undefined,
                    image_end_url: (videoModel.startsWith('veo') && imageEndUrl) ? imageEndUrl : undefined,
                    audio,
                    aspect_ratio: aspectRatio,
                    projectId: selectedProjectId || undefined
                };

                if (videoModel === 'sora-2-pro') {
                    videoParams.duration = soraDuration;
                    videoParams.quality = soraQuality;
                } else {
                    videoParams.duration = "8";
                }

                initialData = await contentService.generateVideo(videoParams);
            }

            const taskId = initialData.id;
            if (!taskId) {
                throw new Error('Не удалось получить ID задачи.');
            }

            // Fire and forget: add to global task context
            addTask({
                id: taskId,
                type: activeTab,
                prompt,
                model: activeTab === 'image' ? model : videoModel,
                cost: activeTab === 'image' ? imageCost : videoCost,
                projectId: selectedProjectId
            });

            // Fast feedback and reset UI for next generation
            setIsGenerating(false);
            setPrompt(''); // Clear prompt for next one if user wants
            // We don't switch tab or block anything

        } catch (err) {
            console.error(err);
            if (err.response?.status === 403 && err.response?.data?.requireTopUp) {
                setShowTopUpModal(true);
                setError('⚠️ ' + (err.response.data.error || 'Недостаточно средств. Пожалуйста, пополните баланс.'));
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Ошибка старта генерации.');
            }
            setIsGenerating(false);
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 min-h-screen">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Controls */}
                    <div className="lg:col-span-6 space-y-8">
                        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                <Wand2 className="text-[#6366f1]" size={24} />
                                Параметры генерации
                            </h2>

                            {activeTab === 'video' && (
                                <div className="space-y-3 mb-6">
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {[
                                            { id: 'veo3', name: 'Veo 3 Quality', color: 'bg-indigo-600' },
                                            { id: 'veo3_fast', name: 'Veo 3 Fast', color: 'bg-amber-600' },
                                            { id: 'sora-2-pro', name: 'Sora 2 Pro', color: 'bg-purple-600' }
                                        ].map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => setVideoModel(m.id)}
                                                className={`py-3 px-0.5 rounded-xl text-center transition-all ${videoModel === m.id ? `${m.color} text-white shadow-lg` : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                                            >
                                                <p className="text-[10px] font-bold leading-tight">{m.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab !== 'history' && (
                                <>
                                    {/* Prompt Area */}
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
                                        <>
                                            {/* Model Selection for Images */}
                                            <div className="space-y-4 mb-10">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block">Модель ИИ</label>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {[
                                                        { id: 'google/nano-banana', name: 'Nano Banana', desc: 'Стандартная генерация' },
                                                        { id: 'nano-banana-pro', name: 'Banana Pro', desc: 'Максимальное качество и детализация' }
                                                    ].map(m => (
                                                        <div key={m.id} className="space-y-3">
                                                            <button
                                                                onClick={() => setModel(m.id)}
                                                                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${model === m.id ? 'border-[#6366f1] bg-[#6366f1]/5 ring-1 ring-[#6366f1]' : 'border-slate-100 hover:border-slate-300'}`}
                                                            >
                                                                <div>
                                                                    <p className={`font-bold ${model === m.id ? 'text-[#6366f1]' : 'text-slate-800'}`}>{m.name}</p>
                                                                    <p className="text-xs text-slate-500 font-medium">{m.desc}</p>
                                                                </div>
                                                                {model === m.id && <Sparkles size={18} className="text-[#6366f1]" />}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-10">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block">Соотношение сторон</label>
                                                <div className="flex bg-slate-50 p-1 rounded-2xl">
                                                    {['1:1', '16:9', '9:16'].map(r => (
                                                        <button
                                                            key={r}
                                                            onClick={() => setAspectRatio(r)}
                                                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${aspectRatio === r ? 'bg-white text-[#6366f1] shadow-sm' : 'text-slate-400'}`}
                                                        >
                                                            {r}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        /* Video Settings (Duration, Quality, Format, Audio) */
                                        <div className="space-y-6 mb-10">
                                            {videoModel === 'sora-2-pro' && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Длительность</label>
                                                        <div className="flex bg-slate-50 p-1 rounded-xl">
                                                            {[10, 15].map(d => (
                                                                <button
                                                                    key={d}
                                                                    onClick={() => setSoraDuration(d)}
                                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${soraDuration === d ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'}`}
                                                                >
                                                                    {d}с
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Качество</label>
                                                        <div className="flex bg-slate-50 p-1 rounded-xl">
                                                            {[
                                                                { id: 'standard', label: 'Std' },
                                                                { id: 'high', label: 'High' }
                                                            ].map(q => (
                                                                <button
                                                                    key={q.id}
                                                                    onClick={() => setSoraQuality(q.id)}
                                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${soraQuality === q.id ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'}`}
                                                                >
                                                                    {q.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {videoModel !== 'sora-2-pro' && (
                                                <div className="grid grid-cols-1 gap-4">
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
                                            )}

                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${audio ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                                                        {audio ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">Звук и речь</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">Русская озвучка, голоса и шумы</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setAudio(!audio)}
                                                    className={`w-12 h-6 rounded-full transition-all relative ${audio ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${audio ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between mb-6">
                                        <span className="text-xs font-bold text-indigo-600">Стоимость генерации:</span>
                                        <span className="text-sm font-black text-indigo-700">{activeTab === 'image' ? imageCost : videoCost} ₽</span>
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
                                                Сгенерировать за {activeTab === 'image' ? imageCost : videoCost}₽
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
                        {(activeTab === 'video' || activeTab === 'image') && (
                            <div className={`grid gap-4 ${videoModel.startsWith('veo') && activeTab === 'video' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {/* Slot 1: Start Frame / Reference */}
                                <section
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-3xl group hover:border-[#6366f1] transition-all cursor-pointer overflow-hidden relative"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => handleFileUpload(e, 'main')}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#6366f1] transition-all shadow-sm">
                                            {uploading ? <Loader2 size={20} className="animate-spin text-indigo-500" /> : <UploadIcon size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">
                                                {activeTab === 'image' ? 'Референс' : (videoModel.startsWith('veo') ? 'Старт' : 'Референс')}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                {uploading ? 'Загрузка...' : 'Нажмите для выбора'}
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="URL изображения..."
                                        className="w-full p-2 text-[10px] bg-white border border-slate-100 rounded-lg outline-none focus:border-indigo-300"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    {imageUrl && (
                                        <div className="mt-3 relative h-24 rounded-xl overflow-hidden border border-slate-200">
                                            <img src={imageUrl} alt="Ref" className="w-full h-full object-cover" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setImageUrl(''); }}
                                                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black"
                                            >
                                                <VolumeX size={10} />
                                            </button>
                                        </div>
                                    )}
                                </section>

                                {/* Slot 2: End Frame (Only for Veo) */}
                                {activeTab === 'video' && videoModel.startsWith('veo') && (
                                    <section
                                        onClick={() => endFileInputRef.current?.click()}
                                        className="bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-3xl group hover:border-[#6366f1] transition-all cursor-pointer overflow-hidden relative"
                                    >
                                        <input
                                            type="file"
                                            ref={endFileInputRef}
                                            onChange={(e) => handleFileUpload(e, 'end')}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#6366f1] transition-all shadow-sm">
                                                {uploadingEnd ? <Loader2 size={20} className="animate-spin text-indigo-500" /> : <UploadIcon size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">Финиш</p>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {uploadingEnd ? 'Загрузка...' : 'Конечный кадр'}
                                                </p>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={imageEndUrl}
                                            onChange={(e) => setImageEndUrl(e.target.value)}
                                            placeholder="URL изображения..."
                                            className="w-full p-2 text-[10px] bg-white border border-slate-100 rounded-lg outline-none focus:border-indigo-300"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        {imageEndUrl && (
                                            <div className="mt-3 relative h-24 rounded-xl overflow-hidden border border-slate-200">
                                                <img src={imageEndUrl} alt="EndRef" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setImageEndUrl(''); }}
                                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black"
                                                >
                                                    <VolumeX size={10} />
                                                </button>
                                            </div>
                                        )}
                                    </section>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Preview Area & Queue */}
                    <div className="lg:col-span-6">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl h-full min-h-[600px] flex flex-col overflow-hidden sticky top-32">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Генерации</span>
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase">Очередь и результат</span>
                                </div>
                                {result && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator.share({ title: 'AI Asol Creation', url: result.url });
                                                }
                                            }}
                                            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-all"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(result.url);
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = `asol-${Date.now()}.${result.type === 'video' ? 'mp4' : 'png'}`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    window.URL.revokeObjectURL(url);
                                                } catch (err) {
                                                    window.open(result.url, '_blank');
                                                }
                                            }}
                                            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-all"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                {/* Active Tasks (Queue) */}
                                {tasks.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <AnimatePresence>
                                            {tasks.map((task) => (
                                                <motion.div
                                                    key={task.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    onClick={() => {
                                                        if (task.status === 'success') {
                                                            setResult({ url: task.url, type: task.type, prompt: task.prompt });
                                                        }
                                                    }}
                                                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${task.status === 'success'
                                                        ? (result?.url === task.url ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-white border-slate-100 shadow-sm hover:border-indigo-300')
                                                        : task.status === 'failed' ? 'bg-red-50/50 border-red-100' : 'bg-white/80 border-slate-100 border-dashed animate-pulse'
                                                        }`}
                                                >
                                                    <div className="flex flex-col h-full gap-2">
                                                        <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                                                            {task.status === 'success' ? (
                                                                task.type === 'video' ? (
                                                                    <video
                                                                        src={task.url}
                                                                        className="w-full h-full object-cover"
                                                                        preload="metadata"
                                                                        onMouseOver={(e) => e.target.play()}
                                                                        onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                                                                        muted
                                                                    />
                                                                ) : (
                                                                    <img src={task.url} alt="" className="w-full h-full object-cover" />
                                                                )
                                                            ) : task.status === 'failed' ? (
                                                                <AlertCircle className="text-red-400" size={24} />
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <Loader2 className="animate-spin text-indigo-500" size={20} />
                                                                    <span className="text-[8px] font-black text-slate-400 uppercase">Готовим...</span>
                                                                </div>
                                                            )}

                                                            {task.status === 'success' && (
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                                                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100" size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <span className="text-[8px] font-black text-indigo-500 uppercase">{task.type === 'video' ? 'Видео' : 'Фото'}</span>
                                                                {task.status === 'processing' && (
                                                                    <span className="text-[8px] font-bold text-amber-500 animate-pulse">В процессе</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] font-bold text-slate-700 truncate">{task.prompt}</p>
                                                            {task.status === 'failed' && (
                                                                <p className="text-[8px] font-medium text-red-500 truncate mt-0.5">{task.error || 'Ошибка'}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Progress bar overlay for processing */}
                                                    {task.status === 'processing' && (
                                                        <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-500 animate-progress transition-all" style={{ width: '100%' }} />
                                                    )}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Main Preview */}
                                <AnimatePresence mode="wait">
                                    {result ? (
                                        <motion.div
                                            key="result-player"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xl"
                                        >
                                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner group">
                                                {result.type === 'video' ? (
                                                    <video
                                                        key={result.url}
                                                        src={result.url}
                                                        controls
                                                        autoPlay
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <img src={result.url} alt="Preview" className="w-full h-full object-contain" />
                                                )}
                                                <button
                                                    onClick={() => window.open(result.url, '_blank')}
                                                    className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-xl backdrop-blur-md transition-all scale-0 group-hover:scale-100"
                                                >
                                                    <Maximize2 size={16} />
                                                </button>
                                            </div>
                                            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2">
                                                    <Wand2 size={12} /> Запрос
                                                </p>
                                                <p className="text-sm font-medium text-slate-700 italic">"{result.prompt}"</p>
                                            </div>
                                        </motion.div>
                                    ) : tasks.length === 0 && (
                                        <motion.div
                                            key="empty-state"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="h-full flex flex-col items-center justify-center p-10 text-center"
                                        >
                                            <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-slate-200 mb-6 border border-slate-50">
                                                <Video size={32} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-800 mb-2">Начните создание</h3>
                                            <p className="text-slate-400 text-sm font-medium">Ваши генерации появятся здесь. Можно запускать до 6 штук одновременно и переключаться между ними.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
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
        </>
    );
};

export default Editor;
