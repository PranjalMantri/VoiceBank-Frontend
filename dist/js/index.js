"use-strict";

const experienceNowButton = document.querySelector("#experience-now--button");
const registerModal = document.querySelector("#register-modal");
const registerButton = document.querySelector("#register");
const startTalking = document.querySelector("#start-talking");
const closeModalButton = document.querySelector("#close-modal");

const speechRecognition =
  window.speechRecognition || window.webkitSpeechRecognition;

const recognition = new speechRecognition();
recognition.lang = "en";
recognition.interimResults = true;
recognition.continuous = true;

function showRegisterModal() {
  console.log("Button clicked");
  registerModal.classList.remove("hidden");
}

function closeRegisterModal() {
  console.log("Closing the Modal");
  registerModal.classList.add("hidden");
}

closeModalButton.addEventListener("click", closeRegisterModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    console.log("Escape key pressed");
    closeRegisterModal();
  }
});

experienceNowButton.addEventListener("click", showRegisterModal);

startTalking.addEventListener("click", function () {
  recognition.start();
  console.log("Voice Recognition is on now you can start listening");
});

registerModal.addEventListener("submit", function (e) {
  e.preventDefault();
});

let transcript = Array();
let fullName, username, email, password;
let action = "register";

recognition.onresult = (e) => {
  for (let i = 0; i < e.results.length; i++) {
    transcript.push(e.results[i][0].transcript);
    // register
    if (e.results[i][0].transcript.includes("register")) {
      transcript = [];
      registerModal();
    } // login
    else if (e.results[i][0].transcript.includes("login")) {
      action = "login";
      transcript = [];
      loginModal();
    } else if (e.results[i][0].transcript.includes("experience now")) {
      transcript = [];
      showRegisterModal();
    } else if (e.results[i][0].transcript.trim().includes("close")) {
      console.log("close modal was said");
      transcript = [];
      closeRegisterModal();
    }
    // Input Name
    else if (e.results[i][0].transcript.trim().includes("name")) {
      transcript = [];
      fullName = writeName(e.results[i][0].transcript);
    } // Input username
    else if (e.results[i][0].transcript.trim().includes("user")) {
      transcript = [];
      username = writeUsername(e.results[i][0].transcript).trim();
    } // Input email
    else if (e.results[i][0].transcript.trim().includes("email")) {
      transcript = [];
      email = writeEmail(e.results[i][0].transcript);
    } // Input password
    else if (e.results[i][0].transcript.trim().includes("password")) {
      transcript = [];
      password = writePassword(e.results[i][0].transcript).trim();
    } // Register User
    else if (e.results[i][0].transcript.trim().includes("submit")) {
      transcript = [];
      if (action === "register") {
        registerUser();
      } else if (action === "login") {
        loginUser();
      }
    } else {
      transcript = [];
    }

    transcript.push(e.results[i][0].transcript);
  }
};

const writeName = function (name) {
  const fullName = document.querySelector("#fullname");
  const nameValue = name.trim().replace("name", "");
  fullName.value = nameValue;
  transcript = [];
  return nameValue;
};

const writeUsername = function (inputUsername) {
  const userName = document.querySelector("#username");
  let usernameValue = inputUsername
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("user", "");
  userName.value = usernameValue;
  transcript = [];
  return usernameValue;
};

const writeEmail = function (inputEmail) {
  const email = document.querySelector("#email");
  let emailValue = inputEmail
    .trim()
    .toLowerCase()
    .replace(" ", "")
    .replaceAll("email", "");
  email.value = emailValue;
  transcript = [];
  return emailValue;
};

const writePassword = function (inputPass) {
  const password = document.querySelector("#password");
  const passwordValue = inputPass
    .trim()
    .replaceAll(" ", "")
    .replaceAll("password", "");
  password.value = passwordValue;
  transcript = [];
  return passwordValue;
};

const registerUser = async function () {
  // console.log("Registering user");
  const user = {
    fullName,
    username,
    email,
    password,
  };

  console.log(user);
  // const response = await fetch("http://localhost:8000/api/v1/user/register", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(user),
  //   credentials: "include",
  // });

  // console.log("Data", data);
};
