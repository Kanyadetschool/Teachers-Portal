const practicals = [
    {
        title: "🧑‍⚕️ Grade 1",
        type: "practicals",
        category: "S.B.A practicals Tests",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_1.pdf"
        ],
        
    },
    {
        title: "🧑‍⚕️ Grade 2",
        type: "practicals",
        category: "S.B.A practicals Tests",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_2.pdf"
        ],
        
    },
    {
        title: "🧑‍⚕️ Grade 3",
        type: "practicals",
        category: "S.B.A practicals Tests",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_3.pdf"
        ],
        
    },
    {
        title: "🧑‍⚕️ Grade 4",
        type: "practicals",
        category: "S.B.A practicals Tests",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_4.pdf"
        ],
        
    },
    {
        title: "🧑‍⚕️ Grade 5",
        type: "practicals",
        category: "S.B.A practicals Tests",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_5.pdf"
        ],
        
    },
    {
        title: "🧑‍⚕️ Grade 6",
        type: "practicals",
        category: "S.B.A practicals Tests",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_6.pdf"
        ],
        
    },
    {
        title: "🧑‍⚕️ Grade 7",
        type: "practicals",
        category: "S.B.A practicals Tests",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_7.pdf"
        ],
        
    },
    {
        title: "🧑‍⚕️ Grade 8",
        type: "practicals",
        category: "S.B.A practicals Tests",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_8.pdf"
        ],
        
    },
    {
        title: "🧑‍⚕️ Grade 9",
        type: "practicals",
        category: "S.B.A practicals Tests",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_9.pdf"
        ],
        
    },
    
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
practicals.forEach(student => {
    student.age = calculateAge(student.date);
});

// Exporting the updated practicals array
export default practicals;

console.log(practicals); // For debugging purposes to see the updated array
