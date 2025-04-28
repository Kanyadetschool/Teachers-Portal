// Configuration and constants
const AUTH_CONFIG = {
    hashAlgorithm: 'SHA-256',
    correctPasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // Hash for 'kaka'
    maxAttempts: 3,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes in milliseconds
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    apiEndpoint: 'https://api.example.com/auth',
    logEndpoint: 'https://api.example.com/logs',
    encryptionKey: 'fcda91af62c0fcf9c5e92b0cf7623a66', // 128-bit AES key in hex
    tokenRefreshInterval: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Utility functions
const AuthUtils = {
    // Advanced hashing with salt
    async hashPassword(password, salt = null) {
        const encoder = new TextEncoder();
        const saltValue = salt || crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(saltValue).map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Combine password with salt
        const combinedData = encoder.encode(password + saltHex);
        const hashBuffer = await crypto.subtle.digest(AUTH_CONFIG.hashAlgorithm, combinedData);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return { hash: hashHex, salt: saltHex };
    },
    
    // Generate secure token
    generateToken() {
        const tokenBuffer = crypto.getRandomValues(new Uint8Array(32));
        return Array.from(tokenBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    // AES encryption
    async encryptData(data, key = AUTH_CONFIG.encryptionKey) {
        const keyData = new Uint8Array(key.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const iv = crypto.getRandomValues(new Uint8Array(16));
        
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-CBC' },
            false,
            ['encrypt']
        );
        
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-CBC', iv },
            cryptoKey,
            dataBuffer
        );
        
        const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
        const ivArray = Array.from(iv);
        
        return {
            iv: ivArray.map(b => b.toString(16).padStart(2, '0')).join(''),
            data: encryptedArray.map(b => b.toString(16).padStart(2, '0')).join('')
        };
    },
    
    // Get browser fingerprint
    getBrowserFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.pixelDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            !!navigator.cookieEnabled,
            typeof window.sessionStorage !== 'undefined',
            typeof window.localStorage !== 'undefined',
            typeof window.indexedDB !== 'undefined',
            navigator.hardwareConcurrency || 'unknown',
            navigator.deviceMemory || 'unknown',
            navigator.platform || 'unknown'
        ];
        
        return this.hashSimple(components.join('###'));
    },
    
    // Simple non-async hash for fingerprinting
    hashSimple(input) {
        let hash = 0;
        if (input.length === 0) return hash.toString(16);
        
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return (hash >>> 0).toString(16);
    },
    
    // Log activity to server
    async logActivity(eventType, details) {
        const logData = {
            timestamp: new Date().toISOString(),
            eventType,
            details,
            fingerprint: this.getBrowserFingerprint(),
            sessionId: SessionManager.getSessionId(),
            geoData: await this.getGeoLocation(),
            userAgent: navigator.userAgent
        };
        
        try {
            const encryptedData = await this.encryptData(logData);
            
            await fetch(AUTH_CONFIG.logEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: encryptedData.data,
                    iv: encryptedData.iv,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
            // Store in localStorage for later sync
            const pendingLogs = JSON.parse(localStorage.getItem('pendingLogs') || '[]');
            pendingLogs.push(logData);
            localStorage.setItem('pendingLogs', JSON.stringify(pendingLogs));
        }
    },
    
    // Get geolocation data
    async getGeoLocation() {
        try {
            // Simulate API call for geolocation data - in production use a real service
            return {
                ip: '192.168.1.1',
                country: 'Unknown',
                city: 'Unknown'
            };
        } catch (error) {
            return {
                ip: 'unknown',
                country: 'unknown',
                city: 'unknown'
            };
        }
    }
};

// Session management
const SessionManager = {
    sessionId: null,
    
    initSession() {
        this.sessionId = AuthUtils.generateToken();
        localStorage.setItem('sessionId', this.sessionId);
        localStorage.setItem('sessionStart', Date.now().toString());
        
        // Set up session refresh
        this.setupTokenRefresh();
        
        // Set up activity monitoring
        ActivityMonitor.init();
    },
    
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = localStorage.getItem('sessionId');
        }
        return this.sessionId || 'no-session';
    },
    
    isSessionValid() {
        const sessionStart = parseInt(localStorage.getItem('sessionStart') || '0');
        const currentTime = Date.now();
        return (currentTime - sessionStart) < AUTH_CONFIG.sessionDuration;
    },
    
    setupTokenRefresh() {
        setInterval(() => {
            if (this.isSessionValid()) {
                // Refresh token logic
                const newToken = AuthUtils.generateToken();
                localStorage.setItem('authToken', newToken);
                AuthUtils.logActivity('token_refresh', { success: true });
            }
        }, AUTH_CONFIG.tokenRefreshInterval);
    },
    
    endSession() {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('sessionStart');
        localStorage.removeItem('authToken');
        this.sessionId = null;
        ActivityMonitor.stop();
        AuthUtils.logActivity('session_end', { reason: 'user_logout' });
    }
};

// Activity monitoring
const ActivityMonitor = {
    active: false,
    lastActivity: null,
    mousePositions: [],
    typingPatterns: [],
    typingTimer: null,
    lastKeyTimes: [],
    
    init() {
        if (this.active) return;
        
        this.active = true;
        this.lastActivity = Date.now();
        
        // Monitor mouse movement
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Monitor clicks
        document.addEventListener('click', this.handleClick.bind(this));
        
        // Monitor typing patterns
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Check for inactivity
        setInterval(this.checkInactivity.bind(this), 60000); // Check every minute
        
        AuthUtils.logActivity('monitoring_started', { timestamp: new Date().toISOString() });
    },
    
    handleMouseMove(event) {
        this.lastActivity = Date.now();
        
        // Sample mouse position every 500ms to avoid overwhelming data
        if (this.mousePositions.length === 0 || 
            (Date.now() - this.mousePositions[this.mousePositions.length - 1].time) > 500) {
            
            this.mousePositions.push({
                x: event.clientX,
                y: event.clientY,
                time: Date.now()
            });
            
            // Keep only the last 20 positions
            if (this.mousePositions.length > 20) {
                this.mousePositions.shift();
            }
        }
    },
    
    handleClick(event) {
        this.lastActivity = Date.now();
        
        AuthUtils.logActivity('user_click', {
            x: event.clientX,
            y: event.clientY,
            element: event.target.tagName,
            elementId: event.target.id || 'none'
        });
    },
    
    handleKeyDown(event) {
        this.lastActivity = Date.now();
        
        // Record keystroke timing for rhythm analysis
        const currentTime = Date.now();
        this.lastKeyTimes.push(currentTime);
        
        // Keep only last 20 keystrokes
        if (this.lastKeyTimes.length > 20) {
            this.lastKeyTimes.shift();
        }
        
        // Clear existing timer
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        // Set timer to analyze typing pattern after user stops typing
        this.typingTimer = setTimeout(() => {
            this.analyzeTypingPattern();
        }, 1000);
    },
    
    analyzeTypingPattern() {
        if (this.lastKeyTimes.length < 5) return;
        
        // Calculate intervals between keystrokes
        const intervals = [];
        for (let i = 1; i < this.lastKeyTimes.length; i++) {
            intervals.push(this.lastKeyTimes[i] - this.lastKeyTimes[i-1]);
        }
        
        // Basic statistical analysis
        const averageInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        
        this.typingPatterns.push({
            averageInterval,
            patternTime: Date.now(),
            keyCount: this.lastKeyTimes.length
        });
        
        // Keep only the last 10 patterns
        if (this.typingPatterns.length > 10) {
            this.typingPatterns.shift();
        }
        
        // Log unusual typing patterns (very fast or very slow)
        if (averageInterval < 50 || averageInterval > 500) {
            AuthUtils.logActivity('unusual_typing', { 
                averageInterval, 
                threshold: averageInterval < 50 ? 'too_fast' : 'too_slow' 
            });
        }
    },
    
    checkInactivity() {
        const inactiveTime = Date.now() - this.lastActivity;
        
        // Log if inactive for more than 5 minutes
        if (inactiveTime > 5 * 60 * 1000) {
            AuthUtils.logActivity('user_inactive', { inactiveTimeMs: inactiveTime });
            
            // If inactive for more than 30 minutes, end session
            if (inactiveTime > 30 * 60 * 1000) {
                SessionManager.endSession();
                showSessionExpiredPrompt();
            }
        }
    },
    
    getActivityReport() {
        return {
            lastActive: this.lastActivity,
            mousePositions: this.mousePositions.length,
            typingPatterns: this.typingPatterns,
            browserFingerprint: AuthUtils.getBrowserFingerprint()
        };
    },
    
    stop() {
        if (!this.active) return;
        
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('keydown', this.handleKeyDown);
        
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        
        this.active = false;
        this.mousePositions = [];
        this.typingPatterns = [];
        this.lastKeyTimes = [];
    }
};

// Attempt tracker
const AttemptTracker = {
    attempts: 0,
    lockoutUntil: 0,
    
    recordAttempt(success) {
        if (success) {
            // Reset on successful login
            this.attempts = 0;
            this.lockoutUntil = 0;
            localStorage.removeItem('authLockoutUntil');
            localStorage.removeItem('authAttempts');
        } else {
            // Increment attempts
            this.attempts++;
            localStorage.setItem('authAttempts', this.attempts.toString());
            
            // Check if should lock
            if (this.attempts >= AUTH_CONFIG.maxAttempts) {
                this.lockoutUntil = Date.now() + AUTH_CONFIG.lockoutDuration;
                localStorage.setItem('authLockoutUntil', this.lockoutUntil.toString());
                
                AuthUtils.logActivity('account_lockout', {
                    attempts: this.attempts,
                    duration: AUTH_CONFIG.lockoutDuration
                });
            }
        }
    },
    
    isLocked() {
        // Load from localStorage if not set
        if (this.lockoutUntil === 0) {
            const storedLockout = localStorage.getItem('authLockoutUntil');
            if (storedLockout) {
                this.lockoutUntil = parseInt(storedLockout);
            }
        }
        
        if (this.attempts === 0) {
            const storedAttempts = localStorage.getItem('authAttempts');
            if (storedAttempts) {
                this.attempts = parseInt(storedAttempts);
            }
        }
        
        return Date.now() < this.lockoutUntil;
    },
    
    getRemainingLockTime() {
        if (!this.isLocked()) return 0;
        return Math.ceil((this.lockoutUntil - Date.now()) / 1000);
    }
};

// UI Functions
function showPasswordPrompt() {
    // Check if locked out
    if (AttemptTracker.isLocked()) {
        showLockoutMessage();
        return;
    }
    
    // Check if session is already valid
    if (SessionManager.isSessionValid()) {
        proceedToApplication();
        return;
    }
    
    Swal.fire({
        title: 'Secure Authentication',
        html: `
            <div class="auth-container">
                <div class="auth-header">
                    <i class="fas fa-shield-alt"></i> Enterprise Security Portal
                </div>
                <div class="auth-body">
                    <p>Please enter your authentication credentials to proceed.</p>
                    <input id="auth-password" class="swal2-input" type="password" placeholder="Authentication Key">
                    <div class="password-strength-meter">
                        <div class="strength-bar"></div>
                    </div>
                </div>
                <div class="auth-footer">
                    <small>This system is protected and all activities are logged.</small>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Authenticate',
        cancelButtonText: 'Cancel',
        allowOutsideClick: false,
        allowEscapeKey: false,
        focusConfirm: false,
        customClass: {
            container: 'advanced-auth-container'
        },
        didOpen: () => {
            // Set up password input monitoring
            const passwordInput = document.getElementById('auth-password');
            const strengthBar = document.querySelector('.strength-bar');
            
            passwordInput.addEventListener('input', (e) => {
                // Simple visual feedback (not related to actual authentication)
                const value = e.target.value;
                
                // Update strength bar for visual effect only
                let strength = 0;
                if (value.length > 0) strength = 20;
                if (value.length > 5) strength += 20;
                if (/[A-Z]/.test(value)) strength += 20;
                if (/[0-9]/.test(value)) strength += 20;
                if (/[^A-Za-z0-9]/.test(value)) strength += 20;
                
                strengthBar.style.width = `${strength}%`;
                
                if (strength < 40) {
                    strengthBar.style.backgroundColor = '#ff4d4d';
                } else if (strength < 80) {
                    strengthBar.style.backgroundColor = '#ffa64d';
                } else {
                    strengthBar.style.backgroundColor = '#2ecc71';
                }
            });
            
            // Start activity monitoring
            ActivityMonitor.init();
            
            // Log authentication attempt
            AuthUtils.logActivity('auth_prompt_shown', {
                timestamp: new Date().toISOString(),
                fingerprint: AuthUtils.getBrowserFingerprint()
            });
        },
        preConfirm: async () => {
            const password = document.getElementById('auth-password').value;
            
            if (!password) {
                Swal.showValidationMessage('Authentication key cannot be empty');
                return false;
            }
            
            try {
                // Show processing animation
                Swal.showLoading();
                
                // Log attempt (but not the password itself)
                await AuthUtils.logActivity('auth_attempt', {
                    timestamp: new Date().toISOString(),
                    passwordLength: password.length
                });
                
                // Perform the hash verification
                const hashedInput = await AuthUtils.hashPassword(password);
                
                // Simulate network latency for security perception
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                if (hashedInput.hash !== AUTH_CONFIG.correctPasswordHash) {
                    // Record failed attempt
                    AttemptTracker.recordAttempt(false);
                    
                    // Calculate remaining attempts
                    const remainingAttempts = AUTH_CONFIG.maxAttempts - AttemptTracker.attempts;
                    
                    // Log the failure
                    await AuthUtils.logActivity('auth_failure', {
                        remainingAttempts: remainingAttempts,
                        attemptsBeforeLockout: AUTH_CONFIG.maxAttempts
                    });
                    
                    Swal.showValidationMessage(
                        `Authentication failed. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
                    );
                    return false;
                }
                
                // Record successful attempt
                AttemptTracker.recordAttempt(true);
                
                // Log success
                await AuthUtils.logActivity('auth_success', {
                    timestamp: new Date().toISOString()
                });
                
                // Create session
                SessionManager.initSession();
                
                return true;
            } catch (error) {
                console.error('Authentication error:', error);
                Swal.showValidationMessage(`Authentication process failed: ${error.message}`);
                return false;
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Show progress of system update
            showSystemUpdate();
        } else {
            // Handle cancellation
            showAccessDenied();
        }
    });
}

function showLockoutMessage() {
    const remainingSeconds = AttemptTracker.getRemainingLockTime();
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    Swal.fire({
        icon: 'error',
        title: 'Account Temporarily Locked',
        html: `
            <div class="lockout-message">
                <p>Too many failed authentication attempts.</p>
                <p>Please try again in ${minutes} minutes and ${seconds} seconds.</p>
                <div class="lockout-timer">${minutes}:${seconds.toString().padStart(2, '0')}</div>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Understood',
        allowOutsideClick: false,
        allowEscapeKey: false
    });
    
    // Log the lockout notification
    AuthUtils.logActivity('lockout_notification', {
        remainingTime: remainingSeconds,
        attempts: AttemptTracker.attempts
    });
}

function showSystemUpdate() {
    // Advanced system update animation
    Swal.fire({
        title: 'System Update in Progress',
        html: `
            <div class="update-container">
                <div class="update-progress-container">
                    <div class="update-progress-bar"></div>
                </div>
                <div class="update-status">Initializing system components...</div>
                <div class="update-details">
                    <div class="detail-item">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value status">Preparing</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Component:</span>
                        <span class="detail-value component">Core Services</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Progress:</span>
                        <span class="detail-value progress">0%</span>
                    </div>
                </div>
            </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            const progressBar = document.querySelector('.update-progress-bar');
            const statusText = document.querySelector('.update-status');
            const statusValue = document.querySelector('.detail-value.status');
            const componentValue = document.querySelector('.detail-value.component');
            const progressValue = document.querySelector('.detail-value.progress');
            
            const updateSteps = [
                { progress: 10, status: 'Initializing system components...', component: 'Core Services', delay: 400 },
                { progress: 25, status: 'Updating security modules...', component: 'Security Framework', delay: 600 },
                { progress: 40, status: 'Syncing databases...', component: 'Data Layer', delay: 800 },
                { progress: 60, status: 'Updating user interface...', component: 'Frontend Services', delay: 700 },
                { progress: 75, status: 'Optimizing performance...', component: 'Resource Management', delay: 500 },
                { progress: 90, status: 'Running final checks...', component: 'Validation Service', delay: 600 },
                { progress: 100, status: 'Update completed successfully!', component: 'All Systems', delay: 400 }
            ];
            
            let currentStep = 0;
            
            const updateProgress = () => {
                if (currentStep >= updateSteps.length) {
                    // All steps completed, show completion screen
                    setTimeout(() => {
                        showUpdateComplete();
                    }, 500);
                    return;
                }
                
                const step = updateSteps[currentStep];
                
                // Update progress bar and text
                progressBar.style.width = `${step.progress}%`;
                statusText.textContent = step.status;
                statusValue.textContent = step.progress < 100 ? 'In Progress' : 'Complete';
                componentValue.textContent = step.component;
                progressValue.textContent = `${step.progress}%`;
                
                // Log update progress
                AuthUtils.logActivity('system_update_progress', {
                    step: currentStep + 1,
                    totalSteps: updateSteps.length,
                    component: step.component,
                    progress: step.progress
                });
                
                currentStep++;
                
                // Schedule next step
                setTimeout(updateProgress, step.delay);
            };
            
            // Start the update process
            setTimeout(updateProgress, 500);
        }
    });
}

function showUpdateComplete() {
    Swal.fire({
        icon: 'success',
        title: 'System Update Complete',
        text: 'All components have been successfully updated.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then(() => {
        // Proceed to application
        proceedToApplication();
    });
    
    // Log update completion
    AuthUtils.logActivity('system_update_complete', {
        timestamp: new Date().toISOString(),
        sessionId: SessionManager.getSessionId()
    });
}

function proceedToApplication() {
    // Final welcome screen
    Swal.fire({
        icon: 'info',
        title: 'Welcome to Advanced System',
        html: `
            <div class="welcome-container">
                <p>Authentication successful. You now have full access to the system.</p>
                <div class="session-info">
                    <div class="info-item">
                        <span class="info-label">Session ID:</span>
                        <span class="info-value">${SessionManager.getSessionId().substr(0, 8)}...</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Access Level:</span>
                        <span class="info-value">Administrator</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">System Status:</span>
                        <span class="info-value">Operational</span>
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: 'Continue to System',
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then(() => {
        // Here you would typically redirect to the actual application
        // For demo purposes, we'll just show a console message
        console.log('Application started with session ID:', SessionManager.getSessionId());
    });
    
    // Log successful entry to application
    AuthUtils.logActivity('application_access', {
        timestamp: new Date().toISOString(),
        sessionId: SessionManager.getSessionId(),
        activityReport: ActivityMonitor.getActivityReport()
    });
}

function showAccessDenied() {
    Swal.fire({
        title: 'Access Denied',
        html: `
            <div class="access-denied-container">
                <p>You do not have clearance to access this system.</p>
                <p>This incident has been logged and reported to security personnel.</p>
            </div>
        `,
        icon: 'error',
        showCancelButton: true,
        cancelButtonText: 'Override Security Protocol',
        confirmButtonText: 'Try Again',
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then((accessResult) => {
        if (accessResult.isConfirmed) {
            // Try again
            showPasswordPrompt();
            
            // Log retry attempt
            AuthUtils.logActivity('auth_retry', {
                timestamp: new Date().toISOString(),
                previousFailures: AttemptTracker.attempts
            });
        } else {
            // Show security breach warning
            showSecurityBreachWarning();
            
            // Log override attempt
            AuthUtils.logActivity('security_override_attempt', {
                timestamp: new Date().toISOString(),
                severity: 'high'
            });
        }
    });
}

function showSecurityBreachWarning() {
    Swal.fire({
        title: 'SECURITY ALERT',
        html: `
            <div class="security-breach-container">
                <div class="blinking-warning">⚠️ SECURITY BREACH DETECTED ⚠️</div>
                <p>Unauthorized access attempt has been detected and logged.</p>
                <p>Your system information has been recorded:</p>
                <div class="system-info">
                    <div class="info-row">IP Address: [Redacted for Security]</div>
                    <div class="info-row">Device ID: ${AuthUtils.getBrowserFingerprint().substr(0, 8)}...</div>
                    <div class="info-row">Timestamp: ${new Date().toISOString()}</div>
                </div>
                <p class="countdown-text">System lockdown in <span class="countdown">5</span> seconds...</p>
            </div>
        `,
        icon: 'warning',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            // Start countdown
            let countdown = 5;
            const countdownElement = document.querySelector('.countdown');
            
            const timer = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(timer);
                    
                    // Create flashing effect
                    document.body.classList.add('security-flash');
                    setTimeout(() => {
                        // Attempt to close window - will only work if opened via window.open()
                        window.close();
                        
                        // Fallback if window doesn't close
                        setTimeout(() => {
                            document.body.classList.remove('security-flash');
                            showFinalWarning();
                        }, 1000);
                    }, 1000);
                }
            }, 1000);
        }
    });
    
    // Add CSS for blinking and flashing effects
    const style = document.createElement('style');
    style.textContent = `
        .blinking-warning {
            animation: blink 1s infinite;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #ff0000;
        }
        
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .security-flash {
            animation: flash 0.2s 5;
        }
        
        @keyframes flash {
            0% { background-color: #ffffff; }
            50% { background-color: #ff0000; }
            100% { background-color: #ffffff; }
        }
        
        .system-info {
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            padding: 10px;
            margin: 10px 0;
            font-family: monospace;
            text-align: left;
        }
        
        .countdown-text {
            margin-top: 1rem;
            font-weight: bold;
        }
        
        .countdown {
            color: #ff0000;
            font-size: 1.2rem;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
    
    // Log security breach warning
    AuthUtils.logActivity('security_breach_warning', {
        timestamp: new Date().toISOString(),
        severity: 'critical',
        fingerprint: AuthUtils.getBrowserFingerprint()
    });
}

function showFinalWarning() {
    Swal.fire({
        title: 'System Locked',
        text: 'This security incident has been reported to the administrator.',
        icon: 'error',
        confirmButtonText: 'Acknowledge',
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then(() => {
        // Redirect to a secure page or reload
        window.location.reload();
    });
}

function showSessionExpiredPrompt() {
    Swal.fire({
        title: 'Session Expired',
        text: 'Your session has expired due to inactivity. Please authenticate again to continue.',
        icon: 'warning',
        confirmButtonText: 'Authenticate',
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then(() => {
        showPasswordPrompt();
    });
}

// Initialization - Add some styling
const initStyles = document.createElement('style');
initStyles.textContent = `
    .auth-container {
        text-align: center;
        padding: 10px;
    }
    
    .auth-header {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 15px;
        color: #2c3e50;
    }
    
    .auth-body {
        margin-bottom: 15px;
    }
    
    .auth-footer {
        font-size: 0.8rem;
        color: #7f8c8d;
    }
    
    .password-strength-meter {
        height: 5px;
        background-color: #ecf0f1;
        margin: 10px 0;
        border-radius: 3px;
        overflow: hidden;
    }
    
    .strength-bar {
        height: 100%;
        width: 0;
        background-color: #2ecc71;
        transition: width 0.3s, background-color 0.3s;
    }
    
    .update-container {
        padding: 10px;
    }
    
    .update-progress-container {
        height: 10px;
        background-color: #ecf0f1;
        border-radius: 5px;
        margin: 15px 0;
        overflow: hidden;
    }
    
    .update-progress-bar {
        height: 100%;
        width: 0;
        background-color: #3498db;
        transition: width 0.4s ease-in-out;
    }
    
    .update-status {
        margin: 10px 0;
        font-weight: bold;
    }
    
    .update-details {
        background-color: #f8f8f8;
        border: 1px solid #ddd;
        padding: 10px;
        margin-top: 15px;
        text-align: left;
    }
    
    .detail-item {
        margin: 5px 0;
    }
    
    .detail-label {
        font-weight: bold;
        display: inline-block;
        width: 100px;
    }
    
    .welcome-container, .access-denied-container {
        text-align: center;
        padding: 10px;
    }
    
    .session-info {
        background-color: #f8f8f8;
        border: 1px solid #ddd;
        padding: 10px;
        margin: 15px 0;
        text-align: left;
    }
    
    .info-item {
        margin: 5px 0;
    }
    
    .info-label {
        font-weight: bold;
        display: inline-block;
        width: 120px;
    }
    
    .lockout-message {
        text-align: center;
    }
    
    .lockout-timer {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 15px 0;
        color: #e74c3c;
    }
`;
document.head.appendChild(initStyles);

// Initialize and start the authentication process
function initAuthentication() {
    // Load previous attempt data
    const storedAttempts = localStorage.getItem('authAttempts');
    if (storedAttempts) {
        AttemptTracker.attempts = parseInt(storedAttempts);
    }
    
    const storedLockout = localStorage.getItem('authLockoutUntil');
    if (storedLockout) {
        AttemptTracker.lockoutUntil = parseInt(storedLockout);
    }
    
    // Check for existing session
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
        SessionManager.sessionId = sessionId;
        
        // Validate session
        if (SessionManager.isSessionValid()) {
            ActivityMonitor.init();
            AuthUtils.logActivity('session_resumed', {
                timestamp: new Date().toISOString(),
                sessionId: sessionId
            });
        }
    }
    
    // Start authentication flow
    showPasswordPrompt();
}

// Start the authentication process
initAuthentication();