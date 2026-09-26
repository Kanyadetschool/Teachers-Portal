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
  // .microsofthide has no size of its own — its child .popup-container is
  // position:fixed (pulled out of normal flow), and .form2 inside that is the
  // actual visible dialog box. The close icon must attach to .form2, not to
  // .microsofthide, or it renders off in a collapsed, invisible spot.
  const dialogBox = microsofthide.querySelector('.form2') || microsofthide;

  // Close icon on the visible dialog box
  const closeBtn = document.createElement('span');
  closeBtn.className = 'microsofthide-close';
  closeBtn.innerHTML = '<i class="fas fa-circle-xmark"></i>';
  closeBtn.style.cssText = `
    position: absolute;
    top: 8px;
    right: 14px;
    cursor: pointer;
    font-size: 24px;
    color: #fff;
    z-index: 10001;
    line-height: 1;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  `;
  if (getComputedStyle(dialogBox).position === 'static') {
    dialogBox.style.position = 'relative';
  }
  dialogBox.appendChild(closeBtn);

  // Collapsed tab that sits on the screen edge
  const collapseTab = document.createElement('div');
  collapseTab.className = 'microsofthide-tab';
  collapseTab.innerHTML = '<i class="fas fa-bell"></i>';
  collapseTab.style.cssText = `
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background: #0078D4;
    color: #fff;
    padding: 10px 10px;
    font-size: 18px;
    border-radius: 8px 0 0 8px;
    cursor: pointer;
    z-index: 9999;
    display: none;
    box-shadow: -2px 0 6px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(collapseTab);

  const DISMISS_KEY = 'microsofthideDismissed';

  function collapsePopup() {
    microsofthide.style.display = 'none';
    collapseTab.style.display = 'block';
    localStorage.setItem(DISMISS_KEY, 'true');
  }

  function expandPopup() {
    microsofthide.style.display = 'block';
    // The generic outside-click handler earlier in this file also matches
    // this element (it's a .popup-container) and sets its own inline
    // display:none on outside-click close. Clear that here too, or the
    // dialog stays invisible even after microsofthide is shown again.
    if (microsofthidePopupContainer) {
      microsofthidePopupContainer.style.display = '';
    }
    collapseTab.style.display = 'none';
  }

  closeBtn.addEventListener('click', collapsePopup);
  collapseTab.addEventListener('click', expandPopup);

  // Match the footer hint "Click out to close Updates dialog": clicking the
  // background of the form (not the form content itself) collapses to the tab
  const microsofthidePopupContainer = microsofthide.querySelector('.popup-container');
  if (microsofthidePopupContainer) {
    microsofthidePopupContainer.addEventListener('click', (event) => {
      if (event.target === microsofthidePopupContainer) {
        collapsePopup();
      }
    });
  }

  // If the user already dismissed it before, don't auto-show it again —
  // just leave the tab available so they can still open it manually.
  if (localStorage.getItem(DISMISS_KEY) === 'true') {
    collapseTab.style.display = 'block';
    return;
  }

  setTimeout(function() {
    microsofthide.style.display = 'block';
  }, 2100); // Adjust the delay time as needed
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
const countDownDate = new Date("October 23, 2026 00:00:00").getTime();

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