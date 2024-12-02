import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
 

function VerifyEmail() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("loading");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Token verifikasi tidak ditemukan");
          return;
        }

        const response = await fetch(
           process.env.REACT_APP_BASE_API_URL + "/auth/verify-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage(
            "Email berhasil diverifikasi! Anda akan dialihkan ke halaman login..."
          );
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Token verifikasi tidak valid");
        }
      } catch (error) {
        console.error("Error during verification:", error);
        setStatus("error");
        setMessage("Terjadi kesalahan. Silakan coba lagi.");
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <div className="flex items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md mx-auto p-6">
        <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-4 sm:p-7 text-center">
            {status === "loading" && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-2">Memverifikasi email...</p>
              </div>
            )}

            {status === "success" && (
              <div className="mb-4 text-green-600">
                <svg
                  className="w-12 h-12 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <p className="text-xl font-semibold">{message}</p>
              </div>
            )}

            {status === "error" && (
              <div className="mb-4 text-red-600">
                <svg
                  className="w-12 h-12 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
                <p className="text-xl font-semibold">{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
