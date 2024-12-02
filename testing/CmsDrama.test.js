import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import CmsDramas from "../src/CmsDramas";
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

jest.mock("../src/components/DramaPopup", () => {
  return function MockDramaPopup({ drama, onClose, onUpdateStatus }) {
    return (
      <div data-testid="drama-popup">
        <h2>Update Status</h2>
        <button
          data-testid="approve-status-button"
          onClick={() => onUpdateStatus(drama.id, "approved")}
        >
          Approve
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

describe("CmsDramas Component - Frontend Testing", () => {
  const mockDramas = [
    {
      id: 1,
      title: "Test Drama",
      synopsis: "Test Synopsis",
      year: 2023,
      status: "pending",
      Actors: [{ name: "Dwayne Johnson" }],
      Genres: [{ name: "Action" }],
      trailer_url: "https://youtube.com/watch?v=123456789",
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
    fetchMock.mockResponseOnce(
      JSON.stringify({
        dramas: mockDramas,
        totalItems: 1,
      })
    );
  });

  test("delete drama confirmation and execution", async () => {
    const mockConfirm = jest.spyOn(window, "confirm");
    mockConfirm.mockImplementation(() => true);

    render(
      <BrowserRouter>
        <CmsDramas />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Drama")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this item?"
    );

    // Mock successful delete response
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    // Verify delete API call
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/dramas/1"),
      expect.objectContaining({ method: "DELETE" })
    );

    mockConfirm.mockRestore();
  });
});
