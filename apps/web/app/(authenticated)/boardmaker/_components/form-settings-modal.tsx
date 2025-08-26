/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { getUsers } from "../lib/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticAssistant } from "../types/types";

interface FormSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiEndpoint: string;
  setApiEndpoint: (value: string) => void;
  contentData: string;
  setContentData: (value: string) => void;
  editModeData: any;
  setFormStatus: (value: string) => void;
  setFormInput: (value: string) => void;
  setSuccessMsg: (value: string) => void;
  setRedirectActionUrl: (value: string) => void;
  formInput: string;
  usersSelected: any;
  setUsersSelected: (value: string[]) => void;
  apiConnectionJson: string;
  setApiConnectionJson: (value: string) => void;
  dbConnectionJson: string;
  setDbConnectionJson: (value: string) => void;
  documentConnectionJson: string;
  setDocumentConnectionJson: (value: string) => void;
  shareUrl: string;
  analyticAssistants: AnalyticAssistant;
  boardFields: {
    board_agent_code: string;
    board_agent_uuid: string;
    board_agent_name: string;
  };
  setBoardFields: (value: {
    board_agent_code: string;
    board_agent_uuid: string;
    board_agent_name: string;
  }) => void;
}

export function FormSettingsModal({
  isOpen,
  onClose,
  setApiEndpoint,
  contentData,
  setContentData,
  editModeData,
  setFormStatus,
  setFormInput,
  setSuccessMsg,
  setRedirectActionUrl,
  formInput,
  usersSelected,
  setUsersSelected,
  apiConnectionJson,
  setApiConnectionJson,
  dbConnectionJson,
  setDbConnectionJson,
  documentConnectionJson,
  setDocumentConnectionJson,
  shareUrl,
  analyticAssistants,
  boardFields,
  setBoardFields,
}: FormSettingsModalProps) {
  const [apiUrl, setApiUrl] = useState("");
  const [contentText, setContent] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formActive, setFormActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [currentTab, setCurrentTab] = useState("settings");
  const [localFormInput, setLocalFormInput] = useState(formInput || ""); // Local state for form input
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const {
    content,
    data_api_url,
    form_name,
    status,
    form_success_url,
    form_success_message,
  } = editModeData;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (editModeData) {
      try {
        // Handle both string and array inputs
        const parsedUsers =
          typeof usersSelected === "string"
            ? JSON.parse(usersSelected)
            : usersSelected;
        if (contentData) {
          setContent(contentData);
        }

        // Ensure we have an array
        if (Array.isArray(parsedUsers)) {
          setSelectedUsers(parsedUsers);
        } else {
          console.error("Invalid usersSelected format");
          setSelectedUsers([]);
        }
      } catch (error) {
        console.error("Error parsing usersSelected:", error);
        setSelectedUsers([]);
      }
    }
  }, [editModeData, usersSelected, contentData]);

  // Update form status when active state changes
  useEffect(() => {
    if (formActive) {
      setFormStatus("active");
    } else {
      setFormStatus("inactive");
    }
  }, [formActive, setFormStatus]);

  // Initialize all form values when editModeData changes
  useEffect(() => {
    setApiUrl(data_api_url || "");
    setLocalFormInput(form_name || "");
    setFormInput(form_name || "");
    setContent(content || "");
    setFormActive(status === "active");
    setSuccessMessage(form_success_message || "");
    setRedirectUrl(form_success_url || "");
  }, [
    data_api_url,
    form_name,
    content,
    status,
    form_success_message,
    form_success_url,
    setFormInput,
  ]);

  // Update local form input when prop changes
  useEffect(() => {
    setLocalFormInput(formInput || "");
  }, [formInput]);

  const handleSettingsSave = () => {
    if (!localFormInput.trim()) {
      toast.error("Board name is required");
      return;
    }

    setFormInput(localFormInput);
    setFormStatus(formActive ? "active" : "inactive");
    toast.success("Board settings saved successfully");
  };

  const handleContentSave = () => {
    if (!contentText.trim()) {
      toast.error("Content data is required");
      return;
    }

    const formattedContent = contentText;

    setContentData(formattedContent);
    toast.success("Content saved successfully");
    onClose();
  };

  const handleConnectionSave = async () => {
    if (!apiUrl.trim()) {
      toast.error("API endpoint is required");
      return;
    }

    if (apiUrl.length > 0) {
      setApiEndpoint(apiUrl);
      toast.success("API endpoint saved successfully");
    } else {
      toast.error("Invalid API endpoint");
    }
  };

  const handleActionSave = () => {
    if (!successMessage.trim() || !redirectUrl.trim()) {
      toast.error("Success message and redirect URL are required");
      return;
    }

    setSuccessMsg(successMessage);
    setRedirectActionUrl(redirectUrl);

    toast.success("Board actions saved successfully");
    onClose();
  };

  const handleUsersSave = () => {
    setUsersSelected(selectedUsers);
    toast.success("Users saved successfully");
    onClose();
  };

  const handleSelectAssistant = (value: string) => {
    const selectedAssistant = analyticAssistants.find(
      (assistant) => assistant?.form_name === value
    );
    if (selectedAssistant) {
      setBoardFields({
        board_agent_code: selectedAssistant?.form_code || "",
        board_agent_uuid: selectedAssistant?.form_uuid || "",
        board_agent_name: value,
      });
    }
  };

  const renderSaveButton = () => {
    const saveHandlers = {
      settings: handleSettingsSave,
      users: handleUsersSave,
      content: handleContentSave,
      connection: handleConnectionSave,
      action: handleActionSave,
    };

    return (
      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={saveHandlers[currentTab as keyof typeof saveHandlers]}>
          Save {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
        </Button>
      </div>
    );
  };

  const handleSelectChange = (values: string[]) => {
    setSelectedUsers(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-h-[500px] overflow-y-scroll max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Board Settings
            {/* <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button> */}
          </DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="settings"
          className="w-full"
          onValueChange={(value) => setCurrentTab(value)}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="action">Action</TabsTrigger>
          </TabsList>
          <TabsContent value="settings">
            <div className="space-y-4">
              <div>
                <Label htmlFor="formName">Board Name</Label>
                <Input
                  value={localFormInput}
                  onChange={(e) => setLocalFormInput(e.target.value)}
                  id="formName"
                  placeholder="Enter Board name"
                />
              </div>
              <div>
                <Label htmlFor="formDescription">Board Description</Label>
                <Textarea
                  id="formDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter Board description"
                />
              </div>
              <div>
                <Label htmlFor="analytic-assistant">Analytic Assistant</Label>
                <Select
                  value={boardFields?.board_agent_name}
                  onValueChange={(value) => {
                    handleSelectAssistant(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Analytic Assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {analyticAssistants?.map((assistant) => (
                      <SelectItem
                        key={assistant?.form_id}
                        value={assistant?.form_name}
                      >
                        {assistant?.form_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="formActive"
                  checked={formActive}
                  onCheckedChange={setFormActive}
                />
                <Label htmlFor="formActive">Board Active</Label>
              </div>
              <div className="">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input
                  id="url"
                  placeholder="Url"
                  value={shareUrl}
                  onChange={(e) => console.log(e.target.value)}
                />
              </div>
              <div className="">
                <Label htmlFor="shortUrl" className="text-right">
                  Short URL
                </Label>
                <Input
                  id="shortUrl"
                  value={shareUrl}
                  onChange={(e) => console.log(e.target.value)}
                  placeholder="Short Url"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="users">
            <MultiSelector
              values={selectedUsers}
              onValuesChange={(values: string[]) => handleSelectChange(values)}
            >
              <MultiSelectorTrigger>
                <MultiSelectorInput placeholder="Select Users" />
              </MultiSelectorTrigger>
              <MultiSelectorContent>
                <MultiSelectorList>
                  {users.map((item: any) => (
                    <MultiSelectorItem
                      key={item.user_catalog_id}
                      value={item.user_email}
                    >
                      {item.user_email}
                    </MultiSelectorItem>
                  ))}
                </MultiSelectorList>
              </MultiSelectorContent>
            </MultiSelector>
          </TabsContent>
          <TabsContent value="content">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Board Content</h3>
              <Textarea
                placeholder="Enter JSON here"
                value={contentText}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </TabsContent>
          <TabsContent value="connection">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Connections</h3>
              <div>
                <Label htmlFor="apiEndpoint">API Endpoint</Label>
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  id="apiEndpoint"
                  placeholder="Add API Endpoint"
                />
                <Label htmlFor="apiConnectionJson">API Connection JSON</Label>
                <Textarea
                  id="apiConnectionJson"
                  placeholder="Enter
                  API Connection JSON"
                  className="min-h-[150px]"
                  value={apiConnectionJson}
                  onChange={(e) => setApiConnectionJson(e.target.value)}
                />
                <Label htmlFor="dbConnectionJson">
                  Database Connection JSON
                </Label>
                <Textarea
                  id="dbConnectionJson"
                  placeholder="Enter
                  Database Connection JSON"
                  className="min-h-[150px]"
                  value={dbConnectionJson}
                  onChange={(e) => setDbConnectionJson(e.target.value)}
                />
                <Label htmlFor="documentConnectionJson">
                  Document Connection JSON
                </Label>
                <Textarea
                  id="documentConnectionJson"
                  placeholder="Enter
                  Document Connection JSON"
                  className="min-h-[150px]"
                  value={documentConnectionJson}
                  onChange={(e) => setDocumentConnectionJson(e.target.value)}
                />
              </div>
            </div>
            {/* <ConnectionsNew /> */}
          </TabsContent>
          <TabsContent value="action">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Board Actions</h3>
              <div>
                <Label htmlFor="successMessage">Success Message</Label>
                <Input
                  id="successMessage"
                  value={successMessage}
                  onChange={(e) => setSuccessMessage(e.target.value)}
                  placeholder="Thank you for your submission!"
                />
              </div>
              <div>
                <Label htmlFor="redirectUrl">Redirect URL</Label>
                <Input
                  id="redirectUrl"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://example.com/thank-you"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {renderSaveButton()}
      </DialogContent>
    </Dialog>
  );
}
