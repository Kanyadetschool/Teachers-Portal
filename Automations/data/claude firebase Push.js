import { auth, database } from '../firebase-config.js';
import { ref, get, update, orderByChild, equalTo, query, onValue } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';

// Initialize Firebase Database reference
const studentsRef = ref(database, 'students');

// Global cache to track last data state
let lastLocalDataState = null;

// Function to handle image loading in browser
function loadImageAsBase64(imagePath) {
    return new Promise((resolve) => {
        // Try to fetch the specified image
        fetch(imagePath)
            .catch(() => {
                // If fetch fails, use default image
                return fetch('./images/default-profile.svg');
            })
            .then(response => {
                if (!response.ok) {
                    return fetch('./images/default-profile.svg');
                }
                return response;
            })
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('Error loading image:', error);
                resolve(null);
            });
    });
}

// Function to check for changes in local data
function hasLocalDataChanged(newData) {
    if (!lastLocalDataState) return true;
    
    const newDataString = JSON.stringify(newData);
    const lastDataString = JSON.stringify(lastLocalDataState);
    
    return newDataString !== lastDataString;
}

// Function to upload student data to Firebase
async function uploadStudentData(force = false) {
    try {
        // Fetch the latest local data
        const response = await fetch('./students.json');
        const localData = await response.json();
        
        // Skip update if data hasn't changed and force is false
        if (!force && !hasLocalDataChanged(localData)) {
            console.log('No changes detected in local data');
            return;
        }
        
        // Update our cache with the new state
        lastLocalDataState = JSON.parse(JSON.stringify(localData));
        
        // Get current data from Firebase
        const snapshot = await get(studentsRef);
        const currentData = snapshot.val() || {};
        
        // Convert array structure to object structure for Firebase
        const formattedData = {};
        const processPromises = [];
        
        // Process each student with their images
        Object.keys(localData).forEach(grade => {
            localData[grade].forEach(student => {
                const processPromise = loadImageAsBase64(`./${student.image}`)
                    .then(imageBase64 => {
                        formattedData[student.assessmentNo] = {
                            ...student,
                            grade: grade,
                            imageData: imageBase64,
                            lastUpdated: new Date().toISOString()
                        };
                    });
                
                processPromises.push(processPromise);
            });
        });
        
        // Wait for all image processing to complete
        await Promise.all(processPromises);

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

        // Check if any records in Firebase are no longer in the local data and remove them
        Object.keys(currentData).forEach(assessmentNo => {
            if (!formattedData[assessmentNo]) {
                // Mark for removal by setting to null
                updates[assessmentNo] = null;
            }
        });

        // Only perform update if there are changes
        if (Object.keys(updates).length > 0) {
            await update(studentsRef, updates);
            console.log(`Firebase updated: ${Object.keys(updates).filter(k => updates[k] !== null).length} modified/added, ${Object.keys(updates).filter(k => updates[k] === null).length} removed`);
        } else {
            console.log('No updates needed - data is already in sync');
        }
        
        return true;
    } catch (error) {
        console.error('Error updating Firebase:', error);
        return false;
    }
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
            });
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

// Set up automatic synchronization with Firebase
function setupAutoSync() {
    // Initial data upload
    uploadStudentData(true);
    
    // Set up two-way sync:
    // 1. Listen for changes in Firebase
    onValue(studentsRef, (snapshot) => {
        const firebaseData = snapshot.val();
        console.log('Firebase data updated, checking for local changes...');
    });
    
    // 2. Regularly check local file for changes
    const syncInterval = 10000; // 10 seconds
    setInterval(async () => {
        await uploadStudentData();
    }, syncInterval);
    
    // 3. Check for changes on user interaction
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('Tab in focus, checking for updates...');
            uploadStudentData();
        }
    });
    
    // 4. Update when network comes back online
    window.addEventListener('online', () => {
        console.log('Network reconnected, syncing with Firebase...');
        uploadStudentData(true);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set up auto-sync
    setupAutoSync();

    // Add event listeners for grade and student selection
    document.getElementById('class').addEventListener('change', updateStudentDropdown);
    document.getElementById('studentSelect').addEventListener('change', populateStudentDetails);
    
    // Add update button functionality for manual sync
    const updateButton = document.getElementById('updateButton');
    if (updateButton) {
        updateButton.addEventListener('click', () => {
            updateButton.disabled = true;
            updateButton.textContent = 'Updating...';
            
            uploadStudentData(true).then(() => {
                updateButton.textContent = 'Update Complete!';
                setTimeout(() => {
                    updateButton.disabled = false;
                    updateButton.textContent = 'Force Update';
                }, 1500);
            });
        });
    }
});