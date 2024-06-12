"use strict";

const speechRecognition =
  window.speechRecognition || window.webkitSpeechRecognition;

const recognition = new speechRecognition();
recognition.lang = "en";
recognition.interimResults = false;
recognition.continuous = true;

let accountType, pin;
const userId = localStorage.getItem("userId").replaceAll('"', "");
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

  return { accountNumber, balance, transactions };
};

const findUser = async function (userId) {
  const response = await fetch(`http://localhost:8000/api/v1/user/${userId}`, {
    credentials: "include",
  });

  const data = await response.json();

  username = data["data"].username;
};

const updateUserDetails = async function () {
  const { accountNumber, balance, username, transactions } =
    await findUserAccount(userId);

  console.log(transactions);

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
      if (type === "Deposit") {
        amountCell.classList.add("border", "px-4", "py-2", "text-green-600");
        amountCell.textContent = `₹${amount}`;
      } else {
        amountCell.classList.add("border", "px-4", "py-2", "text-red-600");
        amountCell.textContent = `-₹${amount}`;
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
  if (data.success) {
    const amount = data["data"].amount;
    const type = data["data"].type;
    const toAccount = data["data"].toAccount;
    const createdAt = data["data"].createdAt;

    return { amount, type, toAccount, createdAt };
  } else {
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
  const transcriptText = e.results[e.resultIndex][0].transcript.trim();

  if (transcriptText.includes("close")) {
    closeAccountModal();
  } // Input Name
  else if (transcriptText.includes("type")) {
    accountType = writeAccountType(transcriptText);
  } else if (transcriptText.includes("deposit")) {
    action = "deposit";
    showDepositModal();
  } else if (transcriptText.includes("withdraw")) {
    action = "withdraw";
    showWithdrawModal();
  } else if (transcriptText.includes("transfer")) {
    action = "transfer";
    showTransferModal();
  } else if (transcriptText.includes("amount")) {
    if (action === "deposit") {
      amount = writeDepositAmount(transcriptText);
    } else if (action === "withdraw") {
      amount = writeWithdrawAmount(transcriptText);
    } else if (action === "transfer") {
      amount = writeTransferAmount(transcriptText);
    }
  } else if (transcriptText.includes("pin")) {
    if (action === "account") {
      transactionPin = writeAccountPin(transcriptText);
    } else if (action === "deposit") {
      transactionPin = writeDepositPin(transcriptText);
    } else if (action === "withdraw") {
      transactionPin = writeWithdrawPin(transcriptText);
    } else if (action === "transfer") {
      transactionPin = writeTransferPin(transcriptText);
    }
  } else if (transcriptText.includes("receiver")) {
    transferAccount = writeTransferAccount(transcriptText);
  } else if (transcriptText.includes("close")) {
    closeAccountModal();
    closeDepositModal();
    closeErrorModal();
    closeWithdrawModal();
    closeTransferModal();
  } else if (transcriptText.includes("submit")) {
    if (action === "account") {
      createAccount();
    } else if (action === "deposit") {
      createDeposit();
    } else if (action === "withdraw") {
      createWithdrawal();
    } else if (action === "transfer") {
      createTransfer();
    }
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
  pin.value = pinValue;
  return pinValue;
};

const writeDepositPin = function (inputPin) {
  const pin = document.querySelector("#deposit-pin");
  const pinValue = inputPin.trim().replaceAll(" ", "").replaceAll("pin", "");
  pin.value = pinValue;
  return pinValue;
};

const writeWithdrawPin = function (inputPin) {
  const pin = document.querySelector("#withdraw-pin");
  const pinValue = inputPin.trim().replaceAll(" ", "").replaceAll("pin", "");
  pin.value = pinValue;
  return pinValue;
};

const writeTransferPin = function (inputPin) {
  const pin = document.querySelector("#transfer-pin");
  const pinValue = inputPin.trim().replaceAll(" ", "").replaceAll("pin", "");
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
  return amountValue;
};

const writeTransferAmount = function (inputAmount) {
  const amount = document.querySelector("#transfer-amount");
  const amountValue = inputAmount
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("amount", "");
  amount.value = amountValue;
  return amountValue;
};

const writeTransferAccount = function (inputAccount) {
  const account = document.querySelector("#transfer-to");
  const accountValue = inputAccount
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("receiver", "");
  account.value = accountValue;
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
  } catch (error) {}
  updateUserDetails();
};

const createDeposit = async function () {
  const transaction = {
    amount,
    pin: transactionPin,
  };

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

    if (data.success) {
      closeDepositModal();

      updateUserDetails();
    }
  } catch (error) {}
};

const createWithdrawal = async function () {
  const transaction = {
    amount,
    pin: transactionPin,
  };

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

    if (data.success) {
      closeWithdrawModal();
    }
  } catch (error) {
    showErrorModal();
  }
  updateUserDetails();
};

const createTransfer = async function () {
  const transaction = {
    amount,
    pin: transactionPin,
    toAccount: transferAccount,
  };

  const response = await fetch(
    "http://localhost:8000/api/v1/transaction/transfer",
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

    if (data.success) {
      closeTransferModal();
    }
  } catch (error) {
    console.log(error);
  }
  updateUserDetails();
};

window.onload = async function () {
  recognition.start();
  await findUserAccount(userId);
  await findUser(userId);
  updateUserDetails();
};
