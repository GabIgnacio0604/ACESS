document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  const topbar = document.querySelector(".topbar");
  const toggleButton = document.getElementById("menu-toggle");

  toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("hidden-sidebar");
    toggleButton.classList.toggle("active");

    if (sidebar.classList.contains("hidden-sidebar")) {
      // Sidebar hidden
      mainContent.style.marginLeft = "0";
      topbar.style.left = "0";
    } else {
      // Sidebar visible
      mainContent.style.marginLeft = "250px";
      topbar.style.left = "250px";
    }
  });
});

// sidebar.js
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const topbar = document.querySelector(".topbar");
  const mainContent = document.querySelector(".main-content");

  if (!menuToggle || !sidebar || !topbar || !mainContent) return;

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    sidebar.classList.toggle("hidden");
    topbar.classList.toggle("sidebar-hidden");
    mainContent.classList.toggle("sidebar-hidden");
  });
});
