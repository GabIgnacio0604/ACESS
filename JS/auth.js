// ===== PASSWORD VISIBILITY TOGGLE =====
document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".password-container .toggle-eye");
  toggles.forEach(toggle => {
    toggle.style.cursor = "pointer";
    toggle.addEventListener("click", () => {
      const container = toggle.closest(".password-container");
      const input = container.querySelector('input[type="password"], input[type="text"]');
      const icon = toggle.querySelector("i");

      if (!input || !icon) return;

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  });
});

// ===== AUTH AND FORM HANDLERS =====
document.addEventListener("DOMContentLoaded", () => {
  // Navigation between forms
  document.getElementById("createAccountBox")?.addEventListener("click", e => {
    e.preventDefault();
    switchView("Login", "createAccountForm");
  });

  document.getElementById("forgotPassword")?.addEventListener("click", e => {
    e.preventDefault();
    switchView("Login", "ForgotPassword");
  });

  document.getElementById("returnToLogin")?.addEventListener("click", e => {
    e.preventDefault();

    // Clear all inputs inside create account form
    const createForm = document.getElementById("createAccountForm");
    if (createForm) {
      const inputs = createForm.querySelectorAll("input");
      inputs.forEach(input => {
        if (input.type === "checkbox") {
          input.checked = false;
        } else {
          input.value = "";
        }
        input.classList.remove("error", "success");
      });

      // Hide any visible error messages
      const errors = createForm.querySelectorAll(".error-message");
      errors.forEach(err => (err.style.display = "none"));
    }

    // Switch back to login
    switchView("createAccountForm", "Login");
  });


  document.getElementById("returnToLoginFromForgot")?.addEventListener("click", e => {
    e.preventDefault();
    switchView("ForgotPassword", "Login");
  });

  // Login Handler
  document.getElementById("loginButton")?.addEventListener("click", async e => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("passwordField").value.trim();
    const recaptchaResponse = typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : "";

    hideError("emailError");

    if (!validateEmail(email)) {
      showError("emailError", "Please enter a valid Gmail address");
      return;
    }
    if (!password) {
      alert("Please enter your password.");
      return;
    }
    if (typeof grecaptcha !== "undefined" && !recaptchaResponse) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    try {
      const response = await fetch("Accounts/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptcha_token: recaptchaResponse }),
        credentials: "include"
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || "Login successful!");
        if (data.redirect) window.location.href = data.redirect;
      } else {
        alert(data.message || "Login failed.");
        if (typeof grecaptcha !== "undefined") grecaptcha.reset();
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred during login.");
      if (typeof grecaptcha !== "undefined") grecaptcha.reset();
    }
  });

  // Signup Handler
  document.getElementById("createAccountButton")?.addEventListener("click", async e => {
    e.preventDefault();

    const email = document.getElementById("signupEmail").value.trim();
    const firstName = document.getElementById("signupFirstName").value.trim();
    const lastName = document.getElementById("signupLastName").value.trim();
    const middleName = document.getElementById("signupMiddleName").value.trim();
    const password = document.getElementById("Password2").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const lrn = document.getElementById("signupLRN").value.trim();
    const privacyChecked = document.getElementById("privacyCheckbox").checked;

    hideError("signupEmailError");
    hideError("nameError");
    hideError("middleNameError");
    hideError("passwordError");
    hideError("confirmPasswordError");
    hideError("lrnError");

    let hasError = false;

    if (!validateEmail(email)) {
      showError("signupEmailError", "Please enter a valid Gmail address");
      hasError = true;
    }

    if (!validateName(firstName, "regular") || !validateName(lastName, "regular")) {
      showError("nameError", "First and Last names must be at least 3 letters long");
      hasError = true;
    }

    if (middleName && !validateName(middleName, "middle")) {
      showError("middleNameError", "Middle name must contain only 1 or 2 letters");
      hasError = true;
    }

    if (!validatePassword(password)) {
      showError("passwordError", "Password must be 8-16 characters long");
      hasError = true;
    }

    if (password !== confirmPassword) {
      showError("confirmPasswordError", "Passwords do not match");
      hasError = true;
    }

    if (!validateLRN(lrn)) {
      showError("lrnError", "LRN must be exactly 11 digits");
      hasError = true;
    }

    if (!privacyChecked) {
      alert("You must agree to the Privacy Policy before creating an account.");
      hasError = true;
    }

    if (hasError) return;

    const fullname = middleName
      ? `${firstName} ${middleName} ${lastName}`
      : `${firstName} ${lastName}`;

    try {
      const response = await fetch("Accounts/signup.php", {
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
    } catch (err) {
      console.error("Signup error:", err);
      alert("An error occurred during signup.");
    }
  });

  // Forgot Password
  document.getElementById("forgotPasswordBtn")?.addEventListener("click", async e => {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value.trim();

    hideError("forgotEmailError");

    if (!validateEmail(email)) {
      showError("forgotEmailError", "Please enter a valid Gmail address");
      return;
    }

    try {
      const response = await fetch("Accounts/forgot_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || "Password reset link sent to your email.");
        // Clear the email field
        document.getElementById("forgotEmail").value = "";
        // Return to login page
        switchView("ForgotPassword", "Login");
      } else {
        showError("forgotEmailError", data.message || "Failed to send reset email.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      showError("forgotEmailError", "An error occurred. Please try again later.");
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const privacyLink = document.getElementById("privacyLink");
  const privacyModal = document.getElementById("privacyModal");
  const closePrivacyModal = document.getElementById("closePrivacyModal");
  const confirmPrivacyBtn = document.getElementById("confirmPrivacyBtn");
  const privacyCheckbox = document.getElementById("privacyCheckbox");

  // Open modal when privacy link is clicked
  if (privacyLink && privacyModal) {
    privacyLink.addEventListener("click", (e) => {
      e.preventDefault();
      privacyModal.style.display = "block";
    });
  }

  // Close modal when clicking the × button
  if (closePrivacyModal && privacyModal) {
    closePrivacyModal.addEventListener("click", () => {
      privacyModal.style.display = "none";
    });
  }

  // Close modal when clicking outside of the modal content
  window.addEventListener("click", (event) => {
    if (event.target === privacyModal) {
      privacyModal.style.display = "none";
    }
  });

  // Confirm button → close modal + auto-check checkbox
  if (confirmPrivacyBtn && privacyCheckbox) {
    confirmPrivacyBtn.addEventListener("click", () => {
      privacyCheckbox.checked = true;
      privacyModal.style.display = "none";
    });
  }
});