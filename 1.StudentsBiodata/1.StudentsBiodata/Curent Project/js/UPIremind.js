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

// Example: you could have an array of all the grade modules you need
const allGrades = 
    [
        Grade1,
        Grade2,
        Grade3,
        Grade4,
        Grade5,
        Grade6,
        Grade7,
        Grade8,
        Grade9,

      ];  // Add all the grade modules you need

// Function to initialize and display the modal with the student data
window.onload = function() {
    function toSentenceCase(str) {
        return str.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
    }

    // Dynamically create the HTML structure for the modal and append it to the body
    const modalHtml = `
        <div class="section">
            <input class="modal-btn" type="checkbox" id="modal-btn" name="modal-btn"/>
                  
            <div class="modal">     
                <div class="modal-wrap" id="modalContent">  
                    <div class="sub">
                        <p><i class="fas fa-graduation-cap"></i>Students Without UPI 2025</p>
                        <div id="gradesContainer"></div>
                        <div class="ui active inline loader"></div>
                 
                    </div>
                </div>              
            </div>
  
        </div>
    `;
    // Append the modal HTML to the body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    let content = '';

    // Loop through each grade group (e.g., Grade3, Grade4)
    allGrades.forEach(gradeGroup => {
        // Grade Group is now the imported array, like Grade3 or Grade4
        const grade = gradeGroup[0].CurentGrade; // Extract grade name from the first student entry

        // Filter out students who are missing a UPI
        const pendingUPIStudents = gradeGroup.filter(student => student.UPI === '');

        // Calculate the total number of students missing UPI in the current grade
        const totalPendingUPI = pendingUPIStudents.length;

        // If there are students missing UPI in this grade, create the content for this grade
        if (totalPendingUPI > 0) {
            content += `
                <h3>${grade} (Total Learners Missing UPI: ${totalPendingUPI})</h3>
                <ul>
                    ${pendingUPIStudents.map(student => `
                        <li>
                            <strong>Name:</strong> ${toSentenceCase(student.StudentFullName)}<br>
                            <strong>Assessment Number:</strong> ${student.AssessmentNumber}<br>
                            <strong>UPI:</strong> ${student.UPI || 'Not Assigned'}
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            // If no students are missing UPI, display a message
            content += `
                <h3>${grade} (All learners have UPI assigned)</h3>
            `;
        }
    });

    // Check if there is any content for pending UPI students and update the modal content accordingly
    if (content) {
        document.getElementById('modal-btn').checked = true; // Trigger the modal open
        document.getElementById('modalContent').innerHTML = `
            <h2>Students without UPI 2025</h2>
             <button id="closeModal" class="close-btn">Close Modal</button>
            ${content}
        `;
    } else {
        document.getElementById('modalContent').innerHTML = `
            <h2>All students have UPI numbers assigned!</h2>
        `;
    }

    // Add event listener for the close button inside the modal
    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('modal-btn').checked = false; // Uncheck the checkbox to close the modal
    });

    // Add event listener for outside click to close the modal
    const modal = document.querySelector('.modal');
    const modalWrap = document.querySelector('.modal-wrap');

    modal.addEventListener('click', function(e) {
        // If the click is outside the modal-wrap, close the modal
        if (!modalWrap.contains(e.target)) {
            document.getElementById('modal-btn').checked = false;
        }
    });

 
};
