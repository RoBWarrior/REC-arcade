/**
 * Main Firebase Service - Consolidated exports for all services
 * This file provides a single entry point for all Firebase-related functionality
 */

import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  getAllAchievements, 
  createAchievement 
} from './achievementService';
import { 
  getSystemSettings, 
  updateSystemSetting 
} from './adminService';

// Simplified Authentication Services (Track-based)
export {
  authenticateUser,
  authenticateUserDemo,
  getUserByRegNumber,
  updateUserProfile,
  updateUserGameStats,
  getAllUsers,
  updateUserAdminStatus,
  checkRegNumberExists
} from './simpleAuthService';

// Track Management Services
export {
  extractTrackFromRegNumber,
  getTrackDisplayName,
  getOrCreateTrack,
  getAllTracks,
  getUsersByTrack,
  getTrackLeaderboard,
  updateTrackStats
} from './trackService';

// Authentication Services
export {
  registerUser,
  signInUser,
  signInWithRegNumber,
  signOutUser,
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
  changePassword,
  resetPassword,
  checkRegNumberExists,
  checkEmailExists,
  deleteUserAccount,
  getAllUsers,
  updateUserAdminStatus,
  updateUserActiveStatus,
  onAuthStateChange,
  auth
} from './authService';

// Game Services
export {
  submitGameScore,
  getUserGameScores,
  getTopScores,
  getUserBestScore,
  getUserGameStats,
  deleteGameScore,
  checkAndAwardAchievements,
  getGameSessionReplay,
  updateScoreVerification,
  addScore, // Legacy
  getScores  // Legacy
} from './gameService';

// Leaderboard Services
export {
  generateLeaderboard,
  getLeaderboard,
  getUserRank,
  getLeaderboardAroundUser,
  getOverallLeaderboard,
  subscribeToLeaderboard,
  refreshAllLeaderboards,
  getLeaderboardStats
} from './leaderboardService';

// Event Services
export {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  submitEventScore,
  getUserEventParticipation,
  getEventLeaderboard,
  updateEventRankings,
  completeEvent,
  subscribeToEvent,
  addEvent, // Legacy
  getAllEvents // Legacy alias
} from './eventService';

// Firebase Services (Track-enabled)
export {
  addScore,
  getScores,
  addOfflineScore,
  getOfflineScores,
  deleteOfflineScore,
  addEvent as addFirebaseEvent,
  getEvents as getFirebaseEvents,
  deleteEvent as deleteFirebaseEvent,
  getScoresByTrack,
  getAllTracksLeaderboard,
  getUserScoresByTrack
} from './firebaseService';

// Admin Services
export {
  getAdminDashboardStats,
  getAdminUsers,
  updateUserStatus,
  deleteUserData,
  getSystemStats,
  moderateScore,
  getFlaggedContent,
  performBulkOperation,
  performSystemMaintenance,
  getSystemSettings,
  updateSystemSetting,
  logAdminAction,
  getAdminLogs,
  exportUserData
} from './adminService';

// Notification Services
export {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadNotificationCount,
  subscribeToNotifications,
  sendBulkNotifications,
  createSystemAnnouncement,
  cleanupExpiredNotifications
} from './notificationService';

// Achievement Services
export {
  createAchievement,
  getAllAchievements,
  getUserAchievements,
  hasUserAchievement,
  awardAchievement,
  updateAchievementProgress,
  checkUserAchievements,
  getAchievementLeaderboard,
  updateAchievement,
  deleteAchievement,
  getAchievementStats
} from './achievementService';

// Legacy exports from original firebaseService.js for backward compatibility
export {
  addOfflineScore,
  getOfflineScores,
  deleteOfflineScore,
  addEvent as addEventLegacy,
  getEvents as getEventsLegacy,
  deleteEvent as deleteEventLegacy
} from './firebaseService';

// Firebase config and instances
export { db, auth, storage, analytics } from '../config/firebase';

/**
 * Service Status and Health Check
 */
export const getServiceHealth = async () => {
  try {
    // Simple health check by trying to read from Firestore
    const testQuery = await getDocs(query(collection(db, 'systemSettings'), limit(1)));
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      firestore: 'connected',
      auth: auth.currentUser ? 'authenticated' : 'anonymous'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      firestore: 'disconnected',
      auth: 'unknown'
    };
  }
};

/**
 * Initialize default achievements if they don't exist
 */
export const initializeDefaultAchievements = async () => {
  try {
    const defaultAchievements = [
      {
        name: "First Steps",
        description: "Play your first game",
        icon: "👶",
        category: "beginner",
        requirements: {
          condition: "games_played",
          gameType: "any",
          targetCount: 1
        },
        points: 10,
        rarity: "common"
      },
      {
        name: "Snake Novice",
        description: "Score 50 points in Snake game",
        icon: "🐍",
        category: "games",
        requirements: {
          condition: "single_game",
          gameType: "snake",
          minScore: 50
        },
        points: 20,
        rarity: "common"
      },
      {
        name: "Quick Reflexes",
        description: "React in under 300ms in Reaction Game",
        icon: "⚡",
        category: "games",
        requirements: {
          condition: "single_game",
          gameType: "reaction",
          minScore: 300
        },
        points: 25,
        rarity: "common"
      },
      {
        name: "Snake Master",
        description: "Score 200 points in Snake game",
        icon: "🏆",
        category: "games",
        requirements: {
          condition: "single_game",
          gameType: "snake",
          minScore: 200
        },
        points: 50,
        rarity: "rare"
      },
      {
        name: "Speed Demon",
        description: "React in under 200ms in Reaction Game",
        icon: "🚀",
        category: "games",
        requirements: {
          condition: "single_game",
          gameType: "reaction",
          minScore: 200
        },
        points: 75,
        rarity: "epic"
      },
      {
        name: "Event Participant",
        description: "Participate in your first event",
        icon: "🎪",
        category: "events",
        requirements: {
          condition: "event_participation",
          eventCount: 1
        },
        points: 30,
        rarity: "common"
      },
      {
        name: "Event Champion",
        description: "Win an event",
        icon: "🥇",
        category: "events",
        requirements: {
          condition: "event_win",
          count: 1
        },
        points: 100,
        rarity: "legendary"
      },
      {
        name: "Dedicated Player",
        description: "Play 50 games total",
        icon: "🎮",
        category: "dedication",
        requirements: {
          condition: "games_played",
          gameType: "any",
          targetCount: 50
        },
        points: 40,
        rarity: "rare"
      },
      {
        name: "High Scorer",
        description: "Accumulate 1000 total points",
        icon: "💯",
        category: "scoring",
        requirements: {
          condition: "total_score",
          gameType: "any",
          targetScore: 1000
        },
        points: 60,
        rarity: "epic"
      }
    ];

    // Check if achievements already exist
    const existingAchievements = await getAllAchievements();
    
    if (existingAchievements.success && existingAchievements.achievements.length === 0) {
      // No achievements exist, create default ones
      const createdAchievements = [];
      
      for (const achievement of defaultAchievements) {
        const result = await createAchievement(achievement);
        if (result.success) {
          createdAchievements.push(result.achievement);
        }
      }
      
      return {
        success: true,
        created: createdAchievements.length,
        achievements: createdAchievements
      };
    }
    
    return {
      success: true,
      created: 0,
      message: 'Achievements already exist'
    };
  } catch (error) {
    console.error('Initialize default achievements error:', error);
    return {
      success: false,
      error: error.message,
      created: 0
    };
  }
};

/**
 * Initialize system settings if they don't exist
 */
export const initializeSystemSettings = async () => {
  try {
    const defaultSettings = [
      {
        key: 'maintenance_mode',
        value: false,
        description: 'Enable/disable maintenance mode'
      },
      {
        key: 'registration_enabled',
        value: true,
        description: 'Allow new user registrations'
      },
      {
        key: 'max_daily_games',
        value: 100,
        description: 'Maximum games per user per day'
      },
      {
        key: 'leaderboard_refresh_interval',
        value: 60,
        description: 'Leaderboard refresh interval in minutes'
      },
      {
        key: 'notification_retention_days',
        value: 30,
        description: 'Days to keep notifications before cleanup'
      }
    ];

    const existingSettings = await getSystemSettings();
    
    if (existingSettings.success && Object.keys(existingSettings.settings).length === 0) {
      // No settings exist, create default ones
      for (const setting of defaultSettings) {
        await updateSystemSetting(setting.key, setting.value, 'system', setting.description);
      }
      
      return {
        success: true,
        created: defaultSettings.length,
        settings: defaultSettings
      };
    }
    
    return {
      success: true,
      created: 0,
      message: 'System settings already exist'
    };
  } catch (error) {
    console.error('Initialize system settings error:', error);
    return {
      success: false,
      error: error.message,
      created: 0
    };
  }
};

/**
 * Complete application initialization
 */
export const initializeApplication = async () => {
  try {
    console.log('Initializing REC-Arcade application...');
    
    const results = {
      achievements: await initializeDefaultAchievements(),
      systemSettings: await initializeSystemSettings(),
      serviceHealth: await getServiceHealth()
    };
    
    console.log('Application initialization complete:', results);
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Application initialization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};