document.addEventListener('DOMContentLoaded', () => {
  const clubListContainer = document.querySelector('.club-list');
  if (!clubListContainer) return;

  const createClubBtn = document.querySelector('.CreateClub-Button');
  const modal = document.getElementById('createClubModal');
  const formContainer = document.querySelector('.form-container');
  const formTitle = document.getElementById('form-title');
  const closeFormBtn = document.querySelector('.close-form');
  const mainContent = document.querySelector('main.main-content');
  const joinButton = document.querySelector('.Join-Button');

  // Load clubs from DB
  async function loadClubs() {
    try {
      const res = await fetch('/Admin/Php/get_clubs.php');
      const data = await res.json();
      clubListContainer.innerHTML = '';

      if (data.success && data.clubs.length > 0) {
        data.clubs.forEach(club => addClubButton(club));
      } else {
        clubListContainer.innerHTML = '<p>No clubs found.</p>';
      }
    } catch (err) {
      console.error('Error loading clubs:', err);
      clubListContainer.innerHTML = '<p>Error loading clubs.</p>';
    }
  }

  // Add club button to the list
  function addClubButton(club) {
    const clubContainer = document.createElement('div');
    clubContainer.classList.add('club-item');

    const btn = document.createElement('button');
    btn.classList.add('club-button');
    btn.textContent = club.club_name;

    const detailsBtn = document.createElement('button');
    detailsBtn.classList.add('details-btn');
    detailsBtn.textContent = 'View Details';
    detailsBtn.onclick = () => {
      window.location.href = `http://localhost/ACESS-2.0/Teacher/ACESS_Teacher_Club_Details.html?id=${club.id}`;
    };

    if (formContainer && formTitle && mainContent) {
      btn.addEventListener('click', () => {
        formTitle.textContent = `${club.club_name} Information`;
        formContainer.classList.add('active');
        mainContent.classList.add('form-active');
        formContainer.setAttribute('aria-hidden', 'false');

        const advisorDiv = formContainer.querySelector('label[for="Advisor"] + .club-list');
        if (advisorDiv) {
          advisorDiv.innerHTML = `<button class="club-button">${club.adviser || 'No Adviser Assigned'}</button>`;
        }

        // Update Join button dynamically
        if (joinButton) {
          joinButton.textContent = `Join ${club.club_name}`;
          joinButton.dataset.clubId = club.club_id;
        }
      });
    }

    clubContainer.appendChild(btn);
    clubContainer.appendChild(detailsBtn);
    clubListContainer.appendChild(clubContainer);
  }

  // Join Club Handler
  if (joinButton) {
    joinButton.addEventListener('click', async () => {
      const clubId = joinButton.dataset.clubId;
      const userId = localStorage.getItem('user_id');

      if (!userId) {
        alert('Please log in first.');
        return;
      }

      if (!clubId) {
        alert('Please select a club first.');
        return;
      }

      try {
        const res = await fetch('../User/Php/join_club.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ club_id: clubId, user_id: userId }),
        });

        const data = await res.json();
        alert(data.message);

        if (data.success) {
          joinButton.disabled = true;
          joinButton.textContent = 'Joined ✅';
        }
      } catch (err) {
        console.error('Error joining club:', err);
        alert('Error joining club.');
      }
    });
  }

  // Close panel
  if (closeFormBtn && formContainer && mainContent) {
    closeFormBtn.addEventListener('click', () => {
      formContainer.classList.remove('active');
      mainContent.classList.remove('form-active');
      formContainer.setAttribute('aria-hidden', 'true');
    });
  }

  // Initial load
  loadClubs();
});

// Enhanced Club Loading Script for Different User Roles
// Add this script to User, Student Council, and Teacher club pages

document.addEventListener('DOMContentLoaded', async () => {
  const clubListContainer = document.getElementById('club-lists');
  const formContainer = document.querySelector('.form-container');
  const formTitle = document.getElementById('form-title');
  const closeFormBtn = document.querySelector('.close-form');
  const mainContent = document.querySelector('main.main-content');

  // Determine user role
  let userRole = 'user'; // default
  try {
    const res = await fetch('/Admin/Php/get_logged_user.php');
    const data = await res.json();
    userRole = data.role ? data.role.toLowerCase() : 'user';
  } catch (err) {
    console.error('Could not determine user role:', err);
  }

  // Load user's clubs
  const loadUserClubs = async () => {
    try {
      const response = await fetch('/Admin/Php/get_user_clubs.php');
      const data = await response.json();
      if (data.success) {
        return data.clubs;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      return [];
    }
  };

  // Load all clubs
  const loadClubs = async () => {
    try {
      const results = await fetch('/Admin/Php/get_clubs.php');
      const clubs = (await results.json()).clubs;
      const userClubs = await loadUserClubs();

      const userClubIds = new Set(userClubs.map(club => club.club_id.toString()));
      const hasJoinedAnyClub = userClubs.length > 0;

      clubListContainer.innerHTML = '';

      if (!clubs || clubs.length === 0) {
        clubListContainer.innerHTML = '<p style="color:#999;">No clubs available.</p>';
        return;
      }

      clubs.forEach(club => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.padding = '12px';
        li.style.marginBottom = '10px';
        li.style.backgroundColor = '#2a2a2a';
        li.style.borderRadius = '8px';
        li.style.cursor = 'pointer';
        li.style.transition = 'all 0.3s ease';

        // Hover effect
        li.addEventListener('mouseenter', () => {
          li.style.backgroundColor = '#333';
          li.style.transform = 'translateY(-2px)';
        });
        li.addEventListener('mouseleave', () => {
          li.style.backgroundColor = '#2a2a2a';
          li.style.transform = 'translateY(0)';
        });

        const nameSpan = document.createElement('span');
        nameSpan.textContent = club.club_name;
        nameSpan.style.flex = '1';
        nameSpan.style.color = '#f1f1f1';
        nameSpan.style.fontWeight = '500';

        // Click on name to view details (for User and Student Council)
        if (userRole === 'user' || userRole === 'studentcouncil') {
          nameSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            showClubDetails(club);
          });
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '8px';
        buttonContainer.style.alignItems = 'center';

        // Add appropriate buttons based on role
        if (userRole === 'teacher') {
          // Teachers get View Details button
          const detailsBtn = document.createElement('button');
          detailsBtn.className = 'details-btn';
          detailsBtn.textContent = 'View Details';
          detailsBtn.style.padding = '6px 14px';
          detailsBtn.style.backgroundColor = '#f8f9fa';
          detailsBtn.style.color = '#000';
          detailsBtn.style.border = 'none';
          detailsBtn.style.borderRadius = '6px';
          detailsBtn.style.fontWeight = '600';
          detailsBtn.style.cursor = 'pointer';
          detailsBtn.style.transition = 'all 0.3s ease';

          detailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `ACESS_Teacher_Club_Details.html?id=${club.id}`;
          });

          buttonContainer.appendChild(detailsBtn);

        } else if (userRole === 'user' || userRole === 'studentcouncil') {
          // Users and Student Council get Join/Cancel button
          const isMember = userClubIds.has(club.id.toString());
          const joinBtn = document.createElement('button');
          joinBtn.textContent = isMember ? 'Cancel' : 'Join';
          joinBtn.dataset.id = club.id;
          joinBtn.dataset.action = isMember ? 'cancel' : 'join';
          joinBtn.className = isMember ? 'club-view-btn cancel' : 'club-view-btn join';
          joinBtn.style.padding = '6px 14px';
          joinBtn.style.border = 'none';
          joinBtn.style.borderRadius = '20px';
          joinBtn.style.fontWeight = '600';
          joinBtn.style.cursor = 'pointer';
          joinBtn.style.transition = 'all 0.3s ease';
          joinBtn.style.minWidth = '80px';

          if (isMember) {
            joinBtn.style.backgroundColor = '#f44336';
            joinBtn.style.color = 'white';
          } else {
            joinBtn.style.backgroundColor = '#4CAF50';
            joinBtn.style.color = 'white';
          }

          // Disable join buttons if user has already joined a club
          if (!isMember && hasJoinedAnyClub) {
            joinBtn.disabled = true;
            joinBtn.title = 'You can only be a member of one club at a time';
            joinBtn.style.backgroundColor = 'gray';
            joinBtn.style.cursor = 'not-allowed';
            joinBtn.style.opacity = '0.6';
          }

          joinBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleJoinCancel(club.id, joinBtn.dataset.action);
          });

          buttonContainer.appendChild(joinBtn);
        }

        li.appendChild(nameSpan);
        li.appendChild(buttonContainer);
        clubListContainer.appendChild(li);
      });
    } catch (err) {
      console.error('Error loading clubs:', err);
      clubListContainer.innerHTML = '<p style="color:red;">Error loading clubs.</p>';
    }
  };

  // Show club details in side panel
  function showClubDetails(club) {
    if (!formContainer || !formTitle || !mainContent) return;

    formTitle.textContent = club.club_name;

    // Update club description
    const descElement = formContainer.querySelector('#club-description');
    if (descElement) {
      descElement.textContent = club.description || 'No description available';
    }

    // Update advisor
    const advisorElement = formContainer.querySelector('#club-advisor');
    if (advisorElement) {
      advisorElement.textContent = club.adviser || 'No adviser assigned';
    }

    // Update president
    const presidentElement = formContainer.querySelector('#club-president');
    if (presidentElement) {
      presidentElement.textContent = 'Not assigned';
    }

    // Update vice president
    const vpElement = formContainer.querySelector('#club-vp');
    if (vpElement) {
      vpElement.textContent = 'Not assigned';
    }

    // Update members list
    const membersElement = formContainer.querySelector('#club-members-list');
    if (membersElement) {
      membersElement.innerHTML = '<p>Loading members...</p>';
    }

    formContainer.classList.add('active');
    mainContent.classList.add('form-active');
    formContainer.setAttribute('aria-hidden', 'false');
  }

  // Handle join/cancel club
  async function handleJoinCancel(clubId, action) {
    const isCancel = action === 'cancel';

    if (confirm(isCancel ? 'Are you sure you want to leave this club?' : 'Do you want to join this club?')) {
      try {
        const response = await fetch('/Admin/Php/join_club.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            club_id: clubId,
            action: action
          })
        });

        const data = await response.json();
        if (data.success) {
          alert(isCancel ? 'Successfully left the club!' : 'Successfully joined the club!');
          window.location.reload();
        } else {
          alert(`Failed to ${isCancel ? 'leave' : 'join'} the club: ` + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to process request');
      }
    }
  }

  // Close form panel
  if (closeFormBtn && formContainer && mainContent) {
    closeFormBtn.addEventListener('click', () => {
      formContainer.classList.remove('active');
      mainContent.classList.remove('form-active');
      formContainer.setAttribute('aria-hidden', 'true');
    });
  }

  // Initial load
  loadClubs();
});