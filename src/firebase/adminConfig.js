// Firebase configuration specifically for admin authentication
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Same Firebase project but separate app instance for admin
const adminFirebaseConfig = {
  apiKey: "AIzaSyBMNmxb8cAiv_yngopw828zgUtsnBEP7Eo",
  authDomain: "gradeupnow-adfc4.firebaseapp.com",
  projectId: "gradeupnow-adfc4",
  storageBucket: "gradeupnow-adfc4.firebasestorage.app",
  messagingSenderId: "694218501620",
  appId: "1:694218501620:web:0a73bb9901b9fb38c6dda1"
};

// Initialize separate Firebase app for admin
const adminApp = initializeApp(adminFirebaseConfig, 'adminApp');

// Initialize Firebase Authentication for admin
export const adminAuth = getAuth(adminApp);

export default adminApp;