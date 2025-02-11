let next = document.querySelector('.next')
let prev = document.querySelector('.prev')
let autoScrollInterval;
let isAutoScrolling = false;

function nextSlide() {
    let items = document.querySelectorAll('.item')
    document.querySelector('.slide').appendChild(items[0])
}

function prevSlide() {
    let items = document.querySelectorAll('.item')
    document.querySelector('.slide').prepend(items[items.length - 1])
}

// Remove container hover events and add button hover events
const seeMoreButtons = document.querySelectorAll('.content button');

seeMoreButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        stopAutoScroll();
    });

    button.addEventListener('mouseleave', function() {
        startAutoScroll();
    });
});

function startAutoScroll() {
    if (!isAutoScrolling) {
        isAutoScrolling = true;
        autoScrollInterval = setInterval(nextSlide, 5000);
    }
}

function stopAutoScroll() {
    if (isAutoScrolling) {
        isAutoScrolling = false;
        clearInterval(autoScrollInterval);
    }
}

next.addEventListener('click', function(){
    stopAutoScroll();
    nextSlide();
})

prev.addEventListener('click', function(){
    stopAutoScroll();
    prevSlide();
})

// Start auto-scroll on page load
startAutoScroll();

// Optional: Add play/pause button event listener
document.addEventListener('keypress', function(e) {
    if (e.code === 'Space') {
        isAutoScrolling ? stopAutoScroll() : startAutoScroll();
    }
});