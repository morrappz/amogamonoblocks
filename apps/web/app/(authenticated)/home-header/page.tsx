import React from "react";
import HomeHeader from "./_components/HomeHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Header",
  description: "Home Header",
};

const data = {
  title: "Art Director & Visual Designer",
  content1: "Creating Brands",
  content2: "That Resonate",
  description:
    "I specialize in transforming complex ideas into compelling visual narratives. With a decade of experience in branding and visual design, I help businesses build memorable identities that connect with their audience.",
  trustedBy: ["STUDIO", "ARTLAB", "DESIGNCO", "VISUAL+"],
  image:
    "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.0.3",
};

const Page = () => {
  return (
    <div>
      <HomeHeader data={data} />
    </div>
  );
};

export default Page;
