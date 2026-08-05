import { authenticateTeacher, getTeacherByEmail, getPendingByEmail } from './authService.js';
import { auth } from './firebaseConfig.js';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    deleteUser,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const NOTIFICATION_TIMEOUT = 2000;
const NOTIFICATION_VOLUME = 0.5;
const ALLOWED_ROLES = ['teacher', 'admin']; // Define valid login roles

function handleNotification(notification, timeoutId) {
    notification.onclick = function() {
        clearTimeout(timeoutId);
        notification.close();
    };
}

function playAudio(type) {
    const audioPath = type === 'error' ? 'https://kanyadet-school-portal.web.app/audio/warning.mp3' : 'https://kanyadet-school-portal.web.app/audio/notification.mp3';
    const audio = new Audio(audioPath);
    audio.volume = NOTIFICATION_VOLUME;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

function showNotification(title, message, type = 'error') {
    console.log('Attempting to show notification:', title, message);

    try {
        const audio = new Audio('https://kanyadet-school-portal.web.app/audio/notification.mp3');
        audio.volume = NOTIFICATION_VOLUME;
        audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.error('Audio error:', e);
    }

    showToast(title, message, type);

    if ("Notification" in window && Notification.permission === "granted") {
        try {
            const options = {
                body: message,
                icon: '../images/logo.png',
                requireInteraction: false,
                vibrate: [200, 100, 200],
                silent: false,
                tag: 'notification-' + Date.now()
            };
            const notification = new Notification(title, options);
            const timeoutId = setTimeout(() => notification.close(), NOTIFICATION_TIMEOUT);
            handleNotification(notification, timeoutId);
        } catch (e) {
            console.error('Native notification creation failed:', e);
        }
    }
}

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

const googleProvider = new GoogleAuthProvider();

async function handleGoogleSignIn() {
    let attemptedEmail = null;
    let currentUser = null;
    try {
        const result = await signInWithPopup(auth, googleProvider);
        currentUser = result.user;
        attemptedEmail = currentUser.email;

        const validTeacher = await getTeacherByEmail(attemptedEmail);
        const pendingRequest = await getPendingByEmail(attemptedEmail);

        // 1. Check if user is disabled or explicitly revoked
        if (validTeacher && (validTeacher.role === 'disabled' || validTeacher.role === 'inactive' || validTeacher.status === 'revoked')) {
            await signOut(auth).catch(() => {});
            const err = new Error('Your account access has been modified or suspended by an admin.');
            err.code = 'teacher/access-revoked';
            throw err;
        }

        // 2. Check if role exists but is not in allowed roles
        if (validTeacher && validTeacher.role && !ALLOWED_ROLES.includes(validTeacher.role)) {
            await signOut(auth).catch(() => {});
            const err = new Error('Your assigned role does not have permission to access this portal.');
            err.code = 'teacher/unauthorized-role';
            throw err;
        }

        // 3. Scenario: Not registered and no pending request
        if (!validTeacher && !pendingRequest) {
            if (currentUser) {
                await deleteUser(currentUser).catch(() => signOut(auth));
            } else {
                await signOut(auth).catch(() => {});
            }

            const err = new Error('No teacher account found. Please submit your registration details.');
            err.code = 'teacher/not-authorized';
            throw err;
        }

        // 4. Scenario: Request submitted but waiting for admin approval
        if (!validTeacher && pendingRequest) {
            await signOut(auth).catch(() => {});

            const err = new Error('Your request has been submitted and is currently awaiting admin approval.');
            err.code = 'teacher/pending-approval';
            throw err;
        }

        // Passed all checks!
        persistAuthState(currentUser);
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Google sign-in failed:', error);
        await signOut(auth).catch(() => {});
        playAudio('error');

        // Route unauthorized or pending users to registration popup
        if ((error.code === 'teacher/not-authorized' || error.code === 'teacher/pending-approval') && attemptedEmail && window.openTeacherSignup) {
            window.openTeacherSignup(attemptedEmail);
        } else if (window.showAuthErrorModal) {
            window.showAuthErrorModal({
                title: error.code === 'teacher/access-revoked' ? 'Access Suspended' : "Couldn't sign you in",
                message: error.message || 'Could not verify teacher account.'
            });
        } else {
            showNotification('Login failed', error.message || 'Could not verify teacher account');
        }
    }
}

const googleSignInBtn = document.getElementById('googleSignInBtn');
if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', handleGoogleSignIn);
}

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

            const userName = user?.displayName ||
                            teacherData?.username ||
                            user?.email?.split('@')[0] ||
                            'Successful';
            
            const notification = document.createElement('div');
            notification.className = 'lottie-notification success';
            notification.innerHTML = `
                <div class="lottie-container" id="successAnimation"></div>
                <div class="notification-text">Login ${userName}!</div>
            `;
            document.body.appendChild(notification);

            const successAnim = lottie.loadAnimation({
                container: document.getElementById('successAnimation'),
                renderer: 'svg',
                loop: false,
                autoplay: true,
                path: 'https://assets2.lottiefiles.com/packages/lf20_s6bvy3j6.json'
            });

            const redirectTimeout = setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);

            successAnim.addEventListener('complete', () => {
                clearTimeout(redirectTimeout);
                notification.style.animation = 'slideOut 0.5s forwards';
                setTimeout(() => {
                    notification.remove();
                    window.location.href = 'index.html';
                }, 500);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            playAudio('error');

            if (error.code === 'teacher/not-authorized' || error.code === 'teacher/pending-approval') {
                resetBtn.style.display = 'none';
                if (window.openTeacherSignup) {
                    window.openTeacherSignup(email);
                }
                return;
            }
            
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
                case 'teacher/access-revoked':
                case 'teacher/unauthorized-role':
                    errorMessage = error.message;
                    break;
                default:
                    errorMessage = error.message;
            }

            const isCredentialError = ['auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(error.code);
            resetBtn.style.display = isCredentialError ? 'block' : 'none';

            if (window.showAuthErrorModal) {
                window.showAuthErrorModal({
                    title: (error.code === 'teacher/access-revoked' || error.code === 'teacher/unauthorized-role') ? "Access Denied" : "Couldn't sign you in",
                    message: errorMessage,
                    showReset: isCredentialError
                });
            } else {
                const notification = document.createElement('div');
                notification.className = 'lottie-notification error';
                notification.innerHTML = `
                    <div class="lottie-container" id="errorAnimation"></div>
                    <div class="notification-text">${errorMessage}</div>
                `;
                document.body.appendChild(notification);
                const errorAnim = lottie.loadAnimation({
                    container: document.getElementById('errorAnimation'),
                    renderer: 'svg',
                    loop: false,
                    autoplay: true,
                    path: 'https://assets9.lottiefiles.com/packages/lf20_afwjhfb2.json'
                });
                setTimeout(() => {
                    notification.style.animation = 'slideOut 0.5s forwards';
                    setTimeout(() => notification.remove(), 500);
                }, 8000);
            }
        });
});

document.getElementById('resetPasswordBtn').addEventListener('mousedown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = 'reset.html';
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.activeElement.id === 'resetPasswordBtn') {
        e.preventDefault();
        return false;
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        persistAuthState(user);
    } else {
        localStorage.removeItem('authUser');
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});




