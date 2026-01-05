document.addEventListener('DOMContentLoaded', () => {
  const clubListContainer = document.querySelector('.club-list');
  const createClubBtn = document.querySelector('.CreateClub-Button');
  const modal = document.getElementById('createClubModal');
  const confirmBtn = modal.querySelector('.confirm');
  const cancelBtn = modal.querySelector('.cancel');
  const formContainer = document.querySelector('.form-container');
  const formTitle = document.getElementById('form-title');
  const closeFormBtn = document.querySelector('.close-form');
  const mainContent = document.querySelector('main.main-content');
  const joinButton = document.querySelector('.Join-Button');

  // Load clubs from DB
  async function loadClubs() {
    try {
      const res = await fetch('./Admin/Php/get_clubs.php');
      const data = await res.json();
      clubListContainer.innerHTML = '';
      if (data.success) {
        data.clubs.forEach(club => addClubButton(club));
      }
    } catch (err) {
      console.error('Error loading clubs:', err);
    }
  }

  // Add club button to list
  function addClubButton(club) {
    const btn = document.createElement('button');
    btn.classList.add('club-button');
    btn.textContent = club.club_name;

    btn.addEventListener('click', () => {
      // Open the side form panel instead of alert
      formTitle.textContent = club.club_name + " Information";
      formContainer.classList.add('active');
      mainContent.classList.add('form-active');
      formContainer.setAttribute('aria-hidden', 'false');

      // Fill adviser name (if available)
      const advisorDiv = formContainer.querySelector('label[for="Advisor"] + .club-list');
      if (advisorDiv) {
        advisorDiv.innerHTML = `<button class="club-button">${club.adviser || 'No Adviser Assigned'}</button>`;
      } 

      // Set join button label
      joinButton.textContent = `Join ${club.club_name}`;
    });

    clubListContainer.appendChild(btn);
  }

  // Close panel
  closeFormBtn.addEventListener('click', () => {
    formContainer.classList.remove('active');
    mainContent.classList.remove('form-active');
    formContainer.setAttribute('aria-hidden', 'true');
  });

  // Modal open
  createClubBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  });

  // Modal cancel
  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  });

  // Modal confirm (create club)
  confirmBtn.addEventListener('click', async () => {
    const club_name = modal.querySelector('input[placeholder="Enter Club Name"]').value.trim();
    const adviser = modal.querySelector('select').value.trim();
    const group_chat = modal.querySelector('input[placeholder="Enter Group Chat Name"]').value.trim();

    if (!club_name || adviser === "Select Club Adviser") {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      const response = await fetch('/Admin/Php/create_club.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club_name,
          adviser,
          group_chat
        })
      });
      const result = await response.json();
      if (result.success) {
        alert("Club created successfully!");
        addClubButton({ club_name, adviser });
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.querySelector('input[placeholder="Enter Club Name"]').value = '';
        modal.querySelector('select').value = 'Select Club Adviser';
        modal.querySelector('input[placeholder="Enter Group Chat Name"]').value = '';
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create club. Check console for details.");
    }
  });

  // Click outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  loadClubs();
});
