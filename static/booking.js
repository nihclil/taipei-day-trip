//開啟/關閉登入視窗
const headerNavSignIn = document.querySelector(".header-nav__signin");
const modalSignIn = document.querySelector(".modal-signin");
const signInClose = document.querySelector(".signin__close");
const signUpPrompt = document.querySelector(".signup__prompt");

headerNavSignIn.addEventListener("click", showModalSignIn);

signInClose.addEventListener("click", hideModalSignIn);

signUpPrompt.addEventListener("click", function () {
  showModalSignIn(), hideModalSignUp();
});

window.addEventListener("click", function (event) {
  if (event.target === modalSignIn) {
    hideModalSignIn();
  }
});

function showModalSignIn() {
  modalSignIn.style.display = "block";
}

function hideModalSignIn() {
  modalSignIn.style.display = "none";
}

//登入表單
const signInForm = document.querySelector(".signin__form");
signInForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const email = document.querySelector(".signin__email").value;
  const password = document.querySelector(".signin__password").value;

  const data = await fetchSignIn(email, password);
  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.reload();
  } else {
    const message = data.message;
    displayMessage(message, ".signin__prompt");
  }
});

//查詢會員帳號密碼
async function fetchSignIn(email, password) {
  const response = await fetch(" http://127.0.0.1:3000/api/user/auth", {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ email: email, password: password }),
  });
  return response.json();
}

//展示訊息
function displayMessage(message, prompt) {
  const modalPrompt = document.querySelector(prompt);
  modalPrompt.textContent = message;
}

//開啟/關閉註冊視窗
const signInPrompt = document.querySelector(".signin__prompt");
const modalSignUp = document.querySelector(".modal-signup");
const signUpClose = document.querySelector(".signup__close");

signInPrompt.addEventListener("click", function () {
  showModalSignUp(), hideModalSignIn();
});

signUpClose.addEventListener("click", hideModalSignUp);

window.addEventListener("click", function (event) {
  if (event.target === modalSignUp) {
    hideModalSignUp();
  }
});

function showModalSignUp() {
  modalSignUp.style.display = "block";
}

function hideModalSignUp() {
  modalSignUp.style.display = "none";
}

//註冊表單
const signUpForm = document.querySelector(".signup__form");
signUpForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const name = document.querySelector(".signup__name").value;
  const email = document.querySelector(".signup__email").value;
  const password = document.querySelector(".signup__password").value;
  const data = await fetchSignUp(name, email, password);

  if (data.ok) {
    displayMessage("註冊成功", ".signup__prompt");
  } else {
    const message = data.message;
    displayMessage(message, ".signup__prompt");
  }
});

//查詢信箱是否重複
async function fetchSignUp(name, email, password) {
  const response = await fetch(" http://127.0.0.1:3000/api/user", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ name: name, email: email, password: password }),
  });
  return response.json();
}

//頁面出現時該處理的邏輯
document.addEventListener("DOMContentLoaded", async function () {
  const isLoggedIn = await checkLoginStatus();
  if (isLoggedIn) {
    displayActionButton();
    clickToLogOut();
    const bookingData = await fetchGetBooking();

    const user = await fetchUser();
    updateBookingUI(bookingData, user);
  } else {
    document.location.href = " http://127.0.0.1:3000/";
  }
});

//fetch 當前使用者資料
async function fetchUser() {
  const token = localStorage.getItem("token");
  const response = await fetch(" http://127.0.0.1:3000/api/user/auth", {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

//fetch 預定行程API
async function fetchGetBooking() {
  const token = localStorage.getItem("token");
  const response = await fetch(" http://127.0.0.1:3000/api/booking", {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
}

//更新booking介面
function updateBookingUI(data, user) {
  if (data !== null) {
    const userName = user.data.name;
    const headline = document.querySelector(".headline__content");
    headline.textContent = `您好，${userName}，待預定的行程如下：`;

    const title = data.data.attraction.name;
    const attractionTitle = document.querySelector(".attraction-detail__title");
    attractionTitle.textContent = `台北一日遊：${title}`;

    const date = data.data.date;
    const attractionDate = document.querySelector(".attraction-detail__date");
    attractionDate.textContent = date;

    const time = data.data.time;
    const attractionTime = document.querySelector(".attraction-detail__time");
    time === "morning"
      ? (attractionTime.textContent = "上半天")
      : (attractionTime.textContent = "下半天");

    const price = data.data.price;
    const attractionPrice = document.querySelector(".attraction-detail__price");
    attractionPrice.textContent = `新台幣 ${price} 元`;

    const address = data.data.attraction.address;
    const attractionAddress = document.querySelector(
      ".attraction-detail__address"
    );
    attractionAddress.textContent = address;

    const image = data.data.attraction.image;
    const attractionImage = document.querySelector(".attraction-image__img");
    attractionImage.src = image;
  } else {
    const userName = user.data.name;
    const headlineContent = document.querySelector(".headline__content");
    headlineContent.textContent = `您好，${userName}，待預定的行程如下：`;

    const headline = document.querySelector(".headline");
    headline.className = "headline--empty";

    const mainInfo = document.querySelector(".main-info");
    mainInfo.style.display = "none";

    const main = document.querySelector("main");

    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "目前沒有任何的預定行程";
    main.appendChild(emptyState);

    const footerWord = document.querySelector(".footer__word");
    footerWord.className = "footer__word--empty";

    const footer = document.querySelector("footer");
    footer.className = "footer--empty";
  }
}

//刪除預定按鈕
const deleteButton = document.querySelector(".attraction-detail__icon");
deleteButton.addEventListener("click", async function () {
  const data = await fetchDeleteBooking();
  if (data.ok) {
    location.reload();
  }
});

//fetch 刪除預定行程API
async function fetchDeleteBooking() {
  const token = localStorage.getItem("token");
  const response = await fetch(" http://127.0.0.1:3000/api/booking", {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

//按下登出按鈕
function clickToLogOut() {
  const actionButton = document.querySelector(".header-nav__signin");
  actionButton.addEventListener("click", function () {
    const isLogout = actionButton.textContent === "登出系統";
    if (isLogout) {
      logout();
      hideModalSignIn();
      hideModalSignUp();
      window.location.reload();
    }
  });
}

//清空Token
function logout() {
  localStorage.removeItem("token");
}

//確認token
async function checkLoginStatus() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  const response = await fetch(" http://127.0.0.1:3000/api/user/auth", {
    moethod: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data && data.data ? true : false;
}

//登入/登出文字呈現
function displayActionButton() {
  const actionButton = document.querySelector(".header-nav__signin");
  actionButton.textContent = "登出系統";
}

//預定行程文字連結處理;
const headerNavBooking = document.querySelector(".header-nav__booking");
headerNavBooking.addEventListener("click", async function () {
  const isLoggedIn = await checkLoginStatus();
  if (isLoggedIn) {
    document.location.href = "http://127.0.0.1:3000/booking";
  } else {
    showModalSignIn();
  }
});

TPDirect.setupSDK(
  137090,
  "app_3PdgcCqmukYmKUWvnRspySlULtA0jLMJNOBp9LlYxP7pRP4LPiBSWW2xIPxs",
  "sandbox"
);

TPDirect.card.setup({
  fields: {
    number: {
      element: "#card-number",
      placeholder: "**** **** **** ****",
    },
    expirationDate: {
      element: "#card-expiration-date",
      placeholder: "MM / YY",
    },
  },

  styles: {
    ".valid": {
      color: "green",
    },
    ".invalid": {
      color: "red",
    },
    input: {
      color: "#000000",
    },
  },
});

TPDirect.ccv.setup({
  fields: {
    ccv: {
      element: "#card-ccv",
      placeholder: "ccv",
    },
  },
  styles: {
    input: {
      color: "#000000",
    },
    ".valid": {
      color: "green",
    },
    ".invalid": {
      color: "red",
    },
  },
});

//金流設定
let ccvStatus = null;

TPDirect.ccv.onUpdate((update) => {
  ccvStatus = update;
  console.log(update);
});

const confirmButton = document.querySelector(".confirm__button");

function onSubmit(event) {
  event.preventDefault();

  // 取得 TapPay Fields 的 status
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();

  // 確認是否可以 getPrime
  if (!tappayStatus.canGetPrime || (ccvStatus && !ccvStatus.canGetPrime)) {
    alert("卡片資訊或CCV有誤，請再次檢查");
    return;
  }

  // Get prime
  TPDirect.card.getPrime((result) => {
    if (result.status !== 0) {
      alert("get prime error " + result.msg);
      return;
    }
    alert("get prime 成功，prime: " + result.card.prime);
  });
}

document.querySelector(".confirm__button").addEventListener("click", onSubmit);
