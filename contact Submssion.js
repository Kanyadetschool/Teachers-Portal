const scriptURL = 'https://script.google.com/macros/s/AKfycbzzGK5_PRheRcODRPIj-I6zFL6oqZRNVZBDGt3We5cBTF0YJNtdCg8nowJowaUdejBe/exec';
const form = document.forms['submit-to-google-sheet'];

form.addEventListener('submit', e => {
    e.preventDefault();

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
                    title: 'Success!',
                    text: 'Submission Successful!',
                    icon: 'warning',
                });
                form.reset(); // Reset the form if submission is successful

                // Redirect the user to the Google Workspace website after 2 seconds
                // setTimeout(() => {
                //     window.location.href = '#';
                // }, 2000);
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
                text: 'Connect to the internet ',
                icon: 'warning',
            });
        });
});