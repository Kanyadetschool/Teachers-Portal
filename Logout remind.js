
    // Function to show SweetAlert after delay
    function showDelayedSweetAlert() {
      Swal.fire({
        title: 'Notification!',
        text: 'Always log out before closing the window.Your privacy is our Concern',
        footer:' &copy Examination office | 2024',
        confirmButtonText: 'OK'
      });
    }

    // Call the function after 2000 milliseconds (2 seconds)
    setTimeout(showDelayedSweetAlert, 2000);