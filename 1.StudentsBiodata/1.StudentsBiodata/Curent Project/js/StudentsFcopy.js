// Import multiple grade data
// import { Grade2 } from './Grade2.js';
// Import all the grade data modules (e.g., Grade3, Grade4, etc.)
import { Grade1 } from './Grade 1.js';
import { Grade2 } from './Grade 2.js';
import { Grade3 } from './Grade 3.js';
import { Grade4 } from './Grade 4.js';
import { Grade5 } from './Grade 5.js';
import { Grade6 } from './Grade 6.js';
import { Grade7 } from './Grade 7.js';
import { Grade8 } from './Grade 8.js';
import { Grade9 } from './Grade 9.js';

// Combine and process all student data
const getAllStudents = () => {
    const allStudents = [
        ...Grade2.map(student => ({ ...student, gradeLabel: 'Grade 2' })),
        ...Grade1.map(student => ({ ...student, gradeLabel: 'Grade 1' })),
        ...Grade2.map(student => ({ ...student, gradeLabel: 'Grade 2' })),
        ...Grade3.map(student => ({ ...student, gradeLabel: 'Grade 3' })),
        ...Grade4.map(student => ({ ...student, gradeLabel: 'Grade 4' })),
        ...Grade5.map(student => ({ ...student, gradeLabel: 'Grade 5' })),
        ...Grade6.map(student => ({ ...student, gradeLabel: 'Grade 6' })),
        ...Grade7.map(student => ({ ...student, gradeLabel: 'Grade 7' })),
        ...Grade8.map(student => ({ ...student, gradeLabel: 'Grade 8' })),
        ...Grade9.map(student => ({ ...student, gradeLabel: 'Grade 9' })),
    ];
    
    // Sort students alphabetically by name
    return allStudents.sort((a, b) => 
        a.StudentFullName.localeCompare(b.StudentFullName)
    );
};

// Create and insert the HTML structure
const createStudentListHTML = () => {
    const allStudents = getAllStudents();
    const studentHTML = `
        <div class="studentsNames">
            <ul id="studentList" class="student-list">
                ${allStudents.map(student => `
                    <li onclick="selectStudent('${student.StudentFullName}')" 
                        data-grade="${student.gradeLabel}">
                        ${student.StudentFullName} 
                        <span class="grade-indicator">${student.gradeLabel}</span>
                    </li>
                `).join('')}
            </ul>
            <div id="scrollIndicator" class="scroll-indicator">
                <i class="fa-solid fa-circle-arrow-down"></i>
            </div>
            <p id="counter" class="counter"></p>
        </div>
    `;
    document.body.innerHTML += studentHTML;
};

// Initialize the DOM elements
const initializeElements = () => {
    const students = document.querySelectorAll('#studentList li');
    const scrollIndicator = document.getElementById('scrollIndicator');
    const studentList = document.getElementById('studentList');
    const searchInput = document.getElementById('search');
    
    return { students, scrollIndicator, studentList, searchInput };
};

// Enhanced search functionality with grade filtering
const onSearch = (elements) => {
    const { students } = elements;
    const searchValue = elements.searchInput.value.trim().toLowerCase();
    let matchCount = 0;

    students.forEach(student => {
        const originalStudentName = student.textContent.replace(/^\d+\.\s/, '').trim();
        const studentNameLowerCase = originalStudentName.toLowerCase();
        const studentGrade = student.getAttribute('data-grade');
        
        // Check if the search term matches either the name or grade
        const matchesSearch = 
        
            studentNameLowerCase.includes(searchValue) || 
            studentGrade.toLowerCase().includes(searchValue);
        
        if (matchesSearch) {
            matchCount++;
            student.style.display = 'block';
            // Keep the grade indicator when updating the numbered list
            student.innerHTML = `${matchCount}. ${originalStudentName.split('Grade')[0].trim()} 
                               <span class="grade-indicator">${studentGrade}</span>`;
        } else {
            student.style.display = 'none';
        }
    });

    updateScrollIndicator(elements);
    updateCounter(elements, matchCount);
};

// Add counter update function
const updateCounter = (elements, matchCount) => {
    const counter = document.getElementById('counter');
    if (counter) {
        counter.textContent = `${matchCount} student${matchCount !== 1 ? 's' : ''} found`;
    }
};

// Student selection handler
const selectStudent = (studentName) => {
    const searchInput = document.getElementById('search');
    searchInput.value = studentName;
    searchInput.dispatchEvent(new Event('input'));
    
};

// Scroll indicator update
const updateScrollIndicator = (elements) => {
    const { studentList, scrollIndicator } = elements;
    scrollIndicator.style.display = 
        studentList.scrollHeight > studentList.clientHeight ? 'block' : 'none';
};

// Initialize the application
const initializeApp = () => {
    createStudentListHTML();
    const elements = initializeElements();
    
    // Set up event listener for search
    elements.searchInput.addEventListener('input', () => onSearch(elements));
    
    // Initial scroll indicator check
    updateScrollIndicator(elements);
    
    // Make selectStudent available globally
    window.selectStudent = selectStudent;
};

// Add some basic CSS for the grade indicators
const addStyles = () => {
    const styles = `
        <style>
            .grade-indicator {
                font-size: 0.8em;
                color: #666;
                margin-left: 8px;
                padding: 5px 6px;
                border-radius: 4px;
                background-color: #f0f0f0;
                 -webkit-box-shadow: -3px -3px 5px white, 3px 3px 5px rgba(209, 209, 209, 0.705);
            box-shadow: -3px -3px 5px white, 3px 3px 5px rgba(209, 209, 209, 0.705);
            }
        
            .counter {
                text-align: center;
                margin-top: 10px;
                color: #666;
            }
        </style>
    `;
    document.head.innerHTML += styles;
};

// Start the application
addStyles();
initializeApp();



