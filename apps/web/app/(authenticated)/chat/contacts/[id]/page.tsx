import AgentEditor from "@/app/(authenticated)/agent/_components/AgentEditor";
import React from "react";

const page = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  return (
    <div className="min-h-[calc(90vh-200px)] overflow-hidden h-full max-w-[800px] mx-auto p-4 w-full">
      <AgentEditor chatId={id} />
    </div>
  );
};

export default page;
