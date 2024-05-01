"use strict";

const speechRecognition =
  window.speechRecognition || window.webkitSpeechRecognition;

const recognition = new speechRecognition();
recognition.lang = "en";
recognition.interimResults = true;
recognition.continuous = true;

window.onload = async function () {
  recognition.start();
  await findUserAccount(userId);
  updateUserDetails();
};

let transcript = Array();
let accountType, pin;
const userId = localStorage.getItem("userId");
const accountModal = document.querySelector("#account-modal");
console.log(userId);

let accountNumber, balance, transactions;

const findUserAccount = async function (userId) {
  const response = await fetch(
    "http://localhost:8000/api/v1/user/a/6632943ac3c1220d2a8d649a",
    {
      credentials: "include",
    }
  );

  const data = await response.json();
  console.log(data["data"].length);
  if (data.success) {
    if (data["data"].length == 0) {
      console.log("User does not have any accounts");
      showAccountModal();
    } else {
      console.log("User has an account");
      accountNumber = data["data"][0].accountNumber;
      balance = data["data"][0].balance;
      transactions = data["data"][0].transactions;
    }
  }
};

const getUserDetails = function () {
  return { accountNumber, balance, transactions };
};

const updateUserDetails = function () {
  const { accountNumber, balance, transactions } = getUserDetails();

  const displayAccountNumber = (document.querySelector(
    "#account-number"
  ).textContent = accountNumber);
  const displayBalance = (document.querySelector("#balance").textContent =
    balance);
};

function showErrorModal() {
  errorModal.classList.remove("hidden");
  closeLoginModal();
  closeRegisterModal();
}

function closeErrorModal() {
  errorModal.classList.add("hidden");
}
const showAccountModal = function () {
  accountModal.classList.remove("hidden");
};

const closeAccountModal = function () {
  accountModal.classList.add("hidden");
};

recognition.onresult = (e) => {
  for (let i = 0; i < e.results.length; i++) {
    transcript.push(e.results[i][0].transcript);
    if (e.results[i][0].transcript.trim().includes("close")) {
      transcript = [];
      closeAccountModal();
    }
    // Input Name
    else if (e.results[i][0].transcript.trim().includes("type")) {
      transcript = [];
      accountType = writeAccountType(e.results[i][0].transcript);
    } // Input username
    else if (e.results[i][0].transcript.trim().includes("pin")) {
      transcript = [];
      pin = writePin(e.results[i][0].transcript).trim();
    } else if (e.results[i][0].transcript.trim().includes("submit")) {
      transcript = [];
      debouncedCreateAccount();
    }

    transcript.push(e.results[i][0].transcript);
  }
};

const writeAccountType = function (inputAccountType) {
  const accountType = document.querySelector("#account-type-select");
  inputAccountType = inputAccountType
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("type", "");

  if (inputAccountType === "salary") {
    accountType.value = "salary";
  } else if (inputAccountType === "savings") {
    accountType.value = "savings";
  } else if (inputAccountType === "current") {
    accountType.value = "current";
  }

  return accountType.value;
};

const writePin = function (inputPin) {
  const pin = document.querySelector("#pin");
  const pinValue = inputPin.trim().replaceAll(" ", "").replaceAll("pin", "");
  pin.value = pinValue;
  transcript = [];
  return pinValue;
};

const createAccount = async function () {
  const account = {
    accountType,
    pin,
  };

  const response = await fetch("http://localhost:8000/api/v1/account/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(account),
    credentials: "include",
  });

  try {
    const data = await response.json();

    if (data.success) {
      accountNumber = data["data"][0].accountNumber;
      balance = data["data"][0].balance;
      transactions = data["data"][0].transactions;
      updateUserDetails();
      closeAccountModal();
    }
  } catch (error) {
    showErrorModal();
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

const debouncedCreateAccount = debounce(createAccount, 2000);
