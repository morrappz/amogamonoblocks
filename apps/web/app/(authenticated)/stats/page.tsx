import React from "react";
import Stats from "./_components/Stats";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats",
  description: "Stats",
};

const Page = () => {
  return (
    <div>
      <Stats />
    </div>
  );
};

export default Page;
