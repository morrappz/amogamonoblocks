/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
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
import { getStoryTemplates, getUsers } from "../../lib/actions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormGroupsJson from "@/data/form_groups.json";
import { UploadAttachment } from "@/lib/minio";

interface FormSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiEndpoint: string;
  setApiEndpoint: (value: string) => void;
  editModeData: any;
  setFormStatus: (value: string) => void;
  setFormInput: (value: string) => void;
  setSuccessMsg: (value: string) => void;
  setRedirectActionUrl: (value: string) => void;
  formInput: string;
  usersSelected: string[];
  contentData: any[];
  setContentData: React.Dispatch<any>;
  setUsersSelected: (value: string[]) => void;
  apiConnectionJson: string;
  setApiConnectionJson: (value: string) => void;
  dbConnectionJson: string;
  setDbConnectionJson: (value: string) => void;
  documentConnectionJson: string;
  setDocumentConnectionJson: (value: string) => void;
  shareUrl: string;
  chatFormUrl: string;
  agentGroup: string;
  setAgentGroup: (value: string) => void;
  storyApiEndpoint: string;
  setStoryEndpoint: (value: string) => void;
  selectedStoryName: string;
  setSelectedStoryName: (value: string) => void;
  profilePicUrl: string;
  setProfilePicUrl: (value: string) => void;
  sharePublicUrl: boolean;
  setSharePublicUrl: (value: boolean) => void;
  editData: any;
}

export function FormSettingsModal({
  isOpen,
  onClose,
  apiEndpoint,
  setApiEndpoint,
  editModeData,
  contentData,
  setContentData,
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
  chatFormUrl,
  agentGroup,
  setAgentGroup,
  storyApiEndpoint,
  setStoryEndpoint,
  selectedStoryName,
  setSelectedStoryName,
  setProfilePicUrl,
  sharePublicUrl,
  setSharePublicUrl,
  editData,
}: FormSettingsModalProps) {
  const [apiUrl, setApiUrl] = useState("");
  // const [contentText, setContent] = useState<any>([]);
  const [formDescription, setFormDescription] = useState("");
  const [formActive, setFormActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [currentTab, setCurrentTab] = useState("settings");
  const [localFormInput, setLocalFormInput] = useState(formInput || ""); // Local state for form input
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [storyTemplates, setStoryTemplates] = useState<unknown>([]);

  const { form_name, status, form_success_url, form_success_message } =
    editModeData;

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
    if (editData?.form_name) {
      setLocalFormInput(editData?.form_name);
    }
  }, [editData]);

  useEffect(() => {
    const fetchStoryTemplates = async () => {
      try {
        const response = await getStoryTemplates();
        setStoryTemplates(response);
      } catch (error) {
        toast.error(`Error fetching story templates ${error}`);
      }
    };
    fetchStoryTemplates();
  }, []);

  useEffect(() => {
    if (editModeData) {
      try {
        // Handle both string and array inputs
        let parsedUsers = usersSelected;

        if (typeof usersSelected === "string") {
          parsedUsers = JSON.parse(usersSelected);
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
  }, [editModeData, usersSelected]);

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
    setApiUrl(apiEndpoint || "");
    // setLocalFormInput(form_name || "");
    // setFormInput(form_name || "");
    setContentData(contentData || "");
    setFormActive(status === "active");
    setSuccessMessage(form_success_message || "");
    setRedirectUrl(form_success_url || "");
  }, [
    apiEndpoint,
    form_name,
    contentData,
    setContentData,
    status,
    form_success_message,
    form_success_url,
    // setFormInput,
  ]);

  // Update local form input when prop changes
  useEffect(() => {
    setLocalFormInput(formInput || "");
  }, [formInput]);

  const handleSettingsSave = () => {
    if (!localFormInput.trim()) {
      toast.error("Form name is required");
      return;
    }

    setFormInput(localFormInput);
    setFormStatus(formActive ? "active" : "inactive");
    toast.success("Form settings saved successfully");
  };

  const handleContentSave = () => {
    if (!contentData) {
      toast.error("Content data is required");
      return;
    }

    // const tempDiv = document.createElement("div");
    // tempDiv.innerHTML = contentText;
    // const formattedContent = tempDiv.innerHTML;

    setContentData(contentData);
    toast.success("Content saved successfully");
  };

  const handleConnectionSave = async () => {
    // if (!apiUrl.trim()) {
    //   toast.error("API endpoint is required");
    //   return;
    // }

    if (apiUrl.length > 0) {
      setApiEndpoint(apiUrl);
      toast.success("API endpoint saved successfully");
    }
    if (dbConnectionJson.length > 0) {
      toast.success("DB Connection saved successfully");
    }
    // else {
    //   toast.error("Invalid API endpoint");
    // }
  };

  const handleActionSave = () => {
    if (!successMessage.trim() || !redirectUrl.trim()) {
      toast.error("Success message and redirect URL are required");
      return;
    }

    setSuccessMsg(successMessage);
    setRedirectActionUrl(redirectUrl);

    toast.success("Form actions saved successfully");
    onClose();
  };

  const handleUsersSave = () => {
    const usersArray = Array.isArray(selectedUsers) ? selectedUsers : [];
    setUsersSelected(usersArray);
    toast.success("Users saved successfully");
    // onClose();
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

  const handleUploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files?.[0];
      const formData = new FormData();
      formData.append("file", file);
      const result = await UploadAttachment({
        file: file,
        fileName: file?.name,
      });
      if (!result.success) {
        toast.error("Error uploading image");
      }
      if (result?.url) {
        setProfilePicUrl(result?.url);
        toast.success("Profile pic uploaded successfully");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-h-[500px] overflow-y-scroll max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Agent Settings
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
                <Label htmlFor="agentGroup">Agent Group</Label>
                <Select
                  value={agentGroup}
                  onValueChange={(value) => setAgentGroup(value)}
                >
                  <SelectTrigger id="agentGroup">
                    <SelectValue placeholder="Select Agent Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {FormGroupsJson.map(
                      (
                        group: { value: string; label: string },
                        index: number
                      ) => (
                        <SelectItem key={index} value={group.label}>
                          {group.value}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="formName">Agent Name</Label>
                <Input
                  value={localFormInput}
                  onChange={(e) => setLocalFormInput(e.target.value)}
                  id="formName"
                  placeholder="Enter Agent name"
                />
              </div>
              <div>
                <Label htmlFor="profilePic">Profile Pic</Label>
                <Input
                  onChange={handleUploadImage}
                  id="profilePic"
                  type="file"
                  accept=".jpg,.png"
                />
              </div>
              <div>
                <Label htmlFor="formDescription">Agent Description</Label>
                <Textarea
                  id="formDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter Agent description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="formActive"
                  checked={formActive}
                  onCheckedChange={setFormActive}
                />
                <Label htmlFor="formActive">Agent Active</Label>
              </div>
              <div className="">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input
                  id="url"
                  placeholder="Url"
                  value={shareUrl}
                  onChange={() => {}}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="shareUrl"
                  checked={sharePublicUrl}
                  onCheckedChange={setSharePublicUrl}
                />
                <Label htmlFor="shareUrl">Share URL</Label>
              </div>
              <div className="">
                <Label htmlFor="chatformUrl" className="text-right">
                  ChatForm URL
                </Label>
                <Input
                  id="chatformUrl"
                  value={chatFormUrl}
                  onChange={() => {}}
                  placeholder="ChatForm Url"
                />
              </div>
              <div className="">
                <Label htmlFor="shortUrl" className="text-right">
                  Short URL
                </Label>
                <Input
                  id="shortUrl"
                  value={shareUrl}
                  onChange={() => {}}
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
              <h3 className="text-lg font-semibold">Form Content</h3>
              <Textarea
                placeholder="Enter content (HTML formatting supported)"
                value={
                  typeof contentData === "string"
                    ? contentData
                    : JSON.stringify(contentData, null, 2)
                }
                onChange={(e) => setContentData(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </TabsContent>
          <TabsContent value="connection">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Connections</h3>
              <div>
                <Label htmlFor="storyName">Select Story</Label>
                <Select
                  value={selectedStoryName}
                  onValueChange={(value) => setSelectedStoryName(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select story" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {storyTemplates.map((story) => (
                        <SelectItem
                          key={story.story_id}
                          value={story.story_title}
                        >
                          {story.story_title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Label htmlFor="storyEndpoint">Story API Endpoint</Label>
                <Input
                  value={storyApiEndpoint}
                  onChange={(e) => setStoryEndpoint(e.target.value)}
                  id="storyEndpoint"
                  placeholder="Enter Story API Endpoint"
                />
                <Label htmlFor="apiEndpoint">Data API Endpoint</Label>
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  id="apiEndpoint"
                  placeholder="Add API Endpoint"
                />
                <Label htmlFor="apiConnectionJson">API Connection Token</Label>
                <Input
                  id="apiConnectionJson"
                  placeholder="Enter
                  API Connection Token"
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
              <h3 className="text-lg font-semibold">Form Actions</h3>
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
