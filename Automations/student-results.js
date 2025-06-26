// Import Firebase configuration and database functions
import { auth, database } from './firebase-config.js';
import { ref, get, child, query, orderByChild, equalTo } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (!user && !bypassAuth) {
        window.location.href = 'login.html';
        return;
    }
});

// Function to fetch student image from local students.json
async function getLocalStudentImage(assessmentNo) {
    try {
        const response = await fetch('./data/students.json');
        const data = await response.json();
        
        // Search through all grades for the student
        for (const grade of Object.values(data)) {
            const student = grade.find(s => s.assessmentNo === assessmentNo);
            if (student && student.image) {
                // Ensure the image path is relative to the data directory
                const imagePath = student.image.startsWith('./') ? student.image : `./data/${student.image}`;
                
                // Verify if the image exists
                try {
                    const imageResponse = await fetch(imagePath);
                    if (imageResponse.ok) {
                        return imagePath;
                    }
                } catch (imageError) {
                    console.warn(`Failed to load image from ${imagePath}:`, imageError);
                }
            }
        }
        return './data/images/default.png';
    } catch (error) {
        console.error('Error loading student image:', error);
        return './data/images/default.png';
    }
}

// DOM Elements
const studentLoginForm = document.getElementById('studentLoginForm');
const loginSection = document.getElementById('loginSection');
const resultsSection = document.getElementById('resultsSection');
const studentInfo = document.getElementById('studentInfo');
const resultsContainer = document.getElementById('resultsContainer');

let currentStudentData = null;

// Check for direct access via URL parameters
const urlParams = new URLSearchParams(window.location.search);
const assessmentNo = urlParams.get('assessmentNo');
const bypassAuth = urlParams.get('bypass_auth') === 'true';
const autoDownload = urlParams.get('auto_download');

// If bypass_auth is true and assessmentNo is present, directly load results
if (bypassAuth && assessmentNo) {
    loginSection.classList.add('d-none');
    const submitButton = studentLoginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

    // Check all grade levels for the student with matching assessment number
    get(ref(database, 'students'))
        .then((gradesSnapshot) => {
            let studentData = null;
            const grades = gradesSnapshot.val();
            const foundStudent = Object.values(grades).find(student => {
                if (!student.assessmentNo) return false;
                const studentAssessment = String(student.assessmentNo).trim().toUpperCase();
                const inputAssessment = String(assessmentNo).trim().toUpperCase();
                return studentAssessment === inputAssessment || 
                       (studentAssessment.length > inputAssessment.length && 
                        studentAssessment.startsWith(inputAssessment));
            });
            
            if (!foundStudent) {
                throw new Error('Invalid assessment number. Please check and try again');
            }
            studentData = foundStudent;

            return get(ref(database, `results/${assessmentNo}`))
                .then(async (resultSnapshot) => {
                    const resultData = resultSnapshot.val();
                    
                    if (!resultData) {
                        throw new Error(`Results are not yet available for this assessment number`);
                    }

                    // Get student image from local file
                    const studentImage = await getLocalStudentImage(assessmentNo);
                    
                    const combinedData = {
                        ...studentData,
                        ...resultData,
                        image: studentImage
                    };
                    
                    currentStudentData = combinedData;
                    displayResults(combinedData);
                    resultsSection.classList.remove('d-none');
                    
                    // Check if auto_download is set to pdf
                    if (autoDownload === 'pdf') {
                        downloadResults('pdf');
                    }
                    return combinedData;
                });
        })
        .catch((error) => {
            const loginError = document.getElementById('loginError');
            loginError.textContent = error.message;
            loginError.classList.remove('d-none');
            loginSection.classList.remove('d-none');
        });
}

// Add school details
const SCHOOL_INFO = {
    name: "KANYADET PRI & JS SCHOOL",
    address: "P.O BOX 45 -40139, AKALA",
    phone: "+254 123 456 789",
    email: "kanyadetprischool@gmail.com",
    website: "https://kanyadet-school-portal.web.app/",
    motto: "Striving for Excellence",
    logo: "./data/images/logo.png" // Add your school logo to the assets folder
};

document.addEventListener('DOMContentLoaded', () => {
    const studentLoginForm = document.getElementById('studentLoginForm');
    studentLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const assessmentNo = document.getElementById('studentAssessmentNo').value.trim();
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

    // Check all grade levels for the student with matching assessment number
    get(ref(database, 'students'))
        .then((gradesSnapshot) => {
            let studentData = null;
            const grades = gradesSnapshot.val();
            const foundStudent = Object.values(grades).find(student => {
                if (!student.assessmentNo) return false;
                const studentAssessment = String(student.assessmentNo).trim().toUpperCase();
                const inputAssessment = String(assessmentNo).trim().toUpperCase();
                return studentAssessment === inputAssessment || 
                       (studentAssessment.length > inputAssessment.length && 
                        studentAssessment.startsWith(inputAssessment));
            });
            
            if (!foundStudent) {
                throw new Error('Invalid assessment number. Please check and try again');
            }
            studentData = foundStudent;

            return get(ref(database, `results/${assessmentNo}`))
                .then(async (resultSnapshot) => {
                    const resultData = resultSnapshot.val();
                    
                    if (!resultData) {
                        throw new Error(`Results are not yet available for this assessment number. Please verify the number or contact your class teacher`);
                    }

                    // Get student image from local file
                    const studentImage = await getLocalStudentImage(assessmentNo);
                    
                    const combinedData = {
                        ...studentData,
                        ...resultData,
                        image: studentImage
                    };
                    
                    currentStudentData = combinedData;
                    displayResults(combinedData);
                    loginSection.classList.add('d-none');
                    resultsSection.classList.remove('d-none');
                    return combinedData;
                });
        })
        .catch((error) => {
            const loginError = document.getElementById('loginError');
            loginError.textContent = error.message;
            loginError.classList.remove('d-none');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>View Results';
        });
    });
});



function displayResults(data) {
    if (!data) return;

    // Display student info with complete details
    studentInfo.innerHTML = `
        <div class="card bg-light mb-4">
            <div class="card-body">
                <div class="row">
                   
                    <div class="col-md-9">
                        <h4>Student Information</h4>
                        <p><strong>Name:</strong> ${data.studentName || data.name || data.studentname || 'N/A'}</p>
                        <p><strong>UPI Number:</strong> ${data.studentUPI || data.upi || data.upiNumber || 'N/A'}</p>
                        <p><strong>Class:</strong> ${data.class || data.grade || data.className || 'N/A'}</p>
                        <p><strong>Assessment Number:</strong> ${data.assessmentNo || 'N/A'}</p>
                    </div>
                     <div class="col-md-3 text-center">
                        <img src="${data.image || './data/images/default-profile.svg'}" 
                             alt="Student Photo" 
                             class="img-fluid rounded-circle mb-3" 
                             style="max-width: 150px; height: auto;"
                             onerror="this.src='./data/images/default-profile.svg'"
                             loading="lazy">
                    </div>
                </div>
            </div>
        </div>
    `;

    // Display results for each term/exam
    const resultsContainer = document.getElementById('resultsContainer');
    const examResults = Object.entries(data)
        .filter(([key]) => key.includes('term_'))
        .map(([examKey, examData]) => {
            return `
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">${examKey.replace(/_/g, ' ').toUpperCase()}</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Score</th>
                                        <th>Grade</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(examData.subjects)
                                        .filter(([key]) => !key.includes('_grade') && !key.includes('_points'))
                                        .map(([subject, score]) => `
                                            <tr>
                                                <td>${subject}</td>
                                                <td>${score}%</td>
                                                <td><span class="badge ${getGradeBadgeClass(examData.subjects[`${subject}_grade`])}">
                                                    ${examData.subjects[`${subject}_grade`]}
                                                </span></td>
                                                <td>${getRemarks(score)}</td>
                                            </tr>
                                        `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr class="table-primary">
                                        <td colspan="2"><strong>Mean Score</strong></td>
                                        <td colspan="2"><strong>${examData.meanScore.toFixed(2)}% (${examData.meanGrade})</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    resultsContainer.innerHTML = examResults;
}

// Move all exports to the top of the file
export { downloadResults, displayResults };

function downloadResults(format) {
    if (!currentStudentData) return;

    switch(format) {
        case 'pdf':
            generatePDF(currentStudentData);
            break;
        case 'word':
            generateWord(currentStudentData);
            break;
        case 'excel':
            generateExcel(currentStudentData);
            break;
    }
}

// Expose to global scope for HTML onclick handlers
window.downloadResults = downloadResults;
function generatePDF(data) {
    // Ensure report identifier exists
    if (!data.reportIdentifier) {
        const reportData = {
            studentName: data.studentName,
            studentUPI: data.studentUPI,
            assessmentNo: data.assessmentNo,
            class: data.class,
            examType: data.examType,
            term: data.term
        };
        data.reportIdentifier = generateReportIdentifier(reportData);
    }

    const content = generateReportContent(data);
    const opt = {
        margin: [1,-8,1,-8],
        filename: `${data.studentName.replace(/\s+/g, '_')}_report.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(content).save();
}

function generateWord(data) {
    const doc = new docx.Document({
        sections: [{
            properties: {},
            children: [
                new docx.Paragraph({
                    text: `${SCHOOL_INFO.name}`,
                    heading: docx.HeadingLevel.HEADING_1,
                    alignment: docx.AlignmentType.CENTER,
                }),
                new docx.Paragraph({
                    text: `${SCHOOL_INFO.address}`,
                    heading: docx.HeadingLevel.HEADING_2,
                    alignment: docx.AlignmentType.CENTER,
                }),
                new docx.Paragraph({
                    text: `Academic Report Card`,
                    heading: docx.HeadingLevel.HEADING_3,
                    alignment: docx.AlignmentType.CENTER,
                }),
                new docx.Paragraph({
                    text: `Student Name: ${data.studentName}`,
                    bullet: { level: 0 },
                }),
                new docx.Paragraph({
                    text: `UPI Number: ${data.studentUPI}`,
                    bullet: { level: 0 },
                }),
                new docx.Paragraph({
                    text: `Class: ${data.class}`,
                    bullet: { level: 0 },
                }),
                ...generateWordTables(data),
            ],
        }],
    });

    docx.Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${data.studentName.replace(/\s+/g, '_')}_report.docx`);
    });
}

function generateWordTables(data) {
    const tables = [];

    Object.entries(data)
        .filter(([key]) => key.includes('term_'))
        .forEach(([examKey, examData]) => {
            const table = new docx.Table({
                rows: [
                    new docx.TableRow({
                        children: [
                            new docx.TableCell({ children: [new docx.Paragraph({ text: 'Subject' })] }),
                            new docx.TableCell({ children: [new docx.Paragraph({ text: 'Score' })] }),
                            new docx.TableCell({ children: [new docx.Paragraph({ text: 'Grade' })] }),
                            new docx.TableCell({ children: [new docx.Paragraph({ text: 'Remarks' })] }),
                        ],
                    }),
                    ...Object.entries(examData.subjects)
                        .filter(([key]) => !key.includes('_grade') && !key.includes('_points'))
                        .map(([subject, score]) => new docx.TableRow({
                            children: [
                                new docx.TableCell({ children: [new docx.Paragraph({ text: subject })] }),
                                new docx.TableCell({ children: [new docx.Paragraph({ text: `${score}%` })] }),
                                new docx.TableCell({ children: [new docx.Paragraph({ text: examData.subjects[`${subject}_grade`] })] }),
                                new docx.TableCell({ children: [new docx.Paragraph({ text: getRemarks(score) })] }),
                            ],
                        })),
                    new docx.TableRow({
                        children: [
                            new docx.TableCell({ children: [new docx.Paragraph({ text: 'Mean Score' })] }),
                            new docx.TableCell({ children: [new docx.Paragraph({ text: `${examData.meanScore.toFixed(2)}%` })] }),
                            new docx.TableCell({ children: [new docx.Paragraph({ text: 'Mean Grade' })] }),
                            new docx.TableCell({ children: [new docx.Paragraph({ text: examData.meanGrade })] }),
                        ],
                    })
                ],
            });
            tables.push(new docx.Paragraph({
                text: examKey.replace(/_/g, ' ').toUpperCase(),
                heading: docx.HeadingLevel.HEADING_4,
            }));
            tables.push(table);
        });

    return tables;
}

function generateExcel(data) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formatDataForExcel(data));
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Card");
    XLSX.writeFile(workbook, `${data.studentName.replace(/\s+/g, '_')}_report.xlsx`);
}


function generateReportContent(data) {
    const reportGeneratedDate = new Date().toLocaleDateString();
    const reportGeneratedTime = new Date().toLocaleTimeString();
    const reportIdentifier = data.reportIdentifier;
    const imagePath = data.image.startsWith('./') ? data.image : `./data/${data.image}`;
    
     

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Academic Report Card - ${data.studentName}</title>
            <style>
                body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f8f8f8; }
                .report-card { width: 90%; margin: 20px auto; background: #fff; padding: 30px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border-radius: 10px; }
                .school-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .school-logo { width: 120px; height: auto; }
                .school-info { text-align: center; }
                .school-info h1 { color: #333; font-size: 24px; margin: 0; }
                .school-info p { color: #666; font-size: 14px; margin: 5px 0; }
                .student-info { margin: 20px 0; }
                .student-info table { width: 100%; }
                .student-info td { padding: 8px; }
                h2 { color: #333; text-align: center; margin-bottom: 20px; }
                .grade-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .grade-table th, .grade-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .grade-table th { background-color: #f0f0f0; font-weight: bold; color: #333; }
                .grade-table tbody tr:nth-child(even) { background-color: #f9f9f9; }
                .remarks-section { margin: 30px 0; }
                .remarks-section h4 { color: #333; margin-bottom: 10px; }
                .footer { margin-top: 40px; font-size: 0.8em; color: #777; text-align: center; }
                .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
                .signature-block { text-align: center; }
                .signature-line { border-bottom: 1px solid #000; margin: 0 auto 10px; width: 70%; }
                .next-term { margin-top: 30px; font-style: italic; color: #555; }
                .grading-system { margin-top: 20px; font-size: 0.9em; color: #555; }
                .exam-title { background-color: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; color: #333; }
                .badge { font-size: 0.9em; padding: 5px 10px; border-radius: 5px; color: white; }
                .badge.bg-success { background-color: #28a745 !important; }
                .badge.bg-info { background-color: #17a2b8 !important; }
                .badge.bg-warning { background-color: #ffc107 !important; color: #333; }
                .badge.bg-danger { background-color: #dc3545 !important; }
                .report-auth { margin-top: 20px; font-size: 0.7em; color: #888; text-align: left; }
            </style>
        </head>
        <body>
            <div class="report-card">
                <div class="school-header">
                    <img src="${SCHOOL_INFO.logo}" alt="School Logo" class="school-logo">
                    <div class="school-info">
                        <h1>${SCHOOL_INFO.name}</h1>
                        <p>${SCHOOL_INFO.address}</p>
                        <p>Tel: ${SCHOOL_INFO.phone} | Email: ${SCHOOL_INFO.email}</p>
                        <p><em>Motto: ${SCHOOL_INFO.motto}</em></p>
                    </div>
                    <img src="${imagePath}" alt="Student Photo" class="school-logo">
                </div>
                 
   
                <h2>ACADEMIC REPORT CARD</h2>
                <p style="text-align: center">${getCurrentTerm()} - ${getCurrentYear()}</p>
                <div class="student-info">
                    <table width="100%">
                        <tr>
                            <td><strong>Student Name:</strong> ${data.studentName}</td>
                            <td><strong>UPI Number:</strong> ${data.studentUPI}</td>
                        </tr>
                        <tr>
                            <td><strong>Class:</strong> ${data.class}</td>
                            <td><strong>Assessment No:</strong> ${data.assessmentNo}</td>
                        </tr>
                        <tr>
                            <td><strong>Term:</strong> ${data.term}</td>
                            <td><strong>Exam Type:</strong> ${data.examType}</td>
                        </tr>
                    </table>
                </div>

                ${generateResultsTables(data)}

                <div class="remarks-section">
                    <h4>Class Teacher's Remarks</h4>
                    <p>${generateTeacherRemarks(data.meanScore)}</p>
                    
                    <h4>Principal's Remarks</h4>
                    <p>${generatePrincipalRemarks(data.meanScore)}</p>
                    
                    <div class="attendance">
                        <h4>Attendance Record</h4>
                        <p>Days Present: _____ out of _____ days</p>
                    </div>
                </div>

                <div class="next-term">
                    <p>Next Term Begins: ${getNextTermDate()}</p>
                </div>

                <div class="signatures">
                    <div class="signature-block">
                        <p>_____________________</p>
                        <p>Class Teacher's Signature</p>
                        <p>Date: ____________</p>
                    </div>
                    <div class="signature-block">
                        <p>_____________________</p>
                        <p>Principal's Signature</p>
                        <p>Date: ____________</p>
                    </div>
                    <div class="signature-block">
                        <p>_____________________</p>
                        <p>Parent's Signature</p>
                        <p>Date: ____________</p>
                    </div>
                </div>

                <div class="footer">
                    <p class="grading-system"><strong>Grading System:</strong></p>
                    <p class="grading-system">80-100: Exceeds Expectation | 65-79: Meets Expectation | 50-64: Approaches Expectation | Below 50: Below Expectation</p>
                    <p>&copy; ${new Date().getFullYear()} ${SCHOOL_INFO.name}. All rights reserved.</p>
                </div>
                 <div class="report-auth">
                    <p>Report Generated on: ${reportGeneratedDate} at ${reportGeneratedTime}</p>
                    <p>Report Identifier: ${reportIdentifier}</p>
                    <p><em>To verify this report, visit our website and enter the Report Identifier.</em></p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateReportIdentifier(data) {
    const timestamp = new Date().getTime();
    const uniqueString = `${data.studentName}-${data.assessmentNo}-${timestamp}`;
    let hash = 0;
    for (let i = 0; i < uniqueString.length; i++) {
        const char = uniqueString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().slice(0, 8);
}

function generateResultsTables(data) {
    return Object.entries(data)
        .filter(([key]) => key.includes('term_'))
        .map(([examKey, examData]) => {
            const subjects = examData.subjects;
            return `
                <div class="exam-section mb-4">
                    <div class="exam-title">
                        <h4>${examKey.replace(/_/g, ' ').toUpperCase()}</h4>
                    </div>
                    <table class="grade-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Score</th>
                                <th>Grade</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(subjects)
                                .filter(([key]) => !key.includes('_grade') && !key.includes('_points'))
                                .map(([subject, score]) => `
                                    <tr>
                                        <td>${subject}</td>
                                        <td>${score}%</td>
                                        <td>${subjects[`${subject}_grade`]}</td>
                                        <td>${getRemarks(score)}</td>
                                    </tr>
                                `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2"><strong>Mean Score</strong></td>
                                <td><strong>${examData.meanScore.toFixed(2)}%</strong></td>
                                <td><strong>${examData.meanGrade}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;
        }).join('');
}

function formatDataForExcel(data) {
    const excelData = [];
    
    // Add school information
    excelData.push([SCHOOL_INFO.name]);
    excelData.push([SCHOOL_INFO.address]);
    excelData.push([`Tel: ${SCHOOL_INFO.phone} | Email: ${SCHOOL_INFO.email}`]);
    excelData.push(['ACADEMIC REPORT CARD']);
    excelData.push([`${getCurrentTerm()} - ${getCurrentYear()}`]);
    excelData.push([]);

    // Add student information
    excelData.push(['Student Information']);
    excelData.push(['Name:', data.studentName]);
    excelData.push(['UPI Number:', data.studentUPI]);
    excelData.push(['Class:', data.class]);
    excelData.push(['Assessment No:', data.assessmentNo]);
    excelData.push([]);

    // Add results for each term/exam
    Object.entries(data)
        .filter(([key]) => key.includes('term_'))
        .forEach(([examKey, examData]) => {
            excelData.push([examKey.replace(/_/g, ' ').toUpperCase()]);
            excelData.push(['Subject', 'Score', 'Grade', 'Remarks']);

            Object.entries(examData.subjects)
                .filter(([key]) => !key.includes('_grade') && !key.includes('_points'))
                .forEach(([subject, score]) => {
                    excelData.push([
                        subject,
                        `${score}%`,
                        examData.subjects[`${subject}_grade`],
                        getRemarks(score)
                    ]);
                });

            excelData.push([]);
            excelData.push(['Mean Score', `${examData.meanScore.toFixed(2)}%`]);
            excelData.push(['Mean Grade', examData.meanGrade]);
            excelData.push([]);
        });

    // Add remarks
    excelData.push(['Class Teacher\'s Remarks']);
    excelData.push([generateTeacherRemarks(data.meanScore)]);
    excelData.push(['Principal\'s Remarks']);
    excelData.push([generatePrincipalRemarks(data.meanScore)]);

    return excelData;
}

// Add these helper functions
function getCurrentTerm() {
    const terms = ['TERM 1', 'TERM 2', 'TERM 3'];
    const currentMonth = new Date().getMonth();
    return terms[Math.floor(currentMonth / 4)];
}

function getCurrentYear() {
    return new Date().getFullYear();
}

function getNextTermDate() {
    // Implement your school's term calendar logic here
    return "2nd January 2024";
}

function generateTeacherRemarks(meanScore) {
    if (meanScore >= 80) return "Outstanding performance. Keep up the excellent work!";
    if (meanScore >= 65) return "Good performance. Continue working hard.";
    if (meanScore >= 50) return "Fair performance. More effort needed.";
    return "Needs to improve. Extra attention and support required.";
}

function generatePrincipalRemarks(meanScore) {
    if (meanScore >= 80) return "Excellent achievement. A model student.";
    if (meanScore >= 65) return "Commendable performance. Keep striving for excellence.";
    if (meanScore >= 50) return "Shows promise. Encourage more dedication to studies.";
    return "Requires academic intervention. Parent-teacher conference recommended.";
}

function getGradeBadgeClass(grade) {
    const classes = {
        'Exceeds Expectation': 'bg-success',
        'Meets Expectation': 'bg-info',
        'Approaches Expectation': 'bg-warning',
        'Below Expectation': 'bg-danger'
    };
    return classes[grade] || 'bg-secondary';
}

function getRemarks(score) {
    if (score >= 80) return 'Outstanding performance exceeding grade level standards';
    if (score >= 65) return 'Consistent performance meeting grade level standards';
    if (score >= 50) return 'Inconsistent performance approaching grade level standards';
    return 'Needs significant support to meet grade level standards';
}
