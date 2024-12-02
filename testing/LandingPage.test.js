import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LandingPage from "../src/LandingPage";
import { act } from "react";

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Mock environment variable
process.env.REACT_APP_BASE_API_URL = "http://localhost:3000";

// Mock the child components to isolate LandingPage testing
jest.mock("../src/components/Carousel", () => () => (
  <div data-testid="mock-carousel">Carousel</div>
));
jest.mock("../src/components/SweepCard", () => ({ dramas, title }) => (
  <div data-testid="mock-sweepcard">
    {title}
    {dramas.map((drama) => (
      <div key={drama.id}>{drama.title}</div>
    ))}
  </div>
));
jest.mock(
  "../src/components/Filter",
  () =>
    ({
      selectedGenre,
      onGenreChange,
      selectedYear,
      onYearChange,
      selectedCountry,
      onCountryChange,
      selectedSort,
      onSortChange,
    }) =>
      (
        <div data-testid="mock-filter">
          <select
            data-testid="genre-select"
            onChange={(e) => onGenreChange(e.target.value)}
          >
            <option value="">All Genres</option>
            <option value="action">Action</option>
          </select>
          <select
            data-testid="year-select"
            onChange={(e) => onYearChange(e.target.value)}
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
          </select>
        </div>
      )
);
jest.mock(
  "../src/components/FilmCardH",
  () =>
    ({ id, title, synopsis, year, genres }) =>
      (
        <div data-testid={`film-card-${id}`}>
          <h3>{title}</h3>
          <p>{year}</p>
        </div>
      )
);

jest.mock(
  "../src/components/PaginationHome",
  () =>
    ({ currentPage, totalPages, paginate }) =>
      (
        <div>
          <button onClick={() => paginate(currentPage + 1)}>Next</button>
          <button onClick={() => paginate(currentPage - 1)}>Previous</button>
        </div>
      )
);

jest.mock("../src/components/Header", () => () => (
  <header data-testid="mock-header">Header</header>
));

// Mock data
const mockFilmsData = {
  dramas: [
    {
      id: 1,
      title: "Test Drama 1",
      year: 2024,
      synopsis: "Test synopsis 1",
      Genres: [{ name: "Action" }],
      poster: "test1.jpg",
    },
    {
      id: 2,
      title: "Test Drama 2",
      year: 2023,
      synopsis: "Test synopsis 2",
      Genres: [{ name: "Comedy" }],
      poster: "test2.jpg",
    },
  ],
};

describe("LandingPage Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock fetch calls
    global.fetch = jest.fn((url) => {
      if (url.includes("/api/dramas")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFilmsData),
        });
      }
      return Promise.reject(new Error("Unexpected API call"));
    });

    // Mock sessionStorage
    const mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, "sessionStorage", {
      value: mockSessionStorage,
    });
  });

  afterEach(() => {
    // Cleanup after each test
    jest.resetModules();
  });

  // Add new test for error handling
  test("handles fetch error gracefully", async () => {
    // Mock fetch to reject
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Fetch error"))
    );

    await act(async () => {
      render(<LandingPage />);
    });

    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
  });

  test("renders main components", async () => {
    await act(async () => {
      render(<LandingPage />);
    });

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-carousel")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sweepcard")).toBeInTheDocument();
    expect(screen.getByTestId("mock-filter")).toBeInTheDocument();
  });

  test("fetches and displays films on initial load", async () => {
    await act(async () => {
      render(<LandingPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("film-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("film-card-2")).toBeInTheDocument();
    });
  });

  test("handles genre filter change", async () => {
    await act(async () => {
      render(<LandingPage />);
    });

    const genreSelect = screen.getByTestId("genre-select");

    await act(async () => {
      fireEvent.change(genreSelect, { target: { value: "action" } });
    });

    const filteredFilms = screen.getAllByTestId(/film-card/);
    expect(filteredFilms).toHaveLength(1);
  });

  test("handles year filter change", async () => {
    await act(async () => {
      render(<LandingPage />);
    });

    const yearSelect = screen.getByTestId("year-select");

    await act(async () => {
      fireEvent.change(yearSelect, { target: { value: "2024" } });
    });

    const filteredFilms = screen.getAllByTestId(/film-card/);
    expect(filteredFilms).toHaveLength(1);
  });

  test("handles loading state", async () => {
    render(<LandingPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });
});
