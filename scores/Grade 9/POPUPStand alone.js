function shouldShowReminder() {
    const lastReminderTime = localStorage.getItem('lastReminderTime');
    if (!lastReminderTime) return true; // If there's no saved time, show the popup
  
    const currentTime = new Date().getTime();
    const hours24 = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const timeDifference = currentTime - parseInt(lastReminderTime, 10); // Parse stored time as integer
    return timeDifference > hours24; // Show popup only if 24 hours have passed
}

function showDelayedSweetAlert() {
    if (!shouldShowReminder()) return; // Only show if the 24 hours have passed

    Swal.fire({
        title: 'Access Denied',
        text: 'Level missing Learners',
        showDenyButton: true,
        confirmButtonText: 'Close',
        denyButtonText: 'Guest',
        allowOutsideClick: true,
        didOpen: () => {
            Swal.showLoading();
        },
        html: `
            <p>Level kok Learners. Try other Levels</p>
            <br>
            <input type="checkbox" id="noReminderCheckbox">
            <label for="noReminderCheckbox"> Remind me after 24 hours</label>
        `,
        willClose: () => {
            Swal.hideLoading();
            const noReminderCheckbox = document.getElementById('noReminderCheckbox');
            if (noReminderCheckbox && noReminderCheckbox.checked) {
                // Set the current time as last reminder time if checkbox is checked
                localStorage.setItem('lastReminderTime', new Date().getTime().toString());
            }
        }
    }).then((result) => {
        if (result.isDenied) {
            window.location.href = 'https://kanyadet-school.web.app/';
        }
    });
}

// Initialize the popup with a delay
setTimeout(showDelayedSweetAlert, 1000);
