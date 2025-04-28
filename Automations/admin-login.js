// Import Firebase configuration and necessary functions
import { auth, database } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';

const adminLoginForm = document.getElementById('adminLoginForm');
const loginError = document.getElementById('loginError');

// Handle admin login
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
        // Sign in with email and password using modern SDK
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user has admin role using modern SDK
        const snapshot = await get(ref(database, 'users/user1'));
        const userData = snapshot.val();

        if (userData && userData.role === 'admin') {
            // Redirect to admin dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            // Not an admin, sign out and show error
            await auth.signOut();
            throw new Error('Unauthorized access. Admin privileges required.');
        }
    } catch (error) {
        loginError.textContent = error.message;
        loginError.classList.remove('d-none');
    }
});

// Check authentication state using modern SDK
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Check if user is admin
        get(ref(database, 'users/user1'))
            .then(snapshot => {
                const userData = snapshot.val();
                if (userData && userData.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                }
            });
    }
});