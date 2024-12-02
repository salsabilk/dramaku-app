import React from "react";
import FilmCardV from "./components/FilmCardV";
import SweepCard from "./components/SweepCard";
import { useParams } from "react-router-dom";
import Header from "./components/Header";
import BookmarkButton from "./components/BookmarkButton";
import Comment from "./components/Comment";
import CommentForm from "./components/CommentForm";
import { useEffect, useState } from "react";
 

function DetailFilm() {
  const { id } = useParams();
  const [film, setFilm] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [hasAccess, setHasAccess] = useState(null);
  const [user, setUser] = useState(null);

  const getProtectedData = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setHasAccess(false);
      return;
    }
    try {
      const response = await fetch( process.env.REACT_APP_BASE_API_URL + "auth/protected", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.access) {
          setHasAccess(true);
          setUser(data.user);
        } else {
          setHasAccess(false);
        }
      } else {
        // console.log("Failed to fetch protected data");
        setHasAccess(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setHasAccess(false);
    }
  };
  useEffect(() => {
    getProtectedData();
    fetch( process.env.REACT_APP_BASE_API_URL + "/api/drama/" + id)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setFilm(data);
      })
      .catch((error) => {
        console.error("Error fetching film", error);
      });
  }, []);
  const getVideoId = (url) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  const rateFilm = () => {
    // Check if Comments exists and has entries
    if (!Array.isArray(film.Comments) || film.Comments.length === 0) {
      return 0; // Return 0 or any other fallback value if no comments
    }

    let total = film.Comments.reduce(
      (accumulator, current) => accumulator + current.rate,
      0
    );
    return total / film.Comments.length; // Use film.Comments.length instead of film.length
  };

  return (
    <div>
      <Header />
      <div className="pt-20 w-full px-4 md:px-20 xl:px-40 grid mt-4 image-wrapper">
        {film && film.link_trailer && (
          <iframe
            className="w-full h-128 rounded-lg"
            src={`https://www.youtube.com/embed/${getVideoId(
              film.link_trailer
            )}`}
            allowFullScreen
          />
        )}
      </div>
      <div className="w-full px-4 md:px-20 xl:px-40 grid grid-cols-4 gap-4 mt-4">
        <div className="col-span-1 pr-2 relative">
          <div className="absolute top-2 right-2">
            <BookmarkButton dramaId={film.id} />
          </div>
          <img className="w-full rounded-lg" src={film.poster} alt="" />
        </div>
        <div className="col-span-3 bg-white rounded-lg shadow-md dark:bg-gray-800 p-4">
          <h2 className="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">
            {film.title}
          </h2>
          <p className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
            {film.alt_title}
          </p>
          <p className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
            {film.year}
          </p>
          <p className="mb-4 text-gray-800 dark:text-gray-300">
            {film.synopsis}
          </p>
          <p className="mb-4 text-gray-800 dark:text-gray-300">
            {film.Genres && film.Genres.length > 0
              ? film.Genres.map((genre) => genre.name).join(", ")
              : "No genres available"}
          </p>
          <p className="mb-4 font-semibold text-gray-800 dark:text-gray-300">
            Rate {rateFilm()}/5
          </p>
          <p className="mb-4 text-gray-800 dark:text-gray-300">
            {film.availability}
          </p>
        </div>
      </div>
      <div className="px-4 md:px-20 xl:px-40 grid mt-4">
        <div className="overflow-x-auto w-full bg-white rounded-lg shadow-md w-2 p-2">
          <h1 className="flex py-5 lg:px-20 md:px-10 px-5 lg:mx-40 md:mx-20 mx-5 font-bold text-4xl text-gray-800">
            Actor
          </h1>
          <div className="flex overflow-x-auto hide-scroll-bar">
            <div className="flex flex-nowrap py-2 lg:ml-40 md:ml-20 ml-10">
              {film.Actors && film.Actors.length > 0 ? (
                film.Actors.map((actor) => (
                  <FilmCardV src={actor.photo} title={actor.name} />
                ))
              ) : (
                <p>No actors available</p> // Fallback message if no actors
              )}
            </div>
          </div>
        </div>
        <div className="mt-2 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="mb-2 flex justify-between flex-wrap items-center w-full">
            <div className="flex justify-between flex-wrap items-center gap-6">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                Review
              </h2>
            </div>
            <div className="flex justify-between flex-wrap items-center gap-6">
              <p className="ml-4 text-lg font-semibold text-gray-800 dark:text-gray-300">
                Sort By:{" "}
              </p>
              <label className="block text-sm">
                <select className="block w-full text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray">
                  <option value="">-- Sort --</option>
                  <option value="jepang">Rate</option>
                  <option value="korea">Like</option>
                </select>
              </label>
            </div>
          </div>
          <div>
            <div className="w-full overflow-hidden rounded-lg shadow-xs">
              <div className="w-full overflow-x-auto">
                <table className="w-full whitespace-no-wrap">
                  <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                    {film.Comments && film.Comments.length > 0 ? (
                      film.Comments.map((comment) => (
                        <Comment
                          avatar="https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3Nzg0fQ"
                          name={comment.User.username}
                          comment={comment.content}
                          rating={comment.rate}
                        />
                      ))
                    ) : (
                      <p>No comment available</p> // Fallback message if no actors
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-700 dark:text-gray-200">
              Tambah Komen
            </h2>
          </div>
          {hasAccess ? (
            <CommentForm user={user.id} drama={id} />
          ) : (
            <p>Anda harus login untuk memberikan komentar</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailFilm;
