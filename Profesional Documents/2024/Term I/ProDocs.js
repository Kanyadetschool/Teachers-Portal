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

const learners = {
  // ... (your learner data)
  GradeThree: [
  { LearningArea: "Select " },
    { 
      imageUrl: "",
      LearningArea: "Music ", 
      TheYear:"2024",
      Schemes: "https://docs.google.com/document/d/1BcG2GEWGOV2hKrIqszQ8R44yivKhE1H3/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true",
      LessonPlans: "https://docs.google.com/document/d/1Di1V9dnRg_aDBsgMaKB2D1EMb2RLGWcY/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
      RecordsOfWorkCovered: "https://docs.google.com/document/d/1CpGt3E9a3ydFvdWsIihCt_Ztb1EokblL/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
      ObservationSchedules: "#", 
      AnecdotalRecords:"#", 
      AssessmentJournals:"#",
   
      },
    { 
      imageUrl: "",
      LearningArea: "Art and Craft", 
      TheYear:"2024",
      Schemes: "https://docs.google.com/document/d/1BUmvWeNQQwp7QxHwibIQO3NnV40iZYMt/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true",
      LessonPlans: "https://docs.google.com/document/d/1Db6A9Z8vvPpwAiu-5wE-Gu8SDZ4LzWpq/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
      RecordsOfWorkCovered: "https://docs.google.com/document/d/1COuK_nGyfy_kmXR3NDs5vzxiEbDVGvAH/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
      ObservationSchedules: "#", 
      AnecdotalRecords:"#", 
      AssessmentJournals:"#",
   
      },
  
    // Other learner objects without passwords
  ],
  GradeFour: [
    { LearningArea: "Select " },

    { 
      LearningArea: "Agriculture",
    TheYear:"2024",
    Schemes: "https://docs.google.com/document/d/1D99cjwtHAumurjFdBWPSjsYDNhZi8kM4/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true",
    LessonPlans: "https://docs.google.com/document/d/1DUti1LFUlex1VruXV4JlpFOxXQkFanuO/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
    RecordsOfWorkCovered: "https://docs.google.com/document/d/1BlrXny1w6EJmf8Gzmn00mfvqXlAKSEHa/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
    ObservationSchedules: "#", 
    AnecdotalRecords:"#", 
    AssessmentJournals:"#"
  },

  { LearningArea: "English",
      TheYear:"2024",
      Schemes: "https://docs.google.com/document/d/1BS2bynm60fnlGXHuVmCQ921hwKmm5GvI/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true",
      LessonPlans: "https://docs.google.com/document/d/1DST4Tg9hHXG_1daS9Q_iCocHoUNOnI1O/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
      RecordsOfWorkCovered: "https://docs.google.com/document/d/1CyQaifx7NTUJijrw6EZNuc7NI3o0MC4M/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
      ObservationSchedules: "#", 
      AnecdotalRecords:"#", 
      AssessmentJournals:"#"

  },
   
    // Other learner objects without passwords
  ],
  GradeFive: [
    { LearningArea: "Select " },

    {
       LearningArea: "Mathematics",
    TheYear:"2024",
    Schemes: "https://docs.google.com/document/d/1Bl75cTEbngbzhYkmaFcf1a-JOJIadq2z/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true",
    LessonPlans: "https://docs.google.com/document/d/1DcYB6NrPgsjo5oJviRjB1VB55dD0n6B1/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
    RecordsOfWorkCovered: "https://docs.google.com/document/d/1CdfnnuPiW69jr7WfyP20RSLPRSyTF0aS/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
    ObservationSchedules: "#", 
    AnecdotalRecords:"#", 
    AssessmentJournals:"#"
  },

  {  LearningArea: "Science and Technology",
  TheYear:"2024",
  Schemes: "https://docs.google.com/document/d/1B2sJXVDfTBDW83MD7DsKC3U3qzh-1JGg/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true",
  LessonPlans: "https://docs.google.com/document/d/1Dl24LQw-FDK8xbBQrMhMU9503VOj1EZG/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
  RecordsOfWorkCovered: "https://docs.google.com/document/d/1CrfYeZSxhKV6LHWguTxNvPCAhsKh-g6C/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
  ObservationSchedules: "#", 
  AnecdotalRecords:"#", 
  AssessmentJournals:"#"

  },
],
  GradeSix: [
    { LearningArea: "Select " },

    { 
      LearningArea: "Agriculture",
    TheYear:"2024",
    Schemes: "https://docs.google.com/document/d/1BcNO1QzV_-oKUxEmBM7X6wjjj-y0w4Fh/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true",
    LessonPlans: "https://docs.google.com/document/d/1DlXAyfzw3lsjcLOlyc-fnY_5ImZGs9As/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
    RecordsOfWorkCovered: "https://docs.google.com/document/d/1CQE0Qlsh4_E_ZlX2ucPxHVLIF6uMFSrD/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
    ObservationSchedules: "#", 
    AnecdotalRecords:"#", 
    AssessmentJournals:"#"
  },

  {LearningArea: "Mathematics",
  TheYear:"2024",
  Schemes: "https://docs.google.com/document/d/1BDYfLckG8LsXpMQ_ZOWIRdycX_fTxAnW/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true",
  LessonPlans: "https://docs.google.com/document/d/1DcFrpjRSmG7DzPsv-75BsVXavEmHYWXR/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
  RecordsOfWorkCovered: "https://docs.google.com/document/d/1CSqNJ-bFUqH8cCXKNFarcHdWpeTFmDcJ/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
  ObservationSchedules: "https://docs.google.com/document/d/1D1Vdjzw1HpUeWXwuHhfJw7PpBqfC0Oit/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
  AnecdotalRecords:"https://docs.google.com/document/d/1CzRAcg9AUZ_Xwfb5vQCwrO1gkb8yRbDB/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true", 
  AssessmentJournals:"#"

  },
   
    // Other learner objects without passwords
  ],



  // Other classes and learners
};

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
  return learners[classLearningArea].length - 1;
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
