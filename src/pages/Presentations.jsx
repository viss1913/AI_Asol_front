import { useState, useEffect, useRef } from 'react';
import { presentationService, contentService } from '../services/api';
import { useUser } from '../context/UserContext';
import { getProxyUrl } from '../utils/proxyUtils';
import {
    Plus, Send, Loader2, Trash2, Presentation, ChevronLeft, ChevronRight,
    Download, Sparkles, Bot, User, ArrowLeft, FileText, Paperclip, ImagePlus, X,
    Copy, CheckCircle2
} from 'lucide-react';
import avatarBase from '../assets/avatar.png';

const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/gi;

const extractUrls = (text) => {
    if (!text) return [];
    const matches = text.match(URL_REGEX) || [];
    return [...new Set(matches.map((u) => u.replace(/[.,;:!?)]+$/, '')))];
};

const stripServiceContent = (content) => {
    if (!content) return '';
    return content
        .replace(/\n\n\[Прикреплённые[\s\S]*$/, '')
        .replace(/\n\n\[Контент со страницы[\s\S]*$/, '')
        .replace(/\n\n\[Контент из документа[\s\S]*$/, '')
        .trim();
};

const STATUS_LABELS = {
    draft: 'Черновик',
    text_approved: 'Текст утверждён',
    ready: 'Готово',
    generating: 'Генерация',
    completed: 'Завершено',
    failed: 'Ошибка',
};

const CAN_GENERATE_STATUSES = ['text_approved', 'ready', 'completed'];

const SLIDE_TYPES = [
    { id: 'title', label: 'Титульный' },
    { id: 'content', label: 'Контент' },
    { id: 'section', label: 'Секция' },
    { id: 'closing', label: 'Финал' },
];

const SLIDE_STATUS_LABELS = {
    pending: 'Ожидает',
    generating: 'Рисуем...',
    done: 'Готово',
    failed: 'Ошибка',
};

const SlideTextMockup = ({ slide, styleId = 'mckinsey' }) => {
    const isDark = styleId === 'dark_tech';
    const bg = isDark ? '#1a1a2e' : '#ffffff';
    const titleColor = isDark ? '#ffffff' : '#051C2C';
    const bodyColor = isDark ? '#cbd5e1' : '#334155';
    const isTitle = slide.type === 'title' || slide.type === 'section' || slide.type === 'closing';

    return (
        <div
            className="w-full h-full p-6 sm:p-8 flex flex-col overflow-hidden text-left"
            style={{ background: bg }}
        >
            <div className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                Превью текста
            </div>
            {slide.title && (
                <h3
                    className={`font-black leading-tight mb-3 ${isTitle ? 'text-2xl sm:text-3xl flex-1 flex items-center justify-center text-center' : 'text-lg sm:text-xl'}`}
                    style={{ color: titleColor }}
                >
                    {slide.title}
                </h3>
            )}
            {slide.content && (
                <div
                    className={`text-sm sm:text-base whitespace-pre-line leading-relaxed ${isTitle ? 'text-center' : ''}`}
                    style={{ color: bodyColor }}
                >
                    {slide.content}
                </div>
            )}
            {!slide.title && !slide.content && (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                    Текст слайда появится после чата с Асоль
                </div>
            )}
        </div>
    );
};

const DEFAULT_STYLES = [
    { id: 'mckinsey', label: 'McKinsey' },
    { id: 'bcg', label: 'BCG / Big 3' },
    { id: 'apple', label: 'Apple Keynote' },
    { id: 'startup', label: 'Стартап / Pitch' },
    { id: 'dark_tech', label: 'Dark Tech' },
    { id: 'minimal', label: 'Минимализм' },
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
    const chatPreviewUrlsRef = useRef([]);
    const [uploadingRef, setUploadingRef] = useState(false);
    const [stylePresets, setStylePresets] = useState(DEFAULT_STYLES);
    const [regeneratingSlide, setRegeneratingSlide] = useState(false);
    const [mobileTab, setMobileTab] = useState('chat');
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [exportingPptx, setExportingPptx] = useState(false);
    const slidePollRef = useRef(null);

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
        presentationService.listStyles().then(setStylePresets).catch(() => {});
        presentationService.listTemplates().then(setTemplates).catch(() => {});
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            if (slidePollRef.current) clearInterval(slidePollRef.current);
            chatPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const addChatFiles = (files) => {
        const picked = Array.from(files || []);
        if (!picked.length) return;
        const items = picked.map((file) => {
            if (file.type.startsWith('image/')) {
                const preview = URL.createObjectURL(file);
                chatPreviewUrlsRef.current.push(preview);
                return { file, preview, kind: 'image' };
            }
            return { file, kind: 'doc', name: file.name };
        });
        setChatFiles((prev) => [...prev, ...items].slice(0, 8));
    };

    const removeChatFile = (idx) => {
        setChatFiles((prev) => {
            const removed = prev[idx];
            if (removed?.preview) {
                URL.revokeObjectURL(removed.preview);
                chatPreviewUrlsRef.current = chatPreviewUrlsRef.current.filter((u) => u !== removed.preview);
            }
            return prev.filter((_, i) => i !== idx);
        });
    };

    const clearChatFiles = () => {
        chatFiles.forEach((item) => {
            if (item.preview) URL.revokeObjectURL(item.preview);
        });
        chatPreviewUrlsRef.current = [];
        setChatFiles([]);
    };

    useEffect(() => {
        if (current?.id) {
            const hasDone = slides.some((s) => s.status === 'done');
            const force = hasDone && slides.some((s) => s.status === 'pending' || s.status === 'failed');
            presentationService.estimateCost(current.id, false).then(setEstimate).catch(() => {});
        }
    }, [current?.id, slides.length, slides.map((s) => s.status).join(',')]);

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
            setMessages((data.messages || []).map((m) => ({
                ...m,
                sourcePages: m.sourcePages || undefined,
            })));
            setSlides(data.slides || []);
            setActiveSlideIdx(0);
            setReadyToGenerate(data.status === 'ready' || data.status === 'text_approved');
            if (data.status === 'generating') startPolling(id);
        } catch (e) {
            alert('Не удалось загрузить презентацию');
        }
    };

    const handleNew = async () => {
        try {
            const data = await presentationService.create(
                selectedTemplate ? { templateId: selectedTemplate } : {}
            );
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

        const msg = input;
        const detectedUrls = extractUrls(msg);
        const userMsg = {
            role: 'user',
            content: input || (chatFiles.length ? 'Референс для слайдов' : ''),
            imagePreviews: chatFiles.map((f) => f.preview),
            linkUrls: detectedUrls,
        };
        setMessages((prev) => [...prev, userMsg]);
        const filesToSend = chatFiles.map((f) => f.file);
        setInput('');
        clearChatFiles();
        setLoading(true);

        try {
            const data = await presentationService.sendChat(current.id, msg, filesToSend);
            setMessages((prev) => [...prev, {
                role: 'assistant',
                content: data.message,
                cost: data.cost,
                sourcePages: data.sourcePages,
            }]);
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

    const handleStyleChange = async (styleId) => {
        if (!current) return;
        setCurrent({ ...current, style: styleId });
        try {
            const data = await presentationService.update(current.id, { style: styleId });
            setCurrent(data);
        } catch (e) {
            alert('Не удалось сменить стиль');
        }
    };

    const pollSingleSlide = (id, slideId) => {
        if (slidePollRef.current) clearInterval(slidePollRef.current);
        slidePollRef.current = setInterval(async () => {
            try {
                const status = await presentationService.getStatus(id);
                setSlides(status.slides || []);
                const slide = status.slides?.find((s) => s.id === slideId);
                if (slide && slide.status !== 'generating') {
                    clearInterval(slidePollRef.current);
                    setRegeneratingSlide(false);
                    refreshProfile();
                }
            } catch { /* ignore */ }
        }, 2000);
    };

    const runSlideGeneration = async (label) => {
        if (!current || !activeSlide?.id || regeneratingSlide) return;
        const cost = estimate?.costPerSlide || '?';
        if (!confirm(`${label} за ~${cost} ₽?`)) return;
        setRegeneratingSlide(true);
        try {
            await presentationService.generateSlide(current.id, activeSlide.id);
            pollSingleSlide(current.id, activeSlide.id);
        } catch (err) {
            alert(err.response?.data?.error || 'Ошибка генерации слайда');
            setRegeneratingSlide(false);
        }
    };

    const handlePreviewSlide = () => runSlideGeneration('Пробный слайд');
    const handleRegenerateSlide = () => runSlideGeneration('Перегенерировать слайд');

    const handleApproveText = async () => {
        if (!current) return;
        try {
            const data = await presentationService.approveText(current.id);
            setCurrent(data);
            setReadyToGenerate(true);
        } catch (err) {
            alert(err.response?.data?.error || 'Ошибка утверждения');
        }
    };

    const handlePresentationField = async (field, value) => {
        if (!current) return;
        setCurrent({ ...current, [field]: value });
        try {
            const data = await presentationService.update(current.id, { [field]: value });
            setCurrent(data);
            if (field === 'resolution') {
                presentationService.estimateCost(current.id).then(setEstimate).catch(() => {});
            }
        } catch {
            alert('Не удалось сохранить');
        }
    };

    const handleBrandLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !current) return;
        try {
            const res = await contentService.uploadFile(file);
            if (res?.url) await handlePresentationField('brandLogoUrl', res.url);
        } catch {
            alert('Не удалось загрузить лого');
        }
        e.target.value = '';
    };

    const slidesDoneCount = slides.filter((s) => s.status === 'done').length;
    const slidesPendingCount = slides.filter((s) => s.status === 'pending' || s.status === 'failed').length;
    const canGenerate = current && CAN_GENERATE_STATUSES.includes(current.status);
    const canApproveText = current && ['draft', 'failed'].includes(current.status) && slides.length > 0;

    const handleGenerate = async () => {
        if (!current || generating) return;
        if (!CAN_GENERATE_STATUSES.includes(current.status)) {
            alert('Сначала утверди текст презентации');
            return;
        }
        let force = false;
        let count = estimate?.pendingSlides ?? 0;
        let totalCost = estimate?.totalCost;
        if (count === 0 && slides.length > 0) {
            if (!confirm('Все слайды уже готовы. Перегенерировать всю колоду заново?')) return;
            force = true;
            const est = await presentationService.estimateCost(current.id, true);
            count = est.pendingSlides;
            totalCost = est.totalCost;
        }
        if (!count) {
            alert('Нет слайдов для генерации');
            return;
        }
        const countLabel = count === 1 ? '1 новый слайд' : `${count} слайдов`;
        const doneNote = slidesDoneCount > 0 && count < slides.length
            ? ` (${slidesDoneCount} уже готовы — трогать не будем)`
            : '';
        if (!confirm(`Сгенерировать ${countLabel} за ~${totalCost || '?'} ₽?${doneNote}`)) return;
        try {
            await presentationService.generate(current.id, force);
            setGenerating(true);
            startPolling(current.id);
        } catch (err) {
            alert(err.response?.data?.error || 'Ошибка генерации');
        }
    };

    const handleAddSlide = async () => {
        if (!current) return;
        try {
            const data = await presentationService.addSlide(current.id);
            setSlides(data.presentation?.slides || []);
            setActiveSlideIdx((data.presentation?.slides?.length || 1) - 1);
        } catch {
            alert('Не удалось добавить слайд');
        }
    };

    const handleDeleteSlide = async () => {
        if (!current || !activeSlide?.id) return;
        if (!confirm('Удалить слайд?')) return;
        try {
            const data = await presentationService.deleteSlide(current.id, activeSlide.id);
            setSlides(data.slides || []);
            setActiveSlideIdx(0);
        } catch {
            alert('Не удалось удалить');
        }
    };

    const handleDuplicateSlide = async () => {
        if (!activeSlide) return;
        const copy = {
            ...activeSlide,
            id: undefined,
            order: slides.length + 1,
            imageUrl: null,
            status: 'pending',
            taskId: null,
        };
        const newSlides = [...slides, copy].map((s, i) => ({ ...s, order: i + 1 }));
        await saveSlides(newSlides);
        setActiveSlideIdx(newSlides.length - 1);
    };

    const moveSlide = async (direction) => {
        const idx = activeSlideIdx;
        const target = idx + direction;
        if (target < 0 || target >= slides.length) return;
        const reordered = [...slides];
        [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
        const normalized = reordered.map((s, i) => ({ ...s, order: i + 1 }));
        setSlides(normalized);
        setActiveSlideIdx(target);
        await saveSlides(normalized);
    };

    const handleRestoreImage = async (historyIndex = 0) => {
        if (!current || !activeSlide?.id) return;
        try {
            const data = await presentationService.restoreSlideImage(current.id, activeSlide.id, historyIndex);
            setSlides(data.slides || []);
        } catch (err) {
            alert(err.response?.data?.error || 'Не удалось откатить');
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

    const handleExportPptx = async () => {
        if (!current || exportingPptx) return;
        setExportingPptx(true);
        try {
            const data = await presentationService.exportPptx(current.id);
            window.open(getProxyUrl(data.pptxUrl), '_blank');
        } catch (err) {
            alert(err.response?.data?.error || 'Ошибка экспорта PPTX');
        } finally {
            setExportingPptx(false);
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
            for (const file of files.slice(0, 8)) {
                const res = await contentService.uploadFile(file);
                if (res?.url) urls.push(res.url);
            }
            const merged = [...getSlideRefs(activeSlide), ...urls].slice(0, 16);
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

    const handleUseSlideImageAsRef = async () => {
        if (!activeSlide?.imageUrl) return;
        const refs = getSlideRefs(activeSlide);
        if (refs.includes(activeSlide.imageUrl)) return;
        const merged = [activeSlide.imageUrl, ...refs].slice(0, 16);
        const newSlides = slides.map((s, i) =>
            i === activeSlideIdx ? { ...s, referenceImageUrls: merged } : s
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
                        <div className="flex items-center gap-2">
                            {templates.length > 0 && (
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white"
                                >
                                    <option value="">Без шаблона</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            )}
                            <button
                                onClick={handleNew}
                                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                                <Plus size={18} />
                                Новая
                            </button>
                        </div>
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
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden pt-16">
            <div className="lg:hidden flex border-b border-slate-200 bg-white">
                <button
                    type="button"
                    onClick={() => setMobileTab('chat')}
                    className={`flex-1 py-3 text-sm font-bold ${mobileTab === 'chat' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
                >
                    Чат
                </button>
                <button
                    type="button"
                    onClick={() => setMobileTab('slides')}
                    className={`flex-1 py-3 text-sm font-bold ${mobileTab === 'slides' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
                >
                    Слайды
                </button>
            </div>
            <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left: Chat */}
            <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[36%] xl:w-[32%] flex-col border-r border-slate-200 bg-white`}>
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
                            <p className="text-xs mt-1">Вставь ссылку на сайт — подтяну текст. Или прикрепи картинку-референс скрепкой</p>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-200' : 'bg-indigo-50'}`}>
                                {m.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-indigo-500" />}
                            </div>
                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}>
                                {stripServiceContent(m.content) && (
                                    <p className="whitespace-pre-wrap">{stripServiceContent(m.content)}</p>
                                )}
                                {m.linkUrls?.length > 0 && (
                                    <div className={`flex flex-wrap gap-1.5 ${stripServiceContent(m.content) ? 'mt-2 pt-2 border-t border-white/10' : ''}`}>
                                        {m.linkUrls.map((url, li) => (
                                            <span key={li} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/10 text-indigo-200">
                                                🔗 {(() => { try { return new URL(url).hostname; } catch { return 'ссылка'; } })()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {(m.imagePreviews?.length > 0 || m.imageUrls?.length > 0) && (
                                    <div className={`flex flex-wrap gap-1.5 mt-2 ${(stripServiceContent(m.content) || m.linkUrls?.length) ? 'pt-2 border-t border-white/10' : ''}`}>
                                        {(m.imagePreviews || m.imageUrls).map((src, pi) => (
                                            <img
                                                key={pi}
                                                src={m.imagePreviews ? src : getProxyUrl(src)}
                                                alt=""
                                                className="w-14 h-14 rounded-lg object-cover border border-white/20"
                                            />
                                        ))}
                                    </div>
                                )}
                                {m.sourcePages?.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-slate-200 space-y-2">
                                        {m.sourcePages.map((page, pi) => (
                                            <div key={pi} className="flex gap-2 items-start p-2 bg-white rounded-lg border border-slate-100">
                                                {page.ogImageUrl && (
                                                    <img
                                                        src={getProxyUrl(page.ogImageUrl)}
                                                        alt=""
                                                        className="w-10 h-10 rounded object-cover shrink-0"
                                                    />
                                                )}
                                                <div className="min-w-0">
                                                    {page.error ? (
                                                        <p className="text-xs text-red-500">Не удалось открыть: {page.url}</p>
                                                    ) : (
                                                        <>
                                                            <p className="text-xs font-bold text-slate-700 truncate">
                                                                {page.title || page.url}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">
                                                                {page.charCount?.toLocaleString('ru-RU')} символов · {(() => { try { return new URL(page.url).hostname; } catch { return page.url; } })()}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <Loader2 size={14} className="animate-spin text-indigo-500" />
                            </div>
                            <div className="px-4 py-3 bg-slate-50 rounded-2xl text-sm text-slate-400">
                                {messages[messages.length - 1]?.linkUrls?.length ? 'Подтягиваю страницу...' : 'Думаю...'}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form
                    onSubmit={handleSend}
                    className="p-4 border-t border-slate-100"
                    onPaste={(e) => {
                        const images = Array.from(e.clipboardData?.items || [])
                            .filter((item) => item.type.startsWith('image/'))
                            .map((item) => item.getAsFile())
                            .filter(Boolean);
                        if (images.length) {
                            e.preventDefault();
                            addChatFiles(images);
                        }
                    }}
                >
                    {chatFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                            {chatFiles.map((item, i) => (
                                <div key={i} className="relative rounded-lg overflow-hidden border-2 border-indigo-200 shadow-sm">
                                    {item.kind === 'image' ? (
                                        <div className="w-16 h-16">
                                            <img src={item.preview} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="px-2 py-1 text-[10px] font-bold text-indigo-700 max-w-[100px] truncate">
                                            <FileText size={12} className="inline mr-1" />
                                            {item.name}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeChatFile(i)}
                                        className="absolute top-0 right-0 p-0.5 bg-black/60 text-white rounded-bl"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <p className="w-full text-[10px] text-slate-400 font-medium">
                                {chatFiles.length}/8 · можно несколько: «картинка 1 — аватар, картинка 2 — на экран»
                            </p>
                        </div>
                    )}
                    <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Текст, ссылка на сайт или «эту картинку на слайд 2»..."
                                className="w-full pl-4 pr-11 py-3 bg-slate-50 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                disabled={loading}
                            />
                            <input
                                type="file"
                                ref={chatFileInputRef}
                                className="hidden"
                                accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx"
                                multiple
                                onChange={(e) => {
                                    addChatFiles(e.target.files);
                                    e.target.value = '';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => chatFileInputRef.current?.click()}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                                    chatFiles.length
                                        ? 'text-indigo-600 bg-indigo-50'
                                        : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                                }`}
                                title="Прикрепить референс (jpg, png, webp)"
                            >
                                <Paperclip size={18} />
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || (!input.trim() && !chatFiles.length)}
                            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all shrink-0"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                        Готовые слайды не сбросятся · «добавь 4-й» или «поправь слайд 2» · Ctrl+V для фото
                    </p>
                </form>
            </div>

            {/* Right: Structure + Preview */}
            <div className={`${mobileTab === 'slides' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col overflow-hidden min-w-0`}>
                {/* Шапка — 2 ряда, читаемо */}
                <div className="shrink-0 border-b border-slate-200 bg-white">
                    <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100">
                        <div className="min-w-0 flex-1">
                            <input
                                value={current.title || ''}
                                onChange={(e) => setCurrent({ ...current, title: e.target.value })}
                                onBlur={() => presentationService.update(current.id, { title: current.title })}
                                className="text-base font-black text-slate-900 bg-transparent border-none focus:outline-none w-full truncate"
                            />
                            <p className="text-xs text-slate-500 mt-0.5">
                                {slides.length} слайдов
                                {slidesDoneCount > 0 && ` · ${slidesDoneCount} готово`}
                                {slidesPendingCount > 0 && ` · ${slidesPendingCount} новых`}
                                {' · '}
                                <span className="font-bold text-indigo-600">{STATUS_LABELS[current.status] || current.status}</span>
                                {estimate && slidesPendingCount > 0 ? ` · ~${estimate.totalCost} ₽` : ''}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleApproveText}
                                disabled={!canApproveText}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-40 shadow-sm"
                            >
                                <CheckCircle2 size={16} />
                                1. Утвердить текст
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !slides.length || !canGenerate}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 shadow-sm"
                            >
                                {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                2. Сгенерировать
                            </button>
                            <button onClick={handleExportPdf} disabled={exporting || !slides.some((s) => s.imageUrl)} className="px-3 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold disabled:opacity-40">
                                PDF
                            </button>
                            <button onClick={handleExportPptx} disabled={exportingPptx || !slides.length} className="px-3 py-2.5 bg-slate-600 text-white rounded-xl text-sm font-bold disabled:opacity-40">
                                PPTX
                            </button>
                        </div>
                    </div>
                    <div className="px-4 py-2 flex flex-wrap items-center gap-3 bg-slate-50 text-sm">
                        <label className="flex items-center gap-1.5 text-slate-600">
                            <span className="text-xs font-bold text-slate-400">Стиль</span>
                            <select value={current.style || 'mckinsey'} onChange={(e) => handleStyleChange(e.target.value)} className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                                {stylePresets.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                        </label>
                        <label className="flex items-center gap-1.5 text-slate-600">
                            <span className="text-xs font-bold text-slate-400">Режим</span>
                            <select value={current.mode || 'full_image'} onChange={(e) => handlePresentationField('mode', e.target.value)} className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                                <option value="full_image">Картинка с текстом</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </label>
                        <label className="flex items-center gap-1.5 text-slate-600">
                            <span className="text-xs font-bold text-slate-400">Качество</span>
                            <select value={current.resolution || '2K'} onChange={(e) => handlePresentationField('resolution', e.target.value)} className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                                <option value="1K">1K</option>
                                <option value="2K">2K</option>
                                <option value="4K">4K</option>
                            </select>
                        </label>
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs font-bold text-slate-400">Бренд</span>
                            {current.brandLogoUrl && <img src={getProxyUrl(current.brandLogoUrl)} alt="" className="w-7 h-7 rounded object-cover border" />}
                            <label className="text-xs font-bold text-indigo-600 cursor-pointer px-2 py-1 bg-white border rounded-lg">
                                Лого
                                <input type="file" accept="image/*" className="hidden" onChange={handleBrandLogoUpload} />
                            </label>
                            <input type="color" value={current.brandPrimary || '#051C2C'} onChange={(e) => handlePresentationField('brandPrimary', e.target.value)} className="w-7 h-7 rounded border cursor-pointer" title="Цвет" />
                            <input type="color" value={current.brandSecondary || '#6366f1'} onChange={(e) => handlePresentationField('brandSecondary', e.target.value)} className="w-7 h-7 rounded border cursor-pointer" title="Акцент" />
                        </div>
                    </div>
                    {!canGenerate && slides.length > 0 && (
                        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-center">
                            <p className="text-sm font-bold text-amber-800">
                                Сначала нажми «Утвердить текст» — потом можно генерировать картинки
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-1 overflow-hidden min-h-0">
                    {/* Slide list */}
                    <div className="w-52 xl:w-60 shrink-0 border-r border-slate-200 overflow-y-auto bg-slate-50 p-2 space-y-1.5">
                        <div className="flex gap-1 mb-2">
                            <button type="button" onClick={handleAddSlide} className="flex-1 text-xs font-bold py-1.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-300">
                                <Plus size={12} className="inline" /> Добавить
                            </button>
                        </div>
                        {slides.map((slide, idx) => (
                            <button
                                key={slide.id || idx}
                                onClick={() => setActiveSlideIdx(idx)}
                                className={`w-full text-left p-3 rounded-xl text-sm transition-all ${activeSlideIdx === idx ? 'bg-white shadow-md border border-indigo-200' : 'hover:bg-white border border-transparent'}`}
                            >
                                <p className="font-bold text-slate-800 truncate">{slide.title || `Слайд ${idx + 1}`}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                                    {SLIDE_STATUS_LABELS[slide.status] || slide.status}
                                    {getSlideRefs(slide).length > 0 && ' · 📎'}
                                </p>
                            </button>
                        ))}
                        {slides.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-8">Структура появится после чата</p>
                        )}
                    </div>

                    {/* Preview + edit */}
                    <div className="flex-1 flex flex-col xl:flex-row overflow-hidden min-w-0 min-h-0">
                        {activeSlide ? (
                            <>
                                <div className="flex-1 min-h-[240px] xl:min-h-0 p-4 flex flex-col bg-slate-100 border-b xl:border-b-0 xl:border-r border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 mb-2 shrink-0">
                                        {activeSlide.imageUrl ? 'Готовый слайд' : 'Так будет выглядеть текст (картинку нарисует ИИ после генерации)'}
                                    </p>
                                    <div className="flex-1 flex items-center justify-center min-h-0">
                                        <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                                            {activeSlide.imageUrl ? (
                                                <>
                                                    <img src={getProxyUrl(activeSlide.imageUrl)} alt="" className="w-full h-full object-cover" />
                                                    {current.mode !== 'full_image' && (activeSlide.title || activeSlide.content) && (
                                                        <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                                                            {activeSlide.title && <h3 className="text-white font-black text-xl mb-2">{activeSlide.title}</h3>}
                                                            {activeSlide.content && <p className="text-white/90 text-sm whitespace-pre-line">{activeSlide.content}</p>}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <SlideTextMockup slide={activeSlide} styleId={current.style} />
                                            )}
                                            {activeSlide.status === 'generating' && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <Loader2 size={40} className="animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-2 mt-3 shrink-0">
                                        <button onClick={handlePreviewSlide} disabled={regeneratingSlide || !activeSlide?.id || !canGenerate} className="px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 disabled:opacity-40">
                                            Пробный слайд
                                        </button>
                                        <button onClick={handleRegenerateSlide} disabled={regeneratingSlide || !activeSlide?.id} className="px-4 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 disabled:opacity-40">
                                            Перегенерировать
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full xl:w-[340px] shrink-0 p-4 bg-white space-y-3 overflow-y-auto max-h-[45vh] xl:max-h-none">
                                    <div className="flex gap-2">
                                        <select
                                            value={activeSlide.type || 'content'}
                                            onChange={(e) => { updateSlideField(activeSlideIdx, 'type', e.target.value); saveSlides(slides.map((s, i) => i === activeSlideIdx ? { ...s, type: e.target.value } : s)); }}
                                            className="text-xs border border-slate-200 rounded-lg px-2 py-1"
                                        >
                                            {SLIDE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                                        </select>
                                        <button type="button" onClick={handleDuplicateSlide} className="text-xs px-2 py-1 border border-slate-200 rounded-lg"><Copy size={12} className="inline" /></button>
                                        <button type="button" onClick={() => moveSlide(-1)} disabled={activeSlideIdx === 0} className="text-xs px-2 py-1 border border-slate-200 rounded-lg disabled:opacity-30">↑</button>
                                        <button type="button" onClick={() => moveSlide(1)} disabled={activeSlideIdx >= slides.length - 1} className="text-xs px-2 py-1 border border-slate-200 rounded-lg disabled:opacity-30">↓</button>
                                        <button type="button" onClick={handleDeleteSlide} className="text-xs px-2 py-1 border border-red-200 text-red-500 rounded-lg"><Trash2 size={12} className="inline" /></button>
                                    </div>
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
                                    <textarea
                                        value={activeSlide.speakerNotes || ''}
                                        onChange={(e) => updateSlideField(activeSlideIdx, 'speakerNotes', e.target.value)}
                                        onBlur={saveSlides}
                                        placeholder="Заметки спикера (не на слайде)"
                                        rows={2}
                                        className="w-full px-3 py-2 bg-amber-50 rounded-lg text-xs border border-amber-100 resize-none"
                                    />
                                    {activeSlide.imageHistory?.length > 0 && (
                                        <div className="flex gap-2 items-center">
                                            <span className="text-[10px] text-slate-400 font-bold">История:</span>
                                            {activeSlide.imageHistory.map((h, hi) => (
                                                <button key={hi} type="button" onClick={() => handleRestoreImage(hi)} className="w-10 h-10 rounded border overflow-hidden">
                                                    <img src={getProxyUrl(h.imageUrl)} alt="" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                Референс-картинки (GPT Image 2 image-to-image)
                                            </label>
                                            {activeSlide.imageUrl && (
                                                <button
                                                    type="button"
                                                    onClick={handleUseSlideImageAsRef}
                                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                                                >
                                                    Текущий слайд → референс
                                                </button>
                                            )}
                                        </div>
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

                                <div className="xl:hidden flex items-center justify-center gap-4 py-2 bg-white border-t border-slate-100 shrink-0">
                                    <button onClick={() => setActiveSlideIdx((i) => Math.max(0, i - 1))} disabled={activeSlideIdx === 0} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="text-sm font-bold text-slate-600">{activeSlideIdx + 1} / {slides.length}</span>
                                    <button onClick={() => setActiveSlideIdx((i) => Math.min(slides.length - 1, i + 1))} disabled={activeSlideIdx >= slides.length - 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30">
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

            </div>
            </div>
        </div>
    );
};

export default Presentations;
