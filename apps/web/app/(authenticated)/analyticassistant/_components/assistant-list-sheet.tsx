import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAnalyticAssistant } from "../actions";

type Assistant = {
  form_name: string;
  form_id: string;
  db_connection_json: Record<string, unknown>;
};

export default function AssistantListSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const router = useRouter();

  useEffect(() => {
    getAnalyticAssistant()
      .then((data) => {
        if (data.data) {
          setAssistants(data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching assistants:", error);
      });
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Analytics Assistants</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {assistants.map((assistant) => (
            <button
              key={assistant.form_id}
              className="w-full p-4 text-left hover:bg-gray-100 rounded-lg"
              onClick={() => {
                router.push(`/analyticassistant/${assistant.form_id}`);
                onClose();
              }}
            >
              <h3 className="font-medium">{assistant.form_name}</h3>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
