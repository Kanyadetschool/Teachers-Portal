// First, add the PDF.js library to your HTML
// Add this in your HTML head section:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>

// Set the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';



// import { Grade1 } from './Grade1.js';
import { SchoolInternalResults } from './School Internal Results.js';
import { Year2025 } from './2025.js';
import { Year2024 } from './2024.js';

// Import other grades as needed

const Graduation = {
  SchoolInternalResults,
  Year2025,
  Year2024,
  
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
        this.totalPages = 0;
        this.currentScale = 1.5;
        this.rotation = 0;
        this.thumbnails = new Map();
        this.textContent = new Map();
        this.initialPinchDistance = 0;
    }

    async loadPdf(pdfUrl) {
        try {
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            
            // Add progress tracking
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                loadingTask.onProgress = function(progress) {
                    const percent = progress.loaded ? Math.round((progress.loaded / progress.total) * 100) : 0;
                    progressBar.style.width = `${percent}%`;
                    progressBar.textContent = `${percent}%`;
                };
            }
        
            this.currentPdf = await loadingTask.promise;
            this.totalPages = this.currentPdf.numPages;
            
            if (progressBar) {
                progressBar.style.width = '90%';
                progressBar.textContent = '90%';
            }

            // Wait for the PDF to be fully loaded before rendering
            await this.renderAllPages();
            await this.generateThumbnails();
        
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.textContent = '100%';
                
                setTimeout(() => {
                    const loadingProgress = document.getElementById('loadingProgress');
                    if (loadingProgress) {
                        loadingProgress.style.display = 'none';
                    }
                }, 500);
            }
        
            return true;
        } catch (error) {
            console.error('Error loading PDF:', error);
            const loadingProgress = document.getElementById('loadingProgress');
            if (loadingProgress) {
                loadingProgress.style.display = 'none';
            }
            Swal.showValidationMessage('Error. We cannot open this PDF file. Try downloading it directly.');
            return false;
        }
    }

    async renderAllPages() {
        if (!this.currentPdf || this.totalPages === 0) {
            console.error('No PDF loaded or invalid page count');
            return;
        }

        const previewDiv = document.getElementById('pdfPreview');
        previewDiv.innerHTML = `
            <div class="toolbar">
                <div class="toolbar-group">
                    <span>Total Pages: ${this.totalPages}</span>
                </div>
                <div class="toolbar-group">
                    <button id="zoomOutBtn" class="btn-control">Zoom Out</button>
                    <span id="zoomLevel">${Math.round(this.currentScale * 100)}%</span>
                    <button id="zoomInBtn" class="btn-control">Zoom In</button>
                    <button id="rotateLeftBtn" class="btn-control">↶ Rotate Left</button>
                    <button id="rotateRightBtn" class="btn-control">↷ Rotate Right</button>
                    <button id="fullscreenBtn" class="btn-control">
                        ${isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </button>
                </div>
            </div>
            <div class="preview-container">
                <div class="main-preview">
                    <div class="continuous-pages" id="pdfPages"></div>
                </div>
            </div>
        `;

        const pagesContainer = document.getElementById('pdfPages');
        
        // Render pages
        for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
            try {
                const page = await this.currentPdf.getPage(pageNum);
                const viewport = page.getViewport({ 
                    scale: this.currentScale,
                    rotation: this.rotation 
                });
            
                const pageContainer = document.createElement('div');
                pageContainer.className = 'pdf-page';
                pageContainer.setAttribute('data-page', pageNum);
                
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                const context = canvas.getContext('2d');
                
                const pageNumber = document.createElement('div');
                pageNumber.className = 'page-number';
                pageNumber.textContent = `Page ${pageNum}`;
                
                pageContainer.appendChild(pageNumber);
                pageContainer.appendChild(canvas);
                pagesContainer.appendChild(pageContainer);
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
            } catch (error) {
                console.error(`Error rendering page ${pageNum}:`, error);
            }
        }

        // Add touch events for pinch zoom
        const container = document.querySelector('.continuous-pages');
        
        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                this.initialPinchDistance = this.getPinchDistance(e.touches);
            }
        });

        container.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault(); // Prevent default scrolling
                const currentDistance = this.getPinchDistance(e.touches);
                const scaleDiff = currentDistance / this.initialPinchDistance;
                
                if (Math.abs(scaleDiff - 1) > 0.1) { // Threshold to prevent tiny changes
                    const newScale = this.currentScale * scaleDiff;
                    if (newScale >= 0.5 && newScale <= 3) { // Limit zoom range
                        this.currentScale = newScale;
                        this.renderAllPages();
                        this.initialPinchDistance = currentDistance;
                    }
                }
            }
        });

        // Add button event listeners
        document.getElementById('zoomOutBtn').onclick = () => {
            if (this.currentScale > 0.5) {
                this.currentScale -= 0.25;
                this.renderAllPages();
            }
        };

        document.getElementById('zoomInBtn').onclick = () => {
            if (this.currentScale < 3) {
                this.currentScale += 0.25;
                this.renderAllPages();
            }
        };

        document.getElementById('rotateLeftBtn').onclick = () => {
            this.rotation = (this.rotation - 90) % 360;
            this.renderAllPages();
        };

        document.getElementById('rotateRightBtn').onclick = () => {
            this.rotation = (this.rotation + 90) % 360;
            this.renderAllPages();
        };

        document.getElementById('fullscreenBtn').onclick = () => {
            const container = document.querySelector('.preview-container');
            isFullscreen = !isFullscreen;
            
            if (isFullscreen) {
                container.classList.add('fullscreen');
            } else {
                container.classList.remove('fullscreen');
            }
        };
    }

    // Helper method for calculating pinch distance
    getPinchDistance(touches) {
        return Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
        );
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



async function openSwalPopup() {
  Swal.fire({
    title: currentDataArray.title,
    html: `
    
      <select id="yearSelect" class="swal2-select">
        <option value="" disabled selected>Select Level Of Study</option>
        ${currentDataArray.years.map(year => `<option value="${year.year}" data-terms='${JSON.stringify(year.terms)}'>${year.year}</option>`).join('')}
      </select>
      <select id="termSelect" class="swal2-select" style="display:none;">
        <option value="" disabled selected>Select Student's Gender </option>
      </select>
      <select id="examSelect" class="swal2-select" style="display:none;">
        <option value="" disabled selected>Select Student Name</option>
      </select>










      
      <div id="loadingProgress" style="display:none;">
        <div class="loading-progress">
          





           


<div class="loader">
  <div class="truckWrapper">
    <div class="truckBody">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 198 93"
        class="trucksvg"
      >
        <path
          stroke-width="3"
          stroke="#282828"
          fill="#F83D3D"
          d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"
        ></path>
        <path
          stroke-width="3"
          stroke="#282828"
          fill="#7D7C7C"
          d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"
        ></path>
        <path
          stroke-width="2"
          stroke="#282828"
          fill="#282828"
          d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"
        ></path>
        <rect
          stroke-width="2"
          stroke="#282828"
          fill="#FFFCAB"
          rx="1"
          height="7"
          width="5"
          y="63"
          x="187"
        ></rect>
        <rect
          stroke-width="2"
          stroke="#282828"
          fill="#282828"
          rx="1"
          height="11"
          width="4"
          y="81"
          x="193"
        ></rect>
        <rect
          stroke-width="3"
          stroke="#282828"
          fill="#DFDFDF"
          rx="2.5"
          height="90"
          width="121"
          y="1.5"
          x="6.5"
        ></rect>
        <rect
          stroke-width="2"
          stroke="#282828"
          fill="#DFDFDF"
          rx="2"
          height="4"
          width="6"
          y="84"
          x="1"
        ></rect>
      </svg>
    </div>
    <div class="truckTires">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 30 30"
        class="tiresvg"
      >
        <circle
          stroke-width="3"
          stroke="#282828"
          fill="#282828"
          r="13.5"
          cy="15"
          cx="15"
        ></circle>
        <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 30 30"
        class="tiresvg"
      >
        <circle
          stroke-width="3"
          stroke="#282828"
          fill="#282828"
          r="13.5"
          cy="15"
          cx="15"
        ></circle>
        <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
      </svg>
    </div>
    <div class="road"></div>

    <svg
      xml:space="preserve"
      viewBox="0 0 453.459 453.459"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
      id="Capa_1"
      version="1.1"
      fill="#000000"
      class="lampPost"
    >
      <path
        d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993
c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514
c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16
c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914
h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75
v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795
V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z
M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017
h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"
      ></path>
    </svg>
  </div>
</div>




 <div id="progressBar" class="progress-bar">0%</div>
           
        </div>
      </div>
      <div id="pdfPreview" style="margin-top: 20px;"></div>
    `,
    width: 'auto',
    showCancelButton: true,
    confirmButtonText: 'Download',
    cancelButtonText: 'X',
    preConfirm: () => {
      const examSelect = document.getElementById('examSelect');
      const selectedExam = examSelect.value;

      if (!selectedExam) {
        Swal.showValidationMessage('Please select correct exam');
        return false;
      }

      return Swal.fire({
        title: 'Confirm Download',
        text: `You are about to download:${currentDataArray.title} ${selectedExam} paper. Do you want to proceed?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, download it!',
        cancelButtonText: 'X'
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
    document.getElementById('loadingProgress').style.display = 'none';
  });

  document.getElementById('termSelect').addEventListener('change', function() {
    const selectedTerm = this.options[this.selectedIndex];
    const exams = JSON.parse(selectedTerm.getAttribute('data-exams'));
    populateExamDropdown(exams);
    document.getElementById('examSelect').style.display = 'block';
    document.getElementById('pdfPreview').innerHTML = '';
    document.getElementById('loadingProgress').style.display = 'none';
  });

  // Function to update progress bar, ensuring it caps at 100%
  const updateProgress = (progress) => {
    const progressBar = document.getElementById('progressBar');
    const percentage = Math.min(Math.round(progress * 100), 100); // Cap at 100%
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
  };

  // Enhanced exam selection handler with caching and progress
  document.getElementById('examSelect')?.addEventListener('change', async function() {
    const selectedExam = this.value;
    if (!selectedExam || !currentDataArray?.files) return;

    const pdfUrl = currentDataArray.files[selectedExam];
    const loadingProgress = document.getElementById('loadingProgress');
    
    if (pdfUrl) {
        loadingProgress.style.display = 'block';
        try {
            await previewManager.loadPdf(pdfUrl);
        } catch (error) {
            console.error('Error loading PDF:', error);
            Swal.showValidationMessage('Error loading PDF. Please try again.');
        } finally {
            loadingProgress.style.display = 'none';
        }
    }
  });
}





// Your existing helper functions remain the same
function populateTermDropdown(terms) {
  // ... existing code ...
  const termSelect = document.getElementById('termSelect');
  termSelect.innerHTML = '<option value="" disabled selected>Select Document type</option>';
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
      currentDataArray = Graduation[arrayKey]; // Access the grade data dynamically
      if (currentDataArray) {
          openSwalPopup(); // Call your function to open the SweetAlert popup
      } else {
          console.warn(`No data found for ${arrayKey}`);
      }
  });
});

// Add these CSS styles for better touch handling
const styles = `
.continuous-pages {
    touch-action: none; /* Disable browser touch actions for better pinch zoom control */
    -webkit-user-select: none;
    user-select: none;
}

.pdf-page {
    transform-origin: center center;
    transition: transform 0.1s ease-out;
}

.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: white;
    padding: 20px;
}
`;