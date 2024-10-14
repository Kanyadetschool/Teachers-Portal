// Function to show the SweetAlert with a spinning loader and auto-close after 2 seconds
function showDelayedSweetAlert() {
  Swal.fire({
    title: 'In Memory of Mr Edwin Okumu!',
    text: 'Take a moment of silence as we honor his life. Thank you',
    showDenyButton: true,
    confirmButtonText: 'Close',
    denyButtonText: 'Guest',
    timer: 20000, // Auto-close after 8 seconds
    timerProgressBar: true,
    allowOutsideClick: true, // Enable outside click to close
    didOpen: () => {
      // Add spinning loader
      Swal.showLoading();
    },
    willClose: () => {
      Swal.hideLoading();
    }
  }).then((result) => {
    if (result.isDenied) {
      // Action for the Guest button
      window.location.href = 'https://kanyadet-school.web.app/'; // Replace with your desired URL
    }
  });
}

// Call the function after 2000 milliseconds (2 seconds)
setTimeout(showDelayedSweetAlert, 2000);