//展現前十二筆資料
const attractionsUrl = "http://34.225.182.0:3000/api/attractions";
let nextPage;
let observer;
let isFetching = false;
const footer = document.querySelector("footer");
const searchBtn = document.querySelector(".hero-section__button");
const attractions = document.querySelector(".attractions");

async function fetchAndPopulate(url) {
  const response = await fetch(url);
  const data = await response.json();

  data.data.forEach((attraction) => {
    const attractionEl = createAttractionElement(attraction);
    attractions.appendChild(attractionEl);
  });
  nextPage = data.nextPage;
}

fetchAndPopulate(attractionsUrl).then(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !isFetching && nextPage !== null) {
        isFetching = true;
        fetchAndPopulate(`${attractionsUrl}?page=${nextPage}`).then(
          () => (isFetching = false)
        );
      }
    });
  });
  observer.observe(footer);
});

//關鍵字搜尋功能
searchBtn.addEventListener("click", (event) => {
  event.preventDefault();
  if (observer) {
    observer.disconnect();
  }

  const keyword = document.querySelector("#keyword");
  const keywordValue = keyword.value;

  //清除現有子元素
  const attractions = document.querySelector(".attractions");
  const attractionsChildren = document.querySelectorAll(".attraction-link");
  attractionsChildren.forEach((child) => {
    attractions.removeChild(child);
  });

  keywordSearch(
    `http://34.225.182.0:3000/api/attractions?page=0&keyword=${keywordValue}`
  ).then(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isFetching && nextPage !== null) {
          isFetching = true;
          keywordSearch(
            `http://34.225.182.0:3000/api/attractions?page=${nextPage}&keyword=${keywordValue}`
          ).then(() => (isFetching = false));
        }
      });
    });
    observer.observe(footer);
  });
});

async function keywordSearch(keywordUrl) {
  const response = await fetch(keywordUrl);
  const data = await response.json();

  if (data.data.length == 0) {
    const attractionEl = document.createElement("div");
    attractionEl.textContent = "沒有結果";
    attractionEl.className = "attraction-card";
    attractions.appendChild(attractionEl);
  }
  data.data.forEach((attraction) => {
    const attractionEl = createAttractionElement(attraction);
    attractions.appendChild(attractionEl);
  });

  nextPage = data.nextPage;
}

function createAttractionElement(attraction) {
  const attractionItem = document.createElement("div");
  attractionItem.className = "attraction-card";

  const img = document.createElement("img");
  img.src = attraction.images[0];
  attractionItem.appendChild(img);
  img.className = "attraction-img";

  let images = document.querySelectorAll(".attraction-img");
  lazyload(images);

  const imgLink = document.createElement("a");
  imgLink.className = "attraction-link link-unstyled";
  imgLink.href = `http://34.225.182.0:3000/attraction/${attraction.id}`;

  const name = document.createElement("div");
  name.className = "attraction-card__name";
  name.textContent = attraction.name;
  attractionItem.appendChild(name);

  const mrtAndCategory = document.createElement("div");
  mrtAndCategory.className = "attraction-card__info";

  const mrt = document.createElement("div");
  mrt.className = "attraction-card__mrt";
  mrt.textContent = attraction.mrt;

  const category = document.createElement("div");
  category.className = "attraction-card__category";
  category.textContent = attraction.category;

  mrtAndCategory.appendChild(mrt);
  mrtAndCategory.appendChild(category);
  attractionItem.appendChild(mrtAndCategory);
  imgLink.appendChild(attractionItem);
  return imgLink;
}

const scrollList = document.querySelector(".station-list__container");
const leftArrow = document.querySelector(".left-arrow");
const rightArrow = document.querySelector(".right-arrow");

//取得捷運站資料
async function fetchMrts() {
  const response = await fetch("http://34.225.182.0:3000/api/mrts");
  const data = await response.json();

  data.data.forEach((mrt) => {
    const mrtEl = document.createElement("div");
    mrtEl.className = "station-list__name";
    mrtEl.textContent = mrt;
    scrollList.appendChild(mrtEl);
  });

  const mrtItems = document.querySelectorAll(".station-list__name");
  mrtItems.forEach((mrtItem) =>
    mrtItem.addEventListener("click", async () => {
      //斷開連結
      if (observer) {
        observer.disconnect();
      }
      //清除現有子元素
      const attractions = document.querySelector(".attractions");
      const attractionsChildren = document.querySelectorAll(".attraction-link");
      attractionsChildren.forEach((child) => {
        attractions.removeChild(child);
      });

      const searchBox = document.querySelector(".hero-section__input");
      searchBox.value = mrtItem.textContent;
      //利用捷運站名fetch
      const stationName = searchBox.value;
      const response = await fetch(
        `http://34.225.182.0:3000/api/attractions?keyword=${stationName}`
      );
      const data = await response.json();

      data.data.forEach((attraction) => {
        const attractionEl = createAttractionElement(attraction);
        attractions.appendChild(attractionEl);
      });
    })
  );
}

window.addEventListener("DOMContentLoaded", fetchMrts);

//控制按鈕
leftArrow.addEventListener("click", () => {
  scrollList.scrollTo({
    left: scrollList.scrollLeft - 300,
    behavior: "smooth",
  });
});

rightArrow.addEventListener("click", function () {
  scrollList.scrollTo({
    left: scrollList.scrollLeft + 300,
    behavior: "smooth",
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
