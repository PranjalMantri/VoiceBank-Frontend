"use-strict";

const learnMoreButton = document.querySelector("#learn-now--button");
const registerModal = document.querySelector("#register-modal");
const registerButton = document.querySelector("#register");
const loginModal = document.querySelector("#login-modal");
const loginButton = document.querySelector("#login");
const startTalking = document.querySelector("#start-talking");
const closeModalButton = document.querySelectorAll("#close-modal");
const errorModal = document.querySelector("#error-modal");
const learnMoreModal = document.querySelector("#learn-more-modal");
const services = document.querySelector("#services");
const about = document.querySelector("#about");
const use = document.querySelector("#use");
const home = document.querySelector("#nav");
const playAudioButton = document.querySelector("#play-audio");
const audio = new Audio("../../assets/Audio/learn more.mp3");

const speechRecognition =
  window.speechRecognition || window.webkitSpeechRecognition;

const recognition = new speechRecognition();
recognition.lang = "en";
recognition.interimResults = false;
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

function openLearnMoreModal() {
  learnMoreModal.classList.remove("hidden");
}

function closeLearnMoreModal() {
  learnMoreModal.classList.add("hidden");
  stopAudio();
}

function playAudio() {
  audio.play();
}

function pauseAudio() {
  audio.pause();
}

function stopAudio() {
  audio.pause();
  audio.currentTime = 0;
}

learnMoreButton.addEventListener("click", openLearnMoreModal);

closeModalButton.forEach((modal) => {
  modal.addEventListener("click", function () {
    closeRegisterModal();
    closeLearnMoreModal();
  });
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeRegisterModal();
  }
});

startTalking.addEventListener("click", function () {
  recognition.start();
});

registerModal.addEventListener("submit", function (e) {
  e.preventDefault();
});

playAudioButton.addEventListener("click", function () {
  audio.play();
});

let transcript = Array();
let fullName, username, email, password;
let action = "register";

recognition.onresult = (e) => {
  const transcriptText = e.results[e.resultIndex][0].transcript.trim();

  if (transcriptText.includes("register")) {
    showRegisterModal();
  } else if (transcriptText.toLowerCase().includes("login")) {
    action = "login";
    showLoginModal();
  } else if (transcriptText.toLowerCase().includes("learn more")) {
    openLearnMoreModal();
  } else if (transcriptText.toLowerCase().includes("home")) {
    scrollToHome();
  } else if (transcriptText.includes("services")) {
    scrollToServices();
  } else if (transcriptText.includes("about")) {
    scrollToAbout();
  } else if (transcriptText.toLowerCase().includes("how to use")) {
    scrollToUsage();
  } else if (transcriptText.toLowerCase().includes("play")) {
    playAudio();
  } else if (transcriptText.toLowerCase().includes("pause")) {
    pauseAudio();
  } else if (transcriptText.toLowerCase().includes("stop")) {
    stopAudio();
  } else if (transcriptText.toLowerCase().trim().includes("close")) {
    closeRegisterModal();
    closeLoginModal();
    closeErrorModal();
    closeLearnMoreModal();
  } else if (transcriptText.toLowerCase().includes("name")) {
    fullName = writeName(transcriptText);
  } else if (transcriptText.toLowerCase().includes("user")) {
    username = writeUsername(transcriptText);
  } else if (transcriptText.toLowerCase().includes("email")) {
    if (action === "login") {
      email = writeLoginEmail(transcriptText);
    } else {
      email = writeEmail(transcriptText);
    }
  } else if (transcriptText.toLowerCase().includes("password")) {
    if (action === "login") {
      password = writeLoginPassword(transcriptText);
    } else {
      password = writePassword(transcriptText);
    }
  } else if (transcriptText.toLowerCase().includes("submit")) {
    if (action === "register") {
      registerUser();
    } else if (action === "login") {
      loginUser();
    }
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
      loginUser();
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

const scrollToServices = function () {
  console.log("Scrolling to services");
  services.scrollIntoView({ behavior: "smooth" });
};

const scrollToAbout = function () {
  about.scrollIntoView({ behavior: "smooth" });
};

const scrollToUsage = function () {
  use.scrollIntoView({ behavior: "smooth" });
};

const scrollToHome = function () {
  home.scrollIntoView({ behavior: "smooth" });
};
