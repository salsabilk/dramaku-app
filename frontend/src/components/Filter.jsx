import React, { useEffect, useState } from "react";

function Filter({
  selectedGenre,
  onGenreChange,
  selectedYear,
  onYearChange,
  selectedCountry,
  onCountryChange,
  selectedAvailability,
  onAvailabilityChange,
  selectedStatus,
  onStatusChange,
  selectedAward,
  onAwardChange,
  selectedSort,
  onSortChange,
}) {
  // Function to handle dropdown changes
  const handleGenreSelect = (event) => {
    const genre = event.target.value;
    onGenreChange(genre);
    localStorage.setItem("selectedGenre", genre); // Save to localStorage
  };

  const handleYearSelect = (event) => {
    const year = event.target.value;
    onYearChange(year);
    localStorage.setItem("selectedYear", year); // Save to localStorage
  };

  const handleCountrySelect = (event) => {
    const country = event.target.value;
    onCountryChange(country);
    localStorage.setItem("selectedCountry", country); // Save to localStorage
  };

  const handleAvailabilitySelect = (event) => {
    const availability = event.target.value;
    onAvailabilityChange(availability);
    localStorage.setItem("selectedAvailability", availability); // Save to localStorage
  };

  const handleStatusSelect = (event) => {
    const status = event.target.value;
    onStatusChange(status);
    localStorage.setItem("selectedStatus", status); // Save to localStorage
  };

  const handleAwardSelect = (event) => {
    const award = event.target.value;
    onAwardChange(award);
    localStorage.setItem("selectedAward", award); // Save to localStorage
  };

  const handleSortSelect = (event) => {
    const sort = event.target.value;
    onSortChange(sort);
    localStorage.setItem("selectedSort", sort);
  };

  const [countries, setCountries] = useState([]);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_BASE_API_URL + "/api/countries"
        );
        if (!response.ok) throw new Error("Failed to fetch countries");
        const data = await response.json();
        setCountries(data.countries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Load filter values from localStorage on component mount
  useEffect(() => {
    const savedGenre = localStorage.getItem("selectedGenre");
    const savedYear = localStorage.getItem("selectedYear");
    const savedCountry = localStorage.getItem("selectedCountry");
    const savedAvailability = localStorage.getItem("selectedAvailability");
    const savedStatus = localStorage.getItem("selectedStatus");
    const savedAward = localStorage.getItem("selectedAward");
    const savedSort = localStorage.getItem("selectedSort");

    if (savedGenre) onGenreChange(savedGenre);
    if (savedYear) onYearChange(savedYear);
    if (savedCountry) onCountryChange(savedCountry);
    if (savedAvailability) onAvailabilityChange(savedAvailability);
    if (savedStatus) onStatusChange(savedStatus);
    if (savedAward) onAwardChange(savedAward);
    if (savedSort) onSortChange(savedSort);
  }, [
    onGenreChange,
    onYearChange,
    onCountryChange,
    onAvailabilityChange,
    onStatusChange,
    onAwardChange,
    onSortChange,
  ]);

  return (
    <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="flex justify-between flex-wrap items-center">
        <div className="flex justify-between flex-wrap items-center gap-6">
          <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            Filter:
          </h4>

          <label className="block text-sm">
            <select
              className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select"
              onChange={handleCountrySelect}
              value={selectedCountry}
            >
              <option value="">-- Country --</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <select
              className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select"
              onChange={handleYearSelect}
              value={selectedYear}
            >
              <option value="">-- Year --</option>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
              <option value={2021}>2021</option>
              <option value={2020}>2020</option>
              <option value={2019}>2019</option>
              <option value={2018}>2018</option>
              <option value={2017}>2017</option>
            </select>
          </label>

          <label className="block text-sm">
            <select
              className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select"
              onChange={handleGenreSelect}
              value={selectedGenre}
            >
              <option value="">-- Genre --</option>
              <option value="Action">Action</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Horror">Horror</option>
              <option value="Romance">Romance</option>
            </select>
          </label>

          <label className="block text-sm">
            <select
              className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select"
              onChange={handleStatusSelect}
              value={selectedStatus}
            >
              <option value="">-- Status --</option>
              <option value="approved">Approved</option>
              <option value="unapproved">Unapproved</option>
            </select>
          </label>

          <label className="block text-sm">
            <select
              className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select"
              onChange={handleAvailabilitySelect}
              value={selectedAvailability}
            >
              <option value="">-- Availability --</option>
              <option value="netflix">Netflix</option>
              <option value="vidio">Vidio</option>
              <option value="amazon">Amazon</option>
              <option value="disney+">Disney+</option>
              <option value="hbo">HBO</option>
              <option value="hotstar">Hotstar</option>
              <option value="bstation">Bstation</option>
              <option value="crunchyroll">Crunchyroll</option>
            </select>
          </label>
        </div>

        <div className="flex justify-between flex-wrap items-center gap-6">
          <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            Sorted By:
          </h4>

          <label className="block text-sm">
            <select
              className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select"
              onChange={handleSortSelect}
              value={selectedSort}
            >
              <option value="">-- Sort --</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
              <option value="year_desc">Year (Newest)</option>
              <option value="year_asc">Year (Oldest)</option>
            </select>
          </label>

          <label className="block text-sm">
            <select
              className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select"
              onChange={handleAwardSelect}
              value={selectedAward}
            >
              <option value="">-- Award --</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Filter;
