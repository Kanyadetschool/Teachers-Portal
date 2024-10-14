

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
                studentDownloadBtn.textContent = 'Insight';
                studentDownloadBtn.addEventListener('click', () => {
                    const swalButtons = student.links
                        .filter(link => link.url !== 'Unavailable')
                        .map(link => ({ text: link.type, value: link.url }));

                    if (swalButtons.length > 0) {
                        const showSwal = () => {
                            Swal.fire({
                                title: `${Title.Group}`, // Display the group instead of "Choose Action"
                                input: 'select',
                                inputOptions: swalButtons.reduce((obj, item) => {
                                    obj[item.value] = item.text;
                                    return obj;
                                }, {}),
                                inputPlaceholder: 'Select an action',
                                showCancelButton: true,
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    if (result.value) {
                                        openPDF(result.value);
                                    } else {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'No Option Selected',
                                            text: 'Please select an option before clicking OK.',
                                            confirmButtonText: '😠Retry',
                                        }).then(() => {
                                            showSwal();
                                        });
                                    }
                                }
                            });
                        };

                        showSwal();
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: 'No Available Files ',
                            text: 'Kindly contact ICT department for Assistance 0112934576',
                            confirmButtonText: 'OK',
                        });
                    }
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
            title: '⚠️ No Data Found',
            text: 'Please click search dropdown from your left top of the screen',
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