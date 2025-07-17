// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpQOkEK3Y9aaeyfAPmgZTtBDBfD43bWSg",
  authDomain: "projetostatus.firebaseapp.com",
  projectId: "projetostatus",
  storageBucket: "projetostatus.firebasestorage.app",
  messagingSenderId: "839070322830",
  appId: "1:839070322830:web:3d4b472c00f12531a8b9df",
  measurementId: "G-JSMFR1TJGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, analytics };
export default app;