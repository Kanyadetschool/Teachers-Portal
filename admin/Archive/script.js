const autoScroll = () => {
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    let currentIndex = 0;

    const isMobile = window.innerWidth <= 480;
    const scrollInterval = isMobile ? 4000 : 3000;

    // Store interval ID to clear it on hover
    window.scrollInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % radioButtons.length;
        radioButtons[currentIndex].checked = true;
    }, scrollInterval);
};

// Add resize listener to handle orientation changes
window.addEventListener('resize', () => {
    // Reset any necessary styles or behaviors
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const button = card.querySelector('.redirect-btn');
        const info = card.querySelector('.redirect-info');
        if (button) button.style.opacity = '0';
        if (info) info.style.opacity = '0';
    });
});

const addHoverEffects = () => {
    const labels = document.querySelectorAll('label.card');
    const container = document.querySelector('.container');

    // Container hover handlers
    if (container) {
        container.addEventListener('mouseenter', () => clearInterval(window.scrollInterval));
        container.addEventListener('mouseleave', () => autoScroll());
    }

    labels.forEach((label) => {
        const radioId = label.getAttribute('for');
        const radioInput = document.getElementById(radioId);
        const targetUrl = label.getAttribute('data-url');

        label.addEventListener('mouseenter', () => {
            clearInterval(window.scrollInterval);
            if (radioInput) radioInput.checked = true;
        });

        const button = document.createElement('button');
        button.className = 'redirect-btn';
        button.textContent = 'Learn More';
        button.style.opacity = '0';
        button.style.position = 'absolute';
        
        const info = document.createElement('span');
        info.className = 'redirect-info';
        info.textContent = label.dataset.info;
        info.style.opacity = '0';

        label.appendChild(button);
        label.appendChild(info);

        // Hover effects
        label.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
            info.style.opacity = '1';
        });

        label.addEventListener('mouseleave', () => {
            button.style.opacity = '0';
            info.style.opacity = '0';
        });

        // Button click handler
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (targetUrl) {
                window.open(targetUrl, '_blank');
            }
        });
    });
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    autoScroll();
    addHoverEffects();
});
