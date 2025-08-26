import { Metadata } from "next";
import React from "react";
import Buttons from "./_components/Buttons";

export const metadata: Metadata = {
  title: "Buttons",
  description: "Buttons",
};

const Page = () => {
  return (
    <div className="max-w-[800px] mx-auto w-full flex h-full items-center justify-center">
      <Buttons />
    </div>
  );
};

export default Page;
