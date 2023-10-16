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
  const response = await fetch("http://34.225.182.0:3000/api/user/auth", {
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
  const response = await fetch("http://34.225.182.0:3000/api/user", {
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
    document.location.href = "http://34.225.182.0:3000/";
  }
});

//fetch 當前使用者資料
async function fetchUser() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://34.225.182.0:3000/api/user/auth", {
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
  const response = await fetch("http://34.225.182.0:3000/api/booking", {
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
    //main-info
    const mainInfo = document.querySelector(".main-info");
    //headline
    const headline = document.createElement("div");
    headline.className = "headline";
    const headlineContent = document.createElement("div");
    headlineContent.className = "headline__content";
    headlineContent.textContent = `您好，${userName}，待預定的行程如下：`;
    headline.appendChild(headlineContent);
    mainInfo.insertAdjacentElement("beforebegin", headline);

    const attractionInfo = document.createElement("section");
    attractionInfo.className = "attraction-info";
    mainInfo.insertAdjacentElement("afterbegin", attractionInfo);

    const attractionIcon = document.createElement("div");
    attractionIcon.className = "attraction-detail__icon";
    const attractionIconImg = document.createElement("img");
    attractionIconImg.src = "/static/booking/icon_delete.png";
    attractionIcon.appendChild(attractionIconImg);
    attractionInfo.appendChild(attractionIcon);

    const attractionImage = document.createElement("figure");
    attractionImage.className = "attraction-image";
    attractionInfo.appendChild(attractionImage);

    const attractionImg = document.createElement("img");
    attractionImg.className = "attraction-image__img";
    attractionImg.src = data.data.attraction.image;
    attractionImage.appendChild(attractionImg);

    const attractionDetail = document.createElement("div");
    attractionDetail.className = "attraction-detail";
    attractionImage.insertAdjacentElement("afterend", attractionDetail);

    const attractionTitle = document.createElement("p");
    attractionTitle.className = "attraction-detail__title";
    attractionDetail.insertAdjacentElement("afterbegin", attractionTitle);
    attractionTitle.textContent = data.data.attraction.name;

    const details = [
      { label: "日期", className: "attraction__date", content: data.data.date },
      { label: "時間", className: "attraction__time", content: data.data.time },
      {
        label: "費用",
        className: "attraction__price",
        content: data.data.price,
      },
      {
        label: "地點",
        className: "attraction__address",
        content: data.data.attraction.address,
      },
    ];

    details.forEach((detail) => {
      const attractionDetailContainer = document.createElement("p");
      attractionDetailContainer.classList.add("attraction-detail__container");

      const attractionLabel = document.createElement("span");
      attractionLabel.classList.add("attraction-detail__label");
      attractionLabel.textContent = `${detail.label}：`;

      const attractionLabelInfo = document.createElement("span");
      attractionLabelInfo.classList.add(
        "attraction-detail__info",
        detail.className
      );

      if (detail.className === "attraction__time") {
        attractionLabelInfo.textContent =
          detail.content === "morning" ? "上半天" : "下半天";
      } else {
        attractionLabelInfo.textContent = detail.content;
      }

      attractionDetailContainer.appendChild(attractionLabel);
      attractionLabel.insertAdjacentElement("afterend", attractionLabelInfo);
      attractionDetail.appendChild(attractionDetailContainer);
    });
  } else {
    const userName = user.data.name;
    //main-info
    const mainInfo = document.querySelector(".main-info");
    mainInfo.style.display = "none";
    //headline
    const headline = document.createElement("div");
    headline.className = "headline--empty";
    const headlineContent = document.createElement("div");
    headlineContent.className = "headline__content";
    headlineContent.textContent = `您好，${userName}，待預定的行程如下：`;
    headline.appendChild(headlineContent);
    mainInfo.insertAdjacentElement("beforebegin", headline);

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
document.body.addEventListener("click", async function (event) {
  if (event.target.closest(".attraction-detail__icon")) {
    const data = await fetchDeleteBooking();
    if (data.ok) {
      location.reload();
    }
  }
});

//fetch 刪除預定行程API
async function fetchDeleteBooking() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://34.225.182.0:3000/api/booking", {
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
  const response = await fetch("http://34.225.182.0:3000/api/user/auth", {
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
    document.location.href = "http://34.225.182.0:3000/booking";
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
});

//點擊確認付款按鍵
const confirmButton = document.querySelector(".confirm__button");
confirmButton.addEventListener("click", async function () {
  try {
    const prime = await purchaseButton();
    if (prime) {
      const bookingData = await fetchGetBooking();

      // 這裡進行表單驗證
      let name = document.querySelector("#name").value;
      let email = document.querySelector("#email").value;
      let phone = document.querySelector("#phone").value;

      if (!name || !email || !phone) {
        alert("請填寫所有必要的資訊");
        return;
      }

      const orderData = await fetchApiOrder(
        bookingData,
        prime,
        name,
        email,
        phone
      );

      if (orderData.data) {
        const number = orderData.data.number;
        window.location.href = `http://34.225.182.0:3000/thankyou?number=${number}`;
      }
    }
  } catch (error) {
    console.log("error:", error);
  }
});

async function purchaseButton() {
  // 取得 TapPay Fields 的 status
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();

  // 確認是否可以 getPrime
  if (!tappayStatus.canGetPrime || (ccvStatus && !ccvStatus.canGetPrime)) {
    alert("卡片資訊或CCV有誤，請再次檢查");
    return false;
  }

  return new Promise((resolve, reject) => {
    TPDirect.card.getPrime((result) => {
      if (result.status !== 0) {
        reject(false);
      }
      resolve(result.card.prime);
    });
  });
}

async function fetchApiOrder(bookingData, prime, name, email, phone) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://34.225.182.0:3000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      prime: prime,
      order: {
        price: bookingData.data.price,
        trip: {
          attraction: {
            id: bookingData.data.attraction.id,
            name: bookingData.data.attraction.name,
            address: bookingData.data.attraction.address,
            image: bookingData.data.attraction.image,
          },
          date: bookingData.data.date,
          time: bookingData.data.time,
        },
        contact: {
          name: name,
          email: email,
          phone: phone,
        },
      },
    }),
  });
  return await response.json();
}
