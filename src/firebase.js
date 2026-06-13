import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDEz5OpJDYkhF30vYpIv0gCdBw7KQ4Mn4c",
  authDomain: "orbitfocus-2c5c1.firebaseapp.com",
  projectId: "orbitfocus-2c5c1",
  storageBucket: "orbitfocus-2c5c1.firebasestorage.app",
  messagingSenderId: "895868975831",
  appId: "1:895868975831:web:563f664464308d4efe4e92",
  measurementId: "G-BB5VZRM812"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
