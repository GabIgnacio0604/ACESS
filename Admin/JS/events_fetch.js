 document.addEventListener("DOMContentLoaded", async () => {
      const eventBox = document.getElementById("event-box");

      try {
        const response = await fetch("Php/get_events.php");

        const data = await response.json();
          
        if (data.error) {
          eventBox.innerHTML = `<p>${data.error}</p>`;
          return;
        }

        if (!Array.isArray(data) || data.length === 0) {
          eventBox.innerHTML = "<p>No events found.</p>";
          return;
        }

        eventBox.innerHTML = "";
        data.forEach(event => {
          const div = document.createElement("div");
          div.classList.add("event");
          div.innerHTML = `
            <span>${new Date(event.date).toDateString()}</span>
            <span>${event.title}</span>
          `;
          eventBox.appendChild(div);
        });
      } catch (err) {
        console.error("Error fetching events:", err);
        eventBox.innerHTML = "<p>Error loading events.</p>";
      }
    });