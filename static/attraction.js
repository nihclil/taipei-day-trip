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

function buildFigureArea(processedData) {
  const photosBookingSection = document.querySelector(
    ".photos-booking-section"
  );
  const attractionInfos = document.querySelector(".attraction-infos");

  const figure = document.createElement("figure");
  figure.className = "attraction-photos";

  const carouselIndicators = document.createElement("div");
  carouselIndicators.className = "carousel-indicators";
  figure.appendChild(carouselIndicators);

  const imageDivs = [];
  const indicators = [];

  for (let i = 0; i < processedData.images.length; i++) {
    const imageDiv = document.createElement("div");
    imageDiv.className = "attraction-image";
    imageDiv.style.backgroundImage = `url(${processedData.images[i]})`;
    imageDiv.style.transform = `translateX(${i * 100}%)`;
    imageDivs.push(imageDiv);

    figure.appendChild(imageDiv);

    const indicator = document.createElement("div");
    indicator.className = "indicator";
    indicators.push(indicator);
    carouselIndicators.appendChild(indicator);
  }

  const leftArrow = document.createElement("button");
  leftArrow.className = "button left-arrow";
  const leftArrowImg = document.createElement("img");
  leftArrowImg.src = "/static/btn_leftArrow.png";
  leftArrow.appendChild(leftArrowImg);

  const rightArrow = document.createElement("button");
  rightArrow.className = "button right-arrow";
  const rightArrowImg = document.createElement("img");
  rightArrowImg.src = "/static/btn_rightArrow.png";
  rightArrow.appendChild(rightArrowImg);

  figure.appendChild(leftArrow);
  figure.appendChild(rightArrow);
  figure.appendChild(carouselIndicators);
  photosBookingSection.insertBefore(figure, attractionInfos);

  let curImage = 0;
  let maxImage = imageDivs.length - 1;

  function updateImage() {
    imageDivs.forEach((img, index) => {
      img.style.transform = `translateX(${100 * (index - curImage)}%  )`;
    });

    indicators.forEach((indicator) => {
      indicator.classList.remove("active");
    });
    indicators[curImage].classList.add("active");
  }

  rightArrow.addEventListener("click", function () {
    if (curImage < maxImage) {
      curImage++;
      updateImage();
    }
  });

  leftArrow.addEventListener("click", function () {
    if (curImage > 0) {
      curImage--;
      updateImage();
    }
  });

  indicators[0].classList.add("active");
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
