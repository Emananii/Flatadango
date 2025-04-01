document.addEventListener("DOMContentLoaded", () => {

    //creating global variables for all the DOM elements I'll need
    const filmsList = document.getElementById("films");
    const movieTitle = document.getElementById("movie-title");
    const moviePoster = document.getElementById("movie-poster");
    const movieRuntime = document.getElementById("movie-runtime");
    const movieShowtime = document.getElementById("movie-showtime");
    const movieTickets = document.getElementById("movie-tickets");
    const buyTicketButton = document.getElementById("buy-ticket");

    const url = "http://localhost:8000/films";//specified the films endpoint to fix error

    let selectedMovie; // Stores the currently selected movie

    //Fetch movies from db.json and display them in the movie list
    function fetchMovies() {
        fetch(url)
            .then(response => response.json())
            .then(movies => {
                movies.forEach(movie => displayMovieInList(movie));
    
                // We will restore last selected movie if it exists
                const lastMovieId = localStorage.getItem("selectedMovieId");
                const lastMovie = movies.find(movie => movie.id == lastMovieId);
    
                if (lastMovie) {
                    loadMovieDetails(lastMovie);
                } else if (movies.length > 0) {
                    loadMovieDetails(movies[0]);
                }
            })
            .catch(error => console.error("Error fetching movies:", error));
    }
    //Displaying each movie title in the aside list
    function displayMovieInList(movie) {
        const li = document.createElement("li");
        li.textContent = movie.title;
        li.classList.add("film-item"); // Adding a class for styling
        li.addEventListener("click", () => loadMovieDetails(movie)); // When the list item is clicked, this will load details
        filmsList.appendChild(li);
    }

    //a function to Load the movie details when a movie is clicked
    function loadMovieDetails(movie) {
        console.log("Loading movie details:", movie);//my debugger
        selectedMovie = movie;//the argument passed here is the movie that was clicked
        localStorage.setItem("selectedMovieId", movie.id); // Store in localStorage
    
        movieTitle.textContent = movie.title;
        moviePoster.src = movie.poster;
        movieRuntime.textContent = `Runtime: ${movie.runtime} mins`;
        movieShowtime.textContent = `Showtime: ${movie.showtime}`;
        updateAvailableTickets();
    }

    //Updating available tickets
    function updateAvailableTickets() {
        console.log("Updating available tickets...");
        if (selectedMovie) {
            let availableTickets = selectedMovie.capacity - selectedMovie.tickets_sold;
            movieTickets.textContent = `Available Tickets: ${availableTickets}`;

            if (availableTickets <= 0) {
                buyTicketButton.textContent = "Sold Out";
                buyTicketButton.disabled = true;
            } else {
                buyTicketButton.textContent = "Buy Ticket";
                buyTicketButton.disabled = false;
            }
        }
    }

    //Handling ticket purchase
    buyTicketButton.addEventListener("click", (event) => {
        event.preventDefault();//not a form but testing to see if it'll prevent page reload
        event.stopPropagation();//testing to see if it'll prevent page reload
        console.log("Buy Ticket button clicked!"); //debugger
        if (selectedMovie && selectedMovie.tickets_sold < selectedMovie.capacity) {
            selectedMovie.tickets_sold++;

            console.log("Tickets sold updated:", selectedMovie.tickets_sold);
            updateAvailableTickets(); // Update ticket count in UI

            // (Optional) Send updated data back to the server (if using JSON Server)
            fetch(`${url}/${selectedMovie.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tickets_sold: selectedMovie.tickets_sold })
            })
            .then(response => response.json())
            .then(updatedMovie => {
                selectedMovie = updatedMovie; // Sync with server data
            })
            .catch(error => console.error("Error updating ticket count:", error));
        }
        
    });

    //Load movies once the page is ready
    fetchMovies();
    
});
