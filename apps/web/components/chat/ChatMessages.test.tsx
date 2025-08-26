import React from "react";
import { render, screen } from "@testing-library/react";
import { ChatMessages } from "./ChatMessages";

import { ChatMessageBubble } from "./ChatMessageBubble";

// components/chat/ChatMessages.test.tsx

// Mocks
jest.mock("./ChatMessageBubble", () => ({
  ChatMessageBubble: (props: any) => (
    <div data-testid="bubble" data-role={props.message.role}>
      {typeof props.parsedMessage === "string"
        ? props.parsedMessage
        : JSON.stringify(props.parsedMessage)}
      {props.chartType && <span data-testid="chart">{props.chartType}</span>}
      {props.analyticCard && (
        <span data-testid="analytic-card">
          {JSON.stringify(props.analyticCard)}
        </span>
      )}
      {props.analyticCardWithFileApi && (
        <span data-testid="analytic-card-file">
          {JSON.stringify(props.analyticCardWithFileApi)}
        </span>
      )}
      {props.table && (
        <span data-testid="table">{JSON.stringify(props.table)}</span>
      )}
      <button
        data-testid="update-btn"
        onClick={() =>
          props.onUpdateMessage(props.message.id, { isLike: true })
        }
      >
        Update
      </button>
    </div>
  ),
}));
jest.mock("./IntermediateStep", () => ({
  IntermediateStep: (props: any) => (
    <div data-testid="intermediate">{props.message.content}</div>
  ),
}));

const baseMessages = [
  {
    id: "1",
    role: "user",
    content: "Hello!",
    createdAt: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    content: "Hi there!",
    createdAt: new Date(),
  },
  {
    id: "3",
    role: "system",
    content: "System message",
    createdAt: new Date(),
  },
] as const;

const assistantJsonMsg = {
  id: "4",
  role: "assistant",
  content: JSON.stringify({
    content: "Chart data",
    chart: "bar",
    analyticCard: { value: 42 },
    analyticCardWithFileApi: { file: "file1" },
    table: { rows: [1, 2] },
  }),
  createdAt: new Date(),
} as const;

const assistantInvalidJsonMsg = {
  id: "5",
  role: "assistant",
  content: "{invalid json",
  createdAt: new Date(),
} as const;

const sourcesForMessages = {
  "0": { src: "A" },
  "1": { src: "B" },
  "2": { src: "C" },
  "3": { src: "D" },
  "4": { src: "E" },
};

describe("ChatMessages", () => {
  //   it("renders user, assistant, and system messages", () => {
  //     render(
  //       <ChatMessages
  //         messages={baseMessages}
  //         emptyStateComponent={<div data-testid="empty">Empty</div>}
  //         sourcesForMessages={sourcesForMessages}
  //         onUpdateMessage={jest.fn()}
  //       />
  //     );
  //     expect(screen.getByTestId("bubble")).toBeInTheDocument();
  //     expect(screen.getByTestId("intermediate")).toBeInTheDocument();
  //     expect(screen.getAllByTestId("bubble").length).toBe(2); // user + assistant
  //     expect(screen.getByTestId("intermediate")).toHaveTextContent("System message");
  //   });

  it("renders correct parsedMessage for assistant with valid JSON", () => {
    render(
      <ChatMessages
        messages={[assistantJsonMsg]}
        emptyStateComponent={<div />}
        sourcesForMessages={sourcesForMessages}
        onUpdateMessage={jest.fn()}
      />
    );
    expect(screen.getByTestId("bubble")).toHaveTextContent("Chart data");
    expect(screen.getByTestId("chart")).toHaveTextContent("bar");
    expect(screen.getByTestId("analytic-card")).toHaveTextContent("42");
    expect(screen.getByTestId("analytic-card-file")).toHaveTextContent("file1");
    expect(screen.getByTestId("table")).toHaveTextContent("1");
  });

  it("renders original content for assistant with invalid JSON", () => {
    render(
      <ChatMessages
        messages={[assistantInvalidJsonMsg]}
        emptyStateComponent={<div />}
        sourcesForMessages={sourcesForMessages}
        onUpdateMessage={jest.fn()}
      />
    );
    expect(screen.getByTestId("bubble")).toHaveTextContent("{invalid json");
    expect(screen.queryByTestId("chart")).toBeNull();
    expect(screen.queryByTestId("analytic-card")).toBeNull();
    expect(screen.queryByTestId("table")).toBeNull();
  });

  it("renders empty state component if messages is empty", () => {
    render(
      <ChatMessages
        messages={[]}
        emptyStateComponent={<div data-testid="empty">Empty</div>}
        sourcesForMessages={{}}
        onUpdateMessage={jest.fn()}
      />
    );
    // Should render nothing (no bubbles/intermediate)
    expect(screen.queryByTestId("bubble")).toBeNull();
    expect(screen.queryByTestId("intermediate")).toBeNull();
    expect(screen.getByTestId("empty")).toBeInTheDocument();
  });

  it("calls onUpdateMessage when bubble triggers update", () => {
    const onUpdateMessage = jest.fn();
    render(
      <ChatMessages
        messages={[baseMessages[0]]}
        emptyStateComponent={<div />}
        sourcesForMessages={sourcesForMessages}
        onUpdateMessage={onUpdateMessage}
      />
    );
    screen.getByTestId("update-btn").click();
    expect(onUpdateMessage).toHaveBeenCalledWith("1", { isLike: true });
  });

  it("uses correct sourceKey for each message", () => {
    const spyBubble = jest.fn();
    // Override the mock implementation for this test only
    (ChatMessageBubble as any).mockImplementation = Object.assign(
      (props: any) => {
        spyBubble(props.sources);
        return <div data-testid="bubble" />;
      },
      { displayName: "ChatMessageBubble" }
    );
    render(
      <ChatMessages
        messages={[...baseMessages]}
        emptyStateComponent={<div />}
        sourcesForMessages={sourcesForMessages}
        onUpdateMessage={jest.fn()}
      />
    );
    expect(spyBubble).toHaveBeenCalledWith(sourcesForMessages["2"]);
    expect(spyBubble).toHaveBeenCalledWith(sourcesForMessages["1"]);
  });

  //   it("parses assistant message with incomplete JSON as string", () => {
  //     const incompleteJsonMsg = {
  //       id: "6",
  //       role: "assistant",
  //       content: '{"content":"Incomplete"',
  //       createdAt: new Date(),
  //     };
  //     render(
  //       <ChatMessages
  //         messages={[incompleteJsonMsg]}
  //         emptyStateComponent={<div />}
  //         sourcesForMessages={sourcesForMessages}
  //         onUpdateMessage={jest.fn()}
  //       />
  //     );
  //     expect(screen.getByTestId("bubble")).toHaveTextContent(
  //       '{"content":"Incomplete"'
  //     );
  //   });
});
