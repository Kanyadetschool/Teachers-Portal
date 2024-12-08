
// Content Security Policy configuration
const metaCSP = document.createElement('meta');
metaCSP.setAttribute('http-equiv', 'Content-Security-Policy');
metaCSP.setAttribute('content', `
    default-src 'self' 
    https://apis.google.com 
    https://www.gstatic.com 
    https://www.googleapis.com 
    https://www.google.com 
    https://kanyadet-school.firebaseapp.com;
    https://conversations-widget.brevo.com/brevo-conversations.js
    script-src 'self' 'unsafe-inline' 'unsafe-eval' 
    https://apis.google.com 
    https://www.gstatic.com 
    https://www.googleapis.com 
    https://www.google.com 
    https://recaptcha.net 
    https://www.google.com/recaptcha/;
    connect-src 'self' 
    https://identitytoolkit.googleapis.com 
    https://www.googleapis.com 
    https://securetoken.googleapis.com 
    https://oauth2.googleapis.com 
    https://kanyadet-school.firebaseapp.com;
    img-src 'self' data: https:;
    frame-src 'self' 
    https://www.google.com/recaptcha/ 
    https://kanyadet-school.firebaseapp.com;
`);
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