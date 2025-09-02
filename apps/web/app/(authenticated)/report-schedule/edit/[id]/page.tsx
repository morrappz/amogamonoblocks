import React from "react";
import NewPrompt from "../../_components/NewReport";

interface IndexProps {
  params: Promise<{
    id: number;
  }>;
}

const Page = async ({ params }: IndexProps) => {
  const id = (await params).id;
  return (
    <div className="max-w-[800px] w-full mx-auto py-5">
      <NewPrompt id={id} />
    </div>
  );
};

export default Page;
