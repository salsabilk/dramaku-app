import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PaginationHome from "../src/components/PaginationHome";

describe("PaginationHome Component", () => {
  const mockPaginate = jest.fn();

  beforeEach(() => {
    mockPaginate.mockClear();
  });

  test("renders correctly with multiple pages", () => {
    render(
      <PaginationHome currentPage={2} totalPages={5} paginate={mockPaginate} />
    );

    // Check if the page numbers are rendered
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    // Check if Prev and Next buttons are present
    expect(screen.getByText("Prev")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  test("disables 'Prev' button on the first page", () => {
    render(
      <PaginationHome currentPage={1} totalPages={5} paginate={mockPaginate} />
    );

    const prevButton = screen.getByText("Prev");
    expect(prevButton).toBeDisabled();
  });

  test("disables 'Next' button on the last page", () => {
    render(
      <PaginationHome currentPage={5} totalPages={5} paginate={mockPaginate} />
    );

    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();
  });

  test("calls paginate with correct page number when a page button is clicked", () => {
    render(
      <PaginationHome currentPage={2} totalPages={5} paginate={mockPaginate} />
    );

    const pageButton = screen.getByText("3");
    fireEvent.click(pageButton);

    expect(mockPaginate).toHaveBeenCalledWith(3);
  });

  test("calls paginate with previous page when 'Prev' is clicked", () => {
    render(
      <PaginationHome currentPage={3} totalPages={5} paginate={mockPaginate} />
    );

    const prevButton = screen.getByText("Prev");
    fireEvent.click(prevButton);

    expect(mockPaginate).toHaveBeenCalledWith(2);
  });

  test("calls paginate with next page when 'Next' is clicked", () => {
    render(
      <PaginationHome currentPage={3} totalPages={5} paginate={mockPaginate} />
    );

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    expect(mockPaginate).toHaveBeenCalledWith(4);
  });

  test("renders no pagination when totalPages is 1", () => {
    const { container } = render(
      <PaginationHome currentPage={1} totalPages={1} paginate={mockPaginate} />
    );

    expect(container.firstChild).toBeNull();
  });
});
