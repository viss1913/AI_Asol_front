// Generate waveform data from audio file
export const generateWaveform = async (audioUrl, samples = 100) => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Fetch audio file
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();

        // Decode audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Get channel data (use first channel for mono/stereo)
        const channelData = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(channelData.length / samples);

        // Calculate amplitude for each sample
        const waveformData = [];
        for (let i = 0; i < samples; i++) {
            const start = i * blockSize;
            const end = start + blockSize;
            let sum = 0;

            for (let j = start; j < end; j++) {
                sum += Math.abs(channelData[j]);
            }

            const amplitude = sum / blockSize;
            waveformData.push(amplitude);
        }

        // Normalize to 0-1 range
        const max = Math.max(...waveformData);
        return waveformData.map(val => val / max);
    } catch (error) {
        console.error('Failed to generate waveform:', error);
        return Array(samples).fill(0.5); // Return default waveform on error
    }
};
