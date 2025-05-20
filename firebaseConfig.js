// firebaseConfig.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // ✅ Web SDK, không dùng /react-native
//import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database'; // nếu bạn dùng Realtime Database

// ✅ Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyApjzecWD76Ve04R_eXupbMhPcPa_AaWz4",
  authDomain: "qlcv-9f8ca.firebaseapp.com",
  projectId: "qlcv-9f8ca",
  storageBucket: "qlcv-9f8ca.appspot.com",
  messagingSenderId: "1052797218257",
  appId: "1:1052797218257:web:54b7065bd519dc1af304f0",
};

// ✅ Chỉ khởi tạo app nếu chưa có
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Khởi tạo dịch vụ Firebase
const auth = getAuth(app);           // Firebase Auth
//const db = getFirestore(app);        // Firestore
 const db = getDatabase(app);    // Nếu bạn dùng Realtime Database

export { app, auth, db };
