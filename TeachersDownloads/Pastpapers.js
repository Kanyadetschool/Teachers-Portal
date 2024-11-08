const Pastpapers = [
    {
        title: "🐚 Grade One",
        type: "pastpapers",
        category: "Past Papers",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_1.pdf"
        ],
        downloadCode: "pass123"
    },
    {
        title: "🐚 Grade Two",
        type: "pastpapers",
        category: "Past Papers",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_2.pdf"
        ],
        downloadCode: "pass123"
    },
    {
        title: "🐚 Grade Three",
        type: "pastpapers",
        category: "Past Papers",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_3.pdf"
        ],
        downloadCode: "pass123"
    },
    {
        title: "🐚 Grade Four",
        type: "pastpapers",
        category: "Past Papers",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_4.pdf"
        ],
        downloadCode: "pass123"
    },
    {
        title: "🐚 Grade Five",
        type: "pastpapers",
        category: "Past Papers",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_5.pdf"
        ],
        downloadCode: "pass123"
    },
    {
        title: "🐚 Grade six",
        type: "pastpapers",
        category: "Past Papers",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_6.pdf"
        ],
        downloadCode: "pass123"
    },
    {
        title: "🐚 Grade seven",
        type: "pastpapers",
        category: "Past Papers",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_7.pdf"
        ],
        downloadCode: "pass123"
    },
    {
        title: "🐚 Grade Eight",
        type: "pastpapers",
        category: "Past Papers",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_8.pdf"
        ],
        downloadCode: "pass123"
    },
    {
        title: "🐚 Grade Nine",
        type: "pastpapers",
        category: "Past Papers",
        size: "1.2 MB",
        date: "2024-Oct-21",
        icon: "file-text",
        age: "",
        urls: [
            "https://example.com/document_9.pdf"
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
Pastpapers.forEach(student => {
    student.age = calculateAge(student.date);
});

// Exporting the updated Pastpapers array
export default Pastpapers;

console.log(Pastpapers); // For debugging purposes to see the updated array
