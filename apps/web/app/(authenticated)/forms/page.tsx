import { Metadata } from "next";
import React from "react";
import Forms from "./_components/Forms";

export const metadata: Metadata = {
  title: "Forms",
  description: "Forms",
};

const Page = () => {
  return (
    <div className="max-w-[800px] mx-auto w-full">
      <Forms />
    </div>
  );
};

export default Page;
