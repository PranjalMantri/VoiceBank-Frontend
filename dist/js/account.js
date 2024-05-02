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

action = "account";

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

const updateUserDetails = async function () {
  const { accountNumber, balance, username, transactions } = getUserDetails();

  if (transactions.length == 0) {
    const transactionTable = document.querySelector("#transaction-table");
    transactionTable.classList.add("hidden");

    const noTransactionMessage = document.querySelector("#no-transaction-msg");
    noTransactionMessage.classList.remove("hidden");
  } else {
    const tableHeading = document.querySelector("#table-headings");
    tableHeading.classList.remove("hidden");

    const transactionTableBody = document.querySelector(
      "#transaction-table tbody"
    );
    transactionTableBody.innerHTML = "";

    for (const transaction of transactions) {
      const { amount, type, toAccount, createdAt } =
        await getTransactionDetails(transaction);

      const newRow = document.createElement("tr");

      const dateCell = document.createElement("td");
      dateCell.classList.add("border", "px-4", "py-2", "text-gray-700");
      const date = new Date(createdAt);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      dateCell.textContent = formattedDate;

      const typeCell = document.createElement("td");
      typeCell.classList.add("border", "px-4", "py-2", "text-gray-700");
      typeCell.textContent = type;

      const amountCell = document.createElement("td");
      if (type === "Withdrawl") {
        amountCell.classList.add("border", "px-4", "py-2", "text-red-600");
        amountCell.textContent = `-₹${amount}`;
      } else {
        amountCell.classList.add("border", "px-4", "py-2", "text-green-600");
        amountCell.textContent = `₹${amount}`;
      }

      // Append cells to the row
      newRow.appendChild(dateCell);
      newRow.appendChild(typeCell);
      newRow.appendChild(amountCell);

      // Append row to the table body
      transactionTableBody.appendChild(newRow);
    }
  }

  const displayAccountNumber = (document.querySelector(
    "#account-number"
  ).textContent = accountNumber);
  const displayBalance = (document.querySelector("#balance").textContent =
    balance);

  const displayUsername = (document.querySelector("#username").textContent =
    username);
};

const getTransactionDetails = async function (transcationId) {
  const response = await fetch(
    `http://localhost:8000/api/v1/transaction/${transcationId}`,
    {
      credentials: "include",
    }
  );

  const data = await response.json();
  console.log(data);
  if (data.success) {
    const amount = data["data"].amount;
    const type = data["data"].type;
    const toAccount = data["data"].toAccount;
    const createdAt = data["data"].createdAt;

    return { amount, type, toAccount, createdAt };
  } else {
    // accountNumber = data["data"][0].accountNumber;
    // balance = data["data"][0].balance;
    // transactions = data["data"][0].transactions;
  }
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
      if (action === "deposit") {
        amount = writeDepositAmount(e.results[i][0].transcript);
      } else if (action === "withdraw") {
        amount = writeWithdrawAmount(e.results[i][0].transcript);
      } else if (action === "transfer") {
        amount = writeTransferAmount(e.results[i][0].transcript);
      }
    } else if (e.results[i][0].transcript.trim().includes("pin")) {
      transcript = [];
      if (action === "account") {
        transactionPin = writeAccountPin(e.results[i][0].transcript);
      } else if (action === "deposit") {
        transactionPin = writeDepositPin(e.results[i][0].transcript);
      } else if (action === "withdraw") {
        transactionPin = writeWithdrawPin(e.results[i][0].transcript);
      } else if (action === "transfer") {
        transactionPin = writeTransferPin(e.results[i][0].transcript);
      }
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
      if (action === "account") {
        debouncedCreateAccount();
      } else if (action === "deposit") {
        console.log("deposit");
        debouncedCreateDeposit();
      } else if (action === "withdraw") {
        console.log("withdraw");
        debouncedCreateWithdrawal();
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

const writeAccountPin = function (inputPin) {
  const pin = document.querySelector("#account-pin");
  const pinValue = inputPin.trim().replaceAll(" ", "").replaceAll("pin", "");
  transcript = [];
  pin.value = pinValue;
  return pinValue;
};

const writeDepositPin = function (inputPin) {
  const pin = document.querySelector("#deposit-pin");
  const pinValue = inputPin.trim().replaceAll(" ", "").replaceAll("pin", "");
  transcript = [];
  pin.value = pinValue;
  return pinValue;
};

const writeWithdrawPin = function (inputPin) {
  const pin = document.querySelector("#withdraw-pin");
  const pinValue = inputPin.trim().replaceAll(" ", "").replaceAll("pin", "");
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

const writeDepositAmount = function (inputAmount) {
  const amount = document.querySelector("#deposit-amount");
  const amountValue = inputAmount
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("amount", "");
  amount.value = amountValue;
  transcript = [];
  return amountValue;
};

const writeWithdrawAmount = function (inputAmount) {
  const amount = document.querySelector("#withdraw-amount");
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
    pin: transactionPin,
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

const createDeposit = async function () {
  const transaction = {
    amount,
    pin: transactionPin,
  };

  console.log(transaction);
  const response = await fetch(
    "http://localhost:8000/api/v1/transaction/deposit",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
      credentials: "include",
    }
  );

  try {
    const data = await response.json();

    console.log(data);
    if (data.success) {
      console.log("Successfuly");
      closeDepositModal();
    }
  } catch (error) {
    showErrorModal();
  }
  updateUserDetails();
};

const createWithdrawal = async function () {
  const transaction = {
    amount,
    pin: transactionPin,
  };

  console.log(transaction);
  const response = await fetch(
    "http://localhost:8000/api/v1/transaction/withdrawl",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
      credentials: "include",
    }
  );

  try {
    const data = await response.json();

    console.log(data);
    if (data.success) {
      console.log("Successfuly");
      closeWithdrawModal();
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
const debouncedCreateDeposit = debounce(createDeposit, 2000);
const debouncedCreateWithdrawal = debounce(createWithdrawal, 2000);
const debouncedGetTransactionDetails = debounce(getTransactionDetails, 1000);

window.onload = async function () {
  recognition.start();
  await findUserAccount(userId);
  await findUser(userId);
  updateUserDetails();
};
