import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, useSearchParams } from "react-router-dom";
import "@testing-library/jest-dom";
import SearchPage from "../src/SearchPage";

// Mock komponen Header dan Filter
jest.mock("../src/components/Header", () => {
  return function MockHeader() {
    return <div data-testid="header"></div>;
  };
});

jest.mock("../src/components/Filter", () => {
  return function MockFilter() {
    return <div data-testid="filter"></div>;
  };
});

// Mock useSearchParams
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: jest.fn(),
}));

// Mock data film
const mockFilms = [
  {
    id: 1,
    title: "Goblin",
    synopsis: "A modern fantasy about a goblin",
    year: 2020,
    poster: "goblin.jpg",
    Genres: [{ name: "Fantasy" }],
    Actors: [{ name: "Gong Yoo" }],
  },
  {
    id: 2,
    title: "Reply 1988",
    synopsis: "A story about neighborhood friends",
    year: 2015,
    poster: "reply1988.jpg",
    Genres: [{ name: "Drama" }],
    Actors: [{ name: "Park Bo Gum" }],
  },
];

describe("SearchPage Component", () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFilms),
      })
    );
  });

  test("filters films by search query", async () => {
    // Set search query parameter
    const searchParams = new URLSearchParams();
    searchParams.set("q", "Goblin");
    useSearchParams.mockImplementation(() => [searchParams, jest.fn()]);

    render(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );

    // Tunggu data selesai di-fetch dan komponen di-render
    await waitFor(async () => {
      // Cek film title menggunakan heading (h4)
      const goblinHeading = await screen.findByRole("heading", {
        name: /goblin/i,
      });
      expect(goblinHeading).toBeInTheDocument();

      // Cek apakah text pencarian ditampilkan dengan benar
      const searchResult = await screen.findByText(
        /menampilkan hasil pencarian untuk:/i
      );
      expect(searchResult).toBeInTheDocument();

      // Cek apakah film yang tidak sesuai dengan query tidak ditampilkan
      expect(screen.queryByText(/reply 1988/i)).not.toBeInTheDocument();

      // Cek apakah informasi film yang sesuai query ditampilkan
      expect(
        screen.getByText(/a modern fantasy about a goblin/i)
      ).toBeInTheDocument();
      expect(screen.getByText("2020")).toBeInTheDocument();
      expect(screen.getByText("Fantasy")).toBeInTheDocument();
    });

    // Verifikasi bahwa fetch dipanggil dengan benar
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
