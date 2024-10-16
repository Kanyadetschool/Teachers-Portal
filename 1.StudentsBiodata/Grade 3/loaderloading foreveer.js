document.addEventListener("DOMContentLoaded", function() {
    const loaderContainer = document.createElement('div');
    loaderContainer.classList.add('loader-container');
    const loader = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // Add your SVG code here for the loader
    loaderContainer.appendChild(loader);
    document.body.appendChild(loaderContainer);
  
    setTimeout(function() {
      loaderContainer.remove();
      document.body.classList.remove('loading'); // Remove the loading class to remove blur
      // Show SweetAlert confirmation popup with a timer
      Swal.fire({
        title: 'Updates Underway',
        text: 'A new version of the application is being launched by Mr. Oduor. Do you want to bypass it now?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Not now',
        timer: 8000, // Auto-close the popup after 5 seconds
        timerProgressBar: true, // Show a progress bar for the timer
        allowOutsideClick: false, // Prevent clicking outside the popup to close it
        allowEscapeKey: false // Prevent pressing the Escape key to close the popup
      }).then((result) => {
        if (result.isConfirmed) {
          // User clicked "Yes, update now", proceed with the update action
          Swal.fire({
            title: 'Enabling Distro Prototype bypass',
            text: 'Npm Run bypass\ Mr oduor Protocal Updatings.Maxc...',
            icon: 'info',
            showConfirmButton: false, // Hide the "OK" button
            allowOutsideClick: false, // Prevent clicking outside the popup to close it
            allowEscapeKey: false // Prevent pressing the Escape key to close the popup
          });
          // Simulate update process (replace this with your actual update logic)
          setTimeout(function() {
            Swal.fire({
              title: 'Warning',
              text: 'This Process Has been Halted by Mr. Oduor',
              icon: 'warning',
              timer: 2000, // Auto-close the popup after 2 seconds
              timerProgressBar: true, // Show a progress bar for the timer
              allowOutsideClick: false, // Prevent clicking outside the popup to close it
              allowEscapeKey: false // Prevent pressing the Escape key to close the popup
            }).then(() => {
              window.close(); // Close the current window after displaying the warning for a short delay
            });
          }, 5000); // Simulate a 5-second update process
        } else {
          // User clicked "Not now" or closed the popup
          Swal.fire({
            title: 'Update Cancelled',
            text: 'You can update later from the settings.',
            icon: 'info',
            timer: 2000, // Auto-close the popup after 2 seconds
            timerProgressBar: true, // Show a progress bar for the timer
            allowOutsideClick: false, // Prevent clicking outside the popup to close it
            allowEscapeKey: false // Prevent pressing the Escape key to close the popup
          }).then(() => {
            window.close(); // Close the current window after displaying the message for a short delay
          });
        }
      });
    }, 2000); // 2 seconds
  });
  