document.addEventListener("DOMContentLoaded", async () => {
  const nameElement = document.querySelector(".account-name");
  const managedClubsList = document.getElementById("managed-clubs-list");
  const otherClubsList = document.getElementById("other-clubs-list");
  const formContainer = document.querySelector(".form-container");
  const formTitle = document.getElementById("form-title");
  const closeFormBtn = document.querySelector(".close-form");
  const mainContent = document.querySelector("main.main-content");

  let currentUserName = "";
  let currentUserid = null;

  // Fetch user name
  try {
    const res = await fetch("/Admin/Php/get_logged_user.php");
    const data = await res.json();
    if (data.fullname) {
      nameElement.textContent = data.fullname;
      currentUserName = data.fullname;
      currentUserid = data.id;
    } else {
      nameElement.textContent = "Not Logged In";
    }
  } catch (err) {
    console.error("Fetch failed:", err);
    nameElement.textContent = "Error";
  }

  // Load clubs
  async function loadClubs() {
    try {
      const res = await fetch('/Admin/Php/get_clubs.php');
      const data = await res.json();

      if (data.success && data.clubs.length > 0) {
        const managedClubs = data.clubs.filter(club => {
          if(club.adviser == "" || club.adviser == null){
            return false;
          }
          
          return club.adviser && club.adviser.id == currentUserid;
        });
        const otherClubs = data.clubs.filter(club => {
          if(club.adviser == "" || club.adviser == null){
            return true;
          }
          
          return club.adviser && club.adviser.id != currentUserid;
        });

        // Display managed clubs
        if (managedClubs.length > 0) {
          managedClubsList.innerHTML = '';
          managedClubs.forEach(club => {
            const clubItem = createClubItem(club, true);
            managedClubsList.appendChild(clubItem);
          });
        } else {
          managedClubsList.innerHTML = `
            <div class="empty-state">
              <div class="empty-state-icon">📋</div>
              <div class="empty-state-text">You don't manage any clubs yet</div>
            </div>
          `;
        }

        // Display other clubs
        if (otherClubs.length > 0) {
          otherClubsList.innerHTML = '';
          otherClubs.forEach(club => {
            const clubItem = createClubItem(club, false);
            otherClubsList.appendChild(clubItem);
          });
        } else {
          otherClubsList.innerHTML = `
            <div class="empty-state">
              <div class="empty-state-icon">🔍</div>
              <div class="empty-state-text">No other clubs available</div>
            </div>
          `;
        }
      } else {
        managedClubsList.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-text">No clubs found</div>
          </div>
        `;
        otherClubsList.innerHTML = '';
      }
    } catch (err) {
      console.error('Error loading clubs:', err);
      managedClubsList.innerHTML = '<p style="color:red;">Error loading clubs.</p>';
    }
  }

  // Create club item element
  function createClubItem(club, isManaged) {
    const clubItem = document.createElement('div');
    clubItem.className = 'club-item';

    const clubName = document.createElement('span');
    clubName.className = 'club-item-name';
    clubName.textContent = club.club_name;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.gap = '10px';

    if (isManaged) {
      const badge = document.createElement('span');
      badge.className = 'club-item-badge';
      badge.textContent = 'You Manage';
      buttonContainer.appendChild(badge);
    }

    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'view-details-btn';
    detailsBtn.textContent = 'View Details';
    detailsBtn.addEventListener('click', () => {
      if (isManaged) {
        window.location.href = `ACESS_Teacher_Club_Details.html?id=${club.id}`;
      } else {
        showClubDetails(club);
      }
    });

    buttonContainer.appendChild(detailsBtn);

    clubItem.appendChild(clubName);
    clubItem.appendChild(buttonContainer);

    return clubItem;
  }

  function attachMembersList(members) {
    const container = document.getElementById("club-members-list");
    container.innerHTML = "";

    if (!members || members.length === 0) {
      container.innerHTML = "<p style='color:#999;'>No members in this club.</p>";
      return;
    }

    const ul = document.createElement("ul");
    members.forEach((m) => {
      const li = document.createElement("li");
      li.textContent = `${m.fullname} (${m.email})`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }  

  // Show club details in side panel (for non-managed clubs)
  function showClubDetails(club) {
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

  // Close panel
  closeFormBtn.addEventListener('click', () => {
    formContainer.classList.remove('active');
    mainContent.classList.remove('form-active');
    formContainer.setAttribute('aria-hidden', 'true');
  });

  // Initial load
  loadClubs();
});