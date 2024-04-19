"use strict";

const start = document.querySelector(".start");
const stop = document.querySelector(".stop");
const body = document.querySelector("body");

const speechRecognition =
  window.speechRecognition || window.webkitSpeechRecognition;

const recognition = new speechRecognition();
recognition.lang = "en";
recognition.interimResults = true;
recognition.continuous = true;

start.addEventListener("click", function () {
  recognition.start();
  console.log("recognition started");
});

let transcript = Array();
let fullName, username, email, password;

recognition.onresult = (e) => {
  for (let i = 0; i < e.results.length; i++) {
    transcript.push(e.results[i][0].transcript);
    // register
    if (e.results[i][0].transcript.includes("register")) {
      transcript = [];
      registerModal();
    } // Input Name
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
      registerUser();
    } else {
      transcript = [];
      // console.log("Cannot understand your command");
    }

    transcript.push(e.results[i][0].transcript);
  }
};

const registerModal = function () {
  const registerModal = document.querySelector(".register-modal");
  registerModal.style.opacity = 1;
  transcript = [];
};

const writeName = function (name) {
  const fullName = document.querySelector(".fullname");
  const nameValue = name.replace("name ", "").trim();
  fullName.value = nameValue;
  transcript = [];
  return nameValue;
};

const writeUsername = function (inputUsername) {
  const userName = document.querySelector(".username");
  const usernameValue = inputUsername.replace("user ", "");
  userName.value = usernameValue.trim().replaceAll(" ", "");
  transcript = [];
  return usernameValue;
};

const writeEmail = function (inputEmail) {
  const email = document.querySelector(".email");
  let emailValue = inputEmail.replace("email ", "");
  emailValue = emailValue.toLowerCase().trim().replaceAll(" ", "");
  email.value = emailValue;
  transcript = [];
  return emailValue;
};

const writePassword = function (inputPass) {
  const password = document.querySelector(".password");
  const passwordValue = inputPass.replace("password ", "");
  password.value = passwordValue.trim().replaceAll(" ", "");
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
  const response = await fetch("http://localhost:8000/api/v1/user/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  console.log("Response", response);
  const data = await response.json();
  console.log("Data", data);
};
