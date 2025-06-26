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
    const audioPath = type === 'error' ? '../audio/warning.mp3' : '../audio/notification.mp3';
    const audio = new Audio(audioPath);
    audio.volume = NOTIFICATION_VOLUME;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

function showNotification(title, message) {
    console.log('Attempting to show notification:', title, message);

    // Play notification sound
    try {
        const audio = new Audio('../audio/notification.mp3');
        audio.volume = NOTIFICATION_VOLUME;
        audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.error('Audio error:', e);
    }

    // Check if the browser supports notifications
    if (!("Notification" in window)) {
        alert(message);
        return;
    }

    // Check if permission is already granted
    if (Notification.permission === "granted") {
        const options = {
            body: message,
            icon: '../images/logo.png',
            requireInteraction: false,
            vibrate: [200, 100, 200],
            silent: false,
            tag: 'notification-' + Date.now() // Unique tag to prevent interference
        };
        
        try {
            const notification = new Notification(title, options);
            const timeoutId = setTimeout(() => notification.close(), NOTIFICATION_TIMEOUT);
            handleNotification(notification, timeoutId);
        } catch (e) {
            console.error('Notification creation failed:', e);
            alert(message);
        }
    } else {
        // Handle permission request or denial
        Notification.requestPermission()
            .then(permission => {
                if (permission === "granted") {
                    showNotification(title, message);
                } else {
                    alert(message);
                }
            });
    }
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

// FirebaseUI config
var uiConfig = {
    signInFlow: 'popup',  // Change to 'redirect' to handle cross-origin issues
    signInSuccessUrl: 'Firewal2/loginwindow2.html',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        // firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // Uncomment the following lines if you want to support additional sign-in providerszz
       // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
       // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    ],
    tosUrl: './terms.html',
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            // User successfully signed in
            return true; // Return false to prevent redirect
        }
    }
};

// Initialize the FirebaseUI Widget using Firebase
var ui = new firebaseui.auth.AuthUI(firebase.auth());

// Handle traditional email/password login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const resetBtn = document.getElementById('resetPasswordBtn');

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            resetBtn.style.display = 'none';
            persistAuthState(userCredential.user);
            
            // Get user display name with fallback
            const userName = userCredential.user?.displayName || 
                            userCredential.user?.email?.split('@')[0] || 
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
            resetBtn.style.display = 'block';
            
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

// Start the UI for other authentication methods
if (document.getElementById('firebaseui-auth-container')) {
    ui.start('#firebaseui-auth-container', uiConfig);
}

// Add auth state listener
firebase.auth().onAuthStateChanged((user) => {
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