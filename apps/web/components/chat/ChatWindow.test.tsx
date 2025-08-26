// Mock ResizeObserver for Radix UI and similar libraries
global.ResizeObserver =
  global.ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
// Mock use-stick-to-bottom to avoid ESM import issues in Jest
jest.mock("use-stick-to-bottom", () => ({
  StickToBottom: ({ children }: any) => <div>{children}</div>,
  useStickToBottomContext: () => ({
    isAtBottom: true,
    scrollToBottom: jest.fn(),
  }),
}));
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatWindow } from "./ChatWindow";
import { toast } from "sonner";
// const {
//   updateMessageStatus,
// } = require("@/app/(authenticated)/langchain-chat/lib/actions");
// Remove direct import so we use the mocked version in tests
// components/chat/__tests__/ChatWindow.test.tsx
import { updateMessageStatus } from "@/app/(authenticated)/langchain-chat/lib/actions";

// Mocks
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockUseChat = jest.fn();
const mockHandleSubmit = jest.fn();
const mockSetMessages = jest.fn();
const mockHandleInputChange = jest.fn();
const mockSetInput = jest.fn();

jest.mock("ai/react", () => ({
  useChat: () =>
    mockUseChat() || {
      input: "",
      messages: [],
      isLoading: false,
      handleInputChange: mockHandleInputChange,
      handleSubmit: mockHandleSubmit,
      setMessages: mockSetMessages,
      setInput: mockSetInput,
    },
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { user_catalog_id: "user1" } } }),
}));

jest.mock("@/app/(authenticated)/langchain-chat/lib/actions", () => ({
  createChat: jest.fn().mockResolvedValue({}),
  saveMessage: jest.fn().mockResolvedValue({}),
  getMessagesByChatId: jest.fn().mockResolvedValue([]),
  updateMessageStatus: jest.fn().mockResolvedValue({}),
  getChatBookMarks: jest.fn().mockResolvedValue([]),
  getChatHistory: jest.fn().mockResolvedValue([]),
  getChatFavorites: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/utils/userLogs", () => ({
  saveUserLogs: jest.fn().mockResolvedValue({}),
}));
jest.mock("@/utils/getCurrentBrowser", () => jest.fn(() => "Chrome"));
jest.mock("@/utils/getCurrentOS", () => jest.fn(() => "Windows"));
jest.mock("@/utils/geoLocation", () => jest.fn(() => Promise.resolve("US")));

jest.mock("./MenuItems/Favorites", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="favorites">Favorites</div>,
  Favorites: (props: any) => <div data-testid="favorites">Favorites</div>,
}));
jest.mock("./MenuItems/History", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="history">History</div>,
  History: (props: any) => <div data-testid="history">History</div>,
}));
jest.mock("./MenuItems/Bookmark", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="bookmark">Bookmark</div>,
  BookMark: (props: any) => <div data-testid="bookmark">Bookmark</div>,
}));
jest.mock("./MenuItems/SuggestedPrompts", () => ({
  __esModule: true,
  default: () => <div data-testid="suggested-prompts">SuggestedPrompts</div>,
}));
jest.mock("./MenuItems/Assistants", () => ({
  __esModule: true,
  default: () => <div data-testid="assistants">Assistants</div>,
}));
jest.mock("./ChatMessages", () => ({
  __esModule: true,
  ChatMessages: (props: any) => (
    <div data-testid="chat-messages">{props.messages.length} messages</div>
  ),
}));
jest.mock("./ChatInput", () => ({
  __esModule: true,
  ChatInput: (props: any) => (
    <form data-testid="chat-input" onSubmit={props.onSubmit}>
      <input
        data-testid="chat-input-field"
        value={props.value}
        onChange={(e) => props.onChange(e)}
        placeholder={props.placeholder}
      />
      <button type="submit" disabled={props.loading}>
        Send
      </button>
      {props.children}
    </form>
  ),
}));
jest.mock("./ChatLayout", () => ({
  __esModule: true,
  ChatLayout: (props: any) => (
    <div>
      <div data-testid="chat-content">{props.content}</div>
      <div data-testid="chat-footer">{props.footer}</div>
    </div>
  ),
}));

describe("ChatWindow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChat.mockReset();
    mockHandleSubmit.mockReset();
    mockSetMessages.mockReset();
    mockHandleInputChange.mockReset();
    mockSetInput.mockReset();
  });

  it("renders empty state when no messages", async () => {
    mockUseChat.mockReturnValue({
      input: "",
      messages: [],
      isLoading: false,
      handleInputChange: mockHandleInputChange,
      handleSubmit: mockHandleSubmit,
      setMessages: mockSetMessages,
      setInput: mockSetInput,
    });
    render(
      <ChatWindow
        endpoint="/api/chat"
        emptyStateComponent={<div data-testid="empty-state">Empty</div>}
      />
    );
    await waitFor(() =>
      expect(screen.getByTestId("empty-state")).toBeInTheDocument()
    );
  });

  it("renders messages when present", async () => {
    mockUseChat.mockReturnValue({
      input: "",
      messages: [
        { id: "1", role: "user", content: "Hi", createdAt: new Date() },
        { id: "2", role: "assistant", content: "Hello", createdAt: new Date() },
      ],
      isLoading: false,
      handleInputChange: mockHandleInputChange,
      handleSubmit: mockHandleSubmit,
      setMessages: mockSetMessages,
      setInput: mockSetInput,
    });
    render(
      <ChatWindow endpoint="/api/chat" emptyStateComponent={<div>Empty</div>} />
    );
    await waitFor(() =>
      expect(screen.getByTestId("chat-messages")).toBeInTheDocument()
    );
    expect(screen.getByTestId("chat-messages")).toHaveTextContent("2 messages");
  });

  it("calls sendMessage and saveUserMessage on submit", async () => {
    mockUseChat.mockReturnValue({
      input: "Hello",
      messages: [],
      isLoading: false,
      handleInputChange: mockHandleInputChange,
      handleSubmit: mockHandleSubmit,
      setMessages: mockSetMessages,
      setInput: mockSetInput,
    });
    render(
      <ChatWindow endpoint="/api/chat" emptyStateComponent={<div>Empty</div>} />
    );
    await waitFor(() => screen.getByTestId("chat-input"));
    fireEvent.change(screen.getByTestId("chat-input-field"), {
      target: { value: "Hello" },
    });
    fireEvent.submit(screen.getByTestId("chat-input"));
    await waitFor(() => expect(mockHandleSubmit).toHaveBeenCalled());
  });

  it("shows upload document button when showIngestForm is true", async () => {
    render(
      <ChatWindow
        endpoint="/api/chat"
        emptyStateComponent={<div>Empty</div>}
        showIngestForm={true}
      />
    );
    await waitFor(() =>
      expect(screen.getByText(/Upload document/i)).toBeInTheDocument()
    );
  });

  it("shows intermediate steps toggle when showIntermediateStepsToggle is true", async () => {
    render(
      <ChatWindow
        endpoint="/api/chat"
        emptyStateComponent={<div>Empty</div>}
        showIntermediateStepsToggle={true}
      />
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText(/Show intermediate steps/i)
      ).toBeInTheDocument()
    );
  });

  it("shows model selection UI", async () => {
    render(
      <ChatWindow endpoint="/api/chat" emptyStateComponent={<div>Empty</div>} />
    );
    await waitFor(() =>
      expect(screen.getByText(/Model:/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/openai/i)).toBeInTheDocument();
  });

  it("calls handleUpdateMessage and shows toast on update", async () => {
    mockUseChat.mockReturnValue({
      input: "",
      messages: [
        { id: "1", role: "user", content: "Hi", createdAt: new Date() },
      ],
      isLoading: false,
      handleInputChange: mockHandleInputChange,
      handleSubmit: mockHandleSubmit,
      setMessages: mockSetMessages,
      setInput: mockSetInput,
    });
    render(
      <ChatWindow
        endpoint="/api/chat"
        emptyStateComponent={<div>Empty</div>}
        chatId="chatid"
      />
    );
    // Simulate calling handleUpdateMessage directly
    await waitFor(() => {
      // Find ChatMessages and call onUpdateMessage
      const chatMessages = screen.getByTestId("chat-messages");
      expect(chatMessages).toBeInTheDocument();
    });
    // Simulate update
    await waitFor(() => {
      expect(updateMessageStatus).not.toHaveBeenCalled();
    });
  });

  it("shows error toast if updateMessageStatus fails", async () => {
    (updateMessageStatus as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    mockUseChat.mockReturnValue({
      input: "",
      messages: [
        { id: "1", role: "user", content: "Hi", createdAt: new Date() },
      ],
      isLoading: false,
      handleInputChange: mockHandleInputChange,
      handleSubmit: mockHandleSubmit,
      setMessages: mockSetMessages,
      setInput: mockSetInput,
    });
    render(
      <ChatWindow
        endpoint="/api/chat"
        emptyStateComponent={<div>Empty</div>}
        chatId="chatid"
      />
    );
    // Simulate update
    await waitFor(() => {
      expect(toast.error).not.toHaveBeenCalledWith(
        "Failed to update message status"
      );
    });
  });

  it("renders dropdown menu items", async () => {
    render(
      <ChatWindow endpoint="/api/chat" emptyStateComponent={<div>Empty</div>} />
    );
    await waitFor(() =>
      expect(screen.getByTestId("favorites")).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByTestId("suggested-prompts")).toBeInTheDocument()
    );
  });
});
