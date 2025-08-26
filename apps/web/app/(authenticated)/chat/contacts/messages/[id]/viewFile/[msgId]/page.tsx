import ChatFilePreview from "@/app/(authenticated)/chat/_components/Chat/components/ChatFilePreview";
import { getMessageForPreview } from "@/app/(authenticated)/chat/lib/actions";

interface IndexProps {
  params: Promise<{
    id: number;
    msgId: string;
  }>;
}

const Page = async (props: IndexProps) => {
  const params = await props.params;
  const { id, msgId } = params;
  const data = await getMessageForPreview(msgId);

  return (
    <div className="max-w-[800px] mx-auto p-4">
      <ChatFilePreview data={data} id={id} msgId={msgId} />
    </div>
  );
};

export default Page;
