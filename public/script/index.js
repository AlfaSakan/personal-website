const itemsGrid = document.getElementsByClassName("item");
const aboutMe = document.getElementsByClassName("about-me")[0];
const gMaps = document.getElementsByClassName("location")[0];
const project1 = document.getElementsByClassName("project1")[0];
const project2 = document.getElementsByClassName("project2")[0];
const project3 = document.getElementsByClassName("project3")[0];
const twitter = document.getElementsByClassName("twitter")[0];
const linkedin = document.getElementsByClassName("linkedin")[0];
const cv = document.getElementsByClassName("cv")[0];
const theme = document.getElementsByClassName("theme")[0];
const contactMe = document.getElementsByClassName("contact-me")[0];
const toggleMemoji = document.querySelector(".toggle");

toggleMemoji.addEventListener("click", () => {
  document.querySelector(".memoji2").classList.toggle("invisible");
  document.querySelector(".memoji3").classList.toggle("invisible");
  const rotateIcon = document.querySelector(".rotate-icon");
  const currentRotation = parseInt(getComputedStyle(rotateIcon).getPropertyValue("--rotaion"));
  rotateIcon.style.setAttribute("--rotation", currentRotation + 180);
});

const alinks = document.querySelectorAll(".alink");

// alinks.forEach((alink) => {
//   alink.addEventListener("mouseover", () => {
//     alink.style.setProperty("border-radius", "10px");
//     alink.querySelector("span").removeAttribute("hidden");
//   });

//   alink.addEventListener("mouseout", () => {
//     alink.querySelector("span").setAttribute("hidden", "");
//     alink.style.setProperty("border-radius", "100%");
//   });
// });

const allSelector = () => {
  opacityFunction();
  aboutMe.style.gridColumnStart = 1;
  aboutMe.style.gridRowStart = 1;
  gMaps.style.gridColumnStart = 3;
  gMaps.style.gridRowStart = 1;
  project1.style.gridColumnStart = 4;
  project1.style.gridRowStart = 1;
  project2.style.gridColumnStart = 3;
  project2.style.gridRowStart = 2;
  project3.style.gridColumnStart = 1;
  project3.style.gridRowStart = 4;
  twitter.style.gridColumnStart = 2;
  twitter.style.gridRowStart = 2;
  linkedin.style.gridColumnStart = 1;
  linkedin.style.gridRowStart = 2;
  cv.style.gridColumnStart = 1;
  cv.style.gridRowStart = 3;
  theme.style.gridColumnStart = 4;
  theme.style.gridRowStart = 3;
  contactMe.style.gridColumnStart = 3;
  contactMe.style.gridRowStart = 4;
};

const aboutSelector = () => {
  opacityFunction();
  aboutMe.style.gridColumnStart = 1;
  aboutMe.style.gridRowStart = 1;
  gMaps.style.gridColumnStart = 3;
  gMaps.style.gridRowStart = 4;
  project1.style.gridColumnStart = 4;
  project1.style.gridRowStart = 2;
  project2.style.gridColumnStart = 3;
  project2.style.gridRowStart = 2;
  project3.style.gridColumnStart = 1;
  project3.style.gridRowStart = 3;
  twitter.style.gridColumnStart = 1;
  twitter.style.gridRowStart = 2;
  linkedin.style.gridColumnStart = 2;
  linkedin.style.gridRowStart = 2;
  cv.style.gridColumnStart = 3;
  cv.style.gridRowStart = 1;
  theme.style.gridColumnStart = 4;
  theme.style.gridRowStart = 4;
  contactMe.style.gridColumnStart = 1;
  contactMe.style.gridRowStart = 4;

  for (let i = 0; i < itemsGrid.length; i++) {
    if (!itemsGrid[i].contains(aboutMe) && !itemsGrid[i].contains(cv)) {
      itemsGrid[i].style.opacity = 0.3;
    }
  }
};

const projectsSelector = () => {
  opacityFunction();
  aboutMe.style.gridColumnStart = 1;
  aboutMe.style.gridRowStart = 4;
  gMaps.style.gridColumnStart = 3;
  gMaps.style.gridRowStart = 3;
  project1.style.gridColumnStart = 4;
  project1.style.gridRowStart = 1;
  project2.style.gridColumnStart = 3;
  project2.style.gridRowStart = 1;
  project3.style.gridColumnStart = 1;
  project3.style.gridRowStart = 1;
  twitter.style.gridColumnStart = 2;
  twitter.style.gridRowStart = 2;
  linkedin.style.gridColumnStart = 1;
  linkedin.style.gridRowStart = 2;
  cv.style.gridColumnStart = 1;
  cv.style.gridRowStart = 3;
  theme.style.gridColumnStart = 4;
  theme.style.gridRowStart = 3;
  contactMe.style.gridColumnStart = 3;
  contactMe.style.gridRowStart = 4;

  for (let i = 0; i < itemsGrid.length; i++) {
    if (!itemsGrid[i].contains(project1) && !itemsGrid[i].contains(project2) && !itemsGrid[i].contains(project3)) {
      itemsGrid[i].style.opacity = 0.3;
    }
  }
};

const contactSelector = () => {
  opacityFunction();

  aboutMe.style.gridColumnStart = 1;
  aboutMe.style.gridRowStart = 4;
  gMaps.style.gridColumnStart = 3;
  gMaps.style.gridRowStart = 4;
  project1.style.gridColumnStart = 4;
  project1.style.gridRowStart = 2;
  project2.style.gridColumnStart = 3;
  project2.style.gridRowStart = 2;
  project3.style.gridColumnStart = 1;
  project3.style.gridRowStart = 3;
  twitter.style.gridColumnStart = 4;
  twitter.style.gridRowStart = 1;
  linkedin.style.gridColumnStart = 3;
  linkedin.style.gridRowStart = 1;
  cv.style.gridColumnStart = 1;
  cv.style.gridRowStart = 2;
  theme.style.gridColumnStart = 4;
  theme.style.gridRowStart = 4;
  contactMe.style.gridColumnStart = 1;
  contactMe.style.gridRowStart = 1;

  for (let i = 0; i < itemsGrid.length; i++) {
    if (!itemsGrid[i].contains(contactMe) && !itemsGrid[i].contains(twitter) && !itemsGrid[i].contains(linkedin)) {
      itemsGrid[i].style.opacity = 0.3;
    }
  }
};

const opacityFunction = () => {
  for (let i = 0; i < itemsGrid.length; i++) {
    itemsGrid[i].style.opacity = 1;
  }
};

// *THEME JS
const sunMoonContainer = document.querySelector(".sun-moon-container");

document.querySelector(".theme-toggle-button").addEventListener("click", () => {
  document.querySelector("body").classList.toggle("dark");
  const currentRotation = parseInt(getComputedStyle(sunMoonContainer).getPropertyValue("--rotation"));
  sunMoonContainer.style.setProperty("--rotation", currentRotation + 180);
});
