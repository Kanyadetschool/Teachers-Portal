// Define default data
const defaultData = [
    {
      Gender: "Male",
      StudentFullName: "AKATCH SAMUEL ODHIAMBO",
      AdmissionNo: "001/24",
      EntryNo: "431452166",
      AssessmentNumber: "B006437471",
      Disability: "None",
      DateOfAdm: "XXXXXXXXXXXX",
      AdmissionClass: "XXXXXXXXXXXX",
      DateOfBirth: "25-08-14",
      Level: "Grade 3",
      UPI: "CTDKY6",
      PhoneNumber: "XXXXXXXXXXXX",
      StudentSchoolEmail: "XXXXXXXXXXXX",
      ClassTeacher: "🧑‍⚕️ Mr Oduor Geofrey Onyango",
      ParentGuardianName: "XXXXXXXXXXXX",
      ParentGuardianPhoneNumber: "XXXXXXXXXXXX",
      Siblings: "XXXXXXXXXXX",
      FileUrl1: "#",
      FileUrl2: "#",
      FileUrl3: "#",
      FileUrl4: "./img/Students.jpg",
    },
    {
      Gender: "Male",
      StudentFullName: "ARINDO MICHAEL OTIENO",
      AdmissionNo: "002/24",
      EntryNo: "432017504",
      AssessmentNumber: "B006442226",
      Disability: "None",
      DateOfAdm: "XXXXXXXXXXXX",
      AdmissionClass: "XXXXXXXXXXXX",
      DateOfBirth: "09-09-2017",
      Level: "Grade 3",
      UPI: "P3TTRZ",
      PhoneNumber: "XXXXXXXXXXXX",
      StudentSchoolEmail: "XXXXXXXXXXXX",
      ClassTeacher: "🧑‍⚕️ Mr Oduor Geofrey Onyango",
      ParentGuardianName: "XXXXXXXXXXXX",
      ParentGuardianPhoneNumber: "XXXXXXXXXXXX",
      Siblings: "XXXXXXXXXXX",
      FileUrl1: "#",
      FileUrl2: "#",
      FileUrl3: "#",
      FileUrl4: "./img/Students.jpg",
    
    },
    {
      Gender: "Male",
      StudentFullName: "BUORO SAMANTHA MARION",
      AdmissionNo: "003/24",
      EntryNo: "",
      AssessmentNumber: "",
      Disability: "None",
      DateOfAdm: "XXXXXXXXXXXX",
      AdmissionClass: "XXXXXXXXXXXX",
      DateOfBirth: "",
      Level: "Grade 3",
      UPI: "",
      PhoneNumber: "XXXXXXXXXXXX",
      StudentSchoolEmail: "XXXXXXXXXXXX",
      ClassTeacher: "🧑‍⚕️ Mr Oduor Geofrey Onyango",
      ParentGuardianName: "XXXXXXXXXXXX",
      ParentGuardianPhoneNumber: "XXXXXXXXXXXX",
      Siblings: "XXXXXXXXXXX",
      FileUrl1: "#",
      FileUrl2: "#",
      FileUrl3: "#",
      FileUrl4: "./img/Students.jpg",
    
    },
    {
      Gender: "Female",
      StudentFullName: "⚠️CHRISTINE AWUOR",
      AdmissionNo: "004/24",
      EntryNo: "",
      AssessmentNumber: "B006458469",
      Disability: "None",
      DateOfAdm: "XXXXXXXXXXXX",
      AdmissionClass: "XXXXXXXXXXXX",
      DateOfBirth: "",
      Level: "Grade 3",
      UPI: "",
      PhoneNumber: "XXXXXXXXXXXX",
      StudentSchoolEmail: "XXXXXXXXXXXX",
      ClassTeacher: "🧑‍⚕️ Mr Oduor Geofrey Onyango",
      ParentGuardianName: "XXXXXXXXXXXX",
      ParentGuardianPhoneNumber: "XXXXXXXXXXXX",
      Siblings: "XXXXXXXXXXX",
      FileUrl1: "#",
      FileUrl2: "#",
      FileUrl3: "#",
      FileUrl4: "./img/Students.jpg",
    
    
    },
  
    {
    Gender: "Female",
    StudentFullName: "⚠️DANIEL OTIENO OKUMU",
    AdmissionNo: "005/24",
    EntryNo: "",
    AssessmentNumber: "B006479291",
    Disability: "None",
    DateOfAdm: "XXXXXXXXXXXX",
    AdmissionClass: "XXXXXXXXXXXX",
    DateOfBirth: "",
    Level: "Grade 3",
    UPI: "",
    PhoneNumber: "XXXXXXXXXXXX",
    StudentSchoolEmail: "XXXXXXXXXXXX",
    ClassTeacher: "🧑‍⚕️ Mr Oduor Geofrey Onyango",
    ParentGuardianName: "XXXXXXXXXXXX",
    ParentGuardianPhoneNumber: "XXXXXXXXXXXX",
    Siblings: "XXXXXXXXXXX",
    FileUrl1: "#",
    FileUrl2: "#",
    FileUrl3: "#",
    FileUrl4: "./img/Students.jpg"},
    // Add more default data objects as needed
  ];
  
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
    document.querySelector('input[name="Gender"]').value = data.Gender || '';
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
  
  // Function to filter data based on the first three letters of the input (e.g., name)
  function filterDataByName(StudentFullName) {
    const inputFirstThreeLetters = StudentFullName.toLowerCase().slice(0, 3);
    return defaultData.filter(
      item => item.StudentFullName.toLowerCase().slice(0, 3) === inputFirstThreeLetters
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
        const studentNames = defaultData.map(student => student.StudentFullName);
        generateStudentList(studentNames, 'All Registered Learners', studentNames.length);
      }
    });
  }
  
  // Function to generate a list of StudentFullName with numbering
  function generateStudentList(studentNames, title, count) {
    let options = {};
    studentNames.forEach((name, index) => {
      options[index] = `${index + 1}. ${name}`;
    });
  
    // Prepare the HTML content for the Swal pop-up
    const htmlContent = `
      <div>
        <h3 for="studentNameSelect">Select a student:</h3>
        <select id="studentNameSelect" class="swal2-select" placeholder="Select learner">
          <option value="">Students</option>
          ${Object.entries(options).map(([index, option]) => `<option value="${index}">${option}</option>`).join('')}
        </select>
      </div>`;
  
    // Display the Swal pop-up
    swalInstance = Swal.fire({
      title: `${title} (${count})`,
      html: htmlContent,
      showCancelButton: false, // Remove OK button
      didOpen: () => {
        const studentSelect = document.getElementById('studentNameSelect');
  
        studentSelect.addEventListener('change', function(event) {
          const selectedIndex = event.target.value;
          const selectedStudent = filteredStudents[selectedIndex] || defaultData[selectedIndex];
          populateForm(selectedStudent);
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
        return; // If less than 3 characters, do not perform filtering or show the pop-up
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
  