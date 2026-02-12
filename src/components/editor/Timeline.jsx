import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Scissors, Upload, Play, Pause, SkipBack, MousePointer2 } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { formatTime } from '../../utils/editorUtils';
import { generateWaveform } from '../../utils/audioUtils';

// Audio Clip Component with Waveform
const AudioClip = ({ clip, isSelected, onClick, onRemove }) => {
    const [waveform, setWaveform] = useState([]);

    useEffect(() => {
        if (clip.url) {
            generateWaveform(clip.url, 50).then(data => setWaveform(data));
        }
    }, [clip.url]);

    return (
        <div
            onClick={onClick}
            className={`
                relative rounded-lg cursor-pointer transition-all overflow-hidden
                ${isSelected
                    ? 'ring-2 ring-purple-500 shadow-lg'
                    : 'ring-1 ring-slate-200 hover:ring-purple-300'
                }
            `}
            style={{ width: `${Math.max(clip.duration * 150, 1)}px`, height: '80px' }}
        >
            {/* Waveform Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-center gap-0.5 px-2">
                {waveform.length > 0 ? (
                    waveform.map((amplitude, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-purple-400 rounded-full transition-all"
                            style={{
                                height: `${Math.max(amplitude * 60, 4)}px`,
                                opacity: 0.7
                            }}
                        />
                    ))
                ) : (
                    <div className="text-purple-300 text-xs">Загрузка...</div>
                )}
            </div>

            {/* Clip Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-white truncate">
                            {clip.name}
                        </p>
                        <p className="text-[9px] text-white/80">
                            {formatTime(clip.duration)}
                            {clip.sourceVideoId && ' • Из видео'}
                        </p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="p-1 hover:bg-red-500/20 rounded transition-all"
                    >
                        <Trash2 size={12} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const TimelineClip = React.memo(({ clip, isSelected, onClick, onRemove, onTrimUpdate }) => {
    const [thumbnails, setThumbnails] = useState([]);
    const [localTrimStart, setLocalTrimStart] = useState(clip.trimStart || 0);
    const [localTrimEnd, setLocalTrimEnd] = useState(clip.trimEnd || clip.duration);
    const [isDraggingStart, setIsDraggingStart] = useState(false);
    const [isDraggingEnd, setIsDraggingEnd] = useState(false);
    const clipRef = useRef(null);

    useEffect(() => {
        if (!clip.url || clip.type !== 'video') return;

        const generateThumbnails = async () => {
            const video = document.createElement('video');
            video.src = clip.url;
            video.crossOrigin = 'anonymous';

            await new Promise((resolve) => {
                video.onloadedmetadata = resolve;
            });

            const canvas = document.createElement('canvas');
            // Increase resolution for better quality (2x the display size)
            canvas.width = 240;  // Was 120
            canvas.height = 135; // Was 68
            const ctx = canvas.getContext('2d', {
                alpha: false,
                desynchronized: true,
                willReadFrequently: false
            });

            const thumbs = [];
            const interval = clip.duration / 8; // 8 thumbnails

            for (let i = 0; i < 8; i++) {
                video.currentTime = i * interval;
                await new Promise((resolve) => {
                    video.onseeked = resolve;
                });

                // Use high-quality rendering
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                thumbs.push(canvas.toDataURL('image/jpeg', 0.9)); // Increase JPEG quality to 0.9
            }

            setThumbnails(thumbs);
        };

        generateThumbnails();
    }, [clip.url, clip.duration, clip.type]);

    const handleTrimStartDrag = (e) => {
        if (!isDraggingStart) return;

        const rect = clipRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newStart = percentage * clip.duration;

        if (newStart < localTrimEnd - 0.5) {
            setLocalTrimStart(newStart);
        }
    };

    const handleTrimEndDrag = (e) => {
        if (!isDraggingEnd) return;

        const rect = clipRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newEnd = percentage * clip.duration;

        if (newEnd > localTrimStart + 0.5) {
            setLocalTrimEnd(newEnd);
        }
    };

    const handleMouseUp = () => {
        if (isDraggingStart || isDraggingEnd) {
            onTrimUpdate(clip.id, localTrimStart, localTrimEnd);
        }
        setIsDraggingStart(false);
        setIsDraggingEnd(false);
    };

    useEffect(() => {
        if (isDraggingStart || isDraggingEnd) {
            document.addEventListener('mousemove', isDraggingStart ? handleTrimStartDrag : handleTrimEndDrag);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', isDraggingStart ? handleTrimStartDrag : handleTrimEndDrag);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDraggingStart, isDraggingEnd, localTrimStart, localTrimEnd]);

    const trimStartPercent = (localTrimStart / clip.duration) * 100;
    const trimEndPercent = (localTrimEnd / clip.duration) * 100;

    return (
        <div
            ref={clipRef}
            onClick={onClick}
            className={`
                relative rounded-lg cursor-pointer transition-all overflow-hidden
                ${isSelected
                    ? 'ring-2 ring-indigo-500 shadow-lg'
                    : 'ring-1 ring-slate-200 hover:ring-indigo-300'
                }
            `}
            style={{ width: `${Math.max(clip.duration * 150, 1)}px`, height: '120px' }}
        >
            {/* Thumbnails */}
            <div className="absolute inset-0 flex">
                {thumbnails.length > 0 ? (
                    thumbnails.map((thumb, i) => (
                        <img
                            key={i}
                            src={thumb}
                            alt=""
                            className="flex-1 object-cover"
                            style={{
                                imageRendering: 'high-quality',
                                WebkitBackfaceVisibility: 'hidden',
                                backfaceVisibility: 'hidden'
                            }}
                        />
                    ))
                ) : (
                    <div className="flex-1 bg-slate-200 flex items-center justify-center">
                        <div className="text-slate-400 text-xs">Загрузка...</div>
                    </div>
                )}
            </div>

            {/* Trim Overlays */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Left trim overlay */}
                <div
                    className="absolute top-0 bottom-0 bg-black/60"
                    style={{
                        left: 0,
                        width: `${trimStartPercent}%`
                    }}
                />
                {/* Right trim overlay */}
                <div
                    className="absolute top-0 bottom-0 bg-black/60"
                    style={{
                        right: 0,
                        width: `${100 - trimEndPercent}%`
                    }}
                />
            </div>

            {/* Trim Handles */}
            {isSelected && (
                <>
                    {/* Start handle */}
                    <div
                        className="absolute top-0 bottom-0 w-2 bg-yellow-400 cursor-ew-resize pointer-events-auto z-10 hover:w-3 transition-all"
                        style={{ left: `${trimStartPercent}%` }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsDraggingStart(true);
                        }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full" />
                    </div>

                    {/* End handle */}
                    <div
                        className="absolute top-0 bottom-0 w-2 bg-yellow-400 cursor-ew-resize pointer-events-auto z-10 hover:w-3 transition-all"
                        style={{ left: `${trimEndPercent}%` }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsDraggingEnd(true);
                        }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full" />
                    </div>
                </>
            )}

            {/* Clip Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-white truncate">
                            {clip.name}
                        </p>
                        <p className="text-[9px] text-white/80">
                            {formatTime(localTrimEnd - localTrimStart)}
                        </p>
                    </div>
                    <div className="flex gap-1">
                        {/* Removed internal split button to favor the sidebar tool */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="p-1 hover:bg-red-500/20 rounded transition-all"
                        >
                            <Trash2 size={12} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

const Timeline = ({ onOpenAddMedia }) => {
    const { clips, removeClip, selectedClipId, setSelectedClipId, addClip, updateClip, splitClip, currentTime, setCurrentTime, isPlaying, play, pause } = useEditor();
    const timelineRef = useRef(null);
    const [activeTool, setActiveTool] = useState('select'); // 'select', 'split', 'delete'

    const getTotalDuration = () => {
        return clips.reduce((total, clip) => Math.max(total, clip.startTime + clip.duration), 0);
    };

    const handleTimelineClick = (e) => {
        if (!timelineRef.current || clips.length === 0) return;

        // If clicking on background, just move playhead
        const rect = timelineRef.current.getBoundingClientRect();
        const scrollLeft = timelineRef.current.scrollLeft;
        const paddingLeft = 16; // Start of content due to p-4
        const clickX = e.clientX - rect.left + scrollLeft - paddingLeft;

        // Calculate time based on pixels (150px per second)
        const newTime = clickX / 150;

        setCurrentTime(Math.max(0, Math.min(newTime, getTotalDuration())));
    };

    const handleClipClick = (e, clip) => {
        e.stopPropagation();

        if (activeTool === 'delete') {
            removeClip(clip.id);
            return;
        }

        if (activeTool === 'split') {
            if (!timelineRef.current) return;

            // Calculate exact click position on the timeline
            const rectTimeline = timelineRef.current.getBoundingClientRect();
            const scrollLeft = timelineRef.current.scrollLeft;
            const paddingLeft = 16; // Start of content due to p-4
            const clickXTimeline = e.clientX - rectTimeline.left + scrollLeft - paddingLeft;
            const absoluteClickTime = clickXTimeline / 150;

            // Calculate offset relative to clip start
            const relativeSplitTime = absoluteClickTime - clip.startTime;

            // Validate boundaries (ensure we don't split at edges or outside)
            if (relativeSplitTime > 0.1 && relativeSplitTime < clip.duration - 0.1) {
                splitClip(clip.id, relativeSplitTime);
            }
            return;
        }

        // Default: Select
        setSelectedClipId(clip.id);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const mediaItemData = e.dataTransfer.getData('mediaItem');
        if (!mediaItemData) return;

        try {
            const item = JSON.parse(mediaItemData);
            // Check if file exists in history context (simulated check since we use direct object)
            // In a real app we might fetch the blob here if needed, but we have the URL
            addClip({
                type: item.type,
                url: item.url,
                name: item.prompt || item.name || 'Untitled',
                duration: item.duration || 5 // Default 5s if duration missing
            });
        } catch (err) {
            console.error('Failed to parse dropped item', err);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleTrimUpdate = (clipId, trimStart, trimEnd) => {
        updateClip(clipId, {
            trimStart,
            trimEnd,
            duration: trimEnd - trimStart
        });
    };

    const videoClips = clips.filter(c => c.type === 'video');
    const audioClips = clips.filter(c => c.type === 'audio');

    // Calculate total width based on duration (150px per second) + some padding
    const timelineWidthPx = getTotalDuration() * 150 + 200;
    const timelineWidth = Math.max(timelineWidthPx, 0); // Ensure it's a number, will use min-width 100% in style

    // Auto-scroll when playing
    useEffect(() => {
        if (isPlaying && timelineRef.current) {
            const playheadPos = currentTime * 150;
            const scrollLeft = timelineRef.current.scrollLeft;
            const clientWidth = timelineRef.current.clientWidth;

            // If playhead moves close to the right edge (within 100px), scroll right
            if (playheadPos > scrollLeft + clientWidth - 100) {
                timelineRef.current.scrollTo({ left: playheadPos - 100, behavior: 'smooth' });
            }
            // Optional: If playhead jumps back (loop), scroll left
            if (playheadPos < scrollLeft) {
                timelineRef.current.scrollTo({ left: playheadPos - 50, behavior: 'smooth' });
            }
        }
    }, [currentTime, isPlaying]);

    const getCursorStyle = () => {
        switch (activeTool) {
            case 'split': return 'cursor-crosshair';
            case 'delete': return 'cursor-not-allowed'; // or alias
            default: return 'cursor-default';
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Timeline Header with Playback Controls */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <Scissors size={18} className="text-slate-600" />
                    <h2 className="text-base font-bold text-slate-900">Timeline</h2>
                    <span className="text-xs text-slate-500">
                        Длительность: {formatTime(getTotalDuration())}
                    </span>
                </div>

                {/* Centered Playback Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentTime(0)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                        disabled={clips.length === 0}
                        title="В начало"
                    >
                        <SkipBack size={18} className="text-slate-600" />
                    </button>
                    <button
                        onClick={() => isPlaying ? pause() : play()}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        disabled={clips.filter(c => c.type === 'video').length === 0}
                        title={isPlaying ? 'Пауза' : 'Воспроизвести'}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div className="text-xs text-slate-600 font-mono min-w-[80px] text-center">
                        {formatTime(currentTime)} / {formatTime(getTotalDuration())}
                    </div>
                </div>

                <button
                    onClick={onOpenAddMedia}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all flex items-center gap-2"
                >
                    <Upload size={16} />
                    Добавить файл
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 relative">

                {/* Tools Sidebar */}
                <div className="w-12 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-2 z-20 shadow-sm">
                    <button
                        onClick={() => setActiveTool('select')}
                        className={`p-2 rounded-lg transition-all ${activeTool === 'select'
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'text-slate-500 hover:bg-slate-100'
                            }`}
                        title="Выделение (V)"
                    >
                        <MousePointer2 size={18} />
                    </button>
                    <button
                        onClick={() => setActiveTool(activeTool === 'split' ? 'select' : 'split')}
                        className={`p-2 rounded-lg transition-all ${activeTool === 'split'
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'text-slate-500 hover:bg-slate-100'
                            }`}
                        title="Разрезка (C)"
                    >
                        <Scissors size={18} />
                    </button>
                    <button
                        onClick={() => setActiveTool(activeTool === 'delete' ? 'select' : 'delete')}
                        className={`p-2 rounded-lg transition-all ${activeTool === 'delete'
                            ? 'bg-red-100 text-red-600'
                            : 'text-slate-500 hover:bg-slate-100'
                            }`}
                        title="Удаление (Del)"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Main Scrollable Timeline */}
                <div
                    ref={timelineRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={`flex-1 overflow-auto relative p-4 ${getCursorStyle()}`}
                    onClick={handleTimelineClick}
                >
                    {clips.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-400 text-xs text-center">
                                Перетащите сюда видео или аудио из медиатеки<br />
                                <span className="text-[10px]">Используйте инструменты слева для монтажа</span>
                            </p>
                        </div>
                    ) : (
                        <div style={{ width: timelineWidth || '100%', minWidth: '100%' }} className="relative pb-8">
                            {/* Playhead Layer */}
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                                style={{
                                    left: `${currentTime * 150}px`,
                                    // transition: 'left 0.1s linear' // Removed for rAF smoothness
                                }}
                            >
                                <div className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 rounded-full shadow-lg" />
                                <div className="absolute -top-6 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30">
                                    {formatTime(currentTime)}
                                </div>
                                <div className="absolute top-0 bottom-0 w-px bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
                            </div>

                            <div className="space-y-6">
                                {videoClips.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-2 sticky left-0">
                                            <span className="w-1 h-4 bg-indigo-500 rounded"></span>
                                            Видео
                                        </p>
                                        <div className="flex h-[120px]">
                                            {videoClips.map((clip) => (
                                                <div key={clip.id} className="flex-shrink-0">
                                                    <TimelineClip
                                                        clip={clip}
                                                        isSelected={selectedClipId === clip.id}
                                                        onClick={(e) => handleClipClick(e, clip)}
                                                        onRemove={() => removeClip(clip.id)}
                                                        onTrimUpdate={handleTrimUpdate}
                                                    // onSplit prop removed as it caused re-renders and was unused inside
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {audioClips.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-2 sticky left-0">
                                            <span className="w-1 h-4 bg-purple-500 rounded"></span>
                                            Аудио
                                        </p>
                                        <div className="flex h-[80px]">
                                            {audioClips.map((clip) => (
                                                <div key={clip.id} className="flex-shrink-0">
                                                    <AudioClip
                                                        clip={clip}
                                                        isSelected={selectedClipId === clip.id}
                                                        onClick={(e) => handleClipClick(e, clip)}
                                                        onRemove={() => removeClip(clip.id)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Timeline;
