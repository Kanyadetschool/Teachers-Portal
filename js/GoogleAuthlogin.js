import { authenticateTeacher, getTeacherByEmail, getPendingByEmail } from './authService.js';
import { auth } from './firebaseConfig.js';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const NOTIFICATION_TIMEOUT = 2000; // 10 seconds in milliseconds
const NOTIFICATION_VOLUME = 0.5;   // 50% volume

// Separate notification handler that doesn't affect auth state
function handleNotification(notification, timeoutId) {
    notification.onclick = function() {
        clearTimeout(timeoutId);
        notification.close();
    };
}

// Add this function near the top with other utility functions
function playAudio(type) {
    const audioPath = type === 'error' ? 'https://kanyadet-school-portal.web.app/audio/warning.mp3' : 'https://kanyadet-school-portal.web.app/audio/notification.mp3';
    const audio = new Audio(audioPath);
    audio.volume = NOTIFICATION_VOLUME;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

function showNotification(title, message, type = 'error') {
    console.log('Attempting to show notification:', title, message);

    // Play notification sound
    try {
        const audio = new Audio('https://kanyadet-school-portal.web.app/audio/notification.mp3');
        audio.volume = NOTIFICATION_VOLUME;
        audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.error('Audio error:', e);
    }

    // Always show an in-page toast — this is the guaranteed-visible path.
    // Native OS notifications below are a bonus, not a substitute: they
    // require permission the user may never have granted, so relying on
    // them (or on alert()) as the only feedback meant errors could fail
    // completely silently.
    showToast(title, message, type);

    if ("Notification" in window && Notification.permission === "granted") {
        try {
            const options = {
                body: message,
                icon: '../images/logo.png',
                requireInteraction: false,
                vibrate: [200, 100, 200],
                silent: false,
                tag: 'notification-' + Date.now() // Unique tag to prevent interference
            };
            const notification = new Notification(title, options);
            const timeoutId = setTimeout(() => notification.close(), NOTIFICATION_TIMEOUT);
            handleNotification(notification, timeoutId);
        } catch (e) {
            console.error('Native notification creation failed:', e);
        }
    }
}

// In-page toast — doesn't depend on Notification permission, so it's
// always visible. Reuses the existing .lottie-notification/.success/.error
// styling already defined in login.html.
function showToast(title, message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `lottie-notification ${type}`;
    toast.innerHTML = `
        <div class="notification-text"><strong>${title}</strong><br>${message}</div>
        <button type="button" class="toast-close" aria-label="Dismiss" style="background:none;border:none;font-size:18px;line-height:1;cursor:pointer;color:#999;margin-left:8px;">&times;</button>
    `;
    document.body.appendChild(toast);

    let dismissed = false;
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        toast.style.animation = 'slideOut 0.5s forwards';
        setTimeout(() => toast.remove(), 500);
    };

    toast.querySelector('.toast-close').addEventListener('click', dismiss);
    setTimeout(dismiss, 5000);
}

// Add persistent auth state handling
function persistAuthState(user) {
    if (user) {
        localStorage.setItem('authUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            lastLogin: new Date().getTime()
        }));
    } else {
        localStorage.removeItem('authUser');
    }
}

// Google sign-in (modular SDK — same auth instance authService.js uses,
// so the post-popup teacher lookup runs against the same signed-in user)
const googleProvider = new GoogleAuthProvider();

async function handleGoogleSignIn() {
    let attemptedEmail = null;
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const googleUser = result.user;
        attemptedEmail = googleUser.email;

        const validTeacher = await getTeacherByEmail(googleUser.email);
        if (!validTeacher) {
            const pending = await getPendingByEmail(googleUser.email);
            const err = new Error(
                pending
                    ? 'Your account is awaiting admin approval. You will be able to sign in once an admin approves your request.'
                    : 'No teacher account found with this email. Please sign up for access.'
            );
            err.code = pending ? 'teacher/pending-approval' : 'teacher/not-authorized';
            throw err;
        }

        persistAuthState(googleUser);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Google sign-in failed:', error);
        await signOut(auth).catch(() => {});
        playAudio('error');
        showNotification('Login failed', error.message || 'Could not verify teacher account');
        if (error.code === 'teacher/not-authorized' && attemptedEmail && window.openTeacherSignup) {
            window.openTeacherSignup(attemptedEmail);
        }
    }
}

const googleSignInBtn = document.getElementById('googleSignInBtn');
if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', handleGoogleSignIn);
}

// Handle traditional email/password login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const resetBtn = document.getElementById('resetPasswordBtn');

    authenticateTeacher(email, password)
        .then(({ user, teacherData }) => {
            resetBtn.style.display = 'none';
            persistAuthState(user);

            // Get user display name with fallback
            const userName = user?.displayName ||
                            teacherData?.username ||
                            user?.email?.split('@')[0] ||
                            'Successful';
            
            // Create success notification with Lottie
            const notification = document.createElement('div');
            notification.className = 'lottie-notification success';
            notification.innerHTML = `
                <div class="lottie-container" id="successAnimation"></div>
                <div class="notification-text">Login ${userName}!</div>
            `;
            document.body.appendChild(notification);

            // Load success animation and ensure redirect
            const successAnim = lottie.loadAnimation({
                container: document.getElementById('successAnimation'),
                renderer: 'svg',
                loop: false,
                autoplay: true,
                path: 'https://assets2.lottiefiles.com/packages/lf20_s6bvy3j6.json'
            });

            // Set a backup timeout for redirect
            const redirectTimeout = setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000); // Fallback after 3 seconds

            successAnim.addEventListener('complete', () => {
                // Clear the backup timeout
                clearTimeout(redirectTimeout);
                
                // Fade out and redirect
                notification.style.animation = 'slideOut 0.5s forwards';
                setTimeout(() => {
                    notification.remove();
                    window.location.href = 'index.html';
                }, 500);
            });
        })
        .catch((error) => {
            console.error('Error:', error);

            // Play error sound
            playAudio('error');
            
            let errorMessage = '';
            switch(error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Need to reset your password?';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                default:
                    errorMessage = error.message;
            }

            // Only offer "reset password" for actual credential problems —
            // it's meaningless (and confusing) for a not-authorized or
            // pending-approval account, since there's no login issue to fix.
            const isCredentialError = ['auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(error.code);
            resetBtn.style.display = isCredentialError ? 'block' : 'none';

            if (error.code === 'teacher/not-authorized' && window.openTeacherSignup) {
                window.openTeacherSignup(email);
            }
            
            // Create error notification with Lottie
            const notification = document.createElement('div');
            notification.className = 'lottie-notification error';
            notification.innerHTML = `
                <div class="lottie-container" id="errorAnimation"></div>
                <div class="notification-text">${errorMessage}</div>
            `;
            document.body.appendChild(notification);

            // Load error animation
            const errorAnim = lottie.loadAnimation({
                container: document.getElementById('errorAnimation'),
                renderer: 'svg',
                loop: false,
                autoplay: true,
                path: 'https://assets9.lottiefiles.com/packages/lf20_afwjhfb2.json' // Error X animation
            });

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.5s forwards';
                setTimeout(() => notification.remove(), 500);
            }, 8000);
        });
});

// Separate mouseclick-only handler for reset button
document.getElementById('resetPasswordBtn').addEventListener('mousedown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = 'reset.html';
});

// Prevent enter key from triggering reset button
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.activeElement.id === 'resetPasswordBtn') {
        e.preventDefault();
        return false;
    }
});

// Add auth state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        persistAuthState(user);
    } else {
        // Clear persisted state if logged out
        localStorage.removeItem('authUser');
        // Redirect to login if not on login page
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});