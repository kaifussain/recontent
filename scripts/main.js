let userBoxVisible = false;
let toggleButtonImg;
let omdbApiKeyIndex = Math.floor(Math.random() * config.omdbApiKey.length);
console.log(omdbApiKeyIndex)

setTheme();

// Add event listener to close the user-box when clicking outside
document.addEventListener("click", (event) => {
  const userBox = document.getElementById("user-box");
  const hamburger = document.getElementById("header-menu");

  // If the user clicks outside of userBox and hamburger
  if (
    userBoxVisible &&
    !userBox.contains(event.target) &&
    !hamburger.contains(event.target)
  ) {
    userBox.classList.add("hideUserBox");
    userBoxVisible = false;
  }
});


function showAndHideUserBox() {
  const userBox = document.getElementById("user-box");
  if (userBoxVisible) {
    userBox.classList.add("hideUserBox");
    userBoxVisible = false;
  } else {
    userBox.classList.remove("hideUserBox");
    userBoxVisible = true;
    displayFavorites(); // Update favorites when showing the user-box
  }
}


function setTheme() {
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  toggleButtonImg = document.getElementById("theme-toggle");
  toggleButtonImg.src = "assets/" + currentTheme + "_mode.svg";
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || "dark";

  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  toggleButtonImg.src = "assets/" + newTheme + "_mode.svg";

  localStorage.setItem("theme", newTheme);
}

function displayFavorites() {
  const favoriteList = document.getElementById("favorite-list");
  const favorites = JSON.parse(localStorage.getItem('fav_movies')) || [];
  
  if (favorites.length === 0) {
    favoriteList.innerHTML = '<div>Empty!</div>';
    return;
  }

  let favoritesHTML = '';
  favorites.forEach((movie, index) => {
    favoritesHTML += `
      <div class="favorite-item">
        <img src="assets/movie.svg" class="favorite-poster loading" data-imdb-id="${movie[1]}" style="filter: var(--invert);">
        <div class="favorite-details">
          <div class="favorite-title">${movie[2]}</div>
          <div class="favorite-year">${movie[4]}</div>
        </div>
        <button class="delete-favorite" data-index="${index}">×</button>
      </div>
    `;
  });
  favoriteList.innerHTML = favoritesHTML;

  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-favorite').forEach(button => {
    button.addEventListener('click', deleteFavorite);
  });

  // Lazy load images
  setTimeout(() => {
    document.querySelectorAll('.favorite-poster').forEach(img => {
      const imdbId = img.dataset.imdbId;
      if (imdbId) {
        fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${getNextOmdbApiKey()}`)
          .then(response => response.json())
          .then(data => {
            img.classList.remove("loading");
            if (data.Poster && data.Poster !== "N/A") {
              img.src = data.Poster;
              img.style.filter = "none";
            }
          })
          .catch(error => console.error("Error fetching movie poster:", error));
      }
    });
  }, 100); // Small delay to ensure DOM is ready
}

function deleteFavorite(event) {
  event.stopPropagation();
  const index = event.target.dataset.index;
  const favorites = JSON.parse(localStorage.getItem('fav_movies')) || [];
  
  favorites.splice(index, 1);
  localStorage.setItem('fav_movies', JSON.stringify(favorites));
  
  displayFavorites(); // Refresh the favorites list
}
