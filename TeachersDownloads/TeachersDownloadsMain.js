// Import grade data from separate configuration files
import Reports from './Reports.js';
import Pastpapers from './Pastpapers.js';
import Circulars from './Circulars.js';
import calendar from './calendar.js';
import SBAPracticalsTests from './SBAPracticalsTests.js';
import SBAWrittenTests from './SBAWrittenTests.js';

// Initialize Feather Icons
feather.replace();

// Combine all grades into a single resources array
const resources = [...Reports,...Pastpapers,...Circulars,...calendar,...SBAPracticalsTests,...SBAWrittenTests];

// Create alert container
const alertContainer = document.createElement('div');
alertContainer.style.position = 'fixed';
alertContainer.style.top = '1rem';
alertContainer.style.right = '1rem';
alertContainer.style.zIndex = '50';
document.body.appendChild(alertContainer);

// Function to show alert
function showAlert(message, variant = 'error') {
    const alertHTML = `
        <div class="fixed top-4 right-4 flex w-[360px] animate-in fade-in-0 zoom-in-95">
            <div class="relative w-full rounded-lg border ${variant === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'} p-4 shadow-lg">
                <div class="flex items-start gap-4">
                    <div class="mt-1">
                        ${variant === 'error' ? 
                            '<i data-feather="x-circle" class="h-5 w-5 text-red-500"></i>' :
                            '<i data-feather="check-circle" class="h-5 w-5 text-green-500"></i>'
                        }
                    </div>
                    <div class="flex-1">
                        <h5 class="mb-1 font-medium leading-none tracking-tight ${variant === 'error' ? 'text-red-900' : 'text-green-900'}">
                            ${variant === 'error' ? 'Error' : 'Success'}
                        </h5>
                        <p class="text-sm ${variant === 'error' ? 'text-red-700' : 'text-green-700'}">${message}</p>
                    </div>
                    <button class="${variant === 'error' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}" onclick="this.closest('.fixed').remove()">
                        <i data-feather="x" class="h-4 w-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforeend', alertHTML);
    feather.replace();
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        const alerts = alertContainer.children;
        if (alerts.length > 0) {
            alerts[0].remove();
        }
    }, 5000);
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
                    <span class="text-sm text-gray-500"><b> Dated: ${resource.date}</b></span>

                    <button class="download-btn flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200" 
                            data-title="${resource.title}" 
                            data-code="${resource.downloadCode}">
                        <i data-feather="download" class="w-4 h-4"></i>
                        Download
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Function to render resources
function renderResources(resources) {
    const grid = document.getElementById('resources-grid');
    grid.innerHTML = resources.map(resource => createResourceCard(resource)).join('');
    feather.replace();

    

const searchInput = document.getElementById('search');
const spinner = document.getElementById('spinner');

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    // Show the spinner while typing
    spinner.style.display = 'block';

    if (searchTerm === '') {
        // Reload the page if the search input is cleared
        location.reload();
    } else {
        const filteredResources = resources.filter(resource => 
            resource.title.toLowerCase().includes(searchTerm) ||
            resource.category.toLowerCase().includes(searchTerm)
        );
        renderResources(filteredResources);

        // Hide the spinner after processing
        spinner.style.display = 'block';

        // Show SweetAlert if no matching data is found
        if (filteredResources.length === 0) {
           

            // Clear the search input and reload after showing the SweetAlert
            setTimeout(() => {
                searchInput.value = ''; // Clear search input
                location.reload(); // Reload the page
            }, 300); // Wait for 2 seconds before reloading
        }
    }
});

// Automatically focus and select all text in the search input after page reload
window.addEventListener('load', () => {
    searchInput.focus();
    searchInput.select(); // Select all text in the search input
});

// Select all text in the search bar whenever it becomes active (focused)
searchInput.addEventListener('focus', (e) => {
    e.target.select(); // Select all text in the search input
});



    // Re-attach download button functionality
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const title = btn.getAttribute('data-title');
            


          

            // Find selected resource by title
            const selectedResource = resources.find(resource => resource.title === title);

            // Populate modal with URLs
            const modalList = document.getElementById('url-list');
            modalList.innerHTML = '';
            

            // Add "Select All" checkbox
            const selectAllItem = document.createElement('li');
            selectAllItem.innerHTML = `
                <label class="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" id="select-all" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                    <span class="text-gray-700">Select All</span>
                </label>
            `;
            modalList.appendChild(selectAllItem);

            

            selectedResource.urls.forEach(url => {
                const listItem = document.createElement('li');
                listItem.className = 'url-item';
                listItem.innerHTML = `
                    <label class="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <input type="checkbox" class="url-checkbox rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                               data-url="${url}">
                        <span class="text-gray-700">Download ${url.split('/').pop()}</span>
                    </label>
                `;
                modalList.appendChild(listItem);
            });

            // Show modal
            const modal = document.getElementById('download-modal');
            modal.style.display = 'flex';

            // Handle download for selected files
            const downloadSelectedBtn = modal.querySelector('.download-selected-btn');
            downloadSelectedBtn.onclick = async () => {
                const selectedCheckboxes = modal.querySelectorAll('.url-checkbox:checked');

                if (selectedCheckboxes.length === 0) {
                    showAlert("Please select at least one file to download.", "error");
                    return;
                }

                const downloadUrls = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-url'));

                for (const url of downloadUrls) {
                    const filename = url.split('/').pop();
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                }

                modal.style.display = 'none';
                showAlert(`Starting download for ${downloadUrls.length} file(s)...`, "success");
            };

            // Cancel button
            const cancelBtn = modal.querySelector('.cancel-btn');
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
            };

            // "Select All" functionality
            const selectAllCheckbox = modal.querySelector('#select-all');
            selectAllCheckbox.onclick = () => {
                const checkboxes = modal.querySelectorAll('.url-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = selectAllCheckbox.checked;
                });
            };

             // Show the modal and add click event to close it when clicking outside
             modal.addEventListener('click', (event) => {
                // Check if the click is on the modal backdrop
                if (event.target === modal) {
                    modal.style.display = 'none'; // Close the modal
                }
            });

            
        });
    });
}

// Render all resources initially
renderResources(resources);
// Category filter functionality
document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        // Remove active class from all pills
        document.querySelectorAll('.category-pill').forEach(p => 
            p.classList.remove('active', 'bg-indigo-600', 'text-white'));
        
        // Add active class to clicked pill
        pill.classList.add('active', 'bg-indigo-600', 'text-white');

        const category = pill.textContent.trim().toLowerCase();
        let filteredResources = resources;

        if (category !== 'all') {
            filteredResources = resources.filter(resource => {
                
                if (category === 'reports') {
                    return resource.type === 'reports';
                } 
                else if (category === 'sba') {
                    return resource.type === 'sba';
                } 

                else if (category === 'practicals') {
                    return resource.type === 'practicals';
                }
                
                else if (category === 'pastpapers') {
                    return resource.type === 'pastpapers';
                }
                
                
                else if (category === 'calendar') {
                    return resource.type === 'calendar';
                }
                
                
                else if (category === 'circulars') {
                    return resource.type === 'circulars';
                }
                
                
               
               
                return true;
            });
        }

        renderResources(filteredResources);
        
           // Assuming filteredResources is your array of matching data
if (filteredResources.length === 0) {
    showAlert("No matching data found.", "error");
} else {
    // Show alert if matching data is found
    showAlert(`Found ${filteredResources.length} matching result(s).`, "success");
}

    });
});


// Search functionality
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredResources = resources.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm) ||
        resource.category.toLowerCase().includes(searchTerm)
    );
    
    renderResources(filteredResources);

   // Assuming filteredResources is your array of matching data
if (filteredResources.length === 0) {
    showAlert("No matching data found.", "error");
} else {
    // Show alert if matching data is found
    showAlert(`Found ${filteredResources.length} matching result(s).`, "success");
}

});



