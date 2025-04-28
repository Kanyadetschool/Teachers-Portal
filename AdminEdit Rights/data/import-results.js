import { database } from '../firebase-config.js';
import { ref, set, get } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';

// Function to import sample results data to Firebase
export async function importSampleResults() {
    try {
        // Fetch the sample results data
        const response = await fetch('./sample-results.json');
        const sampleData = await response.json();

        // Get current results from Firebase
        const resultsRef = ref(database, 'results');
        const snapshot = await get(resultsRef);
        const currentResults = snapshot.val() || {};

        // Process each grade level's sample results
        for (const level of Object.keys(sampleData)) {
            const { sampleResults } = sampleData[level];
            
            // Import each sample result
            for (const result of sampleResults) {
                const { assessmentNo } = result;
                
                // Skip if result already exists
                if (currentResults[assessmentNo]) {
                    console.log(`Result for ${assessmentNo} already exists. Skipping...`);
                    continue;
                }

                // Add metadata
                result.date = new Date().toISOString();
                result.status = 'active';
                result.lastUpdated = new Date().toISOString();

                // Save to Firebase
                await set(ref(database, `results/${assessmentNo}`), result);
                console.log(`Imported result for ${assessmentNo}`);

                // Also update student info
                const studentData = {
                    studentName: result.studentName,
                    studentUPI: result.studentUPI,
                    assessmentNo: result.assessmentNo,
                    class: result.class
                };
                await set(ref(database, `students/${assessmentNo}`), studentData);
                console.log(`Updated student info for ${assessmentNo}`);
            }
        }

        console.log('Sample results import completed successfully');
        return true;
    } catch (error) {
        console.error('Error importing sample results:', error);
        throw error;
    }
}

// Add button click handler to import results
document.addEventListener('DOMContentLoaded', () => {
    const importButton = document.createElement('button');
    importButton.className = 'btn btn-primary mb-3';
    importButton.innerHTML = '<i class="fas fa-upload me-2"></i>Import Sample Results';
    importButton.onclick = async () => {
        try {
            importButton.disabled = true;
            importButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Importing...';
            await importSampleResults();
            alert('Sample results imported successfully!');
        } catch (error) {
            alert('Error importing sample results: ' + error.message);
        } finally {
            importButton.disabled = false;
            importButton.innerHTML = '<i class="fas fa-upload me-2"></i>Import Sample Results';
        }
    };

    // Add button to the dashboard
    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection) {
        const firstChild = dashboardSection.firstChild;
        dashboardSection.insertBefore(importButton, firstChild);
    }
});