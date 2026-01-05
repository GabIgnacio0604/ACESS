//Topbar Hide When Scroll Down
document.addEventListener("DOMContentLoaded", () => {
  const topbar = document.querySelector(".topbar");
  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
      // Scrolling down → hide topbar
      topbar.style.transform = "translateY(-100%)";
    } else {
      // Scrolling up → show topbar
      topbar.style.transform = "translateY(0)";
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });
});

//SlideBar Click Darken
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".sidebar-nav a");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active")); 
      link.classList.add("active"); 
    });
  });
});