$(document).ready(function () {
  $("#menu").click(function () {
    $(this).toggleClass("fa-times");
    $("header").toggleClass("toggle");
  });

  $(window).on("scroll load", function () {
    $("#menu").removeClass("fa-times");
    $("header").removeClass("toggle");

    if ($(window).scrollTop() > 0) {
      $(".top").show();
    } else {
      $(".top").hide();
    }
  });

  // smooth scrolling

  $('a[href*="#"]').on("click", function (e) {
    e.preventDefault();

    $("html, body").animate(
      {
        scrollTop: $($(this).attr("href")).offset().top,
      },
      500,
      "linear"
    );
  });
});
// chat bot
document.addEventListener("DOMContentLoaded", (event) => {
  const chatToggle = document.getElementById("chat-toggle");
  const sendButton = document.getElementById("send-btn");
  const userInputField = document.getElementById("user-input");
  const closeButton = document.getElementById("close-btn");

  chatToggle.addEventListener("click", () => {
    const chatbot = document.getElementById("chatbot");
    chatbot.style.display = chatbot.style.display === "none" ? "flex" : "none";
  });

  closeButton.addEventListener("click", () => {
    const chatbot = document.getElementById("chatbot");
    chatbot.style.display = "none";
  });

  sendButton.addEventListener("click", () => {
    handleUserInput();
  });

  userInputField.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleUserInput();
    }
  });

  function scrollToBottom() {
    const chatBody = document.getElementById("chat-body");
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addMessage(message, sender) {
    const chatMessages = document.getElementById("chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    scrollToBottom(); // Auto-scroll to bottom
  }

  function handleUserInput() {
    const userInput = userInputField.value.trim();
    if (userInput !== "") {
      addMessage(userInput, "user");
      userInputField.value = "";
      getBotResponse(userInput);
    }
  }

  function getBotResponse(userInput) {
    let botResponse = "Sorry, I don't understand that.";
    userInput = userInput.toLowerCase();

    const responses = {
      "hello|hi":
        "Hello! Im your virtual assistant. How can I help you to explore my portfolio?",
      "About|about":
        "I am Ramak! Creative PHP Developer | IT Officer | B.IT Student",
      "contact|email": "Feel free to contact me at ramakmaharjan@gmail.com.",
      "services|what can you do":
        "I offer website development, web design, and performance optimization services.",
      name: "I am Ramak!",
      "skills|expertise":
        "I am skilled in HTML, CSS, JavaScript, PHP, and Laravel. I also have experience with responsive design, version control with Git, and UI/UX principles.",
      "projects|work":
        "You can view my projects on my portfolio page. I have worked on several web applications, e-commerce sites, and interactive dashboards.",
      "experience|background":
        "A website developer, I am eager to apply my foundational skills in web development. A quick learner with a passion for crafting engaging user interfaces, I am seeking part-time Internship opportunities to gain real-world experience and contribute to innovative projects",
      "education|carrer":
        "I cleared of bachelor degree at ST,Xavier's College.",
      programming: "I am proficient in PHP programming languages.",
    };

    for (let pattern in responses) {
      let regex = new RegExp(pattern);
      if (regex.test(userInput)) {
        botResponse = responses[pattern];
        break;
      }
    }

    setTimeout(() => addMessage(botResponse, "bot"), 1000);
  }
});
