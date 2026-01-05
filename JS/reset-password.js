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

// ===== GET TOKEN FROM URL =====
function getTokenFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
}

// ===== RESET PASSWORD HANDLER =====
document.addEventListener("DOMContentLoaded", () => {
  const token = getTokenFromURL();

  // Check if token exists
  if (!token) {
    alert("Invalid or missing reset token. Please request a new password reset link.");
    window.location.href = "login.html";
    return;
  }

  // Real-time validation for new password
  const newPasswordField = document.getElementById("newPassword");
  const confirmNewPasswordField = document.getElementById("confirmNewPassword");

  if (newPasswordField) {
    newPasswordField.addEventListener("input", (e) => {
      const val = e.target.value;
      if (validatePassword(val)) {
        hideError("newPasswordError");
        markAsValid("newPassword");
      } else if (val.length > 0) {
        showError("newPasswordError", "Password must be 8–16 characters and include at least one letter, one number, and one special character");
      }
    });
  }

  if (confirmNewPasswordField) {
    confirmNewPasswordField.addEventListener("input", (e) => {
      if (newPasswordField.value === e.target.value) {
        hideError("confirmNewPasswordError");
        markAsValid("confirmNewPassword");
      } else if (e.target.value.length > 0) {
        showError("confirmNewPasswordError", "Passwords do not match");
      }
    });
  }

  // Reset Password Button Handler
  document.getElementById("resetPasswordBtn")?.addEventListener("click", async (e) => {
    e.preventDefault();

    const newPassword = newPasswordField.value.trim();
    const confirmNewPassword = confirmNewPasswordField.value.trim();

    hideError("newPasswordError");
    hideError("confirmNewPasswordError");

    let hasError = false;

    if (!validatePassword(newPassword)) {
      showError("newPasswordError", "Password must be 8-16 characters long and include at least one letter, one number, and one special character");
      hasError = true;
    }

    if (newPassword !== confirmNewPassword) {
      showError("confirmNewPasswordError", "Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await fetch("Accounts/process_reset_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: token,
          new_password: newPassword 
        })
      });

      const data = await response.json();

      if (data.success) {
        // Show success screen
        document.getElementById("ResetPassword").style.display = "none";
        document.getElementById("successScreen").style.display = "block";
      } else {
        alert(data.message || "Failed to reset password. The link may have expired.");
        if (data.expired) {
          setTimeout(() => {
            window.location.href = "login.html";
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Reset password error:", err);
      alert("An error occurred. Please try again later.");
    }
  });
});
