import { notFound } from "next/navigation";
import ApiConnections from "../../../../_components/Connections/ApiConnections";
import { getConnectionById } from "@/app/(authenticated)/agentmaker/lib/queries";

interface PageProps {
  params: {
    id: string;
  };
}

const EditApiPage = async ({ params }: PageProps) => {
  try {
    const response = await getConnectionById(Number(params.id));

    if (!response || response.length === 0) {
      notFound();
    }

    const connection = response[0];
    const connectionData =
      typeof connection.api_connection_json === "string"
        ? JSON.parse(connection.api_connection_json)
        : connection.api_connection_json;

    if (!connectionData) {
      notFound();
    }

    return (
      <div className="max-w-[800px] mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Edit API Connection</h1>
        <ApiConnections
          isEditing={true}
          connectionId={params.id}
          initialData={{
            ...connection,
            ...connectionData,
            connection_type: "api",
          }}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching connection:", error);
    notFound();
  }
};

export default EditApiPage;
