import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'toknxr-mvp',
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID || 'toknxr-mvp',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@toknxr-mvp.iam.gserviceaccount.com',
  }),
};

// Initialize the app only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

// Export Firebase Admin services
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export default app;
