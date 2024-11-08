const Circulars = [
    {
        title: "School Circulars",
        type: "circulars",
        category: "circulars",
        size: "1.2 MB",
        date: "2005-04-10", // Assuming this is the date of birth
        icon: "user",
        age: "",
        urls: [
            "../Docs/Circulars/M.O.E/.pdf"
        ],
        downloadCode: "pass12B3"
    },
    {
        title: "Ministry of Education",
        type: "circulars",
        category: "circulars",
        size: "1.2 MB",
        date: "2007-04-10", // Assuming this is the date of birth
        icon: "user",
        age: "",
        urls: [
            "../Docs/Circulars/M.O.E/CBE and Timetabling Guidelines.pdf",
            "../Docs/Circulars/M.O.E/TERM DATES 2025.pdf",
            "../Docs/Circulars/M.O.E/Revised Learning Areas.pdf",
        ],
        downloadCode: "pass123"
    },
    {
        title: "KNEC",
        type: "circulars",
        category: "circulars",
        size: "1.2 MB",
        date: "2007-04-10", // Assuming this is the date of birth
        icon: "user",
        age: "",
        urls: [
              "../Docs/Circulars/KNEC/CIRCULAR_GRADES_7,_8_&_PREVOCATIONAL.pdf"
        ],
        downloadCode: "pass123"
    },
    {
        title: "TSC",
        type: "circulars",
        category: "circulars",
        size: "1.2 MB",
        date: "2007-04-10", // Assuming this is the date of birth
        icon: "user",
        age: "",
        urls: [
            "../Docs/Circulars/TSC/"
        ],
        downloadCode: "pass123"
    },
    // Add more resources for circulars here
];

// Function to calculate age based on date of birth
function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

// Update the age in each student object
Circulars.forEach(student => {
    student.age = calculateAge(student.date);
});

// Exporting the updated Circulars array
export default Circulars;

console.log(Circulars); // For debugging purposes to see the updated array
