// import { Grade1 } from './Grade1.js';
import { Grade3 } from './Grade3.js';
import { Grade4 } from './Grade4.js';
// import { Grade5 } from './Grade5.js';
// import { Grade6 } from './Grade6.js';
// import { Grade7 } from './Grade7.js';
// import { Grade8 } from './Grade8.js';
// import { Grade9 } from './Grade9.js';
// Import other grades as needed

const grades = {
  Grade3,
  Grade4,
  // Grade5,
  // Grade6,
  // Grade7,
  // Grade8,
  // Grade9,
  // Add more grades here if needed
};
  
  // Define global variables
  let filteredStudents = [];
  let noDataAlertShown = false;
  let swalInstance = null; // Variable to hold SweetAlert instance
  
  // Function to disable all form fields
  function disableFormFields() {
    const form = document.querySelector('form');
    const formInputs = form.querySelectorAll('input, select, textarea');
  
    formInputs.forEach(input => {
      if (input !== document.querySelector('input[type="search"]')) {
        input.disabled = true;
      }
    });
  }
  
  // Function to populate the form with data and create download links
  function populateForm(data) {
    document.querySelector('input[name="CurentGrade"]').value = data.CurentGrade || '';
    document.querySelector('input[name="StudentFullName"]').value = data.StudentFullName || '';
    document.querySelector('input[name="Admission No"]').value = data.AdmissionNo || '';
    document.querySelector('input[name="EntryNo"]').value = data.EntryNo || '';
    document.querySelector('select[name="Disability"]').value = data.Disability || '';
    document.querySelector('input[name="DateOfAdm"]').value = data.DateOfAdm || '';
    document.querySelector('input[name="DateOfBirth"]').value = data.DateOfBirth || '';
    document.querySelector('input[name="Admission Class"]').value = data.AdmissionClass || '';
    document.querySelector('input[name="Level"]').value = data.Level || '';
    document.getElementById('Assessment Number').value = data.AssessmentNumber || '';
    document.querySelector('input[name="U.P.I"]').value = data.UPI || '';
    document.querySelector('input[type="tel"]').value = data.PhoneNumber || '';
    document.querySelector('input[type="email"]').value = data.StudentSchoolEmail || '';
    document.querySelector('select[name="🐏 Class Teacher"]').value = data.ClassTeacher || '';
    document.querySelector('input[name="Parent/Guardian Name"]').value = data.ParentGuardianName || '';
    document.querySelector('input[name="ParentGuardianPhoneNumber"]').value = data.ParentGuardianPhoneNumber || '';
    document.querySelector('textarea[name="Siblings"]').value = data.Siblings || '';
  
    // Disable form fields after populating with data
    disableFormFields();
  
    // Generate download links for PDFs
    for (let i = 1; i <= 3; i++) {
      const fileUrl = data[`FileUrl${i}`];
      if (fileUrl) {
        const link = document.createElement('a');
        link.href = fileUrl;
        const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        link.textContent = `${fileName}`;
        link.download = fileName;
        document.body.appendChild(link);
  
        const container = document.getElementById(`fileDownload${i}`);
        container.innerHTML = '';
        container.appendChild(link);
        container.style.display = 'block';
      }
    }
  
    // Display learner images (FileUrl4)
    const learnerImageContainer = document.getElementById('learnerImages');
    const learnerImageUrl = data.FileUrl4;
    if (learnerImageUrl) {
      const img = document.createElement('img');
      img.src = learnerImageUrl;
      img.alt = `${data.StudentFullName}'s Image`;
      learnerImageContainer.innerHTML = '';
      learnerImageContainer.appendChild(img);
      learnerImageContainer.style.display = 'block';
    }
  
    // Close the SweetAlert pop-up after populating the form
    if (swalInstance) {
      swalInstance.close();
    }
  }
  
  function filterDataByName(StudentFullName) {
    const inputFirstThreeLetters = StudentFullName.toLowerCase().slice(0, 3);

    // Combine all students from the grades object into a single array
    const allStudents = Object.values(grades)
        .flatMap(grade => grade); // Flatten the students arrays

    // Filter the combined student list
    return allStudents.filter(
        student => student.StudentFullName.toLowerCase().slice(0, 3) === inputFirstThreeLetters
    );
}

  
  // Function to handle no data found scenario with SweetAlert
  function handleNoDataFound() {
    Swal.fire({
      icon: 'warning',
      title: 'No Matching Data Found!',
      text: 'Please refine your search by typing the first three letters for the Christian name.',
      timer: 3000, // Display alert for 3 seconds
      didClose: () => {
        // Flatten all students from all grades
        const allStudents = Object.values(grades)
          .flatMap(grade => grade);  // Flatten the student arrays
        const studentNames = allStudents.map(student => student.StudentFullName);
        generateStudentList(studentNames, 'All Registered Learners', studentNames.length);
      }
    });
  }
  
  
  // Function to generate a list of StudentFullName with numbering
  function generateStudentList(studentNames, title, count) {
    const gradeStudentMap = [];
  
    // Flatten all students with references to their grades and indexes
    Object.entries(grades).forEach(([gradeName, gradeStudents]) => {
      gradeStudents.forEach((student, index) => {
        gradeStudentMap.push({
          gradeName, // Keep track of the grade
          student,  // Store the student object
          index,    // Store the index within the grade
        });
      });
    });
  
    // Generate options for the dropdown
    const options = gradeStudentMap.map(
      (entry, idx) => `<option value="${idx}">${idx + 1}. ${entry.student.StudentFullName}</option>`
    );
  
    // Prepare the HTML content for the Swal pop-up
    const htmlContent = `
      <div>
        <h3>Select a student:</h3>
        <select id="studentNameSelect" class="swal2-select">
          <option value="">Students</option>
          ${options.join('')}
        </select>
      </div>`;
  
    // Display the Swal pop-up
    Swal.fire({
      title: `${title} (${count})`,
      html: htmlContent,
      showCancelButton: false,
      didOpen: () => {
        const studentSelect = document.getElementById('studentNameSelect');
  
        // Handle dropdown selection
        studentSelect.addEventListener('change', function (event) {
          const selectedIndex = event.target.value;
          if (selectedIndex) {
            const selectedEntry = gradeStudentMap[selectedIndex];
            if (selectedEntry) {
              populateForm(selectedEntry.student); // Populate the form with the selected student's data
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Unable to find the selected student. Please try again.',
              });
            }
          }
        });
      },
    });
  }
  
  
  // Event listener for DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('input[type="search"]');
  
    // Function to handle live filtering and form population
    function handleLiveFiltering(inputValue) {
      if (inputValue.length < 3) {
        noDataAlertShown = false;
        return; // If less than 4 characters, do not perform filtering or show the pop-up
      }
  
      filteredStudents = filterDataByName(inputValue);
  
      if (filteredStudents.length > 0) {
        const studentNames = filteredStudents.map(student => student.StudentFullName);
        generateStudentList(studentNames, 'Matching Names', filteredStudents.length);
        noDataAlertShown = false;
      } else {
        handleNoDataFound();
      }
    }
  
    // Event listener for input changes
    searchInput.addEventListener('input', function(event) {
      const inputValue = event.target.value.trim();
      handleLiveFiltering(inputValue);
    });
  
    // Initially hide download link containers and learner image container
    const downloadContainers = document.querySelectorAll('[id^="fileDownload"]');
    downloadContainers.forEach(container => {
      container.style.display = 'none';
    });
  
    const learnerImageContainer = document.getElementById('learnerImages');
    learnerImageContainer.style.display = 'none';
  });
  