// Account Management System

async function loadAccounts() {
  try {
    const res = await fetch('/Admin/Php/get_accounts.php');
    const text = await res.text();
    console.log('Raw response:', text);

    const data = JSON.parse(text);
    console.log("Parsed data:", data);

    const signupList = document.getElementById('signup-list');
    const accountList = document.getElementById('account-list');

    signupList.innerHTML = '';
    accountList.innerHTML = '';

    if (!data.applications?.length) {
      signupList.innerHTML = "<p style='color:#aaa;'>No pending applications</p>";
    }
    if (!data.accounts?.length) {
      accountList.innerHTML = "<p style='color:#aaa;'>No approved accounts</p>";
    }

    data.applications?.forEach(user => {
      const btn = document.createElement('button');
      btn.classList.add('list-button');
      btn.textContent = user.fullname || '(No name)';
      btn.addEventListener('click', () => fillForm(user));
      signupList.appendChild(btn);
    });

    data.accounts?.forEach(user => {
      const btn = document.createElement('button');
      btn.classList.add('list-button');
      btn.textContent = user.fullname || '(No name)';
      btn.addEventListener('click', () => fillForm(user));
      accountList.appendChild(btn);
    });

  } catch (err) {
    console.error('Error loading accounts:', err);
  }
}

function fillForm(user) {
  document.getElementById('full-name').value = user.fullname || '';
  document.getElementById('email').value = user.email || '';
  document.getElementById('password').value = user.password || '';
  document.getElementById('school-id').value = user.lrn || '';
  document.getElementById('role').value = user.role && user.role !== '' ? user.role : 'Student';
}

// Account Management

document.addEventListener('DOMContentLoaded', async () => {
  // Load account data first
  loadAccounts();

  // Account management buttons
  document.getElementById('save-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const fullname = document.getElementById('full-name').value;
    const password = document.getElementById('password').value;
    const school_id = document.getElementById('school-id').value;

    try {
      const res = await fetch('./Php/save_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, fullname, password, school_id })
      });
      const result = await res.json();
      alert(result.message);
      loadAccounts();
    } catch (err) {
      console.error('Save error:', err);
    }
  });

  document.getElementById('accept-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    try {
      const res = await fetch('./Php/accept_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      const result = await res.json();
      alert(result.message);
      loadAccounts();
    } catch (err) {
      console.error('Accept error:', err);
    }
  });

  document.getElementById('reject-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value;

    try {
      const res = await fetch('./Php/reject_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await res.json();
      alert(result.message);
      loadAccounts();
    } catch (err) {
      console.error('Reject error:', err);
    }
  });

  document.getElementById('delete-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value;

    try {
      const res = await fetch('./Php/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await res.json();
      alert(result.message);
      loadAccounts();
    } catch (err) {
      console.error('Delete error:', err);
    }
  });

  // Voting system setup
  const executivePositions = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Auditor', 'P.I.O', 'P.O'];
  const gradePositions = ['Grade 12', 'Grade 11', 'Grade 10', 'Grade 9', 'Grade 8', 'Grade 7'];
  
  let candidates = [];
  let votingActive = false;
  let currentEditingCandidate = null;

  const activateBtn = document.getElementById('activateVotingBtn');
  const deactivateBtn = document.getElementById('deactivateVotingBtn');
  const addCandidateBtn = document.getElementById('addCandidateBtn');
  const candidateModal = document.getElementById('candidateModal');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const candidateForm = document.getElementById('candidateForm');
  const imageInput = document.getElementById('candidatePhoto');
  const imagePreview = document.getElementById('imagePreview');
  const votingStatus = document.getElementById('votingStatus');
  const statusText = document.getElementById('statusText');
  const lastUpdated = document.getElementById('lastUpdated');

  loadCandidates();
  loadVotingStatus();

  activateBtn?.addEventListener('click', () => updateVotingStatus(true));
  deactivateBtn?.addEventListener('click', () => updateVotingStatus(false));
  addCandidateBtn?.addEventListener('click', openAddModal);
  cancelModalBtn?.addEventListener('click', closeModal);
  candidateForm?.addEventListener('submit', handleFormSubmit);
  imageInput?.addEventListener('change', handleImagePreview);

  async function loadCandidates() {
    try {
      const response = await fetch('/Admin/Php/get_all_candidates.php');
      const data = await response.json();
      if (data.success) {
        candidates = data.candidates;
        renderPositions();
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  }

  async function loadVotingStatus() {
    try {
      const response = await fetch('/Admin/Php/get_voting_status.php');
      const data = await response.json();
      if (data.success) {
        votingActive = data.voting_active;
        updateVotingStatusUI();
        if (data.last_updated) {
          lastUpdated.textContent = new Date(data.last_updated).toLocaleString();
        }
      }
    } catch (error) {
      console.error('Error loading voting status:', error);
    }
  }

  function renderPositions() {
    renderExecutivePositions();
    renderGradePositions();
  }

  function renderExecutivePositions() {
    const container = document.getElementById('executivePositions');
    container.innerHTML = '';
    executivePositions.forEach(position => {
      const candidate = candidates.find(c => c.position === position);
      container.appendChild(createPositionCard(position, candidate));
    });
  }

  function renderGradePositions() {
    const container = document.getElementById('gradePositions');
    container.innerHTML = '';
    gradePositions.forEach(position => {
      const candidate = candidates.find(c => c.position === position);
      container.appendChild(createPositionCard(position, candidate));
    });
  }

  function createPositionCard(position, candidate) {
    const card = document.createElement('div');
    card.className = 'position-card';
    const photoUrl = candidate?.photo_url || '';
    const candidateName = candidate?.candidate_name || 'No candidate assigned';
    const votes = candidate?.votes || 0;
    card.innerHTML = `
      <div class="position-header">
        <h3 class="position-title">${position}</h3>
        <button class="edit-icon" data-position="${position}" data-candidate-id="${candidate?.id || ''}">✏️</button>
      </div>
      <div class="candidate-photo ${!photoUrl ? 'empty' : ''}">
        ${photoUrl ? `<img src="${photoUrl}" alt="${candidateName}">` :
          `<div class="photo-placeholder"><i>👤</i><p>No photo</p></div>`}
      </div>
      <div class="candidate-info">
        <p class="candidate-name ${!candidate ? 'no-candidate' : ''}">${candidateName}</p>
        ${candidate ? `<span class="vote-count">Votes: ${votes}</span>` : ''}
      </div>
    `;
    const editBtn = card.querySelector('.edit-icon');
    editBtn.addEventListener('click', () => openEditModal(position, candidate));
    return card;
  }

  function openAddModal() {
    currentEditingCandidate = null;
    document.getElementById('modalTitle').textContent = 'Add New Candidate';
    candidateForm.reset();
    imagePreview.innerHTML = '<span style="color: #6c757d;">No image selected</span>';
    candidateModal.classList.add('active');
  }

  function openEditModal(position, candidate) {
    currentEditingCandidate = candidate;
    document.getElementById('modalTitle').textContent = `Edit ${position}`;
    if (candidate) {
      document.getElementById('candidateName').value = candidate.candidate_name;
      document.getElementById('candidatePosition').value = candidate.position;
      if (candidate.photo_url) {
        imagePreview.innerHTML = `<img src="${candidate.photo_url}" alt="Preview">`;
      }
    } else {
      candidateForm.reset();
      document.getElementById('candidatePosition').value = position;
      imagePreview.innerHTML = '<span style="color: #6c757d;">No image selected</span>';
    }
    candidateModal.classList.add('active');
  }

  function closeModal() {
    candidateModal.classList.remove('active');
    candidateForm.reset();
    currentEditingCandidate = null;
  }

  function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('candidate_name', document.getElementById('candidateName').value);
    formData.append('position', document.getElementById('candidatePosition').value);
    const photoFile = imageInput.files[0];
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    if (currentEditingCandidate) {
      formData.append('candidate_id', currentEditingCandidate.id);
      formData.append('action', 'update');
    } else {
      formData.append('action', 'create');
    }
    try {
      const response = await fetch('/Admin/Php/manage_candidate.php', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        alert(currentEditingCandidate ? 'Candidate updated successfully!' : 'Candidate added successfully!');
        closeModal();
        loadCandidates();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving candidate:', error);
      alert('Failed to save candidate. Please try again.');
    }
  }

  async function updateVotingStatus(active) {
    if (confirm(`Are you sure you want to ${active ? 'activate' : 'deactivate'} voting?`)) {
      try {
        const response = await fetch('/Admin/Php/update_voting_status.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voting_active: active })
        });
        const data = await response.json();
        if (data.success) {
          votingActive = active;
          updateVotingStatusUI();
          lastUpdated.textContent = new Date().toLocaleString();
          alert(`Voting ${active ? 'activated' : 'deactivated'} successfully!`);
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        console.error('Error updating voting status:', error);
        alert('Failed to update voting status.');
      }
    }
  }

  function updateVotingStatusUI() {
    if (votingActive) {
      votingStatus.className = 'voting-status active';
      statusText.textContent = 'ACTIVE';
      activateBtn.disabled = true;
      deactivateBtn.disabled = false;
    } else {
      votingStatus.className = 'voting-status inactive';
      statusText.textContent = 'INACTIVE';
      activateBtn.disabled = false;
      deactivateBtn.disabled = true;
    }
  }

  async function loadStatistics() {
    try {
      const response = await fetch('/Admin/Php/get_voting_statistics.php');
      const data = await response.json();
      if (data.success) {
        renderStatistics(data.stats);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }

  function renderStatistics(stats) {
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = '';
    for (const [position, candidates] of Object.entries(stats)) {
      const positionDiv = document.createElement('div');
      positionDiv.className = 'stats-position';
      positionDiv.innerHTML = `<h4>${position}</h4>`;
      candidates.forEach(candidate => {
        const candidateDiv = document.createElement('div');
        candidateDiv.className = 'stats-candidate';
        candidateDiv.textContent = `${candidate.candidate_name}: ${candidate.votes} votes`;
        positionDiv.appendChild(candidateDiv);
      });
      statsContainer.appendChild(positionDiv);
    }
  }
});
// ✅ Sidebar toggle
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  sidebar.classList.toggle("hidden");
});

// ✅ Active list button highlight
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("list-button")) {
    document.querySelectorAll(".list-button").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
  }
});

// ✅ Display logged-in user
document.addEventListener("DOMContentLoaded", async () => {
  const nameElement = document.getElementById("account-name");
  try {
    const res = await fetch("Php/get_logged_user.php");
    const data = await res.json();
    nameElement.textContent = data.fullname || "Not Logged In";
  } catch {
    nameElement.textContent = "Error";
  }
});

