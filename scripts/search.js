const contentSuggestions = [
  "English",
  "Hindi",
  "Bengali",
  "Urdu",
  "Telugu",
  "Marathi",
  "Horror",
  "Adventure",
  "Comedy",
  "Romance",
  "Drama",
  "Action",
  "Fantasy",
  "Thriller",
  "Mystery",
  "Animation",
  "Documentary",
  "Biography",
  "History",
  "Western",
  "Crime"
];

let selectedSuggestion;
const suggestionWrap = document.getElementById("suggestions");
let searchResultShown = false;

const searchBarWrap = document.getElementById("search-bar-wrap");
const input = searchBarWrap.querySelector("#search-bar");
const searchTermResults = searchBarWrap.querySelector("#searchTerm-results-wrap");
const searchBtn = searchBarWrap.querySelector("#search-btn");

let noResultSearched = false;

let data;

// Add this list at the top of your file or in a separate configuration file
const famousPersons = [
  // Indian actors
  'amitabh bachchan', 'shah rukh khan', 'aamir khan', 'salman khan', 'deepika padukone',
  'priyanka chopra', 'rajinikanth', 'kamal haasan', 'mohanlal', 'mammootty',
  'akshay kumar', 'hrithik roshan', 'ranbir kapoor', 'ranveer singh', 'katrina kaif',
  'alia bhatt', 'madhuri dixit', 'aishwarya rai', 'kajol', 'kareena kapoor',

  // Indian directors
  'satyajit ray', 'raj kapoor', 'yash chopra', 'sanjay leela bhansali', 'anurag kashyap',
  'mani ratnam', 'ss rajamouli', 'karan johar', 'rohit shetty', 'imtiaz ali',

  // Global actors
  'tom cruise', 'leonardo dicaprio', 'meryl streep', 'robert de niro', 'al pacino',
  'brad pitt', 'angelina jolie', 'johnny depp', 'will smith', 'tom hanks',

  // Global directors
  'steven spielberg', 'martin scorsese', 'christopher nolan', 'quentin tarantino',
  'james cameron', 'alfred hitchcock', 'stanley kubrick'
];


let currentApiKeyIndex = Math.floor(Math.random() * config.omdbApiKey.length);

function getNextApiKey() {
  const key = config.omdbApiKey[currentApiKeyIndex];
  currentApiKeyIndex = (currentApiKeyIndex + 1) % config.omdbApiKey.length;
  return key;
}


fetch("search.csv")
  .then((response) => response.text())
  .then((csvText) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: function (results) {
        console.log("fetch complete");
        data = results.data; // Parsed CSV data
        displaySearchedResults(searchCSV(selectedSuggestion.trim().toLowerCase()));
      },
    });
  })
  .catch((error) => console.error("Error loading CSV:", error));

// Function to populate suggestion items
function populateSuggestions() {
  console.log("populateSuggestions called");
  suggestionWrap.innerHTML = ""; // Clear existing suggestions

  // Select a random index
  const randomIndex = Math.floor(Math.random() * contentSuggestions.length);
  selectedSuggestion = contentSuggestions[randomIndex];

  // Create suggestion items
  contentSuggestions.forEach((suggestion, index) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.className = "suggestion-item";
    suggestionItem.textContent = suggestion;

    if (index === randomIndex) {
      suggestionItem.classList.add("selectedSuggestion");
    }

    suggestionItem.addEventListener("click", () =>
      selectSuggestion(suggestionItem)
    );

    suggestionWrap.appendChild(suggestionItem);
  });

  // Move the selected suggestion to the beginning
  suggestionWrap.insertBefore(
    suggestionWrap.children[randomIndex],
    suggestionWrap.firstChild
  );
}
populateSuggestions();

function selectSuggestion(clickedItem) {
  console.log("selectSuggestion called");
  const allSuggestions = suggestionWrap.querySelectorAll(".suggestion-item");
  allSuggestions.forEach((item) => item.classList.remove("selectedSuggestion"));
  clickedItem.classList.add("selectedSuggestion");
  selectedSuggestion = clickedItem.textContent;

  displaySearchedResults(searchCSV(selectedSuggestion.trim().toLowerCase()));
}



//code for search functionality

function levenshtein(a, b) {
  const matrix = [];

  // Create the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Populate the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]; // No operation
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substitution
          Math.min(matrix[i][j - 1] + 1, // Insertion
                     matrix[i - 1][j] + 1) // Deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function searchCSV(searchValue) {
  const normalizedSearchValue = searchValue.trim().toLowerCase();
  
  // Check if the search value is a language
  const isLanguageSearch = ['english', 'hindi', 'bengali', 'punjabi', 'malayalam', 'telugu', 'kannada', 'marathi', 'tamil', 'urdu', 'italian', 'french', 'spanish', 'german', 'russian', 'japanese', 'korean', 'chinese', 'turkish', 'arabic', 'romanian', 'indonesian'].includes(normalizedSearchValue);
  
  // Check if the search value is a genre
  const isGenreSearch = ['adventure', 'comedy', 'romance', 'action', 'drama', 'horror', 'thriller', 'sci-fi', 'fantasy', 'mystery', 'animation', 'documentary', 'biography', 'crime'].includes(normalizedSearchValue);
  
  // Check if the search value is a famous person
  const isPersonSearch = famousPersons.includes(normalizedSearchValue);

  if (isLanguageSearch) {
    // If it's a language search, filter by language
    return data
      .filter(row => (row.language || '').toLowerCase() === normalizedSearchValue)
      .slice(0, 24);
  }

  if (isGenreSearch || isPersonSearch) {
    // If it's a genre search or person search, prioritize matching tags
    return data
      .filter(row => {
        const tags = (typeof row.tags === "string" ? row.tags : "").toLowerCase();
        return tags.includes(normalizedSearchValue);
      })
      .slice(0, 24);
  }

  // For all other searches (primarily movie titles)
  const searchTerms = normalizedSearchValue.split(/\s+/);

  const categorizeMatch = (row) => {
    const title = (typeof row.title === "string" ? row.title : "").toLowerCase();
    const tags = (typeof row.tags === "string" ? row.tags : "").toLowerCase();

    if (title === normalizedSearchValue) return 1;
    if (title.startsWith(normalizedSearchValue)) return 2;
    if (title.length > 3 && Math.abs(title.length - normalizedSearchValue.length) <= 3) {
      if (levenshtein(title, normalizedSearchValue) <= 2) return 3;
    }
    if (searchTerms.every(term => title.includes(term))) return 4;
    if (searchTerms.some(term => title.includes(term))) return 5;
    if (searchTerms.some(term => tags.includes(term))) return 6;
    return 0;
  };

  return data
    .map(row => ({ row, category: categorizeMatch(row) }))
    .filter(item => item.category > 0)
    .sort((a, b) => a.category - b.category)
    .map(item => item.row)
    .slice(0, 24);
}


function displaySearchResults(results) {
  console.log("displaySearchResults called");
  searchTermResults.innerHTML = ""; // Clear previous results
  if (results.length === 0) {
    const noResultsMsg = document.createElement("div");
    noResultsMsg.className = "no-results-message";
    noResultsMsg.textContent = `No movie found with the term "${input.value}"`;
    searchTermResults.appendChild(noResultsMsg);
    showSearchResults();
    return;
  }
  results.forEach((row) => {
    const resultItem = document.createElement("div");
    resultItem.className = "searchTerm-result";

    // Create an image element for the movie poster
    const posterImg = document.createElement("img");
    posterImg.className = "searchTerm-result-poster loading";
    posterImg.src = "assets/movie.svg"; // Replace with your default poster path

    posterImg.style.filter = "var(--invert)";

    fetch(`https://www.omdbapi.com/?i=${row.imdb_id}&apikey=${getNextApiKey()}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.Poster && data.Poster !== "N/A") {
          posterImg.src = data.Poster;
          posterImg.style.filter = "none";
        } else {
          //when no poster is found
        }
        posterImg.classList.remove("loading");
      })
      .catch((error) => {
        console.error("Error fetching movie data:", error);
      });

    // Create a text container for title and IMDB ID
    const textContainer = document.createElement("div");
    textContainer.className = "searchTerm-result-text";
    textContainer.textContent = row.title;
    // Create a div for the release date

    const dateDiv = document.createElement("div");
    dateDiv.textContent = row.release_date;
    dateDiv.style.fontSize = "0.8em";
    // Append the date div to the text container
    textContainer.appendChild(dateDiv);

    // Append poster and text to the result item
    resultItem.appendChild(posterImg);
    resultItem.appendChild(textContainer);

    searchTermResults.appendChild(resultItem);
     // Add click event listener to each searched-results div
     resultItem.addEventListener('click', () => {
      // Store the clicked movie data in localStorage
      localStorage.setItem('chosenContent', JSON.stringify(row));
      // Navigate to the result page
      window.location.href = 'result.html';
    });
  });
  showSearchResults();
}

function showSearchResults() {
  searchTermResults.style.display = "block";
  searchResultShown = true;
}

function hideSearchResults() {
  searchTermResults.style.display = "none";
  searchResultShown = false;
}

function displaySearchedResults(results) {
  console.log("displaySearchedResults called");
  const searchedResultsWrap = document.getElementById("searched-results-wrap");
  searchedResultsWrap.innerHTML = "";

  if (results.length === 0) {
    const noResultsMsg = document.createElement("div");
    noResultsMsg.className = "no-results-message";
    noResultsMsg.textContent = `No movie found with the term "${input.value}"`;
    searchedResultsWrap.appendChild(noResultsMsg);
    noResultSearched = true;
    return;
  }
  noResultSearched = false;
  results.forEach((row) => {
    const searchedResults = document.createElement("div");
    searchedResults.className = "searched-results";

    // Create an image element for the movie poster
    const posterImg = document.createElement("img");
    posterImg.className = "searched-results-poster loading";

    posterImg.src = "assets/movie.svg"; // Set default image
    posterImg.style.filter = "var(--invert)";

    const detailsDiv = document.createElement("div");
    detailsDiv.textContent = row.release_date + " | " + row.language;
    detailsDiv.style.fontSize = "0.8em";

    fetch(`https://www.omdbapi.com/?i=${row.imdb_id}&apikey=${getNextApiKey()}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.Poster && data.Poster !== "N/A") {
          const img = new Image();
          img.onload = function () {
            posterImg.src = data.Poster;
            posterImg.style.filter = "none"; // Remove filter when actual poster is loaded
          };
          img.src = data.Poster;
          detailsDiv.textContent += " | ⭐" + data.imdbRating;
        }
        posterImg.classList.remove("loading");
      })
      .catch((error) => {
        console.error("Error fetching movie data:", error);
      });

    // Create a text container for title and IMDB ID
    const textContainer = document.createElement("div");
    textContainer.className = "searched-results-text";
    textContainer.textContent = row.title;
    textContainer.appendChild(detailsDiv);

    // Append poster and text to the result item
    searchedResults.appendChild(posterImg);
    searchedResults.appendChild(textContainer);

    searchedResultsWrap.appendChild(searchedResults);

    // Add click event listener to each searched-results div
    searchedResults.addEventListener('click', () => {
      // Store the clicked movie data in localStorage
      localStorage.setItem('chosenContent', JSON.stringify(row));
      // Navigate to the result page
      window.location.href = 'result.html';
    });
  });
}


// Debounce function
const debounce = (func, delay) => {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
};

// Debounced version of searchCSV
const debouncedSearchCSV = debounce(() => {
  const inputValue = input.value.trim().toLowerCase();
  if (inputValue) {
    displaySearchResults(searchCSV(inputValue));
  }
}, 600);




// all event listeners

function searchOnEnter(event) {
  if (event.key === "Enter" || event.type === "click") {
    debouncedSearchCSV.cancel(); // Cancel any ongoing debounced search
    hideSearchResults(); // Hide search results immediately
    seeInputAndDisplay();
  } else if (event.key === "Backspace" && input.value.trim() === "") {
    hideSearchResults();
  } else {
    debouncedSearchCSV(); // Trigger debounced search for other key presses
  }
}

function clickInInput() {
  if (!searchResultShown && input.value.trim() !== "" && !noResultSearched) {
    showSearchResults();
  }
}


// Event listener for clicking outside the search bar wrap and results
document.addEventListener("click", function (event) {
  event.stopPropagation();
  const isClickInsideSearchBar = input.contains(event.target);
  if (searchResultShown && !isClickInsideSearchBar) {
    const isClickInsideSearchBarWrap = searchBarWrap.contains(event.target);
    const isClickInsideSearchResults = searchTermResults.contains(event.target);
    
    if (!isClickInsideSearchBarWrap && !isClickInsideSearchResults) {
      hideSearchResults();
    }
  }
});


function seeInputAndDisplay() {
  let inputValue = input.value.trim().toLowerCase();

  if (inputValue !== '') {
    hideSearchResults();
    displaySearchedResults(searchCSV(inputValue));
  }
}

searchBtn.addEventListener("click", searchOnEnter);