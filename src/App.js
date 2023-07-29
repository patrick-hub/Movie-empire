import { useEffect, useState } from "react";
import MovieDetails from "./MovieDetails";
import Loader from "./Loader";
import StarRating from "./StarRating";

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "85395cbb";

export default function App() {
	const [query, setQuery] = useState("");
	const [movies, setMovies] = useState([]);
	const [watched, setWatched] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [selectedId, setSelectedId] = useState(null);

	function handleSelectedMovie(id) {
		setSelectedId(id);
	}

	function handleCloseMovie(id) {
		setSelectedId(null);
	}

	function handleAddWatched(movie) {
		setWatched((watched) => [...watched, movie]);
	}

	function handleDeleteWatched(id) {
		setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
	}

	useEffect(
		function () {
			const controller = new AbortController();
			async function fetchMovies() {
				try {
					setLoading(true);
					setError("");
					const res = await fetch(
						`http://www.omdbapi.com/?apikey=${KEY}&s=${query}
            `,
						{ signal: controller.signal }
					);

					if (!res.ok)
						throw new Error("Something Went Wrong with fetching movies");

					const data = await res.json();
					if (data.Response === "False") throw new Error("Movie not found");
					setMovies(data.Search);
					setError("");
				} catch (err) {
					if (err.name !== "AbortError") {
						setError(err.message);
					}
				} finally {
					setLoading(false);
				}
			}
			if (!query.length) {
				setMovies([]);
				setError("");
				return;
			}
            handleCloseMovie()
			fetchMovies();
			return function () {
				controller.abort();
			};
		},
		[query]
	);

	return (
		<>
			<Navbar>
				<Search query={query} setQuery={setQuery} />
				<Numresults movies={movies} />
			</Navbar>
			<Main>
				<Box>
					{loading && <Loader />}
					{!loading && !error && (
						<MovieList movies={movies} onhandleMovie={handleSelectedMovie} />
					)}
					{error && <ErrorMessage message={error} />}
					{!query && <p>Search for Movie</p>}
				</Box>
				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddWatched={handleAddWatched}
							watched={watched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMoviesList
								watched={watched}
								onDeleteWatched={handleDeleteWatched}
							/>
						</>
					)}
				</Box>
			</Main>
		</>
	);
}



function ErrorMessage({ message }) {
	return (
		<div className="error">
			<span>❌</span> {message}
		</div>
	);
}

function Navbar({ children }) {
	return (
		<nav className="nav-bar">
			<Logo />
			{children}
		</nav>
	);
}

function Logo() {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>Movie Empire</h1>
		</div>
	);
}
function Search({ query, setQuery }) {
	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
		/>
	);
}

function Numresults({ movies }) {
	return (
		<p className="num-results">
			Found <strong>{movies.length}</strong> results
		</p>
	);
}

function Main({ children }) {
	return <main className="main">{children}</main>;
}

function Box({ children }) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="box">
			<button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
				{isOpen ? "–" : "+"}
			</button>
			{isOpen && children}
		</div>
	);
}


function MovieList({ movies, onhandleMovie }) {
	return (
		<ul className="list list-movies">
			{movies?.map((movie) => (
				<Movie movie={movie} key={movie.imdbID} onhandleMovie={onhandleMovie} />
			))}
		</ul>
	);
}

function Movie({ movie, onhandleMovie }) {
	return (
		<li onClick={() => onhandleMovie(movie.imdbID)}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
}



function WatchedSummary({ watched }) {
	const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
	const avgUserRating = average(watched.map((movie) => movie.userRating));
	const avgRuntime = average(watched.map((movie) => movie.runtime));
	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating.toFixed(2)}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating.toFixed(2)}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime.toFixed()} min</span>
				</p>
			</div>
		</div>
	);
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
	return (
		<ul className="list">
			{watched.map((movie) => (
				<li key={movie.imdbID}>
					<img src={movie.poster} alt={`${movie.title} poster`} />
					<h3>{movie.title}</h3>
					<div>
						<p>
							<span>⭐️</span>
							<span>{movie.imdbRating}</span>
						</p>
						<p>
							<span>🌟</span>
							<span>{movie.userRating}</span>
						</p>
						<p>
							<span>⏳</span>
							<span>{movie.runtime} min</span>
						</p>
						<button
							className="btn-delete"
							onClick={() => onDeleteWatched(movie.imdbID)}>
							X
						</button>
					</div>
				</li>
			))}
		</ul>
	);
}
