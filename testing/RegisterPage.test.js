import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RegisterPage from "../src/RegisterPage";
import fetchMock from "jest-fetch-mock";

describe("RegisterPage Component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    // Mock window.location
    delete window.location;
    window.location = { href: jest.fn() };
    // Mock alert
    window.alert = jest.fn();
  });

  test("renders register form correctly", () => {
    render(<RegisterPage />);

    // Cek elemen-elemen form
    expect(
      screen.getByRole("heading", { name: "Create account" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" })
    ).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(
      screen.getByText("Already have an account? Login")
    ).toBeInTheDocument();
  });

  test("shows password validation error", async () => {
    render(<RegisterPage />);

    // Input password yang terlalu pendek
    const passwordInput = screen.getByLabelText("Password");
    fireEvent.change(passwordInput, { target: { value: "123" } });

    // Cek pesan error
    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters long")
      ).toBeInTheDocument();
    });
  });

  test("shows password mismatch error", async () => {
    render(<RegisterPage />);

    // Input password yang berbeda
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password456" },
    });

    // Cek pesan error
    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  test("handles successful registration", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    render(<RegisterPage />);

    // Isi form
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    });

    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    // Verifikasi API call dan redirect
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BASE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            username: "testuser",
            password: "password123",
            confirmPassword: "password123",
          }),
        }
      );
      expect(window.alert).toHaveBeenCalledWith(
        "Silakan periksa email Anda untuk verifikasi."
      );
      expect(window.location.href).toBe("/verify-email");
    });
  });
});
