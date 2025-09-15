# GradeUpNow MongoDB Atlas Integration

This project has been updated to use MongoDB Atlas for data storage while maintaining Firebase for authentication only.

## Architecture Overview

- **Frontend**: React.js application (Port 5173)
- **Backend**: Express.js API server (Port 5000)
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Auth

## Setup Instructions

### Prerequisites

1. Node.js (v16 or higher)
2. MongoDB Atlas account with cluster set up
3. Firebase project configured

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd GradeUpNow/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment variables are already configured in `.env`:
   - MongoDB Atlas connection string (password: root)
   - Firebase Admin SDK configuration
   - CORS and rate limiting settings

4. Start the backend server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the main directory:
   ```bash
   cd GradeUpNow
   ```

2. Install axios (if not already installed):
   ```bash
   npm install axios
   ```

3. Environment variables are configured in `.env`:
   - API base URL pointing to backend

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### User Profile Management
- `GET /api/users/profile` - Get user profile
- `POST /api/users/profile` - Create/update user profile
- `PATCH /api/users/profile` - Update specific fields
- `PATCH /api/users/profile/setup-step` - Update setup step
- `GET /api/users/profile/stats` - Get profile statistics

### Notes Management
- `GET /api/notes` - Get user notes (with filtering)
- `GET /api/notes/search` - Search notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/stats/overview` - Get notes statistics

### Progress Tracking
- `GET /api/progress` - Get user progress
- `POST /api/progress/course/:courseId` - Update course progress
- `POST /api/progress/daily-activity` - Update daily activity
- `GET /api/progress/analytics` - Get progress analytics

## Data Models

### User Profile
- Personal information (name, education, college)
- Learning preferences and goals
- Profile completion tracking
- Account metadata

### Notes
- Title and content
- Categories and tags
- Study time tracking
- Rich text support
- Sharing capabilities

### User Progress
- Course progress tracking
- Daily activity logs
- Achievement system
- Learning analytics
- Goal setting and tracking

## Security Features

- Firebase Authentication for user verification
- JWT token validation on all API requests
- CORS protection
- Rate limiting
- Input validation and sanitization
- Helmet.js security headers

## Database Schema

The MongoDB database contains three main collections:
- `userprofiles` - User profile information
- `notes` - User notes and study materials
- `userprogresses` - Learning progress and analytics

## Development Workflow

1. Start the backend server (port 5000)
2. Start the frontend development server (port 5173)
3. The frontend will automatically connect to the backend API
4. All data operations now go through MongoDB Atlas
5. Firebase is used only for authentication

## Migration Notes

- User profile setup now saves to MongoDB instead of Firestore
- Notes are stored in MongoDB with enhanced features
- Progress tracking is completely new functionality
- Firebase Auth integration remains unchanged
- All existing Firebase Firestore code has been replaced with MongoDB API calls

## Production Deployment

For production deployment:
1. Set up MongoDB Atlas production cluster
2. Configure production environment variables
3. Set up Firebase Admin SDK with service account
4. Deploy backend to a cloud service (Heroku, Railway, etc.)
5. Deploy frontend to a static hosting service (Vercel, Netlify, etc.)
6. Update CORS origins for production URLs

## Future Enhancements

The system is designed to support:
- Advanced analytics and reporting
- Multi-user collaboration
- Real-time features
- Mobile app integration
- Advanced learning algorithms
- Content recommendation system
