
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  doc, 
  setDoc, 
  increment,
  updateDoc
} from "firebase/firestore";
import { logger } from "./logger";

// Note: These should be provided as environment variables in Railway/local .env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

let db: any = null;
let isConfigured = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined') {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isConfigured = true;
    logger.info("Firebase Initialized: Live stats enabled.");
  } else {
    logger.warn("Firebase config missing. Operating in Local Mode.");
  }
} catch (error) {
  logger.error("Firebase Initialization Error:", error);
}

export const isFirebaseConfigured = isConfigured;

/**
 * Adds a contribution to the global database and updates total counts.
 */
export const syncContribution = async (contribution: any) => {
  if (!db) return null;
  
  try {
    // 1. Add to activity collection
    await addDoc(collection(db, "contributions"), {
      ...contribution,
      serverTimestamp: new Date()
    });

    // 2. Atomic update of the global totals document
    const statsRef = doc(db, "stats", "global");
    await setDoc(statsRef, {
      grandTotal: increment(contribution.count),
      [`total_${contribution.recitationType.replace(/\s+/g, '_')}`]: increment(contribution.count),
      lastUpdate: Date.now()
    }, { merge: true });

    return true;
  } catch (e) {
    logger.error("Failed to sync to Firebase", e);
    return false;
  }
};

/**
 * Listens for the most recent global contributions.
 */
export const listenToContributions = (callback: (data: any[]) => void) => {
  if (!db) return () => {};
  
  const q = query(collection(db, "contributions"), orderBy("timestamp", "desc"), limit(50));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  }, (err) => {
    logger.error("Contribution listener error:", err);
  });
};

/**
 * Listens for global stats like Grand Total.
 */
export const listenToStats = (callback: (data: any) => void) => {
  if (!db) return () => {};
  
  return onSnapshot(doc(db, "stats", "global"), (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  }, (err) => {
    logger.error("Stats listener error:", err);
  });
};

export { db };
