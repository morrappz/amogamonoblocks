/* eslint-disable @typescript-eslint/no-explicit-any */
//remove this
"use client";

import { useState } from "react";
import { Plus, Edit, Check, X, GripVertical } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DataRow {
  id: string;
  button: string;
  prompt: string;
  api: string;
}

export default function ChatwithData({ editedField, setEditedField }: any) {
  const [rows, setRows] = useState<DataRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<DataRow | null>(null);
  const [addingAfterIndex, setAddingAfterIndex] = useState<number | null>(null);
  const [promptEnabled, setPromptEnabled] = useState(true);
  const [newRow, setNewRow] = useState<DataRow>({
    id: "",
    button: "",
    prompt: "",
    api: "",
  });

  const isValidRow = (row: DataRow) => {
    if (!row.button || !row.api) return false;
    if (promptEnabled && !row.prompt) return false;
    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isNewRow: boolean = true
  ) => {
    const { name, value } = e.target;
    if (isNewRow) {
      setNewRow((prev) => ({ ...prev, [name]: value }));
    } else if (editingRow) {
      setEditingRow((prev) => (prev ? { ...prev, [name]: value } : null));
    }
  };

  const handleSaveNewRow = () => {
    if (isValidRow(newRow)) {
      const rowWithId = { ...newRow, id: Date.now().toString() };
      setRows((prevRows) => {
        if (addingAfterIndex !== null) {
          return [
            ...prevRows.slice(0, addingAfterIndex + 1),
            rowWithId,
            ...prevRows.slice(addingAfterIndex + 1),
          ];
        }
        return [...prevRows, rowWithId];
      });
      setNewRow({ id: "", button: "", prompt: "", api: "" });
      setAddingAfterIndex(null);
    }
  };

  const handleCancelNewRow = () => {
    setAddingAfterIndex(null);
    setNewRow({ id: "", button: "", prompt: "", api: "" });
  };

  const handleEditRow = (row: DataRow) => {
    setEditingId(row.id);
    setEditingRow({ ...row });
  };

  const handleSaveEdit = () => {
    if (editingRow && isValidRow(editingRow)) {
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === editingRow.id ? editingRow : row))
      );
      setEditingId(null);
      setEditingRow(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingRow(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newRows = Array.from(rows);
    const [reorderedItem] = newRows.splice(result.source.index, 1);
    newRows.splice(result.destination.index, 0, reorderedItem);
    setRows(newRows);
  };

  const RowForm = ({ className = "" }: { className?: string }) => (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="button">Button text</Label>
            <Input
              id="button"
              name="button"
              value={newRow.button}
              onChange={(e) => {
                const text = e.target.value;
                const updatedButtons = [
                  ...(editedField.chat_with_data.buttons || []).filter(
                    (button: any) => button.button_text.trim() !== "" // Filter out empty button_text
                  ),
                  {
                    button_text: text,
                    prompt: "",
                    api: "",
                    response_data: [],
                    enable_prompt: false,
                  },
                ];

                setEditedField({
                  ...editedField,
                  chat_with_data: {
                    ...editedField.chat_with_data,
                    buttons: updatedButtons,
                  },
                });
                handleInputChange(e, true);
              }}
              placeholder="Enter button text"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enablePrompt"
                checked={promptEnabled}
                onCheckedChange={(checked) =>
                  setPromptEnabled(checked as boolean)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="enablePrompt">Enable prompt</Label>
            </div>
            <Input
              id="prompt"
              name="prompt"
              value={newRow.prompt}
              onChange={(e) => {
                const text = e.target.value;
                const updatedButtons = [
                  ...(editedField.chat_with_data.buttons || []).filter(
                    (button: any) => button.button_text.trim() !== "" // Filter out empty button_text
                  ),
                  {
                    button_text: "",
                    prompt: text,
                    api: "",
                    response_data: [],
                    enable_prompt: false,
                  },
                ];

                setEditedField({
                  ...editedField,
                  chat_with_data: {
                    ...editedField.chat_with_data,
                    buttons: updatedButtons,
                  },
                });
                handleInputChange(e, true);
              }}
              placeholder="Enter prompt"
              disabled={!promptEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api">API endpoint</Label>
            <Input
              id="api"
              name="api"
              value={newRow.api}
              onChange={(e) => {
                const text = e.target.value;
                const updatedButtons = [
                  ...(editedField.chat_with_data.buttons || []).filter(
                    (button: any) => button.button_text.trim() !== "" // Filter out empty button_text
                  ),
                  {
                    button_text: "",
                    prompt: "",
                    api: text,
                    response_data: [],
                    enable_prompt: false,
                  },
                ];

                setEditedField({
                  ...editedField,
                  chat_with_data: {
                    ...editedField.chat_with_data,
                    buttons: updatedButtons,
                  },
                });
                handleInputChange(e, true);
              }}
              placeholder="Enter API endpoint"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={handleSaveNewRow} size="sm">
              <Check className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button onClick={handleCancelNewRow} variant="outline" size="sm">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="space-y-4">
        {rows.length === 0 ? (
          <RowForm />
        ) : (
          <>{addingAfterIndex === -1 && <RowForm className="mt-4" />}</>
        )}

        <div className="mt-6">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="rows">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {rows.map((row, index) => (
                    <div key={row.id}>
                      <Draggable draggableId={row.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-muted p-4 rounded-md mb-2 flex items-center ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <div {...provided.dragHandleProps} className="mr-2">
                              <GripVertical className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="flex-grow">
                              {editingId === row.id && editingRow ? (
                                <div className="space-y-2">
                                  <Input
                                    name="button"
                                    value={editingRow.button}
                                    onChange={(e) =>
                                      handleInputChange(e, false)
                                    }
                                    placeholder="Button text"
                                  />
                                  <Input
                                    name="prompt"
                                    value={editingRow.prompt}
                                    onChange={(e) =>
                                      handleInputChange(e, false)
                                    }
                                    placeholder="Prompt"
                                  />
                                  <Input
                                    name="api"
                                    value={editingRow.api}
                                    onChange={(e) =>
                                      handleInputChange(e, false)
                                    }
                                    placeholder="API endpoint"
                                  />
                                </div>
                              ) : (
                                <>
                                  <p>
                                    <strong>Button:</strong> {row.button}
                                  </p>
                                  <p>
                                    <strong>Prompt:</strong> {row.prompt}
                                  </p>
                                  <p>
                                    <strong>API:</strong> {row.api}
                                  </p>
                                </>
                              )}
                            </div>
                            {editingId === row.id ? (
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleSaveEdit}
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="sr-only">Save changes</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">
                                    Cancel editing
                                  </span>
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditRow(row)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit row</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </Draggable>
                      {addingAfterIndex === index && (
                        <div className="mb-2">
                          <RowForm />
                        </div>
                      )}
                      <div className="flex space-x-2 mb-2">
                        <Button
                          onClick={() => setAddingAfterIndex(index)}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add row below
                        </Button>
                      </div>
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}
