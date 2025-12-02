import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA6nGK-Ar87xVjA9gCPyvk3nsxMh8rEEUQ",
  authDomain: "event-ticketing-platform-c9111.firebaseapp.com",
  projectId: "event-ticketing-platform-c9111",
  storageBucket: "event-ticketing-platform-c9111.firebasestorage.app",
  messagingSenderId: "873378276174",
  appId: "1:873378276174:web:db2ae21259f725cfcd341f",
  measurementId: "G-G553HTT13R",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
