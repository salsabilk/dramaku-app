import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const Auth = ({ children }) => {
  const [hasAccess, setHasAccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getProtectedData = async () => {
    try {
      // Cek session token terlebih dahulu
      const sessionResponse = await fetch(
        process.env.REACT_APP_BASE_API_URL + "/session",
        {
          method: "GET",
          credentials: "include", // Penting untuk mengirim cookies
        }
      );

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        if (sessionData.token) {
          sessionStorage.setItem("token", sessionData.token);
        }
      }

      // Kemudian cek token dari sessionStorage
      const token = sessionStorage.getItem("token");
      if (!token) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        process.env.REACT_APP_BASE_API_URL + "/auth/protected",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHasAccess(data.access);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setHasAccess(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getProtectedData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default Auth;
