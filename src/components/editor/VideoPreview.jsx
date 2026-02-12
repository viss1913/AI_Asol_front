import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, Film } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { formatTime } from '../../utils/editorUtils';

const VideoPreview = () => {
    const { clips, currentTime, setCurrentTime, isPlaying, setIsPlaying, play, pause } = useEditor();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Get current clip info (clip, global start time, local offset)
    const getCurrentClip = () => {
        const videoClips = clips.filter(c => c.type === 'video');
        if (videoClips.length === 0) return null;

        let accumulatedTime = 0;
        for (let i = 0; i < videoClips.length; i++) {
            if (currentTime < accumulatedTime + videoClips[i].duration) {
                return {
                    clip: videoClips[i],
                    index: i,
                    startTime: accumulatedTime,
                    offset: currentTime - accumulatedTime
                };
            }
            accumulatedTime += videoClips[i].duration;
        }
        // Return last clip if at the very end
        const lastClip = videoClips[videoClips.length - 1];
        return {
            clip: lastClip,
            index: videoClips.length - 1,
            startTime: accumulatedTime - lastClip.duration,
            offset: lastClip.duration
        };
    };

    const currentClipData = getCurrentClip();
    const totalDuration = clips.filter(c => c.type === 'video').reduce((acc, c) => acc + c.duration, 0);

    // Sync Context -> Video (Seeking/Scrubbing)
    useEffect(() => {
        if (videoRef.current && currentClipData) {
            // Calculate where the video player SHOULD be based on global time
            const targetVideoTime = currentTime - currentClipData.startTime;

            // Only seek if deviation is significant (> 0.2s) to avoid fighting with playback updates
            if (Math.abs(videoRef.current.currentTime - targetVideoTime) > 0.2) {
                videoRef.current.currentTime = targetVideoTime;
            }
        }
    }, [currentTime, currentClipData?.startTime, currentClipData?.clip?.id]);

    // Playback State Management & rAF Loop
    useEffect(() => {
        if (!videoRef.current || !currentClipData) return;

        let animationFrameId;

        const updateTime = () => {
            if (videoRef.current && !videoRef.current.paused) {
                const videoTime = videoRef.current.currentTime;
                // Global time is Clip Start + Local Video Time
                const globalTime = currentClipData.startTime + videoTime;

                // Update context (60fps)
                setCurrentTime(globalTime);

                // Check for end of clip
                if (videoTime >= currentClipData.clip.duration - 0.05) {
                    if (globalTime >= totalDuration - 0.1) {
                        pause();
                        setCurrentTime(0);
                    }
                    // Else: next render cycle will handle clip switch
                }

                animationFrameId = requestAnimationFrame(updateTime);
            }
        };

        if (isPlaying) {
            videoRef.current.play()
                .then(() => {
                    animationFrameId = requestAnimationFrame(updateTime);
                })
                .catch(e => console.log('Playback prevented:', e));
        } else {
            videoRef.current.pause();
            cancelAnimationFrame(animationFrameId);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPlaying, currentClipData?.clip?.id]); // Re-trigger play if clip changes

    // Sync Video -> Context (Playback) - Kept for seeking/scrubbing updates only
    const handleTimeUpdate = () => {
        if (isPlaying) return; // Ignore timeupdate events during playback, let rAF handle it

        if (!videoRef.current || !currentClipData) return;
        // ... (rest of logic for seek/scrub sync if needed)
        // Actually, for scrubbing we usually drive Context -> Video. 
        // But if video loops or seeks internally? 
        // Let's keep a simplified version for non-playback updates.
        const videoTime = videoRef.current.currentTime;
        const globalTime = currentClipData.startTime + videoTime;
        if (Math.abs(globalTime - currentTime) > 0.1) {
            setCurrentTime(globalTime);
        }
    };

    const handleVideoEnded = () => {
        // Force move to next clip start if video ends naturally
        if (currentClipData) {
            const nextClipStartTime = currentClipData.startTime + currentClipData.clip.duration + 0.01;
            if (nextClipStartTime < totalDuration) {
                setCurrentTime(nextClipStartTime);
                // Keep playing, useEffect will trigger play() on new src
            } else {
                pause();
                setCurrentTime(0);
            }
        }
    };

    return (
        <div className="space-y-3">
            {/* Video Display */}
            <div className="h-64 bg-slate-900 rounded-xl overflow-hidden relative">
                {currentClipData && currentClipData.clip ? (
                    <video
                        ref={videoRef}
                        src={currentClipData.clip.url}
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleVideoEnded}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-slate-400">
                            <Film size={40} className="mx-auto mb-2 opacity-50" />
                            <p className="text-base font-bold">Превью видео</p>
                            <p className="text-sm">Добавьте видео на timeline</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls - Timeline Scrubber Only */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                            <span className="font-mono">{formatTime(currentTime)}</span>
                            <span className="font-mono">{formatTime(totalDuration)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={totalDuration || 100}
                            step="0.01"
                            value={currentTime}
                            onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};


export default VideoPreview;
