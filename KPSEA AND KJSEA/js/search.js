// Import grade data
import { Year2024 } from './2024.js';
import { Year2025 } from './2025.js';
import { SchoolInternalResults } from './School Internal Results.js';

// Combine all grade data
const grades = {
  SchoolInternalResults,
  Year2025,
  Year2024,
};

// Global state variables
let allStudentsList = [];

// Get all students with their details
function getAllStudents() {
  return Object.values(grades)
    .flatMap(grade => 
      grade.years.flatMap(year => 
        year.terms.flatMap(term => {
          if (term.term.includes('Total Graduands') || !term.exams) return [];
          
          const termMatch = term.term.match(/{\d+}\. (A\d+) - (.+)/);
          if (!termMatch) return [];

          const [_, assessmentNumber, fullName] = termMatch;

          return term.exams.map(exam => ({
            StudentFullName: fullName.trim(),
            AssessmentNumber: assessmentNumber,
            Year: grade.title || 'Unknown Year',
            StudentYear: year.year || 'Unknown Student Year',
            ExamReference: exam || 'No Exam Reference',
            ExamType: exam.split('/')[0],
            SearchableText: `${fullName.trim()} ${assessmentNumber} ${exam}`.toLowerCase()
          }));
        })
      )
    )
    .filter(student => student.StudentFullName && student.AssessmentNumber);
}

// Filter students based on search input
function filterDataByName(searchInput) {
  const inputLowerCase = searchInput.toLowerCase();
  
  if (allStudentsList.length === 0) {
    allStudentsList = getAllStudents();
  }

  return allStudentsList.filter(student => 
    student.SearchableText.includes(inputLowerCase)
  );
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  allStudentsList = getAllStudents();
});