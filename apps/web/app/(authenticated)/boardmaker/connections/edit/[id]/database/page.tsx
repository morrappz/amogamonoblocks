import { notFound } from "next/navigation";
import { getConnectionById } from "@/app/(authenticated)/agentmaker/lib/queries";
import DBConnections from "@/app/(authenticated)/agentmaker/_components/Connections/DBConnections";

interface PageProps {
  params: {
    id: string;
  };
}

const EditDatabasePage = async ({ params }: PageProps) => {
  if (!params?.id || isNaN(Number(params.id))) {
    notFound();
  }

  const connectionId = Number(params.id);
  try {
    const response = await getConnectionById(connectionId);

    if (!response || response.length === 0) {
      notFound();
    }

    const connection = response[0];
    const connectionData =
      typeof connection.database_connection_json === "string"
        ? JSON.parse(connection.database_connection_json)
        : connection.database_connection_json;

    if (!connectionData) {
      notFound();
    }

    return (
      <div className="max-w-[800px] mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Edit Database Connection</h1>
        <DBConnections
          isEditing={true}
          connectionId={params.id}
          initialData={{
            ...connection,
            ...connectionData,
            connection_type: "database",
          }}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching connection:", error);
    notFound();
  }
};

export default EditDatabasePage;
