API Documentation for Frontend
Base URL
http://localhost:3000/api/v1

Authentication
Register
Create a new user account.

Endpoint: POST /auth/register

Body:

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "confirmPassword": "securepassword"
}
Response (201 Created):

{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "balance": 0
  }
}
Content Generation (Requires Auth Token)
Header: Authorization: Bearer <token>

Generate Image
Endpoint: POST /images/generate Body:

{
  "prompt": "description",
  "model": "z-image"
}
Edit Image (Gemini Flash)
Endpoint: POST /images/generate Body:

{
  "prompt": "edit description",
  "model": "gemini-flash-image",
  "image_url": "https://..."
}