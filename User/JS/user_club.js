document.addEventListener("DOMContentLoaded", async () => {
  const clubListContainer = document.getElementById('club-lists');
  const formContainer = document.querySelector('.form-container');
  const formTitle = document.getElementById('form-title');
  const closeFormBtn = document.querySelector('.close-form');
  const mainContent = document.querySelector('main.main-content');
  const nameElement = document.querySelector(".account-name");

  // Load user name
  try {
    const res = await fetch("/Admin/Php/get_logged_user.php");
    const data = await res.json();
    if (data.fullname) {
      nameElement.textContent = data.fullname;
    } else {
      nameElement.textContent = "Not Logged In";
    }
  } catch (err) {
    console.error("Fetch failed:", err);
    nameElement.textContent = "Error";
  }

  // Load user's clubs
  const loadUserClubs = async () => {
    try {
      const response = await fetch('/Admin/Php/get_user_clubs.php');
      const data = await response.json();
      return data.success ? data.clubs : [];
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

      // Create a map of club memberships with their status
      const userClubMap = new Map();
      userClubs.forEach(club => {
        userClubMap.set(club.club_id.toString(), {
          approved: club.approved_at !== null,
          pending: club.approved_at === null
        });
      });

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
        li.style.cursor = 'pointer';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = club.club_name;
        nameSpan.style.flex = '1';

        // Click on name to view details
        nameSpan.addEventListener('click', (e) => {
          e.stopPropagation();
          showClubDetails(club, userClubMap.get(club.id.toString()));
        });

        const membershipStatus = userClubMap.get(club.id.toString());
        let buttonText = 'Join';
        let buttonClass = 'club-view-btn join';
        let buttonDisabled = false;
        let buttonAction = 'join';

        if (membershipStatus) {
          if (membershipStatus.approved) {
            buttonText = 'Leave';
            buttonClass = 'club-view-btn cancel';
            buttonAction = 'cancel';
          } else if (membershipStatus.pending) {
            buttonText = 'Cancel';
            buttonClass = 'club-view-btn cancel';
            buttonAction = 'cancel';
          }
        } else if (hasJoinedAnyClub) {
          buttonDisabled = true;
          buttonClass = 'club-view-btn disabled';
        }

        const actionBtn = document.createElement('button');
        actionBtn.textContent = buttonText;
        actionBtn.dataset.id = club.id;
        actionBtn.dataset.action = buttonAction;
        actionBtn.className = buttonClass;
        actionBtn.disabled = buttonDisabled;

        if (buttonDisabled) {
          actionBtn.title = 'You can only be a member of one club at a time';
        }

        actionBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await handleJoinCancel(club.id, buttonAction);
        });

        li.appendChild(nameSpan);
        li.appendChild(actionBtn);
        clubListContainer.appendChild(li);
      });
    } catch (err) {
      console.error('Error loading clubs:', err);
      clubListContainer.innerHTML = '<p style="color:red;">Error loading clubs.</p>';
    }
  };

  function attachMembersList(members) {
        document.getElementById('club-members-list').innerHTML = '<p>Loading members...</p>';

        const membersListContainer = document.getElementById('club-members-list');
        membersListContainer.innerHTML = '';

        if (members.length === 0) {
          membersListContainer.innerHTML = '<p style="color:#999;">No members in this club.</p>';
          return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyleType = 'none';
        ul.style.padding = '0';

        members.forEach(member => {
          const li = document.createElement('li');
          li.style.padding = '8px 0';
          li.style.borderBottom = '1px solid #444';
          li.textContent = member.fullname + (member.approved_at ? ' (Approved)' : ' (Pending)');
          ul.appendChild(li);
        });

        membersListContainer.appendChild(ul);
  }

  // Show club details in side panel
  function showClubDetails(club, membershipStatus) {
    formTitle.textContent = club.club_name;
    document.getElementById('club-description').textContent = club.description || 'No description available';
    document.getElementById('club-advisor').textContent = club.adviser ? club.adviser.fullname : 'No adviser assigned';
    document.getElementById('club-president').textContent = club.president ? club.president.fullname : 'Not assigned';
    document.getElementById('club-vp').textContent = club.vice_president ? club.vice_president.fullname : 'Not assigned';

    attachMembersList(club.members || []);

    formContainer.classList.add('active');
    mainContent.classList.add('form-active');
    formContainer.setAttribute('aria-hidden', 'false');
  }

  // Handle join/cancel/leave actions
  async function handleJoinCancel(clubId, action) {
    const isCancel = action === 'cancel';
    let confirmMessage = '';

    // Determine confirmation message based on current membership status
    if (isCancel) {
      // Check if it's a pending request or approved membership
      const userClubs = await loadUserClubs();
      const membership = userClubs.find(club => club.club_id.toString() === clubId.toString());

      if (membership && membership.approved_at === null) {
        confirmMessage = 'Are you sure you want to cancel your membership request?';
      } else {
        confirmMessage = 'Are you sure you want to leave this club?';
      }
    } else {
      confirmMessage = 'Do you want to join this club?';
    }

    if (confirm(confirmMessage)) {
      try {
        const response = await fetch('/Admin/Php/join_club.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ club_id: clubId, action: action })
        });

        const data = await response.json();
        if (data.success) {
          let successMessage = '';
          if (isCancel) {
            successMessage = action === 'cancel' ? 'Successfully cancelled/left the club!' : 'Successfully left the club!';
          } else {
            successMessage = 'Join request submitted! Wait for adviser approval.';
          }
          alert(successMessage);

          // Close panel and reload
          formContainer.classList.remove('active');
          mainContent.classList.remove('form-active');
          formContainer.setAttribute('aria-hidden', 'true');
          window.location.reload();
        } else {
          alert('Failed: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to process request');
      }
    }
  }

  // Close form panel
  closeFormBtn.addEventListener('click', () => {
    formContainer.classList.remove('active');
    mainContent.classList.remove('form-active');
    formContainer.setAttribute('aria-hidden', 'true');
  });

  // Initial load
  loadClubs();
});