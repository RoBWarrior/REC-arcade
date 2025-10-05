# Firebase Database Schema for REC-Arcade

## Collections Overview

### 1. users
- **Purpose**: Store user profiles and authentication data
- **Structure**:
```json
{
  "uid": "unique_user_id",
  "email": "user@example.com",
  "displayName": "John Doe",
  "regNumber": "20CS001", // College registration number
  "photoURL": "https://...", // Profile picture URL
  "college": "REC",
  "department": "Computer Science",
  "year": 2, // Current year of study
  "isAdmin": false,
  "isActive": true,
  "createdAt": "timestamp",
  "lastLogin": "timestamp",
  "gameStats": {
    "totalGamesPlayed": 0,
    "totalScore": 0,
    "favoriteGame": "",
    "achievements": []
  },
  "eventParticipation": {
    "eventsJoined": 0,
    "eventsWon": 0,
    "totalEventScore": 0
  }
}
```

### 2. gameScores
- **Purpose**: Store individual game scores with user reference
- **Structure**:
```json
{
  "id": "auto_generated",
  "userId": "user_uid",
  "gameType": "snake|reaction|memory|etc",
  "score": 150,
  "duration": 120, // Game duration in seconds
  "difficulty": "easy|medium|hard",
  "timestamp": "timestamp",
  "isVerified": true, // For preventing cheating
  "gameData": {
    // Game-specific data
    "level": 5,
    "lives": 3,
    "powerups": ["speed", "shield"]
  }
}
```

### 3. leaderboards
- **Purpose**: Aggregated leaderboard data for performance optimization
- **Structure**:
```json
{
  "id": "auto_generated",
  "gameType": "snake",
  "period": "daily|weekly|monthly|allTime",
  "lastUpdated": "timestamp",
  "rankings": [
    {
      "rank": 1,
      "userId": "user_uid",
      "displayName": "John Doe",
      "regNumber": "20CS001",
      "score": 150,
      "timestamp": "timestamp"
    }
  ]
}
```

### 4. events
- **Purpose**: Store event information and management
- **Structure**:
```json
{
  "id": "auto_generated",
  "title": "Weekly Coding Challenge",
  "description": "Join us for our weekly coding challenge...",
  "eventType": "competition|workshop|tournament",
  "gameTypes": ["snake", "reaction"], // Games included in event
  "startDate": "timestamp",
  "endDate": "timestamp",
  "registrationDeadline": "timestamp",
  "maxParticipants": 100,
  "currentParticipants": 25,
  "isActive": true,
  "createdBy": "admin_user_id",
  "createdAt": "timestamp",
  "prizes": [
    {
      "position": 1,
      "prize": "Gaming Laptop",
      "value": 50000
    }
  ],
  "rules": "Event rules and regulations...",
  "bannerURL": "https://...",
  "participants": ["user_id_1", "user_id_2"] // Array of participant IDs
}
```

### 5. eventParticipations
- **Purpose**: Track user participation in events
- **Structure**:
```json
{
  "id": "auto_generated",
  "eventId": "event_id",
  "userId": "user_uid",
  "registeredAt": "timestamp",
  "status": "registered|active|completed|disqualified",
  "scores": [
    {
      "gameType": "snake",
      "score": 150,
      "timestamp": "timestamp"
    }
  ],
  "totalScore": 300,
  "rank": 5,
  "completedAt": "timestamp"
}
```

### 6. achievements
- **Purpose**: Store achievement definitions and user progress
- **Structure**:
```json
{
  "id": "auto_generated",
  "name": "Snake Master",
  "description": "Score 100+ in Snake game",
  "icon": "🐍",
  "category": "games|events|social",
  "requirements": {
    "gameType": "snake",
    "minScore": 100,
    "condition": "single_game"
  },
  "points": 50,
  "rarity": "common|rare|epic|legendary",
  "isActive": true
}
```

### 7. userAchievements
- **Purpose**: Track which achievements users have earned
- **Structure**:
```json
{
  "id": "auto_generated",
  "userId": "user_uid",
  "achievementId": "achievement_id",
  "earnedAt": "timestamp",
  "progress": 100, // Percentage of completion
  "isCompleted": true
}
```

### 8. notifications
- **Purpose**: Store user notifications
- **Structure**:
```json
{
  "id": "auto_generated",
  "userId": "user_uid",
  "title": "New Event Available!",
  "message": "Join the Weekly Coding Challenge...",
  "type": "event|achievement|system|social",
  "isRead": false,
  "actionURL": "/events/123", // Optional link
  "createdAt": "timestamp",
  "expiresAt": "timestamp"
}
```

### 9. gamesSessions
- **Purpose**: Track detailed game session data for analytics
- **Structure**:
```json
{
  "id": "auto_generated",
  "userId": "user_uid",
  "gameType": "snake",
  "startTime": "timestamp",
  "endTime": "timestamp",
  "finalScore": 150,
  "moves": 45,
  "accuracy": 85.5, // Percentage
  "deviceInfo": {
    "browser": "Chrome",
    "os": "Windows",
    "screenSize": "1920x1080"
  },
  "gameplayData": [
    // Array of game state snapshots for replay/analysis
  ]
}
```

### 10. systemSettings
- **Purpose**: Store application-wide settings
- **Structure**:
```json
{
  "id": "auto_generated",
  "key": "maintenance_mode",
  "value": false,
  "description": "Enable/disable maintenance mode",
  "lastUpdated": "timestamp",
  "updatedBy": "admin_user_id"
}
```

## Security Rules Overview

1. **Users**: Users can read/write their own data, admins can read all
2. **Scores**: Users can write their own scores, all can read
3. **Events**: All can read, only admins can write
4. **Leaderboards**: Read-only for users, write access for cloud functions
5. **Achievements**: Read-only for all users
6. **Notifications**: Users can read/update their own notifications

## Indexes Required

1. `gameScores` - gameType, score (desc), timestamp (desc)
2. `gameScores` - userId, timestamp (desc)
3. `events` - isActive, startDate (desc)
4. `eventParticipations` - eventId, totalScore (desc)
5. `userAchievements` - userId, earnedAt (desc)
6. `notifications` - userId, isRead, createdAt (desc)