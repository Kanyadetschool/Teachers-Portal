import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBoXasNfL5QtMvTMsKQzctcl-cFm1ThvNw",
  authDomain: "kanyadet-school-portal.firebaseapp.com",
  projectId: "kanyadet-school-portal",
  storageBucket: "kanyadet-school-portal.firebasestorage.app",
  messagingSenderId: "77104853416",
  appId: "1:77104853416:web:ddac8c070c194f5334ad9d",
  measurementId: "G-42L66EN6GJ"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage(); // Set language to user's device language
const db = getFirestore(app);

export { auth, db };
