import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Filter from "./components/Filter";
import PaginationHome from "./components/PaginationHome";
import Alert from "./components/Alert";
import FilmCardH from "./components/FilmCardH";
 

const BookmarkPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAward, setSelectedAward] = useState("");
  const [sortValue, setSortValue] = useState("");
  const itemsPerPage = 12;

  useEffect(() => {
    fetchBookmarks();
  }, [currentPage, sortValue]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/bookmarks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the data to match the expected structure
      const transformedBookmarks = data.map((bookmark) => ({
        ...bookmark.Drama,
        id: bookmark.Drama.id,
        Genres: bookmark.Drama.Genres || [],
      }));

      setBookmarks(transformedBookmarks);

      // Calculate total pages based on itemsPerPage
      const totalItems = transformedBookmarks.length;
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(calculatedTotalPages);
    } catch (error) {
      console.error("Error fetching bookmarks", error);
      showAlert(error.message || "Error fetching bookmarks", "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 3000);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setCurrentPage(1);
  };

  const handleAvailabilityChange = (availability) => {
    setSelectedAvailability(availability);
    setCurrentPage(1);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleAwardChange = (award) => {
    setSelectedAward(award);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortValue(sort);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Helper function for genre name
  const getGenreName = (genre) => {
    if (typeof genre === "string") return genre;
    if (typeof genre === "object" && genre !== null) {
      return genre.name || genre.Name || genre.genre || genre.Genre || "";
    }
    return "";
  };

  // Filter bookmarks based on selected filters
  const filteredBookmarks = bookmarks.filter((film) => {
    const matchesGenre = selectedGenre
      ? film.Genres &&
        film.Genres.some(
          (genre) =>
            getGenreName(genre).toLowerCase() === selectedGenre.toLowerCase()
        )
      : true;

    const matchesYear = selectedYear
      ? film.year?.toString() === selectedYear
      : true;

    const matchesCountry = selectedCountry
      ? film.country_id === Number(selectedCountry)
      : true;

    const matchesAvailability = selectedAvailability
      ? film.availability &&
        film.availability.toLowerCase() === selectedAvailability.toLowerCase()
      : true;

    const matchesStatus = selectedStatus
      ? film.status &&
        film.status.toLowerCase() === selectedStatus.toLowerCase()
      : true;

    const matchesAward = selectedAward
      ? selectedAward === "yes"
        ? film.Awards && film.Awards.length > 0
        : film.Awards && film.Awards.length === 0
      : true;

    return (
      matchesGenre &&
      matchesYear &&
      matchesCountry &&
      matchesAvailability &&
      matchesStatus &&
      matchesAward
    );
  });

  // Get paginated bookmarks
  const getPaginatedBookmarks = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBookmarks.slice(startIndex, endIndex);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <div className="mt-10 flex-1 flex flex-col">
          <main className="flex-1 pb-16 overflow-y-auto">
            <div className="container grid px-6 mx-auto">
              <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
                Bookmarks
              </h2>

              {alert.message && (
                <Alert
                  message={alert.message}
                  type={alert.type}
                  onClose={() => setAlert({ message: "", type: "" })}
                />
              )}

              <div className="w-full overflow-hidden rounded-lg shadow-xs">
                <Filter
                  selectedGenre={selectedGenre}
                  onGenreChange={handleGenreChange}
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                  selectedCountry={selectedCountry}
                  onCountryChange={handleCountryChange}
                  selectedAvailability={selectedAvailability}
                  onAvailabilityChange={handleAvailabilityChange}
                  selectedStatus={selectedStatus}
                  onStatusChange={handleStatusChange}
                  selectedAward={selectedAward}
                  onAwardChange={handleAwardChange}
                  selectedSort={sortValue}
                  onSortChange={handleSortChange}
                />

                {loading ? (
                  <p className="text-center text-gray-700 dark:text-gray-400">
                    Loading...
                  </p>
                ) : getPaginatedBookmarks().length > 0 ? (
                  <div className="w-full px-2 grid mt-4">
                    <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
                      {getPaginatedBookmarks().map((film) => (
                        <FilmCardH
                          key={film.id}
                          id={film.id}
                          src={film.poster}
                          title={film.title}
                          synopsis={film.synopsis}
                          year={film.year}
                          genres={film.Genres || []}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-700 dark:text-gray-400">
                    No bookmarks found.
                  </p>
                )}
                <PaginationHome
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginate={paginate}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BookmarkPage;
