// Universal Sidebar Toggle Script
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  const menuToggle = document.querySelector('.menu-toggle');
  const mainContent = document.querySelector('.main-content');
  
  // Create overlay for mobile
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  // Create hamburger button if it doesn't exist
  if (!menuToggle && sidebar) {
    const hamburger = document.createElement('button');
    hamburger.className = 'menu-toggle';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    hamburger.setAttribute('aria-label', 'Toggle menu');
    document.body.appendChild(hamburger);
    
    // Attach event listener to new button
    attachToggleEvents(hamburger);
  } else if (menuToggle) {
    // Attach event listener to existing button
    attachToggleEvents(menuToggle);
  }

  function attachToggleEvents(toggleBtn) {
    // Toggle sidebar on button click
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      toggleBtn.classList.toggle('active');
      overlay.classList.toggle('active');
      
      // Prevent body scroll when sidebar is open on mobile
      if (window.innerWidth <= 768) {
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
      }
    });

    // Close sidebar when clicking overlay
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      toggleBtn.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Close sidebar when clicking a nav link on mobile
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('active');
          toggleBtn.classList.remove('active');
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
  }

  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) {
        // Desktop - always show sidebar
        sidebar.classList.remove('active');
        const toggle = document.querySelector('.menu-toggle');
        if (toggle) toggle.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        // Mobile - hide by default
        sidebar.classList.remove('active');
      }
    }, 250);
  });

  // Initialize based on screen size
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('active');
  }
});