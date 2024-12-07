async function launchAuthentication() {
    document.body.style.filter = "blur(5px)";
    document.getElementById('loadingSpinner').style.display = 'block';
    
    try {
        if (window.PublicKeyCredential && navigator.credentials && navigator.credentials.get) {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            
            const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
            if (!userEmail) {
                throw new Error("User email not found");
            }

            const publicKey = {
                challenge: challenge,
                timeout: 60000,
                userVerification: "required",
                rpId: window.location.hostname,
                allowCredentials: [],
                userHandle: new TextEncoder().encode(userEmail),
                user: {
                    id: new TextEncoder().encode(userEmail),
                    name: userEmail,
                    displayName: userEmail
                }
            };
            
            const assertion = await navigator.credentials.get({
                publicKey: publicKey
            });
            
            if (assertion) {
                console.log("WebAuthn Authentication successful:", assertion);
                document.body.style.filter = "none";
                document.getElementById('loadingSpinner').style.display = 'none';
            } else {
                throw new Error("WebAuthn authentication failed");
            }
        } else {
            throw new Error("WebAuthn is not available, falling back to password authentication");
        }
    } catch (error) {
        console.error("Authentication failed, reason:", error);
        
        document.body.style.filter = "none";
        document.getElementById('loadingSpinner').style.display = 'none';
        
        authenticateWithPassword();
    }
}

function authenticateWithPassword() {
    const validPassword = "securepassword123";
    const password = "userEnteredPassword";
    
    if (password === validPassword) {
        console.log("Password authentication successful.");
    } else {
        try {
            if (window.opener) {
                window.opener.focus();
            }
            
            try {
                window.close();
            } catch (closeError) {
                console.warn("Standard window.close() failed, trying alternative methods");
            }
            
            if (window.opener) {
                window.opener.postMessage('closeWindow', '*');
            }
            
            window.location.href = 'about:blank';
        } catch (error) {
            console.error("Failed to close window:", error);
            
            alert("Authentication failed. Please close this window manually.");
        }
    }
}

window.addEventListener('load', launchAuthentication);

window.addEventListener('message', (event) => {
    if (event.data === 'closeWindow') {
        window.close();
    }
}, false);