const toggleButton = document.getElementById("theme-toggle");

document.addEventListener("DOMContentLoaded", setTheme);

function setTheme() {
  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || "dark";
  // Set initial theme
//   document.documentElement.setAttribute("data-theme", currentTheme);

  // Toggle between light and dark themes
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);

  // Save the user's choice in localStorage
  localStorage.setItem("theme", newTheme);

  // Force a repaint to apply the background color
  document.body.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background');
}
