$(document).ready(function() {
  $('.ui.dropdown').dropdown();

  function attachEventListeners() {
      const dropdownItems = document.querySelectorAll('.ui.dropdown .item');
      console.log('Attaching event listeners to items:', dropdownItems.length);

      dropdownItems.forEach(item => {
          item.addEventListener('click', function () {
              const value = item.getAttribute('data-value');
              if (value) {
                  console.log('Item clicked with value:', value);
                  simulatePasteEvent(value);
              }
          });
      });
  }

  function simulatePasteEvent(value) {
      const inputs = [document.getElementById('searchInput'), document.getElementById('searchInput2')];
      inputs.forEach(input => {
          input.value = value;  // Set the value manually
          input.dispatchEvent(new Event('input', { bubbles: true }));  // Dispatch an input event
      });
  }

  attachEventListeners();

  function updateDropdownWithValue(value) {
      const dropdown = document.querySelector('.ui.dropdown');
      const dropdownText = dropdown.querySelector('.text');
      const dropdownItems = dropdown.querySelectorAll('.item');
      console.log('Updating dropdown with value:', value);

      dropdownItems.forEach(item => {
          const itemValue = item.getAttribute('data-value');
          if (itemValue === value) {
              dropdownText.innerText = item.textContent.trim();
          }
      });
  }

  document.getElementById('searchInput').addEventListener('input', function () {
      updateDropdownWithValue(this.value);
  });
  document.getElementById('searchInput2').addEventListener('input', function () {
      updateDropdownWithValue(this.value);
  });

  $('.ui.dropdown').on('show', function() {
      attachEventListeners();
  });
});