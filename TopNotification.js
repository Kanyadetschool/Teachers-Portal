

var notifications = [
  'Hi!.Welcome on board',
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

