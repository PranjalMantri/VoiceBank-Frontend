"use strict";

const speechRecognition =
  window.speechRecognition || window.webkitSpeechRecognition;

const recognition = new speechRecognition();
recognition.lang = "en";
recognition.interimResults = true;
recognition.continuous = true;

let transcript = Array();
let accountType, pin;
const userId = localStorage.getItem("userId").replaceAll(`"`, "");
const accountModal = document.querySelector("#account-modal");
const errorModal = document.querySelector("#error-modal");
const depositModal = document.querySelector("#deposit-modal");
const withdrawModal = document.querySelector("#withdraw-modal");
const transferModal = document.querySelector("#transfer-modal");

let accountNumber, balance, transactions, username;
let amount, transactionPin, transferAccount, action;

action = "Account";

const findUserAccount = async function (userId) {
  const response = await fetch(
    `http://localhost:8000/api/v1/user/a/${userId}`,
    {
      credentials: "include",
    }
  );

  const data = await response.json();
  if (data.success) {
    if (data["data"].length == 0) {
      showAccountModal();
    } else {
      accountNumber = data["data"][0].accountNumber;
      balance = data["data"][0].balance;
      transactions = data["data"][0].transactions;
    }
  }
};

const findUser = async function (userId) {
  const response = await fetch(`http://localhost:8000/api/v1/user/${userId}`, {
    credentials: "include",
  });

  const data = await response.json();

  username = data["data"].username;
};

const getUserDetails = function () {
  return { accountNumber, balance, username, transactions };
};

const updateUserDetails = function () {
  const { accountNumber, balance, username, transactions } = getUserDetails();

  if (transactions.length == 0) {
    const transactionTable = document.querySelector("#transaction-table");
    transactionTable.classList.add("hidden");

    const noTransactionMessage = document.querySelector("#no-transaction-msg");
    noTransactionMessage.classList.remove("hidden");
  }

  const displayAccountNumber = (document.querySelector(
    "#account-number"
  ).textContent = accountNumber);
  const displayBalance = (document.querySelector("#balance").textContent =
    balance);

  const displayUsername = (document.querySelector("#username").textContent =
    username);
};

function showErrorModal() {
  errorModal.classList.remove("hidden");
  closeAccountModal();
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

const showDepositModal = function () {
  closeWithdrawModal();
  closeTransferModal();
  depositModal.classList.remove("hidden");
};

const closeDepositModal = function () {
  depositModal.classList.add("hidden");
};

const showWithdrawModal = function () {
  closeDepositModal();
  closeTransferModal();
  withdrawModal.classList.remove("hidden");
};

const closeWithdrawModal = function () {
  withdrawModal.classList.add("hidden");
};

const showTransferModal = function () {
  closeWithdrawModal();
  closeDepositModal();
  transferModal.classList.remove("hidden");
};

const closeTransferModal = function () {
  transferModal.classList.add("hidden");
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
    } else if (e.results[i][0].transcript.trim().includes("deposit")) {
      action = "deposit";
      transcript = [];
      showDepositModal();
    } else if (e.results[i][0].transcript.trim().includes("withdraw")) {
      action = "withdraw";
      transcript = [];
      showWithdrawModal();
    } else if (e.results[i][0].transcript.trim().includes("transfer")) {
      action = "transfer";
      transcript = [];
      showTransferModal();
    } else if (e.results[i][0].transcript.trim().includes("amount")) {
      transcript = [];
      amount = writeAmount(e.results[i][0].transcript);
    } else if (e.results[i][0].transcript.trim().includes("pin")) {
      console.log("Pin was said");
      transcript = [];
      transactionPin = writePin(e.results[i][0].transcript);
    } else if (e.results[i][0].transcript.trim().includes("transfer account")) {
      transcript = [];
      transferAccount = writeTransferAccount(e.results[i][0].transcript);
    } else if (e.results[i][0].transcript.trim().includes("close")) {
      console.log("Close was said");
      transcript = [];
      closeAccountModal();
      closeDepositModal();
      closeErrorModal();
      closeWithdrawModal();
      closeTransferModal();
    } else if (e.results[i][0].transcript.trim().includes("submit")) {
      transcript = [];
      if (action === "Account") {
        debouncedCreateAccount();
      } else if (action === "deposit") {
        console.log("deposit");
      } else if (action === "withdraw") {
        console.log("withdraw");
      } else if (action === "transfer") {
        console.log("transfer");
      }
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
  console.log("Real", pinValue);
  console.log("Display", pin.value);
  transcript = [];
  pin.value = pinValue;
  return pinValue;
};

const writeAmount = function (inputAmount) {
  const amount = document.querySelector("#amount");
  const amountValue = inputAmount
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("amount", "");
  amount.value = amountValue;
  transcript = [];
  return amountValue;
};

const writeTransferAccount = function (inputAccount) {
  const account = document.querySelector("#trasnfer-to");
  const accountValue = inputAccount
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("transfer account", "");
  account.value = accountValue;
  transcript = [];
  return accountValue;
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
      accountNumber = data["data"].accountNumber;
      balance = data["data"].balance;
      transactions = data["data"].transactions;
      closeAccountModal();
    }
  } catch (error) {
    showErrorModal();
  }
  updateUserDetails();
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

window.onload = async function () {
  recognition.start();
  await findUserAccount(userId);
  await findUser(userId);
  updateUserDetails();
};
