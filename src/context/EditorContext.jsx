import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateId } from '../utils/editorUtils';

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
    const [clips, setClips] = useState([]); // Video/audio clips on timeline
    const [currentTime, setCurrentTime] = useState(0); // Playback position in seconds
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedClipId, setSelectedClipId] = useState(null);
    const [projectSettings, setProjectSettings] = useState({
        resolution: '1920x1080',
        fps: 30,
        duration: 0
    });

    // Add clip to timeline
    const addClip = useCallback((clipData) => {
        const newClip = {
            id: generateId(),
            ...clipData,
            startTime: clips.reduce((acc, clip) => acc + clip.duration, 0), // Auto-position at end
            duration: clipData.duration || 0,
            trimStart: 0,
            trimEnd: clipData.duration || 0,
            hasAudio: clipData.type === 'video' // Track if video has audio
        };

        setClips(prev => {
            const newClips = [...prev, newClip];

            // If it's a video, also add its audio track
            if (clipData.type === 'video') {
                const audioClip = {
                    id: generateId(),
                    type: 'audio',
                    url: clipData.url,
                    name: `${clipData.name} (аудио)`,
                    duration: clipData.duration || 0,
                    startTime: newClip.startTime,
                    trimStart: 0,
                    trimEnd: clipData.duration || 0,
                    sourceVideoId: newClip.id, // Link to parent video
                    volume: 1.0
                };
                newClips.push(audioClip);
            }

            return newClips;
        });

        return newClip.id;
    }, [clips]);

    // Remove clip from timeline
    const removeClip = useCallback((clipId) => {
        setClips(prev => prev.filter(clip => clip.id !== clipId));
        if (selectedClipId === clipId) {
            setSelectedClipId(null);
        }
    }, [selectedClipId]);

    // Update clip properties
    const updateClip = useCallback((clipId, updates) => {
        setClips(prev => prev.map(clip =>
            clip.id === clipId ? { ...clip, ...updates } : clip
        ));
    }, []);

    // Split clip at specific time
    const splitClip = useCallback((clipId, splitTime) => {
        setClips(prev => {
            const clipIndex = prev.findIndex(c => c.id === clipId);
            if (clipIndex === -1) return prev;

            const clip = prev[clipIndex];

            // Create two new clips from the split
            const firstClip = {
                ...clip,
                id: generateId(),
                duration: splitTime,
                trimEnd: clip.trimStart + splitTime
            };

            const secondClip = {
                ...clip,
                id: generateId(),
                duration: clip.duration - splitTime,
                trimStart: clip.trimStart + splitTime,
                startTime: clip.startTime + splitTime
            };

            // Replace original clip with two new clips
            const newClips = [...prev];
            newClips.splice(clipIndex, 1, firstClip, secondClip);
            return newClips;
        });
    }, []);

    // Reorder clips
    const reorderClips = useCallback((fromIndex, toIndex) => {
        setClips(prev => {
            const newClips = [...prev];
            const [removed] = newClips.splice(fromIndex, 1);
            newClips.splice(toIndex, 0, removed);

            // Recalculate start times
            let currentStart = 0;
            return newClips.map(clip => {
                const updatedClip = { ...clip, startTime: currentStart };
                currentStart += clip.duration;
                return updatedClip;
            });
        });
    }, []);

    // Get total project duration
    const getTotalDuration = useCallback(() => {
        return clips.reduce((acc, clip) => acc + clip.duration, 0);
    }, [clips]);

    // Clear all clips
    const clearTimeline = useCallback(() => {
        setClips([]);
        setSelectedClipId(null);
        setCurrentTime(0);
    }, []);

    // Playback controls
    const play = useCallback(() => setIsPlaying(true), []);
    const pause = useCallback(() => setIsPlaying(false), []);
    const stop = useCallback(() => {
        setIsPlaying(false);
        setCurrentTime(0);
    }, []);

    const value = {
        clips,
        currentTime,
        isPlaying,
        selectedClipId,
        projectSettings,
        addClip,
        removeClip,
        updateClip,
        splitClip,
        reorderClips,
        getTotalDuration,
        clearTimeline,
        setCurrentTime,
        setSelectedClipId,
        setProjectSettings,
        play,
        pause,
        stop
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};
