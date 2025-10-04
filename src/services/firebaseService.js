import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, DEMO_MODE } from '../config/firebase';

// Demo data storage (in-memory for demo purposes)
let demoData = {
  scores: [
    { id: '1', game: 'snake', name: 'Alex Johnson', score: 150, timestamp: new Date('2024-01-15') },
    { id: '2', game: 'snake', name: 'Sarah Chen', score: 140, timestamp: new Date('2024-01-14') },
    { id: '3', game: 'snake', name: 'Mike Rodriguez', score: 130, timestamp: new Date('2024-01-13') },
    { id: '4', game: 'reaction', name: 'Emily Davis', score: 4200, timestamp: new Date('2024-01-15') },
    { id: '5', game: 'reaction', name: 'David Kim', score: 4100, timestamp: new Date('2024-01-14') },
    { id: '6', game: 'reaction', name: 'Lisa Wang', score: 4000, timestamp: new Date('2024-01-13') }
  ],
  offlineScores: [
    { id: '1', game: 'Hackathon 2024', name: 'Team Alpha', score: 95, timestamp: new Date('2024-01-10') },
    { id: '2', game: 'Hackathon 2024', name: 'Team Beta', score: 88, timestamp: new Date('2024-01-10') },
    { id: '3', game: 'Coding Competition', name: 'John Smith', score: 92, timestamp: new Date('2024-01-08') },
    { id: '4', game: 'Coding Competition', name: 'Maria Garcia', score: 89, timestamp: new Date('2024-01-08') }
  ],
  events: [
    {
      id: '1',
      title: 'Weekly Coding Challenge',
      date: new Date('2024-01-20T10:00:00'),
      description: 'Join us for our weekly coding challenge featuring algorithm problems and data structures.',
      timestamp: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'React Workshop',
      date: new Date('2024-01-25T14:00:00'),
      description: 'Learn modern React development with hooks, context, and best practices.',
      timestamp: new Date('2024-01-12')
    },
    {
      id: '3',
      title: 'Hackathon 2024',
      date: new Date('2024-02-01T09:00:00'),
      description: 'Our biggest event of the year! 24-hour coding marathon with prizes and networking.',
      timestamp: new Date('2024-01-10')
    }
  ]
};

// Collections
const SCORES_COLLECTION = 'scores';
const OFFLINE_SCORES_COLLECTION = 'offlineScores';
const EVENTS_COLLECTION = 'events';

// Demo functions (for when Firebase is not available)
const demoFunctions = {
  addScore: async (game, name, score) => {
    const newScore = {
      id: Date.now().toString(),
      game,
      name,
      score,
      timestamp: new Date()
    };
    demoData.scores.push(newScore);
    return { success: true };
  },

  getScores: async (game) => {
    return demoData.scores
      .filter(s => s.game === game)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  },

  addOfflineScore: async (game, name, score) => {
    const newScore = {
      id: Date.now().toString(),
      game,
      name,
      score,
      timestamp: new Date()
    };
    demoData.offlineScores.push(newScore);
    return { success: true };
  },

  getOfflineScores: async () => {
    return demoData.offlineScores.sort((a, b) => b.score - a.score);
  },

  deleteOfflineScore: async (id) => {
    demoData.offlineScores = demoData.offlineScores.filter(s => s.id !== id);
    return { success: true };
  },

  addEvent: async (eventData) => {
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      timestamp: new Date()
    };
    demoData.events.push(newEvent);
    return { success: true };
  },

  getEvents: async () => {
    return demoData.events.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  deleteEvent: async (id) => {
    demoData.events = demoData.events.filter(e => e.id !== id);
    return { success: true };
  }
};

// Real Firebase functions
const realFirebaseFunctions = {
  addScore: async (game, name, score) => {
    try {
      await addDoc(collection(db, SCORES_COLLECTION), {
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
  },

  getScores: async (game) => {
    try {
      const q = query(
        collection(db, SCORES_COLLECTION),
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
  },

  addOfflineScore: async (game, name, score) => {
    try {
      await addDoc(collection(db, OFFLINE_SCORES_COLLECTION), {
        game,
        name,
        score,
        timestamp: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding offline score:', error);
      return { success: false, error };
    }
  },

  getOfflineScores: async () => {
    try {
      const q = query(
        collection(db, OFFLINE_SCORES_COLLECTION),
        orderBy('score', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting offline scores:', error);
      return [];
    }
  },

  deleteOfflineScore: async (id) => {
    try {
      await deleteDoc(doc(db, OFFLINE_SCORES_COLLECTION, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting offline score:', error);
      return { success: false, error };
    }
  },

  addEvent: async (eventData) => {
    try {
      await addDoc(collection(db, EVENTS_COLLECTION), {
        ...eventData,
        timestamp: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding event:', error);
      return { success: false, error };
    }
  },

  getEvents: async () => {
    try {
      const q = query(
        collection(db, EVENTS_COLLECTION),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  },

  deleteEvent: async (id) => {
    try {
      await deleteDoc(doc(db, EVENTS_COLLECTION, id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, error };
    }
  }
};

// Export functions (use demo functions if in demo mode, otherwise use real Firebase)
export const addScore = DEMO_MODE ? demoFunctions.addScore : realFirebaseFunctions.addScore;
export const getScores = DEMO_MODE ? demoFunctions.getScores : realFirebaseFunctions.getScores;
export const addOfflineScore = DEMO_MODE ? demoFunctions.addOfflineScore : realFirebaseFunctions.addOfflineScore;
export const getOfflineScores = DEMO_MODE ? demoFunctions.getOfflineScores : realFirebaseFunctions.getOfflineScores;
export const deleteOfflineScore = DEMO_MODE ? demoFunctions.deleteOfflineScore : realFirebaseFunctions.deleteOfflineScore;
export const addEvent = DEMO_MODE ? demoFunctions.addEvent : realFirebaseFunctions.addEvent;
export const getEvents = DEMO_MODE ? demoFunctions.getEvents : realFirebaseFunctions.getEvents;
export const deleteEvent = DEMO_MODE ? demoFunctions.deleteEvent : realFirebaseFunctions.deleteEvent;