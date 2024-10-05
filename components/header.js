let userBoxVisible = false;
let toggleButtonImg;

async function loadHeader() {
  const response = await fetch("components/header.html");
  const headerHTML = await response.text();
  document.getElementById("header-wrap").innerHTML = headerHTML;

  setTheme()

  // Add event listener to close the user-box when clicking outside
  document.addEventListener("click", (event) => {
    const userBox = document.getElementById("user-box");
    const hamburger = document.querySelector(".header-hamberger");

    // If the user clicks outside of userBox and hamburger
    if (userBoxVisible && !userBox.contains(event.target) && !hamburger.contains(event.target)) {
      userBox.classList.add("hideUserBox");
      userBoxVisible = false;
    }
  });
}
// loads the header
setTimeout(loadHeader, 10);

function showAndHideUserBox() {
  const userBox = document.getElementById("user-box");
  if (userBoxVisible) {
    userBox.classList.add("hideUserBox");
    userBoxVisible = false;
  } else {
    userBox.classList.remove("hideUserBox");
    userBoxVisible = true;
  }
}

function setTheme() {
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  toggleButtonImg = document.getElementById("theme-toggle").querySelector('img');
  toggleButtonImg.src= "assets/" + currentTheme + "_mode.svg";
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || "dark";

  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  toggleButtonImg.src= "assets/" + newTheme + "_mode.svg";

  localStorage.setItem("theme", newTheme);
}
