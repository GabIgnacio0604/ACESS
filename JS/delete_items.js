document.addEventListener("DOMContentLoaded", () => {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalForm = document.getElementById('modalForm');
  const modalTitleEl = document.getElementById('modalTitle');
  const modalDateInput = document.getElementById('modalDate');
  const modalTitleInput = document.getElementById('modalTitleInput');
  const modalCancel = document.getElementById('modalCancel');

  let currentType = '';

  // Open modal for Add
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentType = btn.dataset.type;
      modalTitleEl.textContent = `Add ${capitalize(currentType)}`;
      modalForm.reset();
      modalOverlay.classList.remove("hidden");
    });
  });

  // Cancel modal
  modalCancel.addEventListener("click", () => {
    modalOverlay.classList.add("hidden");
  });

  // ⚠️ NEW FIX: Close modal when clicking outside (on the overlay)
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.add("hidden");
    }
  });

  // Submit modal form
  modalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = modalDateInput.value.trim();
    const title = modalTitleInput.value.trim();
    if (!date || !title) return;

    try {
      const res = await fetch("../API/update_dashboard_item.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: currentType, action: "add", date, title })
      });
      const data = await res.json();

      if (data.success) {
        showSuccessMessage(`${capitalize(currentType)} added successfully!`);
        modalOverlay.classList.add("hidden"); // close modal
        appendNewItem(currentType, date, title, data.id || null); // update list without reload
      } else {
        alert(data.message || "Failed to add item");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding item");
    }
  });

  // Delete button
  document.body.addEventListener("click", async (e) => {
    const btn = e.target.closest(".deleteEventBtn, .deleteAnnouncementBtn");
    if (!btn) return;

    const type = btn.classList.contains("deleteEventBtn") ? "event" : "announcement";
    const id = btn.dataset.id;

    if (!await confirmDeleteModal(type)) return; // modal confirmation

    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.innerHTML = "Deleting...";

    try {
      const res = await fetch("../API/delete_items.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type })
      });
      const data = await res.json();

      if (data.success) {
        showSuccessMessage(`${capitalize(type)} deleted successfully!`);
        const listItem = btn.closest('li');
        listItem.style.transition = "all 0.3s ease";
        listItem.style.opacity = "0";
        listItem.style.transform = "translateX(-20px)";
        setTimeout(() => listItem.remove(), 300);
      } else {
        alert("Failed to delete: " + (data.error || "Unknown error"));
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.innerHTML = "🗑️ Delete";
      }
    } catch (err) {
      console.error(err);
      alert(`Error deleting ${type}`);
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.innerHTML = "🗑️ Delete";
    }
  });

  // Helpers
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Toast
  function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 100px; right: 20px;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white; padding: 15px 25px; border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      z-index: 10000; font-weight: 600; animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(400px); opacity:0; } to { transform: translateX(0); opacity:1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity:1; } to { transform: translateX(400px); opacity:0; } }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => { toast.remove(); style.remove(); }, 300);
    }, 3000);
  }

  function appendNewItem(type, date, title, id) {
    const listId = type === "event" ? "eventsList" : "announcementsList";
    const list = document.getElementById(listId);

    const li = document.createElement("li");
    li.style.cssText = `
      display:flex; justify-content:space-between; align-items:center;
      padding:12px 16px; margin-bottom:10px;
      background-color: rgba(255,255,255,0.05); border-radius:8px;
      border-left:4px solid #ffd54f;
    `;

    const contentDiv = document.createElement("div");
    contentDiv.style.flex = "1";
    contentDiv.innerHTML = `
      <span style="font-weight:bold; color:#ffd54f; display:block; margin-bottom:4px;">${date}</span>
      <span style="color:#e0e0e0; font-size:0.95rem;">${title}</span>
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = type === "event" ? "deleteEventBtn" : "deleteAnnouncementBtn";
    deleteBtn.dataset.id = id || new Date().getTime();
    deleteBtn.innerHTML = "🗑️ Delete";
    deleteBtn.style.cssText = `
      background: linear-gradient(135deg, #f44336, #d32f2f);
      color:white; border:none; padding:8px 16px; border-radius:8px;
      cursor:pointer; font-weight:600; font-size:0.9rem;
    `;

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  }

  // Replace alert with modal confirmation (simplest version)
  function confirmDeleteModal(type) {
    return new Promise(resolve => {
      const modal = document.createElement("div");
      modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.6);
        display:flex; align-items:center; justify-content:center; z-index:10000;
      `;
      modal.innerHTML = `
        <div style="background:#222; padding:30px; border-radius:10px; text-align:center; color:#fff; max-width:300px;">
          <p>Are you sure you want to delete this ${type}?</p>
          <div style="margin-top:20px;">
            <button id="confirmYes" style="margin-right:10px; padding:8px 16px; border:none; border-radius:5px; background:#4CAF50; color:#fff; cursor:pointer;">Yes</button>
            <button id="confirmNo" style="padding:8px 16px; border:none; border-radius:5px; background:#f44336; color:#fff; cursor:pointer;">No</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector("#confirmYes").onclick = () => {
        modal.remove();
        resolve(true);
      };
      modal.querySelector("#confirmNo").onclick = () => {
        modal.remove();
        resolve(false);
      };
    });
  }

});