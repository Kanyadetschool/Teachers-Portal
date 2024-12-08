// Advanced Web Security Prevention Script
(() => {
    'use strict';

    // Cryptographically secure random token generation
    const generateSecureToken = () => {
        const array = new Uint32Array(4);
        crypto.getRandomValues(array);
        return Array.from(array, x => x.toString(16)).join('');
    };

    // Enhanced context protection
    const contextProtection = () => {
        const secureToken = generateSecureToken();
        
        // Disable right-click context menu with additional tracking
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            console.warn(`Unauthorized context menu attempt: ${secureToken}`);
        }, { capture: true });
    };
const keyboardProtection = () => {
    const blockedKeys = ['F12', 'I', 'J', 'U', 'C'];
    const keySignature = generateSecureToken();

    // Add multiple event listeners to increase chances of prevention
    ['keydown', 'keyup', 'keypress'].forEach(eventType => {
        document.addEventListener(eventType, (event) => {
            // More comprehensive key combination blocking
            const isBlockedKeyCombo = 
                event.key === 'F12' || 
                (event.ctrlKey && blockedKeys.includes(event.key)) ||
                (event.ctrlKey && event.shiftKey && ['I', 'C', 'J'].includes(event.key)) || 
                (event.metaKey && event.altKey);

            if (isBlockedKeyCombo) {
                event.preventDefault();
                event.stopPropagation();
                
                // Stronger prevention
                window.stop();
                
                alert(`Security block: ${keySignature}`);
                
                // Attempt to close any opened DevTools
                try {
                    if (window.console && console.clear) {
                        console.clear();
                    }
                } catch {}
            }
        }, { capture: true });
    });
};
    // Enhanced DevTools Detection Mechanism
    const devToolsDetection = () => {
        const detectToken = generateSecureToken();
        
        // Original Image-based DevTools Detection
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function () {
                forceCloseWindow(detectToken);
            }
        });
        console.log('%c', element);

        // Enhanced Aggressive DevTools Check
        let devToolsOpen = false;
        const detectWithDebugger = () => {
            const start = performance.now();
            debugger;
            const end = performance.now();

            if (end - start > 100) {
                devToolsOpen = true;
                forceCloseWindow(detectToken);
            }
        };
        
        // More frequent checking - every 500ms instead of 1000ms
        setInterval(detectWithDebugger, 500);

        // Additional detection method using window.outerWidth
        setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
            if (widthThreshold || heightThreshold) {
                forceCloseWindow(detectToken);
            }
        }, 1000);
    };

    // New aggressive window closing function
    const forceCloseWindow = (token) => {
        // Log attempt
        console.warn(`DevTools detected! Token: ${token}`);
        
        // Multiple closure attempts
        try {
            // Clear all intervals
            let id = window.setTimeout(() => {}, 0);
            while (id--) {
                window.clearTimeout(id);
                window.clearInterval(id);
            }

            // Clear storage
            localStorage.clear();
            sessionStorage.clear();

            // Multiple closure methods
            window.close();
            window.open('', '_self').close();
            window.location.href = 'about:blank';
            
            // Force reload as last resort
            window.location.replace('about:blank');
            window.location.reload(true);
            
            // Crash tab attempt
            while(true) {
                window.location.reload();
            }
        } catch (e) {
            window.location.href = 'about:blank';
        }
    };

    // Prevention Mechanisms
    const preventionMechanisms = () => {
        // Prevent dragging of elements
        document.addEventListener('dragstart', (event) => event.preventDefault(), { capture: true });

        // Prevent selecting text
        document.addEventListener('selectstart', (event) => event.preventDefault(), { capture: true });
    };

    // Advanced Console Obfuscation
    const consoleObfuscation = () => {
        const methods = ['log', 'warn', 'info', 'error', 'table', 'clear'];
        const obfuscationToken = generateSecureToken();

        methods.forEach((method) => {
            const originalMethod = console[method];
            console[method] = () => {
                // Silently log blocked console attempts
                try {
                    window.localStorage.setItem('consoleBlockLog', JSON.stringify({
                        method,
                        timestamp: Date.now(),
                        token: obfuscationToken
                    }));
                } catch {}
            };
        });

        // Enhanced toString protection
        window.toString = () => {
            alert(`Console usage blocked: ${obfuscationToken}`);
            return '';
        };
    };

    // Iframe and Embedding Protection
    const iframeProtection = () => {
        if (window.top !== window.self) {
            alert('Embedding in iframes is disabled.');
            window.top.location = window.self.location;
        }
    };

    // Advanced Tampering Detection
    const tamperingProtection = () => {
        const protect = document.createElement('div');
        const tamperToken = generateSecureToken();

        Object.defineProperty(protect, 'id', {
            get: function () {
                // Enhanced error throwing with unique signature
                throw new Error(`Tampering detected! Security Token: ${tamperToken}`);
            }
        });

        // Continuous monitoring with randomized interval
        const randomInterval = Math.floor(Math.random() * (1500 - 800 + 1)) + 800;
        setInterval(() => console.log(protect), randomInterval);
    };

    // Initialize all protection mechanisms
    const initializeSecurityProtections = () => {
        try {
            contextProtection();
            keyboardProtection();
            devToolsDetection();
            preventionMechanisms();
            consoleObfuscation();
            iframeProtection();
            tamperingProtection();
        } catch (error) {
            // Fallback error handling
            console.error('Security initialization failed', error);
        }
    };

    // Initialize protections when script loads
    initializeSecurityProtections();
})();