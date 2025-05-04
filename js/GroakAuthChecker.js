// Import Firebase Authentication utilities
import { auth } from './firebaseConfig.js';
import {
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';

// Configuration object for easy customization
const CONFIG = {
  SESSION_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
  INACTIVITY_TIMEOUT: 1 * 60 * 1000, // 1 minute
  INACTIVITY_WARNING: 30 * 1000, // 30 seconds
  ACTIVITY_CHECK_INTERVAL: 5000, // Check every 5 seconds
  HEARTBEAT_INTERVAL: 30000, // Tab heartbeat every 30 seconds
  PUBLIC_PAGES: [
    'login.html',
    'https://kanyadet-school-portal.web.app/signup.html',
    'https://kanyadet-school-portal.web.app/reset.html',
  ],
  ACTIVITY_KEY: 'lastUserActivity',
  SESSION_START_KEY: 'sessionStartTime',
  USER_SESSION_KEY: 'userSessionTime_',
  LOGOUT_TOKEN_KEY: 'logoutToken',
};

// State variables
let activityInterval;
let heartbeatInterval;
let activityChannel;
let isActiveTab = false;
let activeTabCount = 0;
let lastActivityUpdate = 0;
const DEBOUNCE_DELAY = 200; // Debounce activity updates

/**
 * Generates a unique session key for a user.
 * @param {string} uid - User ID
 * @returns {string} User-specific session key
 */
function getUserSessionKey(uid) {
  return CONFIG.USER_SESSION_KEY + uid;
}

/**
 * Initializes BroadcastChannel for multi-tab communication.
 */
function initBroadcastChannel() {
  try {
    activityChannel = new BroadcastChannel('activity_channel');

    activityChannel.onmessage = (event) => {
      if (!event.data?.type) return;

      if (event.data.type === 'activity_update') {
        localStorage.setItem(CONFIG.ACTIVITY_KEY, event.data.timestamp.toString());
        if (Swal.isVisible()) Swal.close();
      } else if (event.data.type === 'tab_check') {
        activityChannel.postMessage({
          type: 'tab_response',
          timestamp: Date.now(),
        });
      } else if (event.data.type === 'tab_active') {
        activeTabCount++;
      } else if (event.data.type === 'tab_inactive') {
        activeTabCount = Math.max(0, activeTabCount - 1);
      } else if (event.data.type === 'heartbeat') {
        activeTabCount = Math.max(1, activeTabCount);
      }
    };

    window.addEventListener('focus', () => {
      isActiveTab = true;
      activityChannel.postMessage({ type: 'tab_active', timestamp: Date.now() });
    });

    window.addEventListener('blur', () => {
      isActiveTab = false;
      activityChannel.postMessage({ type: 'tab_inactive', timestamp: Date.now() });
    });

    isActiveTab = document.hasFocus();
    if (isActiveTab) {
      activityChannel.postMessage({ type: 'tab_active', timestamp: Date.now() });
    }

    heartbeatInterval = setInterval(() => {
      if (isActiveTab) {
        activityChannel.postMessage({ type: 'heartbeat', timestamp: Date.now() });
      }
    }, CONFIG.HEARTBEAT_INTERVAL);
  } catch (error) {
    console.warn('BroadcastChannel not supported:', error);
    isActiveTab = true;
    activeTabCount = 1;
  }
}

/**
 * Debounced function to update user activity.
 */
function updateActivity() {
  const currentTime = Date.now();
  if (currentTime - lastActivityUpdate < DEBOUNCE_DELAY) return;

  lastActivityUpdate = currentTime;
  localStorage.setItem(CONFIG.ACTIVITY_KEY, currentTime.toString());
  localStorage.setItem('activityBroadcast', currentTime.toString());

  if (isActiveTab && activityChannel) {
    activityChannel.postMessage({
      type: 'activity_update',
      timestamp: currentTime,
    });
  }
}

/**
 * Shows an inactivity warning dialog.
 * @param {number} remainingSeconds - Seconds until logout
 * @returns {Promise<boolean>} True if user stays logged in
 */
async function showInactivityWarning(remainingSeconds) {
  try {
    if (Swal.isVisible()) Swal.close();

    const result = await Swal.fire({
      title: 'Inactivity Warning',
      html: `You will be logged out in <b>${remainingSeconds}</b> seconds due to inactivity.`,
      icon: 'warning',
      timer: remainingSeconds * 1000,
      timerProgressBar: true,
      showCancelButton: true,
      confirmButtonText: 'Stay Logged In',
      cancelButtonText: 'Logout Now',
      allowOutsideClick: false,
      backdrop: true,
      focusConfirm: true,
      customClass: {
        popup: 'swal-accessible',
      },
    });

    if (result.isConfirmed) {
      updateActivity();
      return true;
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      await handleLogout(null, true);
      return false;
    }
    return false;
  } catch (error) {
    console.error('Error showing inactivity warning:', error);
    return false;
  }
}

/**
 * Checks if the user is globally inactive.
 * @returns {boolean} True if globally inactive
 */
function checkGlobalInactivity() {
  const lastActivity = parseInt(localStorage.getItem(CONFIG.ACTIVITY_KEY) || '0');
  const inactiveTime = Date.now() - lastActivity;
  return activeTabCount === 0 && inactiveTime >= CONFIG.INACTIVITY_TIMEOUT;
}

/**
 * Starts monitoring user activity and session duration.
 * @param {string} uid - User ID
 */
function startActivityMonitoring(uid) {
  try {
    initBroadcastChannel();
    updateActivity();
    const startTime = Date.now();
    localStorage.setItem(CONFIG.SESSION_START_KEY, startTime.toString());

    const userSessionKey = getUserSessionKey(uid);
    const previousDuration = parseInt(localStorage.getItem(userSessionKey) || '0');

    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    window.addEventListener('storage', (e) => {
      if (e.key === 'activityBroadcast') {
        localStorage.setItem(CONFIG.ACTIVITY_KEY, e.newValue);
        if (Swal.isVisible()) Swal.close();
      }
      if (e.key === 'logout') {
        window.location.href = CONFIG.PUBLIC_PAGES[0];
      }
    });

    const checkActivity = () => {
      const lastActivity = parseInt(localStorage.getItem(CONFIG.ACTIVITY_KEY) || '0');
      const inactiveTime = Date.now() - lastActivity;
      const sessionStart = parseInt(localStorage.getItem(CONFIG.SESSION_START_KEY));
      const currentDuration = previousDuration + (Date.now() - sessionStart);
      localStorage.setItem(userSessionKey, currentDuration.toString());

      if (currentDuration >= CONFIG.SESSION_TIMEOUT) {
        handleLogout(uid, true);
        return;
      }

      const warningThreshold = CONFIG.SESSION_TIMEOUT - 15 * 60 * 1000;
      if (
        currentDuration >= warningThreshold &&
        currentDuration < warningThreshold + 60 * 1000
      ) {
        Swal.fire({
          title: 'Session Expiring Soon',
          html: 'Your session will expire in 15 minutes. Please save your work.',
          icon: 'warning',
          timer: 10000,
          timerProgressBar: true,
          showConfirmButton: true,
          focusConfirm: true,
        });
      }

      if (checkGlobalInactivity()) {
        handleLogout(uid, true);
        return;
      }

      if (
        activeTabCount === 0 &&
        inactiveTime >= CONFIG.INACTIVITY_TIMEOUT - CONFIG.INACTIVITY_WARNING &&
        !Swal.isVisible()
      ) {
        const remainingSeconds = Math.floor(
          (CONFIG.INACTIVITY_TIMEOUT - inactiveTime) / 1000
        );
        if (remainingSeconds > 0) {
          showInactivityWarning(remainingSeconds);
        }
      }

      activityInterval = requestAnimationFrame(checkActivity);
    };

    activityInterval = requestAnimationFrame(checkActivity);
  } catch (error) {
    console.error('Error starting activity monitoring:', error);
    Swal.fire({
      title: 'Error',
      text: 'Failed to start session monitoring. Please try logging in again.',
      icon: 'error',
      confirmButtonText: 'OK',
    }).then(() => {
      handleLogout(null, true);
    });
  }
}

/**
 * Stops activity monitoring and cleans up resources.
 */
function stopActivityMonitoring() {
  try {
    if (activityInterval) {
      cancelAnimationFrame(activityInterval);
    }
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach((event) => {
      document.removeEventListener(event, updateActivity);
    });
    if (activityChannel) {
      activityChannel.close();
    }
  } catch (error) {
    console.warn('Error stopping activity monitoring:', error);
  }
}

/**
 * Adds a styled, accessible logout button to the UI.
 */
function addLogoutButton() {
  const button = document.createElement('button');
  button.textContent = 'Logout';
  button.setAttribute('aria-label', 'Log out of the application');
  button.setAttribute('type', 'button');
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background: linear-gradient(90deg, #182c59, #ff1cac);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;

  button.addEventListener('click', async () => {
    const result = await Swal.fire({
      title: 'Confirm Logout',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Log Out',
      cancelButtonText: 'Cancel',
      focusCancel: true,
    });

    if (result.isConfirmed) {
      handleLogout(null, false);
    }
  });

  const container = document.createElement('div');
  container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999;';
  container.appendChild(button);
  document.body.appendChild(container);
}

/**
 * Initializes Firebase Authentication and session management.
 * @returns {Promise<void>} Resolves when auth state is determined, rejects on error
 */
export function initAuth() {
  return new Promise((resolve, reject) => {
    try {
      const currentFullUrl = window.location.href;
      const pageWrapper = document.querySelector('.page-wrapper');

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe(); // Clean up listener after first call
        if (user) {
          if (pageWrapper) {
            pageWrapper.classList.remove('content-hidden');
          }
          const userSessionKey = getUserSessionKey(user.uid);
          if (!localStorage.getItem(userSessionKey)) {
            localStorage.setItem(userSessionKey, '0');
          }
          if (CONFIG.PUBLIC_PAGES.some((page) => currentFullUrl.includes(page))) {
            window.location.href = 'https://kanyadet-school-portal.web.app/index.html';
            resolve();
            return;
          }
          addLogoutButton();
          startActivityMonitoring(user.uid);
          resolve();
        } else {
          stopActivityMonitoring();
          if (!CONFIG.PUBLIC_PAGES.some((page) => currentFullUrl.includes(page))) {
            window.location.href = CONFIG.PUBLIC_PAGES[0];
          }
          resolve();
        }
      }, (error) => {
        unsubscribe();
        console.error('Auth state error:', error);
        Swal.fire({
          title: 'Authentication Error',
          text: 'Failed to initialize authentication. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
        }).then(() => {
          window.location.href = CONFIG.PUBLIC_PAGES[0];
        });
        reject(error);
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      Swal.fire({
        title: 'Authentication Error',
        text: 'Failed to initialize authentication. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      }).then(() => {
        window.location.href = CONFIG.PUBLIC_PAGES[0];
      });
      reject(error);
    }
  });
}

/**
 * Handles user logout (manual or automatic).
 * @param {string|null} uid - User ID
 * @param {boolean} isInactivityLogout - Whether logout is due to inactivity
 */
window.handleLogout = async function (uid, isInactivityLogout = false) {
  try {
    stopActivityMonitoring();

    const logoutToken = crypto.randomUUID();
    localStorage.setItem(CONFIG.LOGOUT_TOKEN_KEY, logoutToken);

    localStorage.removeItem(CONFIG.ACTIVITY_KEY);
    localStorage.removeItem(CONFIG.SESSION_START_KEY);
    localStorage.removeItem('activityBroadcast');
    if (uid) {
      localStorage.removeItem(getUserSessionKey(uid));
    }

    if (localStorage.getItem(CONFIG.LOGOUT_TOKEN_KEY) !== logoutToken) {
      throw new Error('Invalid logout token');
    }

    localStorage.setItem('logout', Date.now().toString());
    await signOut(auth);
    await auth.setPersistence('none');

    localStorage.clear();
    sessionStorage.clear();

    window.location.replace(CONFIG.PUBLIC_PAGES[0]);
  } catch (error) {
    console.error('Logout error:', error);
    Swal.fire({
      title: 'Logout Error',
      text: 'Failed to log out. Please try again or refresh the page.',
      icon: 'error',
      confirmButtonText: 'OK',
    });
    window.location.replace(CONFIG.PUBLIC_PAGES[0]);
  }
};

// Clean up on page unload
window.addEventListener('unload', () => {
  stopActivityMonitoring();
});

// Expose config for testing
window.__TEST_CONFIG = CONFIG;