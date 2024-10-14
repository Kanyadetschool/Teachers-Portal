const levels = [
    {
        grade: 'Grade 3',
        year: 2024,
        students: [
            { name: 'Meryl Awuor', pdfUrl: './Docs/MERYL AWUOR_2024.pdf', imageUrl: './images/newlogo.png' },
            { name: 'ANGEL ACHIENG', pdfUrl: 'path/to/grade3_student2.pdf', imageUrl: './images/newlogo.png' },
            { name: 'BRONIA JOY', pdfUrl: 'path/to/grade3_student2.pdf', imageUrl: './images/newlogo.png' },
            // Add more students as needed
        ]
    },
    {
        grade: 'Grade 4',
        year: 2024,
        students: [
            { name: 'Student 1', pdfUrl: './Docs/Grade 2 End Term II Reports 2024.pdf', imageUrl: './images/newlogo.png' },
            { name: 'onyango reshid', pdfUrl: 'path/to/grade4_student2.pdf', imageUrl: './images/newlogo.png' },
            // Add more students as needed
        ]
    },
    {
        grade: 'Grade 5',
        year: 2024,
        students: [
            { name: 'Student 1', pdfUrl: 'path/to/grade5_student1.pdf', imageUrl: './images/newlogo.png' },
            { name: 'onyango resihid', pdfUrl: 'path/to/grade5_student2.pdf', imageUrl: './images/newlogo.png' },
            // Add more students as needed
        ]
    },
    // Add more grades with students and their PDF/image URLs
];

// Function to search and display students
function searchStudents() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const searchInput2 = document.getElementById('searchInput2').value.toLowerCase(); // Added second search input
    const documentList = document.getElementById('documentList');
    documentList.innerHTML = ''; // Clear previous search results

    let foundStudents = false;

    levels.forEach((level) => {
        level.students.forEach((student) => {
            if (student.name.toLowerCase().includes(searchInput) && student.name.toLowerCase().includes(searchInput2)) { // Checking both search inputs
                const studentCard = document.createElement('div');
                studentCard.classList.add('document-card');

                const studentLevel = document.createElement('p');
                studentLevel.textContent = 'Level: ' + level.grade + ' - ' + level.year; // Include year in display

                const studentName = document.createElement('h3');
                studentName.textContent = 'Name: ' + student.name;

                const studentDownloadBtn = document.createElement('button');
                studentDownloadBtn.textContent = 'Download PDF';
                studentDownloadBtn.addEventListener('click', () => {
                    Swal.fire({
                        title: 'Choose Action',
                        text: 'Do you want to download or open the PDF?',
                        showCancelButton: true,
                        confirmButtonText:'Run',
                        cancelButtonText: 'Cancel',
                        cancelButtonColor: '#3085d6',
                        showDenyButton: true,
                        denyButtonText: 'Open'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            downloadPDF(student.pdfUrl, student.name, level.year); // Pass document name and year for download title
                        } else if (result.isDenied) {
                            openPDF(student.pdfUrl);
                        }
                    });
                });

                const studentImage = document.createElement('img');
                studentImage.src = student.imageUrl;
                studentImage.alt = student.name + ' Image';
                studentCard.appendChild(studentImage);

                studentCard.appendChild(studentName);
                studentCard.appendChild(studentLevel);
                studentCard.appendChild(studentDownloadBtn);
                documentList.appendChild(studentCard);

                foundStudents = true;
            }
        });
    });

    if (!foundStudents) {
        Swal.fire({
            icon: 'info',
            title: 'No Student Found',
            text: 'Please try a different search term.',
            confirmButtonText: 'OK'
        });
    }
}

// Function to open PDF in a new tab
function openPDF(url) {
    window.open(url, '_blank');
}

// Function to download PDF with the document name and year as the download title
function downloadPDF(url, documentName, year) {
    const a = document.createElement('a');
    a.href = url;
    a.download = documentName + '-'+ 'Performance Report For The Year '  + year + '.pdf'; // Use the document name and year for the download title
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Call searchStudents function when the page loads and on input change
window.onload = searchStudents;
document.getElementById('searchInput').addEventListener('input', searchStudents);
document.getElementById('searchInput2').addEventListener('input', searchStudents); // Added event listener for second search input
