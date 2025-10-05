import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const LEADERBOARDS_COLLECTION = 'leaderboards';
const GAME_SCORES_COLLECTION = 'gameScores';
const USERS_COLLECTION = 'users';

/**
 * Generate leaderboard for a specific game and time period
 */
export const generateLeaderboard = async (gameType, period = 'allTime', forceRefresh = false) => {
  try {
    const leaderboardId = `${gameType}_${period}`;
    
    // Check if leaderboard exists and is recent (unless force refresh)
    if (!forceRefresh) {
      const existingLeaderboard = await getLeaderboard(gameType, period);
      if (existingLeaderboard && existingLeaderboard.lastUpdated) {
        const now = new Date();
        const lastUpdate = existingLeaderboard.lastUpdated.toDate();
        const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
        
        // Return existing if updated within last hour
        if (hoursSinceUpdate < 1) {
          return {
            success: true,
            leaderboard: existingLeaderboard
          };
        }
      }
    }

    // Build query based on time period
    let scoresQuery = query(
      collection(db, GAME_SCORES_COLLECTION),
      where('gameType', '==', gameType),
      where('isVerified', '==', true),
      orderBy('score', 'desc'),
      limit(100) // Get top 100 scores
    );

    // Add time-based filtering
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
      }

      if (startDate) {
        scoresQuery = query(
          collection(db, GAME_SCORES_COLLECTION),
          where('gameType', '==', gameType),
          where('isVerified', '==', true),
          where('timestamp', '>=', startDate),
          orderBy('timestamp', 'desc'),
          orderBy('score', 'desc'),
          limit(100)
        );
      }
    }

    const scoresSnapshot = await getDocs(scoresQuery);
    const scores = scoresSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get unique users (in case of multiple scores per user, take the best)
    const userBestScores = new Map();
    
    for (const score of scores) {
      const userId = score.userId;
      if (!userBestScores.has(userId) || userBestScores.get(userId).score < score.score) {
        userBestScores.set(userId, score);
      }
    }

    // Get user details and create rankings
    const rankings = [];
    let rank = 1;
    
    // Sort by score descending
    const sortedScores = Array.from(userBestScores.values()).sort((a, b) => b.score - a.score);
    
    for (const score of sortedScores) {
      try {
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, score.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          rankings.push({
            rank,
            userId: score.userId,
            displayName: userData.displayName || 'Anonymous',
            regNumber: userData.regNumber || '',
            college: userData.college || 'Unknown',
            department: userData.department || '',
            photoURL: userData.photoURL || '',
            score: score.score,
            timestamp: score.timestamp,
            scoreId: score.id
          });
          rank++;
        }
      } catch (error) {
        console.error('Error fetching user data for leaderboard:', error);
        // Continue with next user
      }
    }

    // Save leaderboard to database
    const leaderboardData = {
      id: leaderboardId,
      gameType,
      period,
      lastUpdated: serverTimestamp(),
      totalParticipants: rankings.length,
      rankings: rankings.slice(0, 50) // Store top 50 in database
    };

    await setDoc(doc(db, LEADERBOARDS_COLLECTION, leaderboardId), leaderboardData);

    return {
      success: true,
      leaderboard: {
        ...leaderboardData,
        rankings
      }
    };
  } catch (error) {
    console.error('Generate leaderboard error:', error);
    return {
      success: false,
      error: error.message,
      leaderboard: null
    };
  }
};

/**
 * Get leaderboard from database
 */
export const getLeaderboard = async (gameType, period = 'allTime') => {
  try {
    const leaderboardId = `${gameType}_${period}`;
    const leaderboardDoc = await getDoc(doc(db, LEADERBOARDS_COLLECTION, leaderboardId));
    
    if (leaderboardDoc.exists()) {
      return {
        id: leaderboardDoc.id,
        ...leaderboardDoc.data()
      };
    } else {
      // Generate leaderboard if it doesn't exist
      const result = await generateLeaderboard(gameType, period);
      return result.success ? result.leaderboard : null;
    }
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return null;
  }
};

/**
 * Get user's rank in a specific leaderboard
 */
export const getUserRank = async (userId, gameType, period = 'allTime') => {
  try {
    const leaderboard = await getLeaderboard(gameType, period);
    
    if (!leaderboard || !leaderboard.rankings) {
      return {
        success: false,
        error: 'Leaderboard not found',
        rank: null
      };
    }

    const userRanking = leaderboard.rankings.find(ranking => ranking.userId === userId);
    
    if (userRanking) {
      return {
        success: true,
        rank: userRanking.rank,
        score: userRanking.score,
        totalParticipants: leaderboard.totalParticipants
      };
    } else {
      return {
        success: true,
        rank: null,
        score: 0,
        totalParticipants: leaderboard.totalParticipants
      };
    }
  } catch (error) {
    console.error('Get user rank error:', error);
    return {
      success: false,
      error: error.message,
      rank: null
    };
  }
};

/**
 * Get top players around a user's rank
 */
export const getLeaderboardAroundUser = async (userId, gameType, period = 'allTime', range = 5) => {
  try {
    const leaderboard = await getLeaderboard(gameType, period);
    
    if (!leaderboard || !leaderboard.rankings) {
      return {
        success: false,
        error: 'Leaderboard not found',
        rankings: []
      };
    }

    const userIndex = leaderboard.rankings.findIndex(ranking => ranking.userId === userId);
    
    if (userIndex === -1) {
      // User not in leaderboard, return top players
      return {
        success: true,
        rankings: leaderboard.rankings.slice(0, range * 2 + 1),
        userRank: null
      };
    }

    // Get players around user
    const start = Math.max(0, userIndex - range);
    const end = Math.min(leaderboard.rankings.length, userIndex + range + 1);
    
    return {
      success: true,
      rankings: leaderboard.rankings.slice(start, end),
      userRank: userIndex + 1
    };
  } catch (error) {
    console.error('Get leaderboard around user error:', error);
    return {
      success: false,
      error: error.message,
      rankings: []
    };
  }
};

/**
 * Get multi-game leaderboard (overall best players)
 */
export const getOverallLeaderboard = async (period = 'allTime', limitCount = 50) => {
  try {
    // Get all game types first
    const gameTypes = ['snake', 'reaction', 'memory']; // Add more as needed
    const userScores = new Map();

    for (const gameType of gameTypes) {
      const leaderboard = await getLeaderboard(gameType, period);
      if (leaderboard && leaderboard.rankings) {
        leaderboard.rankings.forEach(ranking => {
          const userId = ranking.userId;
          if (!userScores.has(userId)) {
            userScores.set(userId, {
              userId,
              displayName: ranking.displayName,
              regNumber: ranking.regNumber,
              college: ranking.college,
              department: ranking.department,
              photoURL: ranking.photoURL,
              totalScore: 0,
              gamesPlayed: 0,
              bestScores: {}
            });
          }
          
          const user = userScores.get(userId);
          user.totalScore += ranking.score;
          user.gamesPlayed += 1;
          user.bestScores[gameType] = ranking.score;
        });
      }
    }

    // Sort by total score and add ranks
    const rankings = Array.from(userScores.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limitCount)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        averageScore: user.totalScore / user.gamesPlayed
      }));

    return {
      success: true,
      rankings,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Get overall leaderboard error:', error);
    return {
      success: false,
      error: error.message,
      rankings: []
    };
  }
};

/**
 * Set up real-time leaderboard listener
 */
export const subscribeToLeaderboard = (gameType, period, callback) => {
  try {
    const leaderboardId = `${gameType}_${period}`;
    const leaderboardRef = doc(db, LEADERBOARDS_COLLECTION, leaderboardId);
    
    return onSnapshot(leaderboardRef, (doc) => {
      if (doc.exists()) {
        callback({
          success: true,
          leaderboard: {
            id: doc.id,
            ...doc.data()
          }
        });
      } else {
        // Generate leaderboard if it doesn't exist
        generateLeaderboard(gameType, period).then(result => {
          if (result.success) {
            callback(result);
          }
        });
      }
    }, (error) => {
      console.error('Leaderboard subscription error:', error);
      callback({
        success: false,
        error: error.message
      });
    });
  } catch (error) {
    console.error('Subscribe to leaderboard error:', error);
    return null;
  }
};

/**
 * Refresh all leaderboards (admin function)
 */
export const refreshAllLeaderboards = async () => {
  try {
    const gameTypes = ['snake', 'reaction', 'memory']; // Add more as needed
    const periods = ['daily', 'weekly', 'monthly', 'allTime'];
    const batch = writeBatch(db);
    
    const results = [];
    
    for (const gameType of gameTypes) {
      for (const period of periods) {
        try {
          const result = await generateLeaderboard(gameType, period, true);
          results.push({
            gameType,
            period,
            success: result.success,
            error: result.error || null
          });
        } catch (error) {
          results.push({
            gameType,
            period,
            success: false,
            error: error.message
          });
        }
      }
    }

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Refresh all leaderboards error:', error);
    return {
      success: false,
      error: error.message,
      results: []
    };
  }
};

/**
 * Get leaderboard statistics
 */
export const getLeaderboardStats = async (gameType, period = 'allTime') => {
  try {
    const leaderboard = await getLeaderboard(gameType, period);
    
    if (!leaderboard || !leaderboard.rankings) {
      return {
        success: false,
        error: 'Leaderboard not found',
        stats: null
      };
    }

    const scores = leaderboard.rankings.map(r => r.score);
    const stats = {
      totalPlayers: leaderboard.rankings.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      medianScore: scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)],
      lastUpdated: leaderboard.lastUpdated
    };

    return {
      success: true,
      stats
    };
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    return {
      success: false,
      error: error.message,
      stats: null
    };
  }
};

// Legacy function for backward compatibility
export const getScores = async (game) => {
  try {
    const leaderboard = await getLeaderboard(game, 'allTime');
    if (leaderboard && leaderboard.rankings) {
      return leaderboard.rankings.slice(0, 10).map(ranking => ({
        id: ranking.scoreId,
        game,
        name: ranking.displayName,
        score: ranking.score,
        timestamp: ranking.timestamp
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting scores:', error);
    return [];
  }
};