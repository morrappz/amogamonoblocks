import { notFound } from "next/navigation";
import { getConnectionById } from "@/app/(authenticated)/agentmaker/lib/queries";
import DocumentConnections from "@/app/(authenticated)/agentmaker/_components/Connections/DocumentConnections";

interface PageProps {
  params: {
    id: string;
  };
}

const EditDocumentPage = async ({ params }: PageProps) => {
  // Early validation of the id parameter
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

    // Safely parse JSON with error handling
    let connectionData;
    try {
      connectionData =
        typeof connection.document_connection_json === "string"
          ? JSON.parse(connection.document_connection_json)
          : connection.document_connection_json;
    } catch (parseError) {
      console.error("Error parsing connection JSON:", parseError);
      notFound();
    }

    if (!connectionData) {
      notFound();
    }

    return (
      <div className="max-w-[800px] mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Edit Document Connection</h1>
        <DocumentConnections
          connectionId={params.id}
          isEditing={true}
          initialData={{
            ...connection,
            ...connectionData,
            connection_type: "document",
          }}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching connection:", error);
    notFound();
  }
};

export default EditDocumentPage;
