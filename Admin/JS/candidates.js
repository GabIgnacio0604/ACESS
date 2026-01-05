document.addEventListener("DOMContentLoaded", async () => {
  // Get DOM elements
  const nameElement = document.querySelector(".account-name");
  const modal = document.getElementById("candidateModal");
  const addButton = document.getElementById("addCandidateBtn");
  const cancelButton = modal.querySelector(".cancel-btn");
  const candidateForm = document.getElementById("candidateForm");
  const modalTitle = document.getElementById("modalTitle");
  const candidateList = document.getElementById("candidateList");

  // Function to display candidates
  function displayCandidates(candidates) {
    candidateList.innerHTML = '';
    candidates.forEach(candidate => {
      const candidateCard = document.createElement('div');
      candidateCard.className = 'candidate-card';
      candidateCard.innerHTML = `
        <div class="candidate-info">
          <strong>${candidate.candidate_name}</strong> - ${candidate.position}
        </div>
        <div class="button-group">
          <button class="edit-btn" data-id="${candidate.id}">Edit</button>
          <button class="delete-btn" data-id="${candidate.id}">Delete</button>
        </div>
      `;
      candidateList.appendChild(candidateCard);
    });

    // Reattach button listeners
    attachEditListeners();
    attachDeleteListeners();
  }

  // Attach delete button listeners
  function attachDeleteListeners() {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(button => {
      button.onclick = async (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this candidate?')) {
          const candidateId = button.getAttribute('data-id');
          try {
            const response = await fetch('Php/delete_candidate.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id: candidateId })
            });

            const result = await response.json();
            
            if (result.success) {
              displayCandidates(result.candidates);
              alert('Candidate deleted successfully!');
            } else {
              alert('Failed to delete candidate: ' + result.message);
            }
          } catch (err) {
            console.error('Error deleting candidate:', err);
            alert('Error deleting candidate. Please try again.');
          }
        }
      };
    });
  }

  function openEditCandidateModal() {
    modalTitle.textContent = "Edit Candidate";
    candidateForm.reset();
    modal.style.display = "flex";
    modal.classList.add("active");
  }
    
  // Attach edit button listeners
  function attachEditListeners() {



    const editButtons = document.querySelectorAll(".edit-btn");
    editButtons.forEach(button => {
      button.onclick = (e) => {
        e.preventDefault();

        openEditCandidateModal();

        modalTitle.textContent = "Edit Candidate";
        const candidateCard = button.closest(".candidate-card");
        const candidateInfo = candidateCard.querySelector(".candidate-info").textContent;
        
        // Parse candidate info
        const [name, position] = candidateInfo.split(" - ");
        document.getElementById("candidateName").value = name.trim();
        document.getElementById("candidatePosition").value = position.trim();
        document.getElementById("editCandidateId").value = button.getAttribute('data-id');

        modal.style.display = "flex";
        modal.classList.add("active");
      };
    });
  }

  // Fetch and display existing candidates
  async function loadCandidates() {
    try {
      const response = await fetch('Php/get_candidates.php');
      const data = await response.json();
      if (data.success) {
        displayCandidates(data.candidates);
      } else {
        console.error('Failed to load candidates:', data.message);
      }
    } catch (err) {
      console.error('Error loading candidates:', err);
    }
  }

  // Load initial candidates
  await loadCandidates();

  // Fetch user name
  try {
    const res = await fetch("Php/get_logged_user.php");
    const data = await res.json();

    if (data.fullname) {
      nameElement.textContent = data.fullname;
    } else {
      nameElement.textContent = "Not Logged In";
      console.error("Error fetching name:", data.error);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
    nameElement.textContent = "Error";
  }

  // Open modal for adding new candidate
  if (addButton) {
    addButton.addEventListener("click", function(e) {
      e.preventDefault();
      modalTitle.textContent = "Add New Candidate";
      candidateForm.reset();
      document.getElementById("editCandidateId").value = "";
      modal.style.display = "flex";
      modal.classList.add("active");
    });
  }

  // Close modal
  if (cancelButton) {
    cancelButton.onclick = (e) => {
      e.preventDefault();
      modal.style.display = "none";
      modal.classList.remove("active");
    };
  }

  // Close modal when clicking outside
  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      modal.classList.remove("active");
    }
  };

  // Handle form submission
  if (candidateForm) {
    candidateForm.onsubmit = async (e) => {
      e.preventDefault();
      // const reader = new FileReader();
      const formData = new FormData(candidateForm);
      const candidatePhotoInput = document.getElementById('candidatePhoto');
      // const candidateData = {
      //   name: formData.get("name"),
      //   position: formData.get("position"),
      //   id: formData.get("id") || null
      // };
      
      try {
        const response = await fetch('Php/save_candidate.php', {
          method: 'POST',
          // headers: {
          //   'Content-Type': 'application/json',
          // },
          body: formData,
          // body: JSON.stringify(candidateData)
        });

        const result = await response.json();
        
        if (result.success) {
          // Update the displayed list with new data
          displayCandidates(result.candidates);
          modal.style.display = "none";
          modal.classList.remove("active");
          alert('Candidate added successfully!');
        } else {
          alert('Failed to add candidate: ' + result.message);
        }
      } catch (err) {
        console.error('Error saving candidate:', err);
        alert('Error saving candidate. Please try again.');
      }
    };
  }
});