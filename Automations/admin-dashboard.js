// Import Firebase configuration
import { auth, database } from './firebase-config.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const classFilter = document.getElementById('classFilter');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsTableBody = document.getElementById('resultsTableBody');
const printClassResults = document.getElementById('printClassResults');
const printPreviewModal = new bootstrap.Modal(document.getElementById('printPreviewModal'));
const printPreviewContent = document.getElementById('printPreviewContent');
const confirmPrint = document.getElementById('confirmPrint');

// Check authentication
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Verify admin role with error handling
    get(ref(database, 'users/user1'))
        .then(snapshot => {
            const userData = snapshot.val();
            if (!userData || userData.role !== 'admin') {
                auth.signOut();
                window.location.href = 'admin-login.html';
            } else {
                loadStudentResults();
                loadClassOptions();
            }
        })
        .catch(error => {
            console.error('Error verifying admin role:', error);
            auth.signOut();
            window.location.href = 'admin-login.html';
        });
});

// Load class options
async function loadClassOptions() {
    const studentsRef = ref(database, 'students');
    const snapshot = await get(studentsRef);
    const students = snapshot.val() || {};

    const classes = new Set();
    Object.values(students).forEach(student => {
        if (student.class) classes.add(student.class);
    });

    classFilter.innerHTML = '<option value="">All Classes</option>';
    Array.from(classes).sort().forEach(className => {
        classFilter.innerHTML += `<option value="${className}">${className}</option>`;
    });
}

// Load and display student results
async function loadStudentResults() {
    try {
        const resultsRef = ref(database, 'results');
        const studentsRef = ref(database, 'students');
        
        // Fetch both results and students data
        const [resultsSnapshot, studentsSnapshot] = await Promise.all([
            get(resultsRef),
            get(studentsRef)
        ]);
        
        const results = resultsSnapshot.val() || {};
        const students = studentsSnapshot.val() || {};
        
        // Combine student info with their results
        const combinedData = {};
        Object.entries(students).forEach(([studentId, studentInfo]) => {
            const resultData = results[studentId] || {};
            
            // Extract student information
            const studentName = studentInfo.name || studentInfo.studentName || resultData.studentname || 'N/A';
            const studentClass = studentInfo.class || resultData.class || 'N/A';
            const studentUPI = studentInfo.upi || studentInfo.studentUPI || resultData.studentupi || 'N/A';
            
            // Extract exam information
            const examTerm = resultData.term || studentInfo.term || 'N/A';
            const examType = resultData.examType || resultData.examtype || studentInfo.examType || studentInfo.examtype || 'N/A';
            const examDate = resultData.date || studentInfo.date || 'N/A';
            
            // Handle subjects and scores
            const subjects = {};
            const processSubjects = (subjectsData) => {
                if (!subjectsData || typeof subjectsData !== 'object') return;
                
                Object.entries(subjectsData).forEach(([subject, data]) => {
                    if (typeof data === 'object') {
                        const score = data.score || data[subject] || 'N/A';
                        subjects[subject] = {
                            score: typeof score === 'number' ? score : (typeof score === 'string' && !isNaN(parseFloat(score)) ? parseFloat(score) : 'N/A'),
                            grade: data.grade || data[`${subject}_grade`] || calculateGrade(score) || 'N/A',
                            points: data.points || data[`${subject}_points`] || 'N/A'
                        };
                    } else {
                        const score = data;
                        subjects[subject] = {
                            score: typeof score === 'number' ? score : (typeof score === 'string' && !isNaN(parseFloat(score)) ? parseFloat(score) : 'N/A'),
                            grade: calculateGrade(score) || 'N/A',
                            points: 'N/A'
                        };
                    }
                });
            };
            
            processSubjects(resultData.subjects);
            if (Object.keys(subjects).length === 0) {
                processSubjects(studentInfo.subjects);
            }
            
            // Combine all data
            combinedData[studentId] = {
                studentname: studentName,
                class: studentClass,
                studentupi: studentUPI,
                term: examTerm,
                examtype: examType,
                subjects: subjects,
                date: examDate
            }
        });

        
        displayResults(combinedData);
    } catch (error) {
        console.error('Error loading student results:', error);
        resultsTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading results: ${error.message}</td></tr>`;
    }
}

// Display results in table
function displayResults(results) {
    resultsTableBody.innerHTML = '';
    
    const searchTerm = searchInput.value.toLowerCase();
    const selectedClass = classFilter.value;

    if (Object.keys(results).length === 0) {
        resultsTableBody.innerHTML = `<tr><td colspan="10" class="text-center">No results found</td></tr>`;
        return;
    }

    Object.entries(results).forEach(([id, result]) => {
        if (selectedClass && result.class !== selectedClass) return;
        if (searchTerm && 
            !result.studentname?.toLowerCase().includes(searchTerm) && 
            !id.toLowerCase().includes(searchTerm)) return;

        const row = document.createElement('tr');
        
        // Student Name
        const nameCell = document.createElement('td');
        nameCell.textContent = result.studentname || 'N/A';
        row.appendChild(nameCell);

        // Grade
        const gradeCell = document.createElement('td');
        gradeCell.textContent = result.class || 'N/A';
        row.appendChild(gradeCell);

        // UPI Number
        const upiCell = document.createElement('td');
        upiCell.textContent = result.studentupi || 'N/A';
        row.appendChild(upiCell);

        // Term
        const termCell = document.createElement('td');
        termCell.textContent = result.term || 'N/A';
        row.appendChild(termCell);

        // Exam Type
        const examTypeCell = document.createElement('td');
        examTypeCell.textContent = result.examtype || 'N/A';
        row.appendChild(examTypeCell);



        // Date
        const dateCell = document.createElement('td');
        dateCell.textContent = result.date || 'N/A';
        row.appendChild(dateCell);

        // Actions
        const actionCell = document.createElement('td');
        actionCell.innerHTML = `
            <div class="btn-group">
                <button class="btn btn-sm btn-primary print-result" data-student-id="${id}">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-sm btn-info edit-result" data-student-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
        row.appendChild(actionCell);

        resultsTableBody.appendChild(row);
    });
}

function calculateMeanScore(subjects) {
    if (!subjects || Object.keys(subjects).length === 0) return 'N/A';
    const scores = Object.values(subjects)
        .map(subject => {
            const score = subject.score;
            if (typeof score === 'number' && !isNaN(score)) return score;
            if (typeof score === 'string' && !isNaN(parseFloat(score))) return parseFloat(score);
            return null;
        })
        .filter(score => score !== null);
    if (scores.length === 0) return 'N/A';
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function calculateGrade(score) {
    if (score >= 80) return 'A';
    if (score >= 75) return 'A-';
    if (score >= 70) return 'B+';
    if (score >= 65) return 'B';
    if (score >= 60) return 'B-';
    if (score >= 55) return 'C+';
    if (score >= 50) return 'C';
    if (score >= 45) return 'C-';
    if (score >= 40) return 'D+';
    if (score >= 35) return 'D';
    if (score >= 30) return 'D-';
    return 'E';
}


// Format subjects for display
function formatSubjects(subjects) {
    if (!subjects || typeof subjects !== 'object') return 'N/A';
    return Object.entries(subjects)
        .map(([subject, data]) => {
            const score = typeof data.score === 'number' ? data.score.toFixed(2) : (data.score || 'N/A');
            const grade = data.grade || calculateGrade(data.score) || 'N/A';
            const points = data.points || 'N/A';
            return `${subject}: ${score} (${grade})`;
        })
        .join(', ') || 'N/A';
}

// Calculate total score
function calculateTotalScore(subjects) {
    if (!subjects) return 0;
    return Object.values(subjects).reduce((sum, score) => sum + score, 0);
}

// Generate print preview content
function generatePrintContent(students, className = '') {
    const title = className ? `Class ${className} Results` : 'All Classes Results';
    let content = `
        <div class="print-content">
            <h3 class="text-center mb-4">${title}</h3>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>STUDENT NAME</th>
                        <th>CLASS</th>
                        <th>UPI NUMBER</th>
                        <th>TERM</th>
                        <th>EXAM TYPE</th>
                        <th>SUBJECT SCORES</th>
                        <th>MEAN SCORE</th>
                    </tr>
                </thead>
                <tbody>
    `;

    Object.entries(students).forEach(([id, student]) => {
        if (className && student.class !== className) return;
        content += `
            <tr>
                <td>${student.studentName || 'N/A'}</td>
                <td>${student.class || 'N/A'}</td>
                <td>${student.studentUPI || 'N/A'}</td>
                <td>${student.term || 'N/A'}</td>
                <td>${student.examType || 'N/A'}</td>
                <td>${formatSubjects(student.subjects)}</td>
                <td>${calculateMeanScore(student.subjects) === 'N/A' ? 'N/A' : calculateMeanScore(student.subjects).toFixed(2)}</td>
            </tr>
        `;
    });

    content += `
                </tbody>
            </table>
        </div>
    `;

    return content;
}

// Event Listeners
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

classFilter.addEventListener('change', () => {
    loadStudentResults();
});

searchBtn.addEventListener('click', () => {
    loadStudentResults();
});

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        loadStudentResults();
    }
});

printClassResults.addEventListener('click', async () => {
    const resultsRef = ref(database, 'results');
    const snapshot = await get(resultsRef);
    const resultsData = snapshot.val() || {};
    
    printPreviewContent.innerHTML = generatePrintContent(resultsData, classFilter.value);
    printPreviewModal.show();
});

confirmPrint.addEventListener('click', () => {
    window.print();
});

// Handle individual student result printing
resultsTableBody.addEventListener('click', async (e) => {
    const printBtn = e.target.closest('.print-result');
    if (!printBtn) return;

    const studentId = printBtn.dataset.studentId;
    const studentRef = ref(database, `students/${studentId}`);
    const snapshot = await get(studentRef);
    const student = snapshot.val();

    if (student) {
        // Redirect to student-results.html with student data and auto_download parameter
        const resultsUrl = new URL('student-results.html', window.location.href);
        resultsUrl.searchParams.set('assessmentNo', studentId);
        resultsUrl.searchParams.set('bypass_auth', 'true');
        resultsUrl.searchParams.set('auto_download', 'pdf');
        window.location.href = resultsUrl.toString(); // Use direct redirect instead of opening in new tab
    }
});