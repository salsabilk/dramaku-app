import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Pagination from "./components/Pagination.jsx";
import Alert from "./components/Alert";
 
import FilterAndSearch from "./components/FilterAndSearch";
import Select from "react-select";

const CmsActors = () => {
  const [actors, setActors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [editableId, setEditableId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editPhoto, setEditPhoto] = useState("");
  const [editCountryId, setEditCountryId] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [filterValue, setFilterValue] = useState("none");
  const [showValue, setShowValue] = useState("10");
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const itemsPerPage = parseInt(showValue);
  const [newActor, setNewActor] = useState({
    countryId: "",
    actorName: "",
    birthDate: "",
    photos: "",
  });

  // Fungsi untuk mengambil data actors
  const fetchActors = async () => {
    try {
      const response = await fetch( process.env.REACT_APP_BASE_API_URL + "/api/actors");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // console.log("Actors data:", data);
      setActors(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching actors:", error);
      showAlert("Failed to fetch actors data", "error");
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
    fetchActors();
    fetchCountries();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewActor({
      ...newActor,
      [name]: value,
    });
  };

  useEffect(() => {
    // console.log(newActor);
  }, [newActor]);

  useEffect(() => {
    if (selectedCountry) {
      setNewActor({
        ...newActor,
        countryId: selectedCountry.value,
      });
      setEditCountryId(selectedCountry.value);
    }
  }, [selectedCountry]);
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", newActor.actorName);
    formData.append("birth_date", newActor.birthDate);
    formData.append("country_id", newActor.countryId);

    if (newActor.photos) {
      formData.append("photo", newActor.photos);
    }

    try {
      const response = await fetch( process.env.REACT_APP_BASE_API_URL + "/api/actors", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const addedActor = await response.json();

      // Reset form
      setNewActor({
        countryId: "",
        actorName: "",
        birthDate: "",
        photos: "",
      });

      // Reset file input
      const fileInput = document.getElementById("photos");
      if (fileInput) fileInput.value = "";

      // Show success message
      showAlert("Actor added successfully!", "success");

      // Fetch updated data after successful addition
      await fetchActors();
    } catch (error) {
      console.error("Error adding actor:", error);
      showAlert("Failed to add actor", "error");
    }
  };

  // Update showAlert function to clear any existing timeout
  const showAlert = (message, type) => {
    if (window.alertTimeout) {
      clearTimeout(window.alertTimeout);
    }

    setAlert({ message, type });
    window.alertTimeout = setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, 3000);
  };

  const editActor = async (id) => {
    try {
      const response = await fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/actors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          birth_date: editBirthDate,
          photo: editPhoto,
          country_id: editCountryId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setEditableId(null);
      showAlert("Actor updated successfully!", "success");
      // Refresh actors list
      await fetchActors();
    } catch (error) {
      console.error("Error updating actor:", error);
      showAlert("Failed to update actor", "error");
    }
  };

  const deleteActor = async (id) => {
    try {
      const response = await fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/actors/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      showAlert("Actor deleted successfully.", "error");
      await fetchActors();
    } catch (error) {
      console.error("Error deleting actor:", error);
      showAlert("Failed to delete actor", "error");
    }
  };

  const handleEditClick = (actor) => {
    setEditableId(actor.id);
    setEditName(actor.name);
    const birthdate = new Date(actor.birth_date);
    const formattedDateForInput = birthdate
      ? birthdate.toISOString().split("T")[0] // format to yyyy-MM-dd
      : "";
    // console.log(formattedDateForInput);
    setEditBirthDate(formattedDateForInput);
    setEditCountryId(actor.country_id);
  };

  const handleSaveClick = (id) => {
    if (window.confirm("Are you sure you want to save changes?")) {
      editActor(id);
    }
  };

  const handleCancelClick = () => {
    setEditableId(null);
    setEditName("");
  };

  // Modifikasi bagian form countries menjadi select dropdown
  const CountrySelect = ({ value, onChange, className }) => (
    <select value={value} onChange={onChange} className={className} required>
      <option value="">Select a country</option>
      {countries.map((country) => (
        <option key={country.id} value={country.id}>
          {country.name}
        </option>
      ))}
    </select>
  );

  // Render country name berdasarkan country_id
  const getCountryName = (countryId) => {
    const country = countries.find((c) => c.value === countryId);
    return country ? country.label : "Unknown";
  };

  const sortActors = (actorsList) => {
    if (!sortValue) return actorsList;

    return [...actorsList].sort((a, b) => {
      switch (sortValue) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "birth_date_asc":
          return a.birth_date - b.birth_date;
        case "birth_date_desc":
          return b.birth_date - a.birth_date;
        default:
          return 0;
      }
    });
  };

  const filterActors = (actorsList) => {
    if (filterValue === "none") return actorsList;
    return actorsList.filter(
      (actor) => actor.status.toLowerCase() === filterValue.toLowerCase()
    );
  };

  const searchActors = (actorsList) => {
    return actorsList.filter((actor) =>
      actor.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const processedActors = sortActors(searchActors(filterActors(actors)));
  const totalItems = processedActors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterValue, searchValue, showValue, sortValue]);

  const indexOfLastActor = currentPage * itemsPerPage;
  const indexOfFirstActor = indexOfLastActor - itemsPerPage;
  const displayedActors = processedActors.slice(
    indexOfFirstActor,
    indexOfLastActor
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
                Actors Management
              </h2>

              <FilterAndSearch
                showFilterSection={false}
                showValue={showValue}
                setShowValue={setShowValue}
                showOptions={[
                  { value: "10", label: "10" },
                  { value: "20", label: "20" },
                  { value: "30", label: "30" },
                  { value: "40", label: "40" },
                ]}
                sortValue={sortValue}
                setSortValue={setSortValue}
                sortOptions={[
                  { value: "", label: "-- Sort --" },
                  { value: "name_asc", label: "Name (A-Z)" },
                  { value: "name_desc", label: "Name (Z-A)" },
                ]}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                searchPlaceholder="Search actor..."
              />

              <br></br>

              {alert.message && (
                <Alert
                  message={alert.message}
                  type={alert.type}
                  onClose={() => setAlert({ message: "", type: "" })}
                />
              )}

              <div className="w-full overflow-hidden rounded-lg shadow-xs">
                <div className="w-full overflow-x-auto">
                  <form
                    onSubmit={handleFormSubmit}
                    className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 grid grid-cols-2 gap-6"
                  >
                    <div className="mb-4">
                      <label
                        htmlFor="countryId"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                      >
                        Country
                      </label>
                      <Select
                        onChange={setSelectedCountry}
                        options={countries}
                        placeholder="Select a country"
                        maxMenuHeight={190}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="actorName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                      >
                        Actor Name
                      </label>
                      <input
                        type="text"
                        id="actorName"
                        name="actorName"
                        required
                        value={newActor.actorName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="birthDate"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                      >
                        Birth Date
                      </label>
                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        required
                        value={newActor.birthDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="photos"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                      >
                        Upload Picture
                      </label>
                      <input
                        type="file"
                        id="photos"
                        name="photos"
                        required
                        accept="image/*"
                        onChange={(e) =>
                          setNewActor({
                            ...newActor,
                            photos: e.target.files[0], // mengambil file yang dipilih
                          })
                        }
                        className="w-full px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 mx-auto mt-2 col-span-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
                    >
                      Submit
                    </button>
                  </form>
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-hidden rounded-lg shadow-xs mt-8">
                <div className="w-full overflow-x-auto">
                  <table className="w-full whitespace-no-wrap">
                    <thead>
                      <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Country</th>
                        <th className="px-4 py-3">Actor Name</th>
                        <th className="px-4 py-3">Birth Date</th>
                        <th className="px-4 py-3">Photo</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                      {displayedActors.map((actor, index) => {
                        const birth_date = new Date(actor.birth_date);
                        const formattedDate =
                          birth_date.toLocaleDateString("id-ID");

                        return (
                          <tr
                            key={actor?.id}
                            className="text-gray-700 dark:text-gray-400"
                          >
                            <td className="px-4 py-3 text-sm">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {editableId === actor?.id ? (
                                <Select
                                  defaultValue={countries.find(
                                    (country) => country.value === editCountryId
                                  )}
                                  onChange={setSelectedCountry}
                                  options={countries}
                                  placeholder="Select a country"
                                />
                              ) : (
                                getCountryName(actor.country_id)
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {editableId === actor?.id ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-[100px] px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                                />
                              ) : (
                                actor.name
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {editableId === actor?.id ? (
                                <input
                                  type="date"
                                  value={editBirthDate}
                                  onChange={(e) =>
                                    setEditBirthDate(e.target.value)
                                  }
                                  className="w-[130px] px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                                />
                              ) : (
                                formattedDate
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {actor.photo ? (
                                <img
                                  src={actor.photo}
                                  alt={`${actor.name}'s photo`}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <span className="text-gray-500">No photo</span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-4 text-sm">
                                {editableId === actor.id ? (
                                  <>
                                    <button
                                      className="save-btn flex items-center justify-between w-[100px] px-4 py-2 text-sm font-medium leading-5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
                                      aria-label="Save"
                                      onClick={() => handleSaveClick(actor.id)}
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
                                        actor
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
                                        "Are you sure you want to delete this actor?"
                                      )
                                    ) {
                                      deleteActor(actor.id);
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
                        );
                      })}
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

export default CmsActors;
