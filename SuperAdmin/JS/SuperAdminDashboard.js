document.addEventListener("DOMContentLoaded", async () => {
  const nameElement = document.querySelector(".account-name");
  const listContainer = document.getElementById("account-list");
  const modalOverlay = document.getElementById("modal-overlay");
  const saveBtn = document.getElementById("save-password-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const newPasswordInput = document.getElementById("new-password");
  const modalTitle = document.getElementById("modal-title");

  let selectedEmail = null;
  let selectedName = null;

  // Load logged-in user
  try {
    const res = await fetch("/Admin/Php/get_logged_user.php");
    const data = await res.json();
    nameElement.textContent = data.fullname || "Not Logged In";
  } catch {
    nameElement.textContent = "Error";
  }

  // Load admin accounts
  try {
    const res = await fetch("/Admin/Php/get_admins.php");
    const admins = await res.json();

    listContainer.innerHTML = "";

    if (!admins.length) {
      listContainer.innerHTML = "<p style='color:#999;'>No admin accounts found</p>";
    }

    admins.forEach((admin) => {
      const container = document.createElement("div");
      container.classList.add("admin-card");
      container.innerHTML = `
        <span class="admin-name">${admin.fullname || "(Unnamed Admin)"}</span>
        <button class="reset-btn" data-email="${admin.email}" data-name="${admin.fullname}">
          Change Password
        </button>
      `;
      listContainer.appendChild(container);
    });

    // Open modal when clicking Change Password
    document.querySelectorAll(".reset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedEmail = btn.getAttribute("data-email");
        selectedName = btn.getAttribute("data-name");
        newPasswordInput.value = "";
        modalTitle.textContent = `Change Password for ${selectedName}`;
        modalOverlay.classList.add("active");
      });
    });

    // Cancel modal
    cancelBtn.addEventListener("click", () => {
      modalOverlay.classList.remove("active");
    });

    // Save password
    saveBtn.addEventListener("click", async () => {
      const newPassword = newPasswordInput.value.trim();
      if (!newPassword) {
        alert("Please enter a new password.");
        return;
      }

      try {
        const res = await fetch("/Admin/Php/update_password.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedEmail, password: newPassword })
        });
        const result = await res.json();
        alert(result.message);
        modalOverlay.classList.remove("active");
      } catch (err) {
        console.error("Password update failed:", err);
        alert("Error updating password.");
      }
    });

  } catch (err) {
    console.error("Error loading admins:", err);
    listContainer.innerHTML = "<p style='color:red;'>Failed to load admin accounts</p>";
  }
});
