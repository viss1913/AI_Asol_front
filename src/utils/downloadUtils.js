import { historyService } from '../services/api';

/**
 * Скачивание результата задачи через GET /history/:id/download (Bearer).
 */
export async function downloadHistoryFile(taskId, type = 'video', filename) {
    if (!taskId) {
        throw new Error('Нет ID задачи для скачивания');
    }

    const blob = await historyService.downloadFile(taskId);
    const ext = type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : 'png';
    const name = filename || `asol-${taskId}-${Date.now()}.${ext}`;

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
}
