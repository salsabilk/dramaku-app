import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommentForm from "../src/components/CommentForm";
import fetchMock from "jest-fetch-mock";

// Mock StarRating component
jest.mock("star-ratings-react", () => ({
  StarRating: ({ rating, onSetRating }) => (
    <div data-testid="star-rating">
      <input
        type="number"
        value={rating}
        onChange={(e) => onSetRating(Number(e.target.value))}
        max="5"
        data-testid="rating-input"
      />
    </div>
  ),
}));

describe("CommentForm Component", () => {
  const mockProps = {
    user: { id: 1, username: "testuser" },
    drama: { id: 1, title: "Test Drama" },
  };

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("renders comment form correctly", () => {
    render(<CommentForm {...mockProps} />);

    // Cek apakah form elements ada
    expect(screen.getByText("Rating")).toBeInTheDocument();
    expect(screen.getByText("Komen")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter some long form content.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  test("handles comment submission", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    render(<CommentForm {...mockProps} />);

    // Isi rating
    const ratingInput = screen.getByTestId("rating-input");
    fireEvent.change(ratingInput, { target: { value: "4" } });

    // Isi komentar
    const commentInput = screen.getByPlaceholderText(
      "Enter some long form content."
    );
    fireEvent.change(commentInput, { target: { value: "Great drama!" } });

    // Submit form
    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    // Verifikasi API call
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BASE_API_URL}/api/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: 4,
            comment: "Great drama!",
            user: mockProps.user,
            drama: mockProps.drama,
          }),
        }
      );
    });

    // Verifikasi form reset
    await waitFor(() => {
      expect(ratingInput.value).toBe("0");
      expect(commentInput.value).toBe("");
    });
  });
});
