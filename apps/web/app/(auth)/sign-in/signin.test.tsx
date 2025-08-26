import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignIn from "./page";
import { toast } from "sonner";

// app/(auth)/sign-in/page.test.tsx

// Mock UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <form>{children}</form>,
  FormField: ({ render, ...props }: any) => render({ field: props }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormMessage: () => <div data-testid="form-message" />,
}));
jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));
jest.mock("@/components/password-input", () => ({
  PasswordInput: (props: any) => <input type="password" {...props} />,
}));
jest.mock("lucide-react", () => ({
  Github: () => <svg data-testid="github-icon" />,
  Facebook: () => <svg data-testid="facebook-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
}));

// Mock next/router
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock toast
const toastMock = {
  error: jest.fn(),
  success: jest.fn(),
};
jest.mock("sonner", () => ({
  toast: toastMock,
}));

// Mock actions
jest.mock("../actions", () => ({
  login: jest.fn(),
  LoginActionState: {},
}));

// Mock useActionState
let actionState = { status: "idle" };
let pendingState = false;
const mockFormAction = jest.fn();
jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return {
    ...actual,
    useActionState: () => [actionState, mockFormAction, pendingState],
    useEffect: actual.useEffect,
    useState: actual.useState,
    startTransition: (fn: any) => fn(),
  };
});

// Mock react-hook-form
const mockHandleSubmit = jest.fn((fn) => (e: any) => fn(e));
const mockSetValue = jest.fn();
const mockFormControl = {};
jest.mock("react-hook-form", () => ({
  useForm: () => ({
    control: mockFormControl,
    handleSubmit: mockHandleSubmit,
    setValue: mockSetValue,
    getValues: jest.fn(),
    formState: { errors: {} },
    register: jest.fn(),
  }),
}));

// Mock zodResolver
jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: jest.fn(),
}));

describe("SignIn page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    actionState = { status: "idle" };
    pendingState = false;
  });

  it("renders all form fields and buttons with accessible labels", () => {
    render(<SignIn />);
    // Check for visible labels
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    // Check for heading
    expect(screen.getByRole("heading", { name: /Login/i })).toBeInTheDocument();
    // Check for buttons by role
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /GitHub/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Facebook/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Or continue with/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  it("shows toast error when login fails", async () => {
    actionState = { status: "failed" };
    render(<SignIn />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials!");
    });
  });

  it("shows toast error when data is invalid", async () => {
    actionState = { status: "invalid_data" };
    render(<SignIn />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed validating your submission!"
      );
    });
  });

  it("refreshes router on success", async () => {
    actionState = { status: "success" };
    render(<SignIn />);
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("disables buttons when loading", () => {
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);
    render(<SignIn />);
    expect(screen.getByRole("button", { name: /Login/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /GitHub/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Facebook/i })).toBeDisabled();
  });

  it("calls formAction on form submit", async () => {
    render(<SignIn />);
    const submitBtn = screen.getByRole("button", { name: /Login/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(mockFormAction).toHaveBeenCalled();
    });
  });

  it("renders terms and privacy links", () => {
    render(<SignIn />);
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
  });
});
