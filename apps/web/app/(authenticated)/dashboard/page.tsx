import { Metadata } from "next";
import React from "react";
import Dashboard from "./_components/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard",
};

const data = [
  { id: 1, title: "TOTAL USERS", count: "72,540", percent: "1.7%" },
  { id: 2, title: "SESSIONS", count: "29.4" },
  { id: 3, title: "AVG CLICK RATE", count: "56.8", percent: "1.7%" },
  { id: 4, title: "PAGEVIEWS", count: "92,913" },
];

const Page = () => {
  return (
    <div>
      <Dashboard data={data} />
    </div>
  );
};

export default Page;
