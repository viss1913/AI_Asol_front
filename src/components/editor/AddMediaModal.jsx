import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Video, Music, Loader, Play, ArrowLeft, Check, Trash2 } from 'lucide-react';
import { contentService } from '../../services/api';
import { getTaskPlaybackUrl } from '../../utils/proxyUtils';

const AddMediaModal = ({ isOpen, onClose, onAddMedia }) => {
    const [activeTab, setActiveTab] = useState('history'); // 'history' or 'upload'
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]); // Array of selected items to preserve order

    const formatName = (prompt) => {
        if (!prompt) return 'Без названия';
        if (typeof prompt === 'object') {
            return prompt.text || prompt.prompt || JSON.stringify(prompt);
        }
        if (typeof prompt === 'string' && (prompt.startsWith('{') || prompt.startsWith('['))) {
            try {
                const parsed = JSON.parse(prompt);
                return parsed.text || parsed.prompt || prompt;
            } catch (e) {
                return prompt;
            }
        }
        return prompt;
    };

    // Fetch history when modal opens
    useEffect(() => {
        if (isOpen && activeTab === 'history') {
            loadHistory();
        }
    }, [isOpen, activeTab]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await contentService.fetchHistory();
            const assets = data.data || [];

            // Filter only successful video and audio items
            const filtered = assets.filter(item =>
                item.type === 'video' || item.type === 'audio'
            );
            setHistory(filtered);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoading(false);
        }
    };

    // Reset preview and selection when modal closes or tab changes
    useEffect(() => {
        if (!isOpen) {
            setPreviewItem(null);
            setSelectedItems([]);
        }
    }, [isOpen]);

    useEffect(() => {
        setPreviewItem(null);
        // We might want to keep selection when switching tabs, but for now let's keep it simple
        // setSelectedItems([]); 
    }, [activeTab]);

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newItems = [];

        for (const file of files) {
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('video/') ? 'video' : 'audio';

            // Get duration
            let duration = 0;
            if (type === 'video') {
                const video = document.createElement('video');
                video.src = url;
                await new Promise((resolve) => {
                    video.onloadedmetadata = () => {
                        duration = video.duration;
                        resolve();
                    };
                });
            } else if (type === 'audio') {
                const audio = new Audio(url);
                await new Promise((resolve) => {
                    audio.onloadedmetadata = () => {
                        duration = audio.duration;
                        resolve();
                    };
                });
            }

            newItems.push({
                type,
                url,
                name: file.name,
                duration,
                source: 'upload'
            });
        }

        if (newItems.length > 0) {
            onAddMedia(newItems);
            onClose();
        }
    };

    const handleItemSelect = (item) => {
        setSelectedItems(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) {
                return prev.filter(i => i.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    };

    const handleAddSelected = async () => {
        const itemsToAdd = [];

        for (const item of selectedItems) {
            const mediaUrl = item.resultUrl;
            let duration = 0;

            try {
                if (item.type === 'video') {
                    const video = document.createElement('video');
                    // Removed crossOrigin since COEP headers were removed from vite.config.js
                    video.src = getTaskPlaybackUrl(item);
                    await new Promise((resolve) => {
                        video.onloadedmetadata = () => {
                            duration = video.duration;
                            resolve();
                        };
                        video.onerror = (e) => {
                            console.error(`Error loading video metadata for ${mediaUrl}`, e);
                            resolve();
                        };
                        setTimeout(() => {
                            console.log(`[AddMediaModal] Metadata timeout for ${mediaUrl}`);
                            resolve();
                        }, 5000); // Timeout fallback
                    });
                } else {
                    const audio = new Audio();
                    // Removed crossOrigin
                    audio.src = getTaskPlaybackUrl(item);
                    await new Promise((resolve) => {
                        audio.onloadedmetadata = () => {
                            duration = audio.duration;
                            resolve();
                        };
                        audio.onerror = (e) => {
                            console.error(`Error loading audio metadata for ${mediaUrl}`, e);
                            resolve();
                        };
                        setTimeout(() => {
                            console.log(`[AddMediaModal] Metadata timeout for ${mediaUrl}`);
                            resolve();
                        }, 5000); // Timeout fallback
                    });
                }

                const promptText = formatName(item.prompt);
                console.log(`[AddMediaModal] Adding item with URL: ${getTaskPlaybackUrl(item)}`);

                itemsToAdd.push({
                    type: item.type,
                    url: mediaUrl,
                    name: promptText,
                    duration: duration || 10,
                    source: 'history',
                    historyId: item.id
                });
            } catch (e) {
                console.error("Error preparing media:", e);
            }
        }

        if (itemsToAdd.length > 0) {
            onAddMedia(itemsToAdd);
            setSelectedItems([]);
            onClose();
        }
    };

    const handleDelete = async (e, assetId) => {
        if (e) e.stopPropagation();

        if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) {
            return;
        }

        setIsDeleting(true);
        try {
            await contentService.deleteAsset(assetId);

            // Remove from state
            setHistory(prev => prev.filter(item => item.id !== assetId));
            setSelectedItems(prev => prev.filter(item => item.id !== assetId));

            // If deleting current preview item
            if (previewItem?.id === assetId) {
                setPreviewItem(null);
            }
        } catch (err) {
            console.error("Failed to delete asset:", err);
            alert("Не удалось удалить файл");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col h-[700px]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                        {previewItem && (
                            <button
                                onClick={() => setPreviewItem(null)}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} className="text-slate-600" />
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-slate-900">
                            {previewItem ? 'Предпросмотр' : 'Добавить медиафайл'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {previewItem ? (
                        <div className="flex-1 flex flex-col p-6 items-center justify-center bg-slate-50">
                            <div className="w-full max-w-2xl bg-black rounded-lg overflow-hidden shadow-lg mb-6 max-h-[400px] flex items-center justify-center">
                                {previewItem.type === 'video' ? (
                                    <video
                                        src={getTaskPlaybackUrl(previewItem)}
                                        controls
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-contain"
                                        onLoadedMetadata={() => console.log(`[PreviewModal] Metadata loaded: ${previewItem.resultUrl}`)}
                                        onError={(e) => console.error(`[PreviewModal] Error loading video: ${previewItem.resultUrl}`, e)}
                                    />
                                ) : (
                                    <div className="w-full p-8 flex flex-col items-center justify-center bg-slate-900 text-white">
                                        <Music size={48} className="mb-4 text-indigo-400" />
                                        <audio
                                            src={getTaskPlaybackUrl(previewItem)}
                                            controls
                                            autoPlay
                                            className="w-full"
                                            onLoadedMetadata={() => console.log(`[PreviewModal] Audio loaded: ${previewItem.resultUrl}`)}
                                            onError={(e) => console.error(`[PreviewModal] Audio error: ${previewItem.resultUrl}`, e)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="w-full max-w-2xl">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    {formatName(previewItem.prompt)}
                                </h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    {new Date(previewItem.createdAt).toLocaleDateString('ru-RU')} •
                                    {previewItem.type === 'video' ? ' Видео' : ' Аудио'}
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setPreviewItem(null)}
                                        className="flex-1 py-3 px-4 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all"
                                    >
                                        Назад
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, previewItem.id)}
                                        className="py-3 px-4 bg-red-50 border border-red-100 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all flex items-center justify-center"
                                        title="Удалить файл"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    </button>
                                    {/* In preview, we can just select it and close preview, or add immediately. 
                                        User asked for multi-select flow. Let's make this button confirm selection. */}
                                    <button
                                        onClick={() => {
                                            handleItemSelect(previewItem);
                                            setPreviewItem(null);
                                        }}
                                        className="flex-[2] py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                                    >
                                        <Check size={18} />
                                        {selectedItems.find(i => i.id === previewItem.id) ? 'Убрать из выбора' : 'Выбрать'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex border-b border-slate-200 shrink-0">
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex-1 px-4 py-3 font-bold text-sm transition-all ${activeTab === 'history'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    📚 Из истории
                                </button>
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className={`flex-1 px-4 py-3 font-bold text-sm transition-all ${activeTab === 'upload'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    📁 Загрузить файл
                                </button>
                            </div>

                            {/* List Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {activeTab === 'history' ? (
                                    <div className="space-y-2">
                                        {loading ? (
                                            <div className="text-center py-12">
                                                <Loader size={32} className="animate-spin mx-auto mb-3 text-indigo-600" />
                                                <p className="text-slate-600">Загрузка истории...</p>
                                            </div>
                                        ) : history.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Video size={48} className="mx-auto mb-3 text-slate-300" />
                                                <p className="text-slate-600">Нет доступных медиафайлов</p>
                                                <p className="text-sm text-slate-400 mt-1">Создайте видео или аудио</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-3">
                                                {history.map((item) => {
                                                    const selectedIndex = selectedItems.findIndex(i => i.id === item.id);
                                                    const isSelected = selectedIndex !== -1;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className={`
                                                                group relative rounded-lg border transition-all overflow-hidden cursor-pointer
                                                                ${isSelected
                                                                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
                                                                    : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-md'
                                                                }
                                                            `}
                                                            onClick={() => handleItemSelect(item)}
                                                        >
                                                            <div className="aspect-video w-full bg-slate-200 relative">
                                                                {item.type === 'video' ? (
                                                                    <video
                                                                        src={getTaskPlaybackUrl({ ...item, resultUrl: item.previewUrl || item.resultUrl })}
                                                                        className="w-full h-full object-cover"
                                                                        muted
                                                                        loop
                                                                        onMouseEnter={(e) => {
                                                                            if (e.target.readyState >= 3) e.target.play().catch(() => { });
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.pause();
                                                                            e.target.currentTime = 0;
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-400">
                                                                        <Music size={32} />
                                                                    </div>
                                                                )}

                                                                {/* Type Badge */}
                                                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase flex items-center gap-1">
                                                                    {item.type === 'video' ? <Video size={10} /> : <Music size={10} />}
                                                                    {item.type === 'video' ? 'VIDEO' : 'AUDIO'}
                                                                </div>

                                                                {/* Selection Badge */}
                                                                {isSelected && (
                                                                    <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg animate-in fade-in zoom-in duration-200">
                                                                        {selectedIndex + 1}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="p-2">
                                                                <p className="text-xs font-bold text-slate-900 truncate mb-1">
                                                                    {formatName(item.prompt)}
                                                                </p>
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[10px] text-slate-500">
                                                                        {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                                                                    </p>
                                                                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                setPreviewItem(item);
                                                                            }}
                                                                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-indigo-600 hover:bg-slate-50 transition-all"
                                                                            title="Предпросмотр"
                                                                        >
                                                                            <Play size={12} fill="currentColor" />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => handleDelete(e, item.id)}
                                                                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-red-500 hover:bg-red-50 transition-all"
                                                                            title="Удалить"
                                                                            disabled={isDeleting}
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 h-full">
                                        <label className="w-full max-w-md cursor-pointer">
                                            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-12 text-center transition-all bg-slate-50 hover:bg-indigo-50">
                                                <Upload size={48} className="mx-auto mb-4 text-slate-400" />
                                                <p className="text-lg font-bold text-slate-900 mb-2">
                                                    Выберите файлы
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    Поддерживаются видео и аудио файлы
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="video/*,audio/*"
                                                multiple
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Footer with Add Button */}
                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                                <div className="text-sm text-slate-500">
                                    {selectedItems.length > 0
                                        ? `Выбрано файлов: ${selectedItems.length}`
                                        : 'Выберите файлы для добавления'}
                                </div>
                                <button
                                    onClick={handleAddSelected}
                                    disabled={selectedItems.length === 0}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Check size={20} />
                                    Добавить ({selectedItems.length})
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default AddMediaModal;
