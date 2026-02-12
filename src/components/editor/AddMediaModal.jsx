import React, { useState, useEffect } from 'react';
import { X, Upload, Video, Music, Loader } from 'lucide-react';

const AddMediaModal = ({ isOpen, onClose, onAddMedia }) => {
    const [activeTab, setActiveTab] = useState('history'); // 'history' or 'upload'
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch history when modal opens
    useEffect(() => {
        if (isOpen && activeTab === 'history') {
            setLoading(true);
            fetch('/api/v1/history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    // Filter only successful video and audio items
                    const filtered = data.filter(item =>
                        (item.type === 'video' || item.type === 'audio') &&
                        item.status === 'success'
                    );
                    setHistory(filtered);
                })
                .catch(err => console.error('Failed to load history:', err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, activeTab]);

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

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
            }

            onAddMedia({
                type,
                url,
                name: file.name,
                duration,
                source: 'upload'
            });
        }

        onClose();
    };

    const handleHistoryItemClick = async (item) => {
        const response = await fetch(item.url || item.video_url || item.result?.[0]);
        const blob = await response.blob();

        let duration = 0;
        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(blob);
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    duration = video.duration;
                    URL.revokeObjectURL(video.src);
                    resolve();
                };
            });
        }

        onAddMedia({
            type: item.type,
            url: item.url || item.video_url || item.result?.[0],
            name: item.prompt || 'Без названия',
            duration,
            source: 'history',
            historyId: item.id
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">Добавить медиафайл</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200">
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

                {/* Content */}
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
                                <div className="grid grid-cols-2 gap-3">
                                    {history.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleHistoryItemClick(item)}
                                            className="p-3 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all group"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                {item.type === 'video' ? (
                                                    <Video size={18} className="text-indigo-600" />
                                                ) : (
                                                    <Music size={18} className="text-purple-600" />
                                                )}
                                                <span className="text-sm font-bold text-slate-900 truncate flex-1">
                                                    {item.prompt || 'Без названия'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {new Date(item.created_at).toLocaleDateString('ru-RU')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
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
            </div>
        </div>
    );
};

export default AddMediaModal;
