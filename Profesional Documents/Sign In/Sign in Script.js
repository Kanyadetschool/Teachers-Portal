
// Define teachers and their corresponding passwords and links
const teacherData = {
    Oduor: {
        password: '887314', // Teacher 1's password
        link: '../2025/Term I/ProDocs.html'
    },
    teacher2: {
        password: 'koko', // Teacher 2's password
        link: 'https://example.com/teacher2'
    },
    teacher3: {
        password: 'password3', // Teacher 3's password
        link: 'https://example.com/teacher3'
    }
    // Add more teachers as needed
};

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('togglePassword');

    // Toggle the type of input
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye'); // Change to open eye
        eyeIcon.classList.add('fa-eye-slash'); // Change icon to eye slash
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash'); // Change to closed eye
        eyeIcon.classList.add('fa-eye'); // Change icon back to eye
    }
}

function login() {
    const selectedTeacher = document.getElementById('teacher').value;
    const password = document.getElementById('password').value;

    // Check if a teacher is selected
    if (!selectedTeacher) {
        Swal.fire('Please select a teacher.');
        return;
    }

    // Check if the password is correct
    if (password === teacherData[selectedTeacher].password) {
        Swal.fire({
            title: 'Success!',
            text: `Mwalimu ${selectedTeacher.replace('teacher','Teacher ')} login successful!`, // Indicate teacher name
            icon: 'warning',
            timer: 3000, // Auto close after 3 seconds
            showConfirmButton: false // Hide the confirm button
        }).then(() => {
            window.location.href = teacherData[selectedTeacher].link;
        });
    } else {
        Swal.fire('Incorrect password. Please try again.');
    }
}
