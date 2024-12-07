

var notifications = [
  '🎄 Happy Holidays! School opening  6-Jan 2025.',
  '🎉 Thanks for Mokos Community Day! Your support matters.',
  '🌍 Grade 6 Alaska maths project due 8-Jan 2025.',
  '📚 New books in the library!',
  '🍎 New lunch menu starts next year.',
  '🏫 School reopens6-Jan 2025.',
  '🏆 Music competition winners announced!',
  '🌳 Energy Conservation Week: Jun 5-9.',
  '📅 Exam schedule posted online.',
  '🗓️ Calendar updated, check website.',
  '🏆 Awards Ceremony: Jun 30/25, 6 PM.'
];

var notificationIndex = 0;

function displayNotification() {
  if (notificationIndex < notifications.length) {
    var notification = notifications[notificationIndex];

    var notificationElement = document.createElement("div");
    notificationElement.classList.add("toast");
    notificationElement.innerText = notification;
    document.body.appendChild(notificationElement);

    notificationElement.classList.add("toast-enter");
    setTimeout(function () {
      notificationElement.classList.remove("toast-enter");
      setTimeout(function () {
        notificationElement.classList.add("toast-exit");
        setTimeout(function () {
          notificationElement.remove();
          notificationIndex++;
          displayNotification(); // Display the next notification after the interval
        }, 1000); // Exit animation duration
      }, 10000); // Entrance duration
    },8000); //  Display animation duration
  }
}

// Start the sequence by displaying the first notification after an interval
setTimeout(displayNotification, 1500); // Initial delay before displaying the first notification


// Function to update the countdown
function updateCountdown() {
const targetDate = new Date("2023-10-26");
const currentDate = new Date();
const timeDifference = targetDate - currentDate;

const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

document.getElementById("days").textContent = formatTime(days);
document.getElementById("hours").textContent = formatTime(hours);
document.getElementById("minutes").textContent = formatTime(minutes);
document.getElementById("seconds").textContent = formatTime(seconds);
}

// Function to format time (e.g., add leading zeros)
function formatTime(time) {
return time < 10 ? `0${time}` : time;
}

// Initial update
updateCountdown();

// Update the countdown every second
setInterval(updateCountdown, 1000);







//Countdown js starts
   // Set the total number of items and the completed items
   const totalItems = 22;
   const completedItems = 22;

   // Calculate the percentage
   const percentage = (completedItems / totalItems) * 100;

   // Update the progress bar and label
   const progressFill = document.getElementById('progress-fill');
   const progressLabel = document.getElementById('progress-label');

   progressFill.style.width = percentage + '%';
   progressLabel.innerText = percentage.toFixed(2) +  '%';
   //Countdown js Ends