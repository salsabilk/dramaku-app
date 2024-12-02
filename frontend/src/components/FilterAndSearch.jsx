import React from "react";

const FilterAndSearch = ({
  // Section visibility controls
  showFilterSection = true,
  showShowsSection = true,
  showSortSection = true,
  showSearchSection = true,

  // Filter props
  filterValue,
  setFilterValue,
  filterOptions = [
    { value: "none", label: "None" },
    { value: "approved", label: "Approved" },
    { value: "unapproved", label: "Unapproved" },
    { value: "pending", label: "Pending" },
  ],

  // Shows props
  showValue,
  setShowValue,
  showOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
  ],

  // Sort props
  sortValue,
  setSortValue,
  sortOptions = [
    { value: "", label: "-- Sort --" },
    { value: "name_asc", label: "Name (A-Z)" },
    { value: "name_desc", label: "Name (Z-A)" },
  ],

  // Search props
  searchValue,
  setSearchValue,
  searchPlaceholder = "Search...",
}) => {
  return (
    <div className="flex items-center space-x-4 justify-center flex-1 lg:mr-32">
      {/* Filter Section */}
      {showFilterSection && (
        <div className="flex items-center space-x-4">
          <label
            htmlFor="filter"
            className="text-sm text-gray-700 dark:text-gray-400"
          >
            Filtered by:
          </label>
          <select
            id="filter"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="text-sm text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:shadow-outline-purple form-select"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Shows Section */}
      {showShowsSection && (
        <div className="flex items-center space-x-4">
          <label
            htmlFor="show"
            className="text-sm text-gray-700 dark:text-gray-400"
          >
            Shows:
          </label>
          <select
            id="show"
            value={showValue}
            onChange={(e) => setShowValue(e.target.value)}
            className="text-sm text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:shadow-outline-purple form-select"
          >
            {showOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sort Section */}
      {showSortSection && (
        <div className="flex items-center space-x-4">
          <label
            htmlFor="sort"
            className="text-sm text-gray-700 dark:text-gray-400"
          >
            Sort by:
          </label>
          <select
            id="sort"
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            className="text-sm text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:shadow-outline-purple form-select"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search Section */}
      {showSearchSection && (
        <div className="relative w-full max-w-xl focus-within:text-purple-500">
          <div className="absolute inset-y-0 flex items-center pl-2">
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            className="w-full pl-8 pr-2 text-sm text-gray-700 placeholder-gray-600 bg-gray-100 border-0 rounded-md dark:placeholder-gray-500 dark:focus:shadow-outline-gray dark:focus:placeholder-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:placeholder-gray-500 focus:bg-white focus:border-purple-300 focus:outline-none focus:shadow-outline-purple form-input"
            type="text"
            id="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search"
          />
        </div>
      )}
    </div>
  );
};

export default FilterAndSearch;

// import React from "react";

// const FilterAndSearch = ({
//   filterValue,
//   setFilterValue,
//   showValue,
//   setShowValue,
//   searchValue,
//   setSearchValue,
//   sortValue,
//   setSortValue,
// }) => {
//   return (
//     <div className="flex items-center space-x-4 justify-center flex-1 lg:mr-32">
//       {/* Filter Dropdown */}
//       <div className="flex items-center space-x-4">
//         <label
//           htmlFor="filter"
//           className="text-sm text-gray-700 dark:text-gray-400"
//         >
//           Filtered by:
//         </label>
//         <select
//           id="filter"
//           value={filterValue}
//           onChange={(e) => setFilterValue(e.target.value)}
//           className="ml-2 text-sm text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:shadow-outline-purple form-select"
//         >
//           <option value="none">None</option>
//           <option value="approved">Approved</option>
//           <option value="unapproved">Unapproved</option>
//           <option value="pending">Pending</option>
//         </select>
//       </div>

//       {/* Shows Select */}
//       <div className="flex items-center space-x-4">
//         <label
//           htmlFor="show"
//           className="text-sm text-gray-700 dark:text-gray-400"
//         >
//           Shows:
//         </label>
//         <select
//           id="show"
//           value={showValue}
//           onChange={(e) => setShowValue(e.target.value)}
//           className="text-sm text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:shadow-outline-purple form-select"
//         >
//           <option value="10">10</option>
//           <option value="20">20</option>
//           <option value="30">30</option>
//           <option value="40">40</option>
//         </select>
//       </div>

//       <div className="flex items-center space-x-4">
//         <label
//           htmlFor="sort"
//           className="text-sm text-gray-700 dark:text-gray-400"
//         >
//           Sort by:
//         </label>
//         <select
//           id="sort"
//           value={sortValue}
//           onChange={(e) => setSortValue(e.target.value)}
//           className="ml-2 text-sm text-gray-700 bg-gray-100 border-0 rounded-md dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:shadow-outline-purple form-select"
//         >
//           <option value="">-- Sort --</option>
//           <option value="rate_asc">Rate (Low to High)</option>
//           <option value="rate_desc">Rate (High to Low)</option>
//           <option value="content_asc">Comment (A-Z)</option>
//           <option value="content_desc">Comment (Z-A)</option>
//         </select>
//       </div>

//       {/* Search Bar */}
//       <div className="relative w-full max-w-xl focus-within:text-purple-500">
//         <div className="absolute inset-y-0 flex items-center pl-2">
//           <svg
//             className="w-4 h-4"
//             aria-hidden="true"
//             fill="currentColor"
//             viewBox="0 0 20 20"
//           >
//             <path
//               fillRule="evenodd"
//               d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
//               clipRule="evenodd"
//             ></path>
//           </svg>
//         </div>
//         <input
//           className="w-full pl-8 pr-2 text-sm text-gray-700 placeholder-gray-600 bg-gray-100 border-0 rounded-md dark:placeholder-gray-500 dark:focus:shadow-outline-gray dark:focus:placeholder-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:placeholder-gray-500 focus:bg-white focus:border-purple-300 focus:outline-none focus:shadow-outline-purple form-input"
//           type="text"
//           id="search"
//           value={searchValue}
//           onChange={(e) => setSearchValue(e.target.value)}
//           placeholder="Search for comments"
//           aria-label="Search"
//         />
//       </div>
//     </div>
//   );
// };

// export default FilterAndSearch;
