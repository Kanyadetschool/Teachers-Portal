
 document.addEventListener("DOMContentLoaded", function() {
  const loaderContainer = document.querySelector('.loading');
  const body = document.body;

  setTimeout(function() {
    loaderContainer.style.display = 'none';
    body.classList.remove('loading'); // Remove the loading class to remove blur

    // Show SweetAlert confirmation popup with a timer
    Swal.fire({
      title: 'Update Available',
      text: 'A new version of the application is available. Do you want to update now?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Yes, update now',
      cancelButtonText: 'Not now',
      timer: 5000, // Auto-close the popup after 5 seconds
      timerProgressBar: true // Show a progress bar for the timer
    }).then((result) => {
      if (result.isConfirmed) {
        // User clicked "Yes, update now", proceed with the update action
        Swal.fire({
          title: 'Updating...',
          text: 'The application is being updated.',
          icon: 'info',
          showConfirmButton: false // Hide the "OK" button
        });
        // Simulate update process (replace this with your actual update logic)
        setTimeout(function() {
          Swal.fire('Update Complete', 'The application has been updated successfully!', 'info');
        }, 3000); // Simulate a 3-second update process
      } else {
        // User clicked "Not now" or closed the popup
        Swal.fire('Update Cancelled', 'You can update later from the settings.', 'info');
      }
    });
  }, 2000); // 2 seconds
});




      