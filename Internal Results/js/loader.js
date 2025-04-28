
document.addEventListener("DOMContentLoaded", function() {
    const loaderContainer = document.querySelector('.loading');
    const body = document.body;
  
    setTimeout(function() {
      loaderContainer.style.display = 'none';
      body.classList.remove('loading'); // Remove the loading class to remove blur
  
      // Show SweetAlert confirmation popup with a timer
      Swal.fire({
        title: 'Your can now Search and Download ',
        text: 'Specific Student Internal Assessments outcomes 😉 ',
        icon: 'info',
        showCancelButton: false,
        showConfirmButton:false,
        timer: 5000, // Auto-close the popup after 5 seconds
        timerProgressBar: true, // Show a progress bar for the timer
        allowOutsideClick: false, // Disable outside clicks
        allowEscapeKey: false // Disable escape key
        
      })
    },500); // 2 seconds
  });
  
  
  
  
        