// ===== VALIDATION FUNCTIONS =====
function validateEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
}

function validateName(name, type = "regular") {
  const trimmed = name.trim();
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(trimmed)) return false;

  if (type === "regular") return trimmed.length >= 3;
  if (type === "middle") return trimmed.length > 0 && trimmed.length <= 2;

  return false;
}

function validatePassword(password) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,16}$/;
  return regex.test(password);
}

function validateLRN(lrn) {
  return /^\d{11}$/.test(lrn);
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.style.display = "block";
  const input = document.getElementById(id.replace("Error", ""));
  if (input) {
    input.classList.add("error");
    input.classList.remove("success");
  }
}

function hideError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = "none";
  const input = document.getElementById(id.replace("Error", ""));
  if (input) input.classList.remove("error");
}

function markAsValid(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("success");
    el.classList.remove("error");
  }
}

function switchView(hideId, showId) {
  document.getElementById(hideId).style.display = "none";
  document.getElementById(showId).style.display = "block";
}

// ===== REAL-TIME VALIDATION =====
document.addEventListener("DOMContentLoaded", () => {
  // LRN
  const lrnInput = document.getElementById("signupLRN");
  if (lrnInput) {
    lrnInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (validateLRN(e.target.value)) {
        hideError("lrnError");
        markAsValid("signupLRN");
      } else if (e.target.value.length > 0) {
        showError("lrnError", "LRN must be exactly 11 digits");
      }
    });
  }

  // Names
  ["signupFirstName", "signupLastName", "signupMiddleName"].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
        const value = e.target.value.trim();

        if (id === "signupMiddleName") {
          if (value && !validateName(value, "middle")) {
            showError("middleNameError", "Middle name must be 1 or 2 letters only");
          } else {
            hideError("middleNameError");
            markAsValid(id);
          }
        } else {
          if (!validateName(value, "regular")) {
            showError("nameError", "First and Last names must be at least 3 letters");
          } else {
            hideError("nameError");
            markAsValid(id);
          }
        }
      });
    }
  });

  // Email
  ["email", "signupEmail", "forgotEmail"].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener("blur", (e) => {
        const email = e.target.value.trim();
        const errorId = id === "email" ? "emailError" :
                        id === "signupEmail" ? "signupEmailError" :
                        "forgotEmailError";
        if (email && !validateEmail(email)) {
          showError(errorId, "Please enter a valid Gmail address");
        } else {
          hideError(errorId);
          markAsValid(id);
        }
      });
    }
  });

  // Password and Confirm Password
  const passwordField = document.getElementById("Password2");
  const confirmPasswordField = document.getElementById("confirmPassword");

  if (passwordField) {
    passwordField.addEventListener("input", (e) => {
      const val = e.target.value;
      if (validatePassword(val)) {
        hideError("passwordError");
        markAsValid("Password2");
      } else {
        showError("passwordError", "Password must be 8–16 characters and include at least one letter, one number, and one special character");
      }
    });
  }

  if (confirmPasswordField) {
    confirmPasswordField.addEventListener("input", (e) => {
      if (passwordField.value === e.target.value) {
        hideError("confirmPasswordError");
        markAsValid("confirmPassword");
      } else {
        showError("confirmPasswordError", "Passwords do not match");
      }
    });
  }
});
