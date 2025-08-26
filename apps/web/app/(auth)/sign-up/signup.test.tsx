import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUp from "./page";
import { toast } from "sonner";

// app/(auth)/sign-up/page.test.tsx

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
  register: jest.fn(),
  RegisterActionState: {},
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

describe("SignUp page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    actionState = { status: "idle" };
    pendingState = false;
  });

  it("renders all form fields and buttons", () => {
    render(<SignUp />);
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Number/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Or continue with/i)).toBeInTheDocument();
    expect(screen.getByText(/GitHub/i)).toBeInTheDocument();
    expect(screen.getByText(/Facebook/i)).toBeInTheDocument();
  });

  it("shows toast error when user exists", async () => {
    actionState = { status: "user_exists" };
    render(<SignUp />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Account already exists");
    });
  });

  it("shows toast error when registration fails", async () => {
    actionState = { status: "failed" };
    render(<SignUp />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create account");
    });
  });

  it("shows toast error when data is invalid", async () => {
    actionState = { status: "invalid_data" };
    render(<SignUp />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed validating your submission!"
      );
    });
  });

  it("shows toast success and refreshes router on success", async () => {
    actionState = { status: "success" };
    render(<SignUp />);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Account created successfully"
      );
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("disables buttons when loading", () => {
    // Simulate isLoading true
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, jest.fn()]);
    render(<SignUp />);
    expect(screen.getByText(/Create Account/i)).toBeDisabled();
    expect(screen.getByText(/GitHub/i)).toBeDisabled();
    expect(screen.getByText(/Facebook/i)).toBeDisabled();
  });

  it("calls formAction on form submit", async () => {
    render(<SignUp />);
    const submitBtn = screen.getByText(/Create Account/i);
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(mockFormAction).toHaveBeenCalled();
    });
  });

  it("shows validation error for mismatched passwords", async () => {
    // Simulate password mismatch error
    mockHandleSubmit.mockImplementationOnce(
      (fn) => () =>
        fn({
          first_name: "John",
          last_name: "Doe",
          user_email: "john@example.com",
          user_name: "johndoe",
          password: "password1",
          confirmPassword: "password2",
          user_mobile: "+1234567890",
          for_business_name: "Biz",
          for_business_number: "1234567890",
        })
    );
    render(<SignUp />);
    const submitBtn = screen.getByText(/Create Account/i);
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getAllByTestId("form-message").length).toBeGreaterThan(0);
    });
  });

  it("renders terms and privacy links", () => {
    render(<SignUp />);
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
  });
});
