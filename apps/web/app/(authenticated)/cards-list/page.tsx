import React from "react";
import CardList from "./_components/CardList";

export type FormItem = {
  form_name: string;
  form_code: string;
  status: "active" | "draft" | "archived";
  created_date: string;
  version_no: string;
};

const Page = () => {
  const formItems: FormItem[] = [
    {
      form_name: "Customer Feedback Form",
      form_code: "FB-1023",
      status: "active",
      created_date: "2025-07-28T09:15:00Z",
      version_no: "v1.0.0",
    },
    {
      form_name: "Employee Exit Survey",
      form_code: "HR-334",
      status: "draft",
      created_date: "2025-06-10T14:30:00Z",
      version_no: "v0.9.1",
    },
    {
      form_name: "Vendor Registration",
      form_code: "VR-776",
      status: "archived",
      created_date: "2024-12-01T10:45:00Z",
      version_no: "v2.3.5",
    },
  ];

  return (
    <div className="max-w-[800px] w-full mx-auto">
      <CardList data={formItems} />
    </div>
  );
};

export default Page;
