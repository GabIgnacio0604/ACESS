document.addEventListener('DOMContentLoaded', async () => {
  // Position definitions
  const executivePositions = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Auditor', 'P.I.O', 'P.O'];
  const gradePositions = ['Grade 12', 'Grade 11', 'Grade 10', 'Grade 9', 'Grade 8', 'Grade 7'];
  
  let candidates = [];
  let votingActive = false;
  let currentEditingCandidate = null;

  // Get DOM elements
  const activateBtn = document.getElementById('activateVotingBtn');
  const deactivateBtn = document.getElementById('deactivateVotingBtn');
  const addCandidateBtn = document.getElementById('addCandidateBtn');
  const candidateModal = document.getElementById('candidateModal');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const candidateForm = document.getElementById('candidateForm');
  const imageInput = document.getElementById('candidatePhoto');
  const imagePreview = document.getElementById('imagePreview');
  const votingStatus = document.getElementById('voting-status');
  const statusText = document.getElementById('status-text');
  const lastUpdated = document.getElementById('last-updated');

  // Load initial data
  await loadCandidates();
  await loadVotingStatus();

  // Event listeners
  activateBtn?.addEventListener('click', () => updateVotingStatus(true));
  deactivateBtn?.addEventListener('click', () => updateVotingStatus(false));
  addCandidateBtn?.addEventListener('click', openAddModal);
  cancelModalBtn?.addEventListener('click', closeModal);
  candidateForm?.addEventListener('submit', handleFormSubmit);
  imageInput?.addEventListener('change', handleImagePreview);

  // Load all candidates
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

  // Load voting status
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

  // Render all positions
  function renderPositions() {
    renderExecutivePositions();
    renderGradePositions();
  }

  // Render executive positions
  function renderExecutivePositions() {
    const container = document.getElementById('executivePositions');
    container.innerHTML = '';
    executivePositions.forEach(position => {
      const candidate = candidates.find(c => c.position === position);
      container.appendChild(createPositionCard(position, candidate));
    });
  }

  // Render grade positions
  function renderGradePositions() {
    const container = document.getElementById('gradePositions');
    container.innerHTML = '';
    gradePositions.forEach(position => {
      const candidate = candidates.find(c => c.position === position);
      container.appendChild(createPositionCard(position, candidate));
    });
  }

  // Create position card
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

  // Open add modal
  function openAddModal() {
    currentEditingCandidate = null;
    document.getElementById('modalTitle').textContent = 'Add New Candidate';
    candidateForm.reset();
    imagePreview.innerHTML = '<span style="color: #6c757d;">No image selected</span>';
    candidateModal.classList.add('active');
  }

  // Open edit modal
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

  // Close modal
  function closeModal() {
    candidateModal.classList.remove('active');
    candidateForm.reset();
    currentEditingCandidate = null;
  }

  // Handle image preview
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

  // Handle form submit
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

  // Update voting status
  async function updateVotingStatus(active) {
    if (confirm(`Are you sure you want to ${active ? 'activate' : 'deactivate'} voting?`)) {
      let year = null;

      if(active) {
         year = prompt("Enter year (YYYY)");
      }
      
      try {
        const response = await fetch('/Admin/Php/update_voting_status.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voting_active: active, voting_year: year })
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

  // Update voting status UI
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


  // Load statistics
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

  // Render statistics
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