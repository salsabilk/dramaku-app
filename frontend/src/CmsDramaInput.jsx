import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
 

const CmsDramaInput = () => {
  const { id } = useParams();
  const [bannerPreview, setBannerPreview] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [awards, setAwards] = useState([]);
  const [selectedAwards, setSelectedAwards] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [actors, setActors] = useState([]);
  const [selectedActors, setSelectedActors] = useState([]);
  const [editDrama, setEditDrama] = useState(null);
  const [newDrama, setNewDrama] = useState({
    title: "",
    altTitle: "",
    year: "",
    country: "",
    synopsis: "",
    availability: "",
    trailer: "",
    awards: [],
    genres: [],
    actors: [],
    photo: "",
  });

  const navigate = useNavigate(); // Definisikan navigate
  useEffect(() => {
    fetch( process.env.REACT_APP_BASE_API_URL + "/api/drama/" + id)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEditDrama(data);
      })
      .catch((error) => {
        console.error("Error fetching film", error);
      });
    fetchCountries();
    fetchAwards();
    fetchGenres();
    fetchActors();
  }, []);

  useEffect(() => {
    if (editDrama) {
      setNewDrama({
        title: editDrama.title,
        altTitle: editDrama.alt_title,
        year: editDrama.year,
        country: editDrama.country_id,
        synopsis: editDrama.synopsis,
        availability: editDrama.availability,
        trailer: editDrama.link_trailer,
        awards: (editDrama.Awards || []).map((award) => Number(award.id)),
        genres: (editDrama.Genres || []).map((genre) => Number(genre.id)),
        actors: (editDrama.Actors || []).map((actor) => Number(actor.id)),
        photo: editDrama.photo,
      });

      setSelectedCountry(editDrama.country_id);
      setSelectedAwards(
        editDrama.Awards.map((award) => ({
          value: award.id,
          label: award.name + " - " + award.year,
        }))
      );
      setSelectedGenres(
        editDrama.Genres.map((genre) => ({
          value: genre.id,
          label: genre.name,
        }))
      );
      setSelectedActors(
        editDrama.Actors.map((actor) => ({
          value: actor.id,
          label: actor.name,
          photo: actor.photo,
        }))
      );
    }
  }, [editDrama]);

  useEffect(() => {
    setNewDrama({
      ...newDrama,
      actors: selectedActors.map((actor) => actor.value),
    });
  }, [selectedActors]);
  useEffect(() => {
    setNewDrama({
      ...newDrama,
      awards: selectedAwards.map((award) => award.value),
    });
  }, [selectedAwards]);
  useEffect(() => {
    setNewDrama({
      ...newDrama,
      genres: selectedGenres.map((genre) => genre.value),
    });
  }, [selectedGenres]);
  useEffect(() => {
    setNewDrama({
      ...newDrama,
      country: selectedCountry?.value,
    });
  }, [selectedCountry]);

  const fetchActors = async () => {
    fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/actors`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setActors(data);
        const transformedData = data.map((actor) => ({
          value: actor.id,
          label: actor.name,
          photo: actor.photo,
        }));

        setActors(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching awards:", error);
      });
  };

  const fetchGenres = async () => {
    const limit = 10; // Tentukan limit data per halaman
    let page = 1;
    let hasMoreData = true;

    try {
      while (hasMoreData) {
        const response = await fetch(
          `${ process.env.REACT_APP_BASE_API_URL}/api/genres?page=${page}&limit=${limit}`
        );
        const data = await response.json();

        setGenres((prevGenres) => {
          // Menggabungkan genre baru dengan genre sebelumnya tanpa duplikat
          const genreMap = new Map(
            prevGenres.map((genre) => [genre.value, genre])
          );

          data.genres.forEach((newGenre) => {
            if (!genreMap.has(newGenre.id)) {
              genreMap.set(newGenre.id, {
                value: newGenre.id,
                label: newGenre.name,
              });
            }
          });

          // Ubah Map kembali menjadi array
          return Array.from(genreMap.values());
        });

        // Cek apakah masih ada data yang perlu diambil
        hasMoreData = data.genres.length === limit;
        page += 1;
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchAwards = () => {
    fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/awards`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setAwards(data);
        const transformedData = data.map((award) => ({
          value: award.id,
          label: award.name + " - " + award.year,
        }));

        setAwards(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching awards:", error);
      });
  };

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

  const handleBannerChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newDrama.title);
    formData.append("alt_title", newDrama.altTitle);
    formData.append("year", newDrama.year);
    formData.append("country_id", newDrama.country);
    formData.append("synopsis", newDrama.synopsis);
    formData.append("availability", newDrama.availability);
    formData.append("link_trailer", newDrama.trailer);
    formData.append("awards", JSON.stringify(newDrama.awards));
    formData.append("genres", JSON.stringify(newDrama.genres));
    formData.append("actors", JSON.stringify(newDrama.actors));

    if (newDrama.photo) {
      formData.append("photo", newDrama.photo);
    }
    const isEditMode = window.location.pathname.includes('/edit');
    const method = isEditMode ? "PUT" : "POST";
    const apiUrl = isEditMode
    ? `${ process.env.REACT_APP_BASE_API_URL}/api/dramas/${editDrama.id}` // Pastikan ID drama tersedia untuk PUT
    : `${ process.env.REACT_APP_BASE_API_URL}/api/dramas`;

    try {
      const response = await fetch(apiUrl, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        alert(isEditMode ? "Drama updated successfully!" : "Drama added successfully!");
        navigate('/cmsdramas');
      } else {
        alert(isEditMode ? "Failed to update drama!" : "Failed to add drama!");
      }
    } catch (error) {
      console.error("Error submitting drama:", error);
      alert(isEditMode ? "Failed to update drama!" : "Failed to add drama!");
    }
  };

  // const editDramaEntry = (id, updatedDrama) => {
  //   fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/dramas/${id}`, {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json", // Ensure the content type is set to JSON
  //     },
  //     body: JSON.stringify(updatedDrama),
  //   })
  //     .then((response) => {
  //       if (response.ok) {
  //         setDramas(
  //           dramas.map((drama) =>
  //             drama.id === id ? { ...drama, ...updatedDrama } : drama
  //           )
  //         );
  //       } else {
  //         throw new Error("Failed to update drama");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error updating drama:", error);
  //     });
  // };

  const resetForm = () => {
    setNewDrama({
      title: "",
      altTitle: "",
      year: "",
      country: "",
      synopsis: "",
      availability: "",
      trailer: "",
      awards: [],
      genres: [],
      actors: [],
      photo: "",
    });
    setBannerPreview(null);
    setSelectedCountry(null);
    setSelectedAwards([]);
    setSelectedGenres([]);
    setSelectedActors([]);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <div className="mt-10 flex-1 flex flex-col">
          <main className="h-full pb-16 overflow-y-auto">
            <div className="container grid px-6 mx-auto">
              <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
                Tables Drama
              </h2>

              <div className="flex flex-col items-center bg-white text-black">
                <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-12 space-y-10">
                  <form
                    className="space-y-8"
                    onSubmit={handleSubmit} // Tambahkan handleSubmit pada onSubmit
                  >
                    <div className="grid grid-cols-12 gap-6">
                      {/* Banner Image Upload */}
                      <div className="col-span-3">
                        <label
                          htmlFor="banner"
                          className="block text-sm font-medium text-gray-600"
                        >
                          Banner Image
                        </label>
                        <input
                          type="file"
                          id="banner"
                          className="w-full p-2 rounded-md border border-gray-300 focus:ring focus:ring-blue-500"
                          accept="image/*"
                          onChange={(e) => {
                            handleBannerChange(e);
                            setNewDrama({
                              ...newDrama,
                              photo: e.target.files[0],
                            });
                          }}
                        />
                        {bannerPreview && (
                          <img
                            id="banner-preview"
                            className="mt-4 w-full rounded-md shadow-md"
                            src={bannerPreview}
                            alt="Banner Preview"
                          />
                        )}
                      </div>

                      {/* Form Fields */}
                      <div className="col-span-9 grid grid-cols-12 gap-4">
                        {/* Title and Alt Title */}
                        <div className="col-span-6">
                          <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-600"
                          >
                            Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            name="title"
                            value={newDrama.title}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gray-700"
                            placeholder="Enter the drama title"
                            onChange={(e) => {
                              setNewDrama({
                                ...newDrama,
                                title: e.target.value,
                              });
                            }}
                          />
                        </div>
                        <div className="col-span-6">
                          <label
                            htmlFor="altTitle"
                            className="block text-sm font-medium text-gray-600"
                          >
                            Alternative Title
                          </label>
                          <input
                            type="text"
                            id="altTitle"
                            name="altTitle"
                            value={newDrama.altTitle}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gray-700"
                            placeholder="Enter the alternative title"
                            onChange={(e) => {
                              setNewDrama({
                                ...newDrama,
                                altTitle: e.target.value,
                              });
                            }}
                          />
                        </div>

                        {/* Year and Country */}
                        <div className="col-span-6">
                          <label
                            htmlFor="year"
                            className="block text-sm font-medium text-gray-600"
                          >
                            Year
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            id="year"
                            name="year"
                            value={newDrama.year}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gray-700 h-10"
                            autoComplete="off"
                            placeholder="Enter the year"
                            onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              setNewDrama({
                                ...newDrama,
                                year: e.target.value,
                              });
                            }}
                          />
                        </div>
                        <div className="col-span-6">
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-600 mb-1"
                          >
                            Country
                          </label>
                          {countries.length > 0 ? (
                            editDrama ||
                            !window.location.pathname.includes("/edit") ? (
                              <Select
                                defaultValue={
                                  editDrama
                                    ? countries.find(
                                        (country) =>
                                          country.value === editDrama.country_id
                                      )
                                    : null
                                }
                                onChange={setSelectedCountry}
                                options={countries}
                                placeholder="Select a country"
                              />
                            ) : (
                              <p>Loading...</p> // atau komponen loader yang sesuai
                            )
                          ) : (
                            <p>Loading...</p>
                          )}
                        </div>

                        {/* Synopsis */}
                        <div className="col-span-12">
                          <label
                            htmlFor="synopsis"
                            className="block text-sm font-medium text-gray-600"
                          >
                            Synopsis
                          </label>
                          <textarea
                            id="synopsis"
                            name="synopsis"
                            rows="4"
                            value={newDrama.synopsis}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gray-700"
                            onChange={(e) => {
                              setNewDrama({
                                ...newDrama,
                                synopsis: e.target.value,
                              });
                            }}
                            placeholder="Ex:  Synopsis sometimes unhelpful. I don’t read it thoroughly. But what helps me is the genres. I need to see genres and actors. That’s what I want."
                          ></textarea>
                        </div>

                        {/* Availability */}
                        <div className="col-span-6">
                          <label
                            htmlFor="availability"
                            className="block text-sm font-medium text-gray-600"
                          >
                            Availability
                          </label>
                          <input
                            type="text"
                            id="availability"
                            name="availability"
                            value={newDrama.availability}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gray-700"
                            placeholder="Ex: Fansub: @xxosub on X"
                            onChange={(e) => {
                              setNewDrama({
                                ...newDrama,
                                availability: e.target.value,
                              });
                            }}
                          />
                        </div>

                        {/* Trailer Link and Award */}
                        <div className="col-span-6">
                          <label
                            htmlFor="trailer"
                            className="block text-sm font-medium text-gray-600"
                          >
                            Link Trailer
                          </label>
                          <input
                            type="text"
                            id="trailer"
                            name="trailer"
                            value={newDrama.trailer}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gray-700"
                            placeholder="Enter the trailer link"
                            onChange={(e) => {
                              setNewDrama({
                                ...newDrama,
                                trailer: e.target.value,
                              });
                            }}
                          />
                        </div>
                        <div className="col-span-12">
                          <label
                            htmlFor="award"
                            className="block text-sm font-medium text-gray-600 mb-1"
                          >
                            Awards
                          </label>
                          {awards.length > 0 ? (
                            editDrama ||
                            !window.location.pathname.includes("/edit") ? (
                              <Select
                                defaultValue={
                                  editDrama && editDrama.Awards
                                    ? editDrama.Awards.map((award) => ({
                                        value: award.id,
                                        label: `${award.name} - ${award.year}`,
                                      }))
                                    : []
                                }
                                onChange={setSelectedAwards}
                                isMulti={true}
                                options={awards}
                                placeholder="Select Awards"
                              />
                            ) : (
                              <p>Loading...</p> // atau komponen loader yang sesuai
                            )
                          ) : (
                            <p>Loading...</p>
                          )}
                        </div>

                        {/* Genres */}
                        <div className="col-span-12">
                          <label
                            htmlFor="genres"
                            className="block mb-1 text-sm font-medium text-gray-600"
                          >
                            Genres
                          </label>
                          {genres.length > 0 ? (
                            editDrama ||
                            !window.location.pathname.includes("/edit") ? (
                              <Select
                                defaultValue={
                                  editDrama && editDrama.Genres
                                    ? editDrama.Genres.map((genre) => ({
                                        value: genre.id,
                                        label: genre.name,
                                      }))
                                    : []
                                }
                                onChange={setSelectedGenres}
                                isMulti={true}
                                options={genres}
                                placeholder="Select Genres"
                              />
                            ) : (
                              <p>Loading...</p> // atau komponen loader yang sesuai
                            )
                          ) : (
                            <p>Loading...</p>
                          )}
                        </div>

                        {/* Add Actors */}
                        <div className="col-span-12">
                          <label
                            htmlFor="actors"
                            className="block mb-1 text-sm font-medium text-gray-600"
                          >
                            Actors (Up to 9)
                          </label>
                          {actors.length > 0 ? (
                            editDrama ||
                            !window.location.pathname.includes("/edit") ? (
                              <Select
                                defaultValue={
                                  editDrama && editDrama.Actors
                                    ? editDrama.Actors.map((actor) => ({
                                        value: actor.id,
                                        label: actor.name,
                                      }))
                                    : []
                                }
                                onChange={setSelectedActors}
                                isMulti={true}
                                options={actors}
                                placeholder="Select Actors"
                              />
                            ) : (
                              <p>Loading...</p> // atau komponen loader yang sesuai
                            )
                          ) : (
                            <p>Loading...</p>
                          )}

                          <div className="grid grid-cols-10 mt-1 gap-4">
                            {selectedActors.map((actor) => (
                              <div className="w-20 h-40 rounded-full overflow-hidden">
                                <img
                                  src={actor.photo}
                                  alt={actor.label}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center mt-12">
                      <button
                        type="submit"
                        className="px-6 py-3 text-white bg-purple-600 rounded-md hover:bg-purple-700"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CmsDramaInput;
