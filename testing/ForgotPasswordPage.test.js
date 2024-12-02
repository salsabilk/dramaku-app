import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ForgotPasswordPage from "../src/ForgotPasswordPage";
import fetchMock from "jest-fetch-mock";

describe("ForgotPasswordPage Component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("renders forgot password form correctly", () => {
    render(<ForgotPasswordPage />);

    // Cek elemen-elemen form
    expect(
      screen.getByRole("heading", { name: "Forgot Password" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Reset Link" })
    ).toBeInTheDocument();
    expect(screen.getByText("Back to Login")).toBeInTheDocument();
  });

  test("handles successful password reset request", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));
    render(<ForgotPasswordPage />);

    // Isi form email
    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });
    fireEvent.click(submitButton);

    // Cek loading state
    expect(
      screen.getByRole("button", { name: "Sending..." })
    ).toBeInTheDocument();

    // Verifikasi API call dan pesan sukses
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BASE_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "test@example.com" }),
        }
      );
      expect(
        screen.getByText("Please check your email for reset instructions.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Send Reset Link" })
      ).toBeInTheDocument();
    });
  });

  test("handles failed password reset request", async () => {
    const errorMessage = "Email not found";
    fetchMock.mockResponseOnce(JSON.stringify({ message: errorMessage }), {
      status: 404,
    });

    render(<ForgotPasswordPage />);

    // Isi form email
    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, {
      target: { value: "nonexistent@example.com" },
    });

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: "Send Reset Link",
    });
    fireEvent.click(submitButton);

    // Verifikasi pesan error
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Send Reset Link" })
      ).toBeInTheDocument();
    });
  });

  test("validates email input", () => {
    render(<ForgotPasswordPage />);

    // Cek apakah input email required
    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toHaveAttribute("required");
    expect(emailInput).toHaveAttribute("type", "email");
  });
});
