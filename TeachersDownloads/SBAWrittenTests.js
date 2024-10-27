const written = [
   
    {
        title: "🧑‍⚕️ Grade 3",
        type: "theory",
        category: "KNEC THEORY PAPERS",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "../Docs/SBA/Written Tests/Grade 3/2024/2024 ENG_1_20240929094152990Regular.zip",
            "../Docs/SBA/Written Tests/Grade 3/2024/.pdf",
            "../Docs/SBA/Written Tests/Grade 3/2024/.pdf",
            "../Docs/SBA/Written Tests/Grade 3/2024/.pdf",
            "../Docs/SBA/Written Tests/Grade 3/2024/.pdf",
            "../Docs/SBA/Written Tests/Grade 3/2024/.pdf",
            "../Docs/SBA/Written Tests/Grade 3/2024/.pdf",
            "../Docs/SBA/Written Tests/Grade 3/2024/.pdf",
            "../Docs/SBA/Written Tests/Grade 3/2024/.pdf",
            "../Docs/SBA/Written Tests/Grade 3/2024/.pdf",
            "../Docs/SBA/Written Tests/Grade 3/2024/.pdf",
        ],
        
    },
    {
        title: "🧑‍⚕️ Grade 4",
        type: "theory",
        category: "KNEC THEORY PAPERS",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
           
            ""
           

        ],
        
    },
    {
        title: "🧑‍⚕️ Grade 5",
        type: "theory",
        category: "KNEC THEORY PAPERS",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
           
        ],
        
    },
    {
        title: "🧑‍⚕️ Grade 6",
        type: "theory",
        category: "KNEC THEORY PAPERS",
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
        type: "theory",
        category: "KNEC THEORY PAPERS",
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
        type: "theory",
        category: "KNEC THEORY PAPERS",
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
        type: "theory",
        category: "KNEC THEORY PAPERS",
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
written.forEach(student => {
    student.age = calculateAge(student.date);
});

// Exporting the updated written array
export default written;

console.log(written); // For debugging purposes to see the updated array
