import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Correct import for Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDPhYDanbRsSWc0ui7yW4s2LJ2t7zOZPCI",
  authDomain: "zollege-auth.firebaseapp.com",
  projectId: "zollege-auth",
  storageBucket: "zollege-auth.firebasestorage.app",
  messagingSenderId: "437773539866",
  appId: "1:437773539866:web:7caa051ff5212fb4170fa3",
  measurementId: "G-9MFH79R9GT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app); // Authentication
const db = getFirestore(app); // Firestore
const googleProvider = new GoogleAuthProvider(); // Google OAuth

export { auth, db, googleProvider };
