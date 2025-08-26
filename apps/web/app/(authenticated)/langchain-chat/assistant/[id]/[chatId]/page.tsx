import { AssistantWindow } from "@/components/chat/AssistantChat/AssistantWindow";

interface IndexProps {
  params: Promise<{ id: string; chatId: string }>;
}

export default async function Page({ params }: IndexProps) {
  const assistantId = (await params).id;
  const chatId = (await params).chatId;

  return (
    <div className="mx-auto">
      {/* <AIOptions /> */}
      <AssistantWindow
        key={assistantId || "new-chat"} // Force remount when chatId changes
        endpoint="/api/chat"
        emoji="🏴‍☠️"
        placeholder="Enter prompt..."
        assistantId={assistantId}
        chatId={chatId}
      />
    </div>
  );
}
