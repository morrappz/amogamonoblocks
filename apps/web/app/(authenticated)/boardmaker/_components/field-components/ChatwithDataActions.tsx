/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, GripVertical, X, Check, Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { STORY_TEMPLATE } from "@/constants/envConfig";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Session } from "../BoardMaker";
import { SelectGroup } from "@radix-ui/react-select";
import axiosInstance from "@/utils/axiosInstance";
import { getConnections } from "../../lib/actions";

// Define the shape of the data you are working with
interface FormEntry {
  id: number;
  buttonText: string;
  isPrompt: boolean;
  promptText: string;
  promptDataFilter: string;
  apiDataFilter: string;
  // prompt_dataFilter: string;
  isApi: boolean;
  apiEndpoint: string;
  apiField: string;
  dataApi: boolean;
  chat_apiEndpoint: string;
  chat_field_1: string;
  chat_field_2: string;
  component_name: string;
  metricApiEnabled: boolean;
  metricApi: string;
  storyApiEnabled: boolean;
  storyApi: string;
  storyName: string;
  storyCode: string;
  apiResponse: [];
  dataApiResponse: [];
  actionApiEnabled: boolean;
  actionApi: string;
  automationName: string;
  html: string;
  json: string[];
}

interface ValidationErrors {
  buttonText?: string;
  component_name?: string;
  prompt?: string;
  apiEndpoint?: string;
  metricApiValid?: string;
  storyApiValid?: string;
}

const COMPONENT_NAMES = [
  "Data Card Line Chart",
  "Data Card Bar Chart",
  "Data Card Bar Chart Horizontal",
  "Data Card Donut Chart",
];

function SortableItem({
  entry,
  onEdit,
  onDelete,
  onSave,
  setEditedField,
  editedField,
  validApi,
}: {
  entry: FormEntry;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (updatedEntry: FormEntry) => void;
  setEditedField: (field: any) => void;
  editedField: any;
  validApi: any;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(entry);
  const [story_data, setStoryData] = useState<any[]>([]);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  useEffect(() => {
    const fetchStoryData = async () => {
      const response = await axiosInstance.get(STORY_TEMPLATE);
      const filteredData = response.data.filter(
        (item: any) => item.business_number === session?.user?.business_number
      );
      setStoryData(filteredData);
    };
    fetchStoryData();
  }, [editedEntry.storyApiEnabled, session?.user?.business_number]);

  const fetchValidApi = async () => {
    // const requestOptions = {
    //   method: "GET",
    //   headers: {
    //     Authorization: `Bearer ${NEXT_PUBLIC_API_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    // };
    try {
      // const response = await fetch(ADD_CONNECTIONS, requestOptions);
      const response = await getConnections();
      if (!response) {
        toast.error("Failed to fetch data");
      }

      const result = response;
      const validApis = result.filter(
        (item: any) => item?.test_status === "passed"
      );
      return validApis;
    } catch (error) {
      toast.error("Error fetching valid APIs");
      console.log(error);
      return [];
    }
  };

  const handleAddDataApi = async () => {
    const { chat_apiEndpoint, chat_field_1, chat_field_2, apiDataFilter } =
      editedEntry;

    const validApis = await fetchValidApi();
    const isValid = validApis.filter(
      (item: any) => item.api_url === chat_apiEndpoint
    );

    if (isValid.length === 0) {
      toast.error("Invalid API URL");
    }

    if (!isValid || !chat_apiEndpoint || !chat_field_1 || !chat_field_2) {
      toast.error("Something went wrong");
    }
    if (
      isValid &&
      isValid.length > 0 &&
      chat_apiEndpoint &&
      chat_field_1 &&
      chat_field_2
    ) {
      const { key, secret } = isValid && isValid[0];

      try {
        const requestOptions = {
          method: "GET",
          headers: {
            [key]: secret,
            "Content-Type": "application/json",
          },
        };
        const response = await fetch(chat_apiEndpoint, requestOptions);
        if (!response.ok) {
          toast.error("Failed to fetch data");
        }
        const data = await response.json();

        let filterData;
        if (apiDataFilter === "get-all-api-data") {
          filterData = data;
        } else if (apiDataFilter === "get-business-api-data") {
          filterData = data.filter(
            (item: any) => item.customer === session?.user?.business_name
          );
        } else if (apiDataFilter === "get-user-api-data") {
          filterData = data.filter(
            (item: any) => item.user_name === session?.user?.email
          );
        }

        if (filterData) {
          const fieldData = filterData.map((item: any) => ({
            [chat_field_1]: item[chat_field_1],
            [chat_field_2]: item[chat_field_2],
          }));
          setEditedEntry({ ...editedEntry, dataApiResponse: fieldData });
          // setLoading(false);
          toast.success("Options added from API successfully");
        } else {
          toast.error("No valid  values found");
          // setLoading(false);
        }
      } catch (error) {
        toast.error("Failed to fetch data");
        console.log(error);
        // setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    onEdit();
  };

  const handleSave = () => {
    const isValidAPi = validApi.filter(
      (item: any) => item?.api_url === editedEntry?.metricApi
    );
    // const isValidStoryApi = validApi.filter(
    //   (item: any) => item?.api_url === editedEntry?.storyApi
    // );
    if (editedEntry.metricApiEnabled && !(isValidAPi?.length > 0)) {
      toast.error("Invalid API URL");
      return;
    }
    // if (editedEntry.storyApiEnabled && !(isValidStoryApi?.length > 0)) {
    //   toast({ description: "Invalid API URL", variant: "destructive" });
    //   return;
    // }

    setIsEditing(false);
    onSave(editedEntry);
    setEditedField({
      ...editedField,
      chat_with_data: {
        ...editedField.chat_with_data,
        buttons: editedField.chat_with_data.buttons.map((button: any) =>
          button.button_text === entry.buttonText
            ? {
                ...button,
                button_text: editedEntry.buttonText,
                prompt: editedEntry.promptText,
                promptDataFilter: editedEntry.promptDataFilter,
                apiDataFilter: editedEntry.apiDataFilter,
                api_response: editedEntry.apiResponse,
                dataApi_response: editedEntry.dataApiResponse,
                enable_prompt: editedEntry.isPrompt,
                enable_api: editedEntry.isApi,
                component_name: editedEntry?.component_name,
                apiEndpoint: editedEntry.apiEndpoint,
                enable_dataApi: editedEntry.dataApi,
                chat_apiEndpoint: editedEntry.chat_apiEndpoint,
                chat_field_1: editedEntry.chat_field_1,
                chat_field_2: editedEntry.chat_field_2,
                apiField: editedEntry.apiField,
                storyApiEnabled: editedEntry.storyApiEnabled,
                metricApiEnabled: editedEntry.metricApiEnabled,
                metricApi: editedEntry.metricApi,
                storyApi: editedEntry.storyApi,
                storyName: editedEntry.storyName,
                storyCode: editedEntry.storyCode,
                actionApiEnabled: editedEntry.actionApiEnabled,
                actionApi: editedEntry.actionApi,
                automationName: editedEntry.automationName,
                html: editedEntry.html,
                json: editedEntry.json,
              }
            : button
        ),
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEntry(entry);
  };

  const handleAddApi = async () => {
    // setLoading(true);
    const { apiEndpoint, apiField } = editedEntry;

    const validApis = await fetchValidApi();
    const isValid = validApis.filter(
      (item: any) => item.api_url === apiEndpoint
    );

    if (isValid.length === 0) {
      toast.error("Invalid API URL");
    }

    if (!isValid || !apiEndpoint || !apiField) {
      toast.error("Something went wrong");
    }
    if (isValid && isValid.length > 0 && apiEndpoint && apiField) {
      const { key, secret } = isValid && isValid[0];

      try {
        const requestOptions = {
          method: "GET",
          headers: {
            [key]: secret,
            "Content-Type": "application/json",
          },
        };
        const response = await fetch(apiEndpoint, requestOptions);
        if (!response.ok) {
          toast.error("Failed to fetch data");
        }
        const data = await response.json();

        if (data) {
          const fieldData = data.map((item: any) => ({
            [apiField]: item[apiField],
          }));
          setEditedEntry({ ...editedEntry, apiResponse: fieldData });
          // setLoading(false);
          toast.success("Options added from API successfully");
        } else {
          toast.error("No valid  values found");
          // setLoading(false);
        }
      } catch (error) {
        toast.error("Failed to fetch data");
        console.log(error);
        // setLoading(false);
      }
    }
  };

  return (
    <Draggable draggableId={String(entry.id)} index={entry.id}>
      {(provided) => (
        <div
          className="flex items-start space-x-2 p-4 bg-secondary border-b last:border-b-0"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="cursor-grab pt-1">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          {isEditing ? (
            <div className="flex-grow space-y-4">
              <div>
                <Label htmlFor={`button-text-${entry.id}`}>Button text</Label>
                <Input
                  id={`button-text-${entry.id}`}
                  value={editedEntry.buttonText}
                  onChange={(e) =>
                    setEditedEntry({
                      ...editedEntry,
                      buttonText: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter button text"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`is-prompt-${entry.id}`}
                  checked={editedEntry.isPrompt}
                  onCheckedChange={(checked) =>
                    setEditedEntry({
                      ...editedEntry,
                      isPrompt: checked as boolean,
                    })
                  }
                />
                <Label htmlFor={`is-prompt-${entry.id}`}>Is Prompt</Label>
              </div>
              <div>
                <Label htmlFor={`prompt-text-${entry.id}`}>Prompt</Label>
                <Input
                  id={`prompt-text-${entry.id}`}
                  value={editedEntry.promptText}
                  onChange={(e) =>
                    setEditedEntry({
                      ...editedEntry,
                      promptText: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter prompt text"
                />
              </div>
              <div>
                <Label htmlFor="data-filter">Data Filter</Label>
                <Select
                  disabled={!editedEntry.isPrompt}
                  value={editedEntry.promptDataFilter}
                  onValueChange={(value) =>
                    // handleInputChange("promptDataFilter", value)
                    setEditedEntry({
                      ...editedEntry,
                      promptDataFilter: value,
                    })
                  }
                >
                  <SelectTrigger
                    id="data-filter"
                    value={editedEntry.promptDataFilter}
                  >
                    <SelectValue placeholder="Select option to filter data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="get-all">Get All Data</SelectItem>
                      <SelectItem value="get-business-data">
                        Get Business Data
                      </SelectItem>
                      <SelectItem value="get-user-data">
                        Get User Data
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`is-api-${entry.id}`}
                  checked={editedEntry.isApi}
                  onCheckedChange={(checked) =>
                    setEditedEntry({
                      ...editedEntry,
                      isApi: checked as boolean,
                    })
                  }
                />
                <Label htmlFor={`is-api-${entry.id}`}>Is API</Label>
              </div>
              <div>
                <Label htmlFor={`api-endpoint-${entry.id}`}>API endpoint</Label>
                <Input
                  id={`api-endpoint-${entry.id}`}
                  value={editedEntry.apiEndpoint}
                  onChange={(e) =>
                    setEditedEntry({
                      ...editedEntry,
                      apiEndpoint: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter API endpoint"
                />
              </div>
              <div>
                <Label htmlFor={`api-field-${entry.id}`}>API Field</Label>
                <Input
                  id={`api-field-${entry.id}`}
                  value={editedEntry.apiField}
                  onChange={(e) =>
                    setEditedEntry({
                      ...editedEntry,
                      apiField: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter API Field"
                />
              </div>
              <Button
                disabled={!editedEntry.isApi}
                className="mt-1"
                onClick={handleAddApi}
              >
                Add API
              </Button>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`data-api-${entry.id}`}
                  checked={editedEntry.dataApi}
                  onCheckedChange={(checked) =>
                    setEditedEntry({
                      ...editedEntry,
                      dataApi: checked as boolean,
                    })
                  }
                />
                <Label htmlFor={`data-api-${entry.id}`}>Data API</Label>
              </div>
              <div>
                <Label htmlFor={`chat-apiEndpoint-${entry.id}`}>
                  Chart Api Endpoint
                </Label>
                <Input
                  id={`chat-apiEndpoint-${entry.id}`}
                  value={editedEntry.chat_apiEndpoint}
                  onChange={(e) =>
                    setEditedEntry({
                      ...editedEntry,
                      chat_apiEndpoint: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter Chart API"
                />
              </div>

              <div>
                <Label htmlFor={`chat-field-1-${entry.id}`}>
                  Chart Field 1
                </Label>
                <Input
                  id={`chat-field-1-${entry.id}`}
                  value={editedEntry.chat_field_1}
                  onChange={(e) =>
                    setEditedEntry({
                      ...editedEntry,
                      chat_field_1: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter Chat Field 1 (x-axis) (TEXT)"
                />
              </div>
              <div>
                <Label htmlFor={`chat-field-2-${entry.id}`}>
                  Chart Field 2
                </Label>
                <Input
                  id={`chat-field-2-${entry.id}`}
                  value={editedEntry.chat_field_2}
                  onChange={(e) =>
                    setEditedEntry({
                      ...editedEntry,
                      chat_field_2: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter Chat Field 2 (y-axis) (NUMBER)"
                />
              </div>
              <div>
                <Label htmlFor="api-data-filter">API Data Filter</Label>
                <Select
                  disabled={!editedEntry.dataApi}
                  onValueChange={(value) =>
                    setEditedEntry({ ...editedEntry, apiDataFilter: value })
                  }
                  value={editedEntry.apiDataFilter}
                >
                  <SelectTrigger id="api-data-filter">
                    <SelectValue placeholder="Select option to filter data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="get-all-api-data">
                        Get All Data
                      </SelectItem>
                      <SelectItem value="get-business-api-data">
                        Get Business Data
                      </SelectItem>
                      <SelectItem value="get-user-api-data">
                        Get User Data
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <Button
                // disabled={!editedEntry.isDataApi}
                className="mt-1"
                onClick={handleAddDataApi}
              >
                Add API
              </Button>
              <div>
                <Label htmlFor={`component-name-${entry.id}`}>
                  Component Name
                </Label>
                <Select
                  onValueChange={(value) => {
                    setEditedEntry({ ...editedEntry, component_name: value });
                  }}
                  value={editedEntry.component_name}
                >
                  <SelectTrigger id={`component-name-${entry.id}`}>
                    <SelectValue placeholder="Select Component Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPONENT_NAMES?.map((item: string, index: number) => (
                      <SelectItem key={index} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`metrics-api-${entry.id}`}
                  checked={editedEntry.metricApiEnabled}
                  onCheckedChange={(checked) =>
                    setEditedEntry({
                      ...editedEntry,
                      metricApiEnabled: checked as boolean,
                    })
                  }
                />
                <Label htmlFor={`metrics-api-${entry.id}`}>
                  Use Metrics API
                </Label>
              </div>
              <div>
                <Label htmlFor={`metrics-endpoint-${entry.id}`}>
                  Metrics API
                </Label>
                <Input
                  id={`metrics-endpoint-${entry.id}`}
                  value={editedEntry.metricApi}
                  disabled={!editedEntry.metricApiEnabled}
                  onChange={(e) =>
                    setEditedEntry({
                      ...editedEntry,
                      metricApi: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter Metrics API endpoint"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`metrics-api-${entry.id}`}
                  checked={editedEntry.storyApiEnabled}
                  onCheckedChange={(checked) =>
                    setEditedEntry({
                      ...editedEntry,
                      storyApiEnabled: checked as boolean,
                    })
                  }
                />
                <Label htmlFor={`story-api-${entry.id}`}>Use Story API</Label>
              </div>
              <div>
                <Label htmlFor={`story-endpoint-${entry.id}`}>Story API</Label>
                <Input
                  id={`story-endpoint-${entry.id}`}
                  value={editedEntry.storyApi}
                  onChange={(e) =>
                    setEditedEntry({
                      ...editedEntry,
                      storyApi: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter Story API endpoint"
                />
              </div>
              <div>
                <Label htmlFor="story-name">Story Name </Label>
                <Select
                  disabled={!editedEntry.storyApiEnabled}
                  value={editedEntry.storyName}
                  onValueChange={(value) => {
                    const selectedStory: any = story_data.find(
                      (item: any) => item.story_title === value
                    );
                    setEditedEntry({
                      ...editedEntry,
                      storyName: value,
                      storyCode: selectedStory?.ref_template_code || "",
                      json: [
                        JSON.parse(selectedStory?.story_card_json || "[]"),
                        ...editedEntry.json,
                      ],
                    });
                  }}
                >
                  <SelectTrigger id="story-name">
                    <SelectValue placeholder="Select Story Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {story_data?.map((item: any, index: number) => (
                      <SelectItem key={index} value={item.story_title}>
                        {item.story_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`action-api-${entry.id}`}
                  checked={editedEntry.actionApiEnabled}
                  onCheckedChange={(checked) =>
                    setEditedEntry({
                      ...editedEntry,
                      actionApiEnabled: checked as boolean,
                    })
                  }
                />
                <Label htmlFor={`action-api-${entry.id}`}>Use Action API</Label>
              </div>
              <div>
                <Label htmlFor={`action-endpoint-${entry.id}`}>
                  Action API
                </Label>
                <Input
                  id={`action-endpoint-${entry.id}`}
                  value={editedEntry.actionApi}
                  onChange={(e) =>
                    setEditedEntry({
                      ...editedEntry,
                      actionApi: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter Action API endpoint"
                />
              </div>
              <div>
                <Label htmlFor={`automation-name-${entry.id}`}>
                  Automation Name
                </Label>
                <Input
                  id={`automation-name-${entry.id}`}
                  value={editedEntry.automationName}
                  onChange={(e) =>
                    setEditedEntry({
                      ...editedEntry,
                      automationName: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="Enter Automation Name"
                />
              </div>
              <div>
                <Label htmlFor={`html-${entry.id}`}>HTML</Label>
                <Textarea
                  id={`html-${entry.id}`}
                  value={editedEntry.html}
                  onChange={(e) =>
                    setEditedEntry({ ...editedEntry, html: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Enter HTML"
                />
              </div>
              <div>
                <Label htmlFor={`json-${entry.id}`}>JSON</Label>
                <Textarea
                  id="json"
                  value={
                    editedEntry.storyName && story_data.length > 0
                      ? JSON.stringify(
                          story_data.find(
                            (item: any) =>
                              item.story_title === editedEntry.storyName
                          )?.story_card_json || [],
                          null,
                          2
                        )
                      : JSON.stringify(editedEntry.json, null, 2)
                  }
                  onChange={(e) => {
                    try {
                      const parsedData = JSON.parse(e.target.value);
                      setEditedEntry({
                        ...editedEntry,
                        json: Array.isArray(parsedData)
                          ? parsedData
                          : [parsedData],
                      });
                    } catch (error) {
                      console.error("Invalid JSON:", error);
                      // Optionally show error to user via toast/alert
                    }
                  }}
                  className="mt-1"
                  placeholder="Enter JSON"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSave}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-grow">
              <div className="font-medium">
                {entry.buttonText || "Untitled Button"}
              </div>
              {entry.buttonText && (
                <>
                  <div className="text-sm text-gray-500">
                    Is Prompt: {entry.isPrompt ? "Yes" : "No"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Prompt: {entry.promptText || "Not set"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Is API: {entry.isApi ? "Yes" : "No"}
                  </div>
                  <div className="text-sm text-gray-500">
                    API: {entry.apiEndpoint || "Not set"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Component Name: {entry.component_name || "Not set"}
                  </div>
                </>
              )}
              <div className="mt-2 flex justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

function NewEntryForm({
  onSave,
  onCancel,
  setLoading,
  existingButtons,
  validApi,
}: {
  onSave: (entry: FormEntry) => void;
  onCancel: () => void;
  setLoading: (loading: boolean) => void;
  existingButtons: FormEntry[];
  validApi: any;
}) {
  const [newEntry, setNewEntry] = useState<FormEntry>({
    id: Date.now(),
    buttonText: "",
    isPrompt: false,
    promptText: "",
    // prompt_dataFilter: "",
    promptDataFilter: "",
    apiDataFilter: "",
    isApi: false,
    apiEndpoint: "",
    apiResponse: [],
    dataApiResponse: [],
    dataApi: false,
    chat_apiEndpoint: "",
    chat_field_1: "",
    chat_field_2: "",
    metricApiEnabled: false,
    metricApi: "",
    storyApiEnabled: false,
    storyApi: "",
    storyName: "",
    storyCode: "",
    actionApiEnabled: false,
    actionApi: "",
    automationName: "",
    html: "",
    json: [],
    apiField: "",
    component_name: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [story_data, setStoryData] = useState<any[]>([]);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  useEffect(() => {
    const fetchStoryData = async () => {
      const response = await axiosInstance.get(STORY_TEMPLATE);
      const filteredData = response.data.filter(
        (item: any) => item.business_number === session?.user?.business_number
      );
      setStoryData(filteredData);
    };
    fetchStoryData();
  }, [newEntry.storyApiEnabled, session?.user?.business_number]);

  const validateField = (name: string, value: any) => {
    const fieldErrors: ValidationErrors = {};

    switch (name) {
      case "buttonText":
        if (!value) {
          fieldErrors.buttonText = "Button text is required";
          toast.error("Please enter button text");
        } else if (
          existingButtons.some((button) => button.buttonText === value)
        ) {
          fieldErrors.buttonText = "Button text must be unique";
          toast.error("Button text must be unique");
        }
        break;
    }

    return fieldErrors;
  };

  const handleInputChange = (name: string, value: any) => {
    const newEntryData = { ...newEntry, [name]: value };
    setNewEntry(newEntryData);

    // Validate the changed field
    const fieldErrors = validateField(name, value);
    setErrors((prev) => ({ ...prev, ...fieldErrors }));
  };

  const validateForm = () => {
    const isValidAPi = validApi.filter(
      (item: any) => item?.api_url === newEntry?.metricApi
    );
    // const isValidStoryApi = validApi.filter(
    //   (item: any) => item?.api_url === newEntry?.storyApi
    // );

    const formErrors: ValidationErrors = {};

    // Validate button text
    if (!newEntry.buttonText) {
      formErrors.buttonText = "Button text is required";
      toast.error("Please enter button text");
    } else if (
      existingButtons.some(
        (button) => button.buttonText === newEntry.buttonText
      )
    ) {
      formErrors.buttonText = "Button text must be unique";
      toast.error("Button text must be unique");
    }
    if (newEntry.metricApiEnabled && !(isValidAPi.length > 0)) {
      formErrors.metricApiValid = "Invalid metric API";
      toast.error("Invalid metric API");
    }

    // if (newEntry.storyApiEnabled && !(isValidStoryApi.length > 0)) {
    //   formErrors.storyApiValid = "Invalid story API";
    //   toast({
    //     description: "Invalid story API",
    //     variant: "destructive",
    //   });
    // }

    // Validate component name
    // if (!newEntry.component_name) {
    //   formErrors.component_name = "Component name is required";
    //   toast({
    //     description: "Please enter component name",
    //     variant: "destructive",
    //   });
    // }

    // Validate prompt or API
    if (newEntry.isPrompt && !newEntry.promptText) {
      formErrors.prompt = "Prompt text is required";
      toast.error("Please enter prompt text");
    }

    if (newEntry.apiField && !newEntry.apiEndpoint) {
      formErrors.apiEndpoint = "API endpoint is required";
      toast.error("Please enter API endpoint");
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(newEntry);
      setNewEntry({
        id: Date.now(),
        buttonText: "",
        isPrompt: false,
        // prompt_dataFilter: "",
        promptText: "",
        promptDataFilter: "",
        apiDataFilter: "",
        isApi: false,
        apiEndpoint: "",
        apiResponse: [],
        dataApiResponse: [],
        dataApi: false,
        chat_apiEndpoint: "",
        chat_field_1: "",
        chat_field_2: "",
        apiField: "",
        component_name: "",
        metricApiEnabled: false,
        metricApi: "",
        storyApi: "",
        storyName: "",
        storyCode: "",
        storyApiEnabled: false,
        actionApiEnabled: false,
        actionApi: "",
        automationName: "",
        html: "",
        json: [],
      });
      setErrors({});
    }
  };

  const fetchValidApi = async () => {
    // const requestOptions = {
    //   method: "GET",
    //   headers: {
    //     Authorization: `Bearer ${NEXT_PUBLIC_API_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    // };
    try {
      const response = await getConnections();
      if (!response) {
        toast.error("Failed to fetch data");
      }

      const result = response;
      const validApis = result.filter(
        (item: any) => item?.test_status === "passed"
      );
      return validApis;
    } catch (error) {
      toast.error("Error fetching valid APIs");
      console.log(error);
      return [];
    }
  };

  const handleAddApi = async () => {
    setLoading(true);
    const { apiEndpoint, apiField } = newEntry;

    const validApis = await fetchValidApi();
    const isValid = validApis.filter(
      (item: any) => item.api_url === apiEndpoint
    );

    if (isValid.length === 0) {
      toast.error("Invalid API URL");
    }

    if (!isValid || !apiEndpoint || !apiField) {
      toast.error("Something went wrong");
    }
    if (isValid && isValid.length > 0 && apiEndpoint && apiField) {
      const { key, secret } = isValid && isValid[0];

      try {
        const requestOptions = {
          method: "GET",
          headers: {
            [key]: secret,
            "Content-Type": "application/json",
          },
        };
        const response = await fetch(apiEndpoint, requestOptions);
        if (!response.ok) {
          toast.error("Failed to fetch data");
        }
        const data = await response.json();

        if (data) {
          const fieldData = data.map((item: any) => ({
            [apiField]: item[apiField],
          }));
          setNewEntry({ ...newEntry, apiResponse: fieldData });
          setLoading(false);
          toast.success("Options added from API successfully");
        } else {
          toast.error("No valid  values found");
          setLoading(false);
        }
      } catch (error) {
        toast.error("Failed to fetch data");
        console.log(error);
        setLoading(false);
      }
    }
  };

  const handleAddDataApi = async () => {
    setLoading(true);
    const { chat_apiEndpoint, chat_field_1, chat_field_2, apiDataFilter } =
      newEntry;

    const validApis = await fetchValidApi();
    const isValid = validApis.filter(
      (item: any) => item.api_url === chat_apiEndpoint
    );

    if (isValid.length === 0) {
      toast.error("Invalid API URL");
    }

    if (!isValid || !chat_apiEndpoint || !chat_field_1 || !chat_field_2) {
      toast.error("Something went wrong");
    }
    if (
      isValid &&
      isValid.length > 0 &&
      chat_apiEndpoint &&
      chat_field_1 &&
      chat_field_2
    ) {
      const { key, secret } = isValid && isValid[0];

      try {
        const requestOptions = {
          method: "GET",
          headers: {
            [key]: secret,
            "Content-Type": "application/json",
          },
        };
        const response = await fetch(chat_apiEndpoint, requestOptions);
        if (!response.ok) {
          toast.error("Failed to fetch data");
        }
        const data = await response.json();

        let filterData;
        if (apiDataFilter === "get-all-api-data") {
          filterData = data;
        } else if (apiDataFilter === "get-business-api-data") {
          filterData = data.filter(
            (item: any) => item.customer === session?.user?.business_name
          );
        } else if (apiDataFilter === "get-user-api-data") {
          filterData = data.filter(
            (item: any) => item.user_name === session?.user?.email
          );
        }

        if (filterData) {
          const fieldData = filterData.map((item: any) => ({
            [chat_field_1]: item[chat_field_1],
            [chat_field_2]: item[chat_field_2],
          }));
          setNewEntry({ ...newEntry, dataApiResponse: fieldData });
          setLoading(false);
          toast.success("Options added from API successfully");
        } else {
          toast.error("No valid  values found");
          setLoading(false);
        }
      } catch (error) {
        toast.error("Failed to fetch data");
        console.log(error);
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center p-2.5  border-b last:border-b-0">
      <div className="w-5" /> {/* Placeholder for the drag handle */}
      <div className="flex-grow space-y-4">
        <div>
          <Label htmlFor="new-button-text">Button text</Label>
          <Input
            id="new-button-text"
            value={newEntry.buttonText}
            onChange={(e) => handleInputChange("buttonText", e.target.value)}
            className="mt-1"
            placeholder="Enter button text"
          />
          {errors.buttonText && (
            <div className="text-red-500 text-sm mt-1">{errors.buttonText}</div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="new-is-prompt"
            checked={newEntry.isPrompt}
            onCheckedChange={(checked) =>
              setNewEntry({ ...newEntry, isPrompt: checked as boolean })
            }
          />
          <Label htmlFor="new-is-prompt">Is Prompt</Label>
        </div>
        <div>
          <Label htmlFor="new-prompt-text">Prompt</Label>
          <Input
            id="new-prompt-text"
            disabled={!newEntry.isPrompt}
            value={newEntry.promptText}
            onChange={(e) => handleInputChange("promptText", e.target.value)}
            className="mt-1"
            placeholder="Enter prompt text"
          />
          {<div className="text-red-500 text-sm mt-1">{errors.prompt}</div>}
        </div>
        <div>
          <Label htmlFor="data-filter">Data Filter</Label>
          <Select
            disabled={!newEntry.isPrompt}
            onValueChange={(value) =>
              handleInputChange("promptDataFilter", value)
            }
          >
            <SelectTrigger id="data-filter">
              <SelectValue placeholder="Select option to filter data" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="get-all">Get All Data</SelectItem>
                <SelectItem value="get-business-data">
                  Get Business Data
                </SelectItem>
                <SelectItem value="get-user-data">Get User Data</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="new-is-api"
            checked={newEntry.isApi}
            onCheckedChange={(checked) =>
              setNewEntry({ ...newEntry, isApi: checked as boolean })
            }
          />
          <Label htmlFor="new-is-api">Is API</Label>
        </div>
        <div>
          <Label htmlFor="new-api-endpoint">API endpoint</Label>
          <Input
            id="new-api-endpoint"
            disabled={!newEntry.isApi}
            value={newEntry.apiEndpoint}
            onChange={(e) => handleInputChange("apiEndpoint", e.target.value)}
            className="mt-1"
            placeholder="Enter API endpoint"
          />
          {
            <div className="text-red-500 text-sm mt-1">
              {errors.apiEndpoint}
            </div>
          }
          <Label htmlFor="new-api-field">API Field</Label>
          <Input
            id="new-api-field"
            disabled={!newEntry.isApi}
            value={newEntry.apiField}
            onChange={(e) =>
              setNewEntry({ ...newEntry, apiField: e.target.value })
            }
            className="mt-1"
            placeholder="Enter API Field"
          />
          <Button
            disabled={!newEntry.isApi}
            className="mt-1"
            onClick={handleAddApi}
          >
            Add API
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="data-api"
            checked={newEntry.dataApi}
            onCheckedChange={(checked) =>
              setNewEntry({ ...newEntry, dataApi: checked as boolean })
            }
          />
          <Label htmlFor="new-is-api">Data API</Label>
        </div>
        <div>
          <Label htmlFor="chat-field-1">Chart Api Endpoint</Label>
          <Input
            id="chat-field-1"
            disabled={!newEntry.dataApi}
            value={newEntry.chat_apiEndpoint}
            onChange={(e) =>
              handleInputChange("chat_apiEndpoint", e.target.value)
            }
            className="mt-1"
            placeholder="Enter Chat Field 1"
          />
          <Label htmlFor="chat-field-1">Chart Field 1</Label>
          <Input
            id="chat-field-1"
            disabled={!newEntry.dataApi}
            value={newEntry.chat_field_1}
            onChange={(e) => handleInputChange("chat_field_1", e.target.value)}
            className="mt-1"
            placeholder="Enter Chat Field 1 (x-axis) (TEXT)"
          />
          {
            <div className="text-red-500 text-sm mt-1">
              {errors.apiEndpoint}
            </div>
          }
          <Label htmlFor="chat-field-2">Chart Field 2</Label>
          <Input
            id="chat-field-2"
            disabled={!newEntry.dataApi}
            value={newEntry.chat_field_2}
            onChange={(e) =>
              setNewEntry({ ...newEntry, chat_field_2: e.target.value })
            }
            className="mt-1"
            placeholder="Enter Chat Field 2 (y-axis) (NUMBER)"
          />
          <div>
            <Label htmlFor="api-data-filter">API Data Filter</Label>
            <Select
              disabled={!newEntry.dataApi}
              onValueChange={(value) =>
                handleInputChange("apiDataFilter", value)
              }
            >
              <SelectTrigger id="api-data-filter">
                <SelectValue placeholder="Select option to filter data" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="get-all-api-data">Get All Data</SelectItem>
                  <SelectItem value="get-business-api-data">
                    Get Business Data
                  </SelectItem>
                  <SelectItem value="get-user-api-data">
                    Get User Data
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={!newEntry.dataApi}
            className="mt-1"
            onClick={handleAddDataApi}
          >
            Add API
          </Button>
        </div>
        <div>
          <Label htmlFor="component-name">Component Name</Label>
          <Select
            onValueChange={(value) =>
              handleInputChange("component_name", value)
            }
          >
            <SelectTrigger id="component-name">
              <SelectValue placeholder="Select Component Name" />
            </SelectTrigger>
            <SelectContent>
              {COMPONENT_NAMES?.map((item: string, index: number) => (
                <SelectItem key={index} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.component_name && (
            <div className="text-red-500 text-sm mt-1">
              {errors.component_name}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="metrics-api"
            checked={newEntry.metricApiEnabled}
            onCheckedChange={(checked) =>
              setNewEntry({ ...newEntry, metricApiEnabled: checked as boolean })
            }
          />
          <Label htmlFor="metrics-api">Use Metrics API</Label>
        </div>
        <div>
          <Label htmlFor="metrics-endpoint">Metrics API </Label>
          <Input
            id="metrics-endpoint"
            disabled={!newEntry.metricApiEnabled}
            value={newEntry.metricApi}
            onChange={(e) =>
              setNewEntry({ ...newEntry, metricApi: e.target.value })
            }
            className="mt-1"
            placeholder="Enter Metric API endpoint"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="story-api"
            checked={newEntry.storyApiEnabled}
            onCheckedChange={(checked) =>
              setNewEntry({ ...newEntry, storyApiEnabled: checked as boolean })
            }
          />
          <Label htmlFor="story-api">Use Story API</Label>
        </div>
        <div>
          <Label htmlFor="story-endpoint">Story API </Label>
          <Input
            id="story-endpoint"
            disabled={!newEntry.storyApiEnabled}
            value={newEntry.storyApi}
            onChange={(e) =>
              setNewEntry({ ...newEntry, storyApi: e.target.value })
            }
            className="mt-1"
            placeholder="Enter Story API endpoint"
          />
        </div>
        <div>
          <Label htmlFor="story-name">Story Name </Label>
          <Select
            disabled={!newEntry.storyApiEnabled}
            value={newEntry.storyName}
            onValueChange={(value) => {
              const selectedStory = story_data.find(
                (item: any) => item.story_title === value
              );
              setNewEntry({
                ...newEntry,
                storyName: value,
                storyCode: selectedStory?.ref_template_code || "",
                json: [
                  JSON.parse(selectedStory?.story_card_json || "[]"),
                  ...newEntry.json,
                ],
              });
            }}
          >
            <SelectTrigger id="story-name">
              <SelectValue placeholder="Select Story Name" />
            </SelectTrigger>
            <SelectContent>
              {story_data?.map((item: any, index: number) => (
                <SelectItem key={index} value={item.story_title}>
                  {item.story_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="action-api"
            checked={newEntry.actionApiEnabled}
            onCheckedChange={(checked) =>
              setNewEntry({ ...newEntry, actionApiEnabled: checked as boolean })
            }
          />
          <Label htmlFor="action-api">Use Action API</Label>
        </div>
        <div>
          <Label htmlFor="action-endpoint">Action API </Label>
          <Input
            id="action-endpoint"
            disabled={!newEntry.actionApiEnabled}
            value={newEntry.actionApi}
            onChange={(e) =>
              setNewEntry({ ...newEntry, actionApi: e.target.value })
            }
            className="mt-1"
            placeholder="Enter Action API endpoint"
          />
        </div>
        <div>
          <Label htmlFor="automation-name">Automation Name</Label>
          <Input
            id="automation-name"
            value={newEntry.automationName}
            onChange={(e) =>
              setNewEntry({ ...newEntry, automationName: e.target.value })
            }
            className="mt-1"
            placeholder="Enter Automation Name"
          />
        </div>
        <div>
          <Label htmlFor="html">HTML</Label>
          <Textarea
            id="html"
            value={newEntry.html}
            onChange={(e) => setNewEntry({ ...newEntry, html: e.target.value })}
            className="mt-1"
            placeholder="Enter HTML"
          />
        </div>
        <div>
          <Label htmlFor="json">JSON</Label>
          <Textarea
            id="json"
            value={JSON.stringify(newEntry.json, null, 2)}
            onChange={(e) => {
              try {
                const parsedData = JSON.parse(e.target.value);
                setNewEntry({
                  ...newEntry,
                  json: Array.isArray(parsedData) ? parsedData : [parsedData],
                });
              } catch (error) {
                console.error("Invalid JSON:", error);
                // Optionally show error to user via toast/alert
              }
            }}
            className="mt-1"
            placeholder="Enter JSON"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSave}>
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ChatwithDataActions({
  editedField,
  setEditedField,
  setLoading,
  validApi,
}: any) {
  const [entries, setEntries] = useState<FormEntry[]>(() => {
    return (editedField?.chat_with_data?.buttons || []).map(
      (button: any, index: number) => ({
        id: index,
        buttonText: button.button_text || "",
        isPrompt: button.enable_prompt || false,
        promptText: button.prompt || "",
        promptDataFilter: button.promptDataFilter,
        apiDataFilter: button.apiDataFilter,
        isApi: button.enable_api || false,
        dataApi: button.enable_dataApi || false,
        apiEndpoint: button.apiEndpoint || "",
        apiField: button.apiField || "",
        enable_dataApi: button.dataApi || false,
        chat_apiEndpoint: button.chat_apiEndpoint || "",
        chat_field_1: button.chat_field_1 || "",
        chat_field_2: button.chat_field_2 || "",
        component_name: button.component_name || "",
        apiResponse: button.api_response || [],
        dataApiResponse: button.dataApiResponse || [],
        storyApiEnabled: button.storyApiEnabled || false,
        storyApi: button.storyApi || "",
        storyName: button.storyName || "",
        storyCode: button.storyCode || "",
        metricApiEnabled: button.metricApiEnabled || false,
        metricApi: button.metricApi || "",
        actionApiEnabled: button.actionApiEnabled || false,
        actionApi: button.actionApi || "",
        automationName: button.automationName || "",
        html: button.html || "",
        json: button.json || "",
      })
    );
  });
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);

  useEffect(() => {
    if (editedField?.chat_with_data?.buttons) {
      const updatedEntries = editedField.chat_with_data.buttons.map(
        (button: any, index: number) => ({
          id: index,
          buttonText: button.button_text || "",
          isPrompt: button.enable_prompt || false,
          promptText: button.prompt || "",
          promptDataFilter: button.promptDataFilter,
          apiDataFilter: button.apiDataFilter,
          isApi: button.enable_api || false,
          apiEndpoint: button.apiEndpoint || "",
          apiField: button.apiField || "",
          dataApi: button.dataApi || false,
          chat_apiEndpoint: button.chat_apiEndpoint || "",
          chat_field_1: button.chat_field_1 || "",
          chat_field_2: button.chat_field_2 || "",
          component_name: button.component_name || "",
          apiResponse: button.api_response || [],
          dataApiResponse: button.dataApi_response || [],
          storyApiEnabled: button.storyApiEnabled || false,
          storyApi: button.storyApi || "",
          storyName: button.storyName || "",
          storyCode: button.storyCode || "",
          metricApiEnabled: button.metricApiEnabled || false,
          metricApi: button.metricApi || "",
          actionApiEnabled: button.actionApiEnabled || false,
          actionApi: button.actionApi || "",
          automationName: button.automationName || "",
          html: button.html || "",
          json: button.json || "",
        })
      );
      setEntries(updatedEntries);
    }
  }, [editedField?.chat_with_data?.buttons]);

  const handleSave = (newEntry: FormEntry) => {
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    // Update the 'buttons' array with the new button data
    setEditedField({
      ...editedField,
      chat_with_data: {
        ...editedField.chat_with_data,
        buttons: newEntries.map((entry) => ({
          button_text: entry.buttonText,
          prompt: entry.promptText,
          api_response: entry.apiResponse,
          dataApi_response: entry.dataApiResponse,
          enable_prompt: entry.isPrompt,
          promptDataFilter: entry.promptDataFilter,
          apiDataFilter: entry.apiDataFilter,
          enable_api: entry.isApi,
          enable_dataApi: entry.dataApi,
          chat_apiEndpoint: entry.chat_apiEndpoint,
          chat_field_1: entry.chat_field_1,
          chat_field_2: entry.chat_field_2,
          component_name: entry.component_name,
          apiEndpoint: entry.apiEndpoint,
          apiField: entry.apiField,
          storyApiEnabled: entry.storyApiEnabled,
          storyApi: entry.storyApi,
          storyName: entry.storyName,
          storyCode: entry.storyCode,
          metricApiEnabled: entry.metricApiEnabled,
          metricApi: entry.metricApi,
          actionApiEnabled: entry.actionApiEnabled,
          actionApi: entry.actionApi,
          automationName: entry.automationName,
          html: entry.html,
          json: entry.json,
        })),
      },
    });

    setShowNewEntryForm(false);
  };

  const handleDelete = (id: number) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);

    // Update editedField after deletion
    setEditedField({
      ...editedField,
      chat_with_data: {
        ...editedField.chat_with_data,
        buttons: updatedEntries.map((entry) => ({
          button_text: entry.buttonText,
          prompt: entry.promptText,
          promptDataFilter: entry.promptDataFilter,
          apiDataFilter: entry.apiDataFilter,
          api_response: entry.apiResponse,
          dataApi_response: entry.dataApiResponse,
          enable_prompt: entry.isPrompt,
          enable_api: entry.isApi,
          component_name: entry.component_name,
          apiEndpoint: entry.apiEndpoint,
          enable_dataApi: entry.dataApi,
          chat_apiEndpoint: entry.chat_apiEndpoint,
          chat_field_1: entry.chat_field_1,
          chat_field_2: entry.chat_field_2,
          apiField: entry.apiField,
          storyApiEnabled: entry.storyApiEnabled,
          storyApi: entry.storyApi,
          storyName: entry.storyName,
          storyCode: entry.storyCode,
          metricApiEnabled: entry.metricApiEnabled,
          metricApi: entry.metricApi,
          actionApiEnabled: entry.actionApiEnabled,
          actionApi: entry.actionApi,
          automationName: entry.automationName,
          html: entry.html,
          json: entry.json,
        })),
      },
    });
  };

  const handleSaveEdit = (updatedEntry: FormEntry) => {
    setEntries(
      entries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );

    // Update the 'buttons' array with the edited entry data
    setEditedField({
      ...editedField,
      chat_with_data: {
        ...editedField.chat_with_data,
        buttons: editedField.chat_with_data.buttons.map((button: any) =>
          button.button_text === updatedEntry.buttonText
            ? {
                ...button,
                button_text: updatedEntry.buttonText,
                prompt: updatedEntry.promptText,
                promptDataFilter: updatedEntry.promptDataFilter,
                apiDataFilter: updatedEntry.apiDataFilter,
                api_response: updatedEntry.apiResponse,
                dataApi_response: updatedEntry.dataApiResponse,
                enable_prompt: updatedEntry.isPrompt,
                enable_api: updatedEntry.isApi,
                component_name: updatedEntry?.component_name,
                apiEndpoint: updatedEntry.apiEndpoint,
                enable_dataApi: updatedEntry.dataApi,
                chat_apiEndpoint: updatedEntry.chat_apiEndpoint,
                chat_field_1: updatedEntry.chat_field_1,
                chat_field_2: updatedEntry.chat_field_2,
                apiField: updatedEntry.apiField,
                storyApiEnabled: updatedEntry.storyApiEnabled,
                storyApi: updatedEntry.storyApi,
                storyName: updatedEntry.storyName,
                storyCode: updatedEntry.storyCode,
                metricApiEnabled: updatedEntry.metricApiEnabled,
                metricApi: updatedEntry.metricApi,
                actionApiEnabled: updatedEntry.actionApiEnabled,
                actionApi: updatedEntry.actionApi,
                automationName: updatedEntry.automationName,
                html: updatedEntry.html,
                json: updatedEntry.json,
              }
            : button
        ),
      },
    });
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    // If the item is dropped outside a valid destination, do nothing
    if (!destination) return;

    // Reorder the entries
    const reorderedEntries = Array.from(entries);
    const [movedEntry] = reorderedEntries.splice(source.index, 1);
    reorderedEntries.splice(destination.index, 0, movedEntry);

    setEntries(reorderedEntries);
  };

  return (
    <div className="w-full max-w-2xl space-y-8 p-2.5">
      <div className="rounded-xl border shadow-sm overflow-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable" direction="vertical">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2"
              >
                {entries
                  .filter((entry) => entry?.buttonText) // Only show buttons with non-empty buttonText
                  .map((entry) => (
                    <SortableItem
                      key={entry.id}
                      entry={entry}
                      onEdit={() => {}}
                      onDelete={() => handleDelete(entry.id)}
                      onSave={handleSaveEdit}
                      editedField={editedField}
                      setEditedField={setEditedField}
                      validApi={validApi}
                    />
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {showNewEntryForm ? (
          <NewEntryForm
            onSave={handleSave}
            onCancel={() => setShowNewEntryForm(false)}
            setLoading={setLoading}
            existingButtons={entries}
            validApi={validApi}
          />
        ) : (
          <Button
            variant="ghost"
            className="w-full py-2 text-gray-600 hover:text-gray-900"
            onClick={() => setShowNewEntryForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Add New
          </Button>
        )}
      </div>
    </div>
  );
}
