// components/BookmarkButton.jsx
import React, { useState, useEffect } from "react";
import { BookmarkIcon } from "lucide-react";

const BookmarkButton = ({ dramaId }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBookmarkStatus();
  }, [dramaId]);

  const checkBookmarkStatus = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${process.env.REACT_APP_BASE_API_URL}/api/bookmarks/check/${dramaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  const toggleBookmark = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Please login to bookmark dramas");
        return;
      }

      if (isBookmarked) {
        await fetch(
          `${process.env.REACT_APP_BASE_API_URL}/api/bookmarks/${dramaId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await fetch(process.env.REACT_APP_BASE_API_URL + "/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ drama_id: dramaId }),
        });
      }

      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("Failed to update bookmark");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      data-testid="bookmark-button"
      className={`p-2 rounded-full transition-colors ${
        isBookmarked
          ? "text-yellow-500 hover:text-yellow-600"
          : "text-yellow-400 hover:text-yellow-500"
      }`}
    >
      <BookmarkIcon
        className={`w-12 h-12 ${isBookmarked ? "fill-current" : ""}`}
      />
    </button>
  );
};

export default BookmarkButton;
