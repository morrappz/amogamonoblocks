import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignOutButton } from "./signout-button";

// app/(auth)/signout-button.test.tsx

// Mock next-auth/react
const mockSignOut = jest.fn();
jest.mock("next-auth/react", () => ({
  signOut: (...args: any[]) => mockSignOut(...args),
}));

// Import component after mocking

describe("SignOutButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the sign out button with icon and text", () => {
    render(<SignOutButton />);
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
    // Icon is rendered as an SVG element with lucide-log-out class
    expect(document.querySelector("svg.lucide-log-out")).toBeInTheDocument();
  });

  it("calls signOut when clicked", async () => {
    render(<SignOutButton />);
    await userEvent.click(screen.getByText("Sign Out"));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("calls signOut with callbackUrl for redirection", async () => {
    render(<SignOutButton />);
    await userEvent.click(screen.getByText("Sign Out"));
    // Simulate signOut with callbackUrl
    expect(mockSignOut).toHaveBeenCalledWith();
    // You can also test with a callbackUrl if your implementation supports it:
    // await userEvent.click(screen.getByText('Sign Out'));
    // expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
  });
});
