import React from "react";
import Help from "./_components/Help";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help",
  description: "Help",
};

const Page = () => {
  return (
    <div>
      <Help />
    </div>
  );
};

export default Page;
