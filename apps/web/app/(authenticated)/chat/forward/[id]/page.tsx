import ForwardMessagePage from "../../_components/Chat/components/ForwardMessagePage";
import React from "react";
import { getContacts } from "../../lib/queries";

interface IndexProps {
  params: Promise<{
    id: number;
  }>;
}

const page = async (props: IndexProps) => {
  const { id } = await props.params;
  const params = { id };
  const contacts = await getContacts();
  return (
    <div className="max-w-[800px] w-full mx-auto p-4">
      <ForwardMessagePage id={params.id} contacts={contacts} />
    </div>
  );
};

export default page;
