
document.addEventListener("DOMContentLoaded", function() {
    const loaderContainer = document.querySelector('.loading');
    const body = document.body;
  
    setTimeout(function() {
      loaderContainer.style.display = 'none';
      body.classList.remove('loading'); // Remove the loading class to remove blur
  
      // Show SweetAlert confirmation popup with a timer
      Swal.fire({
        title: '🧑‍⚕️ Loading complete',
        text: 'Loading... ',
        icon: 'info',
        showCancelButton: false,
        showConfirmButton:false,
        timer: 1000, // Auto-close the popup after 1 seconds
        timerProgressBar: true, // Show a progress bar for the timer
        allowOutsideClick: false, // Disable outside clicks
        allowEscapeKey: false // Disable escape key
        
      })
    },100); // 2 seconds
  });
  
  
  
  
        