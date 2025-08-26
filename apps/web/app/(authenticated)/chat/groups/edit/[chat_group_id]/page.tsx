import NewGroup from "../../../_components/Chat/TabPages/Groups/NewGroup";
import { getGroupData } from "../../../lib/actions";

interface IndexProps {
  params: Promise<{
    chat_group_id: string;
  }>;
}

const Page = async (props: IndexProps) => {
  const params = await props.params;
  const data = await getGroupData(params.chat_group_id);

  return (
    <div className="max-w-[800px] w-full mx-auto p-4">
      <NewGroup isEdit={true} data={data[0]} />
    </div>
  );
};

export default Page;
