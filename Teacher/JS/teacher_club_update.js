async function loadClubDetails() {
  try {
    const response = await fetch(`/Admin/Php/get_club_details.php?id=${clubId}`);
    const data = await response.json();

    if (data.success) {
      document.getElementById('club-name').textContent = data.club.name;
      document.getElementById('club-description').textContent = data.club.description || 'No description';

      // Update edit textarea
      document.getElementById('edit-description').value = data.club.description || '';

      const membersList = document.getElementById('members-list');
      membersList.innerHTML = '';

      const presidentSelect = document.getElementById('select-president');
      const vpSelect = document.getElementById('select-vp');
      presidentSelect.innerHTML = '<option value="">-- Select President --</option>';
      vpSelect.innerHTML = '<option value="">-- Select Vice President --</option>';

      data.members.forEach(member => {
        const option = `<option value="${member.id}">${member.fullname}</option>`;
        presidentSelect.innerHTML += option;
        vpSelect.innerHTML += option;

        const memberCard = document.createElement('div');
        memberCard.className = 'member-card';

        const roleClass = member.club_role.toLowerCase().replace(' ', '-');
        const actionButtons = member.approved_at === null
          ? `<div class="member-actions">
              <button class="action-btn accept-btn" onclick="updateMembership(${member.id}, 'accept')">Accept</button>
              <button class="action-btn reject-btn" onclick="updateMembership(${member.id}, 'reject')">Reject</button>
            </div>`
          : `<div class="member-actions">
              <button class="action-btn remove-btn" onclick="updateMembership(${member.id}, 'remove')">Remove</button>
            </div>`;

        memberCard.innerHTML = `
          <div class="member-info">
            <div>
              <span class="member-name">${member.fullname}</span>
              <span class="member-role ${roleClass}">${member.club_role}</span>
            </div>
            <div class="member-email">${member.email}</div>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="member-status ${member.approved_at ? 'status-approved' : 'status-pending'}">
              ${member.approved_at ? 'Approved' : 'Pending'}
            </div>
            ${actionButtons}
          </div>
        `;
        membersList.appendChild(memberCard);
      });
    } else {
      alert('Failed to load club details: ' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to load club details');
  }
}

async function saveClubDetails() {
  const description = document.getElementById('edit-description').value;
  const president_id = document.getElementById('select-president').value;
  const vice_president_id = document.getElementById('select-vp').value;

  try {
    const response = await fetch('../ Teacher/Php/update_club_details.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        club_id: clubId,
        description,
        president_id,
        vice_president_id
      })
    });

    const data = await response.json();
    if (data.success) {
      alert('Club details updated successfully!');
      loadClubDetails();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to save club details');
  }
}

function approveMember(id) {
  fetch('update_membership.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `id=${id}&action=approve`
  })
  .then(r => r.json())
  .then(res => {
    alert('Member approved!');
    location.reload();
  });
}

function rejectMember(id) {
  fetch('update_membership.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `id=${id}&action=reject`
  })
  .then(r => r.json())
  .then(res => {
    alert('Member rejected.');
    location.reload();
  });
}
function removeMember(id) {
  fetch('update_membership.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `id=${id}&action=remove`
  })
  .then(r => r.json())
  .then(res => {
    alert('Member removed from club.');
    location.reload();
  });
}

function updateMembership(id, action) {
  fetch('update_membership.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `id=${id}&action=${action}`
  })
  .then(r => r.json())
  .then(res => {
    alert(`Member ${action}d successfully.`);
    location.reload();
  }); 
}