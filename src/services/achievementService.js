import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const ACHIEVEMENTS_COLLECTION = 'achievements';
const USER_ACHIEVEMENTS_COLLECTION = 'userAchievements';
const USERS_COLLECTION = 'users';

/**
 * Create a new achievement definition
 */
export const createAchievement = async (achievementData) => {
  try {
    const {
      name,
      description,
      icon = '🏆',
      category = 'games',
      requirements,
      points = 10,
      rarity = 'common'
    } = achievementData;

    if (!name || !description || !requirements) {
      throw new Error('Missing required fields: name, description, or requirements');
    }

    const achievement = {
      name,
      description,
      icon,
      category,
      requirements,
      points: Number(points),
      rarity,
      isActive: true,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, ACHIEVEMENTS_COLLECTION), achievement);

    return {
      success: true,
      achievementId: docRef.id,
      achievement: { id: docRef.id, ...achievement }
    };
  } catch (error) {
    console.error('Create achievement error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all achievements
 */
export const getAllAchievements = async (activeOnly = true) => {
  try {
    let q = collection(db, ACHIEVEMENTS_COLLECTION);

    if (activeOnly) {
      q = query(q, where('isActive', '==', true));
    }

    q = query(q, orderBy('category'), orderBy('points'));

    const querySnapshot = await getDocs(q);
    const achievements = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      achievements
    };
  } catch (error) {
    console.error('Get all achievements error:', error);
    return {
      success: false,
      error: error.message,
      achievements: []
    };
  }
};

/**
 * Get user's achievements
 */
export const getUserAchievements = async (userId, completedOnly = false) => {
  try {
    let q = query(
      collection(db, USER_ACHIEVEMENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('earnedAt', 'desc')
    );

    if (completedOnly) {
      q = query(
        collection(db, USER_ACHIEVEMENTS_COLLECTION),
        where('userId', '==', userId),
        where('isCompleted', '==', true),
        orderBy('earnedAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const userAchievements = [];

    // Get achievement details for each user achievement
    for (const doc of querySnapshot.docs) {
      const userAchievementData = { id: doc.id, ...doc.data() };
      
      // Get achievement definition
      const achievementDoc = await getDoc(doc(db, ACHIEVEMENTS_COLLECTION, userAchievementData.achievementId));
      if (achievementDoc.exists()) {
        userAchievementData.achievement = {
          id: achievementDoc.id,
          ...achievementDoc.data()
        };
      }
      
      userAchievements.push(userAchievementData);
    }

    return {
      success: true,
      userAchievements
    };
  } catch (error) {
    console.error('Get user achievements error:', error);
    return {
      success: false,
      error: error.message,
      userAchievements: []
    };
  }
};

/**
 * Check if user has a specific achievement
 */
export const hasUserAchievement = async (userId, achievementId) => {
  try {
    const userAchievementQuery = query(
      collection(db, USER_ACHIEVEMENTS_COLLECTION),
      where('userId', '==', userId),
      where('achievementId', '==', achievementId),
      where('isCompleted', '==', true)
    );

    const querySnapshot = await getDocs(userAchievementQuery);
    
    return {
      success: true,
      hasAchievement: !querySnapshot.empty,
      achievement: querySnapshot.empty ? null : {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      }
    };
  } catch (error) {
    console.error('Check user achievement error:', error);
    return {
      success: false,
      error: error.message,
      hasAchievement: false
    };
  }
};

/**
 * Award achievement to user
 */
export const awardAchievement = async (userId, achievementId, progress = 100) => {
  try {
    // Check if user already has this achievement
    const existingCheck = await hasUserAchievement(userId, achievementId);
    
    if (existingCheck.hasAchievement) {
      return {
        success: false,
        error: 'User already has this achievement',
        alreadyAwarded: true
      };
    }

    // Get achievement details
    const achievementDoc = await getDoc(doc(db, ACHIEVEMENTS_COLLECTION, achievementId));
    
    if (!achievementDoc.exists()) {
      throw new Error('Achievement not found');
    }

    const achievementData = achievementDoc.data();
    const batch = writeBatch(db);

    // Create user achievement record
    const userAchievementRef = doc(collection(db, USER_ACHIEVEMENTS_COLLECTION));
    const userAchievementData = {
      userId,
      achievementId,
      earnedAt: serverTimestamp(),
      progress: Number(progress),
      isCompleted: progress >= 100
    };
    batch.set(userAchievementRef, userAchievementData);

    // Update user's achievements array and points
    const userRef = doc(db, USERS_COLLECTION, userId);
    batch.update(userRef, {
      'gameStats.achievements': arrayUnion(achievementId),
      'gameStats.achievementPoints': increment(achievementData.points)
    });

    // Create notification for user
    const notificationRef = doc(collection(db, 'notifications'));
    const notificationData = {
      userId,
      title: 'Achievement Unlocked!',
      message: `You earned the "${achievementData.name}" achievement! ${achievementData.icon}`,
      type: 'achievement',
      isRead: false,
      createdAt: serverTimestamp()
    };
    batch.set(notificationRef, notificationData);

    await batch.commit();

    return {
      success: true,
      userAchievementId: userAchievementRef.id,
      achievement: {
        id: achievementId,
        ...achievementData
      }
    };
  } catch (error) {
    console.error('Award achievement error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update achievement progress for user
 */
export const updateAchievementProgress = async (userId, achievementId, progress) => {
  try {
    // Find existing user achievement record
    const userAchievementQuery = query(
      collection(db, USER_ACHIEVEMENTS_COLLECTION),
      where('userId', '==', userId),
      where('achievementId', '==', achievementId)
    );

    const querySnapshot = await getDocs(userAchievementQuery);
    
    if (querySnapshot.empty) {
      // Create new progress record
      const userAchievementRef = doc(collection(db, USER_ACHIEVEMENTS_COLLECTION));
      await setDoc(userAchievementRef, {
        userId,
        achievementId,
        progress: Number(progress),
        isCompleted: progress >= 100,
        earnedAt: progress >= 100 ? serverTimestamp() : null,
        createdAt: serverTimestamp()
      });

      // If completed, award the achievement
      if (progress >= 100) {
        return await awardAchievement(userId, achievementId, progress);
      }

      return {
        success: true,
        progress: Number(progress),
        completed: false
      };
    } else {
      // Update existing progress
      const userAchievementDoc = querySnapshot.docs[0];
      const currentData = userAchievementDoc.data();
      
      // Don't update if already completed
      if (currentData.isCompleted) {
        return {
          success: true,
          progress: currentData.progress,
          completed: true,
          message: 'Achievement already completed'
        };
      }

      const newProgress = Math.max(currentData.progress || 0, Number(progress));
      const isCompleted = newProgress >= 100;

      await updateDoc(userAchievementDoc.ref, {
        progress: newProgress,
        isCompleted,
        earnedAt: isCompleted ? serverTimestamp() : currentData.earnedAt
      });

      // If just completed, send notification and update user stats
      if (isCompleted && !currentData.isCompleted) {
        const achievementDoc = await getDoc(doc(db, ACHIEVEMENTS_COLLECTION, achievementId));
        if (achievementDoc.exists()) {
          const achievementData = achievementDoc.data();
          
          const batch = writeBatch(db);
          
          // Update user stats
          const userRef = doc(db, USERS_COLLECTION, userId);
          batch.update(userRef, {
            'gameStats.achievements': arrayUnion(achievementId),
            'gameStats.achievementPoints': increment(achievementData.points)
          });

          // Create notification
          const notificationRef = doc(collection(db, 'notifications'));
          batch.set(notificationRef, {
            userId,
            title: 'Achievement Unlocked!',
            message: `You earned the "${achievementData.name}" achievement! ${achievementData.icon}`,
            type: 'achievement',
            isRead: false,
            createdAt: serverTimestamp()
          });

          await batch.commit();
        }
      }

      return {
        success: true,
        progress: newProgress,
        completed: isCompleted
      };
    }
  } catch (error) {
    console.error('Update achievement progress error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check multiple achievements for a user based on their activity
 */
export const checkUserAchievements = async (userId, activity) => {
  try {
    const {
      gameType,
      score,
      gamesPlayed,
      totalScore,
      eventParticipation,
      socialActivity
    } = activity;

    // Get all active achievements
    const achievementsResult = await getAllAchievements();
    if (!achievementsResult.success) {
      throw new Error('Failed to get achievements');
    }

    const achievements = achievementsResult.achievements;
    const awardedAchievements = [];

    // Check each achievement
    for (const achievement of achievements) {
      const requirements = achievement.requirements;
      let shouldAward = false;
      let progressValue = 0;

      switch (requirements.condition) {
        case 'single_game':
          if (gameType === requirements.gameType && score >= requirements.minScore) {
            shouldAward = true;
            progressValue = 100;
          }
          break;

        case 'total_score':
          if (gameType === requirements.gameType && totalScore >= requirements.targetScore) {
            shouldAward = true;
            progressValue = 100;
          } else if (gameType === requirements.gameType) {
            progressValue = Math.min(100, (totalScore / requirements.targetScore) * 100);
          }
          break;

        case 'games_played':
          if (gameType === requirements.gameType && gamesPlayed >= requirements.targetCount) {
            shouldAward = true;
            progressValue = 100;
          } else if (gameType === requirements.gameType) {
            progressValue = Math.min(100, (gamesPlayed / requirements.targetCount) * 100);
          }
          break;

        case 'event_participation':
          if (eventParticipation >= requirements.eventCount) {
            shouldAward = true;
            progressValue = 100;
          } else {
            progressValue = Math.min(100, (eventParticipation / requirements.eventCount) * 100);
          }
          break;

        case 'social':
          // Handle social achievements like inviting friends, etc.
          if (socialActivity && socialActivity[requirements.socialType] >= requirements.count) {
            shouldAward = true;
            progressValue = 100;
          }
          break;
      }

      if (shouldAward || progressValue > 0) {
        const result = await updateAchievementProgress(userId, achievement.id, progressValue);
        if (result.success && result.completed) {
          awardedAchievements.push({
            ...achievement,
            progress: progressValue
          });
        }
      }
    }

    return {
      success: true,
      awardedAchievements
    };
  } catch (error) {
    console.error('Check user achievements error:', error);
    return {
      success: false,
      error: error.message,
      awardedAchievements: []
    };
  }
};

/**
 * Get achievement leaderboard
 */
export const getAchievementLeaderboard = async (limitCount = 50) => {
  try {
    // This would require an aggregation query or maintaining a separate leaderboard collection
    // For now, we'll simulate by getting user achievement counts
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      orderBy('gameStats.achievementPoints', 'desc'),
      limit(limitCount)
    );

    const usersSnapshot = await getDocs(usersQuery);
    const leaderboard = [];

    let rank = 1;
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // Get user's achievement count
      const userAchievementsQuery = query(
        collection(db, USER_ACHIEVEMENTS_COLLECTION),
        where('userId', '==', doc.id),
        where('isCompleted', '==', true)
      );
      
      const userAchievementsSnapshot = await getDocs(userAchievementsQuery);
      
      leaderboard.push({
        rank,
        userId: doc.id,
        displayName: userData.displayName,
        regNumber: userData.regNumber,
        photoURL: userData.photoURL,
        achievementCount: userAchievementsSnapshot.docs.length,
        achievementPoints: userData.gameStats?.achievementPoints || 0
      });
      
      rank++;
    }

    return {
      success: true,
      leaderboard
    };
  } catch (error) {
    console.error('Get achievement leaderboard error:', error);
    return {
      success: false,
      error: error.message,
      leaderboard: []
    };
  }
};

/**
 * Update achievement definition (admin only)
 */
export const updateAchievement = async (achievementId, updates) => {
  try {
    const allowedFields = ['name', 'description', 'icon', 'category', 'requirements', 'points', 'rarity', 'isActive'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid updates provided');
    }

    await updateDoc(doc(db, ACHIEVEMENTS_COLLECTION, achievementId), {
      ...filteredUpdates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Update achievement error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete achievement (admin only)
 */
export const deleteAchievement = async (achievementId) => {
  try {
    const batch = writeBatch(db);

    // Delete achievement definition
    batch.delete(doc(db, ACHIEVEMENTS_COLLECTION, achievementId));

    // Delete all user achievements for this achievement
    const userAchievementsQuery = query(
      collection(db, USER_ACHIEVEMENTS_COLLECTION),
      where('achievementId', '==', achievementId)
    );
    
    const userAchievementsSnapshot = await getDocs(userAchievementsQuery);
    userAchievementsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Delete achievement error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get achievement statistics
 */
export const getAchievementStats = async (achievementId) => {
  try {
    // Get total users who have this achievement
    const completedQuery = query(
      collection(db, USER_ACHIEVEMENTS_COLLECTION),
      where('achievementId', '==', achievementId),
      where('isCompleted', '==', true)
    );
    
    const completedSnapshot = await getDocs(completedQuery);
    
    // Get total users working on this achievement
    const inProgressQuery = query(
      collection(db, USER_ACHIEVEMENTS_COLLECTION),
      where('achievementId', '==', achievementId),
      where('isCompleted', '==', false)
    );
    
    const inProgressSnapshot = await getDocs(inProgressQuery);
    
    // Get total user count for completion percentage
    const totalUsersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    
    const stats = {
      completedCount: completedSnapshot.docs.length,
      inProgressCount: inProgressSnapshot.docs.length,
      totalUsers: totalUsersSnapshot.docs.length,
      completionRate: (completedSnapshot.docs.length / totalUsersSnapshot.docs.length) * 100
    };

    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('Get achievement stats error:', error);
    return {
      success: false,
      error: error.message,
      stats: null
    };
  }
};