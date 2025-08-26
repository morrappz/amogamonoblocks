import React from "react";
import NewChatContact from "../../../_components/Chat/TabPages/Contacts/NewChatContact";
import { getSingleContact } from "../../../lib/queries";

interface IndexProps {
  params: Promise<{ id: number }>;
}

const ViewContacts = async (props: IndexProps) => {
  const params = await props.params;
  const { id } = params;
  const contactData = await getSingleContact(id);

  return (
    <div className="max-w-[800px]  w-full md:p-4 p-2 mx-auto">
      <NewChatContact isEdit={false} data={contactData} isView={true} />
    </div>
  );
};

export default ViewContacts;
