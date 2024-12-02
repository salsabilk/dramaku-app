import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Comment from "../src/components/Comment";

describe("Comment Component", () => {
  const mockProps = {
    avatar: "https://example.com/avatar.jpg",
    name: "Salsabil Kh",
    comment: "Great drama!",
    rating: "4.5/5",
  };

  test("renders comment with all props correctly", () => {
    render(<Comment {...mockProps} />);

    // Cek nama user
    expect(screen.getByText("Salsabil Kh")).toBeInTheDocument();

    // Cek isi komentar
    expect(screen.getByText("Great drama!")).toBeInTheDocument();

    // Cek rating
    expect(screen.getByText("4.5/5")).toBeInTheDocument();

    // Cek avatar menggunakan querySelector karena img tidak memiliki role yang tepat
    const avatar = document.querySelector(
      'img[src="https://example.com/avatar.jpg"]'
    );
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
    expect(avatar).toHaveClass(
      "object-cover",
      "w-full",
      "h-full",
      "rounded-full"
    );
  });

  test("renders long comments correctly", () => {
    const propsWithLongComment = {
      ...mockProps,
      comment:
        "This is a very long comment that should still be displayed correctly in the component without breaking the layout or truncating the text.",
    };

    render(<Comment {...propsWithLongComment} />);

    // Cek apakah komentar panjang ditampilkan dengan benar
    expect(screen.getByText(propsWithLongComment.comment)).toBeInTheDocument();
  });
});
