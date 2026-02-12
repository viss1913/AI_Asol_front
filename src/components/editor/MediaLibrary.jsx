import React, { useState, useEffect } from 'react';
import { Upload, Video, Music, Image as ImageIcon, Trash2 } from 'lucide-react';
import { historyService } from '../../services/api';
import { validateFile, getVideoMetadata } from '../../utils/editorUtils';
import { useEditor } from '../../context/EditorContext';

const MediaLibrary = () => {
    const { addClip } = useEditor();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await historyService.getHistory();
            // Filter only video and audio items
            const mediaItems = data.filter(item =>
                item.type === 'video' || item.type === 'audio'
            );
            setHistory(mediaItems);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const validation = validateFile(file, ['video', 'audio']);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        try {
            setUploadProgress(0);

            // Get metadata
            let metadata = { duration: 0 };
            if (file.type.startsWith('video/')) {
                metadata = await getVideoMetadata(file);
            }

            // Create blob URL for local playback
            const url = URL.createObjectURL(file);

            // Add to timeline
            addClip({
                type: file.type.startsWith('video/') ? 'video' : 'audio',
                url,
                file,
                name: file.name,
                duration: metadata.duration,
                source: 'upload'
            });

            setUploadProgress(null);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Ошибка загрузки файла');
            setUploadProgress(null);
        }
    };

    const handleDragStart = (e, item) => {
        e.dataTransfer.setData('mediaItem', JSON.stringify(item));
    };

    const addToTimeline = async (item) => {
        try {
            // Fetch video metadata if needed
            let duration = 0;
            if (item.type === 'video') {
                const response = await fetch(item.url || item.video_url);
                const blob = await response.blob();
                const metadata = await getVideoMetadata(blob);
                duration = metadata.duration;
            }

            addClip({
                type: item.type,
                url: item.url || item.video_url || item.result?.[0],
                name: item.prompt || 'Без названия',
                duration,
                source: 'history',
                historyId: item.id
            });
        } catch (error) {
            console.error('Failed to add to timeline:', error);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Upload size={18} />
                Медиатека
            </h2>

            {/* Upload Button */}
            <label className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mb-3 text-sm">
                <Upload size={18} />
                Загрузить файл
                <input
                    type="file"
                    accept="video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </label>

            {uploadProgress !== null && (
                <div className="mb-4">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 transition-all"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Загрузка: {uploadProgress}%</p>
                </div>
            )}

            {/* Media Items */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {loading ? (
                    <div className="text-center text-slate-400 py-8">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs">Загрузка...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-8">
                        <Video size={28} className="mx-auto mb-2 opacity-50" />
                        <p>Нет доступных медиафайлов</p>
                        <p className="text-[10px] mt-1">Создайте видео или аудио</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onClick={() => addToTimeline(item)}
                            className="p-2 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {item.type === 'video' ? (
                                    <Video size={14} className="text-indigo-600" />
                                ) : (
                                    <Music size={14} className="text-purple-600" />
                                )}
                                <span className="text-[11px] font-bold text-slate-900 truncate flex-1">
                                    {item.prompt || 'Без названия'}
                                </span>
                            </div>
                            <p className="text-[9px] text-slate-500">
                                {new Date(item.created_at).toLocaleDateString('ru-RU')}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-xs text-indigo-700 font-bold">💡 Совет</p>
                <p className="text-xs text-indigo-600 mt-1">
                    Перетащите файл на timeline или кликните для добавления
                </p>
            </div>
        </div>
    );
};

export default MediaLibrary;
