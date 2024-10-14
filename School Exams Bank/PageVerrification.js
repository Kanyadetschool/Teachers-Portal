document.addEventListener("DOMContentLoaded", function() {
    const loaderContainer = document.querySelector('.loading');
    const body = document.body;

    setTimeout(function() {
        loaderContainer.style.display = 'none';
        body.classList.remove('loading'); // Remove the loading class to remove blur

        // Prompt for password using SweetAlert
        function showPasswordPrompt() {
            Swal.fire({
                title: 'Enter Exams O.T.P Key',
                input: 'password',
                inputPlaceholder: 'Enter auth Key',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                cancelButtonText: 'Bypass',
                inputValidator: (value) => {
                    if (value !== '2024') {
                        return 'Incorrect password! Please try again.';
                    }
                },
                allowOutsideClick: false, // Disable outside clicks
                allowEscapeKey: false // Disable escape key
            }).then((result) => {
                if (result.isConfirmed) {
                    // Password is correct, proceed with update confirmation
                    Swal.fire({
                        title: 'Update Available',
                        text: 'A new version of the application is available. Do you want to update now?',
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, update now',
                        cancelButtonText: 'Not now',
                        timer: 5000, // Auto-close the popup after 5 seconds
                        timerProgressBar: true // Show a progress bar for the timer
                    }).then((updateResult) => {
                        if (updateResult.isConfirmed) {
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
                } else {
                    // Incorrect password or cancel button clicked
                    Swal.fire({
                        title: 'Access Denied',
                        text: 'We cannot verify you.Kindly Contact School ICT Team if this is not correct',
                        icon: 'error',
                        showCancelButton: false, // Remove the "Retry" option
                        confirmButtonText: 'Close',
                    }).then(() => {
                        // Redirect to a blank page and replace history state
                        window.location.replace('https://kanyadet.github.io/.ac.ke/Landing/1.All%20Users/AllUsersLandingPage.html');
                    });
                }
            });
        }
        showPasswordPrompt();
    }, 1000); // 2 seconds
});
