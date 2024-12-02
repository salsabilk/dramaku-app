import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Pagination from "./components/Pagination";
import Alert from "./components/Alert";
 
import FilterAndSearch from "./components/FilterAndSearch";

const CmsCountries = () => {
  const [countries, setCountries] = useState([]);
  const [countryName, setCountryName] = useState("");
  const [editableId, setEditableId] = useState(null);
  const [editName, setEditName] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [showValue, setShowValue] = useState("10");
  const [sortValue, setSortValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("none");

  // Fetch countries setiap kali currentPage berubah
  useEffect(() => {
    fetchCountries(currentPage);
  }, [currentPage]);

  const fetchCountries = (page) => {
    fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/countries?page=${page}&limit=${itemsPerPage}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCountries(data.countries);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
      });
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 3000); // Alert hilang setelah 3 detik
  };

  const addCountry = (name) => {
    fetch( process.env.REACT_APP_BASE_API_URL + "/api/countries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((newCountry) => {
        setCountryName("");
        showAlert("Data added successfully!", "success");
        setCurrentPage(1);
        fetchCountries(1);
      })
      .catch((error) => {
        console.error("Error adding country:", error);
        showAlert("Error adding country", "error");
      });
  };

  const editCountry = (id, name) => {
    fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/countries/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((updatedCountry) => {
        setCountries(
          countries.map((country) =>
            country.id === id ? updatedCountry : country
          )
        );
        setEditableId(null);
        setEditName("");
        showAlert("Data updated successfully!", "info");
        fetchCountries(currentPage);
      })
      .catch((error) => {
        console.error("Error updating country:", error);
        showAlert("Error updating country", "error");
      });
  };

  const deleteCountry = (id) => {
    fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/countries/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        showAlert("Data deleted successfully.", "error");
        if (countries.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchCountries(currentPage);
        }
      })
      .catch((error) => {
        console.error("Error deleting country:", error);
      });
  };

  const handleEditClick = (id, name) => {
    setEditableId(id);
    setEditName(name);
  };

  const handleSaveClick = (id) => {
    if (window.confirm("Are you sure you want to save changes?")) {
      editCountry(id, editName);
      setEditableId(null);
      setEditName("");
    }
  };

  const handleCancelClick = () => {
    setEditableId(null);
    setEditName("");
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Add the sortCountries function inside the CmsCountries component
  const sortCountries = (countries) => {
    if (!sortValue) return countries;

    return [...countries].sort((a, b) => {
      switch (sortValue) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  };

  // Update the filtering in CmsCountries.jsx
  const filteredCountries = (countries || []).filter((country) => {
    if (filterValue === "none") return true;
    return (country.status || "").toLowerCase() === filterValue.toLowerCase();
  });

  // Update the searching in CmsCountries.jsx
  const searchedCountries = (filteredCountries || []).filter(
    (country) =>
      (country.name || "").toLowerCase().includes(searchValue.toLowerCase()) ||
      (country.code || "").toLowerCase().includes(searchValue.toLowerCase())
  );

  const sortedCountries = sortCountries(searchedCountries);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <div className="mt-10 flex-1 flex flex-col">
          <main className="flex-1 pb-16 overflow-y-auto">
            <div className="container grid px-6 mx-auto">
              <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
                Countries Management
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
                ]}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                searchPlaceholder="Search for countries"
              />

              <br></br>

              {/* Tampilkan alert jika ada */}
              {alert.message && (
                <Alert
                  message={alert.message}
                  type={alert.type}
                  onClose={() => setAlert({ message: "", type: "" })}
                />
              )}

              <br></br>

              <div className="w-full overflow-hidden rounded-lg shadow-xs">
                <div className="w-full overflow-x-auto">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (countryName) {
                        addCountry(countryName);
                        setCountryName("");
                      }
                    }}
                    className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800"
                  >
                    <div className="mb-4">
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                      >
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        required
                        value={countryName}
                        onChange={(e) => setCountryName(e.target.value)}
                        className="w-full px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
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
                        <th className="px-4 py-3">Countries</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                      {sortedCountries.map((country, index) => (
                        <tr
                          key={country.id}
                          className="text-gray-700 dark:text-gray-400"
                        >
                          <td className="px-4 py-3 text-sm">
                            {index + 1 + (currentPage - 1) * itemsPerPage}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editableId === country.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={() => handleSaveClick(country.id)}
                                autoFocus
                                className="w-[100px] px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                              />
                            ) : (
                              <span
                                onDoubleClick={() =>
                                  handleEditClick(country.id, country.name)
                                }
                                className="w-[100px] inline-block"
                              >
                                {country.name}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-4 text-sm">
                              {editableId === country.id ? (
                                <>
                                  <button
                                    className="save-btn flex items-center justify-between px-4 py-2 text-sm font-medium leading-5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
                                    aria-label="Save"
                                    onClick={() => handleSaveClick(country.id)}
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
                                    className="cancel-btn flex items-center justify-between px-4 py-2 text-sm font-medium leading-5 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:shadow-outline-yellow"
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
                                    handleEditClick(country.id, country.name)
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
                                    deleteCountry(country.id);
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

export default CmsCountries;
