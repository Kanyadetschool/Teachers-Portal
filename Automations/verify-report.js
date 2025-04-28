
import { database } from './firebase-config.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';

const verifyForm = document.getElementById('verifyForm');
const verificationResult = document.getElementById('verificationResult');

verifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const reportIdentifier = document.getElementById('reportIdentifier').value.trim().toUpperCase();

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

    // Query Firebase for all results and check each one
    get(ref(database, 'results'))
        .then((snapshot) => {
            let found = false;
            snapshot.forEach((childSnapshot) => {
                const result = childSnapshot.val();
                if (result.reportIdentifier === reportIdentifier) {
                    found = true;
                    verificationResult.innerHTML = `
                        <div class="alert alert-success">
                            <h4 class="alert-heading">Student Report is Valid!</h4>
                            <p>Student Name: ${result.studentName}</p>
                            <p>Class: ${result.class}</p>
                            <p>Assessment Number: ${result.assessmentNo}</p>
                            <p>Date Generated: ${new Date(result.date).toLocaleString()}</p>
                        </div>`;
                    return true; // Exit forEach loop
                }
            });
            
            if (!found) {
                verificationResult.innerHTML = `
                    <div class="alert alert-danger">
                        <h4 class="alert-heading">Invalid Report</h4>
                        <p>The report identifier "${reportIdentifier}" could not be found in our records.</p>
                    </div>`;
            }
        })
        .catch((error) => {
            verificationResult.innerHTML = `
                <div class="alert alert-danger">
                    <h4 class="alert-heading">Error</h4>
                    <p>Error verifying report: ${error.message}</p>
                </div>`;
        })
        .finally(() => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
});
