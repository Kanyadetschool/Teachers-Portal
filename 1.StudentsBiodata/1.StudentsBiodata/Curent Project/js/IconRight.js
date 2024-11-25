const icons = document.querySelectorAll('.icon');

    icons.forEach(icon => {
      const name = icon.dataset.name;
      const nameElement = icon.nextElementSibling;

      icon.addEventListener('mouseenter', () => {
        nameElement.textContent = name;
      });

      icon.addEventListener('mouseleave', () => {
        nameElement.textContent = '';
      });
    });