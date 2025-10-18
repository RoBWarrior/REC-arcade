import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  arrayUnion,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const GAME_SCORES_COLLECTION = 'gameScores';
const GAME_SESSIONS_COLLECTION = 'gameSessions';
const USERS_COLLECTION = 'users';
const ACHIEVEMENTS_COLLECTION = 'achievements';
const USER_ACHIEVEMENTS_COLLECTION = 'userAchievements';

/**
 * Submit a game score with detailed session data
 */
export const submitGameScore = async (scoreData) => {
  try {
    const {
      userId,
      gameType,
      score,
      duration,
      difficulty = 'medium',
      gameData = {},
      sessionData = {}
    } = scoreData;

    // Validate required fields
    if (!userId || !gameType || score === undefined) {
      throw new Error('Missing required fields: userId, gameType, or score');
    }

    const batch = writeBatch(db);

    // Add game score
    const scoreRef = doc(collection(db, GAME_SCORES_COLLECTION));
    const scoreDoc = {
      userId,
      gameType,
      score: Number(score),
      duration: Number(duration) || 0,
      difficulty,
      timestamp: serverTimestamp(),
      isVerified: true, // Could be enhanced with anti-cheat validation
      gameData
    };
    batch.set(scoreRef, scoreDoc);

    // Add detailed game session
    const sessionRef = doc(collection(db, GAME_SESSIONS_COLLECTION));
    const sessionDoc = {
      userId,
      gameType,
      startTime: sessionData.startTime || serverTimestamp(),
      endTime: serverTimestamp(),
      finalScore: Number(score),
      moves: Number(sessionData.moves) || 0,
      accuracy: Number(sessionData.accuracy) || 0,
      deviceInfo: sessionData.deviceInfo || {},
      gameplayData: sessionData.gameplayData || []
    };
    batch.set(sessionRef, sessionDoc);

    // Update user stats
    const userRef = doc(db, USERS_COLLECTION, userId);
    batch.update(userRef, {
      'gameStats.totalGamesPlayed': increment(1),
      'gameStats.totalScore': increment(Number(score)),
      [`gameStats.${gameType}GamesPlayed`]: increment(1),
      [`gameStats.${gameType}BestScore`]: score, // This would need more logic for actual best score
      lastGamePlayed: serverTimestamp()
    });

    await batch.commit();

    // Check for achievements (run separately to avoid transaction issues)
    await checkAndAwardAchievements(userId, gameType, score, gameData);

    return {
      success: true,
      scoreId: scoreRef.id,
      sessionId: sessionRef.id
    };
  } catch (error) {
    console.error('Submit game score error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user's game scores with pagination
 */
export const getUserGameScores = async (userId, gameType = null, limitCount = 20, lastDoc = null) => {
  try {
    let q = query(
      collection(db, GAME_SCORES_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    if (gameType) {
      q = query(
        collection(db, GAME_SCORES_COLLECTION),
        where('userId', '==', userId),
        where('gameType', '==', gameType),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const scores = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      scores,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      hasMore: querySnapshot.docs.length === limitCount
    };
  } catch (error) {
    console.error('Get user game scores error:', error);
    return {
      success: false,
      error: error.message,
      scores: []
    };
  }
};

/**
 * Get top scores for a specific game
 */
export const getTopScores = async (gameType, limitCount = 10, period = 'allTime') => {
  try {
    let q = query(
      collection(db, GAME_SCORES_COLLECTION),
      where('gameType', '==', gameType),
      orderBy('score', 'desc'),
      limit(limitCount)
    );

    // Add time-based filtering for period
    if (period !== 'allTime') {
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
        default:
          startDate = null;
      }

      if (startDate) {
        q = query(
          collection(db, GAME_SCORES_COLLECTION),
          where('gameType', '==', gameType),
          where('timestamp', '>=', startDate),
          orderBy('timestamp', 'desc'),
          orderBy('score', 'desc'),
          limit(limitCount)
        );
      }
    }

    const querySnapshot = await getDocs(q);
    const scores = [];

    // Get user details for each score
    for (const scoreDocSnap of querySnapshot.docs) {
      const scoreData = { id: scoreDocSnap.id, ...scoreDocSnap.data() };
      
      // Get user profile
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, scoreData.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        scoreData.userInfo = {
          displayName: userData.displayName,
          regNumber: userData.regNumber,
          photoURL: userData.photoURL,
          college: userData.college,
          department: userData.department
        };
      }
      
      scores.push(scoreData);
    }

    return {
      success: true,
      scores
    };
  } catch (error) {
    console.error('Get top scores error:', error);
    return {
      success: false,
      error: error.message,
      scores: []
    };
  }
};

/**
 * Get user's best score for a specific game
 */
export const getUserBestScore = async (userId, gameType) => {
  try {
    const q = query(
      collection(db, GAME_SCORES_COLLECTION),
      where('userId', '==', userId),
      where('gameType', '==', gameType),
      orderBy('score', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const bestScore = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
      return {
        success: true,
        bestScore
      };
    } else {
      return {
        success: true,
        bestScore: null
      };
    }
  } catch (error) {
    console.error('Get user best score error:', error);
    return {
      success: false,
      error: error.message,
      bestScore: null
    };
  }
};

/**
 * Get user's game statistics
 */
export const getUserGameStats = async (userId) => {
  try {
    // Get user profile with game stats
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const gameStats = userData.gameStats || {};

    // Get detailed stats by querying game scores
    const scoresQuery = query(
      collection(db, GAME_SCORES_COLLECTION),
      where('userId', '==', userId)
    );
    
    const scoresSnapshot = await getDocs(scoresQuery);
    const scores = scoresSnapshot.docs.map(doc => doc.data());

    // Calculate detailed statistics
    const detailedStats = {
      totalGames: scores.length,
      totalScore: scores.reduce((sum, score) => sum + score.score, 0),
      averageScore: scores.length > 0 ? scores.reduce((sum, score) => sum + score.score, 0) / scores.length : 0,
      gameBreakdown: {}
    };

    // Group by game type
    const gameTypes = [...new Set(scores.map(s => s.gameType))];
    gameTypes.forEach(gameType => {
      const gameScores = scores.filter(s => s.gameType === gameType);
      detailedStats.gameBreakdown[gameType] = {
        gamesPlayed: gameScores.length,
        bestScore: Math.max(...gameScores.map(s => s.score)),
        averageScore: gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length,
        totalScore: gameScores.reduce((sum, s) => sum + s.score, 0),
        lastPlayed: gameScores.length > 0 ? Math.max(...gameScores.map(s => s.timestamp?.toDate?.() || new Date(s.timestamp))) : null
      };
    });

    return {
      success: true,
      stats: {
        ...gameStats,
        ...detailedStats
      }
    };
  } catch (error) {
    console.error('Get user game stats error:', error);
    return {
      success: false,
      error: error.message,
      stats: null
    };
  }
};

/**
 * Delete a game score (user can delete their own scores)
 */
export const deleteGameScore = async (scoreId, userId) => {
  try {
    // Verify ownership
    const scoreDoc = await getDoc(doc(db, GAME_SCORES_COLLECTION, scoreId));
    
    if (!scoreDoc.exists()) {
      throw new Error('Score not found');
    }

    const scoreData = scoreDoc.data();
    if (scoreData.userId !== userId) {
      throw new Error('Unauthorized to delete this score');
    }

    // Delete the score
    await deleteDoc(doc(db, GAME_SCORES_COLLECTION, scoreId));

    // Update user stats (subtract the deleted score)
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      'gameStats.totalGamesPlayed': increment(-1),
      'gameStats.totalScore': increment(-scoreData.score)
    });

    return { success: true };
  } catch (error) {
    console.error('Delete game score error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check and award achievements based on game performance
 */
export const checkAndAwardAchievements = async (userId, gameType, score, gameData) => {
  try {
    // Get all active achievements
    const achievementsQuery = query(
      collection(db, ACHIEVEMENTS_COLLECTION),
      where('isActive', '==', true)
    );
    
    const achievementsSnapshot = await getDocs(achievementsQuery);
    const achievements = achievementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get user's current achievements
    const userAchievementsQuery = query(
      collection(db, USER_ACHIEVEMENTS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const userAchievementsSnapshot = await getDocs(userAchievementsQuery);
    const userAchievements = userAchievementsSnapshot.docs.map(doc => doc.data().achievementId);

    const newAchievements = [];

    // Check each achievement
    for (const achievement of achievements) {
      // Skip if user already has this achievement
      if (userAchievements.includes(achievement.id)) {
        continue;
      }

      // Check if achievement criteria is met
      let criteriamet = false;
      const requirements = achievement.requirements;

      if (requirements.gameType && requirements.gameType === gameType) {
        switch (requirements.condition) {
          case 'single_game':
            if (requirements.minScore && score >= requirements.minScore) {
              criteriamet = true;
            }
            break;
          case 'total_score':
            // Would need to check total user score
            break;
          case 'games_played':
            // Would need to check total games played
            break;
        }
      }

      if (criteriamet) {
        // Award achievement
        await addDoc(collection(db, USER_ACHIEVEMENTS_COLLECTION), {
          userId,
          achievementId: achievement.id,
          earnedAt: serverTimestamp(),
          progress: 100,
          isCompleted: true
        });

        // Update user achievements array
        await updateDoc(doc(db, USERS_COLLECTION, userId), {
          'gameStats.achievements': arrayUnion(achievement.id)
        });

        newAchievements.push(achievement);
      }
    }

    return {
      success: true,
      newAchievements
    };
  } catch (error) {
    console.error('Check achievements error:', error);
    return {
      success: false,
      error: error.message,
      newAchievements: []
    };
  }
};

/**
 * Get game session replay data
 */
export const getGameSessionReplay = async (sessionId) => {
  try {
    const sessionDoc = await getDoc(doc(db, GAME_SESSIONS_COLLECTION, sessionId));
    
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }

    return {
      success: true,
      session: {
        id: sessionDoc.id,
        ...sessionDoc.data()
      }
    };
  } catch (error) {
    console.error('Get session replay error:', error);
    return {
      success: false,
      error: error.message,
      session: null
    };
  }
};

/**
 * Update game score verification status (admin only)
 */
export const updateScoreVerification = async (scoreId, isVerified, adminId) => {
  try {
    await updateDoc(doc(db, GAME_SCORES_COLLECTION, scoreId), {
      isVerified,
      verifiedBy: adminId,
      verifiedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Update score verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export legacy functions for backward compatibility
export const addScore = async (game, name, score) => {
  // This is a simplified version for backward compatibility
  // In a real implementation, you'd want to migrate to submitGameScore
  try {
    await addDoc(collection(db, 'scores'), {
      game,
      name,
      score,
      timestamp: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding score:', error);
    return { success: false, error };
  }
};

export const getScores = async (game) => {
  try {
    const q = query(
      collection(db, 'scores'),
      where('game', '==', game),
      orderBy('score', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting scores:', error);
    return [];
  }
};