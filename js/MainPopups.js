const hamburger = document.querySelector(".hamburger");
const navbar = document.querySelector(".navbar");
hamburger.addEventListener("click", () =>{
    hamburger.classList.toggle("active");
    navbar.classList.toggle("active");
})
document.querySelectorAll("nav","close").forEach(n => n.
   addEventListener("click", () => {
    hamburger.classList.remove("active")
    navbar.classList.remove("active")
    

   }))

   ////////////////////////////////////

    //Pop up log in for nemis starts

 const showSignUpButtons = document.querySelectorAll('.showSignUp','.notnoww');
 const popupContainers = document.querySelectorAll('.popup-container');
 
 showSignUpButtons.forEach((button, index) => {
   button.addEventListener('click', () => {
     popupContainers[index].style.display = 'flex';
   });
 });
 
 popupContainers.forEach((container) => {
   container.addEventListener('click', (event) => {
     if (event.target === container) {
       container.style.display = 'none';
     }
   });
 });
 
 
 
 //End Pop up log in for nemis 
 


 window.addEventListener('load', function() {
  const microsofthide = document.querySelector('.microsofthide');

  setTimeout(function() {
    microsofthide.style.display = 'block';
  }, 500); // Adjust the delay time as needed
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
  
  // Convert hours to 12-hour format and determine AM/PM
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  hours = hours.toString().padStart(2, '0');
  
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const dayElement = document.getElementById("day");
  const dateElement = document.getElementById("dated");
  const timeElement = document.getElementById("time");

  dayElement.textContent = dayOfWeek;
  dateElement.textContent = `${month} ${day}, ${year}`;
  timeElement.textContent = `${hours} : ${minutes} : ${seconds} ${ampm}`;
}

updateDateAndTime(); // Initial call to display the date and time

// Update the date and time every second
setInterval(updateDateAndTime, 1000);




////////////COUNTDOWN//////////////////
// Set the date we're counting down to
const countDownDate = new Date("feb 26, 2025 00:00:00").getTime();

// Update the countdown every 1 second
const x = setInterval(function() {
  // Get the elements
  const daysElement = document.getElementById("countdown-days");
  const hoursElement = document.getElementById("countdown-hours");
  const minutesElement = document.getElementById("countdown-minutes");
  const secondsElement = document.getElementById("countdown-seconds");

  // Check if elements exist
  if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
    return; // Exit if elements don't exist
  }

  // Get today's date and time
  const now = new Date().getTime();

  // Find the distance between now and the count down date
  const distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result
  daysElement.innerHTML = `${days} Days`;
  hoursElement.innerHTML = `${hours} Hours`;
  minutesElement.innerHTML = `${minutes} Minutes`;
  secondsElement.innerHTML = `${seconds} Seconds`;

  // If the countdown is finished, display a message
  if (distance < 0) {
    clearInterval(x);
    daysElement.innerHTML = "00";
    hoursElement.innerHTML = "00";
    minutesElement.innerHTML = "00";
    secondsElement.innerHTML = "00";
  }
}, 1000);
/////////////////COUNTDOWN END///////////////////////////


   