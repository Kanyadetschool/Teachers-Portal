import { auth, db } from './firebaseConfig.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { 
  doc,
  getDoc,
  setDoc,
  deleteField,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// All teacher records live as a map inside ONE doc: teachers/teachers.
// Emails can't be used as raw map keys (dots in a key are treated as a
// nested-path separator by Firestore), so they're sanitized here.
export function emailToKey(email) {
  return email.trim().toLowerCase().replace(/\./g, ',');
}

function teachersDocRef() {
  return doc(db, 'teachers', 'teachers');
}

// Pending signup requests live the same way: one map inside teachers/pending,
// keyed by the same sanitized-email scheme as the approved teachers doc.
function pendingDocRef() {
  return doc(db, 'teachers', 'pending');
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

// Mirrors getTeacherByEmail but checks the pending-requests doc instead.
export async function getPendingByEmail(email) {
  const key = emailToKey(email);
  const snap = await getDoc(pendingDocRef());

  if (!snap.exists()) return null;

  const pendingData = snap.data()[key];
  if (!pendingData) return null;

  return { ...pendingData, id: key };
}

// Document fields a teacher may attach with their application. Keyed here
// so upload + admin display stay in sync with one list.
export const APPLICATION_DOCUMENT_FIELDS = [
  { key: 'degreeCertificate', label: 'Diploma / Degree Certificate' }
];

// Documents are stored as base64 directly on the Firestore record (no
// Storage bucket/rules needed) — but that means every attached file shares
// the 1 MiB total size of the single teachers/pending document with every
// other applicant's data. Keep this cap conservative: base64 inflates the
// raw file by ~33%, and this doc has to have room for everyone else too.
const MAX_DOCUMENT_BYTES = 600 * 1024; // 600 KB raw (~800 KB encoded)

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // data:<mime>;base64,....
    reader.onerror = () => reject(new Error(`Could not read file "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

async function encodeApplicationFile(file) {
  if (file.size > MAX_DOCUMENT_BYTES) {
    const maxKb = Math.round(MAX_DOCUMENT_BYTES / 1024);
    throw new Error(`"${file.name}" is too large (max ${maxKb} KB). Please compress or re-scan it at a lower resolution and try again.`);
  }
  const dataUrl = await fileToBase64(file);
  return { dataUrl, name: file.name, size: file.size };
}

// Called from the "Sign up" window shown when a teacher isn't authorized
// yet. Creates their Firebase Auth account (so their password is set and
// ready), uploads any attached documents, and files a full pending-approval
// application for the admin to review. They are signed out immediately
// after — approval, not account creation, is what grants access.
//
// `application` shape:
//   {
//     name, dateOfBirth, gender, nationality, idNumber, phone,
//     highestQualification, trainingInstitution, graduationYear,
//     teachingSubjects, employmentHistory,
//     files: { degreeCertificate } // File | undefined
//   }
export async function signUpTeacher(email, password, application = {}) {
  const normalizedEmail = email.trim().toLowerCase();
  const key = emailToKey(normalizedEmail);

  // If they already have a pending request, don't file a duplicate.
  const existingPending = await getPendingByEmail(normalizedEmail);
  if (existingPending) {
    throw new Error('A request for this email is already awaiting admin approval.');
  }

  const { files = {}, ...fields } = application;

  const user = await createFirebaseUser(normalizedEmail, password);

  try {
    // Encode whatever documents were attached as base64 and inline them on
    // the record — see MAX_DOCUMENT_BYTES above for the size constraint.
    const documents = {};
    for (const { key: fieldKey } of APPLICATION_DOCUMENT_FIELDS) {
      const file = files[fieldKey];
      if (file) {
        documents[fieldKey] = await encodeApplicationFile(file);
      }
    }

    await setDoc(pendingDocRef(), {
      [key]: {
        ...fields,
        email: normalizedEmail,
        documents,
        requestedAt: Date.now(),
        status: 'pending'
      }
    }, { merge: true });
  } finally {
    // Never leave them signed in before an admin has approved them.
    await signOut(auth);
  }

  return user;
}

export async function authenticateTeacher(email, password) {
  try {
    // First attempt Firebase authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // If authentication successful, check if user exists in the teachers map
    const validTeacher = await getTeacherByEmail(email);

    if (!validTeacher) {
      // Not an approved teacher yet — figure out why, so the UI can react
      // appropriately (offer sign-up vs. tell them to wait for approval).
      const pending = await getPendingByEmail(email);
      await signOut(auth);

      if (pending) {
        const err = new Error('Your account is awaiting admin approval. You will be able to sign in once an admin approves your request.');
        err.code = 'teacher/pending-approval';
        throw err;
      }

      const err = new Error('No teacher account found with this email. Please sign up for access.');
      err.code = 'teacher/not-authorized';
      throw err;
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
      error.code === 'auth/invalid-credential' ||   // current Firebase code for wrong password / unknown email (merged for security)
      error.code === 'auth/invalid-login-credentials' ||
      error.code === 'auth/wrong-password' || 
      error.code === 'auth/user-not-found'
    ) {
      const err = new Error('Invalid email or password');
      err.code = 'auth/wrong-password'; // normalize so callers can still branch on it
      throw err;
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