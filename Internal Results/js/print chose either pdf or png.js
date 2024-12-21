// First, add the PDF.js library to your HTML
// Add this in your HTML head section:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>

// Set the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';



// import { Grade1 } from './Grade1.js';
import { Grade1 } from './Grade 1.js';


// Import other grades as needed

const Graduation = {
  Grade1,
  
  
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
      this.currentScale = 5;
      this.rotation = 0;
      this.thumbnails = new Map();
      this.textContent = new Map();
      this.loadedPages = new Set();
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
        this.currentPage = 1;
    
        // Initialize thumbnails for first few pages
        await this.loadInitialPages();
    
        // Continue loading remaining pages in background
        this.loadRemainingPages();
    
        return true;
      } 
      
      catch (error) {
        // Hide progress bar if there's an error
        const loadingProgress = document.getElementById('loadingProgress');
        if (loadingProgress) {
          loadingProgress.style.display = 'none';
        }
    
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

    async loadInitialPages() {
      const pagesToLoad = Math.min(3, this.totalPages);
      const loadingPromises = [];

      for (let pageNum = 1; pageNum <= pagesToLoad; pageNum++) {
        loadingPromises.push(this.loadSinglePage(pageNum));
      }

      await Promise.all(loadingPromises);
      this.initialPagesLoaded = true;
      
      // Update progress bar
      const progressBar = document.getElementById('progressBar');
      if (progressBar) {
        progressBar.style.width = '40%';
        progressBar.textContent = '40%';
      }
    }

    async loadRemainingPages() {
      if (this.isLoadingPages) return;
      this.isLoadingPages = true;

      try {
        const batchSize = 3;
        for (let i = 4; i <= this.totalPages; i += batchSize) {
          const pagesToLoad = [];
          for (let j = 0; j < batchSize && i + j <= this.totalPages; j++) {
            const pageNum = i + j;
            if (!this.loadedPages.has(pageNum)) {
              pagesToLoad.push(this.loadSinglePage(pageNum));
            }
          }

          await Promise.all(pagesToLoad);

          // Update progress
          const progress = Math.min(90, 40 + Math.round((i / this.totalPages) * 50));
          const progressBar = document.getElementById('progressBar');
          if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${progress}%`;
          }

          // Allow UI to remain responsive
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } finally {
        this.isLoadingPages = false;
        
        // Complete the progress
        const progressBar = document.getElementById('progressBar');
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
      }
    }

    async loadSinglePage(pageNum) {
      if (this.loadedPages.has(pageNum)) return;

      const page = await this.currentPdf.getPage(pageNum);
      
      // Generate thumbnail
      const thumbnailScale = 0.2;
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
      
      // Extract text content
      const textContent = await page.getTextContent();
      this.textContent.set(pageNum, textContent.items.map(item => item.str).join(' '));
      
      this.loadedPages.add(pageNum);
    }

    async generateThumbnails() {
      const thumbnailScale = 0.1;
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
  
    async renderPage(searchTerm = '') {
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

        // Highlight search terms
        if (searchTerm) {
          const textContent = await page.getTextContent();
          textContent.items.forEach(item => {
            const text = item.str.toLowerCase();
            const index = text.indexOf(searchTerm.toLowerCase());
            if (index !== -1) {
              const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
              const x = transform[4];
              const y = transform[5] - item.height * SCALE_4K;
              const width = item.width * SCALE_4K;
              const height = item.height * SCALE_4K;
              context.fillStyle = 'rgba(255, 255, 0, 0.5)'; // Yellow highlight
              context.fillRect(x, y, width, height);
              context.strokeStyle = 'yellow';
              context.lineWidth = 2;
              context.strokeRect(x, y, width, height);
            }
          });
        }
    
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
  // Clear existing thumbnails first
  previewManager.thumbnails.clear();
  previewManager.loadedPages.clear();
  
  const totalPages = previewManager.getTotalPages();
  const thumbnailsHtml = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const thumbnail = previewManager.thumbnails.get(pageNum);
    const isActive = pageNum === previewManager.getCurrentPageNumber();
    const thumbnailContent = thumbnail 
      ? `<img src="${thumbnail}" alt="Page ${pageNum}"/>`
      : `<div class="thumbnail-loading">Loading...</div>`;

    thumbnailsHtml.push(`
      <div class="thumbnail ${isActive ? 'active' : ''}" 
           onclick="goToPage(${pageNum})"
           data-page="${pageNum}">
        ${thumbnailContent}
        <div class="thumbnail-label">Page ${pageNum} of ${totalPages}</div>
      </div>
    `);
  }

  return `
    <div class="thumbnails-panel">
      ${thumbnailsHtml.join('')}
    </div>
  `;
}

function createSearchPanel() {
  return `
    <div class="search-panel">
      <div class="search-input-container">
        <input type="search"  onclick="handleSearch()" class="btn-control" id="searchInput" placeholder="🔍Search student's Name to print..."  autocomplete="off"  />
        <!--- <button onclick="handleSearch()" class="btn-control">Search</button> --->
      </div>
      <div id="searchResults" class="search-results"></div>
    </div>
  `;
}






// Enhanced search functionality with both button and live filtering
async function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  const resultsDiv = document.getElementById('searchResults');
  
  if (!searchInput || !resultsDiv) return;

  // Initialize with empty results message
  resultsDiv.innerHTML = '<div class="no-results">Start typing to search...</div>';

  // Add the input event listener for live filtering
  searchInput.addEventListener('input', handleSearchInput);

  // Also handle the current search value (for button click)
  if (searchInput.value.trim()) {
    handleSearchInput({ target: searchInput });
  }
}

// Separate function for handling search input with debouncing
let debounceTimeout;
async function handleSearchInput(event) {
  clearTimeout(debounceTimeout);
  
  const searchTerm = event.target.value.trim().toLowerCase();
  const resultsDiv = document.getElementById('searchResults');
  
  if (!searchTerm) {
    resultsDiv.innerHTML = '<div class="no-results">Start typing to search...</div>';
    return;
  }

  // Set a shorter debounce timeout for more responsive searching
  debounceTimeout = setTimeout(async () => {
    try {
      const startTime = performance.now();
      const results = await previewManager.searchText(searchTerm);
      
      const fragment = document.createDocumentFragment();
      
      if (results.size === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No results found';
        fragment.appendChild(noResults);
      } else {
        const resultsCount = document.createElement('div');
        resultsCount.className = 'results-count';
        resultsCount.textContent = `${results.size} result${results.size === 1 ? '' : 's'} found`;
        fragment.appendChild(resultsCount);

        results.forEach((content, pageNum) => {
          const resultDiv = document.createElement('div');
          resultDiv.className = 'search-result';
          resultDiv.dataset.page = pageNum;
          resultDiv.dataset.content = content.toLowerCase();
          
          resultDiv.innerHTML = `
            <div class="result-page">Page ${pageNum}</div>
            <div class="result-excerpt">${getSearchExcerpt(content, searchTerm)}</div>
          `;

          resultDiv.addEventListener('click', async () => {
            const allResults = resultsDiv.querySelectorAll('.search-result');
            allResults.forEach(r => r.classList.remove('active-result'));
            resultDiv.classList.add('active-result');

            previewManager.currentPage = pageNum;
            const previewImage = await previewManager.renderPage(searchTerm);
            updatePreviewDisplay(previewImage);
          });

          fragment.appendChild(resultDiv);
        });
      }

      resultsDiv.innerHTML = '';
      resultsDiv.appendChild(fragment);

      const endTime = performance.now();
      console.log(`Search completed in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.error('Search error:', error);
      resultsDiv.innerHTML = '<div class="no-results">An error occurred during search</div>';
    }
  }, 300); // Increased debounce time slightly for better performance
}

// Utility function to get search excerpt with improved highlighting
function getSearchExcerpt(content, searchTerm) {
  const lowerContent = content.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const index = lowerContent.indexOf(lowerSearchTerm);
  
  if (index === -1) return content;
  
  // Extend context around the search term
  const contextLength = 50;
  const start = Math.max(0, index - contextLength);
  const end = Math.min(content.length, index + searchTerm.length + contextLength);
  
  let excerpt = content.substring(start, end);
  
  // Add ellipsis if truncated
  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt += '...';
  
  // Highlight the search term
  const highlightedExcerpt = excerpt.replace(
    new RegExp(searchTerm, 'gi'), 
    match => `<mark class="search-highlight">${match}</mark>`
  );
  
  return highlightedExcerpt;
}

// Add global scope functions
window.handleSearch = handleSearch;








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



// Update the updatePreviewDisplay function to include print button
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
          <button id="printBtn" class="btn-control">
            🖨️ Print
          </button>
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
            id="pdfPreviewImage"
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
    
    // Add print functionality
    document.getElementById("printBtn").addEventListener("click", handlePrintPage);
  } else {
    previewDiv.innerHTML = '<div class="text-center text-red-500">Preview failed to load</div>';
  }
}

// Updated function to handle page printing with better Android support
async function handlePrintPage() {
  const previewImage = await previewManager.renderPage('');
  if (!previewImage) return;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    // Show format selection dialog with both PDF and PNG buttons
    const { value: format } = await Swal.fire({
      title: 'Select Format',
      text: 'Choose your preferred download format:',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true, // Add deny button for PNG
      confirmButtonText: 'PDF',
      denyButtonText: 'PNG',
      cancelButtonText: 'Cancel',
      showCloseButton: true,
      reverseButtons: true
    });

    if (format === true) {  // PDF selected
      try {
        if (typeof jsPDF === 'undefined') {
          throw new Error('jsPDF library not loaded');
        }

        // Create PDF using existing PDF logic
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const img = new Image();
        img.src = previewImage;
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            try {
              const pageWidth = pdf.internal.pageSize.getWidth();
              const pageHeight = pdf.internal.pageSize.getHeight();
              const imgRatio = img.height / img.width;
              const pageRatio = pageHeight / pageWidth;
              
              let finalWidth = pageWidth;
              let finalHeight = pageWidth * imgRatio;
              
              if (finalHeight > pageHeight) {
                finalHeight = pageHeight;
                finalWidth = pageHeight / imgRatio;
              }
              
              const x = (pageWidth - finalWidth) / 2;
              const y = (pageHeight - finalHeight) / 2;

              pdf.addImage(previewImage, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');
              pdf.save(`page_${previewManager.getCurrentPageNumber()}.pdf`);
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = reject;
        });
      } catch (error) {
        console.error('Error creating PDF:', error);
        Swal.fire({
          title: 'Error',
          text: 'Could not create PDF. Please try PNG format instead.',
          icon: 'error',
          timer: 2000
        });
      }
    } else if (format === false) {  // PNG selected
      const link = document.createElement('a');
      link.href = previewImage;
      link.download = `page_${previewManager.getCurrentPageNumber()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // If format is null, user clicked Cancel or Close
  } else {
    // Existing desktop printing logic
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Preview</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: white;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              object-fit: contain;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              img {
                width: 100%;
                height: auto;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <img src="${previewImage}">
          <script>
            window.onload = function() {
              window.print();
              window.addEventListener('afterprint', function() {
                window.close();
              });
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // Re-render preview with highlights if needed
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) {
    const previewImageWithHighlights = await previewManager.renderPage(searchInput.value.trim());
    updatePreviewDisplay(previewImageWithHighlights);
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
      <div id="pdfPreview" style="margin-top: 20px;"></div>
    
      <select id="yearSelect" class="swal2-select">
        <option value="" disabled selected>Select Year</option>
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
  document.getElementById('examSelect').addEventListener('change', async function() {
    const selectedExam = this.value;
    const pdfUrl = currentDataArray.files[selectedExam];
    const previewDiv = document.getElementById('pdfPreview');
    const loadingProgress = document.getElementById('loadingProgress');
    
    if (pdfUrl) {
      previewDiv.innerHTML = '';
      loadingProgress.style.display = 'block';
      updateProgress(0);
      
      // Clear existing cache and thumbnails when loading new document
      previewCache.delete(pdfUrl);
      previewManager.thumbnails.clear();
      previewManager.loadedPages.clear();
      
      try {
        const progressCallback = (progress) => {
          updateProgress(progress * 0.8);
        };

        const loaded = await previewManager.loadPdf(pdfUrl, progressCallback);
        if (loaded) {
          updateProgress(80);
          const previewImage = await previewManager.renderPage();
          if (previewImage) {
            updateProgress(100);
            previewCache.set(pdfUrl, previewImage);
            updatePreviewDisplay(previewImage);
            loadingProgress.style.display = 'none';
          }
        }
      } catch (error) {
        console.error('Error loading preview:', error);
        previewDiv.innerHTML = '<div class="text-center">Error loading preview</div>';
        loadingProgress.style.display = 'none';
      }
    }
  });
}





// Your existing helper functions remain the same
function populateTermDropdown(terms) {
  // ... existing code ...
  const termSelect = document.getElementById('termSelect');
  termSelect.innerHTML = '<option value="" disabled selected>Select Term </option>';
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
  examSelect.innerHTML = '<option value="" disabled selected>Select Outcome</option>';
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

// Add goToPage to window object
window.goToPage = async function(pageNum) {
  previewManager.currentPage = pageNum;
  const previewImage = await previewManager.renderPage();
  updatePreviewDisplay(previewImage);
}


