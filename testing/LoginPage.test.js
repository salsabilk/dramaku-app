import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "../src/LoginPage";
import fetchMock from "jest-fetch-mock";

describe("LoginPage Component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    // Mock sessionStorage
    Object.defineProperty(window, "sessionStorage", {
      value: {
        setItem: jest.fn(),
      },
      writable: true,
    });
    // Mock window.location
    delete window.location;
    window.location = { href: jest.fn() };
  });

  test("renders login form correctly", () => {
    render(<LoginPage />);

    // Cek elemen-elemen form
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your email or username")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("***************")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();

    // Cek link Google login (menggunakan getByText karena ini adalah link, bukan button)
    expect(screen.getByText("Google")).toBeInTheDocument();

    // Cek link lainnya
    expect(screen.getByText("Create account")).toBeInTheDocument();
    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
  });

  test("handles successful login", async () => {
    const mockToken = "fake-token";
    fetchMock.mockResponseOnce(JSON.stringify({ token: mockToken }));

    render(<LoginPage />);

    // Isi form
    fireEvent.change(
      screen.getByPlaceholderText("Enter your email or username"),
      {
        target: { value: "testuser" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("***************"), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    // Verifikasi API call
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BASE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrUsername: "testuser",
            password: "password123",
          }),
        }
      );
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        "token",
        mockToken
      );
      expect(window.location.href).toBe("/");
    });
  });

  test("handles login failure", async () => {
    // Mock failed response
    fetchMock.mockResponseOnce(
      JSON.stringify({ message: "Invalid credentials" }),
      { status: 401 }
    );

    render(<LoginPage />);

    // Isi form
    fireEvent.change(
      screen.getByPlaceholderText("Enter your email or username"),
      {
        target: { value: "wronguser" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText("***************"), {
      target: { value: "wrongpass" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    // Verifikasi error message
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });
});
