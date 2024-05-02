"use-strict";

const experienceNowButton = document.querySelector("#experience-now--button");
const registerModal = document.querySelector("#register-modal");
const registerButton = document.querySelector("#register");
const loginModal = document.querySelector("#login-modal");
const loginButton = document.querySelector("#login");
const startTalking = document.querySelector("#start-talking");
const closeModalButton = document.querySelector("#close-modal");
const errorModal = document.querySelector("#error-modal");

const speechRecognition =
  window.speechRecognition || window.webkitSpeechRecognition;

const recognition = new speechRecognition();
recognition.lang = "en";
recognition.interimResults = true;
recognition.continuous = true;

function showRegisterModal() {
  registerModal.classList.remove("hidden");
  closeLoginModal();
}

function closeRegisterModal() {
  registerModal.classList.add("hidden");
}

function showErrorModal() {
  errorModal.classList.remove("hidden");
  closeLoginModal();
  closeRegisterModal();
}

function closeErrorModal() {
  errorModal.classList.add("hidden");
}

function showLoginModal() {
  loginModal.classList.remove("hidden");
  closeRegisterModal();
}

function closeLoginModal() {
  loginModal.classList.add("hidden");
}

closeModalButton.addEventListener("click", closeRegisterModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeRegisterModal();
  }
});

experienceNowButton.addEventListener("click", showRegisterModal);

startTalking.addEventListener("click", function () {
  recognition.start();
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
      showRegisterModal();
    } // login
    else if (e.results[i][0].transcript.includes("login")) {
      action = "login";
      transcript = [];
      showLoginModal();
    } else if (e.results[i][0].transcript.includes("experience now")) {
      transcript = [];
      showRegisterModal();
    } else if (e.results[i][0].transcript.trim().includes("close")) {
      transcript = [];
      closeRegisterModal();
      closeLoginModal();
      closeErrorModal();
    }
    // Input Name
    else if (e.results[i][0].transcript.trim().includes("name")) {
      transcript = [];
      fullName = writeName(e.results[i][0].transcript);
    } // Input username
    else if (e.results[i][0].transcript.trim().includes("user")) {
      console.log("User was said");
      transcript = [];
      username = writeUsername(e.results[i][0].transcript).trim();
    } // Input email
    else if (e.results[i][0].transcript.trim().includes("email")) {
      transcript = [];
      if (action === "login") {
        email = writeLoginEmail(e.results[i][0].transcript);
      } else {
        email = writeEmail(e.results[i][0].transcript);
      }
    } // Input password
    else if (e.results[i][0].transcript.trim().includes("password")) {
      transcript = [];
      if (action === "login") {
        password = writeLoginPassword(e.results[i][0].transcript);
      } else {
        password = writePassword(e.results[i][0].transcript).trim();
      }
    } // Register User
    else if (e.results[i][0].transcript.trim().includes("submit")) {
      transcript = [];
      if (action === "register") {
        debouncedRegisterUser();
      } else if (action === "login") {
        debouncedLoginUser();
      }
    } else {
      transcript = [];
    }

    transcript.push(e.results[i][0].transcript);
  }
};

function debounce(func, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const writeName = function (name) {
  const fullName = document.querySelector("#fullname");
  const nameValue = name.trim().replace("name", "");
  fullName.value = nameValue;
  transcript = [];
  return nameValue;
};

const writeUsername = function (inputUsername) {
  const userName = document.querySelector("#username");
  const usernameValue = inputUsername
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
  const emailValue = inputEmail
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
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

const writeLoginEmail = function (inputEmail) {
  const email = document.querySelector("#login-email");
  const emailValue = inputEmail
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("email", "");
  email.value = emailValue;
  transcript = [];
  return emailValue;
};

const writeLoginPassword = function (inputPass) {
  const password = document.querySelector("#login-password");
  const passwordValue = inputPass
    .trim()
    .replaceAll(" ", "")
    .replaceAll("password", "");
  password.value = passwordValue;
  transcript = [];
  return passwordValue;
};

const registerUser = async function () {
  const user = {
    fullName,
    username,
    email,
    password,
  };

  const response = await fetch("http://localhost:8000/api/v1/user/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
    credentials: "include",
  });

  try {
    const data = await response.json();
    if (data.success) {
      closeRegisterModal();
      debouncedLoginUser(loginUser, 1500);
    }
  } catch (error) {
    closeLoginModal();
    closeRegisterModal();
    showErrorModal();
  }
};

const loginUser = async function () {
  const user = {
    email,
    password,
  };

  const response = await fetch("http://localhost:8000/api/v1/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
    credentials: "include",
  });

  try {
    const data = await response.json();

    if (data.success) {
      const userId = data["data"]["user"]["_id"];
      localStorage.setItem("userId", JSON.stringify(userId));
      closeLoginModal();
      window.location.href = "./account.html";
    }
  } catch (error) {}
};

const debouncedLoginUser = debounce(loginUser, 2000);
const debouncedRegisterUser = debounce(registerUser, 2000);
