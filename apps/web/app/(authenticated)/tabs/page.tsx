import React from "react";
import TabsBlocks from "./_components/Tabs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tabs",
  description: "Tabs",
};

const Page = () => {
  return (
    <div>
      <TabsBlocks />
    </div>
  );
};

export default Page;
