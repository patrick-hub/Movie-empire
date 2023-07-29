import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import Loader from "./Loader";

const KEY = "85395cbb";


export default function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
	const [movie, setMovie] = useState({});
	const [loading, setLoading] = useState(false);
	const [userRating, setUserRating] = useState("");

	const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

	const watchedUserRating = watched.find((movie) => movie.imdbID)?.userRating;

	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;

	function handleAdd() {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(" ").at(0)),
			userRating,
		};
		onAddWatched(newWatchedMovie);
		onCloseMovie();
	}

	useEffect(
		function () {
			function callback(e) {
				if (e.code === "Escape") {
					onCloseMovie();
				}
			}
			document.addEventListener("keydown", callback);
			return function () {
				document.removeEventListener("keydown", callback);
			};
		},
		[onCloseMovie]
	);

	useEffect(
		function () {
			async function getMovieDetails() {
				setLoading(true);
				const res =
					await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}
`);

				if (!res.ok) throw new Error("No Movie Selected");
				const data = await res.json();
				setMovie(data);
				setLoading(false);
			}
			getMovieDetails();
		},
		[selectedId]
	);
	useEffect(
		function () {
			if (!title) return;
			document.title = `Movie | ${title}`;
			return function () {
				document.title = "Empire";
			};
		},
		[title]
	);

	return (
		<div className="details">
			{loading ? (
				<Loader />
			) : (
				<>
					<header>
						<button onClick={onCloseMovie} className="btn-back">
							&larr;
						</button>
						<img src={poster} alt={`poster of ${movie} movie`} />
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐️</span>
								{imdbRating} imDb Rating
							</p>
						</div>
					</header>
					<section>
						<div className="rating">
							{!isWatched ? (
								<>
									<StarRating maxRating={10} onSetRating={setUserRating} />
									{userRating > 0 && (
										<button className="btn-add" onClick={handleAdd}>
											Add to List
										</button>
									)}
								</>
							) : (
								<p>
									You have rated this movie {watchedUserRating} <span>⭐️</span>
								</p>
							)}
						</div>
						<p>
							<em>{plot}</em>
						</p>
						<p>Starring {actors}</p>
						<p>Directed By {director}</p>
					</section>
				</>
			)}
		</div>
	);
}