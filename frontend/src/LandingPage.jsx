import React, { useEffect, useState } from "react";
import Carousel from "./components/Carousel";
import SweepCard from "./components/SweepCard";
import Filter from "./components/Filter";
import FilmCardH from "./components/FilmCardH";
import PaginationHome from "./components/PaginationHome";
import Header from "./components/Header";
 

function LandingPage() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAward, setSelectedAward] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [latestFilms, setLatestFilms] = useState([]);

  // Fetch data dari backend, berdasarkan page dan 
  const fetchLatestFilms = async () => {
    try {
      const response = await fetch( process.env.REACT_APP_BASE_API_URL + "/api/latest-dramas");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setLatestFilms(data);
    } catch (error) {
      console.error("Error fetching latest films", error);
    }
  };
  useEffect(() => {
    const fetchDramas = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage,
          limit: 12,
          sort: sortValue, // Include sort parameter
        });

        const response = await fetch(
          `${ process.env.REACT_APP_BASE_API_URL}/api/dramas?${queryParams.toString()}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setFilms(data.dramas);
        setTotalPages(data.totalPages); // Set totalPages dari response API
      } catch (error) {
        console.error("Error fetching films", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDramas();
    fetchLatestFilms();
  }, [currentPage, sortValue]);

  useEffect(() => {
    fetch( process.env.REACT_APP_BASE_API_URL + "/session", {
      method: "GET",
      credentials: "include", // Pastikan untuk menyertakan cookies/session
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          // Simpan token ke localStorage atau state
          sessionStorage.setItem("token", data.token);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);
  // Fungsi untuk handle pagination
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Fungsi untuk handle perubahan filter genre
  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  // Fungsi untuk handle perubahan filter year
  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    // console.log("Selected country ID:", country);
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
    // Added sort change handler
    setSortValue(sort);
    setCurrentPage(1);
  };

  // Fungsi helper untuk mendapatkan nama genre
  const getGenreName = (genre) => {
    if (typeof genre === "string") return genre;
    if (typeof genre === "object" && genre !== null) {
      return genre.name || genre.Name || genre.genre || genre.Genre || "";
    }
    return "";
  };

  // Filter film berdasarkan genre dan tahun yang dipilih
  const filteredFilms = films.filter((film) => {
    const matchesGenre = selectedGenre
      ? film.Genres &&
        film.Genres.some(
          (genre) =>
            getGenreName(genre).toLowerCase() === selectedGenre.toLowerCase()
        )
      : true;

    const matchesYear = selectedYear
      ? film.year.toString() === selectedYear
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

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Header />
      <div className="pt-20">
        <Carousel />
        <SweepCard dramas={latestFilms} title="Latest Added" />
        <div className="w-full px-4 md:px-20 xl:px-40 grid mt-4">
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

          <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
            {filteredFilms.length > 0 ? (
              filteredFilms.map((film) => (
                <FilmCardH
                  key={film.id}
                  id={film.id}
                  src={film.poster || "./img/film.jpg"}
                  title={film.title}
                  synopsis={film.synopsis}
                  year={film.year}
                  genres={film.Genres ? film.Genres : []}
                />
              ))
            ) : (
              <p>No films found.</p>
            )}
          </div>
        </div>
      </div>
      <PaginationHome
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />
    </div>
  );
}

export default LandingPage;
