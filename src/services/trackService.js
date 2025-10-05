/**
 * Track Service - Manages user tracks based on registration numbers
 * Tracks are determined by the department code in registration numbers
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const USERS_COLLECTION = 'users';
const TRACKS_COLLECTION = 'tracks';

/**
 * Extract track from registration number
 * Examples: 22U10999 -> U, 22EE8999 -> EE, 22CS7999 -> CS
 */
export const extractTrackFromRegNumber = (regNumber) => {
  const normalized = regNumber.toUpperCase();
  
  // Pattern: YYXX where YY is year, XX is department code
  const match = normalized.match(/^\d{2}([A-Z]+)\d+$/);
  
  if (match) {
    return match[1]; // Return the department code (U, EE, CS, etc.)
  }
  
  // Fallback for unrecognized patterns
  return 'GENERAL';
};

/**
 * Get track display name
 */
export const getTrackDisplayName = (trackCode) => {
  const trackNames = {
    'U': 'Undergraduate',
    'EE': 'Electrical Engineering',
    'CS': 'Computer Science',
    'CE': 'Civil Engineering',
    'ME': 'Mechanical Engineering',
    'ECE': 'Electronics & Communication',
    'IT': 'Information Technology',
    'CSE': 'Computer Science & Engineering',
    'GENERAL': 'General Track'
  };
  
  return trackNames[trackCode] || `${trackCode} Track`;
};

/**
 * Get or create track document
 */
export const getOrCreateTrack = async (trackCode) => {
  try {
    const trackRef = doc(db, TRACKS_COLLECTION, trackCode);
    const trackDoc = await getDoc(trackRef);
    
    if (!trackDoc.exists()) {
      // Create new track
      const trackData = {
        code: trackCode,
        name: getTrackDisplayName(trackCode),
        totalUsers: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(trackRef, trackData);
      return trackData;
    }
    
    return trackDoc.data();
  } catch (error) {
    console.error('Error getting/creating track:', error);
    return null;
  }
};

/**
 * Get all tracks
 */
export const getAllTracks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, TRACKS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting tracks:', error);
    return [];
  }
};

/**
 * Get users by track
 */
export const getUsersByTrack = async (trackCode) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('track', '==', trackCode),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users by track:', error);
    return [];
  }
};

/**
 * Get track leaderboard
 */
export const getTrackLeaderboard = async (trackCode, gameType = null) => {
  try {
    let q;
    
    if (gameType) {
      // Get leaderboard for specific game within track
      q = query(
        collection(db, 'scores'),
        where('userTrack', '==', trackCode),
        where('game', '==', gameType),
        orderBy('score', 'desc'),
        limit(10)
      );
    } else {
      // Get overall track leaderboard based on total scores
      const users = await getUsersByTrack(trackCode);
      return users
        .map(user => ({
          ...user,
          totalScore: user.gameStats?.totalScore || 0
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 10);
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting track leaderboard:', error);
    return [];
  }
};

/**
 * Update track statistics
 */
export const updateTrackStats = async (trackCode) => {
  try {
    const users = await getUsersByTrack(trackCode);
    const trackRef = doc(db, TRACKS_COLLECTION, trackCode);
    
    await updateDoc(trackRef, {
      totalUsers: users.length,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating track stats:', error);
    return { success: false, error: error.message };
  }
};