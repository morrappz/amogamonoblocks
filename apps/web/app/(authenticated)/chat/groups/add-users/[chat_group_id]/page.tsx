import AddUsers from "../../../_components/Chat/TabPages/Groups/AddUsers";
import React from "react";
import { getContacts } from "../../../lib/queries";

interface IndexProps {
  params: Promise<{ chat_group_id: string }>;
}

const Page = async (props: IndexProps) => {
  const params = await props.params;
  const contacts = await getContacts();
  return (
    <div className="max-w-[800px] w-full mx-auto p-4">
      <AddUsers chat_group_id={params.chat_group_id} contacts={contacts} />
    </div>
  );
};

export default Page;
