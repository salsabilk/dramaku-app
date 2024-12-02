import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import ResetPasswordPage from "../src/ResetPasswordPage";
import fetchMock from "jest-fetch-mock";

// Mock react-router-dom hooks
jest.mock("react-router-dom", () => ({
  useSearchParams: jest.fn(),
  useNavigate: jest.fn(),
}));

describe("ResetPasswordPage Component", () => {
  const mockToken = "valid-reset-token";
  const mockNavigate = jest.fn();

  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();

    // Setup mocks
    useSearchParams.mockReturnValue([{ get: () => mockToken }]);
    useNavigate.mockReturnValue(mockNavigate);

    // Mock setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders reset password form correctly", () => {
    render(<ResetPasswordPage />);

    // Cek elemen-elemen form
    expect(
      screen.getByRole("heading", { name: "Reset Password" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset Password" })
    ).toBeInTheDocument();
  });

  test("shows error when passwords don't match", async () => {
    render(<ResetPasswordPage />);

    // Isi password yang tidak cocok
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "password456" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

    // Verifikasi pesan error
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("handles successful password reset", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    render(<ResetPasswordPage />);

    // Isi form dengan password yang cocok
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "newpassword123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

    // Cek loading state
    expect(
      screen.getByRole("button", { name: "Resetting..." })
    ).toBeInTheDocument();

    // Verifikasi API call dan pesan sukses
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BASE_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: mockToken,
            password: "newpassword123",
            confirmPassword: "newpassword123",
          }),
        }
      );
      expect(
        screen.getByText("Password successfully reset!")
      ).toBeInTheDocument();
    });

    // Verifikasi redirect setelah 2 detik
    jest.advanceTimersByTime(2000);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("handles failed password reset", async () => {
    const errorMessage = "Invalid or expired token";
    fetchMock.mockResponseOnce(JSON.stringify({ message: errorMessage }), {
      status: 400,
    });

    render(<ResetPasswordPage />);

    // Isi form
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "newpassword123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));

    // Verifikasi pesan error
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
