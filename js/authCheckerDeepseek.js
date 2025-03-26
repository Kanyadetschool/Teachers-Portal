import { auth } from './firebaseConfig.js';
import { 
  onAuthStateChanged, 
  signOut,
  setPersistence,
  browserSessionPersistence 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// Configurable constants (could be loaded from remote config)
const CONFIG = {
  SESSION_TIMEOUT: 2 * 60 * 60 * 1000,       // 2 hours
  INACTIVITY_TIMEOUT: 30 * 60 * 1000,        // 30 minutes (more realistic)
  INACTIVITY_WARNING: 2 * 60 * 1000,         // 2 minute warning
  ACTIVITY_CHECK_INTERVAL: 5 * 1000,         // Check every 5 seconds (reduced from 1s)
  WARNING_REFRESH_INTERVAL: 10 * 1000,       // Update warning every 10s
};

// Storage keys with prefix to avoid collisions
const STORAGE_KEYS = {
  LAST_ACTIVITY: 'auth_lastActivity',
  SESSION_START: 'auth_sessionStart',
  USER_SESSION: 'auth_userSession_', // + uid
  LOGOUT_TRIGGER: 'auth_logoutTrigger'
};

class ActivityMonitor {
  constructor() {
    this.timers = {};
    this.listeners = [];
    this.broadcastChannel = null;
    this.activeTabCount = 0;
    this.isActiveTab = false;
    this.controller = new AbortController();
  }

  initBroadcastChannel() {
    try {
      this.broadcastChannel = new BroadcastChannel('auth_activity_channel');
      
      this.broadcastChannel.onmessage = (event) => {
        switch (event.data.type) {
          case 'activity_ping':
            this.handleActivityPing(event.data);
            break;
          case 'tab_status':
            this.handleTabStatus(event.data);
            break;
          case 'logout':
            this.handleRemoteLogout();
            break;
        }
      };

      window.addEventListener('focus', this.markTabActive.bind(this));
      window.addEventListener('blur', this.markTabInactive.bind(this));
      this.isActiveTab = document.hasFocus();
      
      // Initial tab status broadcast
      this.broadcastTabStatus();
      
      // Periodic keep-alive
      this.timers.keepAlive = setInterval(() => {
        this.broadcastTabStatus();
      }, 15000);
      
    } catch (e) {
      console.warn('BroadcastChannel not supported, falling back to localStorage');
      this.setupStorageFallback();
    }
  }

  setupStorageFallback() {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEYS.LAST_ACTIVITY) {
        this.updateLastActivity(parseInt(e.newValue || '0'));
      }
      if (e.key === STORAGE_KEYS.LOGOUT_TRIGGER) {
        this.handleRemoteLogout();
      }
    });
  }

  handleActivityPing(data) {
    this.updateLastActivity(data.timestamp);
    if (this.isActiveTab && data.origin !== 'self') {
      this.debouncedUpdateActivity();
    }
  }

  handleTabStatus(data) {
    if (data.status === 'active') {
      this.activeTabCount = Math.max(this.activeTabCount, data.count || 1);
    } else {
      this.activeTabCount = Math.max(0, this.activeTabCount - 1);
    }
  }

  broadcastTabStatus() {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'tab_status',
        status: this.isActiveTab ? 'active' : 'inactive',
        count: this.activeTabCount,
        timestamp: Date.now()
      });
    }
  }

  markTabActive() {
    this.isActiveTab = true;
    this.broadcastTabStatus();
    this.updateActivity();
  }

  markTabInactive() {
    this.isActiveTab = false;
    this.broadcastTabStatus();
  }

  updateLastActivity(timestamp) {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, timestamp.toString());
  }

  debouncedUpdateActivity = this.debounce(() => {
    const now = Date.now();
    this.updateLastActivity(now);
    
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'activity_ping',
        timestamp: now,
        origin: 'self'
      });
    } else {
      // Fallback for browsers without BroadcastChannel
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
      localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
    }
  }, 1000);

  debounce(func, wait) {
    let timeout;
    return function() {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
  }

  setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const options = { passive: true, signal: this.controller.signal };
    
    events.forEach(event => {
      document.addEventListener(event, this.debouncedUpdateActivity, options);
      this.listeners.push({ event, handler: this.debouncedUpdateActivity });
    });
    
    // Handle mobile device sleep/wake
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this), options);
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this.markTabActive();
    } else {
      this.markTabInactive();
    }
  }

  cleanup() {
    clearInterval(this.timers.keepAlive);
    clearInterval(this.timers.inactivityCheck);
    clearTimeout(this.timers.warningTimer);
    
    this.controller.abort();
    
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }
}

class SessionManager {
  constructor(auth) {
    this.auth = auth;
    this.monitor = new ActivityMonitor();
    this.currentUser = null;
    this.warningShown = false;
  }

  async startSession(user) {
    this.currentUser = user;
    const userKey = STORAGE_KEYS.USER_SESSION + user.uid;
    
    // Initialize session start time if not set
    if (!localStorage.getItem(STORAGE_KEYS.SESSION_START)) {
      localStorage.setItem(STORAGE_KEYS.SESSION_START, Date.now().toString());
    }
    
    // Initialize user session time if not set
    if (!localStorage.getItem(userKey)) {
      localStorage.setItem(userKey, '0');
    }

    this.monitor.initBroadcastChannel();
    this.monitor.setupActivityListeners();
    this.monitor.debouncedUpdateActivity();
    
    this.startTimers();
    this.addLogoutButton();
  }

  startTimers() {
    // Main session/inactivity check
    this.monitor.timers.inactivityCheck = setInterval(() => {
      this.checkSessionStatus();
    }, CONFIG.ACTIVITY_CHECK_INTERVAL);
  }

  async checkSessionStatus() {
    if (!this.currentUser) return;

    const now = Date.now();
    const lastActivity = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY) || '0');
    const inactiveTime = now - lastActivity;
    const userKey = STORAGE_KEYS.USER_SESSION + this.currentUser.uid;
    
    // Calculate session duration
    const sessionStart = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_START) || now);
    const previousDuration = parseInt(localStorage.getItem(userKey) || '0');
    const currentDuration = previousDuration + (now - sessionStart);
    
    // Update stored session duration
    localStorage.setItem(userKey, currentDuration.toString());
    localStorage.setItem(STORAGE_KEYS.SESSION_START, now.toString());

    // Check session timeout
    if (currentDuration >= CONFIG.SESSION_TIMEOUT) {
      await this.handleLogout(true);
      return;
    }

    // Session expiry warning (15 minutes remaining)
    if (currentDuration >= (CONFIG.SESSION_TIMEOUT - (15 * 60 * 1000)) && 
        !this.warningShown) {
      this.showSessionWarning();
      this.warningShown = true;
    }

    // Inactivity check (only if no active tabs)
    if (this.monitor.activeTabCount === 0) {
      if (inactiveTime >= CONFIG.INACTIVITY_TIMEOUT) {
        await this.handleLogout(true);
      } else if (inactiveTime >= (CONFIG.INACTIVITY_TIMEOUT - CONFIG.INACTIVITY_WARNING)) {
        this.showInactivityWarning(inactiveTime);
      }
    }
  }

  showSessionWarning() {
    Swal.fire({
      title: 'Session Expiring Soon',
      html: 'Your session will expire in 15 minutes. Please save your work.',
      icon: 'warning',
      timer: 30000,
      timerProgressBar: true,
      showConfirmButton: true,
    });
  }

  showInactivityWarning(inactiveTime) {
    const remainingMs = CONFIG.INACTIVITY_TIMEOUT - inactiveTime;
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    
    // Only show if not already showing and we have an active tab
    if (!Swal.isVisible() && this.monitor.isActiveTab) {
      Swal.fire({
        title: 'Inactivity Warning',
        html: `You will be logged out in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`,
        icon: 'warning',
        timer: Math.min(remainingMs, 30000),
        timerProgressBar: true,
        showCancelButton: true,
        confirmButtonText: 'Stay Logged In',
        cancelButtonText: 'Logout Now',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.monitor.debouncedUpdateActivity();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.handleLogout(false);
        }
      });
      
      // Update tab title with countdown
      this.updateTabTitle(remainingMs);
    }
  }

  updateTabTitle(remainingMs) {
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    document.title = `⚠️ Logging out in ${minutes}m ${seconds}s | MyApp`;
    
    if (remainingMs > 0) {
      this.monitor.timers.warningTimer = setTimeout(() => {
        this.updateTabTitle(remainingMs - 1000);
      }, 1000);
    } else {
      document.title = 'MyApp';
    }
  }

  addLogoutButton() {
    const existingButton = document.getElementById('global-logout-button');
    if (existingButton) return;
    
    const logoutButton = document.createElement('div');
    logoutButton.id = 'global-logout-button';
    logoutButton.innerHTML = `
      <button style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;
                    padding: 10px 20px; background: linear-gradient(90deg, #182c59, #ff1cac);
                    color: white; border: none; border-radius: 10px; cursor: pointer;
                    font-family: 'Poppins', sans-serif; font-size: 16px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    `;
    logoutButton.querySelector('button').addEventListener('click', () => this.handleLogout(false));
    document.body.appendChild(logoutButton);
  }

  async handleLogout(isTimeout) {
    try {
      // Clear all timers and listeners first
      this.monitor.cleanup();
      
      // Broadcast logout to other tabs
      if (this.monitor.broadcastChannel) {
        this.monitor.broadcastChannel.postMessage({ type: 'logout' });
      } else {
        localStorage.setItem(STORAGE_KEYS.LOGOUT_TRIGGER, Date.now().toString());
        localStorage.removeItem(STORAGE_KEYS.LOGOUT_TRIGGER);
      }
      
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
      localStorage.removeItem(STORAGE_KEYS.SESSION_START);
      
      // Sign out from Firebase
      await setPersistence(auth, browserSessionPersistence);
      await signOut(auth);
      
      // Redirect (with prevention of back button)
      window.location.replace('https://kanyadet-school-portal.web.app/login.html');
      
    } catch (error) {
      console.error('Logout error:', error);
      window.location.replace('https://kanyadet-school-portal.web.app/login.html');
    }
  }
}

// Main initialization
export function initAuth() {
  const publicPages = [
    'https://kanyadet-school-portal.web.app/login.html',
    'https://kanyadet-school-portal.web.app/signup.html',
    'https://kanyadet-school-portal.web.app/reset.html'
  ];
  
  const currentUrl = window.location.href;
  const sessionManager = new SessionManager(auth);

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is logged in
      if (publicPages.some(page => currentUrl.includes(page))) {
        window.location.href = 'https://kanyadet-school-portal.web.app/index.html';
        return;
      }
      
      try {
        // Refresh token on initial load
        await user.getIdToken(true);
        await sessionManager.startSession(user);
      } catch (error) {
        console.error('Auth refresh error:', error);
        await sessionManager.handleLogout(true);
      }
    } else {
      // User is logged out
      sessionManager.monitor.cleanup();
      
      if (!publicPages.some(page => currentUrl.includes(page))) {
        window.location.href = 'login.html';
      }
    }
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  // No need to do anything here as we're using AbortController
});