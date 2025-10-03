// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAd6WZzj2vuDw_48FIIanzeYQ_5gorhdLA",
  authDomain: "toknxr-mvp.firebaseapp.com",
  projectId: "toknxr-mvp",
  storageBucket: "toknxr-mvp.firebasestorage.app",
  messagingSenderId: "109773731445",
  appId: "1:109773731445:web:c8b7abe07fb78054dd6a3c",
  measurementId: "G-SP0P97LJVV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
