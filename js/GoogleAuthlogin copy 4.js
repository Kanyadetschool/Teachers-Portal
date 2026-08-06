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
const ALLOWED_ROLES = ['teacher', 'admin'];

// Utility delay function to allow users enough time to read status text
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// =========================================================================
// READABLE LIVE STATUS LOADER MODULE
// =========================================================================
let loaderStartTime = 0;

// Maps a badge label to a semantic state so colors/icon swap automatically.
function resolveLoaderState(badgeText = '') {
    const t = String(badgeText).toLowerCase();
    if (t.includes('success') || t.includes('granted') || t.includes('welcome')) return 'success';
    if (t.includes('denied') || t.includes('suspend') || t.includes('fail')) return 'error';
    if (t.includes('redirect')) return 'redirect';
    return 'loading';
}

function injectStatusLoaderStyles() {
    if (document.getElementById('statusLoaderStyles')) return;

    const style = document.createElement('style');
    style.id = 'statusLoaderStyles';
    style.textContent = `
        #fullScreenLoader {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            --state-color: #2563eb;
            --state-color-soft: rgba(37, 99, 235, 0.12);
            --state-glow: rgba(37, 99, 235, 0.35);
            animation: loaderFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        #fullScreenLoader.loader-fade-out {
            animation: loaderFadeOut 0.22s cubic-bezier(0.4, 0, 1, 1) forwards !important;
        }
        #fullScreenLoader[data-state="success"] {
            --state-color: #059669;
            --state-color-soft: rgba(33, 250, 181, 0.95);
            --state-glow: rgba(11, 243, 169, 0.94);
        }
        #fullScreenLoader[data-state="error"] {
            --state-color: #e11d48;
            --state-color-soft: rgba(225, 29, 72, 0.12);
            --state-glow: rgba(225, 29, 72, 0.35);
        }
        #fullScreenLoader[data-state="redirect"] {
            --state-color: #ff0b0b;
            --state-color-soft: rgba(255, 4, 4, 0.12);
            --state-glow: rgb(255, 20, 20);
        }
        .loader-backdrop {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 50% 40%, rgba(30, 41, 59, 0.72), rgba(2, 6, 23, 0.85));
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .loader-card {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(255, 255, 255, 0.92);
            padding: 34px 36px 28px;
            border-radius: 22px;
            box-shadow:
                0 25px 50px -12px rgba(0, 0, 0, 0.35),
                0 0 0 1px rgba(255, 255, 255, 0.6) inset,
                0 0 40px var(--state-glow);
            text-align: center;
            width: 360px;
            max-width: 90vw;
            border: 1px solid rgba(226, 232, 240, 0.7);
            transition: box-shadow 0.4s ease;
            animation: cardRise 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .loader-icon-wrap {
            position: relative;
            width: 60px;
            height: 60px;
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .loader-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: conic-gradient(from 0deg, var(--state-color-soft), var(--state-color) 70%, var(--state-color-soft));
            -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px));
            mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px));
            animation: spinLoader 0.9s linear infinite;
            transition: opacity 0.25s ease;
        }
        .loader-ring-track {
            position: absolute;
            inset: 6px;
            border-radius: 50%;
            background: #ffffff;
            box-shadow: 0 0 0 1px rgba(226, 232, 240, 0.6) inset;
        }
        .loader-icon-symbol {
            position: relative;
            z-index: 2;
            width: 26px;
            height: 26px;
            opacity: 0;
            transform: scale(0.5);
            transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        #fullScreenLoader[data-state="loading"] .loader-ring,
        #fullScreenLoader[data-state="redirect"] .loader-ring { opacity: 1; }
        #fullScreenLoader[data-state="success"] .loader-ring,
        #fullScreenLoader[data-state="error"] .loader-ring { opacity: 0; }
        #fullScreenLoader[data-state="success"] .icon-check,
        #fullScreenLoader[data-state="error"] .icon-cross {
            opacity: 1;
            transform: scale(1);
        }
        .icon-check path, .icon-cross path {
            fill: none;
            stroke: var(--state-color);
            stroke-width: 3;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dasharray: 40;
            stroke-dashoffset: 40;
        }
        #fullScreenLoader[data-state="success"] .icon-check path {
            animation: drawIcon 0.5s ease-out 0.05s forwards;
        }
        #fullScreenLoader[data-state="error"] .icon-cross path {
            animation: drawIcon 0.4s ease-out 0.05s forwards;
        }
        .loader-title {
            font-size: 16.5px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
            font-family: system-ui, -apple-system, sans-serif;
            letter-spacing: -0.01em;
        }
        .loader-detail {
            font-size: 13.5px;
            font-weight: 500;
            color: #475569;
            line-height: 1.5;
            min-height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
            transition: all 0.2s ease-in-out;
            white-space: pre-line;
        }
        .loader-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 14px;
            padding: 4px 13px;
            border-radius: 9999px;
            background: var(--state-color-soft);
            border: 1px solid transparent;
            font-size: 11.5px;
            font-weight: 700;
            color: var(--state-color);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: background 0.3s ease, color 0.3s ease;
        }
        .loader-dot {
            width: 6px;
            height: 6px;
            background-color: var(--state-color);
            border-radius: 50%;
            animation: dotPulse 1s infinite alternate;
        }
        #fullScreenLoader[data-state="success"] .loader-dot,
        #fullScreenLoader[data-state="error"] .loader-dot {
            animation: none;
        }
        .loader-progress-track {
            width: 100%;
            height: 3px;
            margin-top: 18px;
            border-radius: 9999px;
            background: #eef2f7;
            overflow: hidden;
        }
        .loader-progress-fill {
            height: 100%;
            width: 40%;
            border-radius: 9999px;
            background: linear-gradient(90deg, var(--state-color-soft), var(--state-color), var(--state-color-soft));
            animation: progressSlide 1.1s ease-in-out infinite;
        }
        #fullScreenLoader[data-state="success"] .loader-progress-fill,
        #fullScreenLoader[data-state="error"] .loader-progress-fill {
            width: 100%;
            animation: none;
        }
        @keyframes spinLoader {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes dotPulse {
            0% { opacity: 0.35; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes drawIcon {
            to { stroke-dashoffset: 0; }
        }
        @keyframes progressSlide {
            0% { transform: translateX(-110%); }
            100% { transform: translateX(210%); }
        }
        @keyframes cardRise {
            from { opacity: 0; transform: translateY(10px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes loaderFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes loaderFadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

function showScreenLoader(title = 'Authenticating', detail = 'Initialising verification checks...') {
    injectStatusLoaderStyles();
    loaderStartTime = Date.now();

    let loader = document.getElementById('fullScreenLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'fullScreenLoader';
        loader.dataset.state = 'loading';
        loader.innerHTML = `
            <div class="loader-backdrop"></div>
            <div class="loader-card">
                <div class="loader-icon-wrap">
                    <div class="loader-ring"></div>
                    <div class="loader-ring-track"></div>
                    <svg class="loader-icon-symbol icon-check" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6"/></svg>
                    <svg class="loader-icon-symbol icon-cross" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>
                </div>
                <div class="loader-title">${title}</div>
                <div class="loader-detail">${detail}</div>
                <div class="loader-badge">
                    <span class="loader-dot"></span>
                    <span class="badge-text">Searching</span>
                </div>
                <div class="loader-progress-track">
                    <div class="loader-progress-fill"></div>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    } else {
        loader.classList.remove('loader-fade-out');
        updateScreenLoader(detail, title, 'Searching');
        loader.style.display = 'flex';
    }
}

function updateScreenLoader(detail, title = null, badgeText = 'Processing') {
    const loader = document.getElementById('fullScreenLoader');
    if (!loader) return;

    if (title) {
        const titleEl = loader.querySelector('.loader-title');
        if (titleEl) titleEl.textContent = title;
    }
    if (detail) {
        const detailEl = loader.querySelector('.loader-detail');
        if (detailEl) detailEl.textContent = detail;
    }
    if (badgeText) {
        const badgeEl = loader.querySelector('.badge-text');
        if (badgeEl) badgeEl.textContent = badgeText;
        loader.dataset.state = resolveLoaderState(badgeText);
    }
}

async function hideScreenLoader() {
    return new Promise((resolve) => {
        const loader = document.getElementById('fullScreenLoader');
        if (loader) {
            loader.classList.add('loader-fade-out');
            setTimeout(() => {
                loader.remove();
                resolve();
            }, 220);
        } else {
            resolve();
        }
    });
}

// =========================================================================
// NOTIFICATION & AUDIO HELPERS
// =========================================================================
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

// =========================================================================
// GOOGLE AUTH SIGN-IN (WITH READABLE PAUSES)
// =========================================================================
const googleProvider = new GoogleAuthProvider();

async function handleGoogleSignIn() {
    let attemptedEmail = null;
    let currentUser = null;
    try {
        const result = await signInWithPopup(auth, googleProvider);
        currentUser = result.user;
        attemptedEmail = currentUser.email;

        // STEP 1: Query Database
        showScreenLoader('Checking Records', `Searching teacher documents for:\n${attemptedEmail}`);
        await sleep(800);

        const validTeacher = await getTeacherByEmail(attemptedEmail);
        const pendingRequest = await getPendingByEmail(attemptedEmail);

        // STEP 2: Handle Suspended User
        if (validTeacher && (validTeacher.role === 'disabled' || validTeacher.role === 'inactive' || validTeacher.status === 'revoked')) {
            updateScreenLoader('Result: Account has been suspended.\nAction: Stopping login...', 'Access Suspended', 'Denied');
            await sleep(1500);
            await hideScreenLoader();

            await signOut(auth).catch(() => {});
            const err = new Error('Your account access has been modified or suspended by an admin.');
            err.code = 'teacher/access-revoked';
            throw err;
        }

        // STEP 3: Handle Unauthorized Role
        if (validTeacher && validTeacher.role && !ALLOWED_ROLES.includes(validTeacher.role)) {
            updateScreenLoader('Result: Unauthorized role.\nAction: Stopping login...', 'Access Denied', 'Denied');
            await sleep(1500);
            await hideScreenLoader();

            await signOut(auth).catch(() => {});
            const err = new Error('Your assigned role does not have permission to access this portal.');
            err.code = 'teacher/unauthorized-role';
            throw err;
        }

        // STEP 4: Handle Unregistered User -> Registration Form
        if (!validTeacher && !pendingRequest) {
            updateScreenLoader('Result: No teacher record found.\nAction: Opening registration form...', 'Registration Required', 'Redirecting');
            await sleep(1500); // 1.5 second pause so user can comfortably read it
            await hideScreenLoader();

            if (currentUser) {
                await deleteUser(currentUser).catch(() => signOut(auth));
            } else {
                await signOut(auth).catch(() => {});
            }

            const err = new Error('No teacher account found. Please submit your registration details.');
            err.code = 'teacher/not-authorized';
            throw err;
        }

        // STEP 5: Handle Pending Approval
        if (!validTeacher && pendingRequest) {
            updateScreenLoader('Result: Request pending admin approval.\nAction: Opening status details...', 'Pending Approval', 'Redirecting');
            await sleep(1500);
            await hideScreenLoader();

            await signOut(auth).catch(() => {});

            const err = new Error('Your request has been submitted and is currently awaiting admin approval.');
            err.code = 'teacher/pending-approval';
            throw err;
        }

        // STEP 6: Success
        updateScreenLoader('Result: Verified Teacher Account!\nAction: Redirecting to dashboard...', 'Access Granted', 'Success');
        await sleep(1000);
        await hideScreenLoader();

        persistAuthState(currentUser);
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Google sign-in failed:', error);
        await signOut(auth).catch(() => {});
        playAudio('error');

        if ((error.code === 'teacher/not-authorized' || error.code === 'teacher/pending-approval') && attemptedEmail && window.openTeacherSignup) {
            window.openTeacherSignup(attemptedEmail);
        } else {
            await hideScreenLoader();
            if (window.showAuthErrorModal) {
                window.showAuthErrorModal({
                    title: error.code === 'teacher/access-revoked' ? 'Access Suspended' : "Couldn't sign you in",
                    message: error.message || 'Could not verify teacher account.'
                });
            } else {
                showNotification('Login failed', error.message || 'Could not verify teacher account');
            }
        }
    }
}

const googleSignInBtn = document.getElementById('googleSignInBtn');
if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', handleGoogleSignIn);
}

// =========================================================================
// EMAIL / PASSWORD LOGIN HANDLER (WITH READABLE PAUSES)
// =========================================================================
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const resetBtn = document.getElementById('resetPasswordBtn');

    // STEP 1: Initiating Account Checks
    showScreenLoader('Verifying Credentials', 'Checking login credentials & teacher documents...');
    await sleep(600);

    try {
        const { user, teacherData } = await authenticateTeacher(email, password);

        // STEP 2: Record Found & Verified
        updateScreenLoader('Result: Account verified!\nAction: Opening teacher dashboard...', 'Welcome Back', 'Success');
        await sleep(1200);
        await hideScreenLoader();

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

    } catch (error) {
        console.error('Error:', error);
        playAudio('error');

        // STEP 3: Unregistered / Pending Account Detection -> Launch Registration
        if (error.code === 'teacher/not-authorized' || error.code === 'teacher/pending-approval') {
            const isPending = error.code === 'teacher/pending-approval';
            
            updateScreenLoader(
                isPending 
                    ? 'Result: Request pending admin approval.\nAction: Opening status details...' 
                    : 'Result: No teacher record found.\nAction: Opening registration form...',
                isPending ? 'Pending Approval' : 'Registration Required',
                'Redirecting'
            );

            await sleep(1500); // 1.5 second pause so user can comfortably read what happened
            await hideScreenLoader();
            resetBtn.style.display = 'none';

            if (window.openTeacherSignup) {
                window.openTeacherSignup(email);
            }
            return;
        }

        // STEP 4: Standard Auth Error
        await hideScreenLoader();
        
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
    }
});

// =========================================================================
// RESET PASSWORD & AUTH DETECTOR
// =========================================================================
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