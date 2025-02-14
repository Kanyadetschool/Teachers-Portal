import { auth, db } from './firebaseConfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

export async function authenticateTeacher(email, password) {
    try {
        // First attempt Firebase authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // If authentication successful, check if user exists in teachers collection
        const teachersRef = collection(db, 'teachers');
        const teachersSnapshot = await getDocs(teachersRef);
        
        let validTeacher = null;
        teachersSnapshot.forEach((doc) => {
            const teacherData = doc.data();
            if (teacherData.email.toLowerCase() === email.toLowerCase()) {
                validTeacher = teacherData;
            }
        });

        if (!validTeacher) {
            // If no matching teacher found, sign out the user
            await auth.signOut();
            throw new Error('No teacher account found with this email');
        }

        // Store teacher info in localStorage
        localStorage.setItem('teacherInfo', JSON.stringify({
            username: validTeacher.username,
            email: validTeacher.email,
            role: 'teacher'
        }));

        return userCredential.user;

    } catch (error) {
        console.error('Authentication error:', error);
        if (error.code === 'auth/invalid-login-credentials') {
            throw new Error('Invalid email or password');
        }
        throw error;
    }
}

// Add this helper function to create a Firebase user if needed
export async function createFirebaseUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Error creating Firebase user:', error);
        throw error;
    }
}
