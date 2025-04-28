import { database } from '../firebase-config.js';
import { ref, set, onValue, off } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';

// Function to watch for changes and auto-update Firebase
export async function initAutoUpdate() {
    try {
        // Load the sample results data
        const response = await fetch('./sample-results.json');
        const sampleData = await response.json();
        
        // Process and update each grade level's results
        const updatePromises = [];
        for (const level of Object.keys(sampleData)) {
            const { sampleResults } = sampleData[level];
           
            for (const result of sampleResults) {
                const { assessmentNo } = result;
               
                // Add metadata
                result.lastUpdated = new Date().toISOString();
                result.status = 'active';
                
                // Collect promises instead of awaiting each one
                updatePromises.push(updateResult(assessmentNo, result));
                updatePromises.push(updateStudentInfo(result));
            }
        }
        
        // Wait for all updates to complete at once
        await Promise.all(updatePromises);
        console.log('Initial sync completed');
        
        // Don't set up realtime sync - removed to stop immediate consumption of resources
        console.log('Auto-update completed and stopped.');
    } catch (error) {
        console.error('Error in auto-update:', error);
    }
}

// Function to update a single result
async function updateResult(assessmentNo, result) {
    try {
        await set(ref(database, `results/${assessmentNo}`), result);
        console.log(`Updated result for ${assessmentNo}`);
    } catch (error) {
        console.error(`Error updating result ${assessmentNo}:`, error);
    }
}

// Function to update student information
async function updateStudentInfo(result) {
    try {
        const studentData = {
            studentName: result.studentName,
            studentUPI: result.studentUPI,
            assessmentNo: result.assessmentNo,
            class: result.class,
            lastUpdated: new Date().toISOString()
        };
        await set(ref(database, `students/${result.studentName}`), studentData);
        console.log(`Updated student info for ${result.studentName}`);
    } catch (error) {
        console.error(`Error updating student info for ${result.studentName}:`, error);
    }
}

// Function to manually trigger sync if needed
export function manualSync() {
    console.log('Manual sync triggered');
    initAutoUpdate();
}