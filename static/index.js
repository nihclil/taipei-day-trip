//展現前十二筆資料
const attractionsUrl = "http://127.0.0.1:3000/api/attractions";
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
    `http://127.0.0.1:3000/api/attractions?page=0&keyword=${keywordValue}`
  ).then(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isFetching && nextPage !== null) {
          isFetching = true;
          keywordSearch(
            `http://127.0.0.1:3000/api/attractions?page=${nextPage}&keyword=${keywordValue}`
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

  const imgLink = document.createElement("a");
  imgLink.className = "attraction-link link-unstyled";
  imgLink.href = `http://127.0.0.1:3000/attraction/${attraction.id}`;

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
  const response = await fetch("http://127.0.0.1:3000/api/mrts");
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
        `http://127.0.0.1:3000/api/attractions?keyword=${stationName}`
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

headerNavSignIn.addEventListener("click", showModal);

const signInClose = document.querySelector(".signin__close");
signInClose.addEventListener("click", hideModal);

window.addEventListener("click", function (event) {
  if (event.target === modalSignIn) {
    hideModal();
  }
});

function showModal() {
  modalSignIn.style.display = "block";
}

function hideModal() {
  modalSignIn.style.display = "none";
}
