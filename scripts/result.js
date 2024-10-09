const chosenContentWrap = document.getElementById('chosen-content-wrap');
const omdbApiKey = "ae6c583";
const youtubeApiKey = "AIzaSyAV6-iVSy3e4h_8mimjZxWe5YfOJa9nLi8"; // Replace with your actual YouTube API key

document.addEventListener('DOMContentLoaded', () => {
  const chosenContent = JSON.parse(localStorage.getItem('chosenContent'));

  if (chosenContent) {
    displayContentDetails(chosenContent);
  } else {
    chosenContentWrap.innerHTML = '<p>No content selected. Please go back to the search page.</p>';
  }
});

function displayContentDetails(content) {
  // Create the movie details HTML
  const detailsHTML = `
    <div class="chosen-content-poster">
        <img src="assets/movie.svg" class="loading" style="filter: var(--invert);">
    </div>
    <div class="chosen-content-info">
      <h1>${content.title}</h1>
      <p><b>Language:</b> ${content.language}</p>
      <div id="additional-info"></div>
      </div>
      `;
      // <p><b>Release Date:</b> ${content.release_date}</p>

  chosenContentWrap.innerHTML = detailsHTML;

  const posterImg = chosenContentWrap.querySelector('.chosen-content-poster img');
  const additionalInfo = document.getElementById('additional-info');

  // Fetch additional movie data from OMDB API
  fetch(`https://www.omdbapi.com/?i=${content.imdb_id}&apikey=${omdbApiKey}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.Poster && data.Poster !== "N/A") {
        posterImg.src = data.Poster;
        posterImg.style.filter = "none";
      }
      posterImg.classList.remove("loading");
      // Add more movie details
      additionalInfo.innerHTML = `
        <p><b>Release Date:</b> ${data.Released || ''}</p>
        <p><b>IMDB Rating:</b> ${data.imdbRating || ''}</p>
        <p><b>Runtime:</b> ${data.Runtime || ''}</p>
        <p><b>Director:</b> ${data.Director || ''}</p>
        <p><b>Actors:</b> ${data.Actors || ''}</p>
        <p><b>Genre:</b> ${data.Genre || ''}</p>
        <p><b>Plot:</b> ${data.Plot || ''}</p>
        <p><b>Search:</b> 
          <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(content.title+' '+content.language+' '+(data.Year || '')+ ' movie')}" target="_blank">Youtube</a> |
          <a href="https://www.google.com/search?q=${encodeURIComponent(content.title+' '+content.language+' '+(data.Year || '')+ ' movie')}" target="_blank">Google</a>
        </p>
      `;

      // Fetch trailer
      fetchYouTubeTrailer(content.title, content.language, data.Year || '');
    })
    .catch((error) => {
      console.error("Error fetching movie data:", error);
      additionalInfo.innerHTML = '<p>Error loading additional movie information.</p>';
    });
}

function fetchYouTubeTrailer(title, language, year) {
  const query = `${title} official trailer ${language} ${year}`;
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${youtubeApiKey}&type=video&maxResults=1`)
    .then(response => response.json())
    .then(data => {
      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        const movieTrailerDiv = document.createElement('div');
        movieTrailerDiv.id = 'movie-trailer';
        movieTrailerDiv.innerHTML = `
          <div class="trailer-container">
            <h2>Trailer</h2>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        `;
        chosenContentWrap.insertAdjacentElement('afterend', movieTrailerDiv);
      } else {
        console.log('No trailer found');
      }
    })
    .catch(error => {
      console.error("Error fetching YouTube trailer:", error);
    });
}
