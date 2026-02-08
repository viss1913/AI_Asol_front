# API Documentation

## Authentication & Profiles

### Register
**POST** `/api/v1/auth/register`
- **Body:**
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
- **Response:** `201 Created`
  - Returns JWT token and user info.
  - **Bonus:** New users start with **60 RUB** balance.

### Login
**POST** `/api/v1/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** `200 OK` (Token + User)

### Get Profile
**GET** `/api/v1/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` (User details + Balance)

---

## Password Reset (Email Verification)

### 1. Request Password Reset
**POST** `/api/v1/auth/forgot-password`
- **Body:**
  ```json
  { "email": "user@example.com" }
  ```
- **Action:** Sends an email with a reset link (token) via Yandex SMTP.
- **Response:** `200 OK` `{ "message": "Password reset email sent" }`

### 2. Reset Password
**POST** `/api/v1/auth/reset-password`
- **Body:**
  ```json
  {
    "token": "token_from_email",
    "newPassword": "new_secure_password"
  }
  ```
- **Response:** `200 OK` `{ "message": "Password reset successfully" }`

---

## Payments (T-Bank / Tinkoff)

### Initialize Payment
**POST** `/api/v1/payments/init`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  { "amount": 100 }
  ```
- **Response:** `200 OK`
  ```json
  {
    "paymentUrl": "https://securepay.tinkoff.ru/v2/...",
    "paymentId": 123
  }
  ```
- **Action:** Redirect user to `paymentUrl` to complete payment.

### Check Status (Manual)
**GET** `/api/v1/payments/status/:paymentId`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` (T-Bank raw status)

### Webhook (Automatic)
**POST** `/api/v1/payments/webhook`
- **Headers:** _None (Called by T-Bank)_
- **Action:**
  - Verifies token signature.
  - Updates payment status to `completed`.
  - **Increments user balance** by the payment amount.
  - Creates a generic `Transaction` record.

---

## Configuration

### Get Pricing
**GET** `/api/v1/config/pricing`
- **Response:** `200 OK`
  ```json
  {
    "veo3": 250,
    "veo3_fast": 65,
    "gemini-2.5-flash": 60,
    "suno-v4": 60,
    ...
  }
  ```
- **Use Case:** Frontend should fetch this at startup to display current prices.

### Calculate Cost (Dynamic)
**POST** `/api/v1/config/calculate`
- **Body:**
  ```json
  {
    "model": "sora-2-pro",
    "options": {
      "duration": 15,
      "quality": "high"
    }
  }
  ```
- **Response:**
  ```json
  { "cost": 630 }
  ```
- **Use Case:** Call this when user changes duration/quality settings to show exact price.

---

## Video (Veo)

### Generate Video
**POST** `/api/v1/videos/generate`
- **Body:**
  ```json
  {
    "prompt": "A cinematic shot of...",
    "model": "veo3_fast", // or "veo3", "sora"
    "image_url": "https://...",      // (Optional) Start frame
    "image_end_url": "https://..."  // (Optional) End frame (Veo only)
  }
  ```
- **Note:** If `image_end_url` is provided, `model` should be `veo3_fast`.

### Generate Video (Sora)
**POST** `/api/v1/videos/generate`
- **Body:**
  ```json
  {
    "prompt": "A cinematic shot of...",
    "model": "sora-2-pro",
    "image_url": "https://...",      // (Optional) Start frame
    "duration": 10,                 // 10 or 15 (default: 10)
    "quality": "standard"           // "standard" or "high" (default: standard)
  }
  ```

---

## Music (Suno)

### Generate Music
**POST** `/api/v1/audio/generate`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "prompt": "Epic orchestral trailer music",
    "tags": "cinematic, intense",
    "make_instrumental": true, // or false for vocals
    "model": "suno-v4"
  }
  ```
- **Response:** `200 OK` (Job ID)

### Get ElevenLabs Voices
**GET** `/api/v1/audio/voices`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "count": 59,
    "data": [
      { "id": "Rachel", "name": "Rachel", "description": "Standard voice" },
      { "id": "pNInz6obpgDQGcFmaJgB", "name": "Adam", "description": "Dominant, Firm" },
      ...
    ]
  }
  ```

### Generate Audio (ElevenLabs)
**POST** `/api/v1/audio/elevenlabs`
- **Headers:** `Authorization: Bearer <token>`
- **Body Options:**

#### Text-to-Speech
```json
{
  "prompt": "Hello world!",
  "model": "elevenlabs/text-to-speech-turbo-2-5",
  "options": {
    "voice": "Rachel",
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}
```

#### Dialogue V3
```json
{
  "model": "elevenlabs/text-to-dialogue-v3",
  "options": {
    "stability": 0.5,
    "language_code": "auto",
    "dialogue": [
      { "text": "Привет! как твои дела?", "voice": "iP95p4xoKVk53GoZ742B" },
      { "text": "Привет , Коля! Все хорошо ", "voice": "cgSgspJ2msm6clMCkdW9" }
    ]
  }
}
```

#### Sound Effect V2
```json
{
  "prompt": "Explosion in a cave",
  "model": "elevenlabs/sound-effect-v2",
  "options": {
    "duration_seconds": 5,
    "prompt_influence": 0.3
  }
}
```

- **Pricing:**
  - `elevenlabs/text-to-speech-turbo-2-5`: 6 RUB per 1000 characters.
  - `elevenlabs/text-to-dialogue-v3`: 12 RUB per 1000 characters (total text length).
  - `elevenlabs/sound-effect-v2`: 0.50 RUB per 1 second (uses `duration_seconds`).
- **Response:** `200 OK` (Job ID)
