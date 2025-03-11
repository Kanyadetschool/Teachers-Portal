
let startY;
let pullThreshold = 10; // Amount of pixels to pull before triggering refresh
let isPulling = false;

document.addEventListener('touchstart', (e) => {
    // Only enable pull-to-refresh when at top of page
    if (window.scrollY === 0) {
        startY = e.touches[0].pageY;
        isPulling = true;
    }
});

document.addEventListener('touchmove', (e) => {
    if (!isPulling) return;

    const currentY = e.touches[0].pageY;
    const pullDistance = currentY - startY;

    // Only handle pulling down
    if (pullDistance > 0) {
        // Add visual feedback
        document.body.style.transform = `translateY(${Math.min(pullDistance / 2, pullThreshold)}px)`;
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', () => {
    if (!isPulling) return;
    
    const pullDistance = parseInt(document.body.style.transform.replace('translateY(', ''));
    
    // Reset position with animation
    document.body.style.transition = 'transform 0.3s ease-out';
    document.body.style.transform = '';
    
    // If pulled far enough, reload the page
    if (pullDistance >= pullThreshold) {
        location.reload();
    }
    
    // Reset states
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
    isPulling = false;
});
