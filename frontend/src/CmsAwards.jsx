import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Pagination from "./components/Pagination.jsx";
import Alert from "./components/Alert";
 
import FilterAndSearch from "./components/FilterAndSearch";
import Select from "react-select";

const CmsAwards = () => {
  const [awards, setAwards] = useState([]);
  const [awardName, setAwardName] = useState("");
  const [awardYear, setAwardYear] = useState("");
  const [countryId, setCountryId] = useState("");
  const [countries, setCountries] = useState([]);
  const [editableId, setEditableId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editCountryId, setEditCountryId] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [filterValue, setFilterValue] = useState("none");
  const [showValue, setShowValue] = useState("10");
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState("");
  const itemsPerPage = parseInt(showValue, 10);

  const fetchAwards = async () => {
    try {
      const response = await fetch( process.env.REACT_APP_BASE_API_URL + "/api/awards");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // console.log("Awards data:", data);
      setAwards(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching awards:", error);
      showAlert("Failed to fetch awards data", "error");
    }
  };

  // Fungsi untuk mengambil data countries
  const fetchCountries = async () => {
    const limit = 10; // Tentukan limit data per halaman
    let page = 1;
    let hasMoreData = true;

    try {
      while (hasMoreData) {
        const response = await fetch(
          `${ process.env.REACT_APP_BASE_API_URL}/api/countries?page=${page}&limit=${limit}`
        );
        const data = await response.json();

        setCountries((prevCountries) => {
          // Menggabungkan data negara baru dengan negara sebelumnya tanpa duplikat
          const countryMap = new Map(
            prevCountries.map((country) => [country.value, country])
          );

          data.countries.forEach((newCountry) => {
            if (!countryMap.has(newCountry.id)) {
              countryMap.set(newCountry.id, {
                value: newCountry.id,
                label: newCountry.name,
              });
            }
          });

          // Ubah Map kembali menjadi array
          return Array.from(countryMap.values());
        });

        // Cek apakah masih ada data yang perlu diambil
        hasMoreData = data.countries.length === limit;
        page += 1;
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  useEffect(() => {
    fetchAwards();
    fetchCountries();
  }, []);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 3000);
  };

  const addAward = async () => {
    try {
      const response = await fetch( process.env.REACT_APP_BASE_API_URL + "/api/awards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: awardName,
          year: awardYear,
          country_id: countryId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newAward = await response.json();
      // Add the new award at the beginning of the array
      setAwards([newAward, ...awards]);
      setAwardName("");
      setAwardYear("");
      setCountryId("");
      showAlert("Award added successfully!", "success");
      setCurrentPage(1); // Reset to first page to show the new entry
    } catch (error) {
      console.error("Error adding award:", error);
      showAlert("Failed to add award", "error");
    }
  };

  const editAward = async (id) => {
    try {
      const response = await fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/awards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          year: editYear,
          country_id: editCountryId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedAward = await response.json();

      // Remove the old award and add the updated one at the beginning
      setAwards((prevAwards) => {
        const filteredAwards = prevAwards.filter((award) => award.id !== id);
        return [updatedAward, ...filteredAwards];
      });

      setEditableId(null);
      showAlert("Award updated successfully!", "info");
      setCurrentPage(1); // Reset to first page to show the updated entry
    } catch (error) {
      console.error("Error updating award:", error);
      showAlert("Failed to update award", "error");
    }
  };

  const deleteAward = async (id) => {
    try {
      const response = await fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/awards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setAwards(awards.filter((award) => award.id !== id));
      showAlert("Award deleted successfully.", "error");

      // Adjust current page if necessary
      const remainingItems = awards.length - 1;
      const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
    } catch (error) {
      console.error("Error deleting award:", error);
      showAlert("Failed to delete award", "error");
    }
  };

  const handleEditClick = (id, name, year, countryId) => {
    setEditableId(id);
    setEditName(name);
    setEditYear(year);
    setEditCountryId(countryId); // Store the country_id when editing starts
  };

  const handleSaveClick = (id) => {
    if (window.confirm("Are you sure you want to save changes?")) {
      editAward(id);
    }
  };

  const handleCancelClick = () => {
    setEditableId(null);
    setEditName("");
  };

  const sortAwards = (awardsList) => {
    if (!sortValue) return awardsList;

    return [...awardsList].sort((a, b) => {
      switch (sortValue) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "year_asc":
          return a.year - b.year;
        case "year_desc":
          return b.year - a.year;
        default:
          return 0;
      }
    });
  };

  const filterAwards = (awardsList) => {
    if (filterValue === "none") return awardsList;
    return awardsList.filter(
      (award) => award.status.toLowerCase() === filterValue.toLowerCase()
    );
  };

  const searchAwards = (awardsList) => {
    return awardsList.filter(
      (award) =>
        award.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        award.year.toString().includes(searchValue)
    );
  };

  const processedAwards = sortAwards(searchAwards(filterAwards(awards)));
  const totalItems = processedAwards.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterValue, searchValue, showValue, sortValue]);

  useEffect(() => {
    setCountryId(selectedCountry.value);
    setEditCountryId(selectedCountry.value);
  }, [selectedCountry]);

  const indexOfLastAward = currentPage * itemsPerPage;
  const indexOfFirstAward = indexOfLastAward - itemsPerPage;
  const displayedAwards = processedAwards.slice(
    indexOfFirstAward,
    indexOfLastAward
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <div className="mt-10 flex-1 flex flex-col">
          <main className="flex-1 pb-16 overflow-y-auto">
            <div className="container grid px-6 mx-auto">
              <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
                Awards Management
              </h2>

              <FilterAndSearch
                showFilterSection={false}
                showShowsSection={true}
                showSortSection={true}
                showSearchSection={true}
                showValue={showValue}
                setShowValue={setShowValue}
                sortValue={sortValue}
                setSortValue={setSortValue}
                sortOptions={[
                  { value: "", label: "-- Sort --" },
                  { value: "name_asc", label: "Name (A-Z)" },
                  { value: "name_desc", label: "Name (Z-A)" },
                  { value: "year_asc", label: "Year (Low to High)" },
                  { value: "year_desc", label: "Year (High to Low)" },
                ]}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                searchPlaceholder="Search awards..."
              />

              <br />

              {alert.message && (
                <Alert
                  message={alert.message}
                  type={alert.type}
                  onClose={() => setAlert({ message: "", type: "" })}
                />
              )}

              <div className="w-full overflow-hidden rounded-lg shadow-xs mb-8">
                <div className="w-full overflow-x-auto">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (awardName && awardYear && countryId) {
                        addAward();
                      }
                    }}
                    className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800"
                  >
                    <div className="mb-4">
                      <label
                        htmlFor="award"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                      >
                        Award Name
                      </label>
                      <input
                        type="text"
                        id="award"
                        name="award"
                        required
                        value={awardName}
                        onChange={(e) => setAwardName(e.target.value)}
                        className="w-full px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="year"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                      >
                        Award Year
                      </label>
                      <input
                        type="number"
                        id="year"
                        name="year"
                        required
                        value={awardYear}
                        onChange={(e) => setAwardYear(e.target.value)}
                        className="w-full px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                      >
                        Country
                      </label>
                      <Select
                        onChange={setSelectedCountry}
                        options={countries}
                        placeholder="Select a country"
                        maxMenuHeight={190}
                        menuPlacement="top"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
                    >
                      Submit
                    </button>
                  </form>
                </div>
              </div>

              <div className="w-full overflow-hidden rounded-lg shadow-xs mt-8">
                <div className="w-full overflow-x-auto">
                  <table className="w-full whitespace-no-wrap">
                    <thead>
                      <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Award</th>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3">Country</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                      {displayedAwards.map((award, index) => (
                        <tr
                          key={award?.id}
                          className="text-gray-700 dark:text-gray-400"
                        >
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center text-sm">
                              <div>{indexOfFirstAward + index + 1}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editableId === award?.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                autoFocus
                                className="w-[100px] px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                              />
                            ) : (
                              award.name
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editableId === award?.id ? (
                              <input
                                type="number"
                                value={editYear}
                                onChange={(e) => setEditYear(e.target.value)}
                                className="w-[80px] px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                              />
                            ) : (
                              award.year
                            )}
                          </td>

                          <td className="px-4 py-3 text-sm">
                            {editableId === award?.id ? (
                              <Select
                                defaultValue={countries.find(
                                  (country) => country.value === editCountryId
                                )}
                                onChange={setSelectedCountry}
                                options={countries}
                                placeholder="Select a country"
                                maxMenuHeight={190}
                                menuPlacement="auto"
                              />
                            ) : (
                              countries.find(
                                (country) => country.value === award.country_id
                              )?.label
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-4 text-sm">
                              {editableId === award.id ? (
                                <>
                                  <button
                                    className="save-btn flex items-center justify-between w-[100px] px-4 py-2 text-sm font-medium leading-5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
                                    aria-label="Save"
                                    onClick={() => handleSaveClick(award.id)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-5 h-5"
                                      aria-hidden="true"
                                      fill="currentColor"
                                      viewBox="0 0 512 512"
                                    >
                                      <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z" />
                                    </svg>
                                    <span className="ml-2">Save</span>
                                  </button>
                                  <button
                                    className="cancel-btn flex items-center justify-between w-[100px] px-4 py-2 text-sm font-medium leading-5 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:shadow-outline-yellow"
                                    aria-label="Cancel"
                                    onClick={handleCancelClick}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-5 h-5"
                                      aria-hidden="true"
                                      fill="currentColor"
                                      viewBox="0 0 512 512"
                                    >
                                      <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z" />
                                    </svg>
                                    <span className="ml-2">Cancel</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="edit-btn flex items-center justify-between w-[100px] px-4 py-2 text-sm font-medium leading-5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
                                  aria-label="Edit"
                                  onClick={() =>
                                    handleEditClick(
                                      award.id,
                                      award.name,
                                      award.year,
                                      award.country_id
                                    )
                                  }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 512 512"
                                  >
                                    <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32L64 160c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z" />
                                  </svg>
                                  <span className="ml-2">Edit</span>
                                </button>
                              )}

                              <button
                                className="delete-btn flex items-center justify-between w-[100px] px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:shadow-outline-red"
                                aria-label="Delete"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this item?"
                                    )
                                  ) {
                                    deleteAward(award.id);
                                  }
                                }}
                              >
                                <svg
                                  className="w-5 h-5"
                                  aria-hidden="true"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                                <span className="ml-2">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {displayedAwards.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-4 py-3 text-sm text-center text-gray-500"
                          >
                            No awards found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  paginate={handlePageChange}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CmsAwards;
