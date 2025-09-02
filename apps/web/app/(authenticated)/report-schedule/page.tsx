import { Metadata } from "next";
import React from "react";
import ReportSchedule from "./_components/ReportSchedule";

export const metadata: Metadata = {
  title: "Report Schedule",
};

const Page = () => {
  return (
    <div className="max-w-[800px] w-full mx-auto py-5">
      <ReportSchedule />
    </div>
  );
};

export default Page;
