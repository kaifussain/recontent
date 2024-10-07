// Array of 20 content suggestions
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
// Function to populate suggestion items
function populateSuggestions() {
  if (!dataLoaded) {
    console.log("Data not loaded yet. Waiting...");
    setTimeout(populateSuggestions, 100); // Try again in 100ms
    return;
  }

  suggestionWrap.innerHTML = ''; // Clear existing suggestions
  
  // Select a random index
  const randomIndex = Math.floor(Math.random() * contentSuggestions.length);
  selectedSuggestion = contentSuggestions[randomIndex];
  // displayRandomContent(selectedSuggestion);
  
  // Create suggestion items
  contentSuggestions.forEach((suggestion, index) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.className = "suggestion-item";
    suggestionItem.textContent = suggestion;
    
    if (index === randomIndex) {
      suggestionItem.classList.add("selectedSuggestion");
    }
    
    suggestionItem.addEventListener('click', () => selectSuggestion(suggestionItem));
    
    suggestionWrap.appendChild(suggestionItem);
  });

  // Move the selected suggestion to the beginning
  suggestionWrap.insertBefore(suggestionWrap.children[randomIndex], suggestionWrap.firstChild);
  console.log(">",selectedSuggestion);
  displayRandomContent(searchCSV(selectedSuggestion.trim().toLowerCase()));
}

function selectSuggestion(clickedItem) {
  const allSuggestions = suggestionWrap.querySelectorAll('.suggestion-item');
  allSuggestions.forEach(item => item.classList.remove('selectedSuggestion'));
  clickedItem.classList.add('selectedSuggestion');
  selectedSuggestion = clickedItem.textContent;

 displayRandomContent(searchCSV(selectedSuggestion.trim().toLowerCase()));
}

// Call the function when the DOM is fully loaded
// document.addEventListener("DOMContentLoaded", populateSuggestions);


// xxxxxxx



//code for search functionality
const input = document.getElementById("search-bar");
const searchTermResults = document.getElementById("searchTerm-results-wrap");
let data;
let dataLoaded = false;

fetch("search.csv")
  .then((response) => response.text())
  .then((csvText) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: function (results) {
        data = results.data; // Parsed CSV data
        dataLoaded = true;
        // Call populateSuggestions after data is loaded
        populateSuggestions();
      },
    });
  })
  .catch((error) => console.error("Error loading CSV:", error));

function searchCSV(searchValue) { 
  console.log("searchCSV called");

  // Split the search value into individual terms (keywords)
  searchTerms = searchValue.split(/\s+/);

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
  return filteredRows.slice(0, 3);
}




function displaySearchResults(results) {
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
    posterImg.src = "../assets/movie.svg"; // Replace with your default poster path
   
    posterImg.style.filter = "var(--invert)"



    fetch(`https://www.omdbapi.com/?i=${row.imdb_id}&apikey=ae6c583`)
  .then(response => response.json())
  .then(data => {
    // posterImg.className = "searchTerm-result-poster";
    posterImg.classList.remove("loading");
    if (data.Poster && data.Poster !== "N/A") {
      posterImg.src = data.Poster;
      posterImg.style.filter = "none";
    } else {
      //when no poster is found
    }
  })
  .catch(error => {
    console.error("Error fetching movie data:", error);
  });


    // Create a text container for title and IMDB ID
    const textContainer = document.createElement("div");
    textContainer.className = "searchTerm-result-text";
    // textContainer.textContent = `${row.title} ${row.release_date}`;
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
  searchTermResults.style.display = 'block';
}

function hideSearchResults() {
  searchTermResults.style.display = 'none';
}




function displayRandomContent(results){
  console.log("displayRandomContent called");
  const randomContentWrap = document.getElementById("random-content-wrap");
  randomContentWrap.innerHTML = '';

  results.forEach((row) => {
    const randomContent = document.createElement("div");
    randomContent.className = "random-content";

    // Create an image element for the movie poster
    const posterImg = document.createElement("img");
    posterImg.className = "random-content-poster loading";
   
    posterImg.src = "../assets/movie.svg"; // Set default image
    posterImg.style.filter = "var(--invert)"


    const detailsDiv = document.createElement("div");
    detailsDiv.textContent = row.release_date + ' | ' + row.language;
    detailsDiv.style.fontSize = "0.8em";

    fetch(`https://www.omdbapi.com/?i=${row.imdb_id}&apikey=ae6c583`)
      .then(response => response.json())
      .then(data => {
        posterImg.classList.remove("loading");
        if (data.Poster && data.Poster !== "N/A") {
          const img = new Image();
          img.onload = function() {
            posterImg.src = data.Poster;
            posterImg.style.filter = "none"; // Remove filter when actual poster is loaded
            // posterImg.className = "random-content-poster";
          };
          img.src = data.Poster;
          detailsDiv.textContent += ' | ⭐' + data.imdbRating;
        }
      })
      .catch(error => {
        console.error("Error fetching movie data:", error);
      });

    // Create a text container for title and IMDB ID
    const textContainer = document.createElement("div");
    textContainer.className = "random-content-text";
    textContainer.textContent = row.title;
    textContainer.appendChild(detailsDiv);

    // Append poster and text to the result item
    randomContent.appendChild(posterImg);
    randomContent.appendChild(textContainer);

    randomContentWrap.appendChild(randomContent);
  });
  
}




// xxxxxxx




// Get the search bar wrap element
const searchBarWrap = document.getElementById('search-bar-wrap');

// Event listener for clicking on the search bar wrap
searchBarWrap.addEventListener('click', function(event) {
  if (input.value.trim() !== "") {
    showSearchResults();
  }
//   event.stopPropagation();
});

// Event listener for clicking outside the search bar wrap and results
document.addEventListener('click', function(event) {
  const isClickInsideSearchBarWrap = searchBarWrap.contains(event.target);
  const isClickInsideSearchResults = searchTermResults.contains(event.target);

  if (!isClickInsideSearchBarWrap && !isClickInsideSearchResults) {
    hideSearchResults();
  }
});

// Initially hide the search results
hideSearchResults();




// xxxxxxx




// Debounce function to limit the rate at which a function can fire
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}
// Create a debounced version of searchCSV
const debouncedSearchCSV = debounce(() => {
  displaySearchResults(searchCSV(input.value.trim().toLowerCase()));
}, 500);

// Add event listener for input changes
input.addEventListener('input', function() {
  if (this.value.trim() === "") {
    hideSearchResults();
  } else {
    debouncedSearchCSV();
  }
});
