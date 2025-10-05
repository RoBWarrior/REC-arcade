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
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Collections
const EVENTS_COLLECTION = 'events';
const EVENT_PARTICIPATIONS_COLLECTION = 'eventParticipations';
const USERS_COLLECTION = 'users';
const GAME_SCORES_COLLECTION = 'gameScores';
const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Create a new event
 */
export const createEvent = async (eventData, bannerFile = null) => {
  try {
    const {
      title,
      description,
      eventType,
      gameTypes,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      prizes,
      rules,
      createdBy
    } = eventData;

    // Validate required fields
    if (!title || !description || !eventType || !startDate || !endDate || !createdBy) {
      throw new Error('Missing required fields');
    }

    let bannerURL = '';

    // Upload banner image if provided
    if (bannerFile) {
      const bannerRef = ref(storage, `event-banners/${Date.now()}_${bannerFile.name}`);
      const snapshot = await uploadBytes(bannerRef, bannerFile);
      bannerURL = await getDownloadURL(snapshot.ref);
    }

    // Create event document
    const eventDoc = {
      title,
      description,
      eventType,
      gameTypes: gameTypes || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : new Date(startDate),
      maxParticipants: maxParticipants || 0,
      currentParticipants: 0,
      isActive: true,
      createdBy,
      createdAt: serverTimestamp(),
      prizes: prizes || [],
      rules: rules || '',
      bannerURL,
      participants: []
    };

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventDoc);

    return {
      success: true,
      eventId: docRef.id,
      event: { id: docRef.id, ...eventDoc }
    };
  } catch (error) {
    console.error('Create event error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all events with optional filtering
 */
export const getEvents = async (filters = {}) => {
  try {
    let q = collection(db, EVENTS_COLLECTION);

    // Apply filters
    if (filters.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }

    if (filters.eventType) {
      q = query(q, where('eventType', '==', filters.eventType));
    }

    // Order by start date (newest first)
    q = query(q, orderBy('startDate', 'desc'));

    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      events
    };
  } catch (error) {
    console.error('Get events error:', error);
    return {
      success: false,
      error: error.message,
      events: []
    };
  }
};

/**
 * Get a specific event by ID
 */
export const getEvent = async (eventId) => {
  try {
    const eventDoc = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    return {
      success: true,
      event: {
        id: eventDoc.id,
        ...eventDoc.data()
      }
    };
  } catch (error) {
    console.error('Get event error:', error);
    return {
      success: false,
      error: error.message,
      event: null
    };
  }
};

/**
 * Update an event
 */
export const updateEvent = async (eventId, updates, bannerFile = null) => {
  try {
    let bannerURL = updates.bannerURL;

    // Upload new banner if provided
    if (bannerFile) {
      // Delete old banner if exists
      if (updates.bannerURL) {
        try {
          const oldBannerRef = ref(storage, updates.bannerURL);
          await deleteObject(oldBannerRef);
        } catch (error) {
          console.log('Old banner not found or already deleted');
        }
      }

      const bannerRef = ref(storage, `event-banners/${Date.now()}_${bannerFile.name}`);
      const snapshot = await uploadBytes(bannerRef, bannerFile);
      bannerURL = await getDownloadURL(snapshot.ref);
    }

    const updateData = {
      ...updates,
      bannerURL,
      updatedAt: serverTimestamp()
    };

    // Convert date strings to Date objects
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.registrationDeadline) {
      updateData.registrationDeadline = new Date(updateData.registrationDeadline);
    }

    await updateDoc(doc(db, EVENTS_COLLECTION, eventId), updateData);

    return { success: true };
  } catch (error) {
    console.error('Update event error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId) => {
  try {
    // Get event data first to delete banner
    const eventDoc = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
    
    if (eventDoc.exists()) {
      const eventData = eventDoc.data();
      
      // Delete banner image if exists
      if (eventData.bannerURL) {
        try {
          const bannerRef = ref(storage, eventData.bannerURL);
          await deleteObject(bannerRef);
        } catch (error) {
          console.log('Banner not found or already deleted');
        }
      }

      // Delete all event participations
      const participationsQuery = query(
        collection(db, EVENT_PARTICIPATIONS_COLLECTION),
        where('eventId', '==', eventId)
      );
      const participationsSnapshot = await getDocs(participationsQuery);
      
      const batch = writeBatch(db);
      participationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete event
      batch.delete(doc(db, EVENTS_COLLECTION, eventId));
      
      await batch.commit();
    }

    return { success: true };
  } catch (error) {
    console.error('Delete event error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Register user for an event
 */
export const registerForEvent = async (eventId, userId) => {
  try {
    // Check if event exists and is active
    const eventDoc = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();
    
    if (!eventData.isActive) {
      throw new Error('Event is not active');
    }

    // Check registration deadline
    const now = new Date();
    const deadline = eventData.registrationDeadline.toDate();
    
    if (now > deadline) {
      throw new Error('Registration deadline has passed');
    }

    // Check if user is already registered
    const existingParticipation = await getUserEventParticipation(eventId, userId);
    if (existingParticipation) {
      throw new Error('User already registered for this event');
    }

    // Check max participants
    if (eventData.maxParticipants > 0 && eventData.currentParticipants >= eventData.maxParticipants) {
      throw new Error('Event is full');
    }

    const batch = writeBatch(db);

    // Create participation record
    const participationRef = doc(collection(db, EVENT_PARTICIPATIONS_COLLECTION));
    const participationData = {
      eventId,
      userId,
      registeredAt: serverTimestamp(),
      status: 'registered',
      scores: [],
      totalScore: 0,
      rank: 0,
      completedAt: null
    };
    batch.set(participationRef, participationData);

    // Update event participant count and list
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    batch.update(eventRef, {
      currentParticipants: increment(1),
      participants: arrayUnion(userId)
    });

    // Update user event participation stats
    const userRef = doc(db, USERS_COLLECTION, userId);
    batch.update(userRef, {
      'eventParticipation.eventsJoined': increment(1)
    });

    // Create notification for user
    const notificationRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
    const notificationData = {
      userId,
      title: 'Event Registration Successful',
      message: `You have successfully registered for ${eventData.title}`,
      type: 'event',
      isRead: false,
      actionURL: `/events/${eventId}`,
      createdAt: serverTimestamp(),
      expiresAt: eventData.endDate
    };
    batch.set(notificationRef, notificationData);

    await batch.commit();

    return {
      success: true,
      participationId: participationRef.id
    };
  } catch (error) {
    console.error('Register for event error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Unregister user from an event
 */
export const unregisterFromEvent = async (eventId, userId) => {
  try {
    // Get participation record
    const participationQuery = query(
      collection(db, EVENT_PARTICIPATIONS_COLLECTION),
      where('eventId', '==', eventId),
      where('userId', '==', userId)
    );
    
    const participationSnapshot = await getDocs(participationQuery);
    
    if (participationSnapshot.empty) {
      throw new Error('User not registered for this event');
    }

    const participationDoc = participationSnapshot.docs[0];
    const participationData = participationDoc.data();
    
    // Check if event has started
    const eventDoc = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
    const eventData = eventDoc.data();
    const now = new Date();
    
    if (now >= eventData.startDate.toDate()) {
      throw new Error('Cannot unregister after event has started');
    }

    const batch = writeBatch(db);

    // Delete participation record
    batch.delete(participationDoc.ref);

    // Update event participant count and list
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    batch.update(eventRef, {
      currentParticipants: increment(-1),
      participants: arrayRemove(userId)
    });

    // Update user event participation stats
    const userRef = doc(db, USERS_COLLECTION, userId);
    batch.update(userRef, {
      'eventParticipation.eventsJoined': increment(-1)
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Unregister from event error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Submit score for an event
 */
export const submitEventScore = async (eventId, userId, gameType, score, gameData = {}) => {
  try {
    // Get participation record
    const participation = await getUserEventParticipation(eventId, userId);
    
    if (!participation) {
      throw new Error('User not registered for this event');
    }

    // Check if event is active
    const eventDoc = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
    const eventData = eventDoc.data();
    const now = new Date();
    
    if (now < eventData.startDate.toDate() || now > eventData.endDate.toDate()) {
      throw new Error('Event is not currently active');
    }

    // Check if game type is allowed in this event
    if (eventData.gameTypes.length > 0 && !eventData.gameTypes.includes(gameType)) {
      throw new Error('This game is not part of this event');
    }

    const batch = writeBatch(db);

    // Add score to general game scores collection
    const scoreRef = doc(collection(db, GAME_SCORES_COLLECTION));
    const scoreData = {
      userId,
      gameType,
      score: Number(score),
      timestamp: serverTimestamp(),
      isVerified: true,
      gameData,
      eventId // Link to event
    };
    batch.set(scoreRef, scoreData);

    // Update participation record
    const participationRef = doc(db, EVENT_PARTICIPATIONS_COLLECTION, participation.id);
    const existingScoreIndex = participation.scores.findIndex(s => s.gameType === gameType);
    
    let updatedScores = [...participation.scores];
    if (existingScoreIndex >= 0) {
      // Update existing score if new score is better
      if (score > updatedScores[existingScoreIndex].score) {
        updatedScores[existingScoreIndex] = {
          gameType,
          score: Number(score),
          timestamp: serverTimestamp()
        };
      }
    } else {
      // Add new score
      updatedScores.push({
        gameType,
        score: Number(score),
        timestamp: serverTimestamp()
      });
    }

    const totalScore = updatedScores.reduce((sum, s) => sum + s.score, 0);
    
    batch.update(participationRef, {
      scores: updatedScores,
      totalScore,
      status: 'active'
    });

    await batch.commit();

    // Update event rankings
    await updateEventRankings(eventId);

    return {
      success: true,
      scoreId: scoreRef.id,
      totalScore
    };
  } catch (error) {
    console.error('Submit event score error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user's participation in an event
 */
export const getUserEventParticipation = async (eventId, userId) => {
  try {
    const participationQuery = query(
      collection(db, EVENT_PARTICIPATIONS_COLLECTION),
      where('eventId', '==', eventId),
      where('userId', '==', userId)
    );
    
    const participationSnapshot = await getDocs(participationQuery);
    
    if (!participationSnapshot.empty) {
      const doc = participationSnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Get user event participation error:', error);
    return null;
  }
};

/**
 * Get event leaderboard
 */
export const getEventLeaderboard = async (eventId, limitCount = 50) => {
  try {
    const participationsQuery = query(
      collection(db, EVENT_PARTICIPATIONS_COLLECTION),
      where('eventId', '==', eventId),
      orderBy('totalScore', 'desc'),
      limit(limitCount)
    );
    
    const participationsSnapshot = await getDocs(participationsQuery);
    const participations = [];
    
    // Get user details for each participation
    for (const doc of participationsSnapshot.docs) {
      const participationData = { id: doc.id, ...doc.data() };
      
      // Get user profile
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, participationData.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        participationData.userInfo = {
          displayName: userData.displayName,
          regNumber: userData.regNumber,
          photoURL: userData.photoURL,
          college: userData.college,
          department: userData.department
        };
      }
      
      participations.push(participationData);
    }

    return {
      success: true,
      leaderboard: participations
    };
  } catch (error) {
    console.error('Get event leaderboard error:', error);
    return {
      success: false,
      error: error.message,
      leaderboard: []
    };
  }
};

/**
 * Update event rankings
 */
export const updateEventRankings = async (eventId) => {
  try {
    const participationsQuery = query(
      collection(db, EVENT_PARTICIPATIONS_COLLECTION),
      where('eventId', '==', eventId),
      orderBy('totalScore', 'desc')
    );
    
    const participationsSnapshot = await getDocs(participationsQuery);
    const batch = writeBatch(db);
    
    participationsSnapshot.docs.forEach((doc, index) => {
      batch.update(doc.ref, { rank: index + 1 });
    });
    
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    console.error('Update event rankings error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Complete an event and award winners
 */
export const completeEvent = async (eventId) => {
  try {
    const batch = writeBatch(db);
    
    // Update event status
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    batch.update(eventRef, {
      isActive: false,
      completedAt: serverTimestamp()
    });
    
    // Get final leaderboard
    const leaderboardResult = await getEventLeaderboard(eventId);
    
    if (leaderboardResult.success) {
      const winners = leaderboardResult.leaderboard.slice(0, 3); // Top 3 winners
      
      // Update winner stats and create notifications
      winners.forEach((winner, index) => {
        const userRef = doc(db, USERS_COLLECTION, winner.userId);
        
        if (index === 0) { // First place
          batch.update(userRef, {
            'eventParticipation.eventsWon': increment(1)
          });
        }
        
        // Create winner notification
        const notificationRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
        const notificationData = {
          userId: winner.userId,
          title: `Event Completed - Rank #${winner.rank}`,
          message: `You finished at rank ${winner.rank} in the event!`,
          type: 'event',
          isRead: false,
          createdAt: serverTimestamp()
        };
        batch.set(notificationRef, notificationData);
      });
    }
    
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    console.error('Complete event error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Set up real-time event listener
 */
export const subscribeToEvent = (eventId, callback) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    
    return onSnapshot(eventRef, (doc) => {
      if (doc.exists()) {
        callback({
          success: true,
          event: {
            id: doc.id,
            ...doc.data()
          }
        });
      } else {
        callback({
          success: false,
          error: 'Event not found'
        });
      }
    }, (error) => {
      console.error('Event subscription error:', error);
      callback({
        success: false,
        error: error.message
      });
    });
  } catch (error) {
    console.error('Subscribe to event error:', error);
    return null;
  }
};

// Legacy functions for backward compatibility
export const addEvent = createEvent;
export { getEvents as getAllEvents };