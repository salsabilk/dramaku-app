import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

// Enable fetch mocks
fetchMock.enableMocks();

// Mock Swiper modules
jest.mock("swiper/react", () => ({
  Swiper: ({ children }) => (
    <div data-testid="swiper-container">{children}</div>
  ),
  SwiperSlide: ({ children }) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
}));

jest.mock("swiper/modules", () => ({
  FreeMode: jest.fn(),
  Pagination: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
