/**
 * Simplified Authentication Service without Email Verification
 * Uses registration numbers as primary identification with track-based organization
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  extractTrackFromRegNumber, 
  getOrCreateTrack, 
  updateTrackStats,
  getTrackDisplayName 
} from './trackService';

// Collections
const USERS_COLLECTION = 'users';

/**
 * Validate registration number format
 */
const validateRegNumber = (regNumber) => {
  // Format: YYXX##### where YY=year, XX=department, #####=roll number
  const pattern = /^\d{2}[A-Z]+\d+$/;
  return pattern.test(regNumber.toUpperCase());
};

/**
 * Generate user ID from registration number
 */
const generateUserId = (regNumber) => {
  return `user_${regNumber.toUpperCase()}`;
};

/**
 * Register or login user with registration number and username
 */
export const authenticateUser = async (username, regNumber) => {
  try {
    // Validate inputs
    if (!username?.trim()) {
      throw new Error('Username is required');
    }
    
    if (!regNumber?.trim()) {
      throw new Error('Registration number is required');
    }
    
    const normalizedRegNumber = regNumber.toUpperCase().trim();
    
    if (!validateRegNumber(normalizedRegNumber)) {
      throw new Error('Invalid registration number format. Expected format: 22U10999 or 22EE8999');
    }
    
    // Extract track from registration number
    const trackCode = extractTrackFromRegNumber(normalizedRegNumber);
    
    // Ensure track exists
    await getOrCreateTrack(trackCode);
    
    // Generate consistent user ID
    const userId = generateUserId(normalizedRegNumber);
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // Check if user exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Existing user - update last login and username if changed
      const userData = userDoc.data();
      
      const updates = {
        lastLogin: serverTimestamp(),
        ...(userData.username !== username.trim() && { username: username.trim() })
      };
      
      await updateDoc(userRef, updates);
      
      return {
        success: true,
        user: {
          id: userId,
          ...userData,
          ...updates,
          trackDisplayName: getTrackDisplayName(trackCode)
        },
        isNewUser: false
      };
    } else {
      // New user - create profile
      const newUserData = {
        id: userId,
        username: username.trim(),
        regNumber: normalizedRegNumber,
        track: trackCode,
        trackDisplayName: getTrackDisplayName(trackCode),
        isActive: true,
        isAdmin: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        gameStats: {
          totalGamesPlayed: 0,
          totalScore: 0,
          bestSnakeScore: 0,
          bestReactionScore: 0,
          achievements: []
        },
        eventParticipation: {
          eventsJoined: 0,
          eventsWon: 0,
          totalEventScore: 0
        }
      };
      
      await setDoc(userRef, newUserData);
      
      // Update track statistics
      await updateTrackStats(trackCode);
      
      return {
        success: true,
        user: newUserData,
        isNewUser: true
      };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user profile by registration number
 */
export const getUserByRegNumber = async (regNumber) => {
  try {
    const normalizedRegNumber = regNumber.toUpperCase().trim();
    const userId = generateUserId(normalizedRegNumber);
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (userDoc.exists()) {
      return {
        success: true,
        user: { id: userDoc.id, ...userDoc.data() }
      };
    }
    
    return {
      success: false,
      error: 'User not found'
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user game statistics
 */
export const updateUserGameStats = async (userId, gameStats) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      gameStats: {
        ...gameStats,
        updatedAt: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Update game stats error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
};

/**
 * Update user admin status (admin only)
 */
export const updateUserAdminStatus = async (userId, isAdmin) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      isAdmin,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Update admin status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if registration number exists
 */
export const checkRegNumberExists = async (regNumber) => {
  try {
    const result = await getUserByRegNumber(regNumber);
    return result.success;
  } catch (error) {
    console.error('Check reg number error:', error);
    return false;
  }
};

// Demo mode fallback (for development without Firebase)
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

if (DEMO_MODE) {
  console.log('Running in demo mode - using localStorage for user data');
}

/**
 * Demo mode authentication (fallback)
 */
export const authenticateUserDemo = (username, regNumber) => {
  try {
    const normalizedRegNumber = regNumber.toUpperCase().trim();
    const trackCode = extractTrackFromRegNumber(normalizedRegNumber);
    
    const userData = {
      id: generateUserId(normalizedRegNumber),
      username: username.trim(),
      regNumber: normalizedRegNumber,
      track: trackCode,
      trackDisplayName: getTrackDisplayName(trackCode),
      isActive: true,
      isAdmin: false,
      gameStats: {
        totalGamesPlayed: 0,
        totalScore: 0,
        bestSnakeScore: 0,
        bestReactionScore: 0,
        achievements: []
      }
    };
    
    return {
      success: true,
      user: userData,
      isNewUser: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};