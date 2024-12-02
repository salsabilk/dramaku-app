import React from "react";
import ReactDOM from "react-dom/client";

import LandingPage from "./LandingPage";
import SearchPage from "./SearchPage";
import reportWebVitals from "./reportWebVitals";
import DetailFilm from "./DetailFilm";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import CmsCountries from "./CmsCountries";
import CmsGenres from "./CmsGenres";
import CmsAwards from "./CmsAwards";
import CmsUsers from "./CmsUsers";
import CmsComments from "./CmsComments";
import CmsActors from "./CmsActors";
import CmsDramas from "./CmsDramas";
import CmsDramaInput from "./CmsDramaInput";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./components/Auth";
import User from "./components/User";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./components/tailwind.output.css";
import VerifyEmail from "./VerifyEmail";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";
import BookmarkPage from "./BookmarkPage";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/detail/:id" element={<DetailFilm />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/bookmarks" element={<BookmarkPage />} />

        <Route
          path="/verify-email"
          element={
            <Auth>
              <VerifyEmail />
            </Auth>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <Auth>
              <ForgotPasswordPage />
            </Auth>
          }
        />

        <Route
          path="/reset-password"
          element={
            <Auth>
              <ResetPasswordPage />
            </Auth>
          }
        />

        <Route
          path="/login"
          element={
            <Auth>
              <LoginPage />
            </Auth>
          }
        />
        <Route
          path="/register"
          element={
            <Auth>
              <RegisterPage />
            </Auth>
          }
        />

        {/* Rute yang dilindungi */}
        <Route
          path="/cmscountries"
          element={
            <ProtectedRoute>
              <CmsCountries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cmsgenres"
          element={
            <ProtectedRoute>
              <CmsGenres />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cmsawards"
          element={
            <ProtectedRoute>
              <CmsAwards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cmsusers"
          element={
            <ProtectedRoute>
              <CmsUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cmscomments"
          element={
            <ProtectedRoute>
              <CmsComments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cmsactors"
          element={
            <ProtectedRoute>
              <CmsActors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cmsdramas"
          element={
            <ProtectedRoute>
              <CmsDramas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cmsdramainput"
          element={
            <User>
              <CmsDramaInput />
            </User>
          }
        />
        <Route
          path="/editdrama/:id"
          element={
            <User>
              <CmsDramaInput />
            </User>
          }
        />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
