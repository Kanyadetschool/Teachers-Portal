import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBuE2JiwCw7P4d2U1ONCR9MyWQdrPjTKiQ",
    authDomain: "admins-portal-24568.firebaseapp.com",
    projectId: "admins-portal-24568",
    storageBucket: "admins-portal-24568.firebasestorage.app",
    messagingSenderId: "700341851961",
    appId: "1:700341851961:web:47c37a817df99c9e357ae8",
    measurementId: "G-PE7ZJ3BW4C"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
