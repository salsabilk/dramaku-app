import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const Auth = ({ children }) => {
  const [hasAccess, setHasAccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log("Checking authentication...");

      const response = await fetch(
        `${process.env.REACT_APP_BASE_API_URL}/auth/check`,
        {
          method: "GET",
          credentials: "include", // Penting untuk mengirim cookies
        }
      );

      console.log("Auth check response status:", response.status);
      const data = await response.json();
      console.log("Auth check response:", data);

      if (data.authenticated) {
        setHasAccess(true);
        // Simpan informasi user jika diperlukan
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setHasAccess(false);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setHasAccess(false);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
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
