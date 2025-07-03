// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCxV3ldovv8PxGhMmeXQdqO4Xqd-0_5xoo",
  authDomain: "kriya-fern.firebaseapp.com",
  projectId: "kriya-fern",
  storageBucket: "kriya-fern.firebasestorage.app",
  messagingSenderId: "214636942335",
  appId: "1:214636942335:web:e2237ea993cc953e420dca",
  measurementId: "G-NQXP5R38SR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);


