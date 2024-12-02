// ReusableTable.jsx
import React from "react";

const ReusableTable = ({
  columns,
  data,
  editableId,
  editName,
  handleEditClick,
  handleDelete,
  handleSaveClick,
  handleInputChange,
}) => {
  return (
    <table className="w-full whitespace-no-wrap">
      <thead>
        <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
          {columns.map((col, index) => (
            <th key={index} className="px-4 py-3">
              {col}
            </th>
          ))}
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
        {data.map((item, index) => (
          <tr key={item.id} className="text-gray-700 dark:text-gray-400">
            {columns.map((col, idx) => (
              <td key={idx} className="px-4 py-3 text-sm">
                {editableId === item.id && col === "Name" ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={handleInputChange}
                    autoFocus
                    className="w-[100px] px-3 py-2 text-sm leading-5 text-gray-700 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:border-blue-500"
                  />
                ) : (
                  item[col.toLowerCase()]
                )}
              </td>
            ))}
            <td className="px-4 py-3">
              <div className="flex items-center space-x-4 text-sm">
                {editableId === item.id ? (
                  <button
                    className="save-btn flex items-center justify-between w-[100px] px-4 py-2 text-sm font-medium leading-5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
                    aria-label="Save"
                    onClick={() => handleSaveClick(item.id)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="edit-btn flex items-center justify-between w-[100px] px-4 py-2 text-sm font-medium leading-5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
                    aria-label="Edit"
                    onClick={() => handleEditClick(item.id, item.name)}
                  >
                    Edit
                  </button>
                )}

                <button
                  className="delete-btn flex items-center justify-between w-[100px] px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:shadow-outline-red"
                  aria-label="Delete"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReusableTable;
