import React, { useState, useEffect, useRef } from 'react';
import { Scissors, X, Play, Pause } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { formatTime } from '../../utils/editorUtils';

const TrimEditor = () => {
    const { clips, selectedClipId, updateClip, setSelectedClipId } = useEditor();
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [thumbnails, setThumbnails] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPreviewTime, setCurrentPreviewTime] = useState(0);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const selectedClip = clips.find(c => c.id === selectedClipId);

    useEffect(() => {
        if (selectedClip) {
            setTrimStart(selectedClip.trimStart || 0);
            setTrimEnd(selectedClip.trimEnd || selectedClip.duration);
            setCurrentPreviewTime(selectedClip.trimStart || 0);
            generateThumbnails();
        }
    }, [selectedClip]);

    const generateThumbnails = async () => {
        if (!selectedClip || selectedClip.type !== 'video') return;

        const video = document.createElement('video');
        video.src = selectedClip.url;
        video.crossOrigin = 'anonymous';

        const thumbs = [];
        const count = 12; // Number of thumbnails

        video.addEventListener('loadedmetadata', () => {
            const duration = video.duration;
            const interval = duration / count;

            let currentThumb = 0;
            const captureFrame = () => {
                if (currentThumb >= count) {
                    setThumbnails(thumbs);
                    return;
                }

                const time = currentThumb * interval;
                video.currentTime = time;
            };

            video.addEventListener('seeked', () => {
                const canvas = document.createElement('canvas');
                canvas.width = 80;
                canvas.height = 45;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                thumbs.push({
                    time: video.currentTime,
                    dataUrl: canvas.toDataURL()
                });

                currentThumb++;
                captureFrame();
            });

            captureFrame();
        });
    };

    const handleTrimStartChange = (e) => {
        const value = parseFloat(e.target.value);
        setTrimStart(Math.min(value, trimEnd - 0.1));
        setCurrentPreviewTime(value);
    };

    const handleTrimEndChange = (e) => {
        const value = parseFloat(e.target.value);
        setTrimEnd(Math.max(value, trimStart + 0.1));
    };

    const handleApplyTrim = () => {
        const newDuration = trimEnd - trimStart;
        if (newDuration > 0) {
            updateClip(selectedClipId, {
                trimStart,
                trimEnd,
                duration: newDuration
            });
            alert('✂️ Обрезка применена!');
        }
    };

    const togglePreview = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.currentTime = trimStart;
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        if (videoRef.current && selectedClip) {
            videoRef.current.addEventListener('timeupdate', () => {
                const time = videoRef.current.currentTime;
                if (time >= trimEnd) {
                    videoRef.current.pause();
                    videoRef.current.currentTime = trimStart;
                    setIsPlaying(false);
                }
                setCurrentPreviewTime(time);
            });
        }
    }, [trimStart, trimEnd, selectedClip]);

    if (!selectedClip) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 p-4">
                <p className="text-slate-400 text-xs text-center">
                    Выберите видео-клип<br />для обрезки
                </p>
            </div>
        );
    }

    if (selectedClip.type !== 'video') {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 p-4">
                <p className="text-slate-400 text-xs text-center">
                    Обрезка доступна<br />только для видео
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Scissors size={16} />
                    Обрезка
                </h3>
                <button
                    onClick={() => setSelectedClipId(null)}
                    className="p-1 hover:bg-slate-100 rounded transition-all"
                >
                    <X size={16} className="text-slate-600" />
                </button>
            </div>

            {/* Video Preview */}
            <div className="relative bg-black aspect-video">
                <video
                    ref={videoRef}
                    src={selectedClip.url}
                    className="w-full h-full object-contain"
                    muted
                />
                <button
                    onClick={togglePreview}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all"
                >
                    {isPlaying ? (
                        <Pause size={32} className="text-white" />
                    ) : (
                        <Play size={32} className="text-white" />
                    )}
                </button>
            </div>

            {/* Timeline with Thumbnails */}
            <div className="p-3 space-y-2 flex-1 overflow-y-auto">
                <div className="text-xs text-slate-600 flex justify-between">
                    <span>{formatTime(trimStart)}</span>
                    <span className="font-bold">{formatTime(trimEnd - trimStart)}</span>
                    <span>{formatTime(trimEnd)}</span>
                </div>

                {/* Thumbnail Strip */}
                <div className="relative bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <div className="flex h-12">
                        {thumbnails.map((thumb, idx) => (
                            <div
                                key={idx}
                                className="flex-1 border-r border-slate-300 last:border-r-0"
                                style={{
                                    backgroundImage: `url(${thumb.dataUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            />
                        ))}
                    </div>

                    {/* Trim Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div
                            className="absolute top-0 bottom-0 bg-black/50"
                            style={{
                                left: 0,
                                width: `${(trimStart / selectedClip.duration) * 100}%`
                            }}
                        />
                        <div
                            className="absolute top-0 bottom-0 bg-black/50"
                            style={{
                                right: 0,
                                width: `${((selectedClip.duration - trimEnd) / selectedClip.duration) * 100}%`
                            }}
                        />

                        {/* Trim Handles */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-yellow-400"
                            style={{ left: `${(trimStart / selectedClip.duration) * 100}%` }}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full" />
                        </div>
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-yellow-400"
                            style={{ left: `${(trimEnd / selectedClip.duration) * 100}%` }}
                        >
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Range Sliders */}
                <div className="space-y-2">
                    <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max={selectedClip.duration}
                            step="0.1"
                            value={trimStart}
                            onChange={handleTrimStartChange}
                            className="w-full h-2 bg-transparent appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, transparent ${(trimStart / selectedClip.duration) * 100}%, #fbbf24 ${(trimStart / selectedClip.duration) * 100}%, #fbbf24 ${(trimEnd / selectedClip.duration) * 100}%, transparent ${(trimEnd / selectedClip.duration) * 100}%)`
                            }}
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max={selectedClip.duration}
                            step="0.1"
                            value={trimEnd}
                            onChange={handleTrimEndChange}
                            className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-yellow-400"
                        />
                    </div>
                </div>

                {/* Apply Button */}
                <button
                    onClick={handleApplyTrim}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-all"
                >
                    Применить обрезку
                </button>

                <p className="text-[9px] text-slate-500 text-center">
                    💡 Перетащите ползунки для выбора фрагмента
                </p>
            </div>
        </div>
    );
};

export default TrimEditor;
