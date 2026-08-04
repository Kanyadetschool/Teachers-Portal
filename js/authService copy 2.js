import { auth, db } from './firebaseConfig.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { 
  doc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// All teacher records live as a map inside ONE doc: teachers/teachers.
// Emails can't be used as raw map keys (dots in a key are treated as a
// nested-path separator by Firestore), so they're sanitized here.
export function emailToKey(email) {
  return email.toLowerCase().replace(/\./g, ',');
}

function teachersDocRef() {
  return doc(db, 'teachers', 'teachers');
}

// Shared lookup used by both the email/password flow and the Google sign-in flow
export async function getTeacherByEmail(email) {
  const key = emailToKey(email);
  const snap = await getDoc(teachersDocRef());

  if (!snap.exists()) return null;

  const teacherData = snap.data()[key];
  if (!teacherData) return null;

  return {
    ...teacherData,
    id: key,
    username: teacherData.username || teacherData.name || teacherData.teacherName
  };
}

export async function authenticateTeacher(email, password) {
  try {
    // First attempt Firebase authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // If authentication successful, check if user exists in the teachers map
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

// Live listener on the shared teachers/teachers doc. teacherKey is the
// id returned by getTeacherByEmail (the sanitized email). Signs the user
// out if their record is removed or its role changes after login.
export function watchTeacherRole(teacherKey, originalRole, onRoleChange) {
  return onSnapshot(teachersDocRef(), async (snap) => {
    const record = snap.exists() ? snap.data()[teacherKey] : null;

    if (!record) {
      console.warn('Teacher record removed — signing out');
      await signOut(auth);
      if (onRoleChange) onRoleChange(null);
      return;
    }

    if (record.role !== originalRole) {
      console.warn('Teacher role changed — signing out');
      await signOut(auth);
      if (onRoleChange) onRoleChange(record.role);
    }
  });
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