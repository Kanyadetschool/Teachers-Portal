const inputs = document.querySelectorAll(".input");

function focusFunc() {
  let parent = this.parentNode;
  parent.classList.add("focus");
}

function blurFunc() {
  let parent = this.parentNode;
  if (this.value == "") {
    parent.classList.remove("focus");
  }
}

inputs.forEach((input) => {
  input.addEventListener("focus", focusFunc);
  input.addEventListener("blur", blurFunc);
});
function showPopup(grade, male, female,total, classTeacher,theyear,update) {
  document.getElementById("level").innerText = grade;
  document.getElementById("Male").innerText = male;
  document.getElementById("Female").innerText = female;
  document.getElementById("total").innerText = total;
  document.getElementById("classTeacher").innerText = classTeacher;
  document.getElementById("theyear").innerText = theyear;
  document.getElementById("update").innerText = update;
  document.getElementById("dateTime").innerText = getCurrentDateTime();
  document.getElementById("popup").style.display = "block";
}

function hidePopup() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("close").style.display = "none";
}

function getCurrentDateTime() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return now.toLocaleDateString(undefined, options);
}
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
        emailErrorDiv.textContent = 'Unrecognized from the database';
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




