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
  }, 5000); // Adjust the delay time as needed
});


// Log in form start
/// Get all form containers
const formContainers = document.querySelectorAll('.form-container');

// Loop through each form container
formContainers.forEach((container) => {
  const form = container.querySelector('.form2');
  const emailInput = form.querySelector('.email');
  const passwordInput = form.querySelector('.password');
  const primaryButton = form.querySelector('.primary_button');
  const emailErrorDiv = container.querySelector('.email-error');
  const passwordErrorDiv = container.querySelector('.password-error');
  const generalErrorDiv = container.querySelector('#general-error');

  primaryButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent form submission

    const enteredEmail = emailInput.value;
    const enteredPassword = passwordInput.value;

    // Simulate login validation - replace with your actual login logic
    const validEmail = 'geofreyonyango167@gmail.com'; // Replace with your valid email
    const validPassword = '123';   // Replace with your valid password

    // Clear previous error messages
    emailErrorDiv.textContent = '';
    passwordErrorDiv.textContent = '';
    generalErrorDiv.textContent = '';

    if (enteredEmail === validEmail && enteredPassword === validPassword) {
      // Display success message
      generalErrorDiv.textContent = 'Login successful! Kindly wait as we check your browser security...';

      // Clear the message after 2 seconds and redirect
      setTimeout(() => {
        generalErrorDiv.textContent = '';
        window.location.href = 'https://jamilo-school.github.io/admins-landing-page/';
      }, 2000);
    } else {
      // Display error messages
      if (enteredEmail !== validEmail) {
        emailErrorDiv.textContent = 'Incorect Credetials';
        emailInput.value = ''; // Reset the email input
      }

      if (enteredPassword !== validPassword) {
        passwordErrorDiv.textContent = 'Invalid password';
        passwordInput.value = ''; // Reset the password input
      }

      // Clear error messages and reset inputs after 1 second
      setTimeout(() => {
        emailErrorDiv.textContent = '';
        passwordErrorDiv.textContent = '';
        emailInput.value = '';
        passwordInput.value = '';
      }, 3000);
    }
  });
});
// End log in form



////////////COUNTDOWN//////////////////
 // Set the date we're counting down to
 const countDownDate = new Date("Sept 26, 2024 00:00:00").getTime();

 // Update the countdown every 1 second
 const x = setInterval(function() {

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
   document.getElementById("countdown-days").innerHTML = `${days} Days`;
   document.getElementById("countdown-hours").innerHTML = `${hours} Hours`;
   document.getElementById("countdown-minutes").innerHTML = `${minutes} Minutes`;
   document.getElementById("countdown-seconds").innerHTML = `${seconds} Seconds`;

   // If the countdown is finished, display a message
   if (distance < 0) {
     clearInterval(x);
     document.getElementById("countdown-days").innerHTML = "00";
     document.getElementById("countdown-hours").innerHTML = "00";
     document.getElementById("countdown-minutes").innerHTML = "00";
     document.getElementById("countdown-seconds").innerHTML = "00";
   }
 }, 100);

/////////////////COUNTDOWN END///////////////////////////


   