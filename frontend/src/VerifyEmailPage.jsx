import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
 

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const response = await fetch( process.env.REACT_APP_BASE_API_URL + "/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsVerified(true);
      } else {
        console.error(data.message);
      }
    };
    verifyEmail();
  }, [searchParams]);

  return (
    <div>
      {isVerified ? (
        <div>
          <h1>Email terverifikasi!</h1>
          <p>Anda sekarang dapat login ke akun Anda.</p>
          <button onClick={() => navigate("/")}>Ke Halaman Utama</button>
        </div>
      ) : (
        <div>
          <h1>Memverifikasi email...</h1>
          <p>Mohon tunggu sebentar.</p>
        </div>
      )}
    </div>
  );
}

export default VerifyEmailPage;
