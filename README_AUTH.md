# Colabio - Authenticated Real-time Whiteboard

A collaborative digital whiteboard with Google authentication that allows multiple users to draw, chat, and collaborate in real-time.

## Features

- **Google Authentication**: Secure login using Google OAuth
- **Real-time Collaboration**: Multiple users can draw simultaneously
- **User Avatars**: See who's online with Google profile pictures
- **Enhanced Chat**: Chat with user avatars and better message styling
- **Room Management**: Create and join rooms with authenticated users
- **User Management**: Track authenticated users across sessions

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd /home/vikas/projects/syncboard/Colabio
npm install --legacy-peer-deps
```

### 2. Configure Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Google OAuth credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Authentication Flow

1. Users are redirected to Google sign-in when they access the app
2. After successful authentication, users can:
   - Create new rooms
   - Join existing rooms by room ID
   - See other authenticated users in the room
   - Chat with other users
   - Collaborate on the whiteboard

## Changes Made

### Authentication System
- Added NextAuth.js with Google provider
- Created custom sign-in page
- Added authentication middleware to protect routes
- Created authentication context and hooks

### User Interface Updates
- Added Header component with user info and sign-out
- Updated Home page to show authenticated user info
- Enhanced UserList with profile pictures
- Improved chat messages with avatars and better styling
- Removed manual username input (now uses Google account info)

### Backend Changes
- Updated socket events to handle authenticated user objects
- Modified room management to store full user profiles
- Enhanced user tracking with email and profile images

### Type System
- Updated TypeScript types to include authenticated user data
- Modified socket event interfaces for user objects
- Enhanced user and room type definitions

## Security Features

- Protected routes require authentication
- User sessions managed by NextAuth.js
- Secure cookie handling
- CSRF protection built-in

## Production Deployment

1. Set production environment variables
2. Update `NEXTAUTH_URL` to your production domain
3. Add production redirect URIs to Google OAuth settings
4. Generate a secure `NEXTAUTH_SECRET`
5. Deploy to your preferred hosting platform

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **Real-time**: Socket.io
- **State Management**: Recoil
- **Styling**: Tailwind CSS
- **Backend**: Express.js with Socket.io server
