import { Metadata } from "next";
import React from "react";
import UserBilling from "./_components/UserBilling";

export const metadata: Metadata = {
  title: "User Billing",
  description: "User Billing",
};

const invoices = [
  {
    id: "INV-001",
    date: "Mar 1, 2024",
    amount: "$29.00",
    status: "Paid",
  },
  {
    id: "INV-002",
    date: "Feb 1, 2024",
    amount: "$29.00",
    status: "Paid",
  },
  {
    id: "INV-003",
    date: "Jan 1, 2024",
    amount: "$29.00",
    status: "Paid",
  },
];

const Page = () => {
  return (
    <div>
      <UserBilling data={invoices} />
    </div>
  );
};

export default Page;
