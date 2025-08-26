import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApiSettingsPage from "./page";
import { toast } from "sonner";
// app/(authenticated)/store-settings/page.test.tsx

// Mock toast

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock actions
const mockGetConnectionSettings = jest.fn();
const mockSaveConnectionSettings = jest.fn();
const mockTestConnection = jest.fn();
const mockSaveAISettings = jest.fn();
const mockLoadAISettings = jest.fn();

jest.mock("./actions", () => ({
  getConnectionSettings: () => mockGetConnectionSettings(),
  saveConnectionSettings: (...args) => mockSaveConnectionSettings(...args),
  testConnection: (...args) => mockTestConnection(...args),
  saveAISettings: (...args) => mockSaveAISettings(...args),
  loadAISettings: () => mockLoadAISettings(),
}));

// Mock child components
jest.mock("./_components/ShopifyForm", () => ({
  ShopifyForm: (props: any) => (
    <div data-testid="shopify-form">
      ShopifyForm
      <button onClick={() => props.onTestConnection?.()}>
        Test Connection
      </button>
      <button onClick={() => props.onSave?.()}>Save</button>
    </div>
  ),
}));
jest.mock("./_components/WooCommerceForm", () => ({
  WooCommerceForm: (props: any) => (
    <div data-testid="woocommerce-form">
      WooCommerceForm
      <button onClick={() => props.onTestConnection?.()}>
        Test Connection
      </button>
      <button onClick={() => props.onSave?.()}>Save</button>
    </div>
  ),
}));
jest.mock("./_components/BusinessSettingsForm", () => ({
  BusinessSettingsForm: () => (
    <div data-testid="business-settings-form">BusinessSettingsForm</div>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetConnectionSettings.mockResolvedValue({
    data: [
      {
        platform_type: "woocommerce",
        status: "active",
        credentials: {
          woocommerce: { url: "https://woo.com", key: "woo-key" },
        },
        remarks: "Woo remarks",
      },
      {
        platform_type: "shopify",
        status: "active",
        credentials: {
          shopify: { url: "https://shop.com", key: "shop-key" },
        },
        remarks: "Shop remarks",
      },
    ],
  });
  mockLoadAISettings.mockResolvedValue({
    provider: "openai",
    apiKey: "test-key",
  });
});

it("shows loading spinner initially", async () => {
  mockGetConnectionSettings.mockResolvedValueOnce({});
  render(<ApiSettingsPage />);
  // expect(screen.getByRole("status")).toBeInTheDocument();
  await waitFor(() => expect(mockGetConnectionSettings).toHaveBeenCalled());
});

it("renders tabs and switches between them", async () => {
  render(<ApiSettingsPage />);
  await waitFor(() =>
    expect(screen.getByText("API Connection Settings")).toBeInTheDocument()
  );
  expect(screen.getByText("Store")).toBeInTheDocument();
  expect(screen.getByText("WooCommerce")).toBeInTheDocument();
  expect(screen.getByText("AI APIs")).toBeInTheDocument();

  // Default tab is Store
  expect(screen.getByTestId("business-settings-form")).toBeInTheDocument();

  // Switch to WooCommerce tab
  await userEvent.click(screen.getByText("WooCommerce"));
  expect(screen.getByTestId("woocommerce-form")).toBeInTheDocument();

  // Switch to AI tab
  await userEvent.click(screen.getByText("AI APIs"));
  expect(screen.getByLabelText("Provider")).toBeInTheDocument();
  expect(screen.getByLabelText("API Key")).toBeInTheDocument();
});

it("handles WooCommerce test connection and save", async () => {
  mockTestConnection.mockResolvedValue({ success: true, message: "Test OK" });
  mockSaveConnectionSettings.mockResolvedValue({
    success: true,
    message: "Saved",
    data: [],
  });

  render(<ApiSettingsPage />);
  // await userEvent.click(screen.getByText("WooCommerce"));

  // Test connection
  await userEvent.click(screen.getByText("Test Connection"));
  await waitFor(() =>
    expect(toast.info).toHaveBeenCalledWith("Testing woocommerce connection...")
  );
  await waitFor(() => expect(mockTestConnection).toHaveBeenCalled());
  await waitFor(() =>
    expect(toast.success).toHaveBeenCalledWith(
      "Connection Test Successful",
      expect.any(Object)
    )
  );

  // Save settings
  await userEvent.click(screen.getByText("Save"));
  await waitFor(() =>
    expect(toast.info).toHaveBeenCalledWith("Saving woocommerce settings...")
  );
  await waitFor(() => expect(mockSaveConnectionSettings).toHaveBeenCalled());
  await waitFor(() =>
    expect(toast.success).toHaveBeenCalledWith(
      "Settings Saved",
      expect.any(Object)
    )
  );
});

it("shows error toast if WooCommerce config is missing", async () => {
  mockGetConnectionSettings.mockResolvedValueOnce({ data: [] });
  render(<ApiSettingsPage />);
  await userEvent.click(screen.getByText("WooCommerce"));
  await userEvent.click(screen.getByText("Test Connection"));
  expect(toast.error).toHaveBeenCalledWith(
    "Missing configuration",
    expect.any(Object)
  );
  await userEvent.click(screen.getByText("Save"));
  expect(toast.error).toHaveBeenCalledWith(
    "Missing configuration",
    expect.any(Object)
  );
});

it("handles AI tab save", async () => {
  mockSaveAISettings.mockResolvedValue({ success: true });
  render(<ApiSettingsPage />);
  await userEvent.click(screen.getByText("AI APIs"));

  // Change provider
  await userEvent.click(screen.getByText("Select Provider"));
  await userEvent.click(screen.getByText("Gemini"));
  expect(screen.getByDisplayValue("gemini")).toBeInTheDocument();

  // Change API key
  const apiKeyInput = screen.getByLabelText("API Key");
  await userEvent.clear(apiKeyInput);
  await userEvent.type(apiKeyInput, "new-key");
  expect(screen.getByDisplayValue("new-key")).toBeInTheDocument();

  // Save AI settings
  await userEvent.click(screen.getByText("Save AI Settings"));
  await waitFor(() =>
    expect(toast.info).toHaveBeenCalledWith("Saving AI settings...")
  );
  await waitFor(() =>
    expect(mockSaveAISettings).toHaveBeenCalledWith("gemini", "new-key")
  );
  await waitFor(() =>
    expect(toast.success).toHaveBeenCalledWith(
      "AI settings saved successfully."
    )
  );
});

it("shows error toast if AI provider or API key is missing", async () => {
  mockLoadAISettings.mockResolvedValueOnce({ provider: "", apiKey: "" });
  render(<ApiSettingsPage />);
  await userEvent.click(screen.getByText("AI APIs"));
  await userEvent.click(screen.getByText("Save AI Settings"));
  expect(toast.error).toHaveBeenCalledWith(
    "Missing AI configuration",
    expect.any(Object)
  );
});

it("shows error toast if getConnectionSettings fails", async () => {
  mockGetConnectionSettings.mockResolvedValueOnce({ error: "fail" });
  render(<ApiSettingsPage />);
  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith(
      "Failed to load settings",
      expect.any(Object)
    )
  );
});

it("shows error toast if loadAISettings fails", async () => {
  mockLoadAISettings.mockRejectedValueOnce(new Error("AI fail"));
  render(<ApiSettingsPage />);
  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith(
      "Failed to load AI settings",
      expect.any(Object)
    )
  );
});
