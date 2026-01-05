// Universal function to load club details including roles
async function loadClubDetailsWithRoles(clubId) {
  try {
    const response = await fetch(`../../Admin/Php/get_club_roles.php?club_id=${clubId}`);
    const data = await response.json();

    if (!data.success) {
      console.error('Failed to load club details:', data.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error loading club details:', error);
    return null;
  }
}

// Display club details in the side panel
function displayClubDetails(clubData, formContainer) {
  if (!clubData || !formContainer) return;

  const formTitle = document.getElementById('form-title');
  const clubDescription = document.getElementById('club-description');
  const clubAdvisor = document.getElementById('club-advisor');
  const clubPresident = document.getElementById('club-president');
  const clubVP = document.getElementById('club-vp');
  const membersList = document.getElementById('club-members-list');

  if (formTitle) formTitle.textContent = clubData.club.club_name;
  if (clubDescription) clubDescription.textContent = clubData.club.description || 'No description available';
  if (clubAdvisor) clubAdvisor.textContent = clubData.club.adviser || 'No adviser assigned';
  if (clubPresident) clubPresident.textContent = clubData.president;
  if (clubVP) clubVP.textContent = clubData.vice_president;

  if (membersList) {
    membersList.innerHTML = '';
    
    if (clubData.members.length === 0) {
      membersList.innerHTML = '<p style="color:#999;">No members in this club.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none';
    ul.style.padding = '0';

    clubData.members.forEach(member => {
      const li = document.createElement('li');
      li.style.padding = '8px 0';
      li.style.borderBottom = '1px solid #444';
      
      // Add role badge if not regular member
      let roleBadge = '';
      if (member.role === 'president') {
        roleBadge = '<span style="background:#ffd54f;color:#000;padding:2px 8px;border-radius:4px;font-size:0.8em;margin-left:8px;">President</span>';
      } else if (member.role === 'vice_president') {
        roleBadge = '<span style="background:#ffa500;color:#000;padding:2px 8px;border-radius:4px;font-size:0.8em;margin-left:8px;">Vice President</span>';
      } else if (member.role === 'advisor') {
        roleBadge = '<span style="background:#4CAF50;color:#fff;padding:2px 8px;border-radius:4px;font-size:0.8em;margin-left:8px;">Advisor</span>';
      }
      
      li.innerHTML = `${member.fullname}${roleBadge}`;
      ul.appendChild(li);
    });

    membersList.appendChild(ul);
  }
}

// Show club details panel
function showClubDetailsPanel(clubData) {
  const formContainer = document.querySelector('.form-container');
  const mainContent = document.querySelector('main.main-content');

  if (!formContainer || !mainContent) {
    console.error('Required DOM elements not found');
    return;
  }

  displayClubDetails(clubData, formContainer);

  formContainer.classList.add('active');
  mainContent.classList.add('form-active');
  formContainer.setAttribute('aria-hidden', 'false');
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadClubDetailsWithRoles,
    displayClubDetails,
    showClubDetailsPanel
  };
}