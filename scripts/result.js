const chosenContentWrap = document.getElementById('chosen-content-wrap');
const recommendationsWrap = document.getElementById('recommendations-wrap');

let dataCSV;

// let omdbApiKeyIndex = Math.floor(Math.random() * config.omdbApiKey.length);
console.log(omdbApiKeyIndex)

// function getNextOmdbApiKey() {
//   const key = config.omdbApiKey[omdbApiKeyIndex];
//   omdbApiKeyIndex = (omdbApiKeyIndex + 1) % config.omdbApiKey.length;
//   return key;
// }

function getYtApiKey() {
  const key = config.ytApiKey[Math.floor(Math.random() * config.ytApiKey.length)];
  return key.slice(0,1)+key.slice(2,-1);
}

document.addEventListener('DOMContentLoaded', () => {
  const chosenContent = JSON.parse(localStorage.getItem('chosenContent'));

  if (chosenContent) {
    displayContentDetails(chosenContent);
  } else {
    chosenContentWrap.innerHTML = '<p style="margin:auto;">No content selected. Please go back to the search page.</p>';
  }
});

function displayContentDetails(content) {
  // Create the movie details HTML with placeholder content
  const detailsHTML = `
    <div class="chosen-content-poster">
        <img src="assets/movie.svg" class="loading" style="filter: var(--invert);">
        <button id="add-to-favorites" class="fav-button clickable">Add to Favorites</button>
    </div>
    <div class="chosen-content-info">
      <h1>${content[2]}</h1>
      <p><b>Language:</b> ${content[3]}</p>
      <div id="additional-info">
        <p>Loading additional details...</p>
      </div>
    </div>
  `;

  chosenContentWrap.innerHTML = detailsHTML;

  const posterImg = chosenContentWrap.querySelector('.chosen-content-poster img');
  const additionalInfo = document.getElementById('additional-info');
  const addToFavoritesBtn = document.getElementById('add-to-favorites');

  // Check if the content is already in favorites
  // const isAlreadyFavorite = JSON.parse(localStorage.getItem('fav_movies'))?.some(fav => fav[0] === content[0]);

  // Add click event listener to the "Add to Favorites" button
  checkAndUpdateFavorites(content, addToFavoritesBtn);
  addToFavoritesBtn.addEventListener('click', () => addToFavorites(content, addToFavoritesBtn));


  // Fetch recommendations immediately
  getRecommendations(content[0]); //sending id and receiving ids from server

  // Lazy load movie details from OMDB API
  fetch(`https://www.omdbapi.com/?i=${content[1]}&apikey=${getNextOmdbApiKey()}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.Poster && data.Poster !== "N/A") {
        posterImg.src = data.Poster;
        posterImg.style.filter = "none";
      }
      posterImg.classList.remove("loading");
      
      // Update additional movie details
      additionalInfo.innerHTML = `
        <p><b>Release Date:</b> ${data.Released || content[4]}</p>
        <p><b>IMDB Rating:</b> ${data.imdbRating || ''}</p>
        <p><b>Runtime:</b> ${data.Runtime || ''}</p>
        <p><b>Director:</b> ${data.Director || ''}</p>
        <p><b>Actors:</b> ${data.Actors || ''}</p>
        <p><b>Genre:</b> ${data.Genre || ''}</p>
        <p><b>Plot:</b> ${data.Plot || ''}</p>
        <p><b>Search: </b> 
          <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(content[2]+' '+content[3]+' '+(data.Year || content[4])+ ' movie')}" target="_blank" style="color: inherit; text-decoration: underline;">Youtube</a> |
          <a href="https://www.google.com/search?q=${encodeURIComponent(content[2]+' '+content[3]+' '+(data.Year || content[4])+ ' movie')}" target="_blank" style="color: inherit; text-decoration: underline;">Google</a>
        </p>
      `;

      // Fetch trailer with the correct year
      fetchYouTubeTrailer(content[2], content[3], data.Year || content[4]);
    })
    .catch((error) => {
      console.error("Error fetching OMDB data:", error);
      additionalInfo.innerHTML = '<p>Error loading additional details.</p>';
    });
}

// Modify this function to handle adding content to favorites
function addToFavorites(content, button) {
  let favorites = JSON.parse(localStorage.getItem('fav_movies')) || [];
  
  // Check if the content is already in favorites
  // const isAlreadyFavorite = favorites.some(fav => fav.id === content.id);
  const isAlreadyFavorite = favorites.some(fav => fav[0] === content[0]);
  
  if (!isAlreadyFavorite) {
    favorites.push(content);
    localStorage.setItem('fav_movies', JSON.stringify(favorites));
    button.textContent = 'Added to Favorites';
    button.classList.add('fav-button-added');
  } else {
    // Remove the content from favorites
    // favorites = favorites.filter(fav => fav[0] !== content[0]);
    favorites.splice(favorites.findIndex(fav => fav[0] === content[0]), 1);
    localStorage.setItem('fav_movies', JSON.stringify(favorites));
    button.textContent = 'Add to Favorites';
    button.classList.remove('fav-button-added');
  }
}

function checkAndUpdateFavorites(content, button) {
  const favorites = JSON.parse(localStorage.getItem('fav_movies')) || [];
  const isAlreadyFavorite = favorites.some(fav => fav[0] === content[0]);
  button.textContent = isAlreadyFavorite ? 'Added to Favorites' : 'Add to Favorites';
  button.classList.toggle('fav-button-added', isAlreadyFavorite);

  // button.addEventListener('click', () => addToFavorites(content, button));
}



async function getRecommendations(movieId) {
  recommendationsWrap.innerHTML = '<h4 style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; grid-column: 1 / -1;">Loading...</h4>';
  try {
    const response = await fetch(config.backend, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ movie_id: movieId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const recommendedIds = data.recommended_movie_ids;
    displayRecommendations(recommendedIds);
    return recommendedIds;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}


function displayRecommendations(recommendedIds) {
  recommendationsWrap.innerHTML = "";

  if (recommendedIds.length === 0) {
    const noResultsMsg = document.createElement("div");
    noResultsMsg.className = "no-results-message";
    noResultsMsg.textContent = 'No recommendations found';
    recommendationsWrap.appendChild(noResultsMsg);
    return;
  }
  
  recommendedIds.forEach((id) => {
    const recommendedCard = document.createElement("div");
    recommendedCard.className = "recommended-card";

    // Create an image element for the movie poster
    const posterImg = document.createElement("img");
    // posterImg.className = "searched-results-poster loading";
    posterImg.className = "recommended-poster loading";

    posterImg.src = "assets/movie.svg"; // Set default image
    posterImg.style.filter = "var(--invert)";

    const detailsDiv = document.createElement("div");

    const movie = dataCSV.find(m => m.id === id);
    detailsDiv.textContent = movie.release_date + " | " + movie.language;
    detailsDiv.style.fontSize = "0.8em";


    fetch(`https://www.omdbapi.com/?i=${movie.imdb_id}&apikey=${getNextOmdbApiKey()}`)
    .then((response) => response.json())
      .then((data) => {
        posterImg.classList.remove("loading");
        if (data.Poster && data.Poster !== "N/A") {
          const img = new Image();
          img.onload = function () {
            posterImg.src = data.Poster;
            posterImg.style.filter = "none"; // Remove filter when actual poster is loaded
          };
          img.src = data.Poster;
          detailsDiv.textContent += " | ⭐" + data.imdbRating;
        }
      })
      .catch((error) => {
        console.error("Error fetching movie data:", error);
      });

    // Create a text container for title and IMDB ID
    const textContainer = document.createElement("div");
    textContainer.className = "searched-results-text";
    textContainer.textContent = movie.title;
    textContainer.appendChild(detailsDiv);

    // Append poster and text to the result item
    recommendedCard.appendChild(posterImg);
    recommendedCard.appendChild(textContainer);

    recommendationsWrap.appendChild(recommendedCard);

    // Add click event listener to each searched-results div
    recommendedCard.addEventListener('click', () => {
      // Store the clicked movie data in localStorage
      // localStorage.setItem('chosenContent', JSON.stringify(movie));
      localStorage.setItem('chosenContent', JSON.stringify([movie.id,movie.imdb_id,movie.title,movie.language,movie.release_date]));
      // Navigate to the result page
      window.location.href = 'result.html';
    });
  });
}



function fetchYouTubeTrailer(title, language, year) {
  const query = `${title} official trailer ${language} ${year}`;
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${getYtApiKey()}&type=video&maxResults=1`)
    .then(response => response.json())
    .then(data => {
      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        let movieTrailerDiv = document.getElementById('movie-trailer');
        if (!movieTrailerDiv) {
          movieTrailerDiv = document.createElement('div');
          movieTrailerDiv.id = 'movie-trailer';
          chosenContentWrap.insertAdjacentElement('afterend', movieTrailerDiv);
        }
        movieTrailerDiv.innerHTML = `
          <div class="trailer-container">
            <h2>Trailer</h2>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        `;
      } else {
        console.log('No trailer found');
      }
    })
    .catch(error => {
      console.error("Error fetching YouTube trailer:", error);
    });
}


fetch("search.csv")
  .then((response) => response.text())
  .then((csvText) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: function (results) {
        console.log("csv fetch complete");
        dataCSV = results.data; // Parsed CSV data
      },
    });
  })
  .catch((error) => console.error("Error loading CSV:", error));