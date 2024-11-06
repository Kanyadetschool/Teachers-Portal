// First, add the PDF.js library to your HTML
// Add this in your HTML head section:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>

// Set the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

const openPopupBtns = document.querySelectorAll('.openPopupBtn');
const dataArrays = {
  // ... your existing dataArrays object remains the same ...



  Grade2: {
    title: 'Grade 2 Past Papers',  // Add a title for this array
    years: [
      { year: '2024', terms: [
        { term: 'End-Term 2', exams: ['Reading Activities', 'English Activities', 'Environmental','Kiswahili','Mathematics','C.R.E',] },
      ]},
    ],
    files: {
      'Reading Activities': '../Docs/2024/END-TERM II EXAMS/Grade 2/READING.pdf',
      'English Activities': '../Docs/2024/END-TERM II EXAMS/Grade 2/English Activities.pdf',
      'Environmental': '../Docs/2024/END-TERM II EXAMS/Grade 2/Environmental.pdf',
      'Kiswahili': '../Docs/2024/END-TERM II EXAMS/Grade 2/Kiswahili.pdf',
      'Mathematics': '../Docs/2024/END-TERM II EXAMS/Grade 2/Mathematics.pdf',
      'C.R.E': '../Docs/2024/END-TERM II EXAMS/Grade 2/C.R.E.pdf',
    }
  },

};

let currentDataArray = null;
const previewCache = new Map(); // Cache for preview images

// Enhanced PDF preview renderer with page management
class PdfPreviewManager {
  constructor() {
    this.currentPdf = null;
    this.currentPage = 1;
    this.totalPages = 0;
    this.currentScale = 1.5;
  }

  async loadPdf(pdfUrl) {
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      this.currentPdf = await loadingTask.promise;
      this.totalPages = this.currentPdf.numPages;
      this.currentPage = 1;
      return true;
    } catch (error) {
      console.error('Error loading PDF:', error);
      return false;
    }
  }

  async renderPage() {
    if (!this.currentPdf) return null;

    try {
      const page = await this.currentPdf.getPage(this.currentPage);
      const viewport = page.getViewport({ scale: this.currentScale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      return canvas.toDataURL();
    } catch (error) {
      console.error('Error rendering page:', error);
      return null;
    }
  }

  async zoomIn() {
    this.currentScale += 0.25;
    return await this.renderPage();
  }

  async zoomOut() {
    if (this.currentScale > 0.5) {
      this.currentScale -= 0.25;
      return await this.renderPage();
    }
    return null;
  }

  getCurrentPageNumber() {
    return this.currentPage;
  }

  getTotalPages() {
    return this.totalPages;
  }

  getScale() {
    return this.currentScale;
  }
}

const previewManager = new PdfPreviewManager();

// Function to update the preview display
async function updatePreviewDisplay(previewImage) {
  const previewDiv = document.getElementById('pdfPreview');
  if (previewImage) {
    const scale = previewManager.getScale();
    const currentPage = previewManager.getCurrentPageNumber();
    const totalPages = previewManager.getTotalPages();
    
    previewDiv.innerHTML = `
      <div class="text-center">
        <div class="preview-controls mb-4">
          <button onclick="handlePreviousPage()" class="btn-control" ${currentPage === 1 ? 'disabled' : ''}>
            ← Previous
          </button>
          <span class="mx-4">Page ${currentPage} of ${totalPages}</span>
          <button onclick="handleNextPage()" class="btn-control" ${currentPage === totalPages ? 'disabled' : ''}>
            Next →
          </button>
        </div>
        <div class="zoom-controls mb-4">
          <button onclick="handleZoomOut()" class="btn-control" ${scale <= 0.5 ? 'disabled' : ''}>
            Zoom Out
          </button>
          <span class="mx-4">${Math.round(scale * 100)}%</span>
          <button onclick="handleZoomIn()" class="btn-control">
            Zoom In
          </button>
        </div>
        <div class="preview-container" style="overflow: auto; max-height: 600px;">
          <img src="${previewImage}" style="max-width: 100%; border: 1px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" alt="PDF Preview"/>
        </div>
      </div>
    `;
  } else {
    previewDiv.innerHTML = '<div class="text-center text-red-500">Preview failed to load</div>';
  }
}

// Handler functions for controls
async function handleNextPage() {
  const previewImage = await previewManager.nextPage();
  updatePreviewDisplay(previewImage);
}

async function handlePreviousPage() {
  const previewImage = await previewManager.previousPage();
  updatePreviewDisplay(previewImage);
}

async function handleZoomIn() {
  const previewImage = await previewManager.zoomIn();
  updatePreviewDisplay(previewImage);
}

async function handleZoomOut() {
  const previewImage = await previewManager.zoomOut();
  updatePreviewDisplay(previewImage);
}

// Modified openSwalPopup function
async function openSwalPopup() {
  Swal.fire({
    title: currentDataArray.title,
    html: `
      <style>
        .btn-control {
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f8f9fa;
          cursor: pointer;
        }
        .btn-control:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-control:not(:disabled):hover {
          background: #e9ecef;
        }
        .preview-controls, .zoom-controls {
          margin: 10px 0;
        }
        .mx-4 {
          margin: 0 1rem;
        }
        .mb-4 {
          margin-bottom: 1rem;
        }
      </style>
      <select id="yearSelect" class="swal2-select">
        <option value="" disabled selected>Select a year</option>
        ${currentDataArray.years.map(year => `<option value="${year.year}" data-terms='${JSON.stringify(year.terms)}'>${year.year}</option>`).join('')}
      </select>
      <select id="termSelect" class="swal2-select" style="display:none;">
        <option value="" disabled selected>Select a term</option>
      </select>
      <select id="examSelect" class="swal2-select" style="display:none;">
        <option value="" disabled selected>Select an exam type</option>
      </select>
      <div id="pdfPreview" style="margin-top: 20px;"></div>
    `,
    width: '900px',
    showCancelButton: true,
    confirmButtonText: 'Download',
    cancelButtonText: 'Close',
    preConfirm: () => {
      const examSelect = document.getElementById('examSelect');
      const selectedExam = examSelect.value;

      if (!selectedExam) {
        Swal.showValidationMessage('Please select an exam type');
        return false;
      }

      return Swal.fire({
        title: 'Confirm Download',
        text: `You are about to download: ${selectedExam} paper. Do you want to proceed?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, download it!',
        cancelButtonText: 'No, cancel'
      }).then(result => {
        if (result.isConfirmed) {
          const fileToDownload = currentDataArray.files[selectedExam];
          if (fileToDownload) {
            const link = document.createElement('a');
            link.href = fileToDownload;
            link.download = fileToDownload.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            Swal.showValidationMessage('File not found for the selected exam');
          }
        }
        return false;
      });
    }
  });

  // Event listeners for dropdowns
  document.getElementById('yearSelect').addEventListener('change', function() {
    const selectedYear = this.options[this.selectedIndex];
    const terms = JSON.parse(selectedYear.getAttribute('data-terms'));
    populateTermDropdown(terms);
    document.getElementById('termSelect').style.display = 'block';
    document.getElementById('pdfPreview').innerHTML = '';
  });

  document.getElementById('termSelect').addEventListener('change', function() {
    const selectedTerm = this.options[this.selectedIndex];
    const exams = JSON.parse(selectedTerm.getAttribute('data-exams'));
    populateExamDropdown(exams);
    document.getElementById('examSelect').style.display = 'block';
    document.getElementById('pdfPreview').innerHTML = '';
  });

  // Enhanced exam selection handler with caching
  document.getElementById('examSelect').addEventListener('change', async function() {
    const selectedExam = this.value;
    const pdfUrl = currentDataArray.files[selectedExam];
    const previewDiv = document.getElementById('pdfPreview');
    
    if (pdfUrl) {
      previewDiv.innerHTML = '<div class="text-center">Loading preview...</div>';
      
      // Check cache first
      if (previewCache.has(pdfUrl)) {
        await previewManager.loadPdf(pdfUrl);
        const previewImage = previewCache.get(pdfUrl);
        updatePreviewDisplay(previewImage);
      } else {
        // Load and cache new preview
        const loaded = await previewManager.loadPdf(pdfUrl);
        if (loaded) {
          const previewImage = await previewManager.renderPage();
          if (previewImage) {
            previewCache.set(pdfUrl, previewImage);
            updatePreviewDisplay(previewImage);
          }
        }
      }
    }
  });
}

// Your existing helper functions remain the same
function populateTermDropdown(terms) {
  // ... existing code ...
  const termSelect = document.getElementById('termSelect');
  termSelect.innerHTML = '<option value="" disabled selected>Select a term</option>';
  terms.forEach(termObj => {
    const option = document.createElement('option');
    option.value = termObj.term;
    option.textContent = termObj.term;
    option.setAttribute('data-exams', JSON.stringify(termObj.exams));
    termSelect.appendChild(option);
  });
}

function populateExamDropdown(exams) {
  // ... existing code ...
   const examSelect = document.getElementById('examSelect');
  examSelect.innerHTML = '<option value="" disabled selected>Select an exam type</option>';
  exams.forEach(exam => {
    const option = document.createElement('option');
    option.value = exam;
    option.textContent = exam;
    examSelect.appendChild(option);
  })
  
}

openPopupBtns.forEach(button => {
  button.addEventListener('click', function() {
    const arrayKey = this.getAttribute('data-array');
    currentDataArray = dataArrays[arrayKey];
    openSwalPopup();
  });
});