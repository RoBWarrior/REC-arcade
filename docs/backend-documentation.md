# REC-Arcade Backend Documentation

## Overview

This document provides comprehensive information about the REC-Arcade backend implementation using Firebase. The backend includes user authentication, game score management, event systems, leaderboards, notifications, achievements, and admin controls.

## Architecture

The backend is built using Firebase services:
- **Firestore Database**: NoSQL document database for all data storage
- **Firebase Authentication**: User authentication and authorization
- **Firebase Storage**: File storage for profile pictures and event banners
- **Firebase Security Rules**: Data access control and validation

## Services Structure

### Core Services

1. **Authentication Service** (`authService.js`)
   - User registration and login
   - Profile management
   - Admin controls

2. **Game Service** (`gameService.js`)
   - Score submission and retrieval
   - Game session tracking
   - Statistics calculation

3. **Leaderboard Service** (`leaderboardService.js`)
   - Real-time leaderboard generation
   - Ranking calculations
   - Performance optimization

4. **Event Service** (`eventService.js`)
   - Event creation and management
   - User participation tracking
   - Event scoring

5. **Admin Service** (`adminService.js`)
   - Dashboard statistics
   - User management
   - Content moderation

6. **Notification Service** (`notificationService.js`)
   - User notifications
   - System announcements
   - Real-time updates

7. **Achievement Service** (`achievementService.js`)
   - Achievement definitions
   - Progress tracking
   - Reward system

## Database Schema

### Collections

1. **users** - User profiles and settings
2. **gameScores** - Individual game scores
3. **gameSessions** - Detailed game session data
4. **events** - Event definitions
5. **eventParticipations** - User event participation
6. **leaderboards** - Cached leaderboard data
7. **achievements** - Achievement definitions
8. **userAchievements** - User achievement progress
9. **notifications** - User notifications
10. **systemSettings** - Application configuration
11. **adminLogs** - Admin action audit trail

## Setup Instructions

### 1. Firebase Project Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable the following services:
   - Firestore Database
   - Authentication
   - Storage
   - Analytics (optional)

### 2. Authentication Configuration

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Configure authorized domains if needed

### 3. Firestore Database Setup

1. Create a Firestore database in production mode
2. Deploy the security rules from `firestore.rules`
3. Create the following indexes:

```javascript
// Required Firestore Indexes
// gameScores collection
gameType, score (desc), timestamp (desc)
userId, timestamp (desc)

// events collection
isActive, startDate (desc)

// eventParticipations collection
eventId, totalScore (desc)

// userAchievements collection
userId, earnedAt (desc)

// notifications collection
userId, isRead, createdAt (desc)
```

### 4. Storage Configuration

1. Set up Storage security rules from `firestore.rules`
2. Create buckets for:
   - Profile pictures
   - Event banners
   - Game replay data (future use)

### 5. Environment Variables

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 6. Initial Data Setup

Run the application initialization:

```javascript
import { initializeApplication } from './src/services';

// This will create default achievements and system settings
initializeApplication();
```

## API Usage Examples

### Authentication

```javascript
import { registerUser, signInUser, signOutUser } from './src/services/authService';

// Register new user
const result = await registerUser({
  email: 'user@example.com',
  password: 'password123',
  displayName: 'John Doe',
  regNumber: '20CS001',
  department: 'Computer Science',
  year: 2
});

// Sign in user
const signInResult = await signInUser('user@example.com', 'password123');

// Sign out
await signOutUser();
```

### Game Scores

```javascript
import { submitGameScore, getTopScores } from './src/services/gameService';

// Submit a game score
const scoreResult = await submitGameScore({
  userId: 'user123',
  gameType: 'snake',
  score: 150,
  duration: 120,
  difficulty: 'medium',
  gameData: { level: 5, lives: 3 }
});

// Get leaderboard
const leaderboard = await getTopScores('snake', 10, 'weekly');
```

### Events

```javascript
import { createEvent, registerForEvent } from './src/services/eventService';

// Create event (admin only)
const eventResult = await createEvent({
  title: 'Weekly Challenge',
  description: 'Compete in multiple games',
  eventType: 'competition',
  gameTypes: ['snake', 'reaction'],
  startDate: '2024-01-20T10:00:00',
  endDate: '2024-01-27T18:00:00',
  maxParticipants: 100,
  createdBy: 'admin123'
});

// Register for event
await registerForEvent(eventId, userId);
```

## Security

### Authentication Rules

- Users can only access their own data
- Admins have elevated permissions
- All operations require authentication

### Data Validation

- Input validation on all write operations
- Score verification mechanisms
- Rate limiting on submissions

### Security Rules

The `firestore.rules` file contains comprehensive security rules that:
- Restrict data access based on user roles
- Validate data structure and types
- Prevent unauthorized modifications
- Implement admin-only operations

## Performance Optimization

### Leaderboard Caching

- Leaderboards are pre-computed and cached
- Automatic refresh based on activity
- Real-time updates for active games

### Pagination

- Large data sets use cursor-based pagination
- Efficient querying with proper indexing
- Lazy loading for better performance

### Batch Operations

- Bulk operations for admin functions
- Atomic transactions for consistency
- Efficient data aggregation

## Monitoring and Analytics

### Admin Dashboard

- User activity statistics
- Game performance metrics
- System health monitoring
- Error tracking and reporting

### Audit Trail

- All admin actions are logged
- User activity tracking
- Security event monitoring

## Maintenance

### Regular Tasks

1. **Leaderboard Refresh**: Automated hourly updates
2. **Notification Cleanup**: Remove expired notifications
3. **User Stats Update**: Recalculate aggregated statistics
4. **Achievement Progress**: Update user achievement progress

### Backup and Recovery

1. Enable Firestore automated backups
2. Regular exports of critical data
3. Disaster recovery procedures
4. Data migration tools

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Firebase config
   - Verify domain authorization
   - Check security rules

2. **Permission Denied**
   - Review Firestore security rules
   - Check user authentication status
   - Verify admin permissions

3. **Performance Issues**
   - Check Firestore indexes
   - Review query efficiency
   - Monitor data structure

### Debug Tools

- Firebase Console for real-time monitoring
- Browser developer tools for client-side debugging
- Firestore emulator for local testing

## Future Enhancements

### Planned Features

1. **Real-time Multiplayer**
   - WebSocket integration
   - Live game sessions
   - Spectator mode

2. **Advanced Analytics**
   - Player behavior analysis
   - Game balance metrics
   - Predictive modeling

3. **Social Features**
   - Friend systems
   - Chat functionality
   - Social sharing

4. **Mobile Support**
   - React Native integration
   - Push notifications
   - Offline functionality

## Support

For technical support and questions:
1. Check the documentation
2. Review console logs
3. Test with Firebase emulator
4. Contact development team

## License

This backend implementation is part of the REC-Arcade project and follows the project's license terms.