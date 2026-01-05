 document.addEventListener("DOMContentLoaded", () => {
    const chatWindow = document.querySelector(".chat-window");
    const questionButtons = document.querySelectorAll(".question-btn");

    const botReplies = {
      "How do I create an account?":
        "To create an account, go to the ACESS login page and click the Register button, then fill out the required details.",
      "How long does account approval take?":
        "Account approval usually takes 1–2 school days after verification by the admin.",
      "Who can I contact for technical support?":
        "You can contact the ACESS Admin directly or email at admin@gmail.com.",
      "What is ACESS?":
        "ACESS is an all-in-one school management platform for clubs, student council, and account management.",
      "What are clubs in ACESS?":
        "Clubs in ACESS are student organizations where you can join, participate in events, and manage memberships online.",
      "Tell me about the student council.":
        "The Student Council oversees school governance, events, and elections within ACESS.",
      "Can I get a contact number for the school office?":
        "You can reach the school office at 📞 (02) 1234-5678 during office hours (8:00 AM – 4:00 PM)."
    };

    function addMessage(text, sender) {
      const msg = document.createElement("div");
      msg.classList.add("message", sender);
      msg.textContent = text;
      chatWindow.appendChild(msg);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    questionButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const question = btn.textContent.trim();
        addMessage(question, "user");

        setTimeout(() => {
          addMessage(botReplies[question] || "I'm not sure about that 🤔", "bot");
        }, 600);
      });
    });
  });
