import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
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
const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Create a notification for a user
 */
export const createNotification = async (notificationData) => {
  try {
    const {
      userId,
      title,
      message,
      type = 'system',
      actionURL = null,
      expiresAt = null
    } = notificationData;

    if (!userId || !title || !message) {
      throw new Error('Missing required fields: userId, title, or message');
    }

    const notification = {
      userId,
      title,
      message,
      type,
      isRead: false,
      actionURL,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt ? new Date(expiresAt) : null
    };

    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);

    return {
      success: true,
      notificationId: docRef.id,
      notification: { id: docRef.id, ...notification }
    };
  } catch (error) {
    console.error('Create notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId, limitCount = 50, unreadOnly = false) => {
  try {
    let q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (unreadOnly) {
      q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      notifications
    };
  } catch (error) {
    console.error('Get user notifications error:', error);
    return {
      success: false,
      error: error.message,
      notifications: []
    };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
      isRead: true,
      readAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const unreadQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const unreadSnapshot = await getDocs(unreadQuery);
    
    if (unreadSnapshot.empty) {
      return { success: true, updatedCount: 0 };
    }

    const batch = writeBatch(db);
    
    unreadSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: serverTimestamp()
      });
    });

    await batch.commit();

    return {
      success: true,
      updatedCount: unreadSnapshot.docs.length
    };
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return {
      success: false,
      error: error.message,
      updatedCount: 0
    };
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId, userId) => {
  try {
    // Verify ownership before deletion
    const notificationDoc = await getDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
    
    if (!notificationDoc.exists()) {
      throw new Error('Notification not found');
    }

    const notificationData = notificationDoc.data();
    if (notificationData.userId !== userId) {
      throw new Error('Unauthorized to delete this notification');
    }

    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));

    return { success: true };
  } catch (error) {
    console.error('Delete notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete all notifications for a user
 */
export const deleteAllNotifications = async (userId) => {
  try {
    const userNotificationsQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId)
    );

    const userNotificationsSnapshot = await getDocs(userNotificationsQuery);
    
    if (userNotificationsSnapshot.empty) {
      return { success: true, deletedCount: 0 };
    }

    const batch = writeBatch(db);
    
    userNotificationsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return {
      success: true,
      deletedCount: userNotificationsSnapshot.docs.length
    };
  } catch (error) {
    console.error('Delete all notifications error:', error);
    return {
      success: false,
      error: error.message,
      deletedCount: 0
    };
  }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const unreadQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const unreadSnapshot = await getDocs(unreadQuery);

    return {
      success: true,
      count: unreadSnapshot.docs.length
    };
  } catch (error) {
    console.error('Get unread notification count error:', error);
    return {
      success: false,
      error: error.message,
      count: 0
    };
  }
};

/**
 * Subscribe to real-time notifications for a user
 */
export const subscribeToNotifications = (userId, callback) => {
  try {
    const notificationsQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(notificationsQuery, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      callback({
        success: true,
        notifications
      });
    }, (error) => {
      console.error('Notifications subscription error:', error);
      callback({
        success: false,
        error: error.message,
        notifications: []
      });
    });
  } catch (error) {
    console.error('Subscribe to notifications error:', error);
    return null;
  }
};

/**
 * Send bulk notifications to multiple users
 */
export const sendBulkNotifications = async (userIds, notificationData) => {
  try {
    const {
      title,
      message,
      type = 'system',
      actionURL = null,
      expiresAt = null
    } = notificationData;

    if (!title || !message || !userIds || userIds.length === 0) {
      throw new Error('Missing required fields');
    }

    const batch = writeBatch(db);
    const notificationIds = [];

    userIds.forEach(userId => {
      const notificationRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
      const notification = {
        userId,
        title,
        message,
        type,
        isRead: false,
        actionURL,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt ? new Date(expiresAt) : null
      };

      batch.set(notificationRef, notification);
      notificationIds.push(notificationRef.id);
    });

    await batch.commit();

    return {
      success: true,
      notificationIds,
      sentCount: userIds.length
    };
  } catch (error) {
    console.error('Send bulk notifications error:', error);
    return {
      success: false,
      error: error.message,
      sentCount: 0
    };
  }
};

/**
 * Create system-wide announcement
 */
export const createSystemAnnouncement = async (announcementData) => {
  try {
    const {
      title,
      message,
      targetUsers = 'all', // 'all', 'active', 'admins', or array of user IDs
      expiresAt = null
    } = announcementData;

    // Get target user IDs based on criteria
    let userIds = [];
    
    if (Array.isArray(targetUsers)) {
      userIds = targetUsers;
    } else {
      let usersQuery;
      
      switch (targetUsers) {
        case 'active':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          usersQuery = query(
            collection(db, 'users'),
            where('isActive', '==', true),
            where('lastLogin', '>=', thirtyDaysAgo)
          );
          break;
        case 'admins':
          usersQuery = query(
            collection(db, 'users'),
            where('isAdmin', '==', true)
          );
          break;
        default: // 'all'
          usersQuery = query(
            collection(db, 'users'),
            where('isActive', '==', true)
          );
      }
      
      const usersSnapshot = await getDocs(usersQuery);
      userIds = usersSnapshot.docs.map(doc => doc.id);
    }

    // Send notifications to all target users
    const result = await sendBulkNotifications(userIds, {
      title,
      message,
      type: 'system',
      expiresAt
    });

    return result;
  } catch (error) {
    console.error('Create system announcement error:', error);
    return {
      success: false,
      error: error.message,
      sentCount: 0
    };
  }
};

/**
 * Clean up expired notifications
 */
export const cleanupExpiredNotifications = async () => {
  try {
    const now = new Date();
    const expiredQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('expiresAt', '<=', now)
    );

    const expiredSnapshot = await getDocs(expiredQuery);
    
    if (expiredSnapshot.empty) {
      return { success: true, deletedCount: 0 };
    }

    const batch = writeBatch(db);
    
    expiredSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return {
      success: true,
      deletedCount: expiredSnapshot.docs.length
    };
  } catch (error) {
    console.error('Cleanup expired notifications error:', error);
    return {
      success: false,
      error: error.message,
      deletedCount: 0
    };
  }
};