// Import Firebase config
import { database } from './firebase-config.js';
import { ref, set, remove } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';

// Read results.json
import fs from 'fs';
import path from 'path';

// Function to initialize results data
async function initializeResultsData() {
    try {
        // Read the results.json file
        const resultsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'data', 'results.json'), 'utf8')
        );

        // Clear existing results collection
        await remove(ref(database, 'results'));

        // Upload the results data directly since it's already in the correct format
        await set(ref(database, 'results'), resultsData.results);
        console.log('Successfully initialized results data in Firebase');
    } catch (error) {
        console.error('Error initializing results data:', error);
    }
}

// Function to update Firebase when results.json changes
async function updateFirebase() {
    try {
        const resultsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'data', 'results.json'), 'utf8')
        );
        await set(ref(database, 'results'), resultsData.results);
        console.log('Successfully updated results data in Firebase');
    } catch (error) {
        console.error('Error updating results data:', error);
    }
}

// Watch for changes in results.json
fs.watchFile(path.join(__dirname, 'data', 'results.json'), async (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
        console.log('Detected changes in results.json');
        await updateFirebase();
    }
});

// Run the initialization
initializeResultsData();