// Import statements for required modules
import Reports from './Reports.js';
import Pastpapers from './Pastpapers.js';
import Circulars from './Circulars.js';
import calendar from './calendar.js';
import SBAPracticalsTests from './SBAPracticalsTests.js';
import SBAWrittenTests from './SBAWrittenTests.js';

// Initialize Feather Icons
feather.replace();

// Combine all resources into a single array
const resources = [
    ...Reports,
    ...Pastpapers,
    ...Circulars,
    ...calendar,
    ...SBAPracticalsTests,
    ...SBAWrittenTests
];

// Create alert container
const alertContainer = document.createElement('div');
alertContainer.style.position = 'fixed';
alertContainer.style.top = '1rem';
alertContainer.style.right = '1rem';
alertContainer.style.zIndex = '50';
document.body.appendChild(alertContainer);

// Function to show alert messages
function showAlert(message, variant = 'error') {
    const alertHTML = `
        <div class="fixed top-4 right-4 flex w-[360px] animate-in fade-in-0 zoom-in-95">
            <div class="relative w-full rounded-lg border ${
                variant === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
            } p-4 shadow-lg">
                <div class="flex items-start gap-4">
                    <div class="mt-1">
                        ${
                            variant === 'error' 
                                ? '<i data-feather="x-circle" class="h-5 w-5 text-red-500"></i>' 
                                : '<i data-feather="check-circle" class="h-5 w-5 text-green-500"></i>'
                        }
                    </div>
                    <div class="flex-1">
                        <h5 class="mb-1 font-medium leading-none tracking-tight ${
                            variant === 'error' ? 'text-red-900' : 'text-green-900'
                        }">
                            ${variant === 'error' ? 'Error' : 'Success'}
                        </h5>
                        <p class="text-sm ${
                            variant === 'error' ? 'text-red-700' : 'text-green-700'
                        }">${message}</p>
                    </div>
                    <button class="${
                        variant === 'error' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'
                    }" onclick="this.closest('.fixed').remove()">
                        <i data-feather="x" class="h-4 w-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforeend', alertHTML);
    feather.replace();
    
    setTimeout(() => {
        const alerts = alertContainer.children;
        if (alerts.length > 0) {
            alerts[0].remove();
        }
    }, 5000);
}
const previewHandlers = {
    pdf: async (url) => {
        const container = document.getElementById('preview-container');
        const spinner = document.getElementById('spinner'); // Get the spinner element
        spinner.style.display = 'block'; // Show the loader

        container.innerHTML = `
            <div class="relative w-full h-full">
                <div class="absolute top-4 right-4 flex items-center gap-2 bg-white/90 p-2 rounded-lg shadow z-10">
                    <button class="zoom-out p-1 hover:bg-gray-100 rounded" title="Zoom Out">
                        <i data-feather="minus-circle" class="w-5 h-5"></i>
                    </button>
                    <span class="zoom-level min-w-[3rem] text-center">100%</span>
                    <button class="zoom-in p-1 hover:bg-gray-100 rounded" title="Zoom In">
                        <i data-feather="plus-circle" class="w-5 h-5"></i>
                    </button>
                    <button class="zoom-fit p-1 hover:bg-gray-100 rounded" title="Fit to Screen">
                        <i data-feather="maximize" class="w-5 h-5"></i>
                    </button>
                </div>
                <div id="pdf-images" class="w-full h-full overflow-auto"></div>
            </div>`;

        const pdf = await pdfjsLib.getDocument(url).promise;
        const pdfImagesContainer = document.getElementById('pdf-images');

        const canvases = []; // Array to store all canvases (pages)

        // Set a higher scale factor for HD rendering
        const HD_SCALE = 2;  // Adjust this scale factor for higher resolution

        // Loop through each page of the PDF and render it as an HD image
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: HD_SCALE }); // Higher scale for HD

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Set canvas size based on the viewport's dimensions
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render the PDF page to the canvas at high resolution
            await page.render({ canvasContext: context, viewport: viewport }).promise;

            // Append each canvas (image) to the container
            pdfImagesContainer.appendChild(canvas);
            canvases.push(canvas); // Save canvas for future zoom adjustments
        }

        // Hide the loader once rendering is complete
        spinner.style.display = 'none'; 

        // Initialize zoom controls and fit to view
        initializeZoomControls(canvases); // Pass the canvases to zoom controls
        
        // Fit to the container after rendering
        fitToContainer(canvases, container);
    },

    image: async (url) => { /* Existing image handler */ },
    text: async (url) => { /* Existing text handler */ }
};

// Zoom function updated to fit canvases to the container
function initializeZoomControls(canvases) {
    const container = document.getElementById('preview-container');
    const zoomInBtn = container.querySelector('.zoom-in');
    const zoomOutBtn = container.querySelector('.zoom-out');
    const zoomFitBtn = container.querySelector('.zoom-fit');
    const zoomLevel = container.querySelector('.zoom-level');
    
    let currentZoom = 100;
    const minZoom = 25;
    const maxZoom = 400;
    const zoomStep = 25;

    const updateZoom = (newZoom) => {
        currentZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
        zoomLevel.textContent = `${currentZoom}%`;

        canvases.forEach(canvas => {
            const scaleFactor = currentZoom / 100;
            canvas.style.transform = `scale(${scaleFactor})`;
            canvas.style.transformOrigin = 'top left';
        });
    };

    // Function to fit canvases to the container
    const fitToContainer = (canvases, container) => {
        const containerRect = container.getBoundingClientRect();

        canvases.forEach(canvas => {
            const canvasRect = canvas.getBoundingClientRect();
            const widthRatio = containerRect.width / canvasRect.width;
            const heightRatio = containerRect.height / canvasRect.height;
            const fitRatio = Math.min(widthRatio, heightRatio) * 100;

            updateZoom(Math.floor(fitRatio));
        });
    };

    // Initialize zoom controls
    zoomInBtn.addEventListener('click', () => updateZoom(currentZoom + zoomStep));
    zoomOutBtn.addEventListener('click', () => updateZoom(currentZoom - zoomStep));
    
    // Fit to screen functionality (default)
    zoomFitBtn.addEventListener('click', () => fitToContainer(canvases, container));
    
    // Automatically fit to screen after rendering all pages
    fitToContainer(canvases, container);
    
    // Initialize Feather icons for the buttons
    feather.replace();
}


// Rest of the code remains the same...

// Function to determine file type from URL
function getFileType(url) {
    const extension = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return 'pdf';
    if (['docx'].includes(extension)) return 'docx';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (['txt', 'csv', 'log'].includes(extension)) return 'text';
    return 'unknown';
}

// Function to create resource card
function createResourceCard(resource) {
    return `
        <div class="resource-card bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-lg">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-gray-900">${resource.title}</h3>
                <i data-feather="${resource.icon}" class="text-gray-500"></i>
            </div>
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        ${resource.category}
                    </span>
                    <span class="text-sm text-gray-500">${resource.size}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500"><b>Dated: ${resource.date}</b></span>
                    <div class="flex gap-2">
                        <button class="preview-btn flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                data-title="${resource.title}" 
                                data-code="${resource.downloadCode}">
                            <i data-feather="eye" class="w-4 h-4"></i>
                            Preview
                        </button>
                    
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to download selected files
function downloadSelectedFiles() {
    const selectedCheckboxes = document.querySelectorAll('.url-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        showAlert("Please select at least one file to download.", "error");
        return;
    }

    const selectedUrls = Array.from(selectedCheckboxes).map(checkbox => 
        checkbox.getAttribute('data-url'));

    selectedUrls.forEach(url => {
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop();
        link.click();
    });

    document.getElementById('preview-modal').style.display = 'none';
    showAlert(`Starting download for ${selectedUrls.length} file(s)...`, "success");
}







// Function to show preview modal
async function showPreviewModal(resource) {
    const modal = document.getElementById('preview-modal');
    const container = document.getElementById('preview-container');
    const fileList = document.getElementById('preview-file-list');
    const title = document.getElementById('preview-title');
    const loading = document.getElementById('preview-loading');

    container.innerHTML = '';
    fileList.innerHTML = '';
    title.textContent = resource.title;
    
    modal.style.display = 'flex';
    loading.classList.remove('hidden');

    // Add select all checkbox
    const selectAllContainer = document.createElement('div');
    selectAllContainer.className = 'flex items-center gap-2 p-2 bg-gray-50 border-b';
    selectAllContainer.innerHTML = `
        <input type="checkbox" id="select-all-files" 
               class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
        <label for="select-all-files" class="text-gray-700 font-medium">Select All Files</label>
    `;
    fileList.appendChild(selectAllContainer);

    // Add select all functionality
    const selectAllCheckbox = document.getElementById('select-all-files');
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.url-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });

    // Create file list
    resource.urls.forEach((url, index) => {
        const fileName = url.split('/').pop();
        const fileType = getFileType(url);
        
        const listItem = document.createElement('div');
        listItem.className = 'flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded';
        listItem.innerHTML = `
            <input type="checkbox" class="url-checkbox rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                   data-url="${url}">
            <span class="text-gray-700">${fileName}</span>
        `;
        
        listItem.addEventListener('click', async (e) => {
            if (e.target.type !== 'checkbox') {
                try {
                    loading.classList.remove('hidden');
                    const handler = previewHandlers[fileType];
                    if (handler) {
                        await handler(url);
                    } else {
                        container.innerHTML = `
                            <div class="flex items-center justify-center h-full text-gray-500">
                                Preview not available for this file type
                            </div>`;
                    }
                } finally {
                    loading.classList.add('hidden');
                }
            }
        });
        
        fileList.appendChild(listItem);
    });

    // Add download selected button
    const downloadButtonContainer = document.createElement('div');
    downloadButtonContainer.className = 'flex justify-end p-2 border-t mt-2';
    downloadButtonContainer.innerHTML = `
        <button id="download-selected" 
                class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Download Selected
        </button>
        
        
        
    `;
    fileList.appendChild(downloadButtonContainer);

    // Add download selected functionality
    document.getElementById('download-selected').addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('.url-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            showAlert('Please select at least one file to download', 'warning');
            return;
        }
        
        selectedCheckboxes.forEach(checkbox => {
            const url = checkbox.getAttribute('data-url');
            const link = document.createElement('a');
            link.href = url;
            link.download = url.split('/').pop();
            link.click();
        });
        
        showAlert(`Starting download of ${selectedCheckboxes.length} file(s)...`, "success");
    });

    // Preview first file by default
    if (resource.urls.length > 0) {
        const firstFileType = getFileType(resource.urls[0]);
        const handler = previewHandlers[firstFileType];
        if (handler) {
            await handler(resource.urls[0]);
        }
    }

    loading.classList.add('hidden');
}

// Function to render resources
function renderResources(resources) {
    const grid = document.getElementById('resources-grid');
    grid.innerHTML = resources.map(resource => createResourceCard(resource)).join('');
    feather.replace();

    // Attach preview button handlers
    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const title = btn.getAttribute('data-title');
            const selectedResource = resources.find(resource => resource.title === title);
            if (selectedResource) {
                await showPreviewModal(selectedResource);
            }
        });
    });

    // Attach direct download button handlers
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.getAttribute('data-title');
            const selectedResource = resources.find(resource => resource.title === title);
            if (selectedResource) {
                selectedResource.urls.forEach(url => {
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = url.split('/').pop();
                    link.click();
                });
                showAlert(`Starting download...`, "success");
            }
        });
    });
}





// Initialize search functionality
const searchInput = document.getElementById('search');
const spinner = document.getElementById('spinner');

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    spinner.style.display = 'block';

    if (searchTerm === '') {
        location.reload();
    } else {
        const filteredResources = resources.filter(resource => 
            resource.title.toLowerCase().includes(searchTerm) ||
            resource.category.toLowerCase().includes(searchTerm)
        );

        renderResources(filteredResources);
        spinner.style.display = 'none';

        if (filteredResources.length === 0) {
            showAlert("No matching data found.", "error");
            setTimeout(() => {
                searchInput.value = '';
                location.reload();
            }, 300);
        } else {
            showAlert(`Found ${filteredResources.length} matching result(s).`, "success");
        }
    }
});

// Initialize category filter functionality
document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        document.querySelectorAll('.category-pill').forEach(p => 
            p.classList.remove('active', 'bg-indigo-600', 'text-white'));
        
        pill.classList.add('active', 'bg-indigo-600', 'text-white');

        const category = pill.textContent.trim().toLowerCase();
        const filteredResources = category === 'all' 
            ? resources 
            : resources.filter(resource => resource.type === category);

        renderResources(filteredResources);
        
        if (filteredResources.length === 0) {
            showAlert("No matching data found.", "error");
        } else {
            showAlert(`Found ${filteredResources.length} matching result(s).`, "success");
        }
    });
});

// Handle escape key for modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const previewModal = document.getElementById('preview-modal');
        if (previewModal.style.display === 'flex') {
            previewModal.style.display = 'none';
        }
    }
});

// Add HTML structure for modal and spinner
function initializeUIComponents() {
    // Add preview modal HTML
    const previewModalHTML = `
        <div id="preview-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[90vh] flex flex-col">
                <div class="flex items-center justify-between p-4 border-b">
                    <h3 class="text-xl font-semibold text-gray-900" id="preview-title">Document Preview</h3>
                    <button class="preview-close-btn text-gray-500 hover:text-gray-700">
                        <i data-feather="x" class="h-6 w-6"></i>
                    </button>
                </div>
                <div class="flex-1 overflow-hidden p-4 flex"> 
                    <div class="flex-1 min-h-0 flex flex-col">
                        <div id="preview-container" class="flex-1 overflow-auto"></div>
                        <div class="flex justify-between items-center mt-4 pt-4 border-t">
                            <div id="preview-loading" class="hidden">
                                <div id="spinner" class="spinner""></div>
                            </div>
                         <!--  <h4 class="font-medium mb-2">Available Files</h4> -->

                            <div class="flex gap-4">
                                <!-- <button class="preview-close-btn px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg"> 
                                    Cancel
                                </button>
                                <button onclick="downloadSelectedFiles()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    Download Selected oooo
                                 </button> -->
                            </div>
                        </div>
                    </div>
                   
                        <div id="preview-file-list" class="flex-1 overflow-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add spinner HTML
    const spinnerHTML = `
        <div id="spinner" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    `;

    // Insert all HTML components
    document.body.insertAdjacentHTML('beforeend', previewModalHTML);
    document.body.insertAdjacentHTML('beforeend', spinnerHTML);
}

// Function to initialize search input focus
function initializeSearchFocus() {
    const searchInput = document.getElementById('search');
    
    window.addEventListener('load', () => {
        searchInput.focus();
        searchInput.select();
    });

    searchInput.addEventListener('focus', (e) => {
        e.target.select();
    });
}

// Function to initialize modal
function initializeModal() {
    const previewModal = document.getElementById('preview-modal');

    // Close modal when clicking outside
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            previewModal.style.display = 'none';
        }
    });

    // Initialize close buttons
    document.querySelectorAll('.preview-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });
    });
}

// Function to initialize the entire application
function initializeApp() {
    // Initialize UI components
    initializeUIComponents();
    
    // Initialize search functionality
    initializeSearchFocus();
    
    // Initialize modal
    initializeModal();
    
    // Render initial resources
    renderResources(resources);
    
    // Initialize Feather icons
    feather.replace();

    // Make downloadSelectedFiles available globally
    window.downloadSelectedFiles = downloadSelectedFiles;
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Export necessary functions for testing or external use
export {
    showAlert,
    renderResources,
    showPreviewModal,
    getFileType,
    createResourceCard,
    downloadSelectedFiles
};