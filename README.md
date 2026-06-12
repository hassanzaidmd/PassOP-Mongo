# PassOpMongo

PassOpMongo is a full-stack password manager built with React, Vite, Express, and MongoDB. It lets users securely store website credentials, supports account registration with OTP verification, includes login-time 2FA, password reset via email, and provides an admin dashboard for user management.

## Features

- Secure password vault for saving, editing, deleting, and searching credentials
- Password encryption before storage in MongoDB
- User registration with email OTP verification
- Login with optional 2FA OTP verification
- Forgot password and reset password flow via email link
- JWT-based authentication for protected routes
- Admin-only dashboard for:
  - viewing all users
  - creating users
  - promoting users to admin
  - deleting users and their saved passwords
- Responsive React UI with toast notifications and client-side validation

## Tech Stack

- Frontend: React, Vite, React Router, React Toastify, Tailwind CSS
- Backend: Node.js, Express, MongoDB Native Driver
- Auth/Security: JWT, bcrypt, crypto, custom OTP flow
- Email: Nodemailer

## Project Structure

```text
PassOpMongo/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- routes/
|   |-- utils/
|   `-- server.js
|-- public/
|-- src/
|   |-- components/
|   |-- hooks/
|   |-- page/
|   |-- services/
|   |-- utils/
|   `-- App.jsx
|-- package.json
`-- README.md
```

## Main Pages

- `/` - Password manager dashboard
- `/login` - User login
- `/register` - New user registration
- `/verify-otp` - Registration OTP verification
- `/verify-2fa` - Login OTP verification
- `/forgot-password` - Request a reset link
- `/reset-password/:token` - Set a new password
- `/admin` - Admin dashboard

## Backend API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/login`
- `POST /api/auth/verify-2fa`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET /api/auth/test-email`

### Passwords

- `GET /` - Get all saved passwords for the logged-in user
- `POST /` - Save a new password
- `PUT /:id` - Update a saved password
- `DELETE /:id` - Delete a saved password

### Admin

- `GET /admin/users`
- `POST /admin/create-user`
- `PUT /admin/promote/:id`
- `DELETE /admin/users/:id`

## Environment Variables

Create an `.env` file in the root for the frontend only if you want to override the API URL, and another `.env` file inside `backend/` for server secrets.

### Root `.env`

```env
VITE_API_URL=http://localhost:4000
```

If `VITE_API_URL` is not set, the frontend falls back to `http://localhost:4000`.

### `backend/.env`

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
GMAIL_USER=yourname@gmail.com
GMAIL_CLIENT_ID=your_google_oauth_client_id
GMAIL_CLIENT_SECRET=your_google_oauth_client_secret
GMAIL_REFRESH_TOKEN=your_google_refresh_token
PORT=4000
```

Notes:

- `GMAIL_USER` is the Gmail account that sends OTPs, 2FA codes, and password reset emails.
- `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, and `GMAIL_REFRESH_TOKEN` are used by the Gmail API OAuth flow.
- `CLIENT_URL` is used to generate reset-password links and to allow the frontend origin in CORS.

## Installation

Clone the repository and install dependencies for both the frontend and backend.

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

## Running the App Locally

You need two terminals: one for the backend and one for the frontend.

### Start the backend

```bash
cd backend
npm start
```

The backend runs on `http://localhost:4000` by default.

### Start the frontend

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## How It Works

1. A new user registers with username, email, and password.
2. The backend creates a pending registration and sends a 6-digit OTP to the email address.
3. The user enters the OTP on the verification page.
4. After verification, the account is created and a welcome email is sent.
5. During login, users with 2FA enabled receive a login OTP.
6. After login, the JWT token is stored in `localStorage` and is used to access protected routes.
7. Password entries are encrypted before being saved to MongoDB and decrypted only when fetched for the logged-in user.

## Security Notes

- Passwords are hashed with `bcrypt` before being stored.
- Saved vault entries are encrypted with a custom crypto helper before storage.
- Reset links use a hashed token stored in MongoDB.
- Protected routes require a JWT in the `Authorization` header.
- Admin routes also require an admin role.

## Deployment Notes

Before deploying:

- Set all backend environment variables in your hosting provider
- Point `CLIENT_URL` to your deployed frontend URL
- Set `VITE_API_URL` in the frontend to your deployed backend URL
- Make sure your MongoDB cluster allows connections from your deployment environment

## Future Improvements

- Add stronger password generation suggestions
- Add category/tag support for saved passwords
- Add copy-to-clipboard audit/history
- Add master-password style vault unlock flow
- Add automated tests for API routes

## License

No license has been added yet. If you plan to publish this on GitHub, consider adding one based on how you want others to use the project.
