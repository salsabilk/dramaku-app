import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import CmsActors from "../src/CmsActors";
import fetchMock from "jest-fetch-mock";

// Mock react-select
jest.mock("react-select", () => {
  return jest.fn(({ onChange, options }) => {
    return (
      <select
        onChange={(e) => onChange({ value: e.target.value })}
        data-testid="mock-select"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  });
});

// Mock child components
jest.mock("../src/components/Sidebar", () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

jest.mock("../src/components/Pagination", () => {
  return function MockPagination() {
    return <div data-testid="pagination">Pagination</div>;
  };
});

describe("CmsActors Component - Frontend Testing", () => {
  const mockActors = [
    {
      id: 1,
      name: "Dwayne Johnson",
      birth_date: "1990-01-01",
      photo: "test.jpg",
      country_id: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();

    // Mock sessionStorage
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: jest.fn(() => "fake-token"),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock fetch responses
    fetchMock.mockResponseOnce(JSON.stringify(mockActors)).mockResponseOnce(
      JSON.stringify({
        countries: [{ id: 1, name: "USA" }],
      })
    );
  });

  test("form validation and input handling", async () => {
    render(<CmsActors />);

    // Find form inputs
    const nameInput = screen.getByLabelText("Actor Name");
    const birthDateInput = screen.getByLabelText("Birth Date");
    const photoInput = screen.getByLabelText("Upload Picture");
    const submitButton = screen.getByText("Submit");

    // Check initial state
    expect(submitButton).toBeInTheDocument();
    expect(nameInput).toHaveAttribute("required");
    expect(birthDateInput).toHaveAttribute("required");
    expect(photoInput).toHaveAttribute("required");

    // Simulate valid input
    fireEvent.change(nameInput, { target: { value: "Dwayne Johnson" } });
    fireEvent.change(birthDateInput, { target: { value: "1990-01-01" } });

    // Simulate file upload
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    fireEvent.change(photoInput, { target: { files: [file] } });

    // Validate input changes
    expect(nameInput).toHaveValue("Dwayne Johnson");
    expect(birthDateInput).toHaveValue("1990-01-01");
  });

  test("delete actor confirmation dialog", async () => {
    const mockConfirm = jest.spyOn(window, "confirm");
    mockConfirm.mockImplementation(() => true);

    render(
      <BrowserRouter>
        <CmsActors />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Tunggu data dimuat
      expect(screen.getByText("Dwayne Johnson")).toBeInTheDocument();
    });

    // Cari tombol delete menggunakan aria-label
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this actor?"
    );

    mockConfirm.mockRestore();
  });

  test("search and filter functionality", async () => {
    render(
      <BrowserRouter>
        <CmsActors />
      </BrowserRouter>
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search actor/i);
      expect(searchInput).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: "John" } });
      expect(searchInput).toHaveValue("John");
    });
  });
});
