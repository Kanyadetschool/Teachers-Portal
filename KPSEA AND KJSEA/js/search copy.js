// Import grade data
import { Year2024 } from './2024.js';
import { Year2025 } from './2025.js';
import { Year2026 } from './2026.js';

// Combine all grade data
const grades = {
  Year2026,
  Year2025,
  Year2024,
};

// Global state variables
let filteredStudents = [];
let allStudentsList = [];
let noDataAlertShown = false;
let swalInstance = null;

// Get all students with their details
function getAllStudents() {
  const studentMap = new Map(); // Use Map to store unique students

  Object.values(grades)
    .flatMap(grade => 
      grade.years.flatMap(year => 
        year.terms.forEach(term => {
          // Skip the 'Total Graduands' summary entry
          if (term.term.includes('Total Graduands')) return;
          
          // Skip if no exams array
          if (!term.exams) return;

          let studentInfo;
          // Try 2024 format first (now handles dots and tabs after numbers)
          let termMatch = term.term.match(/{\d+}\.?\s*\t*([A-Z0-9]+) - (.+)/);
          
          if (termMatch) {
            // 2024 format
            studentInfo = {
              fullTerm: term.term.trim(),
              assessmentNumber: termMatch[1],
              fullName: termMatch[2].trim()
            };
          } else {
            // Try 2025 format
            termMatch = term.term.match(/\d+\. (.+)/);
            if (termMatch) {
              const fullName = termMatch[1];
              const examRef = term.exams[0];
              const assessmentNumber = examRef.match(/\(([^\/]+)\//)?.[1] || '';
              studentInfo = {
                fullTerm: term.term.trim(),
                assessmentNumber: assessmentNumber,
                fullName: fullName.trim()
              };
            } else {
              return;
            }
          }

          // Create or update student record
          const studentKey = `${studentInfo.assessmentNumber}-${studentInfo.fullName}`;
          
          if (!studentMap.has(studentKey)) {
            studentMap.set(studentKey, {
              FullTerm: studentInfo.fullTerm,
              StudentFullName: studentInfo.fullName,
              AssessmentNumber: studentInfo.assessmentNumber,
              Year: grade.title,
              StudentYear: year.year,
              ExamReferences: new Set(),
              ExamTypes: new Set(),
              SearchableText: `${studentInfo.fullTerm} ${Array.from(term.exams).join(' ')}`.toLowerCase()
            });
          }

          // Add exam information to existing student record
          const student = studentMap.get(studentKey);
          term.exams.forEach(exam => {
            student.ExamReferences.add(exam);
            const examType = exam.includes('/') ? exam.split('/')[0] : exam.split(' ')[0];
            student.ExamTypes.add(examType);
          });
        })
      )
    );

  // Convert Map values to array and format exam types
  return Array.from(studentMap.values()).map(student => ({
    ...student,
    ExamReference: Array.from(student.ExamReferences).join(', '),
    ExamType: Array.from(student.ExamTypes).join(', ')
  }));
}

// Filter students based on search input
function filterDataByName(searchInput) {
  const inputLowerCase = searchInput.toLowerCase();
  
  // Get all students if not already loaded
  if (allStudentsList.length === 0) {
    allStudentsList = getAllStudents();
  }

  // Search across all relevant fields using SearchableText
  return allStudentsList.filter(student => 
    student.SearchableText.includes(inputLowerCase)
  );
}

// Handle case when no data is found
function handleNoDataFound() {
  Swal.fire({
    icon: 'warning',
    title: 'No Matching Data Found!',
    text: 'Please refine your search by typing at least three letters of the name.',
    timer: 3000,
    didClose: () => {
      // Show all students when no matches are found
      allStudentsList = getAllStudents();
      const studentNames = allStudentsList.map(student => student.FullTerm);
      generateStudentList(studentNames, 'All Registered Learners', studentNames.length, true);
    }
  });
}

// Generate and display student list
function generateStudentList(studentNames, title, count, isAllStudents = false) {
  if (!Array.isArray(studentNames)) {
    console.error('studentNames must be an array');
    return;
  }

  const studentsToUse = isAllStudents ? allStudentsList : filteredStudents;

  // Create dropdown options with student details
  const options = {};
  studentNames.forEach((name, index) => {
    if (name) {
      const student = studentsToUse[index];
      options[index] = student.FullTerm;
    }
  });

  const htmlContent = `
    <div>
      <h3 for="studentNameSelect">Select a Student:</h3>
      <select id="studentNameSelect" class="swal2-select" placeholder="Select student">
        <option value="">-- Select Student --</option>
        ${Object.entries(options).map(([index, option]) => `
          <option value="${index}">${option}</option>
        `).join('')}
      </select>
      <div id="studentDetails" style="margin-top: 20px; text-align: left; display: none;">
      <h4>Student Details:</h4>
      <p><strong>Year:</strong> <span id="detailYear"></span></p>
        <p><strong>Name Number{}:</strong> <span id="detailFullTerm"></span></p>
        <p><strong>Assessment Number:</strong> <span id="detailAssessment"></span></p>
        <p><strong>Category:</strong> <span id="detailStudentYear"></span></p>
        <p><strong>Exam Types:</strong> <span id="detailExamType"></span></p>
        <p><strong>Exam References:</strong> <span id="detailExamRef"></span></p>
      </div>
    </div>`;

  swalInstance = Swal.fire({
    title: `${title} (${count})`,
    html: htmlContent,
    width: '800px',
    showCancelButton: true,
    confirmButtonText: 'View Details',
    cancelButtonText: 'X',
    didOpen: () => {
      const studentSelect = document.getElementById('studentNameSelect');
      const detailsDiv = document.getElementById('studentDetails');
      
      studentSelect.addEventListener('change', function(event) {
        const selectedIndex = event.target.value;
        if (selectedIndex !== '') {
          const selectedStudent = studentsToUse[selectedIndex];
          if (selectedStudent) {
            document.getElementById('detailFullTerm').textContent = selectedStudent.FullTerm;
            document.getElementById('detailAssessment').textContent = selectedStudent.AssessmentNumber;
            document.getElementById('detailYear').textContent = selectedStudent.Year;
            document.getElementById('detailStudentYear').textContent = selectedStudent.StudentYear;
            document.getElementById('detailExamType').textContent = selectedStudent.ExamType;
            document.getElementById('detailExamRef').textContent = selectedStudent.ExamReference;
            detailsDiv.style.display = 'block';
          } else {
            console.warn('Selected student not found');
            detailsDiv.style.display = 'none';
          }
        } else {
          detailsDiv.style.display = 'none';
        }
      });
    },
  });
}

// Handle live filtering of student data
function handleLiveFiltering(inputValue) {
  if (inputValue.length < 5) {
    noDataAlertShown = false;
    return;
  }

  filteredStudents = filterDataByName(inputValue);

  if (filteredStudents.length > 0) {
    const studentNames = filteredStudents.map(student => student.FullTerm);
    generateStudentList(studentNames, 'Matching Students', filteredStudents.length, false);
    noDataAlertShown = false;
  } else if (!noDataAlertShown) {
    handleNoDataFound();
    noDataAlertShown = true;
  }
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.querySelector('input[type="search"]');

  if (searchInput) {
    // Clear previous event listeners
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    // Add new event listener
    newSearchInput.addEventListener('input', function(event) {
      const inputValue = event.target.value.trim();
      handleLiveFiltering(inputValue);
    });

    // Focus management
    newSearchInput.addEventListener('focus', (e) => {
      e.target.select();
    });

    // Initial focus
    window.addEventListener('load', () => {
      newSearchInput.focus();
      newSearchInput.select();
    });
  }
}

// Populate form with selected student data
function populateForm(student) {
  if (!student) return;

  // Assuming you have form fields with these IDs
  const fields = {
    'studentName': student.StudentFullName,
    'assessmentNumber': student.AssessmentNumber,
    'year': student.Year,
    'studentYear': student.StudentYear,
    'examType': student.ExamType,
    'examReference': student.ExamReference
  };

  // Update form fields
  Object.entries(fields).forEach(([fieldId, value]) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.value = value;
    }
  });

  // Close the modal if it's open
  if (swalInstance) {
    swalInstance.close();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeSearch();

  // Show download containers and learner image container
  document.querySelectorAll('[id^="fileDownload"]').forEach(container => {
    container.style.display = 'block';
  });

  const learnerImageContainer = document.getElementById('learnerImages');
  if (learnerImageContainer) {
    learnerImageContainer.style.display = 'block';
  }
});

// Export functions for external use
export {
  getAllStudents,
  filterDataByName,
  generateStudentList,
  initializeSearch,
  populateForm
};