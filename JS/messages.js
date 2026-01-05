// 🌍 Global variables (shared everywhere in this script)
let selectedContact = null;
let currentUser = null;
let messageRefreshInterval = null;
let basePath = "../Admin/Php/";

document.addEventListener("DOMContentLoaded", async () => {
  const contactList = document.querySelector(".contact-list");
  const chatHeader = document.getElementById("chat-header");
  const chatMessages = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-btn");

  sendButton.disabled = true;
  messageInput.disabled = true;
  chatMessages.innerHTML =
    "<p style='color:#999;text-align:center;margin-top:20px;'>Select a contact to start chatting</p>";

  // 🔹 Detect which folder we’re in
  if (window.location.pathname.includes("/Teacher/")) basePath = "../Admin/Php/";
  else if (window.location.pathname.includes("/StudentCouncil/")) basePath = "../Admin/Php/";
  else if (window.location.pathname.includes("/Admin/")) basePath = "./Php/";

  // 🧠 Load logged-in user
  try {
    const response = await fetch(`${basePath}get_logged_user.php`);
    const data = await response.json();
    if (data.error) {
      alert("Please log in to access messages");
      window.location.href = "../login.html";
      return;
    }
    currentUser = data;
  } catch (err) {
    console.error("Failed to get user info:", err);
    alert("Error loading user information");
    return;
  }

  // 🧩 Load contacts
  async function loadContacts() {
    const res = await fetch(`${basePath}get_contacts.php`);
    const data = await res.json();

    contactList.innerHTML = "";
    data.contacts.forEach(contact => {
      const btn = document.createElement("button");
      btn.classList.add("contact");
      btn.innerHTML = `${contact.fullname}<br><small>${contact.type === "club" ? "Club" : contact.role}</small>`;

      btn.addEventListener("click", () => {
        document.querySelectorAll(".contact").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");

        // ✅ Update selected contact globally
        selectedContact = {
          id: contact.id || contact.contact_id,
          fullname: contact.fullname,
          role: contact.role,
          type: contact.type || "direct"
        };

        console.log("Selected contact:", selectedContact);

        chatHeader.textContent = `Chat with ${contact.fullname}`;
        messageInput.disabled = false;
        sendButton.disabled = false;
        loadMessages();

        if (messageRefreshInterval) clearInterval(messageRefreshInterval);
        messageRefreshInterval = setInterval(loadMessages, 3000);
      });

      contactList.appendChild(btn);
    });
  }

  async function loadMessages() {
    if (!selectedContact) return;
    const res = await fetch(`${basePath}get_conversation.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_id: selectedContact.id,
        type: selectedContact.type
      })
    });

    const data = await res.json();
    if (data.success) {
      chatMessages.innerHTML = "";
      data.messages.forEach(msg => {
        const div = document.createElement("div");
        div.classList.add("message", msg.is_own ? "outgoing" : "incoming");
        div.innerHTML = msg.message;
        chatMessages.appendChild(div);
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  async function sendMessage() {
    console.log("Sending message to:", selectedContact);
    if (!selectedContact || !selectedContact.id) {
      alert("Please select a contact first");
      return;
    }

    const message = messageInput.value.trim();
    if (!message) return;

    const res = await fetch(`${basePath}send_message_new.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_id: selectedContact.id,
        type: selectedContact.type,
        message
      })
    });

    const data = await res.json();
    if (data.success) {
      messageInput.value = "";
      loadMessages();
    } else {
      alert("Failed to send message: " + data.message);
    }
  }

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  loadContacts();
});
