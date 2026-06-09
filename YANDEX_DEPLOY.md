# Деплой на Яндекс Object Storage

## Автодеплой (рекомендуется)

1. Скопируйте [`.env.example`](.env.example) в `.env` и заполните:
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — ключи сервисного аккаунта с правами на бакет
   - `BUCKET_NAME` — имя бакета (например `ai-asol.ru`)
   - `YANDEX_STORAGE_ENDPOINT` — по умолчанию `https://storage.yandexcloud.net`

2. Установите [AWS CLI v2](https://aws.amazon.com/cli/).

3. В корне проекта:

```powershell
npm run deploy:yandex
```

Скрипт [`scripts/deploy-yandex.mjs`](scripts/deploy-yandex.mjs) выполнит `npm run build` и `aws s3 sync dist/ s3://BUCKET/ --delete`.

**Не коммитьте `.env`** — он в `.gitignore`.

## Ручная заливка

```powershell
npm run build
```

Загрузите **всё содержимое** папки `dist/` в **корень** бакета (не папку `dist` целиком).

Архив `yandex-bucket-dist.zip` можно распаковать в корень бакета.

## Настройка бакета

1. [Консоль Яндекс Облака](https://console.cloud.yandex.ru/) → Object Storage → бакет.
2. **Веб-сайт** → хостинг:
   - Главная страница: `index.html`
   - Страница ошибки: `index.html` (SPA-роутинг)
3. Публичный доступ на чтение объектов.
4. Домен: CNAME на endpoint бакета (раздел «Домены»).

## Прод API

Сборка берёт [`VITE_API_BASE_URL`](.env.production) из `.env.production` (Railway).

## После деплоя

- Откройте сайт в **инкогнито** и в DevTools → Network проверьте новый хэш `index-*.js`.
- Если включён **CDN** — сбросьте кэш или подождите инвалидацию.
- Убедитесь, что в бакете есть `robots.txt`, `sitemap.xml`, `ffmpeg/` (если нужен локальный wasm).

## Проверка медиа (плеер / CORS)

- Видео должно грузиться через `.../api/v1/videos/proxy?url=...`, не напрямую с `r2.dev`.
- Скачивание — через `GET /api/v1/history/:id/download` с Bearer.
