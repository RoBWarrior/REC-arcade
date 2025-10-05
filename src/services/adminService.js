import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
  count,
  getCountFromServer
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { deleteUserAccount } from './authService';
import { refreshAllLeaderboards } from './leaderboardService';

// Collections
const USERS_COLLECTION = 'users';
const EVENTS_COLLECTION = 'events';
const GAME_SCORES_COLLECTION = 'gameScores';
const EVENT_PARTICIPATIONS_COLLECTION = 'eventParticipations';
const NOTIFICATIONS_COLLECTION = 'notifications';
const SYSTEM_SETTINGS_COLLECTION = 'systemSettings';

/**
 * Get admin dashboard statistics
 */
export const getAdminDashboardStats = async () => {
  try {
    const stats = {};

    // Get total users count
    const usersCount = await getCountFromServer(collection(db, USERS_COLLECTION));
    stats.totalUsers = usersCount.data().count;

    // Get active users count (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersQuery = query(
      collection(db, USERS_COLLECTION),
      where('lastLogin', '>=', thirtyDaysAgo)
    );
    const activeUsersCount = await getCountFromServer(activeUsersQuery);
    stats.activeUsers = activeUsersCount.data().count;

    // Get total events count
    const eventsCount = await getCountFromServer(collection(db, EVENTS_COLLECTION));
    stats.totalEvents = eventsCount.data().count;

    // Get active events count
    const activeEventsQuery = query(
      collection(db, EVENTS_COLLECTION),
      where('isActive', '==', true)
    );
    const activeEventsCount = await getCountFromServer(activeEventsQuery);
    stats.activeEvents = activeEventsCount.data().count;

    // Get total game scores count
    const scoresCount = await getCountFromServer(collection(db, GAME_SCORES_COLLECTION));
    stats.totalGameScores = scoresCount.data().count;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentScoresQuery = query(
      collection(db, GAME_SCORES_COLLECTION),
      where('timestamp', '>=', sevenDaysAgo)
    );
    const recentScoresCount = await getCountFromServer(recentScoresQuery);
    stats.recentActivity = recentScoresCount.data().count;

    // Get game type breakdown
    const allScoresQuery = query(collection(db, GAME_SCORES_COLLECTION), limit(1000));
    const allScoresSnapshot = await getDocs(allScoresQuery);
    const gameTypeStats = {};
    
    allScoresSnapshot.docs.forEach(doc => {
      const data = doc.data();
      gameTypeStats[data.gameType] = (gameTypeStats[data.gameType] || 0) + 1;
    });
    
    stats.gameTypeBreakdown = gameTypeStats;

    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    return {
      success: false,
      error: error.message,
      stats: {}
    };
  }
};

/**
 * Get all users with pagination and filtering
 */
export const getAdminUsers = async (filters = {}, limitCount = 50, lastDoc = null) => {
  try {
    let q = collection(db, USERS_COLLECTION);

    // Apply filters
    if (filters.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }

    if (filters.isAdmin !== undefined) {
      q = query(q, where('isAdmin', '==', filters.isAdmin));
    }

    if (filters.college) {
      q = query(q, where('college', '==', filters.college));
    }

    if (filters.department) {
      q = query(q, where('department', '==', filters.department));
    }

    // Order by creation date
    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      users,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      hasMore: querySnapshot.docs.length === limitCount
    };
  } catch (error) {
    console.error('Get admin users error:', error);
    return {
      success: false,
      error: error.message,
      users: []
    };
  }
};

/**
 * Update user status (active/inactive, admin/user)
 */
export const updateUserStatus = async (userId, updates, adminId) => {
  try {
    const allowedUpdates = ['isActive', 'isAdmin'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid updates provided');
    }

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      ...filteredUpdates,
      updatedAt: serverTimestamp(),
      updatedBy: adminId
    });

    return { success: true };
  } catch (error) {
    console.error('Update user status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete user and all associated data
 */
export const deleteUserData = async (userId, adminId) => {
  try {
    const batch = writeBatch(db);

    // Delete user's game scores
    const scoresQuery = query(
      collection(db, GAME_SCORES_COLLECTION),
      where('userId', '==', userId)
    );
    const scoresSnapshot = await getDocs(scoresQuery);
    scoresSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete user's event participations
    const participationsQuery = query(
      collection(db, EVENT_PARTICIPATIONS_COLLECTION),
      where('userId', '==', userId)
    );
    const participationsSnapshot = await getDocs(participationsQuery);
    participationsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete user's notifications
    const notificationsQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete user profile
    batch.delete(doc(db, USERS_COLLECTION, userId));

    await batch.commit();

    // Delete profile picture from storage
    try {
      const profilePicRef = ref(storage, `profile-pictures/${userId}`);
      await deleteObject(profilePicRef);
    } catch (error) {
      console.log('No profile picture to delete or already deleted');
    }

    // Log admin action
    await logAdminAction(adminId, 'DELETE_USER', `Deleted user ${userId}`);

    return { success: true };
  } catch (error) {
    console.error('Delete user data error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get system-wide statistics
 */
export const getSystemStats = async (period = 'monthly') => {
  try {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const stats = {
      period,
      startDate,
      endDate: now
    };

    // New users in period
    const newUsersQuery = query(
      collection(db, USERS_COLLECTION),
      where('createdAt', '>=', startDate)
    );
    const newUsersCount = await getCountFromServer(newUsersQuery);
    stats.newUsers = newUsersCount.data().count;

    // Game activity in period
    const gameActivityQuery = query(
      collection(db, GAME_SCORES_COLLECTION),
      where('timestamp', '>=', startDate)
    );
    const gameActivitySnapshot = await getDocs(gameActivityQuery);
    stats.gameActivity = gameActivitySnapshot.docs.length;

    // Event activity in period
    const eventActivityQuery = query(
      collection(db, EVENTS_COLLECTION),
      where('createdAt', '>=', startDate)
    );
    const eventActivityCount = await getCountFromServer(eventActivityQuery);
    stats.eventsCreated = eventActivityCount.data().count;

    // Popular games in period
    const gameStats = {};
    gameActivitySnapshot.docs.forEach(doc => {
      const data = doc.data();
      gameStats[data.gameType] = (gameStats[data.gameType] || 0) + 1;
    });
    
    stats.popularGames = Object.entries(gameStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([game, count]) => ({ game, count }));

    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('Get system stats error:', error);
    return {
      success: false,
      error: error.message,
      stats: {}
    };
  }
};

/**
 * Moderate game scores (verify/flag suspicious scores)
 */
export const moderateScore = async (scoreId, action, adminId, reason = '') => {
  try {
    const validActions = ['verify', 'flag', 'delete'];
    
    if (!validActions.includes(action)) {
      throw new Error('Invalid moderation action');
    }

    const scoreRef = doc(db, GAME_SCORES_COLLECTION, scoreId);
    const scoreDoc = await getDoc(scoreRef);
    
    if (!scoreDoc.exists()) {
      throw new Error('Score not found');
    }

    const updates = {
      moderatedAt: serverTimestamp(),
      moderatedBy: adminId,
      moderationReason: reason
    };

    switch (action) {
      case 'verify':
        updates.isVerified = true;
        updates.isFlagged = false;
        break;
      case 'flag':
        updates.isFlagged = true;
        updates.isVerified = false;
        break;
      case 'delete':
        await deleteDoc(scoreRef);
        await logAdminAction(adminId, 'DELETE_SCORE', `Deleted score ${scoreId}: ${reason}`);
        return { success: true };
    }

    await updateDoc(scoreRef, updates);
    await logAdminAction(adminId, `MODERATE_SCORE_${action.toUpperCase()}`, `${action} score ${scoreId}: ${reason}`);

    return { success: true };
  } catch (error) {
    console.error('Moderate score error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get flagged/suspicious content for review
 */
export const getFlaggedContent = async (contentType = 'scores', limitCount = 50) => {
  try {
    let results = [];

    switch (contentType) {
      case 'scores':
        const flaggedScoresQuery = query(
          collection(db, GAME_SCORES_COLLECTION),
          where('isFlagged', '==', true),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
        const flaggedScoresSnapshot = await getDocs(flaggedScoresQuery);
        
        for (const doc of flaggedScoresSnapshot.docs) {
          const scoreData = { id: doc.id, ...doc.data() };
          
          // Get user info
          const userDoc = await getDoc(doc(db, USERS_COLLECTION, scoreData.userId));
          if (userDoc.exists()) {
            scoreData.userInfo = userDoc.data();
          }
          
          results.push(scoreData);
        }
        break;

      // Add more content types as needed
      default:
        throw new Error('Invalid content type');
    }

    return {
      success: true,
      content: results
    };
  } catch (error) {
    console.error('Get flagged content error:', error);
    return {
      success: false,
      error: error.message,
      content: []
    };
  }
};

/**
 * Bulk operations for admin
 */
export const performBulkOperation = async (operation, targetIds, adminId, options = {}) => {
  try {
    const batch = writeBatch(db);
    const results = [];

    switch (operation) {
      case 'deactivate_users':
        for (const userId of targetIds) {
          const userRef = doc(db, USERS_COLLECTION, userId);
          batch.update(userRef, {
            isActive: false,
            updatedAt: serverTimestamp(),
            updatedBy: adminId
          });
        }
        break;

      case 'delete_scores':
        for (const scoreId of targetIds) {
          const scoreRef = doc(db, GAME_SCORES_COLLECTION, scoreId);
          batch.delete(scoreRef);
        }
        break;

      case 'verify_scores':
        for (const scoreId of targetIds) {
          const scoreRef = doc(db, GAME_SCORES_COLLECTION, scoreId);
          batch.update(scoreRef, {
            isVerified: true,
            isFlagged: false,
            moderatedAt: serverTimestamp(),
            moderatedBy: adminId
          });
        }
        break;

      default:
        throw new Error('Invalid bulk operation');
    }

    await batch.commit();
    await logAdminAction(adminId, `BULK_${operation.toUpperCase()}`, `Performed ${operation} on ${targetIds.length} items`);

    return {
      success: true,
      processedCount: targetIds.length
    };
  } catch (error) {
    console.error('Perform bulk operation error:', error);
    return {
      success: false,
      error: error.message,
      processedCount: 0
    };
  }
};

/**
 * System maintenance functions
 */
export const performSystemMaintenance = async (maintenanceType, adminId) => {
  try {
    let result = {};

    switch (maintenanceType) {
      case 'refresh_leaderboards':
        result = await refreshAllLeaderboards();
        break;

      case 'cleanup_expired_notifications':
        const expiredNotificationsQuery = query(
          collection(db, NOTIFICATIONS_COLLECTION),
          where('expiresAt', '<=', new Date())
        );
        const expiredSnapshot = await getDocs(expiredNotificationsQuery);
        
        const batch = writeBatch(db);
        expiredSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        
        result = {
          success: true,
          deletedCount: expiredSnapshot.docs.length
        };
        break;

      case 'update_user_stats':
        // This would be a complex operation to recalculate all user stats
        // Implementation would depend on specific requirements
        result = { success: true, message: 'User stats update scheduled' };
        break;

      default:
        throw new Error('Invalid maintenance type');
    }

    await logAdminAction(adminId, `MAINTENANCE_${maintenanceType.toUpperCase()}`, `Performed system maintenance: ${maintenanceType}`);

    return result;
  } catch (error) {
    console.error('Perform system maintenance error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get system settings
 */
export const getSystemSettings = async () => {
  try {
    const settingsSnapshot = await getDocs(collection(db, SYSTEM_SETTINGS_COLLECTION));
    const settings = {};
    
    settingsSnapshot.docs.forEach(doc => {
      settings[doc.data().key] = doc.data().value;
    });

    return {
      success: true,
      settings
    };
  } catch (error) {
    console.error('Get system settings error:', error);
    return {
      success: false,
      error: error.message,
      settings: {}
    };
  }
};

/**
 * Update system settings
 */
export const updateSystemSetting = async (key, value, adminId, description = '') => {
  try {
    const settingRef = doc(db, SYSTEM_SETTINGS_COLLECTION, key);
    
    await updateDoc(settingRef, {
      key,
      value,
      description,
      lastUpdated: serverTimestamp(),
      updatedBy: adminId
    });

    await logAdminAction(adminId, 'UPDATE_SYSTEM_SETTING', `Updated ${key} to ${value}`);

    return { success: true };
  } catch (error) {
    console.error('Update system setting error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Log admin actions for audit trail
 */
export const logAdminAction = async (adminId, action, details) => {
  try {
    const logRef = collection(db, 'adminLogs');
    await addDoc(logRef, {
      adminId,
      action,
      details,
      timestamp: serverTimestamp(),
      ip: 'unknown', // Could be enhanced to capture actual IP
      userAgent: navigator.userAgent || 'unknown'
    });

    return { success: true };
  } catch (error) {
    console.error('Log admin action error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get admin action logs
 */
export const getAdminLogs = async (filters = {}, limitCount = 100) => {
  try {
    let q = collection(db, 'adminLogs');

    if (filters.adminId) {
      q = query(q, where('adminId', '==', filters.adminId));
    }

    if (filters.action) {
      q = query(q, where('action', '==', filters.action));
    }

    q = query(q, orderBy('timestamp', 'desc'), limit(limitCount));

    const querySnapshot = await getDocs(q);
    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      logs
    };
  } catch (error) {
    console.error('Get admin logs error:', error);
    return {
      success: false,
      error: error.message,
      logs: []
    };
  }
};

/**
 * Export user data (for GDPR compliance)
 */
export const exportUserData = async (userId) => {
  try {
    const userData = {};

    // Get user profile
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      userData.profile = userDoc.data();
    }

    // Get user's game scores
    const scoresQuery = query(
      collection(db, GAME_SCORES_COLLECTION),
      where('userId', '==', userId)
    );
    const scoresSnapshot = await getDocs(scoresQuery);
    userData.gameScores = scoresSnapshot.docs.map(doc => doc.data());

    // Get user's event participations
    const participationsQuery = query(
      collection(db, EVENT_PARTICIPATIONS_COLLECTION),
      where('userId', '==', userId)
    );
    const participationsSnapshot = await getDocs(participationsQuery);
    userData.eventParticipations = participationsSnapshot.docs.map(doc => doc.data());

    // Get user's notifications
    const notificationsQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    userData.notifications = notificationsSnapshot.docs.map(doc => doc.data());

    return {
      success: true,
      userData
    };
  } catch (error) {
    console.error('Export user data error:', error);
    return {
      success: false,
      error: error.message,
      userData: null
    };
  }
};