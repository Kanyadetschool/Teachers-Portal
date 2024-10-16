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

document.addEventListener('DOMContentLoaded', function () {
  var reloadButton = document.getElementById('reload');

  reloadButton.addEventListener('click', function () {
    location.reload();
  });
});


function promptForDownloadPassword(learner, fileKey = "Schemes") {
  handleDownload(learner, fileKey);
}

// ... (previous code)

function handleDownload(learner, fileKey) {
  const url = learner[fileKey];

  // Create a temporary anchor element to trigger the download
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("target", "_blank"); // Open link in a new tab
  document.body.appendChild(link); // Append the link to the body
  link.click();

  // Remove the temporary anchor element
  document.body.removeChild(link);

  // Note: Pop-up blockers usually allow window.open if called immediately in response to a user action.
  // Open a new window (optional, depending on your requirements)
  // const newWindow = window.open();

  // Close the new window after a short delay (e.g., 500 milliseconds)
  setTimeout(() => {
    window.close();
  }, 500);
}

// ... (rest of the code)


function countLearnersInClass(classLearningArea) {
  return learners[classLearningArea].length;
}

function displayLearners() {
  const selectedClass = document.getElementById("classSelect").value;
  const learnerSelect = document.getElementById("learnerSelect");
  learnerSelect.innerHTML = "";

  learners[selectedClass].forEach((learner, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = learner.LearningArea;
    learnerSelect.appendChild(option);
  });

  const numberOfLearners = countLearnersInClass(selectedClass);
  const countDisplay = document.getElementById("learnerCount");
  countDisplay.textContent = `🔍Total No of Learning areas Handled: ${numberOfLearners}`;

  displayBiodata();
}

function displayBiodata() {
  const selectedClass = document.getElementById("classSelect").value;
  const selectedLearnerIndex = document.getElementById("learnerSelect").value;
  const biodataDiv = document.getElementById("learnerBiodata");
  const selectedLearner = learners[selectedClass][selectedLearnerIndex];
  biodataDiv.innerHTML = "";

  for (const [key, value] of Object.entries(selectedLearner)) {
    if (
      key !== "imageUrl" &&
      key !== "Schemes" &&
      key !== "LessonPlans" &&
      key !== "ObservationSchedules" &&
      key !== "RecordsOfWorkCovered" &&
      key !== "AnecdotalRecords" &&
      key !== "AssessmentJournals" &&
      key !== "password"
    ) {
      const p = document.createElement("p");
      p.textContent = `${key}: ${value}`;
      biodataDiv.appendChild(p);
    }
  }

  if (selectedLearner.Schemes) {
    createDownloadLink(biodataDiv, selectedLearner, "Schemes", "Schemes Of Work");
  }
  if (selectedLearner.LessonPlans) {
    createDownloadLink(biodataDiv, selectedLearner, "LessonPlans", "🚶‍♀️Lesson Plans");
  }
  if (selectedLearner.ObservationSchedules) {
    createDownloadLink(biodataDiv, selectedLearner, "ObservationSchedules", "🤼Observation Schedules");
  }
  if (selectedLearner.RecordsOfWorkCovered) {
    createDownloadLink(biodataDiv, selectedLearner, "RecordsOfWorkCovered", "👨‍⚕️Records Of Work Covered");
  }
  if (selectedLearner.AnecdotalRecords) {
    createDownloadLink(biodataDiv, selectedLearner, "AnecdotalRecords", "🔍Anecdotal Records");
  }
  if (selectedLearner.AssessmentJournals) {
    createDownloadLink(biodataDiv, selectedLearner, "AssessmentJournals", "Assessment Journals", true);
  }
}

function createDownloadLink(parent, learner, fileKey, text, alertPendingUpdate) {
  const downloadLink = document.createElement("a");
  downloadLink.href = "#"; // Set an initial value for href
  downloadLink.textContent = text;
  downloadLink.onclick = function () {
    promptForDownloadPassword(learner, fileKey);
  };
  if (alertPendingUpdate) {
    downloadLink.onclick = function () {
      promptForDownloadPassword(learner, fileKey);
      alert("Pending Update");
    };
  }
  parent.appendChild(downloadLink);
}

// Initial call to display learners
displayLearners();
