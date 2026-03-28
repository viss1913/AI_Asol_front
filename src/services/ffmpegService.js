import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class FFmpegService {
    constructor() {
        this.ffmpeg = null;
        this.loaded = false;
    }

    async load() {
        if (this.loaded) {
            console.log('FFmpeg already loaded');
            return;
        }

        console.log('Loading FFmpeg...');
        try {
            // Check SharedArrayBuffer support
            if (typeof SharedArrayBuffer === 'undefined') {
                throw new Error('SharedArrayBuffer is not available. COOP/COEP headers may be missing.');
            }
            console.log('SharedArrayBuffer: ✅ available');

            this.ffmpeg = new FFmpeg();

            this.ffmpeg.on('log', ({ message }) => {
                console.log('FFmpeg Log:', message);
            });

            // Use direct same-origin URLs (files in public/ffmpeg/)
            console.log('Loading FFmpeg core (direct URLs)...');
            await this.ffmpeg.load({
                coreURL: '/ffmpeg/ffmpeg-core.js',
                wasmURL: '/ffmpeg/ffmpeg-core.wasm',
            });

            this.loaded = true;
            console.log('FFmpeg loaded successfully ✅');
        } catch (error) {
            console.error('Failed to load FFmpeg:', error);
            throw error;
        }
    }

    async writeFile(fileName, data) {
        if (!this.loaded) await this.load();
        await this.ffmpeg.writeFile(fileName, await fetchFile(data));
    }

    async readFile(fileName) {
        if (!this.loaded) await this.load();
        return await this.ffmpeg.readFile(fileName);
    }

    async deleteFile(fileName) {
        if (!this.loaded) await this.load();
        await this.ffmpeg.deleteFile(fileName);
    }

    async exec(args) {
        if (!this.loaded) await this.load();
        return await this.ffmpeg.exec(args);
    }

    // Pipeline-friendly trim (leaves files on FS)
    async trim(inputFile, outputFile, startTime, endTime) {
        if (!this.loaded) await this.load();
        await this.ffmpeg.exec([
            '-i', inputFile,
            '-ss', startTime.toString(),
            '-to', endTime.toString(),
            '-c', 'copy',
            outputFile
        ]);
    }

    // Pipeline-friendly concat (leaves files on FS)
    async concat(inputFiles, outputFile) {
        if (!this.loaded) await this.load();

        const fileListContent = inputFiles.map(f => `file '${f}'`).join('\n');
        await this.ffmpeg.writeFile('filelist.txt', fileListContent);

        try {
            // Try stream copy first (fast, works when codecs match)
            await this.ffmpeg.exec([
                '-f', 'concat',
                '-safe', '0',
                '-i', 'filelist.txt',
                '-c', 'copy',
                '-movflags', '+faststart',
                outputFile
            ]);
        } catch (copyError) {
            console.warn('[FFmpeg] Stream copy failed, trying re-mux...', copyError);
            // Fallback: try without audio track
            await this.ffmpeg.exec([
                '-f', 'concat',
                '-safe', '0',
                '-i', 'filelist.txt',
                '-c:v', 'copy',
                '-an',
                outputFile
            ]);
        }

        await this.ffmpeg.deleteFile('filelist.txt');
    }

    async trimVideo(videoFile, startTime, endTime) {
        if (!this.loaded) await this.load();

        try {
            const inputName = 'input.mp4';
            const outputName = 'output.mp4';

            await this.writeFile(inputName, videoFile);
            await this.trim(inputName, outputName, startTime, endTime);
            const data = await this.readFile(outputName);

            await this.deleteFile(inputName);
            await this.deleteFile(outputName);

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
            // Write files
            const filenames = [];
            for (let i = 0; i < videoFiles.length; i++) {
                const name = `input${i}.mp4`;
                await this.writeFile(name, videoFiles[i]);
                filenames.push(name);
            }

            await this.concat(filenames, outputName);
            const data = await this.readFile(outputName);

            // Cleanup
            for (const name of filenames) await this.deleteFile(name);
            await this.deleteFile(outputName);

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
