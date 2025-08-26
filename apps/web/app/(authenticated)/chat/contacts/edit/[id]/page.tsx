import NewChatContact from "../../../_components/Chat/TabPages/Contacts/NewChatContact";
import { getReceiverUserData } from "../../../lib/actions";

interface IndexProps {
  params: Promise<{ id: number }>;
}

const EditContacts = async (props: IndexProps) => {
  const params = await props.params;
  const contactInfo = await getReceiverUserData(params.id); 
  const contactData = contactInfo?.data?.[0] ?? null;
  return (
    <div className="overflow-hidden">
      <NewChatContact data={contactData} isEdit={true} isView={false} />
    </div>
  );
};

export default EditContacts;
