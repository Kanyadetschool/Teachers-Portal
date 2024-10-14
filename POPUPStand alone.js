// Function to check if the reminder should be shown
function shouldShowReminder() {
  const lastReminderTime = localStorage.getItem('lastReminderTime');
  if (!lastReminderTime) return true;

  const currentTime = new Date().getTime();
  const hours24 = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  return currentTime - lastReminderTime > hours24;
}

// Function to show the SweetAlert with a spinning loader and auto-close after 2 seconds
function showDelayedSweetAlert() {
  Swal.fire({
    title: 'OTP Troubles?',
    text: 'Is that pesky O.T.P playing hide-and-seek? Don\'t let it ruin your day.Contact us now for swift and efficient assistance. Your digital life matters to us.',
    showDenyButton: false,
    confirmButtonText: 'Close',
    denyButtonText: 'Guest',
    timer: 20000, // Auto-close after 20 seconds
    timerProgressBar: true,
    allowOutsideClick: true, // Enable outside click to close
    didOpen: () => {
      // Add spinning loader
      Swal.showLoading();
    },
    html: `
      <p>Is that pesky OTP playing hide-and-seek? Don\'t let it ruin your day. Contact us now for swift and efficient assistance. Your digital life matters.</p>
      <br>
      <input type="checkbox" id="noReminderCheckbox">
      <label for="noReminderCheckbox"> Don't remind me again</label>
    `,
    willClose: () => {
      Swal.hideLoading();
      const noReminderCheckbox = document.getElementById('noReminderCheckbox');
      if (noReminderCheckbox && noReminderCheckbox.checked) {
        localStorage.setItem('lastReminderTime', new Date().getTime());
      }
    }
  }).then((result) => {
    if (result.isDenied) {
      // Action for the Guest button
      window.location.href = 'https://kanyadet-school.web.app/'; // Replace with your desired URL
    }
  });
}

// Call the function after 2000 milliseconds (2 seconds) if the reminder should be shown
if (shouldShowReminder()) {
  setTimeout(showDelayedSweetAlert, 2000);
}
