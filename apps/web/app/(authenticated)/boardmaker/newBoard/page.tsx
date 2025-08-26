import { Metadata } from "next";
import BoardBuilder from "../_components/BoardBuilder";
import { getAnalyticAssistants } from "../lib/queries";

export const metadata: Metadata = {
  title: "New Board Maker",
  description: "Create New Boards",
};

export default async function NewAgentPage() {
  const analyticAssistants = await getAnalyticAssistants();

  return (
    <div className="max-w-[800px] p-4 mx-auto">
      <BoardBuilder analyticAssistants={analyticAssistants} />
    </div>
  );
}
