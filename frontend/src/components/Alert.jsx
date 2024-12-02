// Alert.js
import React from "react";

const Alert = ({ message, type, onClose }) => {
  const alertColors = {
    success: "bg-green-100 text-green-800",
    info: "bg-blue-100 text-blue-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <div className={`p-4 rounded-lg ${alertColors[type]} mb-4`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="font-bold">
          X
        </button>
      </div>
    </div>
  );
};

export default Alert;
