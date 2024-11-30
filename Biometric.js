// Enhanced Authentication with Strict Window Closure
async function launchAuthentication() {
    // Aggressive window closure mechanism
    function forceWindowClose() {
        try {
            // Multiple aggressive closing techniques
            if (window.opener) {
                window.opener.postMessage('FORCE_CLOSE', '*');
            }

            // Immediate window destruction methods
            window.open('', '_self').close();
            
            if (window.close) {
                window.close();
            }

            // Low-level DOM manipulation
            window.document.body.innerHTML = '';
            window.document.close();

            // Programmatic window termination
            if (window.parent) {
                window.parent.postMessage('CLOSE_WINDOW', '*');
            }

            // Multiple redirection attempts
            try {
                window.location.href = 'chrome://';
                window.location.replace('chrome://');
            } catch {}

            // Final fallback: attempt to destroy window reference
            window = null;
        } catch (error) {
            console.error('Force close attempt failed:', error);
        }
    }

    try {
        const authResult = await attemptAuthentication();

        if (authResult.success) {
            // If successful, do nothing - stay on current page
            console.log('Authentication successful');
        } else {
            // Immediately force close on failure
            forceWindowClose();
        }
    } catch {
        // Force close on any unexpected error
        forceWindowClose();
    }
}

// Comprehensive authentication attempt
async function attemptAuthentication() {
    try {
        // Ensure Google Sign-In resources are loaded
        await loadGoogleSignInResources();

        // WebAuthn or password authentication logic
        if (window.PublicKeyCredential) {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const publicKey = {
                challenge: challenge,
                rp: { name: "Secure Authentication" },
                user: {
                    id: new Uint8Array(16),
                    name: "user@example.com",
                    displayName: "User"
                },
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 },
                    { type: "public-key", alg: -257 }
                ],
                timeout: 30000
            };

            try {
                const credential = await navigator.credentials.create({ publicKey });
                return { success: !!credential };
            } catch {
                return await passwordAuthentication();
            }
        }

        return await passwordAuthentication();
    } catch {
        return { success: false };
    }
}

// Password authentication with strict closure
async function passwordAuthentication() {
    const password = document.getElementById('passwordInput').value;
    
    try {
        const response = await fetch('/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const result = await response.json();
        
        if (!result.success) {
            // Immediate force close on invalid credentials
            setTimeout(() => {
                try {
                    // Multiple aggressive window closure methods
                    if (window.opener) {
                        window.opener.postMessage('FORCE_CLOSE', '*');
                    }
                    window.close();
                    window.open('', '_self').close();
                } catch {}
            }, 50);

            return { success: false };
        }

        return result;
    } catch {
        return { success: false };
    }
}

// Global message listener for cross-window communication
window.addEventListener('message', (event) => {
    if (event.data === 'FORCE_CLOSE' || event.data === 'CLOSE_WINDOW') {
        try {
            window.close();
            window.open('', '_self').close();
        } catch {}
    }
}, false);

// Content Security Policy configuration
const metaCSP = document.createElement('meta');
metaCSP.setAttribute('http-equiv', 'Content-Security-Policy');
metaCSP.setAttribute('content', "default-src 'self' https://apis.google.com https://www.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline';");
document.head.appendChild(metaCSP);

// Google Sign-In resources loader
function loadGoogleSignInResources() {
    return new Promise((resolve, reject) => {
        const platformScript = document.createElement('script');
        platformScript.src = 'https://apis.google.com/js/platform.js';
        platformScript.async = true;
        platformScript.defer = true;
        platformScript.onload = () => {
            // Retry rendering Google Sign-In button
            setTimeout(() => {
                try {
                    if (window.gapi && window.gapi.signin2) {
                        window.gapi.signin2.render('google-signin-container', {
                            'scope': 'profile email',
                            'width': 240,
                            'height': 50,
                            'longtitle': true,
                            'theme': 'dark'
                        });
                    }
                } catch {}
                resolve();
            }, 500);
        };
        platformScript.onerror = reject;
        document.head.appendChild(platformScript);
    });
}

// Auto-trigger authentication
window.addEventListener('load', () => {
    // Disable browser's default close prevention
    window.onbeforeunload = null;
    launchAuthentication();
});

// Prevent browser from blocking close
window.onbeforeunload = null;