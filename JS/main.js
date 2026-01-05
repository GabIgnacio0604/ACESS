// Helper Functions
function togglePassword(passwordFieldId, buttonId) {
  const passwordField = document.getElementById(passwordFieldId);
  const toggleButton = document.getElementById(buttonId);
  if (passwordField && toggleButton) {
    const isPassword = passwordField.type === "password";
    passwordField.type = isPassword ? "text" : "password";
    toggleButton.textContent = isPassword ? "Hide" : "Show";
  }
}

function switchView(hideId, showId) {
  const hideEl = document.getElementById(hideId);
  const showEl = document.getElementById(showId);
  if (hideEl && showEl) {
    hideEl.style.display = "none";
    showEl.style.display = "block";
  }
}

// Main Logic
document.addEventListener("DOMContentLoaded", () => {
  // Toggle password visibility (Login)
  const loginToggleBtn = document.getElementById("toggleBtn");
  if (loginToggleBtn) {
    loginToggleBtn.addEventListener("click", () => {
      togglePassword("passwordField", "toggleBtn");
    });
  }
});

// Toggle password visibility (Signup)
const signupToggleBtn = document.getElementById("toggleBtn2");
if (signupToggleBtn) {
  signupToggleBtn.addEventListener("click", () => {
    togglePassword("Password2", "toggleBtn2");
  });
}

// Switch to Create Account form
const createAccountLink = document.getElementById("createAccountBox");
if (createAccountLink) {
  createAccountLink.addEventListener("click", (e) => {
    e.preventDefault();
    switchView("Login", "createAccountForm");
  });
}

// Switch to Forgot Password form
const forgotPasswordLink = document.getElementById("forgotPassword");
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    switchView("Login", "ForgotPassword");
  });
}

// Return to Login from Create Account
const returnToLoginBtn = document.getElementById("returnToLogin");
if (returnToLoginBtn) {
  returnToLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    switchView("createAccountForm", "Login");
  });
}

// Return to Login from Forgot Password
const returnToLoginFromForgotBtn = document.getElementById("returnToLoginFromForgot");
if (returnToLoginFromForgotBtn) {
  returnToLoginFromForgotBtn.addEventListener("click", (e) => {
    e.preventDefault();
    switchView("ForgotPassword", "Login");
  });
}

// Handle Login
const loginButton = document.getElementById("loginButton");
if (loginButton) {
  loginButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("passwordField").value.trim();
    const recaptchaResponse = typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : "";

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    if (typeof grecaptcha !== "undefined" && !recaptchaResponse) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    try {
      const response = await fetch("../Accounts/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptcha_token: recaptchaResponse }),
        credentials: "include"
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || "Login successful!");
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          alert("No redirect path found. Please contact admin.");
        }
      } else {
        alert(data.message || "Login failed.");
        if (typeof grecaptcha !== "undefined") grecaptcha.reset();
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
      if (typeof grecaptcha !== "undefined") grecaptcha.reset();
    }
  });
}

// Handle Signup
const createAccountButton = document.getElementById("createAccountButton");
if (createAccountButton) {
  createAccountButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signupEmail").value.trim();
    const fullname = document.getElementById("signupName").value.trim();
    const password = document.getElementById("Password2").value.trim();
    const lrn = document.getElementById("signupLRN").value.trim();
    const privacyChecked = document.getElementById("privacyCheckbox").checked;

    if (!email || !fullname || !password || !lrn) {
      alert("Please fill in all fields.");
      return;
    }

    if (!privacyChecked) {
      alert("You must agree to the Privacy Policy before creating an account.");
      return;
    }

    try {
      const response = await fetch("../Accounts/signup.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullname, password, lrn })
      });

      const data = await response.json();

      if (data.success) {
        alert("Account created. Please wait for admin validation.");
        switchView("createAccountForm", "validationScreen");
      } else {
        alert(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred during signup.");
    }
  });
}
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      const response = await fetch("../Accounts/logout.php", {
        method: "POST",
        credentials: "include"
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = "../login.html?ts=" + Date.now();
      } else {
        alert("Logout failed.");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  });
}

document.addEventListener("DOMContentLoaded", loadDashboard);

function loadDashboard() {
  fetch("../API/get_dashboard_data.php")
    .then(res => res.json())
    .then(data => {
      renderList("eventsList", data.events);
      renderList("announcementsList", data.announcements);
    })
    .catch(err => console.error("Failed to load dashboard:", err));
}

function renderList(id, items) {
  const list = document.getElementById(id);
  if (!list) return;

  list.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");

    // Determine button class based on list type
    const isEvent = id === "eventsList";
    const btnClass = isEvent ? "deleteEventBtn" : "deleteAnnouncementBtn";

    li.innerHTML = `
        <span>${formatDate(item.date)}</span> ${item.title}
      `;
    list.appendChild(li);
  });
}

function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}
