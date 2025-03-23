document.addEventListener("DOMContentLoaded", () => {
    const filmsList = document.getElementById("films");
    const movieTitle = document.getElementById("movie-title");
    const moviePoster = document.getElementById("movie-poster");
    const movieRuntime = document.getElementById("movie-runtime");
    const movieShowtime = document.getElementById("movie-showtime");
    const movieTickets = document.getElementById("movie-tickets");
    const buyTicketButton = document.getElementById("buy-ticket");

    const dbUrl = "http://localhost:3000/films"; // URL for fetching data from db.json

    let selectedMovie = null; // Stores the currently selected movie

    //Fetch movies from db.json and display them in the movie list
    function fetchMovies() {
        fetch(dbUrl)
            .then(response => response.json())
            .then(movies => {
                filmsList.innerHTML = ""; // Clear any existing movies
                movies.forEach(movie => displayMovieInList(movie));
                // Select the first movie by default
                if (movies.length > 0) {
                    loadMovieDetails(movies[0]);
                }
            })
            .catch(error => console.error("Error fetching movies:", error));
    }

    //Display each movie title in the aside list
    function displayMovieInList(movie) {
        const li = document.createElement("li");
        li.textContent = movie.title;
        li.classList.add("film-item"); // Adding a class for styling
        li.addEventListener("click", () => loadMovieDetails(movie)); // When clicked, load details
        filmsList.appendChild(li);
    }

    //Load the movie details when a movie is clicked
    function loadMovieDetails(movie) {
        selectedMovie = movie;
        movieTitle.textContent = movie.title;
        moviePoster.src = movie.poster;
        movieRuntime.textContent = `Runtime: ${movie.runtime} mins`;
        movieShowtime.textContent = `Showtime: ${movie.showtime}`;
        updateAvailableTickets(); // Update ticket availability
    }

    //Update available tickets
    function updateAvailableTickets() {
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

    //Handle ticket purchase
    buyTicketButton.addEventListener("click", () => {
        if (selectedMovie && selectedMovie.tickets_sold < selectedMovie.capacity) {
            selectedMovie.tickets_sold++;
            updateAvailableTickets(); // Update ticket count in UI

            // (Optional) Send updated data back to the server (if using JSON Server)
            fetch(`${dbUrl}/${selectedMovie.id}`, {
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

    //Load movies when the page is ready
    fetchMovies();
});
