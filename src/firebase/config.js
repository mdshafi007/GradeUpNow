// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMNmxb8cAiv_yngopw828zgUtsnBEP7Eo",
  authDomain: "gradeupnow-adfc4.firebaseapp.com",
  projectId: "gradeupnow-adfc4",
  storageBucket: "gradeupnow-adfc4.firebasestorage.app",
  messagingSenderId: "694218501620",
  appId: "1:694218501620:web:0a73bb9901b9fb38c6dda1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;
