import { auth, database } from './firebase-config.js';
import { ref, get, update, orderByChild, equalTo, query } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';
// Initialize Firebase Database reference
const studentsRef = ref(database, 'students');

// Function to upload initial student data to Firebase
function uploadStudentData() {
    fetch('./data/students.json')
        .then(response => response.json())
        .then(data => {
            // First get current data from Firebase
            return get(studentsRef).then(snapshot => {
                const currentData = snapshot.val() || {};
                // Convert array structure to object structure for Firebase
                const formattedData = {};
                Object.keys(data).forEach(grade => {
                    data[grade].forEach(student => {
                        // Use assessmentNo as the key for each student
                        formattedData[student.assessmentNo] = {
                            ...student,
                            grade: grade,
                            lastUpdated: new Date().toISOString()
                        };
                    });
                });

                // Compare and only update changed or new records
                const updates = {};
                Object.keys(formattedData).forEach(assessmentNo => {
                    const newData = formattedData[assessmentNo];
                    const existingData = currentData[assessmentNo];
                    
                    if (!existingData || 
                        JSON.stringify({...existingData, lastUpdated: undefined}) !== 
                        JSON.stringify({...newData, lastUpdated: undefined})) {
                        updates[assessmentNo] = newData;
                    }
                });

                // Only perform update if there are changes
                if (Object.keys(updates).length > 0) {
                    return update(studentsRef, updates)
                        .then(() => console.log(`Successfully updated ${Object.keys(updates).length} student records`))
                        .catch(error => console.error('Error updating data:', error));
                } else {
                    console.log('No updates needed - data is already in sync');
                    return Promise.resolve();
                }
            });
        })
        .catch(error => console.error('Error reading JSON file:', error));
}

// Function to populate student dropdown based on selected grade
function updateStudentDropdown() {
    const gradeSelect = document.getElementById('class');
    const studentSelect = document.getElementById('studentSelect');
    const selectedGrade = gradeSelect.value;

    // Clear existing options
    studentSelect.innerHTML = '<option value="">Select Student</option>';

    if (selectedGrade) {
        // Fetch students for selected grade from Firebase
        get(query(studentsRef, orderByChild('grade'), equalTo(selectedGrade)))
            .then(snapshot => {
                const students = snapshot.val();
                if (students) {
                    Object.values(students).forEach(student => {
                        const option = document.createElement('option');
                        option.value = student.name;
                        option.textContent = student.name;
                        option.dataset.upi = student.upi;
                        option.dataset.assessmentNo = student.assessmentNo;
                        studentSelect.appendChild(option);
                    });
                }
            })
            
            
    }
}

// Function to auto-populate student details
function populateStudentDetails() {
    const studentSelect = document.getElementById('studentSelect');
    const selectedOption = studentSelect.options[studentSelect.selectedIndex];

    if (selectedOption.value) {
        document.getElementById('studentName').value = selectedOption.value;
        document.getElementById('studentUPI').value = selectedOption.dataset.upi;
        document.getElementById('assessmentNo').value = selectedOption.dataset.assessmentNo;
    } else {
        document.getElementById('studentName').value = '';
        document.getElementById('studentUPI').value = '';
        document.getElementById('assessmentNo').value = '';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Upload initial student data to Firebase
    uploadStudentData();

    // Add event listeners for grade and student selection
    document.getElementById('class').addEventListener('change', updateStudentDropdown);
    document.getElementById('studentSelect').addEventListener('change', populateStudentDetails);
});