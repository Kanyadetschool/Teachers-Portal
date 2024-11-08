const Grades = [
    {
        title: "🥯 Grade One",
        type: "reports",
        category: "Performance Reports",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
           
            "../Docs/Reports/ALL CLASSES COMBINED SCORE SHEETS FOR END- TERM III 2024.xlsx",
            "../Docs/Reports/GRADE 1 TEMPLATE 2024.docx",
            
            
           
            
        ],
        downloadCode: "pass123"
    },
    {
        title: "🥯 Grade Two",
        type: "reports",
        category: "Performance Reports",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "../Docs/Reports/Grade 2/2024/Grade 2 End Term III performance Reports 2024.pdf",
            "../Docs/Reports/ALL CLASSES COMBINED SCORE SHEETS FOR END- TERM III 2024.xlsx",
        ],
        downloadCode: "pass123"
    },
    {
        title: "🥯 Grade Three",
        type: "reports",
        category: "Performance Reports",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "../Docs/Reports/Grade 3/2024/Grade 3 End Term III performance Reports 2024.pdf",
            "../Docs/Reports/ALL CLASSES COMBINED SCORE SHEETS FOR END- TERM III 2024.xlsx",
        ],
        downloadCode: "pass123"
    },
    {
        title: "🥯 Grade Four",
        type: "reports",
        category: "Performance Reports",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
          "../Docs/Reports/Grade 4/2024/Grade 4 End Term III performance Reports 2024.pdf",
            "../Docs/Reports/ALL CLASSES COMBINED SCORE SHEETS FOR END- TERM III 2024.xlsx",
        ],
        downloadCode: "pass123"
    },
    {
        title: "🥯 Grade Five",
        type: "reports",
        category: "Performance Reports",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "../Docs/Reports/Grade 5/2024/Grade 5 End Term III performance Reports 2024.pdf",
            "../Docs/Reports/ALL CLASSES COMBINED SCORE SHEETS FOR END- TERM III 2024.xlsx",
        ],
        downloadCode: "pass123"
    },
    {
        title: "🥯 Grade six",
        type: "reports",
        category: "Performance Reports",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/ waiting kpsea results"
        ],
        downloadCode: "pass123"
    },
    {
        title: "🥯 Grade seven",
        type: "reports",
        category: "Performance Reports",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "../Docs/Reports/Grade 7/2024/Grade 7 End Term III performance Reports 2024.pdf",
            "../Docs/Reports/ALL CLASSES COMBINED SCORE SHEETS FOR END- TERM III 2024.xlsx",
        ],
        downloadCode: "pass123"
    },
    {
        title: "🥯 Grade Eight",
        type: "reports",
        category: "Performance Reports",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "../Docs/Reports/Grade 8/2024/Grade 8 End Term III performance Reports 2024.pdf",
            "../Docs/Reports/ALL CLASSES COMBINED SCORE SHEETS FOR END- TERM III 2024.xlsx",
        ],
        downloadCode: "pass123"
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
Grades.forEach(student => {
    student.age = calculateAge(student.date);
});

// Exporting the updated Grades array
export default Grades;

console.log(Grades); // For debugging purposes to see the updated array
