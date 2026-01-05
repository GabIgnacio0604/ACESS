document.addEventListener('DOMContentLoaded', () => {
      const clubButtons = document.querySelectorAll('.club-button');
      const formContainer = document.querySelector('.form-container');
      const formTitle = document.getElementById('form-title');
      const closeFormBtn = document.querySelector('.close-form');
      const mainContent = document.querySelector('main.main-content');

      clubButtons.forEach(button => {
        button.addEventListener('click', () => {
          const clubName = button.textContent.trim();
          formTitle.textContent = `${clubName} Form`;
          formContainer.classList.add('active');
          mainContent.classList.add('form-active');
          formContainer.setAttribute('aria-hidden', 'false');
        });
      });

      closeFormBtn.addEventListener('click', () => {
        formContainer.classList.remove('active');
        mainContent.classList.remove('form-active');
        formContainer.setAttribute('aria-hidden', 'true');
      });
    });