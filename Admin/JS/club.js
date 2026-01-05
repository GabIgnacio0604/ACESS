document.addEventListener("DOMContentLoaded", async () => {
  const nameElement = document.querySelector(".account-name");
  const clubList = document.getElementById("club-lists");
  const formContainer = document.querySelector(".form-container");
  const formTitle = document.getElementById("form-title");
  const closeFormBtn = document.querySelector(".close-form");
  const mainContent = document.querySelector("main.main-content");
  const modal = document.getElementById("createClubModal");
  const createBtn = document.getElementById("createClubBtn");
  const cancelBtn = modal.querySelector(".cancel");
  const createForm = document.getElementById("createClubForm");

  const hamburger = document.getElementById("hamburger-btn");
  const sidebar = document.querySelector(".sidebar");

  // 🧭 Sidebar Toggle
  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
    hamburger.classList.toggle("active");
  });

  // 🧑 Fetch User
  try {
    const res = await fetch("Php/get_logged_user.php");
    const data = await res.json();
    nameElement.textContent = data.fullname || "Not Logged In";
  } catch (err) {
    console.error("Fetch failed:", err);
    nameElement.textContent = "Error";
  }

  // 🧩 Load Clubs
  async function loadClubs() {
    try {
      const res = await fetch("/Admin/Php/get_clubs.php");
      const data = await res.json();

      clubList.innerHTML = "";

      if (data.success && data.clubs.length > 0) {
        data.clubs.forEach((club) => {
          const li = document.createElement("li");
          li.innerHTML = `<span>${club.club_name}</span>`;
          li.addEventListener("click", () => showClubDetails(club));
          clubList.appendChild(li);
        });
      } else {
        clubList.innerHTML = '<p style="color:#999;">No clubs found.</p>';
      }
    } catch (err) {
      console.error("Error loading clubs:", err);
      clubList.innerHTML = '<p style="color:red;">Error loading clubs.</p>';
    }
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

  function showClubDetails(club) {
    formTitle.textContent = club.club_name;
    document.getElementById("club-description").textContent = club.description || "No description";
    document.getElementById("club-advisor").textContent = club.adviser || "No adviser";
    document.getElementById("club-president").textContent = "Not assigned";
    document.getElementById("club-vp").textContent = "Not assigned";
    attachMembersList(club.members || []);

    const deleteModal = document.getElementById("deleteConfirmModal");
    const confirmDeleteBtn = document.getElementById("confirmDelete");
    const cancelDeleteBtn = document.getElementById("cancelDelete");

    document.getElementById("deleteClubBtn").onclick = () => {
      deleteModal.classList.add("active");
    };

    confirmDeleteBtn.onclick = async () => {
      try {
        const response = await fetch("/Admin/Php/club_delete.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: club.id }),
        });
        const result = await response.json();

        if (result.status === "success") {
          alert("Club deleted successfully!");
          deleteModal.classList.remove("active");
          formContainer.classList.remove("active");
          loadClubs();
        } else alert("Error: " + result.message);
      } catch (err) {
        console.error(err);
        alert("Failed to delete club.");
      }
    };

    cancelDeleteBtn.onclick = () => deleteModal.classList.remove("active");

    formContainer.classList.add("active");
  }

  closeFormBtn.addEventListener("click", () => {
    formContainer.classList.remove("active");
  });

  createBtn.addEventListener("click", () => modal.classList.add("active"));
  cancelBtn.addEventListener("click", () => modal.classList.remove("active"));
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay"))
      e.target.classList.remove("active");
  });

  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("clubNameInput").value.trim();
    const adviser = document.getElementById("club-adviser-select").value;
    const chat = document.getElementById("groupChatInput").value.trim();

    if (!name || !adviser) return alert("Please fill in all required fields");

    try {
      const res = await fetch("/Admin/Php/create_club.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ club_name: name, adviser, group_chat: chat }),
      });
      const result = await res.json();
      if (result.success) {
        alert("Club created successfully!");
        modal.classList.remove("active");
        createForm.reset();
        loadClubs();
      } else alert("Error: " + result.message);
    } catch (err) {
      console.error("Error:", err);
    }
  });

  loadClubs();
});
