/**
 * Convert seconds to HH:MM:SS format
 */
export const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Convert HH:MM:SS or MM:SS to seconds
 */
export const parseTime = (timeString) => {
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return parts[0] || 0;
};

/**
 * Generate thumbnail from video at specific time
 */
export const generateThumbnail = (videoFile, time = 0) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            video.currentTime = time;
        });

        video.addEventListener('seeked', () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(video.src);
                resolve(URL.createObjectURL(blob));
            }, 'image/jpeg', 0.8);
        });

        video.addEventListener('error', (e) => {
            URL.revokeObjectURL(video.src);
            reject(e);
        });

        video.src = URL.createObjectURL(videoFile);
    });
};

/**
 * Get video metadata (duration, dimensions)
 */
export const getVideoMetadata = (videoFile) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');

        video.addEventListener('loadedmetadata', () => {
            const metadata = {
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                aspectRatio: video.videoWidth / video.videoHeight
            };
            URL.revokeObjectURL(video.src);
            resolve(metadata);
        });

        video.addEventListener('error', (e) => {
            URL.revokeObjectURL(video.src);
            reject(e);
        });

        video.src = URL.createObjectURL(videoFile);
    });
};

/**
 * Validate file type
 */
export const validateFile = (file, allowedTypes) => {
    if (!file) return { valid: false, error: 'Файл не выбран' };

    const fileType = file.type.split('/')[0];
    if (!allowedTypes.includes(fileType)) {
        return {
            valid: false,
            error: `Неподдерживаемый тип файла. Разрешены: ${allowedTypes.join(', ')}`
        };
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'Файл слишком большой. Максимальный размер: 500MB'
        };
    }

    return { valid: true };
};

/**
 * Generate unique ID
 */
export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
