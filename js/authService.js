import { auth, db } from './firebaseConfig.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  deleteUser
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { 
  doc,
  getDoc,
  setDoc,
  deleteField,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const ALLOWED_ROLES = ['teacher', 'admin']; // Allowed login roles

export function emailToKey(email) {
  return email.trim().toLowerCase().replace(/\./g, ',');
}

function teachersDocRef() {
  return doc(db, 'teachers', 'teachers');
}

function pendingDocRef() {
  return doc(db, 'teachers', 'pending');
}

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

export async function getPendingByEmail(email) {
  const key = emailToKey(email);
  const snap = await getDoc(pendingDocRef());

  if (!snap.exists()) return null;

  const pendingData = snap.data()[key];
  if (!pendingData) return null;

  return { ...pendingData, id: key };
}

export const APPLICATION_DOCUMENT_FIELDS = [
  { key: 'degreeCertificate', label: 'Diploma / Degree Certificate' }
];

const MAX_DOCUMENT_BYTES = 600 * 1024;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
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

export async function signUpTeacher(email, password, application = {}) {
  const normalizedEmail = email.trim().toLowerCase();
  const key = emailToKey(normalizedEmail);

  const requiredFields = ['name', 'idNumber', 'phone', 'highestQualification', 'teachingSubjects'];
  for (const field of requiredFields) {
    if (!application[field] || !application[field].toString().trim()) {
      throw new Error(`Please complete all required profile details before submitting.`);
    }
  }

  const { files = {}, ...fields } = application;
  let user = auth.currentUser;

  if (!user || user.email?.toLowerCase() !== normalizedEmail) {
    try {
      user = await createFirebaseUser(normalizedEmail, password);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        try {
          const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
          user = cred.user;
        } catch (authErr) {
          throw new Error('An account entry exists for this email. Please enter your valid password to submit your full profile.');
        }
      } else {
        throw error;
      }
    }
  }

  try {
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
    await signOut(auth);
  }

  return user;
}

export async function authenticateTeacher(email, password) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const validTeacher = await getTeacherByEmail(normalizedEmail);
    const pendingRequest = await getPendingByEmail(normalizedEmail);

    // Case 1: No teacher record and no pending request
    if (!validTeacher && !pendingRequest) {
      const err = new Error('No teacher account found with this email. Please request access and complete your profile.');
      err.code = 'teacher/not-authorized';
      throw err;
    }

    // Case 2: Pending request exists
    if (!validTeacher && pendingRequest) {
      const err = new Error('Your account request is awaiting admin approval.');
      err.code = 'teacher/pending-approval';
      throw err;
    }

    // Case 3: Teacher record exists, BUT role is explicitly suspended/inactive/revoked
    if (validTeacher.role === 'disabled' || validTeacher.role === 'inactive' || validTeacher.status === 'revoked') {
      const err = new Error('Your teacher account access has been modified or suspended by an admin.');
      err.code = 'teacher/access-revoked';
      throw err;
    }

    // Case 4: Role exists but is NOT authorized (e.g., changed to an unauthorized role)
    if (validTeacher.role && !ALLOWED_ROLES.includes(validTeacher.role)) {
      const err = new Error('Your account role does not have permission to access this portal.');
      err.code = 'teacher/unauthorized-role';
      throw err;
    }

    // Case 5: Active valid teacher/admin - verify password with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);

    return {
      user: userCredential.user,
      teacherData: validTeacher
    };

  } catch (error) {
    console.error('Authentication error:', error);

    if (
      error.code === 'teacher/not-authorized' || 
      error.code === 'teacher/pending-approval' ||
      error.code === 'teacher/access-revoked' ||
      error.code === 'teacher/unauthorized-role'
    ) {
      throw error;
    }

    if (
      error.code === 'auth/invalid-credential' || 
      error.code === 'auth/invalid-login-credentials' ||
      error.code === 'auth/wrong-password' || 
      error.code === 'auth/user-not-found'
    ) {
      const err = new Error('Incorrect password. Need to reset your password?');
      err.code = 'auth/wrong-password';
      throw err;
    }
    throw error;
  }
}

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

export async function createFirebaseUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error creating Firebase user:', error);
    throw error;
  }
}