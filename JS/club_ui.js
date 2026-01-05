document.addEventListener("DOMContentLoaded", async () => {
  const clubButtons = document.querySelectorAll(".club-button");
  const formContainer = document.querySelector(".form-container");
  const formTitle = document.getElementById("form-title");
  const closeFormBtn = document.querySelector(".close-form");
  const mainContent = document.querySelector("main.main-content");

  clubButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const clubName = button.textContent.trim();
      formTitle.textContent = `${clubName} Information`;
      formContainer.classList.add("active");
      mainContent.classList.add("form-active");
      formContainer.setAttribute("aria-hidden", "false");

      // Load club info when clicked
      await loadClubData(clubName);
    });
  });

  closeFormBtn.addEventListener("click", () => {
    formContainer.classList.remove("active");
    mainContent.classList.remove("form-active");
    formContainer.setAttribute("aria-hidden", "true");
  });

  // CREATE CLUB MODAL
  const createClubBtn = document.querySelector(".CreateClub-Button");
  const modal = document.getElementById("createClubModal");

  if (createClubBtn && modal) {
    const confirmBtn = modal.querySelector(".confirm");
    const cancelBtn = modal.querySelector(".cancel");

    createClubBtn.addEventListener("click", () => {
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
    });

    cancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    });

    confirmBtn.addEventListener("click", () => {
      alert("Club created successfully!");
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
      }
    });
  }

  // CREATE CLUB MODAL
  const descField = document.getElementById("club-description");
  const advisorField = document.getElementById("advisor-name");
  const presidentField = document.getElementById("club-president");
  const vpField = document.getElementById("club-vp");
  const memberList = document.getElementById("member-list");
  const addMemberSection = document.getElementById("add-member-section");
  const saveBtn = document.getElementById("save-changes-btn");
  let currentClub = null;

  // Check user role
  let userRole = null;
  try {
    const res = await fetch("/Admin/Php/get_logged_user.php");
    const userData = await res.json();
    userRole = userData.role;
  } catch {
    console.error("Could not determine user role");
  }

  const isTeacher = userRole === "teacher" || userRole === "advisor";

  // Load club info
  async function loadClubData(clubName) {
    currentClub = clubName;
    const res = await fetch(`/Admin/Php/get_club_info.php?club=${clubName}`);
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    descField.value = data.description || "";
    advisorField.value = data.advisor || "";

    // Populate dropdowns
    presidentField.innerHTML = data.members
      .map(
        (m) =>
          `<option ${m.role === "President" ? "selected" : ""}>${m.name}</option>`
      )
      .join("");
    vpField.innerHTML = data.members
      .map(
        (m) =>
          `<option ${m.role === "Vice President" ? "selected" : ""}>${m.name}</option>`
      )
      .join("");

    // Populate member list
    memberList.innerHTML = data.members
      .map(
        (m) => `
        <div class="member-row">
          <span>${m.name}</span>
          ${isTeacher ? `<button class="remove-member-btn" data-name="${m.name}">❌</button>` : ""}
        </div>`
      )
      .join("");

    if (isTeacher) enableTeacherEditing();
  }

  // Enable editing for teachers/advisors
  function enableTeacherEditing() {
    descField.disabled = false;
    presidentField.disabled = false;
    vpField.disabled = false;
    addMemberSection.style.display = "block";
    document.querySelector(".teacher-actions").style.display = "block";
  }

  // Save changes
  saveBtn?.addEventListener("click", async () => {
    const payload = {
      club: currentClub,
      description: descField.value,
      president: presidentField.value,
      vp: vpField.value,
    };
    const res = await fetch("/Admin/Php/update_club_info.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    alert(result.message);
  });

  // Add member
  document.getElementById("add-member-btn")?.addEventListener("click", async () => {
    const name = document.getElementById("new-member-name").value.trim();
    if (!name || !currentClub) return alert("Enter a member name!");
    const res = await fetch("/Admin/Php/add_member.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, club: currentClub }),
    });
    const result = await res.json();
    alert(result.message);
    loadClubData(currentClub);
  });

  // Remove member
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("remove-member-btn")) {
      const name = e.target.dataset.name;
      if (confirm(`Remove ${name}?`)) {
        const res = await fetch("/Admin/Php/remove_member.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, club: currentClub }),
        });
        const result = await res.json();
        alert(result.message);
        loadClubData(currentClub);
      }
    }
  });
});
