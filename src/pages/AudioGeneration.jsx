import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MessageSquare, AudioWaveform, Wand2, Play, Download, Loader2, Plus, Trash2, Volume2, Sparkles, ChevronRight, AlertCircle, Clock, Info, X } from 'lucide-react';
import { audioService, historyService } from '../services/api';
import { useUser } from '../context/UserContext';
import Button from '../components/common/Button';

const AudioGeneration = () => {
    const { updateBalance, balance } = useUser();
    const [activeTab, setActiveTab] = useState('tts'); // 'tts', 'dialogue', 'sfx'
    const [voices, setVoices] = useState([]);
    const [loadingVoices, setLoadingVoices] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [history, setHistory] = useState([]);

    // TTS State
    const [ttsPrompt, setTtsPrompt] = useState('');
    const [ttsVoice, setTtsVoice] = useState('');
    const [ttsOptions, setTtsOptions] = useState({ stability: 0.5, similarity_boost: 0.75 });

    // Dialogue State
    const [dialogueBlocks, setDialogueBlocks] = useState([
        { id: Date.now(), text: '', voice: '' },
        { id: Date.now() + 1, text: '', voice: '' }
    ]);
    const [dialogueOptions, setDialogueOptions] = useState({ stability: 0.5 });

    // SFX State
    const [sfxPrompt, setSfxPrompt] = useState('');
    const [sfxOptions, setSfxOptions] = useState({ duration_seconds: 3.5, prompt_influence: 0.3 });

    useEffect(() => {
        fetchVoices();
    }, []);

    const [errorMsg, setErrorMsg] = useState('');

    const fetchVoices = async () => {
        try {
            setLoadingVoices(true);
            setErrorMsg('');
            const response = await audioService.getVoices();

            // Try all possible data locations to catch any backend format
            let voiceList = [];
            if (Array.isArray(response)) {
                voiceList = response;
            } else if (response && Array.isArray(response.voices)) {
                voiceList = response.voices;
            } else if (response && Array.isArray(response.data)) {
                voiceList = response.data;
            } else if (response?.data?.voices && Array.isArray(response.data.voices)) {
                voiceList = response.data.voices;
            }

            setVoices(voiceList);

            if (voiceList.length > 0) {
                setTtsVoice(voiceList[0].id);
                const complexVoice = voiceList.find(v => v.id.length > 15)?.id || voiceList[0].id;
                setDialogueBlocks(prev => prev.map(b => ({ ...b, voice: complexVoice })));
            } else {
                setErrorMsg('Сервер вернул пустой список голосов');
            }
        } catch (err) {
            setErrorMsg(err.message || "Ошибка при получении голосов");
            setVoices([]);
        } finally {
            setLoadingVoices(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            let requestData = {};
            if (activeTab === 'tts') {
                requestData = {
                    prompt: ttsPrompt,
                    model: 'elevenlabs/text-to-speech-turbo-2-5',
                    options: {
                        voice: ttsVoice,
                        ...ttsOptions
                    }
                };
            } else if (activeTab === 'dialogue') {
                requestData = {
                    model: 'elevenlabs/text-to-dialogue-v3',
                    options: {
                        dialogue: dialogueBlocks.map(b => ({ text: b.text, voice: b.voice })),
                        ...dialogueOptions
                    }
                };
            } else if (activeTab === 'sfx') {
                requestData = {
                    prompt: sfxPrompt,
                    model: 'elevenlabs/sound-effect-v2',
                    options: sfxOptions
                };
            }

            const response = await audioService.generateAudio(requestData);

            if (response.id) {
                pollStatus(response.id);
            } else if (response.url) {
                const newItem = {
                    ...response,
                    output_url: response.url,
                    id: Date.now()
                };
                setHistory(prev => [newItem, ...prev]);
            }

            if (response.newBalance !== undefined) {
                updateBalance(response.newBalance);
            }
        } catch (err) {
            alert(err.response?.data?.error || "Ошибка при генерации аудио");
        } finally {
            setIsGenerating(false);
        }
    };

    const pollStatus = async (taskId) => {
        const check = async () => {
            try {
                const statusData = await historyService.getTaskStatus(taskId);

                if (statusData.status === 'success') {
                    // Ensure output_url exists (backend might use 'url' or 'fileUrl')
                    const finalItem = {
                        ...statusData,
                        id: taskId,
                        output_url: statusData.url
                    };
                    setHistory(prev => [finalItem, ...prev]);
                    return true;
                } else if (statusData.status === 'failed' || statusData.status === 'error') {
                    alert("Генерация не удалась: " + (statusData.error || "Ошибка на стороне сервера"));
                    return true;
                }
                return false;
            } catch (err) {
                return false; // Continue polling on transient errors
            }
        };

        const interval = setInterval(async () => {
            const finished = await check();
            if (finished) clearInterval(interval);
        }, 3000);
    };

    const addDialogueBlock = () => {
        const complexVoice = voices.find(v => v.id.length > 15)?.id || voices[0]?.id || '';
        setDialogueBlocks([...dialogueBlocks, { id: Date.now(), text: '', voice: complexVoice }]);
    };

    const removeDialogueBlock = (id) => {
        if (dialogueBlocks.length <= 2) return;
        setDialogueBlocks(dialogueBlocks.filter(b => b.id !== id));
    };

    const updateDialogueBlock = (id, field, value) => {
        setDialogueBlocks(dialogueBlocks.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const tabs = [
        { id: 'tts', label: 'Озвучка текста', icon: Mic, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'dialogue', label: 'Диалог', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'sfx', label: 'Эффекты (SFX)', icon: AudioWaveform, color: 'text-amber-600', bg: 'bg-amber-50' }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pt-24 pb-20 px-4 md:px-8 font-primary">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Side: Controls */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"
                    >
                        <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all text-sm ${activeTab === tab.id
                                        ? `${tab.bg} ${tab.color} shadow-sm ring-1 ring-inset ring-slate-200`
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'tts' && (
                                <motion.div
                                    key="tts"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Текст для озвучки</label>
                                            <span className="text-[10px] font-bold text-slate-400">{ttsPrompt.length} / 5000</span>
                                        </div>
                                        <textarea
                                            value={ttsPrompt}
                                            onChange={(e) => setTtsPrompt(e.target.value)}
                                            placeholder="Введите текст, который нужно превратить в речь..."
                                            className="w-full h-40 bg-slate-50 border border-slate-100 rounded-3xl p-6 text-slate-700 font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Выбор голоса</label>
                                            <select
                                                value={ttsVoice}
                                                onChange={(e) => setTtsVoice(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all cursor-pointer"
                                            >
                                                {loadingVoices ? (
                                                    <option>Загрузка голосов...</option>
                                                ) : (
                                                    voices.length > 0 ? (
                                                        voices.map(v => (
                                                            <option key={v.id} value={v.id}>{v.name}</option>
                                                        ))
                                                    ) : (
                                                        <option disabled>Голоса не найдены</option>
                                                    )
                                                )}
                                            </select>
                                            {!loadingVoices && voices.length === 0 && (
                                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-2">
                                                    <div className="flex items-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-widest">
                                                        <AlertCircle size={14} />
                                                        Ошибка загрузки
                                                    </div>
                                                    <p className="text-[11px] font-bold text-red-500/80 leading-relaxed uppercase">
                                                        {errorMsg || 'Сервер не вернул список голосов. Проверьте эндпоинт /audio/voices'}
                                                    </p>
                                                    <button
                                                        onClick={fetchVoices}
                                                        className="text-[9px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 underline underline-offset-4"
                                                    >
                                                        Попробовать снова
                                                    </button>
                                                </div>
                                            )}
                                            {ttsVoice && Array.isArray(voices) && voices.find(v => v.id === ttsVoice)?.description && (
                                                <div className="flex items-start gap-2 px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                                    <Info size={14} className="text-slate-400 mt-0.5" />
                                                    <p className="text-[11px] font-medium text-slate-500 italic leading-snug">
                                                        {voices.find(v => v.id === ttsVoice).description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Стабильность</label>
                                                    <span className="text-xs font-black text-indigo-600">{(ttsOptions.stability * 100).toFixed(0)}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="1" step="0.01"
                                                    value={ttsOptions.stability}
                                                    onChange={(e) => setTtsOptions({ ...ttsOptions, stability: parseFloat(e.target.value) })}
                                                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Сходство (Boost)</label>
                                                    <span className="text-xs font-black text-indigo-600">{(ttsOptions.similarity_boost * 100).toFixed(0)}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="1" step="0.01"
                                                    value={ttsOptions.similarity_boost}
                                                    onChange={(e) => setTtsOptions({ ...ttsOptions, similarity_boost: parseFloat(e.target.value) })}
                                                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 mb-6">
                                            <Info size={16} className="text-indigo-600" />
                                            <p className="text-xs font-bold text-indigo-600/80 uppercase tracking-wider">Цена: 6 руб / 1000 символов</p>
                                        </div>
                                        <Button
                                            onClick={handleGenerate}
                                            disabled={isGenerating || !ttsPrompt.trim()}
                                            className="w-full py-5 text-lg rounded-2xl bg-slate-900 shadow-xl shadow-slate-200"
                                        >
                                            {isGenerating ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Сгенерировать речь</>}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'dialogue' && (
                                <motion.div
                                    key="dialogue"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Реплики персонажей</label>
                                        <div className="space-y-4">
                                            {dialogueBlocks.map((block, index) => (
                                                <div key={block.id} className="relative bg-slate-50 border border-slate-100 rounded-[2rem] p-6 group transition-all hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div className="md:col-span-1">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Голос {index + 1}</label>
                                                            <select
                                                                value={block.voice}
                                                                onChange={(e) => updateDialogueBlock(block.id, 'voice', e.target.value)}
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:border-emerald-500 outline-none transition-all"
                                                            >
                                                                {Array.isArray(voices) && voices
                                                                    .filter(v => v.id.length > 15) // Dialogue V3 only supports long IDs
                                                                    .map(v => (
                                                                        <option key={v.id} value={v.id}>{v.name}</option>
                                                                    ))}
                                                            </select>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Текст реплики</label>
                                                            <textarea
                                                                value={block.text}
                                                                onChange={(e) => updateDialogueBlock(block.id, 'text', e.target.value)}
                                                                placeholder="Введите фразу..."
                                                                className="w-full h-24 bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium focus:border-emerald-500 outline-none transition-all resize-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeDialogueBlock(block.id)}
                                                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border border-red-100 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={addDialogueBlock}
                                            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all group"
                                        >
                                            <Plus size={18} className="transition-transform group-hover:rotate-90" />
                                            Добавить реплику
                                        </button>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 mb-6">
                                            <Info size={16} className="text-emerald-600" />
                                            <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider">Цена: 12 руб / 1000 символов</p>
                                        </div>
                                        <Button
                                            onClick={handleGenerate}
                                            disabled={isGenerating || dialogueBlocks.some(b => !b.text.trim())}
                                            className="w-full py-5 text-lg rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100"
                                        >
                                            {isGenerating ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Сгенерировать диалог</>}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'sfx' && (
                                <motion.div
                                    key="sfx"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Описание звука</label>
                                        <input
                                            type="text"
                                            value={sfxPrompt}
                                            onChange={(e) => setSfxPrompt(e.target.value)}
                                            placeholder="Напр.: Звук летящего самолета в грозу"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-slate-700 font-bold focus:ring-4 focus:ring-amber-500/5 focus:border-amber-400 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Длительность</label>
                                                <span className="text-xs font-black text-amber-600">{sfxOptions.duration_seconds} сек</span>
                                            </div>
                                            <input
                                                type="range" min="0.5" max="22" step="0.5"
                                                value={sfxOptions.duration_seconds}
                                                onChange={(e) => setSfxOptions({ ...sfxOptions, duration_seconds: parseFloat(e.target.value) })}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Влияние промпта</label>
                                                <span className="text-xs font-black text-amber-600">{(sfxOptions.prompt_influence * 100).toFixed(0)}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="1" step="0.01"
                                                value={sfxOptions.prompt_influence}
                                                onChange={(e) => setSfxOptions({ ...sfxOptions, prompt_influence: parseFloat(e.target.value) })}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 mb-6">
                                            <Info size={16} className="text-amber-600" />
                                            <p className="text-xs font-bold text-amber-600/80 uppercase tracking-wider">Цена: 0.50 руб / 1 сек</p>
                                        </div>
                                        <Button
                                            onClick={handleGenerate}
                                            disabled={isGenerating || !sfxPrompt.trim()}
                                            className="w-full py-5 text-lg rounded-2xl bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-100"
                                        >
                                            {isGenerating ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Создать спецэффект</>}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Right Side: History */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-full min-h-[500px] flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">История генераций</h3>
                            <Clock size={16} className="text-slate-300" />
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                            {history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4 border border-dashed border-slate-200">
                                        <Mic size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-10">Тут появятся ваши аудио файлы</p>
                                </div>
                            ) : (
                                history.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-5 rounded-3xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-sm">
                                                <Volume2 size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tighter">
                                                    {item.prompt || (item.model?.includes('dialogue') ? 'Диалог персонажей' : 'TTS Генерация')}
                                                </p>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleTimeString()}</span>
                                            </div>
                                        </div>

                                        {item.output_url && (
                                            <div className="space-y-4">
                                                <audio src={item.output_url} controls className="w-full h-8" />
                                                <div className="flex gap-2">
                                                    <a
                                                        href={item.output_url}
                                                        download
                                                        target="_blank"
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                                                    >
                                                        <Download size={14} /> Скачать
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AudioGeneration;
