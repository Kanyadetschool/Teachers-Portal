const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});












function updateDateAndTime() {
  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const months = [
    "January", "February", "March", "April", "May", "June", "July", "August",
    "Sept", "October", "November", "December"
  ];

  const now = new Date();
  const dayOfWeek = daysOfWeek[now.getDay()];
  const month = months[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const dayElement = document.getElementById("day");
  const dateElement = document.getElementById("dated");
  const timeElement = document.getElementById("time");

  dayElement.textContent = dayOfWeek;
  dateElement.textContent = `${month} ${day}, ${year}`;
  timeElement.textContent = `${hours}hrs : ${minutes}min`;
}

updateDateAndTime(); // Initial call to display the date and time

// Update the date and time every second
setInterval(updateDateAndTime, 1000);





const btn = document.getElementById('installButton');

function blinkBorderTwice() {
  btn.classList.add('blinking-border');
  setTimeout(() => {
    btn.classList.remove('blinking-border');
  }, 8000); // Remove blinking class after 2 seconds
}

// Automatically trigger the blinking effect on page load
window.onload = () => {
  blinkBorderTwice();
};

