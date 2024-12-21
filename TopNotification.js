

var notifications = [
  '🎄 Happy Holidays! School opening  6-Jan 2025.',
  '🎉 Thanks for Kanyadet Community! Your support matters.',
  '🌍 Grade 6 Alaska maths project due 8-Jan 2025.',
  '📚 New books in the library!',
  '🍎 New lunch menu starts next year.',
  '🏫 School reopens on 6-Jan 2025.',
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
setTimeout(displayNotification, 2000); // Initial delay before displaying the first notification

