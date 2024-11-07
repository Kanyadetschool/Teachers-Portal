const scriptURL = 'https://script.google.com/macros/s/AKfycbxyPpYLLTMYv2d1zdkQCH0bIxTgepjOFGqkuyVEuzbwRNCfnKlcX-6ipZ8xOqh_VhHE/exec';
const form = document.forms['submit-to-google-sheet'];

// Function to check if all required inputs are filled
function areInputsFilled() {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    return Array.from(inputs).every(input => input.value.trim() !== '');
}

// Handle form submission
form.addEventListener('submit', e => {
    e.preventDefault();

    if (areInputsFilled()) {
        Swal.fire({
            title: 'Submitting...',
            text: 'Please wait',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
        });

        fetch(scriptURL, { method: 'POST', body: new FormData(form) })
            .then(response => {
                Swal.close(); // Close the initial "Submitting..." alert
                if (response.status === 200) {
                    // Successful submission
                    Swal.fire({
                        title: 'Saved!',
                        icon: 'success',
                        timer: 500, // Set the timer to 0.5 seconds
                        timerProgressBar: true, // Optional: Shows progress bar
                        showConfirmButton: false, // Hide the confirm button
                    }).then(() => {
                        form.reset(); // Reset the form if submission is successful
                        // Redirect the user to the Google Workspace website after the alert closes
                        // window.location.href = './Vida.webm';
                    });
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Submission Failed',
                        icon: 'error',
                    });
                }
            })
            .catch(error => {
                console.error('Error!', error.message);
                Swal.close(); // Close the initial "Submitting..." alert
                Swal.fire({
                    title: 'Ooops!!',
                    text: 'Connect to the internet',
                    icon: 'error',
                });
            });
    } else {
        Swal.fire({
            title: 'Error!',
            text: 'Please fill in all required fields.',
            icon: 'error',
        });
    }
});
