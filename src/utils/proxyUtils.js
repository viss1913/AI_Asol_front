/**
 * URL для <img src> / превью: публичный R2 (pub-*.r2.dev) грузим напрямую.
 * Прокси /videos/proxy для картинок часто отдаёт не то тело ответа — превью чёрное/пустое.
 * Для fetch / скачивания по-прежнему используй getProxyUrl.
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
 * Helper to proxy URLs in development to avoid CORS issues.
 * In production, returns original URLs (no proxy needed).
 * @param {string} url - The URL to process
 * @returns {string} - The processed URL
 */
export const getProxyUrl = (url) => {
    if (!url) return '';
    // Already relative or blob — return as is
    if (url.startsWith('/') || url.startsWith('blob:')) return url;

    // Handle paths starting with uploads/
    if (url.startsWith('uploads/')) {
        return '/' + url;
    }

    // In production — use backend proxy for R2 storage to avoid CORS issues
    if (!import.meta.env.DEV) {
        if (url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')) {
            // Use the API base URL to build the proxy path
            const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';

            // If it's a relative path (like /api/v1), we should make it absolute if needed,
            // but usually VITE_API_BASE_URL is absolute in production env.
            return `${apiBase}/videos/proxy?url=${encodeURIComponent(url)}`;
        }
        return url;
    }

    // --- Development only: proxy through Vite dev server ---
    try {
        const urlObj = new URL(url);

        // Cloudflare R2 storage — proxy through /r2-media
        if (urlObj.hostname.includes('r2.dev') || urlObj.hostname.includes('r2.cloudflarestorage.com')) {
            const proxyUrl = '/r2-media' + urlObj.pathname + urlObj.search;
            console.log(`[Proxy] R2 URL (DEV): ${url} -> ${proxyUrl}`);
            return proxyUrl;
        }

        // Railway backend — proxy through Vite /api or /uploads
        if (urlObj.hostname.includes('railway.app') || urlObj.hostname.includes('asol')) {
            const proxyUrl = urlObj.pathname + urlObj.search;
            console.log(`[Proxy] Backend URL (DEV): ${url} -> ${proxyUrl}`);
            return proxyUrl;
        }
    } catch (e) {
        // Not a valid absolute URL, return as is
    }

    return url;
};
