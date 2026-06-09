/**
 * Origin бэкенда (Railway) из VITE_API_BASE_URL. В dev — пусто (относительные пути через Vite proxy).
 */
export const getApiOrigin = () => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    if (!base.startsWith('http')) return '';
    try {
        return new URL(base).origin;
    } catch {
        return '';
    }
};

/**
 * Путь с бэка (/api/v1/...) → URL для браузера.
 * На статике ai-asol.ru нельзя src="/api/v1/..." — нужен полный origin Railway.
 */
export const resolveApiPath = (path) => {
    if (!path || typeof path !== 'string') return '';
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith('/')) {
        const origin = getApiOrigin();
        return origin ? `${origin}${path}` : path;
    }
    return path;
};

/**
 * URL для <img src> / превью загруженных файлов (не history task).
 */
export const getEmbedMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('blob:')) return url;
    if (url.startsWith('/')) return url;
    if (/^https?:\/\//i.test(url)) {
        try {
            const host = new URL(url).hostname;
            if (host.includes('r2.dev') || host.includes('r2.cloudflarestorage.com')) {
                return url;
            }
        } catch {
            /* fall through */
        }
    }
    return getProxyUrl(url);
};

/**
 * Плеер / превью / seek — mediaUrls.proxy или fallback на R2 proxy.
 * Не использовать direct R2 на фронтовом домене.
 */
export const getTaskPlaybackUrl = (taskOrHistory) => {
    const t = taskOrHistory || {};
    if (t.mediaUrls?.proxy) {
        return resolveApiPath(t.mediaUrls.proxy);
    }
    if (t.playbackUrl) {
        return t.playbackUrl.startsWith('http') || t.playbackUrl.startsWith('/')
            ? resolveApiPath(t.playbackUrl)
            : t.playbackUrl;
    }
    const url =
        t.url ||
        t.resultUrl ||
        t.output_url ||
        t.video_url ||
        t.image_url ||
        (Array.isArray(t.result) ? t.result[0] : undefined);
    return getProxyUrl(url);
};

/**
 * Относительный путь download с бэка или /history/:id/download.
 */
export const getTaskDownloadPath = (taskOrHistory) => {
    const t = taskOrHistory || {};
    const id = t.id;
    if (t.mediaUrls?.download) {
        return resolveApiPath(t.mediaUrls.download);
    }
    if (id) {
        return resolveApiPath(`/history/${id}/download`);
    }
    return '';
};

/**
 * Fallback proxy для R2, если mediaUrls ещё нет (галерея /assets/all).
 */
export const getProxyUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/') || url.startsWith('blob:')) return url;

    if (url.startsWith('uploads/')) {
        return '/' + url;
    }

    if (!import.meta.env.DEV) {
        if (url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')) {
            const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
            if (apiBase.startsWith('http')) {
                return `${apiBase}/videos/proxy?url=${encodeURIComponent(url)}`;
            }
            return `/api/v1/videos/proxy?url=${encodeURIComponent(url)}`;
        }
        return url;
    }

    try {
        const urlObj = new URL(url);

        if (urlObj.hostname.includes('r2.dev') || urlObj.hostname.includes('r2.cloudflarestorage.com')) {
            const proxyUrl = '/r2-media' + urlObj.pathname + urlObj.search;
            return proxyUrl;
        }

        if (urlObj.hostname.includes('railway.app') || urlObj.hostname.includes('asol')) {
            return urlObj.pathname + urlObj.search;
        }
    } catch {
        /* not absolute */
    }

    return url;
};
