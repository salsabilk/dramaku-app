import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, useParams } from "react-router-dom";
import "@testing-library/jest-dom";
import DetailFilm from "../src/DetailFilm";
import fetchMock from "jest-fetch-mock";

// Mock useParams
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

// Mock data film
const mockFilmData = {
  id: 1,
  title: "Test Drama",
  alt_title: "Drama Test",
  year: "2024",
  synopsis: "This is a test drama",
  poster: "test-poster.jpg",
  availability: "Netflix",
  Genres: [{ name: "Action" }, { name: "Drama" }],
  Actors: [
    { name: "Actor 1", photo: "actor1.jpg" },
    { name: "Actor 2", photo: "actor2.jpg" },
  ],
  Comments: [
    {
      User: { username: "user1" },
      content: "Great drama!",
      rate: 5,
    },
    {
      User: { username: "user2" },
      content: "Nice one",
      rate: 4,
    },
  ],
};

describe("DetailFilm Component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    useParams.mockReturnValue({ id: "1" });

    // Mock sessionStorage
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test("renders film details correctly for guest user", async () => {
    // Mock no token for guest user
    window.sessionStorage.getItem.mockReturnValue(null);

    // Mock API responses
    fetchMock
      .mockResponseOnce(JSON.stringify(mockFilmData)) // Drama data
      .mockResponseOnce(JSON.stringify({ access: false })); // Auth check

    render(
      <BrowserRouter>
        <DetailFilm />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check basic film information
      expect(screen.getByText("Test Drama")).toBeInTheDocument();
      expect(screen.getByText("Drama Test")).toBeInTheDocument();
      expect(screen.getByText("2024")).toBeInTheDocument();
      expect(screen.getByText("This is a test drama")).toBeInTheDocument();
      expect(screen.getByText("Action, Drama")).toBeInTheDocument();
      expect(screen.getByText("Netflix")).toBeInTheDocument();

      // Check actors
      expect(screen.getByText("Actor 1")).toBeInTheDocument();
      expect(screen.getByText("Actor 2")).toBeInTheDocument();

      // Check comments
      expect(screen.getByText("Great drama!")).toBeInTheDocument();
      expect(screen.getByText("Nice one")).toBeInTheDocument();

      // Check login message for comments
      expect(
        screen.getByText("Anda harus login untuk memberikan komentar")
      ).toBeInTheDocument();
    });
  });

  test("renders film details correctly for logged in user", async () => {
    // Mock token for logged in user
    window.sessionStorage.getItem.mockReturnValue("fake-token");

    // Mock API responses
    fetchMock
      .mockResponseOnce(JSON.stringify(mockFilmData)) // Drama data
      .mockResponseOnce(
        JSON.stringify({
          access: true,
          user: { id: 1, username: "testuser" },
        })
      ); // Auth check

    render(
      <BrowserRouter>
        <DetailFilm />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check if comment form is rendered
      expect(screen.getByText("Tambah Komen")).toBeInTheDocument();
    });
  });

  test("calculates average rating correctly", async () => {
    window.sessionStorage.getItem.mockReturnValue(null);

    fetchMock
      .mockResponseOnce(JSON.stringify(mockFilmData))
      .mockResponseOnce(JSON.stringify({ access: false }));

    render(
      <BrowserRouter>
        <DetailFilm />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Average rating should be (5 + 4) / 2 = 4.5
      expect(screen.getByText("Rate 4.5/5")).toBeInTheDocument();
    });
  });

  test("renders bookmark button and handles interaction", async () => {
    window.sessionStorage.getItem.mockReturnValue("fake-token");

    // Mock API responses
    fetchMock
      .mockResponseOnce(JSON.stringify(mockFilmData)) // Drama data
      .mockResponseOnce(
        JSON.stringify({
          access: true,
          user: { id: 1, username: "testuser" },
        })
      ) // Auth check
      .mockResponseOnce(JSON.stringify({ isBookmarked: false })); // Bookmark status

    render(
      <BrowserRouter>
        <DetailFilm />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Verify bookmark button exists menggunakan data-testid
      const bookmarkButton = screen.getByTestId("bookmark-button");
      expect(bookmarkButton).toBeInTheDocument();

      // Verifikasi status awal bookmark
      expect(bookmarkButton).toHaveClass("text-yellow-400");
    });
  });
});
