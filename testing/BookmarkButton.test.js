import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookmarkButton from "../src/components/BookmarkButton";
import fetchMock from "jest-fetch-mock";

describe("BookmarkButton Component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();

    // Mock sessionStorage
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: jest.fn(),
      },
      writable: true,
    });
  });

  test("shows alert when trying to bookmark without login", async () => {
    window.sessionStorage.getItem.mockReturnValue(null);
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<BookmarkButton dramaId={1} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(alertMock).toHaveBeenCalledWith("Please login to bookmark dramas");
    alertMock.mockRestore();
  });

  test("toggles bookmark when logged in", async () => {
    window.sessionStorage.getItem.mockReturnValue("fake-token");

    // Mock initial check (not bookmarked)
    fetchMock.mockResponseOnce(JSON.stringify({ isBookmarked: false }));

    render(<BookmarkButton dramaId={1} />);

    // Verify initial state
    await waitFor(() => {
      expect(screen.getByRole("button")).not.toHaveClass("fill-current");
    });

    // Mock bookmark creation
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    // Click to bookmark
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveClass("text-yellow-500");
    });
  });
});
