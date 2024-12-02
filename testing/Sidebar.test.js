import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter, useLocation } from "react-router-dom";
import "@testing-library/jest-dom";
import Sidebar from "../src/components/Sidebar";
import fetchMock from "jest-fetch-mock";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
}));

describe("Sidebar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();

    useLocation.mockImplementation(() => ({ pathname: "/" }));

    // Mock sessionStorage
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock window.location
    delete window.location;
    window.location = {
      href: "",
      assign: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("renders admin menu and submenu items", async () => {
    window.sessionStorage.getItem.mockReturnValue("fake-token");

    fetchMock.mockResponseOnce(
      JSON.stringify({
        access: true,
        user: { id: 1, username: "admin", role: "Admin" },
      })
    );

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    // Tunggu sampai menu Dramas muncul
    await waitFor(() => {
      expect(screen.getByText("Dramas")).toBeInTheDocument();
    });

    // Klik tombol Dramas untuk membuka submenu
    const dramasButton = screen.getByText("Dramas").closest("button");
    fireEvent.click(dramasButton);

    // Sekarang cek submenu items
    await waitFor(() => {
      expect(screen.getByText("Input New Drama")).toBeInTheDocument();
      expect(screen.getByText("Validate")).toBeInTheDocument();
    });
  });

  test("toggles drama submenu when clicked (admin view)", async () => {
    window.sessionStorage.getItem.mockReturnValue("fake-token");

    fetchMock.mockResponseOnce(
      JSON.stringify({
        access: true,
        user: { id: 1, username: "admin", role: "Admin" },
      })
    );

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    // Tunggu sampai menu Dramas muncul
    await waitFor(() => {
      expect(screen.getByText("Dramas")).toBeInTheDocument();
    });

    // Klik tombol untuk membuka submenu
    const dramasButton = screen.getByText("Dramas").closest("button");
    fireEvent.click(dramasButton);

    // Verifikasi submenu terbuka
    expect(screen.getByText("Input New Drama")).toBeInTheDocument();
    expect(screen.getByText("Validate")).toBeInTheDocument();

    // Klik lagi untuk menutup submenu
    fireEvent.click(dramasButton);

    // Verifikasi submenu tertutup (elemen tidak terlihat)
    await waitFor(() => {
      expect(screen.queryByText("Input New Drama")).not.toBeInTheDocument();
    });
  });

  // Test cases lainnya tetap sama
  test("shows bookmark link for regular users", async () => {
    window.sessionStorage.getItem.mockReturnValue("fake-token");

    fetchMock.mockResponseOnce(
      JSON.stringify({
        access: true,
        user: { id: 1, username: "user", role: "User" },
      })
    );

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Bookmark")).toBeInTheDocument();
    });
  });

  test("handles logout correctly", async () => {
    window.sessionStorage.getItem.mockReturnValue("fake-token");

    fetchMock
      .mockResponseOnce(
        JSON.stringify({
          access: true,
          user: { id: 1, username: "user", role: "User" },
        })
      )
      .mockResponseOnce(JSON.stringify({ success: true }));

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    await waitFor(() => {
      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);
    });

    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith("token");
    expect(window.location.href).toBe("/");
  });

  test("highlights active menu item", async () => {
    useLocation.mockReturnValue({ pathname: "/bookmarks" });
    window.sessionStorage.getItem.mockReturnValue("fake-token");

    fetchMock.mockResponseOnce(
      JSON.stringify({
        access: true,
        user: { id: 1, username: "user", role: "User" },
      })
    );

    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    await waitFor(() => {
      const bookmarkLink = screen.getByText("Bookmark").closest("a");
      expect(bookmarkLink).toHaveClass("text-gray-800");
    });
  });
});
