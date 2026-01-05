document.addEventListener('DOMContentLoaded', () => {
  const clubListContainer = document.getElementById('club-list');
  const formContainer = document.querySelector('.form-container');
  const formTitle = document.getElementById('form-title');
  const mainContent = document.querySelector('main.main-content');
  const closeFormBtn = document.querySelector('.close-form');

  // Fetch clubs from backend
  fetch('/Admin/Php/get_clubs.php')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.clubs.length > 0) {
        clubListContainer.innerHTML = '';

        data.clubs.forEach(club => {
          const button = document.createElement('button');
          button.className = 'club-button';
          button.innerHTML = `
            <img src="../Images/icons/club.svg" alt="Club Icon"> 
            ${club.club_name}
          `;

          // Click event to open side panel
          button.addEventListener('click', () => { 
            formTitle.textContent = `${club.club_name}`;
            formContainer.classList.add('active');
            mainContent.classList.add('form-active');
            formContainer.setAttribute('aria-hidden', 'false');

            // Fill the details dynamically
            const advisorDiv = formContainer.querySelector('label[for="Advisor"] + .club-list');
            advisorDiv.innerHTML = `<button class="club-button">${club.adviser}</button>`;

            document.querySelector('.Join-Button').textContent = `Join ${club.club_name}`;
          });

          clubListContainer.appendChild(button);
        });
      } else {
        clubListContainer.innerHTML = '<p>No clubs found.</p>';
      }
    })
    .catch(err => {
      console.error(err);
      clubListContainer.innerHTML = '<p>Error loading clubs.</p>';
    });

  // Close form handler
  closeFormBtn.addEventListener('click', () => {
    formContainer.classList.remove('active');
    mainContent.classList.remove('form-active');
    formContainer.setAttribute('aria-hidden', 'true');
  });
});
