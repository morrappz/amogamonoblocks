import AgentEditor from "@/app/(authenticated)/agent/_components/AgentEditor";
import React from "react";

interface IndexPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode: string }>;
}

const Page = async (props: IndexPageProps) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const id = params.id;
  return (
    <div className="min-h-[calc(90vh-200px)] overflow-hidden h-full max-w-[800px] mx-auto p-4 w-full">
      <AgentEditor chatId={id} mode={searchParams?.mode} />
    </div>
  );
};

export default Page;
