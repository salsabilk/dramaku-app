import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  paginate,
}) => {
  // Calculate the range of pages to display (5 at a time)
  const getPageRange = () => {
    const delta = 2; // Number of pages to show before and after current page
    let range = [];

    // Calculate start and end page numbers
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    // Adjust range if we're near the beginning or end
    if (currentPage <= delta) {
      end = Math.min(5, totalPages);
    }
    if (currentPage > totalPages - delta) {
      start = Math.max(1, totalPages - 4);
    }

    // Generate page numbers
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Add dots and first/last page if necessary
    if (start > 1) {
      range.unshift("...");
      range.unshift(1);
    }
    if (end < totalPages) {
      range.push("...");
      range.push(totalPages);
    }

    return range;
  };

  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
      <span className="flex items-center col-span-3">
        Showing {startItem}-{endItem} of {totalItems}
      </span>
      <span className="col-span-2"></span>
      <span className="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
        <nav aria-label="Table navigation">
          <ul className="inline-flex items-center">
            {/* Previous Button */}
            <li>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple ${
                  currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                }`}
                aria-label="Previous"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </button>
            </li>

            {/* Page Numbers */}
            {getPageRange().map((pageNumber, index) => {
              if (pageNumber === "...") {
                return (
                  <li key={`ellipsis-${index}`}>
                    <span className="px-3 py-1">...</span>
                  </li>
                );
              }
              return (
                <li key={pageNumber}>
                  <button
                    onClick={() => paginate(pageNumber)}
                    className={`px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple ${
                      currentPage === pageNumber
                        ? "text-white transition-colors duration-150 bg-purple-600 border border-r-0 border-purple-600"
                        : ""
                    }`}
                  >
                    {pageNumber}
                  </button>
                </li>
              );
            })}

            {/* Next Button */}
            <li>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple ${
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                aria-label="Next"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </button>
            </li>
          </ul>
        </nav>
      </span>
    </div>
  );
};

export default Pagination;
