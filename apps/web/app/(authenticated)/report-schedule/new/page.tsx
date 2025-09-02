import React from "react";
import NewPrompt from "../_components/NewReport";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Prompt",
};

const Page = () => {
  return (
    <div className="max-w-[800px] w-full mx-auto py-5">
      <NewPrompt />
    </div>
  );
};

export default Page;
