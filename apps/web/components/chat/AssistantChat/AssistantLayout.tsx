import { ReactNode } from "react";
import { StickToBottom } from "use-stick-to-bottom";
import { ScrollToBottom, StickyToBottomContent } from "../ChatWindow";

export function AssistantLayout(props: {
  content: ReactNode;
  footer: ReactNode;
}) {
  return (
    <StickToBottom>
      <StickyToBottomContent
        className="absolute inset-0"
        contentClassName="py-8 px-2"
        content={props.content}
        footer={
          <div className="sticky  bottom-8 px-2">
            <ScrollToBottom className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4" />
            {props.footer}
          </div>
        }
      />
    </StickToBottom>
  );
}
