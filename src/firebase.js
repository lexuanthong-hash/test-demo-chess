import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDU5NQqNb42SqhsA5kMTsoG6-PA6O79rz4",
  authDomain: "react-chess-b9bf8.firebaseapp.com",
  projectId: "react-chess-b9bf8",
  storageBucket: "react-chess-b9bf8.appspot.com",
  messagingSenderId: "1082639627492",
  appId: "1:1082639627492:web:d23f7680a1df7e910a28f1",
  measurementId: "G-1RWEBPPFQY"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);