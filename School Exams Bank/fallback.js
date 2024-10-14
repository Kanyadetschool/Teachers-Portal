const Titles = [
    {
        Group: 'GRADE 2 END - TERM I PERFORMANCE REPORTS',
        year: 2023,
        students: [
           {
             Date: 'Friday 5th, April 2023',
             pdfUrl: './Docs/Grade 2 End Term II Reports 2024.pdf',
             imageUrl: './images/newlogo.png',
             scoresUrl: './Docs/Grade 6 End Term II Reports 2024.pdf',
             TemplateUsed:''
             },
        ]
    },
    // Other Title objects...
];

// Function to search and display students based on Title
function searchStudents() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const searchInput2 = document.getElementById('searchInput2').value.toLowerCase();
    const documentList = document.getElementById('documentList');
    documentList.innerHTML = ''; // Clear previous search results

    let foundStudents = false;

    Titles.forEach((Title) => {
        Title.students.forEach((student) => {
            if (
                (Title.Group.toLowerCase().includes(searchInput) || Title.year.toString().includes(searchInput)) &&
                (Title.Group.toLowerCase().includes(searchInput2) || Title.year.toString().includes(searchInput2))
            ) {
                const studentCard = document.createElement('div');
                studentCard.classList.add('document-card');

                const studentTitle = document.createElement('p');
                studentTitle.textContent = Title.Group;
                highlightText(studentTitle, searchInput);
                highlightText(studentTitle, searchInput2);

                const studentDate = document.createElement('h3');
                studentDate.textContent = 'Dated: ' + student.Date;
                highlightText(studentDate, searchInput);
                highlightText(studentDate, searchInput2);

                const studentDownloadBtn = document.createElement('button');
                studentDownloadBtn.textContent = 'Download PDF';
                studentDownloadBtn.addEventListener('click', () => {
                    Swal.fire({
                        title: 'Choose Action',
                        text: 'Do you want to download Class Scores or open Performance Reports?',
                        showCancelButton: true,
                        confirmButtonText: 'Scores',
                        cancelButtonText: 'Cancel',
                        cancelButtonColor: '#3085d6',
                        showDenyButton: true,
                        denyButtonText: 'Reports'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            if (student.scoresUrl) {
                                downloadPDF(student.scoresUrl, student.scoresUrl.split('/').pop());
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Scores URL not available',
                                    text: 'The scores URL is not provided for this student.'
                                });
                            }
                        } else if (result.isDenied) {
                            openPDF(student.pdfUrl);
                        }
                    });
                });

                const studentImage = document.createElement('img');
                studentImage.src = student.imageUrl;
                studentImage.alt = student.Date + ' Image';
                studentCard.appendChild(studentImage);

                studentCard.appendChild(studentTitle);
                studentCard.appendChild(studentDate);
                studentCard.appendChild(studentDownloadBtn);
                documentList.appendChild(studentCard);

                foundStudents = true;
            }
        });
    });

    if (!foundStudents) {
        Swal.fire({
            icon: 'error',
            title: 'No Student Found',
            text: 'Please try a different search term.',
            confirmButtonText: 'OK'
        }).then(() => {
            // Reload the page if no student is found
            location.reload();
        });
    }
}

// Function to open PDF in a new tab
function openPDF(url) {
    window.open(url, '_blank');
}

// Function to download PDF with the specified name
function downloadPDF(url, fileName) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // Use the specified file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Function to highlight text within a given element
function highlightText(element, searchText) {
    const innerHTML = element.innerHTML;
    const index = innerHTML.toLowerCase().indexOf(searchText.toLowerCase());
    if (index >= 0) {
        const highlightedText = innerHTML.substring(0, index) +
            '<span class="highlight">' + innerHTML.substring(index, index + searchText.length) + '</span>' +
            innerHTML.substring(index + searchText.length);
        element.innerHTML = highlightedText;
    }
}

// Call searchStudents function when the page loads and on input change
window.onload = searchStudents;
document.getElementById('searchInput').addEventListener('input', searchStudents);
document.getElementById('searchInput2').addEventListener('input', searchStudents);
