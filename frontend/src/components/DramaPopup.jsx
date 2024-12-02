import React, { useState } from "react";
import FilmCardV from "./FilmCardV";


const DramaPopup = ({ drama, onClose, onUpdateStatus }) => {
  const [status, setStatus] = useState("");
  const getVideoId = (url) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    // Memanggil fungsi onUpdateStatus untuk memperbarui status di CMS
    onUpdateStatus(newStatus);
    // Menutup popup
    onClose();
  };

  // Helper function to ensure data is array or fallback to empty array
  const ensureArray = (value) => (Array.isArray(value) ? value : [value]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-30">
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl h-[800px] overflow-y-auto border relative"
        style={{ maxHeight: "80vh" }}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-200 hover:text-gray-600 focus:outline-none"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Drama Info */}
        <div className="flex gap-6">
          {/* Drama Poster */}
          <div className="flex-shrink-0">
            <img
              src={drama.poster}
              alt="Drama Poster"
              className="h-64 w-48 rounded-lg object-cover bg-gray-200"
            />
          </div>

          {/* Drama Details */}
          <div>
            <h2 className="text-xl font-bold mb-2">
              {drama.title}
            </h2>
            <p className="text-sm text-gray-800 mb-2">
              Other titles: {drama.alt_title}<br />
              Year: {drama.year}
            </p>
            <p className="text-sm text-gray-800 mb-2">
              Synopsis: {drama.synopsis}.
            </p>
            <p className="text-sm text-gray-800 mb-2">
              Genre: {ensureArray(drama.Genres).map((genre) => genre.name).join(", ")}
            </p>
            <p className="text-sm text-gray-800 mb-2">
              Availability: {drama.availability}
            </p>
          </div>
        </div>

        {/* Actors List */}
        <div className="flex justify-between space-x-4 mt-4">
          <div className="flex overflow-x-auto hide-scroll-bar">
            <div className="flex flex-nowrap py-2 lg:ml-40 md:ml-20 ml-10">
              {drama.Actors && drama.Actors.length > 0 ? (
                drama.Actors.map((actor) => (
                  <FilmCardV src={actor.photo} title={actor.name} />
                ))
              ) : (
                <p>No actors available</p> // Fallback message if no actors
              )}
            </div>
          </div>

        </div>

        {/* Trailer Video */}
        <div className="w-full mt-4">
          <div
            className="relative"
            style={{ paddingBottom: "56.25%", height: 0, overflow: "hidden" }}
          >
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${getVideoId(
                drama.link_trailer
              )}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Trailer"
            ></iframe>
          </div>
        </div>

        {/* Approve/Unapprove Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            id="approveBtn"
            type="button"
            className="px-4 py-2 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
            style={{ backgroundColor: "#15803d", color: "white" }}
            onClick={() => onUpdateStatus("Approved", drama.id)}
          >
            Approved
          </button>
          <button
            id="unapproveBtn"
            type="button"
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:shadow-outline-red"
            onClick={() => onUpdateStatus("Unapproved", drama.id)}
          >
            Unapproved
          </button>
        </div>
      </div>
    </div>
  );
};

export default DramaPopup;
