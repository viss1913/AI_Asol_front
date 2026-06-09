import { useState, useEffect, useRef } from 'react';
import { presentationService, contentService } from '../services/api';
import { useUser } from '../context/UserContext';
import { getProxyUrl } from '../utils/proxyUtils';
import {
    Plus, Send, Loader2, Trash2, Presentation, ChevronLeft, ChevronRight,
    Download, Sparkles, Bot, User, ArrowLeft, FileText, Paperclip, ImagePlus, X
} from 'lucide-react';
import avatarBase from '../assets/avatar.png';

const STYLES = [
    { id: 'corporate', label: 'Корпоративный' },
    { id: 'creative', label: 'Креативный' },
    { id: 'minimal', label: 'Минимализм' },
    { id: 'dark', label: 'Тёмный' },
];

const Presentations = () => {
    const { refreshProfile } = useUser();
    const [list, setList] = useState([]);
    const [current, setCurrent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [slides, setSlides] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingList, setLoadingList] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [activeSlideIdx, setActiveSlideIdx] = useState(0);
    const [estimate, setEstimate] = useState(null);
    const [readyToGenerate, setReadyToGenerate] = useState(false);
    const messagesEndRef = useRef(null);
    const pollRef = useRef(null);
    const chatFileInputRef = useRef(null);
    const slideFileInputRef = useRef(null);
    const [chatFiles, setChatFiles] = useState([]);
    const [uploadingRef, setUploadingRef] = useState(false);

    const getSlideRefs = (slide) => {
        if (!slide?.referenceImageUrls) return [];
        return Array.isArray(slide.referenceImageUrls) ? slide.referenceImageUrls : [];
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        loadList();
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    useEffect(() => {
        if (current?.id) {
            presentationService.estimateCost(current.id).then(setEstimate).catch(() => {});
        }
    }, [current?.id, slides.length]);

    const loadList = async () => {
        setLoadingList(true);
        try {
            const data = await presentationService.list();
            setList(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingList(false);
        }
    };

    const openPresentation = async (id) => {
        try {
            const data = await presentationService.getById(id);
            setCurrent(data);
            setMessages(data.messages || []);
            setSlides(data.slides || []);
            setActiveSlideIdx(0);
            setReadyToGenerate(data.status === 'ready');
            if (data.status === 'generating') startPolling(id);
        } catch (e) {
            alert('Не удалось загрузить презентацию');
        }
    };

    const handleNew = async () => {
        try {
            const data = await presentationService.create();
            await loadList();
            openPresentation(data.id);
        } catch (e) {
            alert(e.response?.data?.error || 'Ошибка создания');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Удалить презентацию?')) return;
        try {
            await presentationService.delete(id);
            if (current?.id === id) {
                setCurrent(null);
                setMessages([]);
                setSlides([]);
            }
            loadList();
        } catch (e) {
            alert('Ошибка удаления');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!input.trim() && !chatFiles.length) || loading || !current) return;

        const userMsg = {
            role: 'user',
            content: input || (chatFiles.length ? '📎 Прикреплены изображения' : ''),
            imageUrls: chatFiles.map((f) => f.name),
        };
        setMessages((prev) => [...prev, userMsg]);
        const msg = input;
        const filesToSend = [...chatFiles];
        setInput('');
        setChatFiles([]);
        setLoading(true);

        try {
            const data = await presentationService.sendChat(current.id, msg, filesToSend);
            setMessages((prev) => [...prev, { role: 'assistant', content: data.message, cost: data.cost }]);
            if (data.presentation) {
                setCurrent(data.presentation);
                setSlides(data.presentation.slides || []);
            }
            setReadyToGenerate(data.readyToGenerate);
            refreshProfile();
        } catch (err) {
            setMessages((prev) => [...prev, {
                role: 'assistant',
                content: err.response?.data?.error || 'Ошибка. Попробуй ещё раз.',
            }]);
        } finally {
            setLoading(false);
        }
    };

    const startPolling = (id) => {
        if (pollRef.current) clearInterval(pollRef.current);
        setGenerating(true);
        pollRef.current = setInterval(async () => {
            try {
                const status = await presentationService.getStatus(id);
                setSlides(status.slides || []);
                if (status.status === 'completed' || status.status === 'failed') {
                    clearInterval(pollRef.current);
                    setGenerating(false);
                    const full = await presentationService.getById(id);
                    setCurrent(full);
                    refreshProfile();
                }
            } catch (e) { /* ignore */ }
        }, 3000);
    };

    const handleGenerate = async () => {
        if (!current || generating) return;
        if (!confirm(`Сгенерировать ${slides.length} слайдов за ~${estimate?.totalCost || '?'} ₽?`)) return;
        try {
            await presentationService.generate(current.id);
            setGenerating(true);
            startPolling(current.id);
        } catch (err) {
            alert(err.response?.data?.error || 'Ошибка генерации');
        }
    };

    const handleExportPdf = async () => {
        if (!current || exporting) return;
        setExporting(true);
        try {
            const data = await presentationService.exportPdf(current.id);
            window.open(getProxyUrl(data.pdfUrl), '_blank');
        } catch (err) {
            alert(err.response?.data?.error || 'Ошибка экспорта PDF');
        } finally {
            setExporting(false);
        }
    };

    const updateSlideField = (idx, field, value) => {
        setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
    };

    const saveSlides = async (slidesToSave = slides) => {
        if (!current) return;
        try {
            const data = await presentationService.updateSlides(current.id, slidesToSave);
            setSlides(data.slides || []);
        } catch (e) {
            alert('Ошибка сохранения');
        }
    };

    const handleSlideRefUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length || !activeSlide) return;
        setUploadingRef(true);
        try {
            const urls = [];
            for (const file of files.slice(0, 3)) {
                const res = await contentService.uploadFile(file);
                if (res?.url) urls.push(res.url);
            }
            const merged = [...getSlideRefs(activeSlide), ...urls].slice(0, 5);
            const newSlides = slides.map((s, i) =>
                i === activeSlideIdx ? { ...s, referenceImageUrls: merged } : s
            );
            setSlides(newSlides);
            await saveSlides(newSlides);
        } catch (err) {
            alert('Не удалось загрузить изображение');
        } finally {
            setUploadingRef(false);
            if (slideFileInputRef.current) slideFileInputRef.current.value = '';
        }
    };

    const removeSlideRef = async (urlIdx) => {
        const refs = getSlideRefs(activeSlide).filter((_, i) => i !== urlIdx);
        const newSlides = slides.map((s, i) =>
            i === activeSlideIdx ? { ...s, referenceImageUrls: refs.length ? refs : null } : s
        );
        setSlides(newSlides);
        await saveSlides(newSlides);
    };

    const activeSlide = slides[activeSlideIdx];

    // List view
    if (!current) {
        return (
            <div className="min-h-screen bg-slate-50 pt-20 px-4 md:px-8 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">Презентации</h1>
                            <p className="text-slate-500 mt-1">Создавай слайды с ИИ и экспортируй в PDF</p>
                        </div>
                        <button
                            onClick={handleNew}
                            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            <Plus size={18} />
                            Новая
                        </button>
                    </div>

                    {loadingList ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                        </div>
                    ) : list.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <Presentation size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">Презентаций пока нет</p>
                            <button onClick={handleNew} className="mt-4 text-indigo-600 font-bold hover:underline">
                                Создать первую
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {list.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => openPresentation(p.id)}
                                    className="w-full text-left p-5 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                        <Presentation size={22} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 truncate">{p.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {p._count?.slides || p.slides?.length || 0} слайдов · {p.status}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, p.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Editor split-view
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden pt-16">
            {/* Left: Chat */}
            <div className="w-full lg:w-[42%] flex flex-col border-r border-slate-200 bg-white">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <button onClick={() => setCurrent(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                        <ArrowLeft size={18} />
                    </button>
                    <img src={avatarBase} alt="Asol" className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                        <p className="font-bold text-slate-900 text-sm">Асоль · Планирование</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Режим структуры</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <Bot size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">Расскажи, какую презентацию делаем?</p>
                            <p className="text-xs mt-1">Можешь прикрепить картинки — привяжу к слайдам. GPT Image 2 сделает слайд с текстом</p>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-200' : 'bg-indigo-50'}`}>
                                {m.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-indigo-500" />}
                            </div>
                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}>
                                {m.content}
                                {m.imageUrls?.length > 0 && (
                                    <p className="text-[10px] mt-1 opacity-70">📎 {m.imageUrls.length} изображений</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Loader2 size={14} className="animate-spin text-indigo-500" />
                            </div>
                            <div className="px-4 py-3 bg-slate-50 rounded-2xl text-sm text-slate-400">Думаю...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-slate-100">
                    {chatFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {chatFiles.map((f, i) => (
                                <span key={i} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">
                                    <ImagePlus size={12} />
                                    {f.name.slice(0, 20)}
                                    <button type="button" onClick={() => setChatFiles((prev) => prev.filter((_, j) => j !== i))}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={chatFileInputRef}
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(e) => {
                                const picked = Array.from(e.target.files || []);
                                setChatFiles((prev) => [...prev, ...picked].slice(0, 5));
                                e.target.value = '';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => chatFileInputRef.current?.click()}
                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                            title="Прикрепить картинки"
                        >
                            <Paperclip size={18} />
                        </button>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Опиши презентацию или «эту картинку на слайд 2»..."
                            className="flex-1 px-4 py-3 bg-slate-50 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || (!input.trim() && !chatFiles.length)}
                            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Right: Structure + Preview */}
            <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
                    <div>
                        <input
                            value={current.title || ''}
                            onChange={(e) => setCurrent({ ...current, title: e.target.value })}
                            onBlur={() => presentationService.update(current.id, { title: current.title })}
                            className="text-lg font-black text-slate-900 bg-transparent border-none focus:outline-none"
                        />
                        <p className="text-xs text-slate-400">
                            {slides.length} слайдов · GPT Image 2 с текстом · {current.status}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {estimate && (
                            <span className="text-xs text-slate-500 font-medium mr-2">
                                ~{estimate.totalCost} ₽
                            </span>
                        )}
                        <button
                            onClick={handleGenerate}
                            disabled={generating || !slides.length}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 transition-all"
                        >
                            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {generating ? 'Генерация...' : 'Сгенерировать'}
                        </button>
                        <button
                            onClick={handleExportPdf}
                            disabled={exporting || !slides.some((s) => s.imageUrl)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-40 transition-all"
                        >
                            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            PDF
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Slide list */}
                    <div className="w-64 border-r border-slate-200 overflow-y-auto bg-slate-50 p-3 space-y-2">
                        {slides.map((slide, idx) => (
                            <button
                                key={slide.id || idx}
                                onClick={() => setActiveSlideIdx(idx)}
                                className={`w-full text-left p-3 rounded-xl text-sm transition-all ${activeSlideIdx === idx ? 'bg-white shadow-md border border-indigo-200' : 'hover:bg-white border border-transparent'}`}
                            >
                                <p className="font-bold text-slate-800 truncate">{slide.title || `Слайд ${idx + 1}`}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                                    {slide.status || 'pending'}
                                    {getSlideRefs(slide).length > 0 && ' · 📎'}
                                </p>
                            </button>
                        ))}
                        {slides.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-8">Структура появится после чата</p>
                        )}
                    </div>

                    {/* Preview + edit */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {activeSlide ? (
                            <>
                                <div className="flex-1 p-6 flex items-center justify-center bg-slate-100">
                                    <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-slate-800">
                                        {activeSlide.imageUrl ? (
                                            <img
                                                src={getProxyUrl(activeSlide.imageUrl)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                                                <FileText size={48} className="text-slate-500" />
                                            </div>
                                        )}
                                        {current.mode !== 'full_image' && (activeSlide.title || activeSlide.content) && (
                                            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent">
                                                {activeSlide.title && (
                                                    <h3 className="text-white font-black text-xl md:text-2xl mb-2">{activeSlide.title}</h3>
                                                )}
                                                {activeSlide.content && (
                                                    <p className="text-white/90 text-sm whitespace-pre-line">{activeSlide.content}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-white border-t border-slate-200 space-y-3 max-h-48 overflow-y-auto">
                                    <input
                                        value={activeSlide.title || ''}
                                        onChange={(e) => updateSlideField(activeSlideIdx, 'title', e.target.value)}
                                        onBlur={saveSlides}
                                        placeholder="Заголовок слайда"
                                        className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <textarea
                                        value={activeSlide.content || ''}
                                        onChange={(e) => updateSlideField(activeSlideIdx, 'content', e.target.value)}
                                        onBlur={saveSlides}
                                        placeholder="Содержание"
                                        rows={2}
                                        className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                                    />
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                            Референс-картинки (GPT Image 2 image-to-image)
                                        </label>
                                        <input
                                            type="file"
                                            ref={slideFileInputRef}
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/webp"
                                            multiple
                                            onChange={handleSlideRefUpload}
                                        />
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {getSlideRefs(activeSlide).map((url, ri) => (
                                                <div key={ri} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                                                    <img src={getProxyUrl(url)} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSlideRef(ri)}
                                                        className="absolute top-0 right-0 p-0.5 bg-black/60 text-white rounded-bl"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                disabled={uploadingRef}
                                                onClick={() => slideFileInputRef.current?.click()}
                                                className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all"
                                            >
                                                {uploadingRef ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                            Промпт генерации (текст + расположение + стиль)
                                        </label>
                                        <textarea
                                            value={activeSlide.imagePrompt || ''}
                                            onChange={(e) => updateSlideField(activeSlideIdx, 'imagePrompt', e.target.value)}
                                            onBlur={saveSlides}
                                            placeholder="English: layout, exact text to render, colors, style. GPT Image 2 нарисует весь слайд с текстом."
                                            rows={3}
                                            className="w-full px-3 py-2 bg-slate-50 rounded-lg text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none text-slate-600"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-4 py-2 bg-white border-t border-slate-100">
                                    <button
                                        onClick={() => setActiveSlideIdx((i) => Math.max(0, i - 1))}
                                        disabled={activeSlideIdx === 0}
                                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="text-xs font-bold text-slate-400">{activeSlideIdx + 1} / {slides.length}</span>
                                    <button
                                        onClick={() => setActiveSlideIdx((i) => Math.min(slides.length - 1, i + 1))}
                                        disabled={activeSlideIdx >= slides.length - 1}
                                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400">
                                <p className="text-sm">Начни чат — структура появится здесь</p>
                            </div>
                        )}
                    </div>
                </div>

                {readyToGenerate && !generating && (
                    <div className="px-6 py-2 bg-emerald-50 border-t border-emerald-100 text-center">
                        <p className="text-xs font-bold text-emerald-700">Структура готова — можно генерировать слайды</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Presentations;
