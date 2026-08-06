import { auth } from './firebaseConfig.js';
import { 
  onAuthStateChanged, 
  signOut, 
  browserLocalPersistence, 
  setPersistence 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getTeacherByEmail, watchTeacherRole } from './authService.js';

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
let teacherRoleUnsubscribe;

function getUserSessionKey(uid) {
    return USER_SESSION_KEY + uid;
}

function initBroadcastChannel() {
    activityChannel = new BroadcastChannel('activity_channel');
    
    activityChannel.onmessage = (event) => {
        if (event.data.type === 'activity_update') {
            localStorage.setItem(ACTIVITY_KEY, event.data.timestamp.toString());
            if (typeof Swal !== 'undefined' && Swal.isVisible()) {
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

    window.addEventListener('focus', () => {
        isActiveTab = true;
        activityChannel.postMessage({ type: 'tab_active', timestamp: Date.now() });
    });

    window.addEventListener('blur', () => {
        isActiveTab = false;
        activityChannel.postMessage({ type: 'tab_inactive' });
    });

    isActiveTab = document.hasFocus();
    if (isActiveTab) {
        activityChannel.postMessage({ type: 'tab_active' });
    }
}

function updateActivity() {
    const currentTime = Date.now();
    localStorage.setItem(ACTIVITY_KEY, currentTime.toString());
    localStorage.setItem('activityBroadcast', currentTime.toString());
    
    if (isActiveTab && activityChannel) {
        activityChannel.postMessage({
            type: 'activity_update',
            timestamp: currentTime
        });
    }
}

async function showInactivityWarning(initialSeconds) {
    if (warningDialog) {
        Swal.close();
    }

    let timerInterval;

    warningDialog = await Swal.fire({
        title: 'Inactivity Warning',
        html: `You will be logged out in <b id="swal-countdown-seconds">${initialSeconds}</b> seconds`,
        icon: 'warning',
        timer: initialSeconds * 1000,
        timerProgressBar: true,
        showCancelButton: true,
        confirmButtonText: 'Stay Logged In',
        cancelButtonText: 'Logout Now',
        allowOutsideClick: false,
        didOpen: () => {
            const b = Swal.getHtmlContainer().querySelector('#swal-countdown-seconds');
            timerInterval = setInterval(() => {
                if (Swal.getTimerLeft()) {
                    const secondsLeft = Math.ceil(Swal.getTimerLeft() / 1000);
                    if (b) {
                        b.textContent = secondsLeft;
                    }
                }
            }, 1000);
        },
        willClose: () => {
            clearInterval(timerInterval);
        }
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
    return activeTabCount === 0 && inactiveTime >= INACTIVITY_TIMEOUT;
}

function startActivityMonitoring(uid) {
    initBroadcastChannel();
    updateActivity();
    const startTime = Date.now();
    localStorage.setItem(SESSION_START_KEY, startTime.toString());
    
    const userSessionKey = getUserSessionKey(uid);
    const previousDuration = parseInt(localStorage.getItem(userSessionKey) || '0');

    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'activityBroadcast') {
            localStorage.setItem(ACTIVITY_KEY, e.newValue);
            if (typeof Swal !== 'undefined' && Swal.isVisible()) {
                Swal.close();
            }
        }
        if (e.key === 'logout_signal') {
            window.location.replace('login.html');
        }
    });

    activityInterval = setInterval(async () => {
        const lastActivity = parseInt(localStorage.getItem(ACTIVITY_KEY) || '0');
        const inactiveTime = Date.now() - lastActivity;
        
        const sessionStart = parseInt(localStorage.getItem(SESSION_START_KEY));
        const currentDuration = previousDuration + (Date.now() - sessionStart);
        localStorage.setItem(userSessionKey, currentDuration.toString());

        if (currentDuration >= SESSION_TIMEOUT) {
            await handleLogout(uid, true);
            return;
        }

        if (currentDuration >= (SESSION_TIMEOUT - (15 * 60 * 1000)) && 
            currentDuration < (SESSION_TIMEOUT - (14 * 60 * 1000))) {
            await Swal.fire({
                title: 'Session Expiring Soon',
                html: 'Your session will expire in 15 minutes. Please save your work.',
                icon: 'warning',
                timer: 10000,
                timerProgressBar: true,
                showConfirmButton: true,
            });
        }

        if (checkGlobalInactivity()) {
            await handleLogout(uid, true);
            return;
        }

        if (activeTabCount === 0 && 
            inactiveTime >= (INACTIVITY_TIMEOUT - INACTIVITY_WARNING) && 
            (typeof Swal === 'undefined' || !Swal.isVisible())) {
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
    if (teacherRoleUnsubscribe) {
        teacherRoleUnsubscribe();
        teacherRoleUnsubscribe = undefined;
    }
}

function addLogoutButton() {
    if (document.getElementById('global-logout-btn')) return;
    const header = document.createElement('div');
    header.id = 'global-logout-btn';
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
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        const publicPages = ['login.html', 'signup.html', 'reset.html'];
        const isPublicPage = publicPages.some(page => window.location.pathname.endsWith(page));

        onAuthStateChanged(auth, async (user) => {
            const pageWrapper = document.querySelector('.page-wrapper');
            if (user) {
                const teacherData = await getTeacherByEmail(user.email);
                if (!teacherData) {
                    await window.handleLogout(user.uid);
                    reject(new Error('No authorized teacher record found for this account'));
                    return;
                }
                teacherRoleUnsubscribe = watchTeacherRole(teacherData.id, teacherData.role);

                if (pageWrapper) {
                    pageWrapper.classList.remove('content-hidden');
                }

                const userSessionKey = getUserSessionKey(user.uid);
                if (!localStorage.getItem(userSessionKey)) {
                    localStorage.setItem(userSessionKey, '0');
                }

                if (isPublicPage) {
                    window.location.replace('index.html');
                    return;
                }

                addLogoutButton();
                startActivityMonitoring(user.uid);
                resolve(user);
            } else {
                stopActivityMonitoring();
                if (!isPublicPage) {
                    window.location.replace('login.html');
                }
                reject(new Error('User not authenticated'));
            }
        });
    });
}

window.handleLogout = async function(uid, isInactivityLogout = false) {
    try {
        stopActivityMonitoring();
        localStorage.removeItem(ACTIVITY_KEY);
        localStorage.removeItem(SESSION_START_KEY);
        localStorage.removeItem('activityBroadcast');
        if (uid) {
            localStorage.removeItem(getUserSessionKey(uid));
        }
        
        localStorage.setItem('logout_signal', Date.now().toString());
        
        await signOut(auth);
        
        localStorage.clear();
        sessionStorage.clear();
        
        window.location.replace('login.html');
    } catch (error) {
        console.error('Logout error:', error);
        window.location.replace('login.html');
    }
};

window.addEventListener('unload', () => {
    stopActivityMonitoring();
});