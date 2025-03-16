var mainApp = {};
(function() {
    var mainContainer = document.getElementById("main_container");
    const TOKEN_LIFETIME = 21600000; // 6 hours in milliseconds
    const WARNING_BEFORE_EXPIRY = 300000; // 5 minutes in milliseconds
    const INACTIVITY_TIMEOUT = 60000; // 1 minute in milliseconds
    const WARNING_BEFORE_INACTIVITY = 30000; // 30 seconds warning
    let tokenExpiryTimer;
    let warningTimer;
    let inactivityTimer;
    let lastActivity = Date.now();

    // Set up auth persistence
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch(function(error) {
            console.error("Auth persistence error:", error);
        });

    // Listen for storage events to sync logout across tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'logout-event') {
            // Perform logout in other tabs without redirect
            firebase.auth().signOut().then(function() {
                window.location.replace("./login.html");
            }).catch(function(error) {
                console.error("Logout error:", error);
            });
        } else if (e.key === 'last-activity') {
            const newLastActivity = parseInt(e.newValue);
            if (Date.now() - newLastActivity > INACTIVITY_TIMEOUT) {
                logout();
            }
        } else if (e.key === 'auth-state-change') {
            const authState = JSON.parse(e.newValue);
            if (authState && authState.isLoggedIn) {
                // Another tab logged in, refresh auth state
                firebase.auth().onAuthStateChanged(function(user) {
                    if (user) setupTokenExpiration();
                });
            }
        }
    });

    var logout = function() {
        clearTimeout(inactivityTimer);
        // Store logout time before clearing
        localStorage.setItem('last-logout-time', Date.now().toString());
        
        // Trigger logout event for other tabs
        localStorage.setItem('logout-event', Date.now().toString());
        
        // Perform logout in current tab
        firebase.auth().signOut().then(function() {
            window.location.replace("./login.html");
        }, function(error) {
            console.error("Logout error:", error);
        });
    };

    // Show security notification on every page load
    function showSecurityNotification() {
        // Check if SweetAlert2 is loaded
        if (typeof Swal === 'undefined') {
            console.error('SweetAlert2 not loaded');
            return;
        }
        
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showSecurityNotification);
            return;
        }
        
        Swal.fire({
            title: 'Security Notice',
            text: 'Please ensure you\'re in a secure environment before proceeding.',
            icon: 'info',
            timer: 10, // Increased timer to 5 seconds
            timerProgressBar: true,
            confirmButtonText: 'Understood',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    // Show warning before token expiration
    function showExpiryWarning() {
        var countdown = 300; // 5 minutes in seconds
        Swal.fire({
            title: 'Session Expiring Soon',
            html: `Your session will expire in <strong id="countdown">${countdown}</strong> seconds.<br>You will need to log in again after expiration.`,
            icon: 'warning',
            timer: WARNING_BEFORE_EXPIRY,
            timerProgressBar: true,
            showCancelButton: true,
            confirmButtonText: 'Understood',
            cancelButtonText: 'Logout Now',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (!result.isConfirmed) {
                logout();
            }
        });

        const countdownInterval = setInterval(() => {
            countdown--;
            const element = document.getElementById('countdown');
            if (element && countdown >= 0) {
                element.textContent = countdown;
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    // Show warning before inactivity logout
    function showInactivityWarning() {
        var countdown = 30; // 30 seconds
        Swal.fire({
            title: 'Inactivity Warning',
            html: `You will be logged out in <strong id="inactivity-countdown">${countdown}</strong> seconds due to inactivity.`,
            icon: 'warning',
            timer: WARNING_BEFORE_INACTIVITY,
            timerProgressBar: true,
            showCancelButton: true,
            confirmButtonText: 'Keep me logged in',
            cancelButtonText: 'Logout now',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                resetInactivityTimer();
            } else {
                logout();
            }
        });

        const countdownInterval = setInterval(() => {
            countdown--;
            const element = document.getElementById('inactivity-countdown');
            if (element && countdown >= 0) {
                element.textContent = countdown;
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    // Set up token expiration timer
    function setupTokenExpiration() {
        clearTimeout(tokenExpiryTimer);
        clearTimeout(warningTimer);

        const initialLoginTime = localStorage.getItem('initial-login-time');
        const currentTime = Date.now();
        
        // If no initial login time exists, set it
        if (!initialLoginTime) {
            localStorage.setItem('initial-login-time', currentTime.toString());
            localStorage.setItem('login-time', currentTime.toString());
        } else {
            // Calculate total session time including previous sessions
            const lastLogoutTime = localStorage.getItem('last-logout-time');
            const previousTime = lastLogoutTime ? parseInt(lastLogoutTime) - parseInt(initialLoginTime) : 0;
            const newLoginTime = currentTime - previousTime;
            localStorage.setItem('login-time', newLoginTime.toString());
        }

        const loginTime = localStorage.getItem('login-time');
        const elapsedTime = currentTime - loginTime;
        const remainingTime = TOKEN_LIFETIME - elapsedTime;

        if (remainingTime > 0) {
            // Set timer for warning
            warningTimer = setTimeout(showExpiryWarning, remainingTime - WARNING_BEFORE_EXPIRY);
            
            // Set timer for logout
            tokenExpiryTimer = setTimeout(logout, remainingTime);
            
            // Update last activity
            lastActivity = currentTime;
            localStorage.setItem('last-activity', lastActivity.toString());
        } else {
            // Token has already expired
            logout();
        }
    }

    // Reset inactivity timer on user activity
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        lastActivity = Date.now();
        localStorage.setItem('last-activity', lastActivity.toString());
        
        // Set warning timer
        inactivityTimer = setTimeout(() => {
            showInactivityWarning();
            // Set final logout timer
            setTimeout(() => {
                logout();
            }, WARNING_BEFORE_INACTIVITY);
        }, INACTIVITY_TIMEOUT - WARNING_BEFORE_INACTIVITY);
    }

    // Track user activity
    function setupActivityTracking() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetInactivityTimer, true);
        });
    }

    var init = function() {
        // Ensure Firebase is loaded
        if (typeof firebase === 'undefined') {
            console.error('Firebase not loaded');
            return;
        }
        
        // Show security notification on every page load
        showSecurityNotification();

        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log("stay");
                if (mainContainer) {
                    mainContainer.style.display = "";
                }
                // Broadcast login state to other tabs
                localStorage.setItem('auth-state-change', JSON.stringify({
                    isLoggedIn: true,
                    timestamp: Date.now()
                }));
                setupTokenExpiration();
                setupActivityTracking();
                resetInactivityTimer();
            } else {
                if (mainContainer) {
                    mainContainer.style.display = "none";
                }
                localStorage.removeItem('login-time');
                // Let authChecker handle the redirect
                if (!window.location.pathname.includes('login.html')) {
                    window.location.replace("../login.html");
                }
            }
        });
    };

    // Wait for document to be ready before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions globally
    mainApp.logout = logout;
    mainApp.checkAuth = function() {
        return firebase.auth().currentUser !== null;
    };
})();

// Create global logout button functionality
window.createLogoutButton = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!mainApp.checkAuth()) {
        window.location.replace("./login.html");
        return;
    }

    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.innerHTML = 'Logout';
    logoutBtn.onclick = mainApp.logout;
    
    container.appendChild(logoutBtn);
};