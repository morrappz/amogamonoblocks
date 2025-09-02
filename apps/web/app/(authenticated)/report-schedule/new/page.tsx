import React from "react";
import { Metadata } from "next";
import NewReport from "../_components/NewReport";

export const metadata: Metadata = {
  title: "New Prompt",
};

const Page = () => {
  return (
    <div className="max-w-[800px] w-full mx-auto py-5">
      <NewReport />
    </div>
  );
};

export default Page;
