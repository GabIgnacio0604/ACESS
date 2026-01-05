document.addEventListener('DOMContentLoaded', function () {
  // Get the reset button by its ID
  const resetButton = document.getElementById('resetPasswordBtn');

  resetButton.addEventListener('click', function () {
    // Get the admin ID (which admin's password to reset)
    const adminId = resetButton.getAttribute('data-admin-id');

    // Prompt the Super Admin to enter a new password
    const newPassword = prompt('Enter the new password:');

    if (newPassword) {
      // Send the new password and admin ID to the backend
      fetch('reset-password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: newPassword,
          adminId: adminId // Send the admin ID
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            alert('Password reset successful');
          } else {
            alert('Error: ' + data.message);
          }
        })
        .catch(error => {
          alert('An error occurred while resetting the password.');
          console.error(error);
        });
    } else {
      alert('Password cannot be empty');
    }
  });
});
