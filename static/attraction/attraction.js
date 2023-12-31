//取得景點編號

window.addEventListener("DOMContentLoaded", function () {
  const attractionId = getAttractionId();
  fetchApiUrl(`http://34.225.182.0:3000/api/attraction/${attractionId}`);
});

function getAttractionId() {
  const pathName = window.location.pathname;
  const pathSplit = pathName.split("/");
  const lastPart = pathSplit[pathSplit.length - 1];

  return lastPart;
}

async function fetchApiUrl(apiUrl) {
  const response = await fetch(apiUrl);
  const data = await response.json();
  const processedData = processItems(data);
  buildAttractionSection(processedData);
  buildFigureArea(processedData);
  buildAttractionDetails(processedData);
}

function processItems(data) {
  const address = data.data.address;
  const category = data.data.category;
  const description = data.data.description;
  const mrt = data.data.mrt;
  const name = data.data.name;
  const transport = data.data.transport;
  const images = data.data.images;
  return {
    address,
    category,
    description,
    mrt,
    name,
    transport,
    images,
  };
}

function buildAttractionSection(precessedData) {
  const photosBookingSection = document.querySelector(
    ".photos-booking-section"
  );
  const attractionInfos = document.querySelector(".attraction-infos");

  const bookingInfos = document.querySelector(".booking-infos");

  const name = document.createElement("p");
  name.className = "name";
  name.textContent = precessedData.name;

  const categoryMrt = document.createElement("p");
  categoryMrt.className = "category-mrt";
  categoryMrt.textContent = `${precessedData.category} at ${precessedData.mrt}`;

  attractionInfos.insertBefore(name, bookingInfos);
  attractionInfos.insertBefore(categoryMrt, bookingInfos);
}

const carouselButtons = document.querySelectorAll(".carousel__button");

carouselButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const offset = button.dataset.carouselButton === "next" ? 1 : -1;
    const slides = button
      .closest("[data-carousel]")
      .querySelector("[data-slides]");

    if (slides.children.length <= 1) {
      return;
    }

    const activeSlide = slides.querySelector("[data-active]");
    let newIndex = [...slides.children].indexOf(activeSlide) + offset;
    if (newIndex < 0) newIndex = slides.children.length - 1;
    if (newIndex >= slides.children.length) newIndex = 0;

    slides.children[newIndex].dataset.active = true;
    delete activeSlide.dataset.active;

    const indicators = document.querySelectorAll(".indicator");
    indicators.forEach((indicator) =>
      indicator.classList.remove("indicator--active")
    );
    indicators[newIndex].classList.add("indicator--active");
  });
});

function buildFigureArea(processedData) {
  const carouselUl = document.querySelector("[data-slides]");
  const attractionPhotos = document.querySelector(".attraction-photos");
  const carouselIndicators = document.createElement("div");
  carouselIndicators.className = "carousel__indicators";
  attractionPhotos.appendChild(carouselIndicators);

  const indicators = [];

  for (let i = 0; i < processedData.images.length; i++) {
    const carouselSlide = document.createElement("li");
    carouselSlide.className = "carousel__slide";
    i === 0 ? carouselSlide.setAttribute("data-active", "") : "";

    const carouselImage = document.createElement("img");
    carouselImage.className = "carousel__image";
    lazyload(carouselImage);

    carouselImage.src = processedData.images[i];

    carouselSlide.appendChild(carouselImage);
    carouselUl.appendChild(carouselSlide);

    const indicator = document.createElement("div");
    indicator.className = "indicator";
    i === 0 ? indicator.classList.add("indicator--active") : "";
    indicators.push(indicator);
    carouselIndicators.appendChild(indicator);
  }
}

function buildAttractionDetails(precessedData) {
  const attractionDetails = document.querySelector(".attraction-details");

  const attractionDescription = document.createElement("p");
  attractionDescription.className = "attraction-description";
  attractionDescription.textContent = precessedData.description;

  const attractionAddress = document.createElement("p");
  attractionAddress.className = "attraction-address";
  attractionAddress.textContent = "景點地址：";

  const attractionAddressDetails = document.createElement("p");
  attractionAddressDetails.className = "attraction-address-details";
  attractionAddressDetails.textContent = precessedData.address;

  const attractionTransport = document.createElement("p");
  attractionTransport.className = "attraction-transport";
  attractionTransport.textContent = "交通方式：";

  const attractionTransportDetails = document.createElement("p");
  attractionTransportDetails.className = "attraction-transport-details";
  attractionTransportDetails.textContent = precessedData.transport;

  attractionDetails.appendChild(attractionDescription);
  attractionDetails.appendChild(attractionAddress);
  attractionDetails.appendChild(attractionAddressDetails);
  attractionDetails.appendChild(attractionTransport);
  attractionDetails.appendChild(attractionTransportDetails);
}

//導覽時間
const radios = document.querySelectorAll('input[name="time"]');
const money = document.querySelector(".booking-money span");
radios.forEach((radio) => {
  radio.addEventListener("change", function () {
    radio.value === "morning"
      ? (money.textContent = "新台幣 2000 元")
      : (money.textContent = "新台幣 2500 元");
  });
});

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
  console.log(data);
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

//檢查會員登入流程
document.addEventListener("DOMContentLoaded", async function () {
  const isLoggedIn = await checkLoginStatus();
  if (isLoggedIn) displayActionButton();
  clickToLogOut();
});

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

//建立預定行程
const bookingButton = document.querySelector(".booking-button");
bookingButton.addEventListener("click", async function () {
  const date = document.querySelector(".date");

  if (await checkLoginStatus()) {
    if (!date.value) {
      alert("請輸入日期");
      return;
    }
    const token = localStorage.getItem("token");
    const response = await fetch("http://34.225.182.0:3000/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        attractionId: getAttractionId(),
        date: date.value,
        time: document.querySelector('input[name="time"]:checked').value,
        price:
          document.querySelector('input[name="time"]:checked').value ===
          "morning"
            ? 2000
            : 2500,
      }),
    });
    const data = await response.json();
    if (data.ok) document.location.href = "http://34.225.182.0:3000/booking";
  } else {
    showModalSignIn();
  }
});
