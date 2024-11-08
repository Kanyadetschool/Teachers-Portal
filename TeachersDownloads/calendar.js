const SchoolCalendar = [
    {
        title: "School Calendar of Events",
        type: "calendar",
        category: "school calendar",
        size: "1.2 MB",
        AssessmentNo:"",
        date: "2005-04-10", // Assuming this is the date of birth
        icon: "calendar",
        age: "",
        urls: [
            "https://example.com/document_9.pdf"
        ],
        downloadCode: "pass123"
    },
    
    // Add more resources for calender here
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
SchoolCalendar.forEach(student => {
    student.age = calculateAge(student.date);
});

// Exporting the updated SchoolCalendar array
export default SchoolCalendar;

console.log(SchoolCalendar); // For debugging purposes to see the updated array
