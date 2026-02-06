# API Documentation for Video Studio AI

## Base URL
`https://твой-домен.railway.app/api/v1`

---

### 1. Профиль и баланс
`GET /auth/me` (Auth Required)
- **Использование**: Получение текущих данных пользователя и баланса.
- **Ответ**: `{ "id": 1, "name": "Имя", "balance": 500.0, ... }`

### 2. Проекты (Projects)
`POST /projects` (Auth Required)
- **Body**: `{ "title": "Мой Проект", "description": "Описание" }`
- **Ответ**: `{ "id": "uuid", "title": "...", ... }`

`GET /projects` (Auth Required)
- Возвращает список проектов со счетчиками задач и чатов.

`GET /projects/:projectId` (Auth Required)
- Возвращает детали проекта и **весь привязанный контент** (tasks, chats).

### 3. Генерация Изображений
`POST /images/generate` (Auth Required)
- **Body**: 
  ```json
  { 
    "prompt": "cyberpunk city", 
    "model": "z-image",
    "projectId": "optional-uuid" 
  }
  ```
- **Ответ**: `{ "result": ["https://..."], "newBalance": 480.0 }`

### 4. Чат с Ассоль (Gemini)
`POST /chat/send` (Auth Required)
- **Body**: 
  ```json
  { 
    "message": "Привет!", 
    "chatId": "optional-uuid",
    "projectId": "optional-uuid" 
  }
  ```
- **Ответ**: `{ "message": { "content": "..." }, "newBalance": 479.98 }`

### 5. Генерация Видео (Veo 3.1)
`POST /video/generate` (Auth Required)
- **Параметры**:
  - `prompt`: Описание видео и речи персонажа.
  - `projectId`: (Опционально) UUID проекта.
  - `image_url`: (Опционально) Фото для анимации (Image-to-Video).
  - `duration`: 5 или 10 секунд.
  - `audio`: true/false (включает озвучку).
  - `aspect_ratio`: "16:9", "9:16" или "1:1".
- **Ответ**: `{ "resultUrl": "https://...", "newBalance": 280.0, "cost": 200.0 }`

---

## Тарификация (x2 Маркап)
- **Фото**: 20 ₽
- **Видео (Veo 3.1 со звуком)**: 200 ₽ / сек
- **Видео (Veo 3.1 без звука)**: 100 ₽ / сек
- **Чат**: Вход 0.25 ₽ / Выход 1.5 ₽ (за 1к токенов)
