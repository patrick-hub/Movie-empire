import {useRef, useState } from "react";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";
import Loader from "./Loader";
import MovieDetails from "./MovieDetails";

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
	const [query, setQuery] = useState("");
	const [selectedId, setSelectedId] = useState(null);
	const { movies, isLoading, error } = useMovies(query);
	const [watched, setWatched] = useLocalStorageState([], "watched");

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

	return (
		<>
			<Navbar>
				<Search query={query} setQuery={setQuery} />
				<Numresults movies={movies} />
			</Navbar>
			<Main>
				<Box>
					{isLoading && <Loader />}
					{!isLoading && !error && (
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
			<span role="img">🍿📽️ </span>
			<h1>Movie Empire</h1>
		</div>
	);
}

function Search({ query, setQuery }) {
	const inputEl = useRef(null);
	useKey("Enter", function () {
		if (document.activeElement === inputEl.current) return;
		inputEl.current.focus();
		setQuery("");
	});

	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			ref={inputEl}
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
