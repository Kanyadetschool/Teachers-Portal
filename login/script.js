import { authenticateTeacher } from './authService.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');
    const submitBtn = document.querySelector('.submit-btn');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // Form validation and submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            submitBtn.querySelector('span').style.opacity = '0';
            submitBtn.querySelector('.spinner').style.display = 'block';
            submitBtn.disabled = true;

            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            try {
                const user = await authenticateTeacher(email, password);
                const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo'));
                showSuccess(`Welcome back, ${teacherInfo.username}!`);
                
                setTimeout(() => {
                    window.location.href = '../dashboard/index.html';
                }, 1500);
            } catch (error) {
                showError(null, error.message);
                console.error('Login error:', error);
            }
        } finally {
            resetButton();
        }
    });

    // Simulate login API call
    function simulateLogin() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.5) {
                    resolve();
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1500);
        });
    }

    // Show error message
    function showError(input, message) {
        const notification = createNotification(message, 'error');
        document.body.appendChild(notification);
        
        if (input) {
            input.classList.add('error');
            input.addEventListener('input', () => {
                input.classList.remove('error');
            }, { once: true });
        }

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Show success message
    function showSuccess(message) {
        const notification = createNotification(message, 'success');
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Create notification element
    function createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add close button, message container, and timer for errors
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">×</button>
            </div>
            ${type === 'error' ? '<div class="notification-timer"></div>' : ''}
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            animation: slideIn 0.3s ease-out;
            z-index: 1000;
            min-width: 300px;
        `;

        // Add click handler for close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        });

        // Set timeout for auto-removal
        const timeout = type === 'error' ? 10000 : 3000; // 10 seconds for errors
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, timeout);

        return notification;
    }

    // Reset button state
    function resetButton() {
        submitBtn.querySelector('span').style.opacity = '1';
        submitBtn.querySelector('.spinner').style.display = 'none';
        submitBtn.disabled = false;
    }

    // Add floating animation to background elements
    document.querySelectorAll('.floating-element').forEach(element => {
        element.style.animation = `float ${15 + Math.random() * 10}s infinite`;
    });

    // Add particle background
    function createParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'dynamic-bg';
        document.body.appendChild(particleContainer);

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = Math.random() * 5 + 'px';
            particle.style.height = particle.style.width;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDuration = Math.random() * 3 + 2 + 's';
            particleContainer.appendChild(particle);
        }
    }

    // Enhanced security
    function enhanceSecurity() {
        const maxAttempts = 3;
        let attempts = 0;
        const cooldownTime = 30000; // 30 seconds
        
        return async function(credentials) {
            if (attempts >= maxAttempts) {
                const remainingTime = Math.ceil((localStorage.getItem('cooldownUntil') - Date.now()) / 1000);
                if (remainingTime > 0) {
                    throw new Error(`Too many attempts. Please wait ${remainingTime} seconds.`);
                }
                attempts = 0;
            }

            try {
                const result = await simulateLogin(credentials);
                attempts = 0;
                return result;
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) {
                    localStorage.setItem('cooldownUntil', Date.now() + cooldownTime);
                }
                throw error;
            }
        };
    }

    // Password strength checker
    function checkPasswordStrength(password) {
        const strengthMeter = {
            score: 0,
            feedback: []
        };

        if (password.length >= 8) strengthMeter.score++;
        if (/[A-Z]/.test(password)) strengthMeter.score++;
        if (/[a-z]/.test(password)) strengthMeter.score++;
        if (/[0-9]/.test(password)) strengthMeter.score++;
        if (/[^A-Za-z0-9]/.test(password)) strengthMeter.score++;

        return strengthMeter;
    }

    // Initialize advanced features
    document.addEventListener('DOMContentLoaded', () => {
        createParticles();
        const secureLogin = enhanceSecurity();

        // Add password strength indicator
        passwordInput.addEventListener('input', (e) => {
            const strength = checkPasswordStrength(e.target.value);
            const strengthBar = document.querySelector('.strength-bar');
            strengthBar.style.width = (strength.score * 20) + '%';
            strengthBar.style.backgroundColor = ['#ff4444', '#ffbb33', '#00C851', '#33b5e5', '#2BBBAD'][strength.score - 1];
        });
    });
});
