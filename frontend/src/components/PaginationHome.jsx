import React from "react";

const PaginationHome = ({ currentPage, totalPages, paginate }) => {
  const maxPagesToShow = 5; // Jumlah halaman yang ditampilkan sekaligus
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (totalPages <= 1) return null; // Jangan tampilkan pagination jika hanya ada 1 halaman

  return (
    <div className="grid px-4 py-4 text-sm font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
      <span className="flex justify-center col-span-4 mt-2 sm:mt-auto">
        <nav aria-label="Table navigation">
          <ul className="inline-flex items-center space-x-1">
            {/* Tombol Previous */}
            <li>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center px-4 py-2 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple transition-colors duration-150 ${
                  currentPage === 1
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-purple-600 hover:text-white"
                }`}
                aria-label="Previous"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  />
                </svg>
                Prev
              </button>
            </li>

            {/* Tombol Halaman */}
            {Array.from({ length: endPage - startPage + 1 }, (_, index) => {
              const pageNumber = startPage + index;
              return (
                <li key={pageNumber}>
                  <button
                    onClick={() => paginate(pageNumber)}
                    className={`px-4 py-2 rounded-md focus:outline-none focus:shadow-outline-purple transition-colors duration-150 ${
                      currentPage === pageNumber
                        ? "text-white bg-purple-600 border border-r-0 border-purple-600"
                        : "hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                </li>
              );
            })}

            {/* Tombol Next */}
            <li>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center px-4 py-2 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple transition-colors duration-150 ${
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-purple-600 hover:text-white"
                }`}
                aria-label="Next"
              >
                Next
                <svg
                  className="w-6 h-6 ml-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  />
                </svg>
              </button>
            </li>
          </ul>
        </nav>
      </span>
    </div>
  );
};

export default PaginationHome;
