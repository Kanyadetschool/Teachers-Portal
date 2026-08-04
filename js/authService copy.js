import { auth, db } from './firebaseConfig.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Shared lookup used by both the email/password flow and the Google sign-in flow
export async function getTeacherByEmail(email) {
  const teachersRef = collection(db, 'teachers');
  const q = query(teachersRef, where('email', '==', email.toLowerCase()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const teacherData = doc.data();

  return {
    ...teacherData,
    id: doc.id,
    username: teacherData.username || teacherData.name || teacherData.teacherName
  };
}

export async function authenticateTeacher(email, password) {
  try {
    // First attempt Firebase authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // If authentication successful, check if user exists in teachers collection
    const validTeacher = await getTeacherByEmail(email);

    if (!validTeacher) {
      // If no matching teacher found, sign out the user
      await signOut(auth);
      throw new Error('No teacher account found with this email');
    }

    console.log('Final teacher data:', validTeacher); // Debug log

    // Return complete teacher data
    return {
      user: userCredential.user,
      teacherData: validTeacher
    };

  } catch (error) {
    console.error('Authentication error:', error);
    if (
      error.code === 'auth/invalid-login-credentials' || 
      error.code === 'auth/wrong-password' || 
      error.code === 'auth/user-not-found'
    ) {
      throw new Error('Invalid email or password');
    }
    throw error;
  }
}

// Helper function to create a Firebase user if needed
export async function createFirebaseUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error creating Firebase user:', error);
    throw error;
  }
}
