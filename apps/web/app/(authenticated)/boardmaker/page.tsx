import React from "react";
import BoardMaker from "./_components/BoardMaker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Board Maker",
  description: "Create Custom Boards",
};

const Page = () => {
  return <BoardMaker />;
};

export default Page;
