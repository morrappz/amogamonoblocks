import { Metadata } from "next";
import React from "react";
import Notifications from "./_components/Notifications";
import { getNotifications } from "./lib/queries";

export const metadata: Metadata = {
  title: "Notifications",
};

const Page = async () => {
  const notifications = await getNotifications();
  return (
    <div className="max-w-[800px] mx-auto">
      <Notifications notifications={notifications} />
    </div>
  );
};

export default Page;
