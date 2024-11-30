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

    // Advanced keyboard interception
    const keyboardProtection = () => {
        const blockedKeys = ['F12', 'I', 'J', 'U', 'C'];
        const keySignature = generateSecureToken();

        document.addEventListener('keydown', (event) => {
            const isBlockedKeyCombo = 
                event.key === 'F12' || 
                (event.ctrlKey && blockedKeys.includes(event.key)) ||
                (event.ctrlKey && event.shiftKey && ['I', 'C', 'J'].includes(event.key)) || 
                (event.metaKey && event.altKey);

            if (isBlockedKeyCombo) {
                event.preventDefault();
                event.stopPropagation();
                alert(`Security block: ${keySignature}`);
                
                // Enhanced logging mechanism
                try {
                    // Attempt to log blocked key event securely
                    const blockLog = {
                        timestamp: Date.now(),
                        signature: keySignature,
                        event: {
                            key: event.key,
                            ctrlKey: event.ctrlKey,
                            shiftKey: event.shiftKey,
                            metaKey: event.metaKey
                        }
                    };
                    window.localStorage.setItem('keyBlockLog', JSON.stringify(blockLog));
                } catch (e) {
                    // Fallback error handling
                    console.error('Logging failed', e);
                }
            }
        }, { capture: true });
    };

    // Enhanced DevTools Detection Mechanism
    const devToolsDetection = () => {
        const detectToken = generateSecureToken();

        // Original Image-based DevTools Detection
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function () {
                alert(`Developer tools detected! ${detectToken}`);
                setTimeout(() => window.location.reload(), 100);
            }
        });
        console.log('%c', element);

        // Advanced Continuous DevTools Check
        let devToolsOpen = false;
        const detectWithDebugger = () => {
            const start = performance.now();
            debugger;
            const end = performance.now();

            if (end - start > 100) {
                devToolsOpen = true;
                alert(`Developer tools detected! Security Token: ${detectToken}`);
                setTimeout(() => window.location.reload(), 100);
            }
        };
        setInterval(detectWithDebugger, 1000);
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