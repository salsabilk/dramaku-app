import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Header from "../src/components/Header";
import fetchMock from "jest-fetch-mock";

describe("Header Component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();

    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test("renders header with search bar", () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText("Search Drama");
    expect(searchInput).toBeInTheDocument();
  });

  test("handles search input change", () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText("Search Drama");
    fireEvent.change(searchInput, { target: { value: "Goblin" } });
    expect(searchInput.value).toBe("Goblin");
  });

  test("renders logo and title", () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const logo = screen.getByAltText("Dramaku Logo"); // Sesuaikan dengan alt text yang benar
    const title = screen.getByText("Dramaku"); // Sesuaikan dengan text yang benar

    expect(logo).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  test("renders login button for guest users", () => {
    window.sessionStorage.getItem.mockReturnValue(null);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const loginButton = screen.getByText("Log in"); // Sesuaikan dengan text yang benar
    expect(loginButton).toBeInTheDocument();
  });

  test("renders user menu for logged in users", async () => {
    window.sessionStorage.getItem.mockReturnValue("fake-token");

    fetchMock.mockResponseOnce(
      JSON.stringify({
        access: true,
        user: { id: 1, username: "testuser" },
      })
    );

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    await waitFor(() => {
      const userAvatar = screen.getByAltText("User Avatar"); // Cek avatar user
      expect(userAvatar).toBeInTheDocument();
    });
  });

  test("handles logout", async () => {
    window.sessionStorage.getItem.mockReturnValue("fake-token");

    // Mock window.location
    const mockLocation = {
      href: "/", // Sesuaikan dengan nilai yang diset di handleLogout
    };
    delete window.location;
    window.location = mockLocation;

    fetchMock
      .mockResponseOnce(
        JSON.stringify({
          access: true,
          user: { id: 1, username: "testuser" },
        })
      )
      .mockResponseOnce(JSON.stringify({ success: true }));

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Buka menu profile
    const avatarButton = await screen.findByLabelText("Account");
    fireEvent.click(avatarButton);

    // Klik tombol logout
    const logoutButton = screen.getByText("Log out");
    fireEvent.click(logoutButton);

    // Verifikasi logout
    await waitFor(() => {
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith("token");
      expect(window.location.href).toBe("/"); // Sesuaikan dengan nilai yang diset di handleLogout
    });
  });

  test("handles API error gracefully", async () => {
    window.sessionStorage.getItem.mockReturnValue("fake-token");
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    fetchMock.mockRejectOnce(new Error("API Error"));

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
