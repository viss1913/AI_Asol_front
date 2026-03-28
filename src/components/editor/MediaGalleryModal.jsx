import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Grid, Image as ImageIcon, Video, Loader2, Sparkles } from 'lucide-react';
import { contentService } from '../../services/api';
import { getEmbedMediaUrl } from '../../utils/proxyUtils';

const MediaGalleryModal = ({ isOpen, onClose, onSelect, onUploadClick, title = "Выберите изображение" }) => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchAssets();
        }
    }, [isOpen]);

    const fetchAssets = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await contentService.fetchVisuals();
            setAssets(data.data || []);
        } catch (err) {
            console.error("Failed to fetch assets:", err);
            setError("Не удалось загрузить галерею.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Grid size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                            <p className="text-xs text-slate-500 font-medium">Выберите из галереи или загрузите новый файл</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content — загрузка с устройства всегда доступна, даже если список из API не подгрузился */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[300px] custom-scrollbar space-y-4">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onUploadClick(); }}
                        className="w-full flex flex-row sm:flex-col sm:aspect-auto items-center justify-center gap-3 sm:gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-400 hover:shadow-lg transition-all group py-4 sm:py-8"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-all shrink-0">
                            <Upload size={20} />
                        </div>
                        <div className="text-left sm:text-center">
                            <span className="text-xs font-bold text-slate-700 block">Загрузить с устройства</span>
                            <span className="text-[10px] text-slate-400">Файл с телефона или компа</span>
                        </div>
                    </button>

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="animate-spin text-indigo-500 mb-3" size={32} />
                            <p className="text-slate-500 font-bold text-sm">Подгружаем галерею...</p>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-2xl border border-red-100 bg-red-50/80 p-4 text-center">
                            <p className="text-red-600 font-bold text-sm mb-2">{error}</p>
                            <button type="button" onClick={fetchAssets} className="text-indigo-600 font-bold text-sm underline">
                                Обновить список
                            </button>
                        </div>
                    )}

                    {!loading && !error && assets.length === 0 && (
                        <div className="text-center py-8 opacity-60">
                            <p className="text-sm font-medium text-slate-400">В галерее пока пусто — загрузите файл кнопкой выше</p>
                        </div>
                    )}

                    {!loading && !error && assets.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4">
                            {assets.map((asset) => (
                                <div
                                    key={asset.id}
                                    onClick={() => onSelect(asset.url)}
                                    className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-slate-100 hover:border-indigo-400 hover:shadow-lg transition-all"
                                >
                                    <img
                                        src={getEmbedMediaUrl(asset.url)}
                                        alt={asset.prompt}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                    {asset.type === 'video' && (
                                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white p-1.5 rounded-lg border border-white/20">
                                            <Video size={12} />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 text-left">
                                        <p className="text-[10px] text-white line-clamp-2 leading-tight drop-shadow-sm font-medium">
                                            {asset.prompt}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Ассетов в галерее: {assets.length}
                    </p>
                    <button
                        onClick={fetchAssets}
                        className="text-[10px] text-indigo-500 font-bold uppercase hover:underline"
                    >
                        Обновить
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default MediaGalleryModal;
