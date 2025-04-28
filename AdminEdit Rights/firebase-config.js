import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBoXasNfL5QtMvTMsKQzctcl-cFm1ThvNw",
  authDomain: "kanyadet-school-portal.firebaseapp.com",
  projectId: "kanyadet-school-portal",
  storageBucket: "kanyadet-school-portal.firebasestorage.app",
  messagingSenderId: "77104853416",
  appId: "1:77104853416:web:ddac8c070c194f5334ad9d",
  measurementId: "G-42L66EN6GJ",
  databaseURL: "https://kanyadet-school-portal-default-rtdb.firebaseio.com"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();
const db = getFirestore(app);
const database = getDatabase(app);  // Initialize Realtime Database

export { auth, db, database };
export default { auth, db, database };  // Add this line to include a default export
