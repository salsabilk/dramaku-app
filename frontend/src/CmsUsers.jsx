import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Pagination from "./components/Pagination";
import Alert from "./components/Alert";
 
import FilterAndSearch from "./components/FilterAndSearch";

const CmsUsers = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [editableId, setEditableId] = useState(null);
  const [editUser, setEditUser] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterValue, setFilterValue] = useState("none");
  const [showValue, setShowValue] = useState("10");
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState("");
  const itemsPerPage = parseInt(showValue);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterValue, searchValue, sortValue, showValue]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_API_URL}/api/users?page=${currentPage}&limit=${itemsPerPage}&filter=${filterValue}&search=${searchValue}&sort=${sortValue}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(sortUsers(data.users));
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error("Error fetching users:", error);
      showAlert("Failed to fetch users.", "error");
    }
  };

  const suspendUser = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_API_URL}/api/users/${id}/suspend`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to suspend user");
      }
      showAlert("User suspended successfully", "success");
      fetchUsers(currentPage);
    } catch (error) {
      showAlert(error.message, "error");
    }
  };

  const activateUser = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_API_URL}/api/users/${id}/activate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to activate user");
      }
      showAlert("User activated successfully", "success");
      fetchUsers(currentPage);
    } catch (error) {
      showAlert(error.message, "error");
    }
  };

  // const fetchUsers = (page) => {
  //   fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/users?page=${page}&limit=${itemsPerPage}`)
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //       setUsers(data.users);
  //       setTotalPages(data.totalPages);
  //       setTotalItems(data.totalItems);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching users:", error);
  //     });
  // };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 3000);
  };

  const addUser = (userData) => {
    fetch( process.env.REACT_APP_BASE_API_URL + "/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((newUser) => {
        setNewUser({ username: "", email: "", role: "" });
        showAlert("Data added successfully!", "success");
        setCurrentPage(1);
        fetchUsers(1);
      })
      .catch((error) => {
        console.error("Error adding user:", error);
        showAlert("Error adding user", "error");
      });
  };

  const updateUser = (id, userData) => {
    fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((updatedUser) => {
        setUsers(users.map((user) => (user.id === id ? updatedUser : user)));
        setEditableId(null);
        setEditUser({ username: "", email: "", role: "" });
        showAlert("Data updated successfully!", "info");
        fetchUsers(currentPage);
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        showAlert("Error updating user", "error");
      });
  };

  const deleteUser = (id) => {
    fetch(`${ process.env.REACT_APP_BASE_API_URL}/api/users/${id}`, {
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
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchUsers(currentPage);
        }
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

  const handleEditClick = (user) => {
    setEditableId(user.id);
    setEditUser({
      username: user.username,
      email: user.email,
      role: user.role,
    });
  };

  const handleSaveClick = (id) => {
    if (window.confirm("Are you sure you want to save changes?")) {
      updateUser(id, editUser);
    }
  };

  const handleCancelClick = () => {
    setEditableId(null);
    setEditUser({ username: "", email: "", role: "" });
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const sortUsers = (users) => {
    if (!sortValue) return users;

    return [...users].sort((a, b) => {
      switch (sortValue) {
        case "username_asc":
          return a.username.localeCompare(b.username);
        case "username_desc":
          return b.username.localeCompare(a.username);
        case "email_asc":
          return a.email.localeCompare(b.email);
        case "email_desc":
          return b.email.localeCompare(a.email);
        case "role_asc":
          return a.role.localeCompare(b.role);
        case "role_desc":
          return b.role.localeCompare(a.role);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  // Search safely with a fallback in case filteredUsers are undefined
  const searchedUsers = (users || []).filter(
    (user) =>
      user.username.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Apply sorting to the searched users
  const sortedUsers = sortUsers(searchedUsers);

  const totalItemsCount = searchedUsers.length;
  const totalPagesCalculated = Math.ceil(totalItemsCount / itemsPerPage);
  useEffect(() => {
    setTotalPages(totalPagesCalculated);
  }, [totalItemsCount, itemsPerPage]);

  // Calculate total items and pages based on searched users
  // const totalItems = searchedUsers.length;
  // const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Rest of the component remains the same...
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <div className="mt-10 flex-1 flex flex-col">
          <main className="flex-1 pb-16 overflow-y-auto">
            <div className="container grid px-6 mx-auto">
              <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
                Users Management
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
                  { value: "username_asc", label: "Username (A-Z)" },
                  { value: "username_desc", label: "Username (Z-A)" },
                  { value: "email_asc", label: "Email (A-Z)" },
                  { value: "email_desc", label: "Email (Z-A)" },
                  { value: "role_asc", label: "Role (A-Z)" },
                  { value: "role_desc", label: "Role (Z-A)" },
                ]}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                searchPlaceholder="Search users..."
              />

              <br></br>

              {alert.message && (
                <Alert
                  message={alert.message}
                  type={alert.type}
                  onClose={() => setAlert({ message: "", type: "" })}
                />
              )}
              <div className="w-full overflow-hidden rounded-lg shadow-xs mt-8">
                <div className="w-full overflow-x-auto">
                  <table className="w-full whitespace-no-wrap">
                    <thead>
                      <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Username</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                      {sortedUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className="text-gray-700 dark:text-gray-400"
                        >
                          <td className="px-4 py-3 text-sm">
                            {index + 1 + (currentPage - 1) * itemsPerPage}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              onDoubleClick={() => handleEditClick(user)}
                              className="w-[150px] inline-block"
                            >
                              {user.username}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              onDoubleClick={() => handleEditClick(user)}
                              className="w-[200px] inline-block"
                            >
                              {user.email}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {editableId === user.id ? (
                              <select
                                value={editUser.role}
                                onChange={(e) =>
                                  setEditUser({
                                    ...editUser,
                                    role: e.target.value,
                                  })
                                }
                                className="px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                              >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                              </select>
                            ) : (
                              <span
                                onDoubleClick={() => handleEditClick(user)}
                                className="w-[100px] inline-block"
                              >
                                {user.role}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {user.is_suspended ? "Suspended" : "Active"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-4 text-sm">
                              {user.is_suspended ? (
                                <button
                                  className="suspend-btn flex items-center justify-between w-[100px] px-4 py-2 text-sm font-medium leading-5 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:shadow-outline-green"
                                  aria-label="Activate"
                                  onClick={() => activateUser(user.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 640 512"
                                  >
                                    <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM625 177L497 305c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L591 143c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                                  </svg>
                                  <span className="ml-2">Activate</span>
                                </button>
                              ) : (
                                <button
                                  className="suspend-btn flex items-center justify-between w-[100px] px-4 py-2 text-sm font-medium leading-5 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:shadow-outline-yellow"
                                  aria-label="Suspend"
                                  onClick={() => suspendUser(user.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 640 512"
                                  >
                                    <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c1.8 0 3.5-.2 5.3-.5c-76.3-55.1-99.8-141-103.1-200.2c-16.1-4.8-33.1-7.3-50.7-7.3l-91.4 0zm308.8-78.3l-120 48C358 277.4 352 286.2 352 296c0 63.3 25.9 168.8 134.8 214.2c5.9 2.5 12.6 2.5 18.5 0C614.1 464.8 640 359.3 640 296c0-9.8-6-18.6-15.1-22.3l-120-48c-5.7-2.3-12.1-2.3-17.8 0zM591.4 312c-3.9 50.7-27.2 116.7-95.4 149.7l0-187.8L591.4 312z" />
                                  </svg>
                                  <span className="ml-2">Suspend</span>
                                </button>
                              )}
                              {/* <button
                                className="suspend-btn flex items-center justify-between w-[100px] px-4 py-2 text-sm font-medium leading-5 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:shadow-outline-yellow"
                                aria-label="Suspend"
                                onClick={handleCancelClick}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-5 h-5"
                                  aria-hidden="true"
                                  fill="currentColor"
                                  viewBox="0 0 640 512"
                                >
                                  <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c1.8 0 3.5-.2 5.3-.5c-76.3-55.1-99.8-141-103.1-200.2c-16.1-4.8-33.1-7.3-50.7-7.3l-91.4 0zm308.8-78.3l-120 48C358 277.4 352 286.2 352 296c0 63.3 25.9 168.8 134.8 214.2c5.9 2.5 12.6 2.5 18.5 0C614.1 464.8 640 359.3 640 296c0-9.8-6-18.6-15.1-22.3l-120-48c-5.7-2.3-12.1-2.3-17.8 0zM591.4 312c-3.9 50.7-27.2 116.7-95.4 149.7l0-187.8L591.4 312z" />
                                </svg>
                                <span className="ml-2">Suspend</span>
                              </button> */}
                              {editableId === user.id ? (
                                <>
                                  <button
                                    className="save-btn flex items-center justify-between w-[100px] px-4 py-2 text-sm font-medium leading-5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
                                    aria-label="Save"
                                    onClick={() => handleSaveClick(user.id)}
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
                                  onClick={() => handleEditClick(user)}
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
                                    deleteUser(user.id);
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

export default CmsUsers;
