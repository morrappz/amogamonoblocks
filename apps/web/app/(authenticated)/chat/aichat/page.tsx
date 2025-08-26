import { Metadata } from "next";
import RenderFormSetup from "./_components/RenderFormSetup";
import { getFormSetupData } from "./lib/queries";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "Chat with Preferred Data source",
};

export default async function AiChatPage() {
  const formSetupData = await getFormSetupData();

  return (
    <div className="max-w-[800px] mx-auto p-4">
      <RenderFormSetup data={formSetupData} />
    </div>
  );
}
