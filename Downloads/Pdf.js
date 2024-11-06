// First, add the PDF.js library to your HTML
// Add this in your HTML head section:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>

// Set the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';



// import { Grade1 } from './Grade1.js';
import { Grade3 } from './Grade3.js';
import { Grade4 } from './Grade4.js';
import { Grade5 } from './Grade5.js';
import { Grade6 } from './Grade6.js';
import { Grade7 } from './Grade7.js';
import { Grade8 } from './Grade8.js';
import { Grade9 } from './Grade9.js';
// Import other grades as needed

const grades = {
  Grade3,
  Grade4,
  Grade5,
  Grade6,
  Grade7,
  Grade8,
  Grade9,
  // Add more grades here if needed
};

const openPopupBtns = document.querySelectorAll('.openPopupBtn');
let currentDataArray = null;
const previewCache = new Map(); // Cache for preview images

// Enhanced PDF preview renderer with page management
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

class PdfPreviewManager {
    constructor() {
      this.currentPdf = null;
      this.currentPage = 1;
      this.totalPages = 0;
      this.currentScale = 1.5;
      this.rotation = 0;
      this.thumbnails = new Map();
      this.textContent = new Map();
    }
  
    async loadPdf(pdfUrl) {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        this.currentPdf = await loadingTask.promise;
        this.totalPages = this.currentPdf.numPages;
        this.currentPage = 1;
        await this.generateThumbnails();
        return true;
      } catch (error) {
        // Show the error message
        Swal.showValidationMessage('Error. We cannot open this PDF file. Try downloading it directly.');
    
        // Get the validation message element and reset its style
        const validationMessage = Swal.getValidationMessage();
        if (validationMessage) {
          validationMessage.style.display = 'block'; // Make sure it's visible
          validationMessage.style.opacity = '1';     // Reset opacity for visibility
          validationMessage.style.transition = '';   // Clear any previous transition
        }
    
        // Set a timeout to fade out and hide the message after 2 seconds
        setTimeout(() => {
          if (validationMessage) {
            validationMessage.style.transition = 'opacity 1s ease'; // Apply fade-out effect
            validationMessage.style.opacity = '0'; // Start fading out
    
            // Hide completely after fade-out
            setTimeout(() => {
              validationMessage.style.display = 'none';
            }, 1000); // Match the duration of the fade-out
          }
        }, 5000);
    
        return false;
      }
    }
    
    async generateThumbnails() {
      const thumbnailScale = 0.2;
      for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
        const page = await this.currentPdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: thumbnailScale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
  
        this.thumbnails.set(pageNum, canvas.toDataURL());
        
        // Extract text content for search
        const textContent = await page.getTextContent();
        this.textContent.set(pageNum, textContent.items.map(item => item.str).join(' '));
      }
    }
  
    async renderPage() {
      if (!this.currentPdf) return null;
    
      try {
        const SCALE_4K = 4;  // Increase scale factor for 4K resolution
    
        const page = await this.currentPdf.getPage(this.currentPage);
        const viewport = page.getViewport({ 
          scale: SCALE_4K,
          rotation: this.rotation 
        });
    
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
    
        return canvas.toDataURL();
      } catch (error) {
        console.error('Error rendering page:', error);
        return null;
      }
    }
    
    
  async nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      return await this.renderPage();
    }
    return null;
  }

  async previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      return await this.renderPage();
    }
    return null;
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
  
    async searchText(searchTerm) {
      const results = new Map();
      for (const [pageNum, content] of this.textContent) {
        if (content.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.set(pageNum, content);
        }
      }
      return results;
    }
  
    rotate(degrees) {
      this.rotation = (this.rotation + degrees) % 360;
    }
  
    // Add the getScale method here
    getScale() {
      return this.currentScale;
    }
  
    // Add a method to get the current page number
    getCurrentPageNumber() {
      return this.currentPage;
    }
  
    // Add a method to get the total number of pages
    getTotalPages() {
      return this.totalPages;
    }
  
    // Add other methods as necessary...
  }
  

const previewManager = new PdfPreviewManager();
let isFullscreen = false;

function createThumbnailsPanel() {
  const thumbnailsHtml = Array.from(previewManager.thumbnails.entries())
    .map(([pageNum, thumbnail]) => `
      <div class="thumbnail ${pageNum === previewManager.getCurrentPageNumber() ? 'active' : ''}" 
           onclick="goToPage(${pageNum})"
           data-page="${pageNum}">
        <img src="${thumbnail}" alt="Page ${pageNum}"/>
        <div class="thumbnail-label">Page ${pageNum}</div>
      </div>
    `).join('');

  return `
    <div class="thumbnails-panel">
      ${thumbnailsHtml}
    </div>
  `;
}

function createSearchPanel() {
  return `
    <div class="search-panel">
      <div class="search-input-container">
        <input type="text" id="searchInput" placeholder="Search in PDF..." class="search-input"/>
        <button onclick="handleSearch()" class="btn-control">Search</button>
      </div>
      <div id="searchResults" class="search-results"></div>
    </div>
  `;
}

async function handleSearch() {
  const searchTerm = document.getElementById('searchInput').value;
  if (!searchTerm) return;

  const results = await previewManager.searchText(searchTerm);
  const resultsDiv = document.getElementById('searchResults');
  
  if (results.size === 0) {
    resultsDiv.innerHTML = '<div class="no-results">No results found</div>';
    return;
  }

  const resultsHtml = Array.from(results.entries())
    .map(([pageNum, content]) => {
      const excerpt = getSearchExcerpt(content, searchTerm);
      return `
        <div class="search-result" onclick="goToPage(${pageNum})">
          <div class="result-page">Page ${pageNum}</div>
          <div class="result-excerpt">${excerpt}</div>
        </div>
      `;
    }).join('');

  resultsDiv.innerHTML = resultsHtml;
}

function getSearchExcerpt(content, searchTerm) {
  const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
  const start = Math.max(0, index - 40);
  const end = Math.min(content.length, index + searchTerm.length + 40);
  let excerpt = content.substring(start, end);
  
  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';
  
  return excerpt.replace(
    new RegExp(searchTerm, 'gi'),
    match => `<mark>${match}</mark>`
  );
}

async function goToPage(pageNum) {
  previewManager.currentPage = pageNum;
  const previewImage = await previewManager.renderPage();
  updatePreviewDisplay(previewImage);
}

function toggleFullscreen() {
  const previewContainer = document.getElementById('pdfPreview');
  isFullscreen = !isFullscreen;
  
  if (isFullscreen) {
    previewContainer.classList.add('fullscreen');
  } else {
    previewContainer.classList.remove('fullscreen');
  }
  
  updatePreviewDisplay(previewContainer.querySelector('img').src);
}

async function handleRotate(degrees) {
  previewManager.rotate(degrees);
  const previewImage = await previewManager.renderPage();
  updatePreviewDisplay(previewImage);
}

// Updated updatePreviewDisplay function
async function updatePreviewDisplay(previewImage) {
  const previewDiv = document.getElementById('pdfPreview');
  if (previewImage) {
    const scale = previewManager.getScale();
    const currentPage = previewManager.getCurrentPageNumber();
    const totalPages = previewManager.getTotalPages();
    const rotation = previewManager.rotation;

    // Generate HTML for the toolbar and preview area
    previewDiv.innerHTML = `
      <div class="toolbar">
        <div class="toolbar-group">
          <button id="previousPageBtn" class="btn-control" ${currentPage === 1 ? 'disabled' : ''}>
            ← Previous
          </button>
          <span>Page ${currentPage} of ${totalPages}</span>
          <button id="nextPageBtn" class="btn-control" ${currentPage === totalPages ? 'disabled' : ''}>
            Next →
          </button>
        </div>
        <div class="toolbar-group">
          <button id="zoomOutBtn" class="btn-control" ${scale <= 0.5 ? 'disabled' : ''}>
            Zoom Out
          </button>
          <span>${Math.round(scale * 100)}%</span>
          <button id="zoomInBtn" class="btn-control">
            Zoom In
          </button>
          <button id="rotateLeftBtn" class="btn-control">
            ↶ Rotate Left
          </button>
          <button id="rotateRightBtn" class="btn-control">
            ↷ Rotate Right
          </button>
          <button id="fullscreenBtn" class="btn-control">
            ${isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>
      <div class="preview-container">
        ${createThumbnailsPanel()}
        <div class="main-preview">
          <img 
            src="${previewImage}" 
            style="max-width: 100%; transform: rotate(${rotation}deg);" 
            alt="PDF Preview"
          />
        </div>
        ${createSearchPanel()}
      </div>
    `;

    // Add event listeners for the toolbar buttons
    document.getElementById("previousPageBtn").addEventListener("click", handlePreviousPage);
    document.getElementById("nextPageBtn").addEventListener("click", handleNextPage);
    document.getElementById("zoomOutBtn").addEventListener("click", handleZoomOut);
    document.getElementById("zoomInBtn").addEventListener("click", handleZoomIn);
    document.getElementById("rotateLeftBtn").addEventListener("click", () => handleRotate(-90));
    document.getElementById("rotateRightBtn").addEventListener("click", () => handleRotate(90));
    document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);
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
        <option value="" disabled selected>Select Category </option>
      </select>
      <select id="examSelect" class="swal2-select" style="display:none;">
        <option value="" disabled selected>Select type of Assessment</option>
      </select>
      <div id="pdfPreview" style="margin-top: 20px;"></div>
    `,
    width: 'auto',
    showCancelButton: true,
    confirmButtonText: 'Download',
    cancelButtonText: 'Close',
    preConfirm: () => {
      const examSelect = document.getElementById('examSelect');
      const selectedExam = examSelect.value;

      if (!selectedExam) {
        Swal.showValidationMessage('Please select  correct exam');
        return false;
      }

      return Swal.fire({
        title: 'Confirm Download',
        text: `You are about to download:${currentDataArray.title} ${selectedExam} paper. Do you want to proceed?`,
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
  termSelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
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
  examSelect.innerHTML = '<option value="" disabled selected>Select an Assessment Tool</option>';
  exams.forEach(exam => {
    const option = document.createElement('option');
    option.value = exam;
    option.textContent = exam;
    examSelect.appendChild(option);
  })
  
}
// Button Event Listener to Load Appropriate Grade Data
openPopupBtns.forEach(button => {
  button.addEventListener('click', function() {
      const arrayKey = this.getAttribute('data-array'); // e.g., "Grade1" or "Grade2"
      currentDataArray = grades[arrayKey]; // Access the grade data dynamically
      if (currentDataArray) {
          openSwalPopup(); // Call your function to open the SweetAlert popup
      } else {
          console.warn(`No data found for ${arrayKey}`);
      }
  });
});