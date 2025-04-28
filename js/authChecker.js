import { auth } from './firebaseConfig.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
// Remove Swal import - we'll use from CDN

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const INACTIVITY_TIMEOUT = 1 * 60 * 1000;  // 1 minute
const INACTIVITY_WARNING = 30 * 1000;  // 30 seconds warning
const ACTIVITY_KEY = 'lastUserActivity';
const ACTIVITY_CHECK_INTERVAL = 1000; // Check every second
const SESSION_START_KEY = 'sessionStartTime';
const USER_SESSION_KEY = 'userSessionTime_';
let activityInterval;
let activityChannel;
let isActiveTab = false;
let activeTabCount = 0;
let warningDialog;

function getUserSessionKey(uid) {
    return USER_SESSION_KEY + uid;
}

function initBroadcastChannel() {
    activityChannel = new BroadcastChannel('activity_channel');
    
    // Listen for messages from other tabs
    activityChannel.onmessage = (event) => {
        if (event.data.type === 'activity_update') {
            localStorage.setItem(ACTIVITY_KEY, event.data.timestamp.toString());
            if (Swal.isVisible()) {
                Swal.close();
            }
        } else if (event.data.type === 'tab_check') {
            activityChannel.postMessage({ type: 'tab_response', timestamp: Date.now() });
        } else if (event.data.type === 'tab_active') {
            activeTabCount++;
        } else if (event.data.type === 'tab_inactive') {
            activeTabCount = Math.max(0, activeTabCount - 1);
        }
    };

    // Mark this tab as active when it gains focus
    window.addEventListener('focus', () => {
        isActiveTab = true;
        activityChannel.postMessage({ type: 'tab_active', timestamp: Date.now() });
    });

    // Mark this tab as inactive when it loses focus
    window.addEventListener('blur', () => {
        isActiveTab = false;
        activityChannel.postMessage({ type: 'tab_inactive' });
    });

    // Initially check if this is the only active tab
    isActiveTab = document.hasFocus();
    if (isActiveTab) {
        activityChannel.postMessage({ type: 'tab_active' });
    }
}

function updateActivity() {
    const currentTime = Date.now();
    // Always update activity timestamp regardless of time difference
    localStorage.setItem(ACTIVITY_KEY, currentTime.toString());
    localStorage.setItem('activityBroadcast', currentTime.toString());
    
    // Broadcast activity to other tabs only if this is the active tab
    if (isActiveTab) {
        activityChannel.postMessage({
            type: 'activity_update',
            timestamp: currentTime
        });
    }
}

async function showInactivityWarning(remainingSeconds) {
    if (warningDialog) {
        Swal.close();
    }

    warningDialog = await Swal.fire({
        title: 'Inactivity Warning',
        html: `You will be logged out in <b>${remainingSeconds}</b> seconds`,
        icon: 'warning',
        timer: remainingSeconds * 1000,
        timerProgressBar: true,
        showCancelButton: true,
        confirmButtonText: 'Stay Logged In',
        cancelButtonText: 'Logout Now',
        allowOutsideClick: false
    });

    if (warningDialog.isConfirmed) {
        updateActivity();
        return true;
    } else if (warningDialog.dismiss === Swal.DismissReason.cancel) {
        handleLogout();
        return false;
    }
    return false;
}

function checkGlobalInactivity() {
    const lastActivity = parseInt(localStorage.getItem(ACTIVITY_KEY) || '0');
    const inactiveTime = Date.now() - lastActivity;
    
    // Only consider inactivity if no tabs are active
    return activeTabCount === 0 && inactiveTime >= INACTIVITY_TIMEOUT;
}

function startActivityMonitoring(uid) {
    initBroadcastChannel();
    updateActivity();
    const startTime = Date.now();
    localStorage.setItem(SESSION_START_KEY, startTime.toString());
    
    // Get user-specific previous duration
    const userSessionKey = getUserSessionKey(uid);
    const previousDuration = parseInt(localStorage.getItem(userSessionKey) || '0');

    // Monitor meaningful user interactions only
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
    });

    // Listen for activity from other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'activityBroadcast') {
            localStorage.setItem(ACTIVITY_KEY, e.newValue);
            if (Swal.isVisible()) {
                Swal.close();
            }
        }
        if (e.key === 'logout') {
            window.location.href = 'https://kanyadet-school-portal.web.app/login.html';
        }
    });

    activityInterval = setInterval(async () => {
        const lastActivity = parseInt(localStorage.getItem(ACTIVITY_KEY) || '0');
        const inactiveTime = Date.now() - lastActivity;
        
        // Calculate total session duration
        const sessionStart = parseInt(localStorage.getItem(SESSION_START_KEY));
        const currentDuration = previousDuration + (Date.now() - sessionStart);
        localStorage.setItem(userSessionKey, currentDuration.toString());

        // Check for session timeout
        if (currentDuration >= SESSION_TIMEOUT) {
            await handleLogout(uid, true);
            return;
        }

        // Show session expiry warning at 1:45 hours
        if (currentDuration >= (SESSION_TIMEOUT - (15 * 60 * 1000)) && 
            currentDuration < (SESSION_TIMEOUT - (14 * 60 * 1000))) {  // Show warning only once
            await Swal.fire({
                title: 'Session Expiring Soon',
                html: 'Your session will expire in 15 minutes. Please save your work.',
                icon: 'warning',
                timer: 10000,
                timerProgressBar: true,
                showConfirmButton: true,
            });
        }

        // Handle inactivity
        if (checkGlobalInactivity()) {
            await handleLogout(uid, true);
            return;
        }

        // Show warning only if no tabs are active
        if (activeTabCount === 0 && 
            inactiveTime >= (INACTIVITY_TIMEOUT - INACTIVITY_WARNING) && 
            !Swal.isVisible()) {
            const remainingSeconds = Math.floor((INACTIVITY_TIMEOUT - inactiveTime) / 1000);
            if (remainingSeconds > 0) {
                await showInactivityWarning(remainingSeconds);
            }
        }
    }, ACTIVITY_CHECK_INTERVAL);
}

function stopActivityMonitoring() {
    clearInterval(activityInterval);
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
        document.removeEventListener(event, updateActivity);
    });
    if (activityChannel) {
        activityChannel.close();
    }
}

function addLogoutButton() {
    const header = document.createElement('div');
    header.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
            <button onclick="handleLogout()" 
                style="padding: 10px 20px; 
                       background: linear-gradient(90deg, #182c59, #ff1cac);
                       color: white; 
                       border: none; 
                       border-radius: 10px; 
                       cursor: pointer;
                       font-family: 'Poppins', sans-serif;
                       font-size: 16px;
                       box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;
    document.body.insertBefore(header, document.body.firstChild);
}

export function initAuth() {
    return new Promise((resolve, reject) => {
        const publicPages = ['https://kanyadet-school-portal.web.app/login.html', 
                            'https://kanyadet-school-portal.web.app/signup.html', 
                            'https://kanyadet-school-portal.web.app/reset.html'];
        const currentFullUrl = window.location.href;

        onAuthStateChanged(auth, (user) => {
        const pageWrapper = document.querySelector('.page-wrapper');
        if (user) {
            // Remove content-hidden class when user is authenticated
            if (pageWrapper) {
                pageWrapper.classList.remove('content-hidden');
            }
            const userSessionKey = getUserSessionKey(user.uid);
            if (!localStorage.getItem(userSessionKey)) {
                localStorage.setItem(userSessionKey, '0');
            }
            if (publicPages.some(page => currentFullUrl.includes(page))) {
                window.location.href = 'https://kanyadet-school-portal.web.app/index.html';
                return;
            }
            addLogoutButton();
            startActivityMonitoring(user.uid);
        } else {
            stopActivityMonitoring();
            if (!publicPages.some(page => currentFullUrl.includes(page))) {
                window.location.href = 'https://kanyadet-school-portal.web.app/login.html';
            }
            reject(new Error('User not authenticated'));
        }
        resolve(user);
    });
    });
}

window.handleLogout = async function(uid, isInactivityLogout = false) {
    try {
        stopActivityMonitoring();
        // Clear all auth-related items from localStorage
        localStorage.removeItem(ACTIVITY_KEY);
        localStorage.removeItem(SESSION_START_KEY);
        localStorage.removeItem('activityBroadcast');
        if (uid) {
            localStorage.removeItem(getUserSessionKey(uid));
        }
        localStorage.setItem('logout', Date.now().toString());
        
        // Clear Firebase auth state and persistence for both manual and auto logout
        await signOut(auth);
        await auth.setPersistence('none');
        
        // Clear any remaining session data
        localStorage.clear();
        sessionStorage.clear();
        
        // Use replace for both scenarios to prevent back navigation
        window.location.replace('https://kanyadet-school-portal.web.app/login.html');
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect on error
        window.location.replace('https://kanyadet-school-portal.web.app/login.html');
    }
}

// Clean up on page unload
window.addEventListener('unload', () => {
    stopActivityMonitoring();
});
