const Titles = [
    {
        Group: 'GRADE 2 END - TERM I PERFORMANCE REPORTS',
        year: 2023,
        students: [
            {
                TemplateUsed: 'https://1drv.ms/w/s!ApO7CeXy3fBY9zIRxLnZzbaAPvky',
                scoresUrl: 'https://docs.google.com/spreadsheets/d/1Zyzdx6LSONzpuGmDd4c-Vv3fK6u1tJfs/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true',
                ReportspdfUrl: './Docs/Grade 2 End Term II Reports 2024.pdf',
                Date: 'Friday 5th, April 2023',
                imageUrl: './images/newlogo.png',
            },
            // Add more student objects as needed
        ]
    },
    // Add more Title objects as needed
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
                    // Reminder for best experience in Chrome
                    Swal.fire({
                        icon: 'info',
                        title: 'Reminder',
                        html: 'For the best experience, please open the link in Google Chrome.',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // Proceed with the original Swal popup for choosing action
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
                                handleScoresButtonClick(student.scoresUrl);
                            } else if (result.isDenied) {
                                openPDF(student.pdfUrl);
                            } else if (result.dismiss === Swal.DismissReason.cancel) {
                                // Open template URL if Cancel button is clicked
                                window.open(student.TemplateUsed, '_blank');
                            }
                        });
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

// Function to handle the "Scores" button click
function handleScoresButtonClick(scoresUrl) {
    if (scoresUrl) {
        window.open(scoresUrl, '_blank');
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Scores URL not available',
            text: 'The scores URL is not provided for this student.'
        });
    }
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