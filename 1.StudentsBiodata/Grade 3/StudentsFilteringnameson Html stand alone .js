const searchInput = document.getElementById('search');
const students = document.querySelectorAll('#studentList li');
const scrollIndicator = document.getElementById('scrollIndicator');
const studentList = document.getElementById('studentList');

// Set up event listeners
searchInput.addEventListener('input', onSearch);
searchInput.addEventListener('paste', onSearch);
studentList.addEventListener('scroll', updateScrollIndicator);
window.addEventListener('resize', updateScrollIndicator);

function onSearch() {
    const searchValue = searchInput.value.trim().toLowerCase();
    let matchCount = 0;

    students.forEach(student => {
        const originalStudentName = student.textContent.replace(/^\d+\.\s/, '').trim();
        const studentNameLowerCase = originalStudentName.toLowerCase();
        
        if (studentNameLowerCase.includes(searchValue)) {
            matchCount++;
            student.style.display = 'block';
            student.textContent = `${matchCount}. ${originalStudentName}`;
        } else {
            student.style.display = 'none';
        }
    });

    updateScrollIndicator();
}

function selectStudent(studentName) {
    searchInput.value = studentName.replace(/^\d+\.\s/, '').trim();
    searchInput.dispatchEvent(new Event('input')); // Manually trigger input event
    hideStudents(); // Hide student list after selecting a student
}

function showStudents() {
    students.forEach(student => {
        student.style.display = 'block';
    });
}

function hideStudents() {
    students.forEach(student => {
        student.style.display = 'none';
    });
}

function updateScrollIndicator() {
    if (studentList.scrollHeight > studentList.clientHeight) {
        scrollIndicator.style.display = 'block';
    } else {
        scrollIndicator.style.display = 'none';
    }
}

// Initial check for scroll indicator
updateScrollIndicator();
