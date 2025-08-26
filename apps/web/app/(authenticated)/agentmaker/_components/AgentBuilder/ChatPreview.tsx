"use client";
import * as React from "react";
import { Bot, User } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FaArrowUp } from "react-icons/fa6";
import RenderInputField from "./render-chat-field";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UiTable,
} from "@/components/ui/table";
import { form_json_list } from "../../types/types";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: React.ReactNode;
  componentType?: string;
};
interface FormData {
  [field: string]: string | number;
}

export function Chat({ formFields }: { formFields: form_json_list }) {
  const [messages, setMessages] = React.useState<Message[]>([]);

  const [input, setInput] = React.useState("");
  const [currentStep, setCurrentStep] = React.useState(0);
  const [formData, setFormData] = React.useState<FormData>({});
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  );
  console.log("formData----", formData);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const addMessage = React.useCallback(
    (
      role: "user" | "assistant",
      content: React.ReactNode,
      componentType?: string
    ) => {
      setMessages((prev) => [
        ...prev,
        { id: uuidv4(), role, content, componentType },
      ]);
      setTimeout(scrollToBottom, 50);
    },
    []
  );

  // Find the first non-disabled field
  const findFirstActiveField = () => {
    return formFields.findIndex(
      (field: { disabled: boolean }) => !field.disabled
    );
  };

  React.useEffect(() => {
    // Find the first non-disabled field
    const firstActiveFieldIndex = findFirstActiveField();

    if (firstActiveFieldIndex !== -1) {
      const firstField = formFields[firstActiveFieldIndex];
      addMessage(
        "assistant",
        <div className="flex flex-col">
          <div className="flex gap-2 items-center">
            <span>{firstField.label}</span>{" "}
            {firstField.required && <span className="text-red-500">*</span>}
          </div>
          <span className="text-sm text-gray-400">
            {firstField.description}
          </span>
        </div>
      );

      // Update current step to the first active field
      setCurrentStep(firstActiveFieldIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const FormSummaryCard = ({ formData }: { formData: FormData }) => {
    const columns = ["Field", "Value"];

    const renderValue = (value: string | number | string[]) => {
      console.log("valie----", value);
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "[]";
      } else if (typeof value === "object" && value !== null) {
        // Render objects as a nested table or JSON string
        return (
          <details className="bg-muted p-2 rounded">
            <summary className="cursor-pointer">View Details</summary>
            <pre className="text-sm mt-2 whitespace-pre-wrap break-words">
              {JSON.stringify(value, null, 2)}
            </pre>
          </details>
        );
      }
      return value !== null && value !== undefined ? value : "N/A";
    };

    return (
      <Card className="mt-4">
        <UiTable className="min-w-full divide-y divide-border">
          <TableHeader className="bg-secondary sticky top-0 shadow-sm">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-card divide-y divide-border">
            {Object.entries(formData).map(([field, value], index) => (
              <TableRow key={index} className="hover:bg-muted">
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {field}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {renderValue(value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </UiTable>
      </Card>
    );
  };

  // Validation function

  const findNextActiveField = (currentIndex: number) => {
    for (let i = currentIndex + 1; i < formFields.length; i++) {
      if (!formFields[i].disabled) {
        return i;
      }
    }
    return -1; // No more active fields
  };

  const handleSubmit = () => {
    const currentField = formFields[currentStep];

    console.log("variant-----", currentField.variant);

    if (input) {
      // Add user's message
      if (currentField.variant === "Label") {
        addMessage("user", currentField.label || "Label");
      }
      addMessage("user", input || "Submitted");

      const updatedFormData = {
        ...formData,
        [currentField.name]: input,
      };

      // Update form data
      setFormData(updatedFormData); // Ensure state reflects all values
      setInput("");

      // Find the next active field
      const nextStep = findNextActiveField(currentStep);
      setCurrentStep(nextStep);

      if (nextStep !== -1) {
        const nextField = formFields[nextStep];

        // Add next field's prompt
        addMessage(
          "assistant",
          <div>
            <br />
            <span className="label">{nextField.label}</span>
            {nextField.required && <span className="text-red-500">*</span>}
            <br />
            <span className="text-sm text-gray-400">
              {nextField.description}
            </span>
          </div>
        );
      } else {
        // Form completed
        addMessage(
          "assistant",
          "Thank you for completing the form. Here's a summary of your inputs:"
        );
        addMessage("assistant", <FormSummaryCard formData={updatedFormData} />);
      }
    }
  };

  return (
    <Card className="w-full max-w-[950px] mx-auto mt-8 shadow-lg">
      <CardContent className="space-y-4 overflow-x-hidden max-h-[60vh] overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-start" : "justify-start"
            } items-end  animate-move-up`}
          >
            {message.role === "assistant" && (
              <Avatar>
                <Bot className="h-5 w-5 text-primary" />
              </Avatar>
            )}
            {message.role === "user" && (
              <Avatar className="ml-2 md:mr-0">
                <User className="h-5 w-5 text-primary" />
              </Avatar>
            )}
            <div
              className={`relative py-[8px]  max-w-[90%] rounded-[10px] ${
                message.role === "user"
                  ? "border-primary border  text-primary px-[8px]  rounded-br-none shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
                  : " w-[80%] rounded-[5px]"
              } transition-all duration-300 ease-in-out`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </CardContent>

      {currentStep !== -1 && (
        <CardFooter className="bg-background px-4 py-3">
          <div className="flex flex-col w-full">
            <div className="flex items-center space-x-2 w-full">
              <div className="flex-grow">
                <RenderInputField
                  currentField={formFields[currentStep]}
                  input={input}
                  setInput={(value) => {
                    setInput(value);
                    setValidationError(null); // Clear error when user starts typing
                  }}
                />
                {validationError && (
                  <p className="text-red-500 text-sm mt-1">{validationError}</p>
                )}
              </div>
              {
                <Button
                  onClick={handleSubmit}
                  className="bg-primary hover:bg-primary/90 transition-colors self-end"
                >
                  <FaArrowUp className="h-4 w-4" />

                  <span className="sr-only">Send</span>
                </Button>
              }
            </div>
          </div>
        </CardFooter>
      )}
      <div ref={messagesEndRef} />
    </Card>
  );
}

export default function ChatPreview({
  formFields,
}: {
  formFields: form_json_list;
}) {
  return <Chat formFields={formFields} />;
}
