import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  deleteUser
} from 'firebase/auth';
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

// Collections
const USERS_COLLECTION = 'users';

/**
 * Register a new user with email and profile information
 */
export const registerUser = async (userData) => {
  try {
    const { email, password, displayName, regNumber, college, department, year } = userData;
    
    // Check if registration number already exists
    const regNumberExists = await checkRegNumberExists(regNumber);
    if (regNumberExists) {
      throw new Error('Registration number already exists');
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName,
      regNumber: regNumber.toUpperCase(),
      college: college || 'REC',
      department,
      year: parseInt(year),
      photoURL: user.photoURL || '',
      isAdmin: false,
      isActive: true,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      gameStats: {
        totalGamesPlayed: 0,
        totalScore: 0,
        favoriteGame: '',
        achievements: []
      },
      eventParticipation: {
        eventsJoined: 0,
        eventsWon: 0,
        totalEventScore: 0
      }
    };

    await setDoc(doc(db, USERS_COLLECTION, user.uid), userProfile);

    return {
      success: true,
      user: { ...user, ...userProfile }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign in user with email and password
 */
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login time
    await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
      lastLogin: serverTimestamp()
    });

    // Get user profile
    const userProfile = await getUserProfile(user.uid);

    return {
      success: true,
      user: { ...user, ...userProfile }
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign in user with registration number and password (for college students)
 */
export const signInWithRegNumber = async (regNumber, password) => {
  try {
    // Find user by registration number
    const q = query(
      collection(db, USERS_COLLECTION),
      where('regNumber', '==', regNumber.toUpperCase())
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Registration number not found');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Sign in with email
    return await signInUser(userData.email, password);
  } catch (error) {
    console.error('Sign in with reg number error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    // Update auth profile if display name changed
    if (updates.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName
      });
    }

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
 * Upload and update user profile picture
 */
export const updateProfilePicture = async (uid, file) => {
  try {
    // Create storage reference
    const storageRef = ref(storage, `profile-pictures/${uid}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update user profile
    await updateUserProfile(uid, { photoURL: downloadURL });

    // Update auth profile
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
    }

    return {
      success: true,
      photoURL: downloadURL
    };
  } catch (error) {
    console.error('Update profile picture error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Change user password
 */
export const changePassword = async (newPassword) => {
  try {
    if (!auth.currentUser) {
      throw new Error('No user signed in');
    }

    await updatePassword(auth.currentUser, newPassword);
    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if registration number already exists
 */
export const checkRegNumberExists = async (regNumber) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('regNumber', '==', regNumber.toUpperCase())
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Check reg number error:', error);
    return false;
  }
};

/**
 * Check if email already exists
 */
export const checkEmailExists = async (email) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Check email error:', error);
    return false;
  }
};

/**
 * Delete user account
 */
export const deleteUserAccount = async (uid) => {
  try {
    // Delete profile picture from storage
    const profilePicRef = ref(storage, `profile-pictures/${uid}`);
    try {
      await deleteObject(profilePicRef);
    } catch (error) {
      // Profile picture might not exist
      console.log('No profile picture to delete');
    }

    // Delete user document from Firestore
    await deleteDoc(doc(db, USERS_COLLECTION, uid));

    // Delete user from Firebase Auth
    if (auth.currentUser && auth.currentUser.uid === uid) {
      await deleteUser(auth.currentUser);
    }

    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
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
export const updateUserAdminStatus = async (uid, isAdmin) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
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
 * Update user active status (admin only)
 */
export const updateUserActiveStatus = async (uid, isActive) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      isActive,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Update active status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Set up auth state listener
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      callback({ ...user, ...userProfile });
    } else {
      callback(null);
    }
  });
};

// Export auth instance for direct access
export { auth };