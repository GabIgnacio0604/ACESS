document.addEventListener("DOMContentLoaded", async () => {
  const adviserSelect = document.getElementById("club-adviser-select");

  try {
    const response = await fetch("Php/get_teachers.php")
    const data = await response.json();

    if (data.error) {
      adviserSelect.innerHTML = `<option value="">${data.error}</option>`;
      return;
    }

    adviserSelect.innerHTML = '<option value="">Select Club Adviser</option>';
    data.forEach(teacher => {
      const option = document.createElement("option");
      option.value = teacher.id;
      option.textContent = teacher.name;
      adviserSelect.appendChild(option);
    });
    } catch (err) {
    console.error("Error loading teachers:", err);
    adviserSelect.innerHTML = '<option value="">Error loading advisers</option>';
  }
  });