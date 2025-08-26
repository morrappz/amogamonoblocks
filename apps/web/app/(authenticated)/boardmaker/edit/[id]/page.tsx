import { Suspense } from "react";
import BoardBuilder from "../../_components/BoardBuilder";
import { getAnalyticAssistants } from "../../lib/queries";

export default async function NewAgentPage() {
  const analyticAssistants = await getAnalyticAssistants();
  return (
    <div className="max-w-[800px] p-4 mx-auto">
      <Suspense fallback={<div>loading...</div>}>
        <BoardBuilder analyticAssistants={analyticAssistants} />
      </Suspense>
    </div>
  );
}
