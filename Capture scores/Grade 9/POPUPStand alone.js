function shouldShowReminder() {
  const lastReminderTime = localStorage.getItem('lastReminderTime');
  
  // If there is no previous reminder time, show the popup
  if (!lastReminderTime) return true;

  const currentTime = new Date().getTime();
  const hours24 = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const timeDifference = currentTime - parseInt(lastReminderTime, 10); // Parse stored time as integer
  
  // Show popup only if 24 hours have passed
  return timeDifference > hours24;
}

function showDelayedSweetAlert() {
  if (!shouldShowReminder()) return; // Only show if the 24 hours have passed

  Swal.fire({
      title: 'Access Denied',
      text: 'Level missing Learners',
      confirmButtonText: 'Close',
      allowOutsideClick: true,
      didOpen: () => {
          Swal.showLoading();
      },
      html: `
          <p>Level missing Learners. Try other Levels</p>
          <br>
          <input type="checkbox" id="noReminderCheckbox">
          <label for="noReminderCheckbox"> Remind me after 24 hours</label>
      `,
      willClose: () => {
          Swal.hideLoading();
          const noReminderCheckbox = document.getElementById('noReminderCheckbox');
          if (noReminderCheckbox && noReminderCheckbox.checked) {
              // Set the current time as last reminder time if checkbox is checked
              const currentTime = new Date().getTime();
              localStorage.setItem('lastReminderTime', currentTime.toString());
              console.log(`Reminder time set: ${currentTime}`); // Debugging log
          }
      }
  });
}

// Initialize the popup with a delay
setTimeout(showDelayedSweetAlert, 1000);
