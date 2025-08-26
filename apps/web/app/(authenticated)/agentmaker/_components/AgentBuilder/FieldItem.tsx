"use client";
import { motion, Reorder } from "framer-motion";

import { FormFieldType } from "@/types/agentmaker";
import { defaultFieldConfig, fieldTypes } from "@/constants/agentIndex";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import If from "@/components/ui/if";

import { LuColumns2, LuPencil, LuTrash2 } from "react-icons/lu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";

export type FormFieldOrGroup = FormFieldType | FormFieldType[];

interface Props {
  index: number;
  subIndex?: number;
  field: FormFieldType;
  formFields: FormFieldOrGroup[];
  setFormFields: React.Dispatch<React.SetStateAction<FormFieldOrGroup[]>>;
  updateFormField: (path: number[], updates: Partial<FormFieldType>) => void;
  openEditDialog: (field: FormFieldType) => void;
}

export const FieldItem = ({
  index,
  subIndex,
  field,
  formFields,
  setFormFields,
  openEditDialog,
}: Props) => {
  const path = subIndex !== undefined ? [index, subIndex] : [index];

  const removeColumn = () => {
    const rowIndex = path[0];
    const subIndex = path.length > 1 ? path[1] : null;

    setFormFields((prevFields) => {
      const newFields = [...prevFields];

      if (Array.isArray(newFields[rowIndex])) {
        const row = [...(newFields[rowIndex] as FormFieldType[])];

        if (subIndex !== null && subIndex >= 0 && subIndex < row.length) {
          row.splice(subIndex, 1);

          if (row.length > 0) {
            newFields[rowIndex] = row;
          } else {
            newFields.splice(rowIndex, 1);
          }
        }
      } else {
        newFields.splice(rowIndex, 1);
      }

      return newFields;
    });
  };

  return (
    <Reorder.Item
      value={field}
      id={field.name}
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.15 },
      }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      whileDrag={{ backgroundColor: "#9ca3af", borderRadius: "12px" }}
      className="w-full"
      key={field.name}
    >
      <motion.div
        layout="position"
        className="flex items-center gap-3"
        key={field.name}
      >
        <div className="flex items-center gap-1 border rounded-md  p-5 py-1.5 w-full">
          <If
            condition={Array.isArray(formFields[index])}
            render={() => <LuColumns2 className="cursor-grab w-4 h-4" />}
          />
          <div className="flex items-center w-full">
            <div className="w-full text-sm">{field.variant}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDialog(field)}
            >
              <LuPencil />
            </Button>
            <Button variant="ghost" size="icon" onClick={removeColumn}>
              <LuTrash2 />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="text-sm h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select Component</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-72 w-48 rounded-md border">
                  {fieldTypes.map((fieldType) => (
                    <DropdownMenuItem
                      key={fieldType.name}
                      onClick={() => {
                        const newFieldName = `name_${Math.random()
                          .toString()
                          .slice(-10)}`;

                        const { label, description, placeholder } =
                          defaultFieldConfig[fieldType.name] || {
                            label: "",
                            description: "",
                            placeholder: "",
                          };

                        const newField: FormFieldType = {
                          checked: true,
                          description: description || "",
                          disabled: false,
                          label: label,
                          name: newFieldName,
                          onChange: () => {},
                          onSelect: () => {},
                          placeholder: placeholder || "Placeholder",
                          required: true,
                          rowIndex: formFields.length, // Add as a new row
                          setValue: () => {},
                          type: "",
                          value: "",
                          variant: fieldType.name,
                          variant_code: newFieldName,
                          validation_message: "",
                        };

                        setFormFields((prevFields) => [
                          ...prevFields,
                          newField,
                        ]); // Append to formFields
                      }}
                    >
                      {fieldType.name}
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    </Reorder.Item>
  );
};
