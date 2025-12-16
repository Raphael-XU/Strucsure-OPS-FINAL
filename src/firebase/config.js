import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';


// Your Firebase configuration
// Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyB5Q11T8LmAIvsqftxf89y-YggtyWgpqyM",
  authDomain: "strucsure-cscc21.firebaseapp.com",
  projectId: "strucsure-cscc21",
  storageBucket: "strucsure-cscc21.firebasestorage.app",
  messagingSenderId: "727664218511",
  appId: "1:727664218511:web:ba764b3531c5ee093fbbfa",
  measurementId: "G-4FZ10D1TYS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
