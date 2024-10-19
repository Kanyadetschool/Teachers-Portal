const openPopupBtns = document.querySelectorAll('.openPopupBtn');  // Select all buttons with class openPopupBtn
const dataArrays = {
  Grade8: {
    title: 'Grade 8 Results',  // Add a title for this array
    years: [
      { year: '2024', terms: [
          { term: 'Term 1', exams: ['Opener', 'Final'] },
          { term: 'Term 2', exams: ['Midterm', 'Final'] },
          { term: 'Term 3', exams: ['Midterm', 'Final'] }
        ]
      },
      { year: '2023', terms: [
          { term: 'Term 1', exams: ['Midterm', 'Final'] },
          { term: 'Term 2', exams: ['Midterm', 'Final'] }
        ]
      }
    ],
    files: {
      'Opener': 'opener.pdf',
      'Final': ''
    }
  },
  Grade6: {
    title: 'Grade 6 Results',  // Add a title for this array
    years: [
      { year: '2024', terms: [
          { term: 'Term 1', exams:
             [
              'KENYA PRIMARY SCHOOL EDUCATION ASSESSMENT KICK OFF', 
              'MID TERM 1 ASSESSMENT',
              'END TERM I REPORTS',

             ] },

          { term: 'Term 2', exams:
             [
               '02 Grade 6 End Term II Reports 2024',
               '01 Grade Six 2024 Term II Kick Off', 
             ] },

         
          { term: 'Term 3', exams:
             [
               '🧑‍⚕️ New >> School evaluation Assessment', 
              '01 OPENER EXAM  TERM III 2024', 
             
             ] },

         
        ]
      },
       { year: '2025', terms: [
        //    { term: 'Term 1', exams: ['2024 coming soon', 'Final'] },
        //   { term: 'Term 2', exams: ['Midterm', 'Final'] },
        //  { term: 'Term 3', exams: ['Midterm', 'Final'] }
         ]
       },
    ],
    files: {
      ///2024 TERM 1 FILES ////
      'KENYA PRIMARY SCHOOL EDUCATION ASSESSMENT KICK OFF': 
      './School Exams Bank/Docs/Examinations Results Database/Grade 6/2024/Term 1/01 Grade Six 2024 TERM I OPENER  Results Kanyadet School - Google Drive.pdf',

      'MID TERM 1 ASSESSMENT': 
      './School Exams Bank/Docs/Examinations Results Database/Grade 6/2024/Term 1/GRDAE 6 MID TERM 1 ASSESSMENT.pdf',

      'END TERM I REPORTS': 
      './School Exams Bank/Docs/Examinations Results Database/Grade 6/2024/Term 1/03 Grade Six 2024 End Term I Reports.pdf',

      ///2024 TERM 2 FILES ////

      '01 Grade Six 2024 Term II Kick Off': 
      './School Exams Bank/Docs/Examinations Results Database/Grade 6/2024/Term 2/01 Grade Six 2024 Term II Kick Off.pdf',

      '02 Grade 6 End Term II Reports 2024': 
      './School Exams Bank/Docs/Examinations Results Database/Grade 6/2024/Term 2/02 Grade 6 End Term II Reports 2024.pdf',

      ///2024 TERM 3 FILES ////

      '🧑‍⚕️ New >> School evaluation Assessment': 
      './School Exams Bank/Docs/Examinations Results Database/Grade 6/2024/Term 3/02 Term III 24 School evaluation Assessment.pdf',
      
      '01 OPENER EXAM  TERM III 2024': 
      './School Exams Bank/Docs/Examinations Results Database/Grade 6/2024/Term 3/01 GRADE 6 OPENER EXAM  TERM III 2024 - Automation.pdf',



    },
  
  }
};let currentDataArray = null;  // Store the current data array for the active button
let previousSelection = { year: null, term: null, exam: null };  // Store previous selections

openPopupBtns.forEach(button => {
  button.addEventListener('click', function () {
    const arrayKey = this.getAttribute('data-array');
    currentDataArray = dataArrays[arrayKey];  // Get the corresponding data array
    openSwalPopup();  // Trigger SweetAlert2 popup
  });
});

// Open SweetAlert2 popup with dynamic dropdowns
function openSwalPopup() {
  Swal.fire({
    title: currentDataArray.title,  // Dynamic title based on the data array's title
    html: `
      <select id="yearSelect" class="swal2-select">
        <option value="" disabled selected>Select a year</option>
        ${currentDataArray.years.map(year => `
          <option value="${year.year}" data-terms='${JSON.stringify(year.terms)}'
            ${previousSelection.year === year.year ? 'selected' : ''}>${year.year}</option>`).join('')}
      </select>
      <select id="termSelect" class="swal2-select" style="display:${previousSelection.term ? 'block' : 'none'};">
        <option value="" disabled selected>Select a term</option>
      </select>
      <select id="examSelect" class="swal2-select" style="display:${previousSelection.exam ? 'block' : 'none'};">
        <option value="" disabled selected>Select an exam type</option>
      </select>
    `,
    showCancelButton: false,
    confirmButtonText: 'Download',
    didOpen: () => {
      if (previousSelection.year) {
        const selectedYear = document.querySelector('#yearSelect option[selected]');
        const terms = JSON.parse(selectedYear.getAttribute('data-terms'));
        populateTermDropdown(terms);
      }
      if (previousSelection.term) {
        document.querySelector(`#termSelect option[value="${previousSelection.term}"]`).selected = true;
        const selectedTerm = document.querySelector('#termSelect option[selected]');
        const exams = JSON.parse(selectedTerm.getAttribute('data-exams'));
        populateExamDropdown(exams);
      }
    },
    preConfirm: () => {
      const examSelect = document.getElementById('examSelect');
      const selectedExam = examSelect.value;

      if (!selectedExam) {
        Swal.showValidationMessage('Please select an exam type');
        return false;
      }

      // Store the selected values in case the user cancels the download
      previousSelection.exam = selectedExam;
      
      // Show confirmation for the selected exam before download
      return Swal.fire({
        title: 'Confirm Download',
        text: `You are about to download: ${selectedExam}. Do you want to proceed?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, download it!',
        cancelButtonText: 'No, cancel'
      }).then(result => {
        if (result.isConfirmed) {
          const fileToDownload = currentDataArray.files[selectedExam];
          if (fileToDownload) {
            // Initiate download of the selected file
            const link = document.createElement('a');
            link.href = fileToDownload;
            link.download = fileToDownload;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            Swal.showValidationMessage('File not found for the selected exam');
          }
        } else {
          // Reopen the Swal popup with the previous selections, allowing new selections
          openSwalPopup();
        }
        return false;  // Prevent the popup from closing automatically
      });
    }
  });

  // Handle the dynamic dropdown changes
  document.getElementById('yearSelect').addEventListener('change', function () {
    const selectedYear = this.options[this.selectedIndex];
    const terms = JSON.parse(selectedYear.getAttribute('data-terms'));
    previousSelection.year = selectedYear.value;  // Store the selected year
    populateTermDropdown(terms);
    document.getElementById('termSelect').style.display = 'block';  // Show the term dropdown
  });

  document.getElementById('termSelect').addEventListener('change', function () {
    const selectedTerm = this.options[this.selectedIndex];
    const exams = JSON.parse(selectedTerm.getAttribute('data-exams'));
    previousSelection.term = selectedTerm.value;  // Store the selected term
    populateExamDropdown(exams);
    document.getElementById('examSelect').style.display = 'block';  // Show the exam dropdown
  });
}

// Populate the "Select Term" dropdown
function populateTermDropdown(terms) {
  const termSelect = document.getElementById('termSelect');
  termSelect.innerHTML = '<option value="" disabled selected>Select a term</option>';
  terms.forEach(termObj => {
    const option = document.createElement('option');
    option.value = termObj.term;
    option.textContent = termObj.term;
    option.setAttribute('data-exams', JSON.stringify(termObj.exams));
    termSelect.appendChild(option);
  });
  if (previousSelection.term) {
    document.querySelector(`#termSelect option[value="${previousSelection.term}"]`).selected = true;
  }
}

// Populate the "Select Exam Type" dropdown
function populateExamDropdown(exams) {
  const examSelect = document.getElementById('examSelect');
  examSelect.innerHTML = '<option value="" disabled selected>Select an exam type</option>';
  exams.forEach(exam => {
    const option = document.createElement('option');
    option.value = exam;
    option.textContent = exam;
    examSelect.appendChild(option);
  });
  if (previousSelection.exam) {
    document.querySelector(`#examSelect option[value="${previousSelection.exam}"]`).selected = true;
  }
}
