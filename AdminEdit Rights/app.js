// Import Firebase configuration and database functions
import { auth, database } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { ref, get, set, remove, update, query, orderByChild, equalTo, onValue } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';

// Function to print student details
window.printStudentDetails = function(studentId) {
    if (!studentId) {
        console.error('Invalid student ID');
        return;
    }

    // Get student data from Firebase to include class and UPI
    const studentRef = ref(database, `students/${studentId}`);
    get(studentRef).then((snapshot) => {
        if (snapshot.exists()) {
            const studentData = snapshot.val();
            // Redirect to student-results.html with student data and auto_download parameter
            const resultsUrl = new URL('student-results.html', window.location.href);
            resultsUrl.searchParams.set('assessmentNo', studentId);
            resultsUrl.searchParams.set('class', encodeURIComponent(studentData.class));
            resultsUrl.searchParams.set('upi', encodeURIComponent(studentData.studentUPI));
            resultsUrl.searchParams.set('bypass_auth', 'true');
            resultsUrl.searchParams.set('auto_download', 'pdf');
            window.location.href = resultsUrl.toString();
        } else {
            console.error('Student data not found');
        }
    }).catch((error) => {
        console.error('Error fetching student data:', error);
    });
};

// Add this after Firebase initialization
const SUBJECTS_BY_GRADE = {
    'lower': { // Grade 1-3
        grades: ['Grade 1', 'Grade 2', 'Grade 3'],
        subjects: [
            'Indigenous Language',
            'Kiswahili',
            'Mathematics',
            'English',
            'Religious Education',
            'Environmental Activities',
            'Creative Activities'
        ]
    },
    'middle': { // Grade 4-6
        grades: ['Grade 4', 'Grade 5', 'Grade 6'],
        subjects: [
            'English',
            'Mathematics',
            'Kiswahili',
            'Religious Education',
            'Agriculture and Nutrition',
            'Social Studies',
            'Creative Arts',
            'Science and Technology'
        ]
    },
    'upper': { // Grade 7-9
        grades: ['Grade 7', 'Grade 8', 'Grade 9'],
        subjects: [
            'Social Studies and Life Skills',
            'Agriculture and Home Science',
            'Integrated Science and Health Education',
            'Pre-technical and Business Studies',
            'Visual and Performing Arts',
            'Mathematics',
            'English',
            'Kiswahili',
            'Religious Education'
        ]
    }
};

// Function to update year dropdown options
function updateYearDropdown() {
    const yearSelect = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    
    // Clear existing options
    yearSelect.innerHTML = '<option value="">Select Year</option>';
    
    // Add only current year as option
    const option = document.createElement('option');
    option.value = currentYear;
    option.textContent = currentYear;
    yearSelect.appendChild(option);
}

// Export the function to make it globally available
window.updateSubjectInputs = function() {
    const gradeSelect = document.getElementById('class');
    const subjectsContainer = document.getElementById('subjectScores');
    const selectedGrade = gradeSelect.value;
    let subjects = [];

    // Determine which subjects to show based on grade
    for (const level in SUBJECTS_BY_GRADE) {
        if (SUBJECTS_BY_GRADE[level].grades.includes(selectedGrade)) {
            subjects = SUBJECTS_BY_GRADE[level].subjects;
            break;
        }
    }

    // Create year selection dropdown if it doesn't exist
    const yearContainer = document.getElementById('yearContainer');
    if (!yearContainer) {
        const yearDiv = document.createElement('div');
        yearDiv.id = 'yearContainer';
        yearDiv.className = 'mb-3';
        yearDiv.innerHTML = `
            <label class="form-label">Academic Year</label>
            <select class="form-control" id="year" required>
                <option value="">Select Year</option>
            </select>
        `;
        subjectsContainer.parentNode.insertBefore(yearDiv, subjectsContainer);
        updateYearDropdown();
    }

    // Create inputs for each subject
    subjectsContainer.innerHTML = subjects.map(subject => `
        <div class="mb-3">
            <label class="form-label">${subject}</label>
            <input type="number" 
                   class="form-control subject-score" 
                   data-subject="${subject}"
                   min="0" 
                   max="100" 
                   required>
        </div>
    `).join('');
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const resultForm = document.getElementById('resultForm');
const logoutBtn = document.getElementById('logoutBtn');
const resultsSection = document.getElementById('resultsSection');
const viewSection = document.getElementById('viewSection');
const resultsTableBody = document.getElementById('resultsTableBody');
const printBtn = document.getElementById('printBtn');
const studentFilter = document.getElementById('studentFilter');
const gradeFilter = document.getElementById('gradeFilter');
const examTypeFilter = document.getElementById('examTypeFilter');
const termFilter = document.getElementById('termFilter');

// Add filter event listeners
studentFilter.addEventListener('input', loadResults);
gradeFilter.addEventListener('change', loadResults);
examTypeFilter.addEventListener('change', loadResults);
termFilter.addEventListener('change', loadResults);

// Initialize year dropdown when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateYearDropdown();
});

// Authentication state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        loginSection.classList.add('d-none');
        dashboardSection.classList.remove('d-none');
        loadResults();
    } else {
        loginSection.classList.remove('d-none');
        dashboardSection.classList.add('d-none');
    }
});

// Login form handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            // Login successful
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        })
        .catch((error) => {
            alert('Login failed: ' + error.message);
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
});

// Logout handler
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

function generateReportIdentifier(data) {
    const dataString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase();
}

// Save result handler
resultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const studentName = document.getElementById('studentName').value.trim();
    const studentUPI = document.getElementById('studentUPI').value.trim();
    const assessmentNo = document.getElementById('assessmentNo').value.trim();
    const studentClass = document.getElementById('class').value.trim();
    const examType = document.getElementById('examType').value.trim();
    const term = document.getElementById('term').value.trim();
    const selectedYear = parseInt(document.getElementById('year').value);
    const currentYear = new Date().getFullYear();

    // Enhanced year validation
    if (!selectedYear || selectedYear < currentYear || selectedYear > currentYear + 2) {
        alert('Please select a valid year. You can only submit results for the current year and the next two years.');
        return;
    }

    // Validate required fields
    if (!studentName || !studentUPI || !assessmentNo || !studentClass) {
        alert('Please fill in all required fields');
        return;
    }

    // Validate term and exam type selections
    if (!term || term === "Select Term") {
        alert('Please select a valid term');
        return;
    }
    if (!examType || examType === "Select Exam Type") {
        alert('Please select a valid exam type');
        return;
    }

    // Normalize and validate term, exam type, and year
    const normalizedTerm = term.toLowerCase();
    const normalizedExamType = examType.toLowerCase();
    const examKey = `${normalizedTerm}_${normalizedExamType}_${selectedYear}`.replace(/\s+/g, '_');

    // Check for existing result with same assessment number, exam type and term
    get(query(ref(database, 'results'), orderByChild('assessmentNo'), equalTo(assessmentNo)))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const existingResult = snapshot.val()[assessmentNo];
                if (existingResult && existingResult[examKey] && existingResult[examKey].subjects) {
                    // Show warning with options when same term, exam type, and year combination exists
                    const editChoice = confirm('A result with this assessment number, term, exam type, and year already exists.\n\nClick OK to edit the existing result\nClick Cancel to create a new entry');
                    if (editChoice) {
                        // Redirect to edit mode
                        editResult(assessmentNo, examKey);
                        return;
                    }
                    // User chose to create new entry, continue with submission
                    console.log('Creating new result entry');
                }
            }

            // Collect all subject scores
            const subjectScores = {};
            document.querySelectorAll('.subject-score').forEach(input => {
                const subject = input.dataset.subject;
                const score = parseInt(input.value);
                if (!isNaN(score)) { // Add validation for score input
                    subjectScores[subject] = score;
                }
            });

            // Validate that at least one subject score was entered
            if (Object.keys(subjectScores).length === 0) {
                alert('Please enter at least one subject score');
                return;
            }

            // Get existing results for this student
            get(query(ref(database, 'results'), orderByChild('studentName'), equalTo(studentName)))
                .then((snapshot) => {
                    let existingResults = {};
                    snapshot.forEach((childSnapshot) => {
                        const result = childSnapshot.val();
                        if (result.class === studentClass) {
                            existingResults = result;
                            return true;
                        }
                    });

                    // Initialize exam results if they don't exist
                    if (!existingResults[examKey]) {
                        existingResults[examKey] = {};
                    }

                    const reportData = {
                        studentName: studentName,
                        studentUPI: studentUPI,
                        assessmentNo: assessmentNo,
                        class: studentClass,
                        examType: examType,
                        term: term,
                        subjectScores: subjectScores,
                        examKey: examKey // Include examKey in the data
                    };
                    const reportIdentifier = generateReportIdentifier(reportData);

                    // Update the results object with proper data structure
                    const results = {
                        studentName: studentName,
                        studentUPI: studentUPI,
                        assessmentNo: assessmentNo,
                        class: studentClass,
                        date: new Date().toISOString(),
                        teacherId: user.uid,
                        examType: examType,
                        term: term,
                        reportIdentifier: reportIdentifier,
                        status: 'active',  // Add status to track result visibility
                        lastUpdated: new Date().toISOString(),
                        ...existingResults
                    };

                    // Add subject scores to the specific exam
                    if (!results[examKey].subjects) {
                        results[examKey].subjects = {};
                    }

                    // Add each subject score and calculate grades
                    Object.entries(subjectScores).forEach(([subject, score]) => {
                        results[examKey].subjects[subject] = score;
                        const gradeInfo = calculateGrade(score);
                        results[examKey].subjects[`${subject}_grade`] = gradeInfo.grade;
                        results[examKey].subjects[`${subject}_points`] = gradeInfo.points;
                    });

                    // Calculate mean score and grade for this exam
                    const meanScore = calculateMeanScore(results[examKey].subjects);
                    results[examKey].meanScore = meanScore;
                    results[examKey].meanGrade = calculateGrade(meanScore).grade;

                    // Save to Firebase using assessment number as key
                    set(ref(database, `results/${assessmentNo}`), results)
                        .then(() => {
                            // Also update student info in 'students' node
                            const studentData = {
                                studentName: studentName,
                                studentUPI: studentUPI,
                                assessmentNo: assessmentNo,
                                class: studentClass
                            };
                            const studentQuery = query(ref(database, 'students'), orderByChild('assessmentNo'), equalTo(assessmentNo));
                            get(studentQuery)
                                .then((studentSnapshot) => {
                                    set(ref(database, `students/${assessmentNo}`), studentData);
                                })
                                .catch((error) => {
                                    console.error('Error updating student info:', error);
                                    alert('Error updating student info: ' + error.message);
                                });

                            resultForm.reset();
                            alert('Results saved successfully!.These results cannot be edited once submitted not unless with Admin rights');
                            loadResults();
                        })
                        .catch((error) => {
                            alert('Error saving results: ' + error.message);
                        });
                });
        });
});

function calculateGrade(score) {
    if (score >= 80) return { grade: 'Exceeds Expectation', points: 4 };
    if (score >= 65) return { grade: 'Meets Expectation', points: 3 };
    if (score >= 50) return { grade: 'Approaches Expectation', points: 2 };
    return { grade: 'Below Expectation', points: 1 };
}

function calculateMeanScore(subjects) {
    const scores = Object.keys(subjects)
        .filter(key => !key.includes('_grade') && !key.includes('_points'))
        .map(subject => subjects[subject]);
    
    return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// Edit result functionality
let currentEditId = null;
let currentExamKey = null;

window.editResult = function(resultId, examKey) {
    currentEditId = resultId;
    currentExamKey = examKey;

    // Get result data from Firebase using modern SDK
    get(ref(database, `results/${resultId}`))
        .then((snapshot) => {
            const result = snapshot.val();
            const examData = result[examKey];

            if (!result || !examData) {
                throw new Error('Result not found');
            }

            // Populate edit form
            document.getElementById('editResultId').value = resultId;
            document.getElementById('editExamKey').value = examKey;
            document.getElementById('editStudentName').value = result.studentName;
            document.getElementById('editClass').value = result.class;

            // Add subject inputs
            const subjectScoresDiv = document.getElementById('editSubjectScores');
            subjectScoresDiv.innerHTML = '';

            Object.entries(examData.subjects)
                .filter(([key]) => !key.includes('_grade') && !key.includes('_points'))
                .forEach(([subject, score]) => {
                    subjectScoresDiv.innerHTML += `
                        <div class="mb-3">
                            <label class="form-label">${subject}</label>
                            <input type="number" 
                                   class="form-control edit-subject-score" 
                                   data-subject="${subject}"
                                   value="${score}"
                                   min="0" 
                                   max="100" 
                                   required>
                        </div>
                    `;
                });

            // Show modal
            const editModal = new bootstrap.Modal(document.getElementById('editModal'));
            editModal.show();
        })
        .catch(error => {
            console.error('Error loading result:', error);
            alert('Error loading result for editing');
        });
}

window.saveEditedResult= function() {
    if (!currentEditId || !currentExamKey) {
        alert('No result selected for editing');
        return;
    }

    // Get student assessment number from the form
    const assessmentNo = document.getElementById('editResultId').value;

    // Collect updated scores
    const subjectScores = {};
    document.querySelectorAll('.edit-subject-score').forEach(input => {
        const subject = input.dataset.subject;
        const score = parseInt(input.value);
        subjectScores[subject] = score;
    });

    // Get the result reference using modern SDK
    const resultRef = ref(database, `results/${assessmentNo}/${currentExamKey}/subjects`);

    // Prepare the update data
    const updates = {};
    Object.entries(subjectScores).forEach(([subject, score]) => {
        const gradeInfo = calculateGrade(score);
        updates[subject] = score;
        updates[`${subject}_grade`] = gradeInfo.grade;
        updates[`${subject}_points`] = gradeInfo.points;
    });

    // Update scores and grades using modern SDK
    update(resultRef, updates)
        .then(() => {
            alert('Results saved successfully');
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            editModal.hide();
            loadResults(); // Refresh the results table
        })
        .catch(error => {
            console.error('Error saving results:', error);
            alert('Error saving results');
        });

   

    // Calculate and update mean score
    const meanScore = Object.values(subjectScores).reduce((a, b) => a + b, 0) / Object.values(subjectScores).length;
    update(ref(database, `results/${assessmentNo}/${currentExamKey}`), {
        meanScore: meanScore,
        meanGrade: calculateGrade(meanScore).grade
    })
    .then(() => {
        alert('Result updated successfully');
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        editModal.hide();
        loadResults(); // Refresh the results table
    })
    .catch(error => {
        console.error('Error updating result:', error);
        alert('Error updating result');
    });
}

window.deleteResult = function() {
    if (!currentEditId || !currentExamKey) {
        alert('No result selected for deletion');
        return;
    }

    if (confirm('Are you sure you want to delete this result? This action cannot be undone.')) {
        remove(ref(database, `results/${currentEditId}/${currentExamKey}`))
            .then(() => {
                alert('Result deleted successfully');
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                editModal.hide();
                loadResults(); // Refresh the results table
            })
            .catch(error => {
                console.error('Error deleting result:', error);
                alert('Error deleting result');
            });
    }
}

// Add mass delete button and modal to the table header
const tableHeader = document.querySelector('thead tr');
if (tableHeader) {
    const actionHeader = tableHeader.querySelector('th:last-child');
    if (actionHeader) {
        actionHeader.innerHTML = `
            Actions
            <button class="btn btn-danger btn-sm ms-2" data-bs-toggle="modal" data-bs-target="#deleteModal">
                <i class="fas fa-trash"></i> Delete Results
            </button>
        `;
    }
}

// Add delete modal to the page
const deleteModal = document.createElement('div');
deleteModal.className = 'modal fade';
deleteModal.id = 'deleteModal';
deleteModal.innerHTML = `
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Delete Results</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label">Select Deletion Option:</label>
                    <select class="form-select" id="deleteOption">
                        <option value="all">All Results</option>
                        <option value="specific">Specific Grade</option>
                        <option value="multiple">Multiple Grades</option>
                    </select>
                </div>
                <div id="gradeSelection" class="d-none">
                    <div class="mb-3" id="singleGradeSelect">
                        <label class="form-label">Select Grade:</label>
                        <select class="form-select" id="deleteGrade">
                            <option value="">Choose Grade...</option>
                            <option value="Grade 1">Grade 1</option>
                            <option value="Grade 2">Grade 2</option>
                            <option value="Grade 3">Grade 3</option>
                            <option value="Grade 4">Grade 4</option>
                            <option value="Grade 5">Grade 5</option>
                            <option value="Grade 6">Grade 6</option>
                            <option value="Grade 7">Grade 7</option>
                            <option value="Grade 8">Grade 8</option>
                            <option value="Grade 9">Grade 9</option>
                        </select>
                    </div>
                    <div class="mb-3 d-none" id="multipleGradeSelect">
                        <label class="form-label">Select Grades:</label>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input grade-checkbox" value="Grade 1" id="grade1">
                            <label class="form-check-label" for="grade1">Grade 1</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input grade-checkbox" value="Grade 2" id="grade2">
                            <label class="form-check-label" for="grade2">Grade 2</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input grade-checkbox" value="Grade 3" id="grade3">
                            <label class="form-check-label" for="grade3">Grade 3</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input grade-checkbox" value="Grade 4" id="grade4">
                            <label class="form-check-label" for="grade4">Grade 4</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input grade-checkbox" value="Grade 5" id="grade5">
                            <label class="form-check-label" for="grade5">Grade 5</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input grade-checkbox" value="Grade 6" id="grade6">
                            <label class="form-check-label" for="grade6">Grade 6</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input grade-checkbox" value="Grade 7" id="grade7">
                            <label class="form-check-label" for="grade7">Grade 7</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input grade-checkbox" value="Grade 8" id="grade8">
                            <label class="form-check-label" for="grade8">Grade 8</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input grade-checkbox" value="Grade 9" id="grade9">
                            <label class="form-check-label" for="grade9">Grade 9</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger" onclick="massDeleteResults()">Delete</button>
            </div>
        </div>
    </div>
`;
document.body.appendChild(deleteModal);

// Add event listener for delete option change
document.getElementById('deleteOption').addEventListener('change', function() {
    const gradeSelection = document.getElementById('gradeSelection');
    const singleGradeSelect = document.getElementById('singleGradeSelect');
    const multipleGradeSelect = document.getElementById('multipleGradeSelect');

    if (this.value === 'specific') {
        gradeSelection.classList.remove('d-none');
        singleGradeSelect.classList.remove('d-none');
        multipleGradeSelect.classList.add('d-none');
    } else if (this.value === 'multiple') {
        gradeSelection.classList.remove('d-none');
        singleGradeSelect.classList.add('d-none');
        multipleGradeSelect.classList.remove('d-none');
    } else {
        gradeSelection.classList.add('d-none');
    }
});

// Mass delete function
window.massDeleteResults = function() {
    const deleteOption = document.getElementById('deleteOption').value;
    let selectedGrades = [];

    if (deleteOption === 'specific') {
        const grade = document.getElementById('deleteGrade').value;
        if (grade) selectedGrades.push(grade);
    } else if (deleteOption === 'multiple') {
        document.querySelectorAll('.grade-checkbox:checked').forEach(checkbox => {
            selectedGrades.push(checkbox.value);
        });
    }

    // Validate selection
    if ((deleteOption === 'specific' || deleteOption === 'multiple') && selectedGrades.length === 0) {
        alert('Please select at least one grade to delete.');
        return;
    }

    // Prepare confirmation message
    let confirmMessage = '';
    if (deleteOption === 'all') {
        confirmMessage = 'Are you sure you want to delete ALL results across all grades?';
    } else if (deleteOption === 'specific') {
        confirmMessage = `Are you sure you want to delete all results for ${selectedGrades[0]}?`;
    } else {
        confirmMessage = `Are you sure you want to delete all results for the selected grades: ${selectedGrades.join(', ')}?`;
    }

    if (!confirm(confirmMessage)) return;

    const resultsRef = ref(database, 'results');
    get(resultsRef).then((snapshot) => {
        if (!snapshot.exists()) return;

        const updates = {};
        snapshot.forEach((childSnapshot) => {
            const result = childSnapshot.val();
            if (deleteOption === 'all' || selectedGrades.includes(result.class)) {
                updates[childSnapshot.key] = null;
            }
        });

        update(ref(database, 'results'), updates)
            .then(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                modal.hide();
                alert('Results deleted successfully');
                loadResults();
            })
            .catch((error) => {
                console.error('Error deleting results:', error);
                alert('Error deleting results: ' + error.message);
            });
    });
};

// Load and display results
function loadResults() {
    const resultsRef = ref(database, 'results');
    const studentSearch = studentFilter.value.toLowerCase();
    const gradeSearch = gradeFilter.value;

    // Add click handler for the main print button
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.onclick = function() {
            const selectedRows = resultsTableBody.querySelectorAll('tr[data-student-id]');
            if (selectedRows.length > 0) {
                const studentId = selectedRows[0].dataset.studentId;
                printStudentDetails(studentId);
            }
        };
    }
    
    onValue(resultsRef, (snapshot) => {
        resultsTableBody.innerHTML = '';
        
        snapshot.forEach((childSnapshot) => {
            const result = childSnapshot.val();
            
            // Apply filters
            if (studentSearch && !result.studentName.toLowerCase().includes(studentSearch)) {
                return;
            }
            if (gradeSearch && result.class !== gradeSearch) {
                return;
            }
            const examTypeSearch = examTypeFilter.value;
            if (examTypeSearch && result.examType !== examTypeSearch) {
                return;
            }
            const termSearch = termFilter.value;
            if (termSearch && result.term !== termSearch) {
                return;
            }

            Object.keys(result)
                .filter(key => key.includes('term_'))
                .forEach(examKey => {
                    const examData = result[examKey];
                    const row = document.createElement('tr');
row.dataset.studentId = result.assessmentNo;
                    
                    row.innerHTML = `
                        <td>
                            ${result.studentName}<br>
                            <small class="text-muted">UPI: ${result.studentUPI}</small><br>
                            <small class="text-muted">Assessment No: ${result.assessmentNo}</small>
                        </td>
                        <td>${result.class}</td>
                        <td>${result.term}</td>
                        <td>${result.examType}</td>
                        <td>
                            ${Object.entries(examData.subjects)
                                .filter(([key]) => !key.includes('_grade') && !key.includes('_points'))
                                .map(([subject, score]) => `
                                    ${subject}: ${score} 
                                    <span class="badge ${getGradeBadgeClass(examData.subjects[`${subject}_grade`])}">
                                        ${examData.subjects[`${subject}_grade`]}
                                    </span>
                                `).join('<br>')}
                        </td>
                        <td>${examData.meanScore.toFixed(2)}</td>
                        <td><span class="badge ${getGradeBadgeClass(examData.meanGrade)}">${examData.meanGrade}</span></td>
                        <td>${new Date(result.date).toLocaleDateString()}</td>
                        <td>
                            <div class="btn-group" style="flex-wrap: wrap;">
                                <button class="btn btn-sm btn-outline-primary mb-1" 
                                    onclick="viewDetailedResults('${childSnapshot.key}', '${examKey}')">
                                    <i class="fas fa-chart-line"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-secondary mb-1" 
                                    onclick="editResult('${childSnapshot.key}', '${examKey}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger mb-1" 
                                    onclick="deleteResultDirect('${childSnapshot.key}', '${examKey}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-info mb-1" 
                                    onclick="printStudentDetails('${childSnapshot.key}')">
                                    <i class="fas fa-print"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    
                    resultsTableBody.appendChild(row);
                });
        });

        // Show message if no results found
        if (resultsTableBody.children.length === 0) {
            resultsTableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-4">
                        <i class="fas fa-search me-2"></i>
                        No results found for the selected filters
                    </td>
                </tr>
            `;
        }
    });
}

window.deleteResultDirect = function(resultId, examKey) {
    if (confirm('Are you sure you want to delete this result? This action cannot be undone.')) {
        remove(ref(database, `results/${resultId}/${examKey}`))
            .then(() => {
                alert('Result deleted successfully');
                loadResults(); // Refresh the results table
            })
            .catch(error => {
                console.error('Error deleting result:', error);
                alert('Error deleting result');
            });
    }
}

function getGradeBadgeClass(grade) {
    const classes = {
        'Exceeds Expectation': 'bg-success',
        'Meets Expectation': 'bg-info',
        'Approaches Expectation': 'bg-warning',
        'Below Expectation': 'bg-danger'
    };
    return classes[grade] || 'bg-secondary';
}

// Student details view functionality
window.viewDetailedResults = function(studentId, examKey) {
    // Remove any existing modal
    const existingModal = document.getElementById('detailsModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = createDetailsModal();
    document.body.appendChild(modal);

    // Fetch student details
    get(ref(database, `results/${studentId}`))
        .then((snapshot) => {
            const studentData = snapshot.val();
            if (!studentData) {
                throw new Error('No student data found');
            }

            const examData = studentData[examKey];
            if (!examData || !examData.subjects) {
                throw new Error('No exam data found');
            }

            // Wait for modal to be fully rendered
            setTimeout(() => {
                try {
                    // Update modal content
                    updateModalContent(modal, studentData, examData, examKey);
                    
                    // Show modal using Bootstrap
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();
                } catch (error) {
                    console.error('Error updating modal content:', error);
                    alert('Error displaying student details');
                }
            }, 100);
        })
        .catch(error => {
            console.error('Error fetching student details:', error);
            alert(error.message || 'Error loading student details');
            if (modal) {
                modal.remove();
            }
        });
}

function createDetailsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'detailsModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Student Performance Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div id="studentDetails"></div>
                    <div id="performanceCharts" class="mt-4">
                        <canvas id="studentPerformanceChart"></canvas>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

function updateModalContent(modal, studentData, examData, examKey) {
    const studentDetails = modal.querySelector('#studentDetails');
    const examDate = new Date(studentData.date).toLocaleDateString();
    const meanScore = examData.meanScore || calculateMeanScore(examData.subjects);
    const meanGrade = examData.meanGrade || calculateGrade(meanScore).grade;
    
    // Add school details
    const schoolDetails = {
        name: 'Kanyadet School',
        address: 'P.O. Box 123, Nairobi',
        phone: '+254 123 456 78009',
        email: 'info@kanyadetschool.com',
        logo: './data/images/logo.png'
    };

    studentDetails.innerHTML = `
        <div class="text-center mb-4">
            <img src="${schoolDetails.logo}" alt="School Logo" style="height: 80px;">
            <h4 class="mt-2">${schoolDetails.name}</h4>
            <p class="mb-0">${schoolDetails.address}</p>
            <p class="mb-0">${schoolDetails.phone}</p>
            <p class="mb-3">${schoolDetails.email}</p>
        </div>
        <div class="row">
            <div class="col-md-6">
                <h6>Student: ${studentData.studentName}</h6>
                <p>Class: ${studentData.class}</p>
                <p>Exam: ${examKey.replace(/_/g, ' ').toUpperCase()}</p>
                <p>Date: ${examDate}</p>
            </div>
            <div class="col-md-6">
                <h6>Mean Score: ${meanScore.toFixed(2)}%</h6>
                <p>Mean Grade: ${meanGrade}</p>
            </div>
        </div>
        <div class="table-responsive mt-3">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Score</th>
                        <th>Grade</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateSubjectsTableContent(examData.subjects)}
                </tbody>
            </table>
        </div>
    `;

    // Initialize performance chart
    initializePerformanceChart(modal, examData.subjects);
}

function generateSubjectsTableContent(subjects) {
    return Object.entries(subjects)
        .filter(([key]) => !key.includes('_grade') && !key.includes('_points'))
        .map(([subject, score]) => `
            <tr>
                <td>${subject}</td>
                <td>${score}%</td>
                <td>${calculateGrade(score).grade}</td>
                <td>${getRemarks(score)}</td>
            </tr>
        `).join('');
}

function getRemarks(score) {
    if (score >= 80) return 'Outstanding performance exceeding grade level standards';
    if (score >= 65) return 'Consistent performance meeting grade level standards';
    if (score >= 50) return 'Inconsistent performance approaching grade level standards';
    return 'Needs significant support to meet grade level standards';
}

function initializePerformanceChart(modal, subjects) {
    try {
        const canvas = modal.querySelector('#studentPerformanceChart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const subjectData = Object.entries(subjects)
            .filter(([key]) => !key.includes('_grade') && !key.includes('_points'));

        if (!subjectData.length) {
            throw new Error('No subject data available');
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: subjectData.map(([subject]) => subject),
                datasets: [{
                    label: 'Subject Scores',
                    data: subjectData.map(([, score]) => score),
                    backgroundColor: '#4a90e2',
                    borderColor: '#357abd',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Score (%)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing chart:', error);
        const chartContainer = modal.querySelector('#performanceCharts');
        chartContainer.innerHTML = '<p class="text-danger">Error loading performance chart</p>';
    }
}

window.printStudentReport = function(studentId, examKey) {
    get(ref(database, `results/${studentId}`))
        .then((snapshot) => {
            const studentData = snapshot.val();
            const examData = studentData[examKey];
            const printWindow = window.open('', '_blank');
            const schoolDetails = {
                name: 'Kanyadet School',
                address: 'P.O. Box 123, Nairobi',
                phone: '+254 123 456 789',
                email: 'info@kanyadetschool.com',
                logo: 'logo.png'
            };

            const examDate = new Date(studentData.date).toLocaleDateString();
            const meanScore = examData.meanScore || calculateMeanScore(examData.subjects);
            const meanGrade = examData.meanGrade || calculateGrade(meanScore).grade;

            const subjectsTable = generateSubjectsTableContent(examData.subjects);

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Student Performance Report</title>
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                        <style>
                            @media print {
                                @page { size: A4; margin: 2cm; }
                                body { font-size: 12pt; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container mt-4">
                            <div class="text-center mb-4">
                                <img src="${schoolDetails.logo}" alt="School Logo" style="height: 80px;">
                                <h4 class="mt-2">${schoolDetails.name}</h4>
                                <p class="mb-0">${schoolDetails.address}</p>
                                <p class="mb-0">${schoolDetails.phone}</p>
                                <p class="mb-3">${schoolDetails.email}</p>
                                <h5>Student Performance Report</h5>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Student: ${studentData.studentName}</h6>
                                    <p>UPI Number: ${studentData.studentUPI}</p>
                                    <p>Assessment No: ${studentData.assessmentNo}</p>
                                    <p>Class: ${studentData.class}</p>
                                </div>
                                <div class="col-md-6 text-md-end">
                                    <p>Exam: ${examKey.replace(/_/g, ' ').toUpperCase()}</p>
                                    <p>Date: ${examDate}</p>
                                    <h6>Mean Score: ${meanScore.toFixed(2)}%</h6>
                                    <p>Mean Grade: ${meanGrade}</p>
                                </div>
                            </div>
                            <div class="table-responsive mt-3">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Subject</th>
                                            <th>Score</th>
                                            <th>Grade</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${subjectsTable}
                                    </tbody>
                                </table>
                            </div>
                            <div class="mt-4">
                                <p><strong>Teacher's Comments:</strong> _______________________________________________</p>
                                <p><strong>Principal's Comments:</strong> ______________________________________________</p>
                                <div class="row mt-4">
                                    <div class="col-md-6">
                                        <p>Teacher's Signature: _________________</p>
                                        <p>Date: _________________</p>
                                    </div>
                                    <div class="col-md-6 text-md-end">
                                        <p>Principal's Signature: _________________</p>
                                        <p>School Stamp: _________________</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <script>
                            window.onload = () => window.print();
                        </script>
                    </body>
                </html>
            `);

            printWindow.document.close();
        })
        .catch(error => {
            console.error('Error generating report:', error);
            alert('Error generating student report');
        });
}

function printStudentDetails() {
    const modalContent = document.querySelector('#detailsModal .modal-content').cloneNode(true);
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
        <html>
            <head>
                <title>Student Performance Report</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                        .modal-footer { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="container mt-4">
                    ${modalContent.innerHTML}
                </div>
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

// Navigation handlers
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.dataset.section;
        
        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.add('d-none');
        });
        
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.remove('active');
        });
        
        document.getElementById(`${section}Section`).classList.remove('d-none');
        e.target.classList.add('active');
    });
});

// Print functionality
printBtn.addEventListener('click', () => {
    window.print();
});