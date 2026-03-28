import React, { useState } from 'react';
import { Film, Download, Loader } from 'lucide-react';
import AddMediaModal from '../components/editor/AddMediaModal';
import Timeline from '../components/editor/Timeline';
import VideoPreview from '../components/editor/VideoPreview';
import { useEditor } from '../context/EditorContext';
import { downloadBlob } from '../utils/editorUtils';
import { getProxyUrl } from '../utils/proxyUtils';
import api from '../services/api';

export default function VideoEditor() {
    const { addClips, clips, clearTimeline, addClip } = useEditor();
    const [exporting, setExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState(false);

    const handleAddMedia = (mediaData) => {
        addClips(mediaData);
    };

    const handleExport = async () => {
        if (clips.length === 0) {
            alert('Добавьте клипы на timeline');
            return;
        }

        setExporting(true);
        setExportProgress(0);

        const videoClips = clips.filter(c => c.type === 'video');

        if (videoClips.length === 0) {
            alert('Нет видеоклипов для экспорта');
            setExporting(false);
            return;
        }

        try {
            console.log('[Export] Sending to server for concat...');
            setExportProgress(10);

            // Prepare data for backend
            const urls = videoClips.map(c => c.url);
            const trimSettings = videoClips.map(c => {
                if (c.trimStart > 0 || c.trimEnd < c.duration) {
                    return { start: c.trimStart || 0, end: c.trimEnd || c.duration };
                }
                return null;
            });

            console.log('[Export] URLs:', urls);
            console.log('[Export] Trim settings:', trimSettings);

            setExportProgress(20);

            // Call backend concat API
            const response = await api.post('/videos/concat', { urls, trimSettings });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Server concat failed');
            }

            const resultUrl = response.data.url;
            console.log('[Export] ✅ Server concat done:', resultUrl);
            setExportProgress(80);

            // Download the result
            console.log('[Export] Downloading result...');
            const downloadResponse = await fetch(getProxyUrl(resultUrl));
            if (!downloadResponse.ok) throw new Error(`Download failed: ${downloadResponse.status}`);

            const blob = await downloadResponse.blob();
            console.log(`[Export] ✅ Downloaded (${(blob.size / 1024 / 1024).toFixed(1)} MB)`);

            setExportProgress(100);
            downloadBlob(blob, `video_${Date.now()}.mp4`);

            alert('✅ Видео успешно экспортировано!');
        } catch (error) {
            console.error('[Export] ❌ Export failed:', error);
            alert('❌ Ошибка при экспорте: ' + (error.response?.data?.error || error.message));
        } finally {
            setExporting(false);
            setExportProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-16 pb-4 px-2">
            <div className="h-full">
                {/* Header */}
                <div className="mb-4 px-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Film className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">Монтаж</h1>
                                <p className="text-slate-600 text-sm">
                                    Создавайте профессиональные ролики из ваших генераций
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {clips.length > 0 && (
                                <button
                                    onClick={clearTimeline}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition-all"
                                >
                                    Очистить
                                </button>
                            )}
                            <button
                                onClick={handleExport}
                                disabled={exporting || clips.filter(c => c.type === 'video').length === 0}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {exporting ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Экспорт {exportProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Экспорт
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex flex-col gap-2 h-[calc(100vh-140px)]">
                    {/* Preview */}
                    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                        <VideoPreview />
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-lg border border-slate-200 p-3 flex-1 shadow-sm">
                        <Timeline onOpenAddMedia={() => setIsAddMediaModalOpen(true)} />
                    </div>
                </div>

                {/* Add Media Modal */}
                <AddMediaModal
                    isOpen={isAddMediaModalOpen}
                    onClose={() => setIsAddMediaModalOpen(false)}
                    onAddMedia={handleAddMedia}
                />
            </div>
        </div>
    );
};



