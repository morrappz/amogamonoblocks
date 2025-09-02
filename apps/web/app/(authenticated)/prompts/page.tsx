import { Metadata } from "next";
import React from "react";
import Prompts from "./_components/Prompts";

export const metadata: Metadata = {
  title: "Prompts",
};

const Page = () => {
  return (
    <div className="max-w-[800px] w-full mx-auto py-5">
      <Prompts />
    </div>
  );
};

export default Page;
