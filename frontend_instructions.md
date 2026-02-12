Frontend Implementation Instructions - 6-Digit Code Verification
Overview
We are switching from a "Magic Link" to a 6-Digit Code verification system. The user will stay on your page after registration and enter the code there.

1. Registration Flow Update
User Submits Registration Form:
Backend returns 200 OK (User created, email sent).
Action: Do NOT redirect to login. Instead, show a "Verify Email" screen/modal.
2. Verify Email Screen
Create a UI with:

Message: "We sent a 6-digit code to {email}. Please enter it below."
Input Field: For the 6-digit code.
Button: "Verify".
API Call
When user submits code:

Endpoint: POST /api/v1/auth/verify-email
Body: { "email": "user@example.com", "code": "123456" }
Handling Response
Success (200 OK):
Response contains: { "token": "jwt...", "user": { ... } }
Action:
Save token to localStorage.
Set user as logged in.
Show "Success! Welcome bonus 200 RUB received."
Redirect to Dashboard.
Error (400/401):
Show error message: "Invalid or expired code."
3. Login Page Update
If login returns 403 Forbidden with message "Email not verified":
Redirect user to the Verify Email Screen (you might need to ask for their email again or pre-fill it).
Summary of Changes from Previous Version
Removed: /auth/callback page (no longer needed).
Added: In-place verification input after registration.
Changed: /verify-email is now a POST request, not a GET link.