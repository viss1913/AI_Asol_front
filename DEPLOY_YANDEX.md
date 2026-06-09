# Деплой статики в Yandex Object Storage

Краткая инструкция для программиста: как залить фронт в бакет и проверить сайт.

> **Секреты не в этом файле.** Ключи передаются отдельно (лично / в защищённом канале). В репозиторий не коммитить.

---

## 1. Переменные окружения (`.env` в корне проекта)

Создай файл `.env` в корне репозитория (не коммитить в git):

```env
# API (если фронт ходит в бэкенд)
VITE_API_BASE_URL=https://pfp-api.bank-future.com/api

# Yandex Object Storage — S3-совместимый API
AWS_ACCESS_KEY_ID=<вставить из консоли Yandex Cloud>
AWS_SECRET_ACCESS_KEY=<вставить из консоли Yandex Cloud>
BUCKET_NAME=<имя-бакета-для-этого-проекта>

# Опционально:
YC_S3_ENDPOINT=https://storage.yandexcloud.net
YC_S3_PREFIX=
AWS_DEFAULT_REGION=ru-central1
```

| Переменная | Обязательно | Пояснение |
|------------|------------|-----------|
| `AWS_ACCESS_KEY_ID` | да | Static access key, сервисный аккаунт Object Storage |
| `AWS_SECRET_ACCESS_KEY` | да | Секрет ключа |
| `BUCKET_NAME` | да | Имя бакета (у каждого проекта/окружения свой) |
| `YC_S3_ENDPOINT` | нет | По умолчанию `https://storage.yandexcloud.net` |
| `YC_S3_PREFIX` | нет | Префикс «папки» внутри бакета, если нужно разделить проекты в одном бакете |

**Несколько бакетов:** один и тот же `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` часто работает для всех бакетов, если в IAM у ключа есть права на нужные бакеты. Меняется только `BUCKET_NAME` (и при необходимости `YC_S3_PREFIX`).

---

## 2. Зависимости и сборка

```bash
npm ci
npm run build
```

Результат: папка `dist/` со статикой (HTML, JS, CSS, картинки).

---

## 3. Заливка в бакет

Нужны **AWS CLI** (установлен) или скрипт на Node (см. ниже).

### Вариант A — AWS CLI (рекомендуется для проверки)

```bash
aws s3 sync dist/ s3://ИМЯ_БАКЕТА/ --endpoint-url https://storage.yandexcloud.net --delete
```

`--delete` удаляет в бакете файлы, которых нет в `dist/` (актуально после предыдущих деплоев).

Проверка:

```bash
aws s3 ls s3://ИМЯ_БАКЕТА/ --endpoint-url https://storage.yandexcloud.net
```

### Вариант B — npm-скрипты (как в проекте PFP Finam)

Если в репозитории есть скрипты `upload-to-yandex-bucket.mjs` / `load-env.mjs` (скопировать из референсного фронта PFP):

```bash
npm run upload:yandex
```

Или одной командой:

```bash
npm run deploy:yandex
```

(сначала `build`, потом upload)

### Проверка доступа к бакету

```bash
npm run test:yandex-s3
```

или вручную:

```bash
aws s3 ls s3://ИМЯ_БАКЕТА/ --endpoint-url https://storage.yandexcloud.net
```

---

## 4. SPA и вложенные пути

Если сайт открывается по корню домена, а маршруты вроде `/sber`, `/register` — после `npm run build` нужно положить `index.html` в подпапки (иначе CDN отдаст 404):

```bash
# пример для репозитория с copy-spa-fallbacks.mjs
node scripts/copy-spa-fallbacks.mjs
```

Список путей зависит от проекта — смотри `scripts/copy-spa-fallbacks.mjs` или роутинг в приложении.

---

## 5. Website hosting / CDN (Яндекс)

В консоли Yandex Cloud для бакета:

- **Website**: главная страница и страница ошибки → `index.html`
- При необходимости привязать домен и HTTPS (Certificate Manager + DNS, см. внутреннюю документацию по инфраструктуре)

Служебный URL бакета (пример):  
`http://ИМЯ-БАКЕТА.website.yandexcloud.net`

Публичный сайт обычно идёт через **Cloud CDN**, а не напрямую с website endpoint.

---

## 6. Права в Yandex Cloud (IAM)

Минимум для деплоя статики:

- Сервисному аккаунту: **роль** с правами на запись в нужный бакет (`storage.editor` / кастомная политика на `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` для префикса бакета).

Публичное чтение объектов — отдельная политика на `storage.viewer` для анонимного/публичного доступа к статике (если нужно).

---

## 7. Чеклист после деплоя

1. `aws s3 ls` / открытие сайта — главная грузится.
2. DevTools → Network — нет 404 на JS/CSS (кроме ожидаемых API-запросов).
3. Жёсткое обновление в браузере (Ctrl+F5) или инкогнито.

---

## Референс (проект PFP Finam)

В репозитории `Front PFP ver 3` уже настроено:

- `scripts/upload-to-yandex-bucket.mjs` — заливка через AWS SDK
- `scripts/load-env.mjs` — чтение `.env`
- `docs/DEPLOY_YANDEX.md` — расширенная версия с security-check

Можно скопировать эти скрипты в video-front или адаптировать `package.json` scripts.

---

## Контакты / вопросы

- Имя бакета для prod/stage?
- Отдельный CDN-домен или только `*.website.yandexcloud.net`?
- Нужен ли `YC_S3_PREFIX` для этого репозитория?
