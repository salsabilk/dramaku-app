import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
 

const LoginPage = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch( process.env.REACT_APP_BASE_API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("token", data.token);
        window.location.href = "/";
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred during login.");
      console.error(error);
    }
  };

  return (
    <>
      <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
          <div className="flex flex-col overflow-y-auto md:flex-row">
            <div className="h-32 md:h-auto md:w-1/2">
              <img
                aria-hidden="true"
                className="object-cover h-full w-full dark:hidden"
                src="./img/m.avif"
                alt="Office"
              />
              <img
                aria-hidden="true"
                className="hidden object-cover w-full h-full dark:block"
                src="assets/img/login-office-dark.jpeg"
                alt="Office"
              />
            </div>
            <div className="flex items-center justify-center p-4 sm:p-12 md:w-1/2">
              <div className="w-full">
                <div className="w-full flex justify-center">
                  <img src="./logo-dramaKu.png" className="w-32" alt="" />
                </div>
                <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
                  Login
                </h1>
                <form action="" method="post" onSubmit={handleLogin}>
                  <label className="block text-sm">
                    <span className="text-gray-700 dark:text-gray-400">
                      Email or Username
                    </span>
                    <input
                      className="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
                      placeholder="Enter your email or username"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)} // Ubah menjadi emailOrUsername
                    />
                  </label>
                  <label className="block mt-4 text-sm">
                    <span className="text-gray-700 dark:text-gray-400">
                      Password
                    </span>
                    <input
                      className="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input"
                      placeholder="***************"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                  {error && (
                    <div className="mt-2 text-sm text-red-600">{error}</div>
                  )}
                  <button
                    type="submit"
                    className="block w-full px-4 py-2 mt-4 text-sm font-medium leading-5 text-center text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
                  >
                    Log in
                  </button>
                </form>
                <hr className="my-8" />
                <a
                  href={`${ process.env.REACT_APP_BASE_API_URL}/auth/google`}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-white text-gray-700 transition-colors duration-150 border border-gray-300 rounded-lg dark:text-gray-400 active:bg-transparent hover:border-gray-500 focus:border-gray-500 active:text-gray-500 focus:outline-none focus:shadow-outline-gray"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width={100}
                    height={100}
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#fbc02d"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                    <path
                      fill="#e53935"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    />
                    <path
                      fill="#4caf50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    />
                    <path
                      fill="#1565c0"
                      d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                  </svg>
                  Google
                </a>
                {/* <p className="mt-4">
                  <a
                    className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                    href="./forgot-password.html"
                  >
                    Forgot your password?
                  </a>
                </p> */}
                <p className="mt-1">
                  <a
                    className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                    href="./register"
                  >
                    Create account
                  </a>
                  <br />
                  <a
                    className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                    href="./forgot-password"
                  >
                    Forgot Password
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
