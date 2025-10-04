import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
const firebaseConfig = {
  apiKey: "AIzaSyCNCf0mCxVukICn9fB7Je61jtzY1ACVg7g",
  authDomain: "rechase-b4b01.firebaseapp.com",
  projectId: "rechase-b4b01",
  storageBucket: "rechase-b4b01.firebasestorage.app",
  messagingSenderId: "687718265383",
  appId: "1:687718265383:web:ac7b154f1a878ac5195402",
  measurementId: "G-7KLKDSYHTC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;

// Demo mode flag
export const DEMO_MODE = true;