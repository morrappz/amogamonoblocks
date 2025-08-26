import React from "react";
import AiPrompt from "./_components/AiPrompt";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Prompt",
  description: "AI Prompt",
};

const Page = () => {
  return (
    <div>
      <AiPrompt />
    </div>
  );
};

export default Page;
