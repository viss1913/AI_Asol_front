import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, Video, Image as ImageIcon, Music, Download, Share2, Trash2, Loader2, Sparkles, Filter, MoreVertical, Maximize2, X } from 'lucide-react';
import { contentService } from '../services/api';
import Button from '../components/common/Button';
import { getTaskPlaybackUrl } from '../utils/proxyUtils';
import { downloadHistoryFile } from '../utils/downloadUtils';

const Gallery = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'video', 'image', 'audio'
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await contentService.fetchHistory();
            setAssets(data.data || []);
        } catch (err) {
            console.error("Failed to fetch gallery:", err);
            setError("Не удалось загрузить галерею. Попробуйте обновить страницу.");
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(asset => {
        if (filter === 'all') return true;
        return asset.type === filter;
    });

    const handleDownload = async (asset) => {
        try {
            if (asset.id) {
                await downloadHistoryFile(asset.id, asset.type);
                return;
            }
            const src = getTaskPlaybackUrl(asset);
            const response = await fetch(src);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `asol-${asset.id || Date.now()}.${asset.type === 'video' ? 'mp4' : (asset.type === 'audio' ? 'mp3' : 'png')}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Не удалось скачать файл');
        }
    };

    const handleDelete = async (e, assetId) => {
        if (e) e.stopPropagation();

        if (!window.confirm('Вы уверены, что хотите удалить этот файл? Это действие нельзя отменить.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await contentService.deleteAsset(assetId);

            // Remove from state
            setAssets(prev => prev.filter(a => a.id !== assetId));

            // If current asset was selected (in modal), close modal
            if (selectedAsset?.id === assetId) {
                setSelectedAsset(null);
            }
        } catch (err) {
            console.error("Failed to delete asset:", err);
            alert("Не удалось удалить файл. Попробуйте позже.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 min-h-screen">
            <header className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight flex items-center gap-3">
                            <Grid size={36} className="text-indigo-600" />
                            Моя галерея
                        </h1>
                        <p className="text-slate-500 font-medium">Все ваши творческие работы в одном месте</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-2xl self-start">
                        {[
                            { id: 'all', label: 'Все', icon: <Grid size={16} /> },
                            { id: 'video', label: 'Видео', icon: <Video size={16} /> },
                            { id: 'image', label: 'Фото', icon: <ImageIcon size={16} /> },
                            { id: 'audio', label: 'Звук', icon: <Music size={16} /> },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setFilter(t.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                    <p className="text-xl font-bold text-slate-400">Загрузка вашей коллекции...</p>
                </div>
            ) : error ? (
                <div className="text-center py-32 bg-red-50 rounded-[3rem] border border-red-100">
                    <p className="text-red-500 font-bold text-lg mb-6">{error}</p>
                    <Button onClick={fetchHistory}>Обновить галерею</Button>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-slate-100">
                    <Sparkles size={64} className="mx-auto text-slate-200 mb-6" />
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Здесь пока пусто</h3>
                    <p className="text-slate-400 font-medium mb-8">Начните создавать шедевры, и они появятся здесь!</p>
                    <div className="flex items-center justify-center gap-4">
                        <Button onClick={() => window.location.href = '/video'}>Создать видео</Button>
                        <Button variant="secondary" onClick={() => window.location.href = '/image'}>Создать фото</Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredAssets.map((asset) => (
                            <motion.div
                                key={asset.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col overflow-hidden"
                            >
                                {/* Media Preview */}
                                <div
                                    className="relative aspect-video bg-slate-100 overflow-hidden cursor-pointer"
                                    onClick={() => setSelectedAsset(asset)}
                                >
                                    {asset.type === 'audio' ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50 text-indigo-400">
                                            <Music size={48} className="mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Аудиозапись</span>
                                        </div>
                                    ) : (asset.type === 'video' && !asset.previewUrl) ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 text-slate-400">
                                            <Video size={48} className="mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Обработка превью...</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={getTaskPlaybackUrl({ ...asset, resultUrl: asset.previewUrl || asset.resultUrl })}
                                            alt={asset.prompt}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            // Removed crossOrigin since COEP headers were removed from vite.config.js
                                            onLoad={() => console.log(`[Gallery] Image loaded: ${asset.previewUrl || asset.resultUrl}`)}
                                            onError={(e) => console.error(`[Gallery] Image error: ${asset.previewUrl || asset.resultUrl}`, e)}
                                        />
                                    )}

                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 scale-75 group-hover:scale-100 transition-all duration-300">
                                            <Maximize2 size={20} />
                                        </div>
                                    </div>

                                    {/* Type Badge */}
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md border border-white/20 rounded-lg flex items-center gap-1.5">
                                        {asset.type === 'video' ? <Video size={10} className="text-white" /> :
                                            asset.type === 'audio' ? <Music size={10} className="text-white" /> :
                                                <ImageIcon size={10} className="text-white" />}
                                        <span className="text-[8px] font-black text-white uppercase tracking-wider">
                                            {asset.type === 'video' ? 'Видео' : asset.type === 'audio' ? 'Звук' : 'Фото'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex-1 mb-4">
                                        <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-relaxed mb-1 italic">
                                            "{asset.prompt || 'Без названия'}"
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {new Date(asset.createdAt).toLocaleString('ru-RU')}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <button
                                            onClick={() => setSelectedAsset(asset)}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                        >
                                            Открыть
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleDownload(asset)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Скачать"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Удалить"
                                                onClick={(e) => handleDelete(e, asset.id)}
                                                disabled={isDeleting}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Asset Modal (Lightbox) */}
            <AnimatePresence>
                {selectedAsset && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAsset(null)}
                            className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden relative z-10 flex flex-col md:flex-row max-h-[90vh]"
                        >
                            {/* Media Section */}
                            <div className="flex-1 bg-black relative flex items-center justify-center min-h-[300px]">
                                {selectedAsset.type === 'video' ? (
                                    <video
                                        src={getTaskPlaybackUrl(selectedAsset)}
                                        controls
                                        autoPlay
                                        className="max-w-full max-h-full"
                                        // Removed crossOrigin to avoid CORS issues on production without COEP
                                        onLoadedMetadata={() => console.log(`[GalleryModal] Video metadata loaded: ${selectedAsset.resultUrl}`)}
                                        onError={(e) => console.error(`[GalleryModal] Video error: ${selectedAsset.resultUrl}`, e)}
                                    />
                                ) : selectedAsset.type === 'audio' ? (
                                    <div className="flex flex-col items-center gap-6 p-12">
                                        <div className="w-32 h-32 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-600 animate-pulse">
                                            <Music size={64} />
                                        </div>
                                        <audio src={getTaskPlaybackUrl(selectedAsset)} controls className="w-full max-w-md" />
                                    </div>
                                ) : (
                                    <img
                                        src={getTaskPlaybackUrl(selectedAsset)}
                                        alt=""
                                        className="max-w-full max-h-full object-contain"
                                    />
                                )}
                                <button
                                    onClick={() => setSelectedAsset(null)}
                                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-2xl backdrop-blur-md transition-all scale-100 md:hidden"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Details Section */}
                            <div className="w-full md:w-80 lg:w-96 p-8 flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                            {selectedAsset.type}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedAsset(null)}
                                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all hidden md:block"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Промпт</label>
                                    <p className="text-lg font-bold text-slate-900 leading-relaxed italic mb-8">
                                        "{selectedAsset.prompt || 'Без названия'}"
                                    </p>

                                    <div className="grid grid-cols-1 gap-4 mb-8">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Дата создания</p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {new Date(selectedAsset.createdAt).toLocaleString('ru-RU')}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Ассета</p>
                                            <p className="text-sm font-bold text-slate-700">#{selectedAsset.id}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        className="w-full h-14"
                                        onClick={() => handleDownload(selectedAsset)}
                                    >
                                        <Download size={20} />
                                        Скачать результат
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-full h-14 border-red-100 text-red-500 hover:bg-red-50"
                                        onClick={(e) => handleDelete(e, selectedAsset.id)}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                                        Удалить ассет
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
