import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class FFmpegService {
    constructor() {
        this.ffmpeg = null;
        this.loaded = false;
    }

    async load() {
        if (this.loaded) return;

        try {
            this.ffmpeg = new FFmpeg();

            // Load FFmpeg core
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            await this.ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            this.loaded = true;
            console.log('FFmpeg loaded successfully');
        } catch (error) {
            console.error('Failed to load FFmpeg:', error);
            throw error;
        }
    }

    async trimVideo(videoFile, startTime, endTime) {
        if (!this.loaded) await this.load();

        try {
            const inputName = 'input.mp4';
            const outputName = 'output.mp4';

            // Write input file
            await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile));

            // Trim video
            await this.ffmpeg.exec([
                '-i', inputName,
                '-ss', startTime.toString(),
                '-to', endTime.toString(),
                '-c', 'copy',
                outputName
            ]);

            // Read output
            const data = await this.ffmpeg.readFile(outputName);

            // Cleanup
            await this.ffmpeg.deleteFile(inputName);
            await this.ffmpeg.deleteFile(outputName);

            return new Blob([data.buffer], { type: 'video/mp4' });
        } catch (error) {
            console.error('Trim video failed:', error);
            throw error;
        }
    }

    async concatVideos(videoFiles) {
        if (!this.loaded) await this.load();

        try {
            const outputName = 'output.mp4';
            const fileListContent = [];

            // Write all input files
            for (let i = 0; i < videoFiles.length; i++) {
                const fileName = `input${i}.mp4`;
                await this.ffmpeg.writeFile(fileName, await fetchFile(videoFiles[i]));
                fileListContent.push(`file '${fileName}'`);
            }

            // Create concat file list
            await this.ffmpeg.writeFile('filelist.txt', fileListContent.join('\n'));

            // Concat videos
            await this.ffmpeg.exec([
                '-f', 'concat',
                '-safe', '0',
                '-i', 'filelist.txt',
                '-c', 'copy',
                outputName
            ]);

            // Read output
            const data = await this.ffmpeg.readFile(outputName);

            // Cleanup
            for (let i = 0; i < videoFiles.length; i++) {
                await this.ffmpeg.deleteFile(`input${i}.mp4`);
            }
            await this.ffmpeg.deleteFile('filelist.txt');
            await this.ffmpeg.deleteFile(outputName);

            return new Blob([data.buffer], { type: 'video/mp4' });
        } catch (error) {
            console.error('Concat videos failed:', error);
            throw error;
        }
    }

    async replaceAudio(videoFile, audioFile) {
        if (!this.loaded) await this.load();

        try {
            const videoName = 'input_video.mp4';
            const audioName = 'input_audio.mp3';
            const outputName = 'output.mp4';

            // Write input files
            await this.ffmpeg.writeFile(videoName, await fetchFile(videoFile));
            await this.ffmpeg.writeFile(audioName, await fetchFile(audioFile));

            // Replace audio
            await this.ffmpeg.exec([
                '-i', videoName,
                '-i', audioName,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-map', '0:v:0',
                '-map', '1:a:0',
                '-shortest',
                outputName
            ]);

            // Read output
            const data = await this.ffmpeg.readFile(outputName);

            // Cleanup
            await this.ffmpeg.deleteFile(videoName);
            await this.ffmpeg.deleteFile(audioName);
            await this.ffmpeg.deleteFile(outputName);

            return new Blob([data.buffer], { type: 'video/mp4' });
        } catch (error) {
            console.error('Replace audio failed:', error);
            throw error;
        }
    }

    async extractAudio(videoFile) {
        if (!this.loaded) await this.load();

        try {
            const inputName = 'input.mp4';
            const outputName = 'output.mp3';

            // Write input file
            await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile));

            // Extract audio
            await this.ffmpeg.exec([
                '-i', inputName,
                '-vn',
                '-acodec', 'libmp3lame',
                '-q:a', '2',
                outputName
            ]);

            // Read output
            const data = await this.ffmpeg.readFile(outputName);

            // Cleanup
            await this.ffmpeg.deleteFile(inputName);
            await this.ffmpeg.deleteFile(outputName);

            return new Blob([data.buffer], { type: 'audio/mp3' });
        } catch (error) {
            console.error('Extract audio failed:', error);
            throw error;
        }
    }

    async getVideoDuration(videoFile) {
        if (!this.loaded) await this.load();

        try {
            const inputName = 'input.mp4';
            await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile));

            // This is a simplified approach - in production you'd parse ffprobe output
            // For now, we'll return a placeholder
            await this.ffmpeg.deleteFile(inputName);

            // TODO: Implement proper duration extraction
            return 0;
        } catch (error) {
            console.error('Get duration failed:', error);
            throw error;
        }
    }

    onProgress(callback) {
        if (this.ffmpeg) {
            this.ffmpeg.on('progress', ({ progress }) => {
                callback(Math.round(progress * 100));
            });
        }
    }

    onLog(callback) {
        if (this.ffmpeg) {
            this.ffmpeg.on('log', ({ message }) => {
                callback(message);
            });
        }
    }
}

// Singleton instance
const ffmpegService = new FFmpegService();
export default ffmpegService;
