const contentSuggestions = [
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
  "Musical",
  "Western",
  "Crime",
];

let selectedSuggestion;
const suggestionWrap = document.getElementById("suggestions");
let searchResultShown = false;
const omdbApiKey = "ae6c583";
const searchBarWrap = document.getElementById("search-bar-wrap");
const input = searchBarWrap.querySelector("#search-bar");
const searchTermResults = searchBarWrap.querySelector("#searchTerm-results-wrap");
const searchBtn = searchBarWrap.querySelector("#search-btn");

let data;



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

function searchCSV_old(searchValue) {
  // Split the search value into individual terms (keywords)
  let searchTerms = searchValue.split(/\s+/);

  // Priority 1: Exact title matches where title starts with the full search term (e.g., 'toy story')
  const exactTitleMatches = data.filter((row) => {
    const title = typeof row.title === "string" ? row.title.toLowerCase() : "";
    return title.startsWith(searchValue); // Exact match with full search string
  });

  // Priority 2: Movies where title starts with any of the individual search terms (e.g., 'toy', 'story')
  const startingTitleMatches = data.filter((row) => {
    const title = typeof row.title === "string" ? row.title.toLowerCase() : "";
    return (
      !exactTitleMatches.includes(row) &&
      searchTerms.some((term) => title.startsWith(term))
    );
  });

  // Priority 3: Movies where title contains the search terms anywhere
  const partialTitleMatches = data.filter((row) => {
    const title = typeof row.title === "string" ? row.title.toLowerCase() : "";
    return (
      !exactTitleMatches.includes(row) &&
      !startingTitleMatches.includes(row) &&
      searchTerms.some((term) => title.includes(term))
    );
  });

  // Priority 4: Movies where tags contain the search terms
  const tagMatches = data.filter((row) => {
    const tags = typeof row.tags === "string" ? row.tags.toLowerCase() : "";
    return (
      !exactTitleMatches.includes(row) &&
      !startingTitleMatches.includes(row) &&
      !partialTitleMatches.includes(row) &&
      searchTerms.some((term) => tags.includes(term))
    );
  });

  // Combine results: exact title matches first, then starting title matches, partial matches, and tag matches
  const filteredRows = [
    ...exactTitleMatches,
    ...startingTitleMatches,
    ...partialTitleMatches,
    ...tagMatches,
  ];

  // Limit the result to a maximum of 10
  return filteredRows.slice(0, 2);
}


function searchCSV_short(searchValue) {
  // Split the search value into individual terms (keywords)
  const searchTerms = searchValue.split(/\s+/);
  
  // Create a single filter function to categorize matches
  const categorizeMatch = (row) => {
    const title = (typeof row.title === "string" ? row.title : "").toLowerCase();
    const tags = (typeof row.tags === "string" ? row.tags : "").toLowerCase();

    // Check for exact title match first
    if (title === searchValue.toLowerCase()) return 1; // Exact title match
    if (searchTerms.some(term => title.startsWith(term)) && title.length > 1) return 2; // Starting title match
    if (searchTerms.some(term => title.includes(term))) return 3; // Partial title match
    if (searchTerms.some(term => tags.includes(term))) return 4; // Tag match
    return 0; // No match
  };

  // Filter and sort in a single pass
  return data
    .map(row => ({ row, category: categorizeMatch(row) }))
    .filter(item => item.category > 0)
    .sort((a, b) => a.category - b.category)
    .map(item => item.row)
    .slice(0, 25);
}


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
  // Split the search value into individual terms (keywords)
  const searchTerms = searchValue.split(/\s+/);
  const normalizedSearchValue = searchValue.toLowerCase();

  // Create a single filter function to categorize matches
  const categorizeMatch = (row) => {
    const title = (typeof row.title === "string" ? row.title : "").toLowerCase();
    const tags = (typeof row.tags === "string" ? row.tags : "").toLowerCase();

    // Exact title match
    if (title === normalizedSearchValue) return 1;

    // Starting title match (e.g., 'adv' matches 'Adventure')
    if (title.startsWith(normalizedSearchValue)) return 2;

    // Close match using Levenshtein distance, but only for titles of similar length
    if (title.length > 3 && Math.abs(title.length - normalizedSearchValue.length) <= 3) {
      if (levenshtein(title, normalizedSearchValue) <= 2) return 3; // Allow up to 2 edits
    }

    // Partial title match
    if (searchTerms.some(term => title.includes(term))) return 4;

    // Tag match
    if (searchTerms.some(term => tags.includes(term))) return 5;

    return 0; // No match
  };

  // Filter and sort in a single pass
  return data
    .map(row => ({ row, category: categorizeMatch(row) }))
    .filter(item => item.category > 0)
    .sort((a, b) => a.category - b.category)
    .map(item => item.row)
    .slice(0, 2);
}




function displaySearchResults(results) {
  console.log("displaySearchResults called");
  searchTermResults.innerHTML = ""; // Clear previous results
  if (results.length === 0) {
    hideSearchResults();
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

    fetch(`https://www.omdbapi.com/?i=${row.imdb_id}&apikey=${omdbApiKey}`)
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

    fetch(`https://www.omdbapi.com/?i=${row.imdb_id}&apikey=${omdbApiKey}`)
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
          posterImg.classList.remove("loading");
        }
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
  });
}


// Debounce function
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
  };
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
  if (event.key === "Enter") {
    seeInputAndDisplay();
  }
  else if (event.key === "Backspace" && input.value.trim() === "") {
    hideSearchResults();
  }
}

function clickInInput() {
  if (!searchResultShown && input.value.trim() !== "") {
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


// Add this new function
function seeInputAndDisplay() {
  let inputValue = input.value.trim().toLowerCase();

  if (inputValue !== '') {
    hideSearchResults();
    displaySearchedResults(searchCSV(inputValue));
  }
}
