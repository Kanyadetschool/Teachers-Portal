// Ensure you have SweetAlert2 library imported in your HTML
// <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

// Sound configuration
const notificationSound = new Audio('./Audio/notification sound.mp3'); // Replace with your sound file path

var notifications = [
  '🎄 Happy Holidays! School opening  6-Jan 2025.',
  '🎉 Thanks for Mokos Community Day! Your support matters.',
  '🌍 Grade 6 Alaska maths project due 8-Jan 2025.',
  '📚 New books in the library!',
  '🍎 New lunch menu starts next year.',
  '🏫 School reopens6-Jan 2025.',
  '🏆 Music competition winners announced!',
  '🌳 Energy Conservation Week: Jun 5-9.',
  '📅 Exam schedule posted online.',
  '🗓️ Calendar updated, check website.',
  '🏆 Awards Ceremony: Jun 30/25, 6 PM.'
];

var notificationIndex = 0;

// Function to check notification viewing eligibility
function canShowNotifications() {
  const lastViewedTime = localStorage.getItem('notificationsLastViewed');
  
  if (!lastViewedTime) {
    return true; // Never viewed before
  }

  const currentTime = new Date().getTime();
  const timeSinceLastView = currentTime - parseInt(lastViewedTime);
  
  // 24 hours = 24 * 60 * 60 * 1000 milliseconds
  return timeSinceLastView >= 24 * 60 * 60 * 1000;
}

// Function to record notification viewing
function recordNotificationView() {
  localStorage.setItem('notificationsLastViewed', new Date().getTime().toString());
}

// Function to check if this is a page reload
function isPageReload() {
  return window.performance && performance.getEntriesByType('navigation')[0].type === 'reload';
}

// Function to show SweetAlert with auto-confirmation
function initializeNotifications() {
  // Check if notifications can be shown
  if (!canShowNotifications()) {
    Swal.fire({
      title: 'Notifications',
      text: 'You have recently viewed all notifications. Please check back in 24 hours.',
      icon: 'info',
      confirmButtonText: 'OK',
      timer: 100, // Auto-close the popup after 5 seconds
      timerProgressBar: true // Show a progress bar for the timer
    });
    return;
  }

  let timerInterval;
  let autoConfirmTimeout;

  const swalInstance = Swal.fire({
    title: 'School Notifications',
    html: 'Would you like to view recent school notifications? <br><small>Automatically viewing in <b>2</b> seconds.</small>',
    icon: 'info',
    confirmButtonText: 'View Notifications',
    cancelButtonText: 'Not Now',
    showCancelButton: true,
    didOpen: () => {
      const timer = Swal.getPopup().querySelector('b');
      
      // Countdown timer
      timerInterval = setInterval(() => {
        const secondsLeft = 2;
        timer.textContent = secondsLeft;
      }, 1000);

      // Auto-confirm after 2 seconds if no user action
      autoConfirmTimeout = setTimeout(() => {
        Swal.getConfirmButton().click(); // Simulate OK button click
      }, 2000);
    },
    willClose: () => {
      clearInterval(timerInterval);
      clearTimeout(autoConfirmTimeout);
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Record that notifications have been viewed
      recordNotificationView();
      // Start notification sequence
      displayNotification();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // User clicked Cancel - do nothing or handle as needed
      console.log('Notifications cancelled');
    }
  });
}

function displayNotification() {
  if (notificationIndex < notifications.length) {
    var notification = notifications[notificationIndex];
    
    // Play notification sound
    try {
      notificationSound.play()
        .catch(error => {
          console.warn('Sound play failed:', error);
        });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
    
    // Create toast notification
    var notificationElement = document.createElement("div");
    notificationElement.classList.add("toast");
    notificationElement.innerText = notification;
    document.body.appendChild(notificationElement);
    
    notificationElement.classList.add("toast-enter");
    setTimeout(function () {
      notificationElement.classList.remove("toast-enter");
      setTimeout(function () {
        notificationElement.classList.add("toast-exit");
        setTimeout(function () {
          notificationElement.remove();
          notificationIndex++;
          
          // Check if more notifications exist
          if (notificationIndex < notifications.length) {
            displayNotification(); // Display the next notification
          } 
          
          else {
            // All notifications shown
            Swal.fire({
              title: 'All Notifications Viewed',
              text: 'You have seen all current notifications.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
          }

        }, 1000); // Exit animation duration
      }, 20000); // Entrance duration
    }, 8000); //  Display animation duration
  }
}

// Start by showing the initial SweetAlert prompt
document.addEventListener('DOMContentLoaded', () => {
  // Check if it's a page reload
  if (isPageReload()) {
    // Delay SweetAlert by 8 seconds after page reload
    setTimeout(initializeNotifications, 8000);
  } else {
    // For initial page load, delay by 2 seconds
    setTimeout(initializeNotifications, 2000);
  }
});

// Optional: Add page reload detection for browsers that might not support performance.navigation
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    // Page was loaded from bfcache (back-forward cache)
    setTimeout(initializeNotifications, 8000);
  }
});