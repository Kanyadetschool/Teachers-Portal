// Script to initialize Firebase collections with clean data
import { database } from './firebase-config.js';
import { ref, remove, set } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';

// Read students.json
import fs from 'fs';
import path from 'path';

// Function to initialize student data
async function initializeStudentData() {
    try {
        // Read the students.json file
        const studentsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'data', 'students.json'), 'utf8')
        );

        // Clear existing students collection
        await remove(ref(database, 'students'));

        // Format and upload new data
        const formattedData = {};
        Object.keys(studentsData).forEach(grade => {
            studentsData[grade].forEach(student => {
                formattedData[student.assessmentNo] = {
                    ...student,
                    grade: grade,
                    lastUpdated: new Date().toISOString()
                };
            });
        });

        // Upload to Firebase
        await set(ref(database, 'students'), formattedData);
        console.log('Successfully reinitialized student data in Firebase');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing data:', error);
        process.exit(1);
    }
}

// Run the initialization
initializeStudentData();