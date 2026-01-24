import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAwcpB7-1CjJ3TOesS5f5i3wtPt4hP0j48",
  authDomain: "lost-and-found-f87b5.firebaseapp.com",
  projectId: "lost-and-found-f87b5",
  storageBucket: "lost-and-found-f87b5.firebasestorage.app",
  messagingSenderId: "301722790216",
  appId: "1:301722790216:web:a569d059730413c7586b7d",
  measurementId: "G-MHG0T1GYQ0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
