# Next.js Authentication System

A complete authentication system built with Next.js, MongoDB/Mongoose, and Tailwind CSS.

## Features

- User registration with email verification (OTP)
- Login with JWT authentication
- Forgot password functionality
- Password reset with OTP verification
- Secure password hashing with bcrypt
- Email notifications
- Protected routes for authenticated users
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js 18.x or later
- MongoDB (local or Atlas)
- SMTP email service for sending emails

## Getting Started

1. Clone the repository

```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB configuration
MONGODB_URI=mongodb://localhost:27017/auth_db

# JWT configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Email configuration (replace with your actual email service credentials)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=no-reply@yourdomain.com
```

4. Run the development server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication Flow

1. **Registration**
   - User submits registration form
   - Server creates a new user with verification token
   - Verification OTP is sent to user's email
   - User enters OTP to verify email
   - On successful verification, user is redirected to dashboard

2. **Login**
   - User submits login credentials
   - Server validates credentials and checks if email is verified
   - On successful login, JWT token is issued
   - User is redirected to dashboard

3. **Forgot Password**
   - User requests password reset
   - Server generates OTP and sends to user's email
   - User enters OTP and new password
   - Server updates password

## Folder Structure

- `/src/app` - Next.js app directory
- `/src/app/api` - API routes
- `/src/app/auth` - Authentication pages
- `/src/app/dashboard` - Dashboard for authenticated users
- `/src/lib` - Utility functions
- `/src/models` - Mongoose models

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- MongoDB/Mongoose
- Tailwind CSS
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- Nodemailer for sending emails

## License

This project is licensed under the MIT License.
