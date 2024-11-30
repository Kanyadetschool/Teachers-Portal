// Auto-launch WebAuthn and fallback to password authentication on failure
async function launchAuthentication() {
    // Blur the background
    document.body.style.filter = "blur(5px)";

    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';

    try {
        // Check if WebAuthn is supported
        if (window.PublicKeyCredential && navigator.credentials && navigator.credentials.create) {
            // Generate a random challenge for WebAuthn
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            // WebAuthn options
            const publicKey = {
                challenge: challenge,
                rp: { name: "Your Website Name" },
                user: {
                    id: new Uint8Array(16),
                    name: "user@example.com",
                    displayName: "User's Full Name"
                },
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 },
                    { type: "public-key", alg: -257 }
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform", // This can be 'cross-platform' for external security keys
                    userVerification: "required"
                },
                timeout: 60000,
                attestation: "none"
            };

            // Attempt WebAuthn authentication
            const credential = await navigator.credentials.create({ publicKey });

            if (credential) {
                console.log("WebAuthn Authentication successful:", credential);
                // Restore the background and hide the spinner
                document.body.style.filter = "none";
                document.getElementById('loadingSpinner').style.display = 'none';
            } else {
                throw new Error("WebAuthn authentication failed");
            }
        } else {
            // WebAuthn is not available, fallback to password authentication
            throw new Error("WebAuthn is not available, falling back to password authentication");
        }
    } catch (error) {
        console.error("Authentication failed, reason:", error);

        // Hide spinner and restore the background after failure
        document.body.style.filter = "none";
        document.getElementById('loadingSpinner').style.display = 'none';

        // Automatically attempt password authentication after WebAuthn failure
        authenticateWithPassword();
    }
}

// Simulated password authentication logic (for demo purposes)
function authenticateWithPassword() {
    // Dummy password verification (replace with your backend authentication)
    const validPassword = "securepassword123"; // Example password
    const password = "userEnteredPassword"; // This would come from user input in a real scenario

    if (password === validPassword) {
        console.log("Password authentication successful.");
    } else {
        // No SweetAlert. Just auto-close the window if password is incorrect
        window.close();
    }
}

// Auto-launch authentication on page load
window.addEventListener('load', launchAuthentication);
