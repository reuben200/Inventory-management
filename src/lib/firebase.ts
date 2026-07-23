import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Import applet config
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Use custom named database ID from firebaseConfig
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export default app;
