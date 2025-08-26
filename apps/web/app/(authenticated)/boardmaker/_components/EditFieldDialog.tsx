/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, ChangeEvent } from "react";
import * as Locales from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormFieldType } from "@/types/agentmaker";
import If from "@/components/ui/if";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Import Select components
import {
  CheckSquare,
  Dock,
  File,
  Heart,
  Link,
  MessageCircle,
  Share2,
  Star,
  Table,
  UploadIcon,
  X,
  XIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ADD_CONNECTIONS, NEXT_PUBLIC_API_KEY } from "@/constants/envConfig";
import Image from "next/image";
import { FaFilePdf } from "react-icons/fa";
import { Textarea } from "@/components/ui/textarea";
import ChatwithDataActions from "./field-components/ChatwithDataActions";

type EditFieldDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  field: any;
  onSave: (updatedField: FormFieldType) => void;
  existingField: string[];
  setApiFieldData: any;
};

export const EditFieldDialog: React.FC<EditFieldDialogProps> = ({
  isOpen,
  onClose,
  field,
  onSave,
  existingField,
  setApiFieldData,
}) => {
  const [editedField, setEditedField] = useState<any>(null);
  const [fieldType, setFieldType] = useState<string>();
  const [newOption, setNewOption] = useState("");
  const [comboboxOptions, setComboboxOptions] = useState("");
  const [multiSelect, setMultiSelect] = useState("");
  const [radioGroup, setRadioGroup] = useState("");
  const [error, setError] = useState(false);
  const [useAPI, setUseAPI] = useState(false);
  const [apiURL, setAPIURL] = useState("");
  const [apiField, setApiField] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [pdfPreviews, setPdfPreviews] = useState<string[]>([]);
  const [mediaCardPreviews, setMediaCardPreviews] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaCardUrl, setMediaCardUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isPlaceholderChecked, setIsPlaceholderChecked] = useState(false);
  const [isUrlChecked, setIsUrlChecked] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [validApi, setValidApi] = useState([]);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 2 * 1024 * 1024;

  const CONTENT_TYPES = [
    "Image",
    "Video",
    "File",
    "Pdf",
    "Page URL",
    "Carousel",
    "Data card",
    "Chart card",
  ];
  const COMPONENT_NAMES = [
    "Data Card Text",
    "Data Card Line Chart",
    "Data Card Bar Chart",
    "Data Card Bar Chart Horizontal",
    "Data Card Donut Chart",
  ];

  useEffect(() => {
    setEditedField(field);
  }, [field]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploading(true);
      const newImages = Array.from(e.target.files);
      const validImages = newImages.filter(
        (file) => file.size <= MAX_FILE_SIZE
      );

      if (validImages.length !== newImages.length) {
        setUploadError(
          "Some files were not added. Please ensure all files are images (JPG, PNG, or GIF) and under 5MB."
        );
      } else {
        setUploadError("");
      }

      const newPreviews = validImages.map((file) => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
      const formData = new FormData();
      validImages.forEach((file) => {
        formData.append("file", file);
      });

      try {
        const response = await fetch("/api/agent-maker/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        setEditedField({ ...editedField, placeholder_file_url: data.url });
        setUploading(false);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload file. Please try again.");
        setUploading(false);
      }
    }
  };

  const handleImageSubmit = async (e: any) => {
    setUploading(true);
    e.preventDefault();
    setUploadError("");
    if (!imageUrl) {
      setUploadError("Please enter a valid video url");
      return;
    }
    const validImageUrlPattern =
      /^(https?:\/\/.*\.(jpg|jpeg|png|gif|webp|tif|svg))$/i;
    if (!validImageUrlPattern.test(imageUrl)) {
      setUploadError("Invalid Image URL. Please provide a valid Image Link.");
      return;
    }
    setImagePreviews((prevVideos) => [...prevVideos, imageUrl]);
    const payload = {
      url: imageUrl,
    };

    try {
      const response = await fetch("/api/agent-maker/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (data.url) {
        setEditedField({ ...editedField, placeholder_file_url: data.url });
        setUploading(false);
      }
      setImagePreviews((prevVideos) => [...prevVideos, imageUrl]);
      // setValue(validImages);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload video URL. Please try again.");
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const getFileIcon = (fileName: any) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FaFilePdf className="w-8 h-8 text-red-500" />;
      case "doc":
      case "docx":
        return <Dock className="w-8 h-8 text-blue-500" />;
      case "xls":
      case "xlsx":
      case "csv":
        return <Table className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploading(true);
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter((file) => file.size <= MAX_FILE_SIZE);
      setFileName(newFiles[0].name);

      if (validFiles.length !== newFiles.length) {
        setUploadError(
          "Some files were not added. Please ensure all files are  under 5MB."
        );
      } else {
        setUploadError("");
      }

      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setFilePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append("file", file);
      });

      try {
        const response = await fetch("/api/agent-maker/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        setEditedField({
          ...editedField,
          placeholder_file_upload_url: data.url,
        });
        setUploading(false);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload file. Please try again.");
        setUploading(false);
      }
    }
  };

  const handleFileSubmit = async (e: any) => {
    setUploading(true);
    e.preventDefault();
    setUploadError("");
    if (!fileUrl) {
      setUploadError("Please enter a valid File url");
      return;
    }
    const validFileUrlPattern =
      /^(https?:\/\/.*\.(doc|docx|xls|xlsx|csv|ppt|pptx|txt))$|^(https?:\/\/docs\.google\.com\/(document|spreadsheets)\/d\/[a-zA-Z0-9-_]+)/i;

    if (!validFileUrlPattern.test(fileUrl)) {
      setUploadError("Invalid File URL. Please provide a valid File Link.");
      return;
    }
    setFilePreviews((prevVideos) => [...prevVideos, fileUrl]);
    const payload = {
      url: fileUrl,
    };

    try {
      const response = await fetch("/api/agent-maker/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (data.url) {
        setEditedField({
          ...editedField,
          placeholder_file_upload_url: data.url,
        });
        setUploading(false);
      }
      setFilePreviews((prevVideos) => [...prevVideos, fileUrl]);
      // setValue(validImages);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload video URL. Please try again.");
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFilePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const handlePdfUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploading(true);
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter((file) => file.size <= MAX_FILE_SIZE);
      setPdfName(newFiles[0].name);

      if (validFiles.length !== newFiles.length) {
        setUploadError(
          "Some files were not added. Please ensure all files are  under 5MB."
        );
      } else {
        setUploadError("");
      }

      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setPdfPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append("file", file);
      });

      try {
        const response = await fetch("/api/agent-maker/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        setEditedField({ ...editedField, placeholder_pdf_file_url: data.url });
        setUploading(false);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload file. Please try again.");
        setUploading(false);
      }
    }
  };

  const handlePdfSubmit = async (e: any) => {
    setUploading(true);
    e.preventDefault();
    setUploadError("");

    if (!pdfUrl) {
      setUploadError("Please enter a valid Pdf file url");
      return;
    }
    const validFileUrlPattern = /^(https?:\/\/.*\.(pdf))$/i;

    if (!validFileUrlPattern.test(pdfUrl)) {
      setUploadError("Invalid File URL. Please provide a valid File Link.");
      return;
    }
    setPdfName(pdfUrl);
    setPdfPreviews((prevVideos) => [...prevVideos, pdfUrl]);
    const payload = {
      url: pdfUrl,
    };

    try {
      const response = await fetch("/api/agent-maker/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (data.url) {
        setEditedField({ ...editedField, placeholder_pdf_file_url: data.url });

        setUploading(false);
      }
      setPdfPreviews((prevVideos) => [...prevVideos, pdfUrl]);
      // setValue(validImages);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload video URL. Please try again.");
      setUploading(false);
    }
  };

  const removePdf = (index: number) => {
    setPdfPreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploading(true);
      const newVideo = Array.from(e.target.files);
      const validVideo = newVideo.filter(
        (video) => video.size <= MAX_VIDEO_SIZE
      );
      if (validVideo.length !== newVideo.length) {
        setVideoUrl("");
      }
      const newPreview = validVideo.map((video) => URL.createObjectURL(video));
      setVideoPreviews((prevPreviews) => [...prevPreviews, ...newPreview]);

      const formData = new FormData();
      validVideo.forEach((file) => {
        formData.append("file", file);
      });

      try {
        const response = await fetch("/api/agent-maker/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        if (data.url) {
          setEditedField({ ...editedField, placeholder_video_url: data.url });
          setUploading(false);
        }
        setVideoUrl("");
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload file. Please try again.");
        setUploading(false);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleVideoSubmit = async (e: any) => {
    setUploading(true);
    e.preventDefault();
    setUploadError("");
    if (!videoUrl) {
      setUploadError("Please enter a valid video url");
      return;
    }
    const validUrlPattern =
      /^(https?:\/\/.*\.(mp4|mov|avi|mkv|webm))|(https?:\/\/(www\.)?youtube\.com\/watch\?v=\w+)|(https?:\/\/youtu\.be\/\w+)/;

    if (!validUrlPattern.test(videoUrl)) {
      setUploadError("Invalid Video URL. Please provide a valid Video Link.");
      return;
    }
    setVideoPreviews((prevVideos) => [...prevVideos, videoUrl]);
    const payload = {
      url: videoUrl,
    };

    try {
      const response = await fetch("/api/agent-maker/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (data.url) {
        setEditedField({ ...editedField, placeholder_video_url: data.url });
        setUploading(false);
      }
      setVideoPreviews((prevVideos) => [...prevVideos, videoUrl]);
      // setValue(validImages);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload video URL. Please try again.");
      setUploading(false);
    }
  };

  const removeVideo = (index: number) => {
    setVideoPreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const handleMediaUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploading(true);
      const newMedia = Array.from(e.target.files);
      const validMedia = newMedia.filter((file) => file.size <= MAX_FILE_SIZE);

      if (validMedia.length !== newMedia.length) {
        setUploadError(
          "Some files were not added. Please ensure all files are images (JPG, PNG, or GIF) and under 5MB."
        );
      } else {
        setUploadError("");
      }

      const newPreviews = validMedia.map((file) => URL.createObjectURL(file));
      setMediaCardPreviews(e.target.files[0]?.name);
      const formData = new FormData();
      validMedia.forEach((file) => {
        formData.append("file", file);
      });

      try {
        const response = await fetch("/api/agent-maker/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        setEditedField({
          ...editedField,
          media_card_data: {
            ...editedField.media_card_data,
            media_url: data.url,
          },
        });
        setUploading(false);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload file. Please try again.");
        setUploading(false);
      }
    }
  };

  const handleMediaSubmit = async (e: any) => {
    setUploading(true);
    e.preventDefault();
    setUploadError("");
    if (!mediaCardUrl) {
      setUploadError("Please enter a valid video url");
      return;
    }

    setMediaCardPreviews(mediaCardUrl);
    const payload = {
      url: mediaCardUrl,
    };

    try {
      const response = await fetch("/api/agent-maker/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (data.url) {
        setEditedField({
          ...editedField,
          media_card_data: {
            ...editedField.media_card_data,
            media_url: data.url,
          },
        });
        setUploading(false);
      }
      setMediaCardPreviews(mediaCardUrl);
      // setValue(validImages);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload video URL. Please try again.");
      setUploading(false);
    }
  };

  const removeMedia = () => {
    setMediaCardPreviews("");
  };

  useEffect(() => {
    const getValidApis = async () => {
      const apis = await fetchValidApi();
      setValidApi(apis);
    };

    getValidApis();
  }, []);

  const fetchValidApi = async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${NEXT_PUBLIC_API_KEY}`,
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await fetch(ADD_CONNECTIONS, requestOptions);
      if (!response.ok) {
        toast.error("Failed to fetch data");
      }

      const result = await response.json();
      const validApis = result.filter(
        (item: any) => item?.test_status === "passed"
      );
      return validApis;
    } catch (error) {
      toast.error("Error fetching valid APIs");
      return [];
    }
  };

  const handleAddApiData = async () => {
    setUploading(true);
    const validApis = await fetchValidApi();
    const isValid = validApis.filter((item: any) => item.api_url === apiURL);

    if (isValid.length === 0) {
      toast.error("Invalid API URL");
    }

    if (!isValid || !apiURL || !apiField) {
      toast.error("Something went wrong");
    }
    if (isValid && isValid.length > 0 && apiURL && apiField) {
      const { key, secret } = isValid && isValid[0];

      try {
        const requestOptions = {
          method: "GET",
          headers: {
            [key]: secret,
            "Content-Type": "application/json",
          },
        };
        const response = await fetch(apiURL, requestOptions);
        if (!response.ok) {
          toast.error("Failed to fetch data");
        }
        const data = await response.json();
        setUploading(false);
        if (editedField?.variant === "Radio Group") {
          const firstNameValues = data.map((item: any) => item[apiField]);
          setApiFieldData(firstNameValues);
        }
        if (editedField?.variant === "Send Image") {
          setEditedField({
            ...editedField,
            placeholder_file_url: data.map((item: any) => item[apiField])[0],
          });
        } else if (editedField?.variant === "Send Video") {
          setEditedField({
            ...editedField,
            placeholder_video_url: data.map((item: any) => item[apiField])[0],
          });
        } else if (editedField?.variant === "Send File") {
          setEditedField({
            ...editedField,
            placeholder_file_upload_url: data.map(
              (item: any) => item[apiField]
            )[0],
          });
        } else if (editedField?.variant === "Send Pdf") {
          setEditedField({
            ...editedField,
            placeholder_pdf_file_url: data.map(
              (item: any) => item[apiField]
            )[0],
          });
        } else if (
          editedField?.variant === "Send Media Card" ||
          editedField?.variant === "Analytic Card"
        ) {
          setEditedField({
            ...editedField,
            media_card_data: {
              ...editedField.media_card_data,
              media_url: data.map((item: any) => item[apiField])[0] || "",
              custom_html: data.map((item: any) => item.html_content)[0],
              card_type:
                selectedValue === "Data card"
                  ? "Data card"
                  : selectedValue === "Chart card"
                  ? "Chart card"
                  : data.map((item: any) => item.card_type)[0],
              card_json: data.map((item: any) => item.custom_json_one)[0],
            },
          });
        }

        if (data) {
          toast.success("Options added from API successfully");
        } else {
          toast.error("No valid  values found");
          setUploading(false);
        }
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    }
  };

  const handleSave = async () => {
    if (editedField) {
      const isDuplicate =
        existingField.includes(editedField.name) &&
        editedField.name !== field?.name;

      if (isDuplicate) {
        toast.error("Name already exists");
        const error = document.getElementById("error_msg");
        if (error) error.textContent = "Name already exists";
        setError(true);
        return;
      }
      if (useAPI) {
        if (useAPI) {
          if (!apiURL) {
            toast.error("API URL is required");
            const error: any = document.getElementById("api_url_error_msg");
            error.textContent = "URL cannot be empty";
            setError(true);
            return;
          }
          if (!apiField) {
            toast.error("API URL Field required");
            const error: any = document.getElementById("api_field_error_msg");
            error.textContent = "Api cannot be empty";
            setError(true);
            return;
          }
        }
      }
      if (editedField.name === "") {
        toast.error("Name cannot be empty");
        const error: any = document.getElementById("error_msg");
        error.textContent = "Name cannot be empty";
        setError(true);
        return;
      }
      onSave(editedField);
      onClose();
    }
  };

  const handleRemoveItem = (index: number | string) => {
    if (editedField) {
      setEditedField({
        ...editedField,
        options: editedField?.options?.filter(
          (_: any, i: string | number) => i !== index
        ),
      });
    }
  };

  if (!editedField) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Field ID: {editedField.name} </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="settings">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          <TabsContent value="settings">
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="label">Name *</Label>
                <Input
                  id="name"
                  type={field?.type}
                  required
                  className={`${error && "border"}`}
                  value={editedField.name}
                  onChange={(e) =>
                    setEditedField({ ...editedField, name: e.target.value })
                  }
                />
              </div>
              <span className="text-red-500 text-sm" id="error_msg"></span>
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={editedField.label}
                  onChange={(e) =>
                    setEditedField({ ...editedField, label: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="label">Variant Code</Label>
                <Input
                  id="variant_code"
                  // type={field?.type}
                  value={editedField.variant_code}
                  onChange={(e) =>
                    setEditedField({
                      ...editedField,
                      variant_code: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="label">Validation Message</Label>
                <Input
                  id="validation_message"
                  // type={field?.type}
                  value={editedField.validation_message}
                  onChange={(e) =>
                    setEditedField({
                      ...editedField,
                      validation_message: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="label">Description</Label>
                <Input
                  id="description"
                  value={editedField.description}
                  onChange={(e) =>
                    setEditedField({
                      ...editedField,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="placeholder">Placeholder</Label>
                <Input
                  id="placeholder"
                  value={editedField.placeholder}
                  onChange={(e) =>
                    setEditedField({
                      ...editedField,
                      placeholder: e.target.value,
                    })
                  }
                />
              </div>
              <If
                condition={
                  field?.variant !== "Send Video" &&
                  field?.variant !== "Send File" &&
                  field?.variant !== "Send Pdf"
                }
                render={() => (
                  <div>
                    <div>
                      <Label htmlFor="file-upload">
                        <div className="flex items-center gap-2.5 my-2">
                          <Checkbox
                            checked={editedField.use_settings_upload}
                            onCheckedChange={() =>
                              setEditedField({
                                ...editedField,
                                use_settings_upload:
                                  !editedField.use_settings_upload,
                              })
                            }
                          />{" "}
                          Use upload placeholder
                        </div>
                      </Label>

                      <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="file-upload"
                            className={`relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg ${
                              !editedField.use_settings_upload
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            } bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden`}
                          >
                            {imagePreviews.length > 0 ? (
                              <>
                                <Image
                                  src={imagePreviews[0]}
                                  alt="Preview"
                                  layout="fill"
                                  className=""
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeImage(0);
                                  }}
                                  className="absolute top-2 right-2 z-10"
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <div
                                className={`flex ${
                                  !editedField.use_settings_upload &&
                                  "bg-gray-100 cursor-not-allowed"
                                } flex-col items-center justify-center pt-5 pb-6`}
                              >
                                <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                                <p className="mb-2 text-sm text-primary">
                                  {editedField.media_card_data?.media_url ? (
                                    <span className="font-semibold">
                                      {editedField.placeholder_file_url}
                                    </span>
                                  ) : (
                                    <>
                                      <span className="font-semibold">
                                        Click to upload
                                      </span>{" "}
                                      or drag and drop
                                    </>
                                  )}
                                </p>
                                <p className="text-xs text-primary">
                                  JPG, PNG, or GIF (MAX. 5MB)
                                </p>
                              </div>
                            )}
                            <Input
                              id="file-upload"
                              type="file"
                              disabled={
                                !editedField.use_settings_upload ||
                                uploading ||
                                imageUrl?.length > 0
                              }
                              onChange={handleImageUpload}
                              accept=".jpg,.jpeg,.png,.gif"
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex gap-2.5 items-center my-2">
                        <Checkbox
                          checked={editedField.media_card_data?.use_url}
                          onCheckedChange={() =>
                            setEditedField({
                              ...editedField,
                              media_card_data: {
                                ...editedField.media_card_data,
                                use_url: !editedField.media_card_data?.use_url,
                              },
                            })
                          }
                        />{" "}
                        Use URL placeholder
                      </div>
                      <div className="mt-2.5 flex items-center gap-2.5">
                        <Input
                          value={imageUrl}
                          placeholder="Enter Image URL"
                          className="border-secondary"
                          disabled={!isUrlChecked || imagePreviews?.length > 0}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                          }}
                        />
                        <Button
                          disabled={
                            !isUrlChecked ||
                            !imageUrl ||
                            imagePreviews?.length > 0
                          }
                          onClick={handleImageSubmit}
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Add URL
                        </Button>
                      </div>
                    </div>
                    {uploadError && (
                      <span className="text-red-500">{uploadError}</span>
                    )}
                  </div>
                )}
              />
              <If
                condition={field?.variant === "Send Video"}
                render={() => (
                  <div>
                    <div>
                      <Label htmlFor="video-upload">
                        <div className="flex items-center gap-2.5 my-2">
                          <Checkbox
                            checked={isPlaceholderChecked}
                            onCheckedChange={() =>
                              setIsPlaceholderChecked(!isPlaceholderChecked)
                            }
                          />{" "}
                          Use upload placeholder
                        </div>
                      </Label>

                      <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="video-upload"
                            className={`relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg ${
                              !isPlaceholderChecked
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            } bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden`}
                          >
                            {videoPreviews.length > 0 ? (
                              <div className="relative w-full">
                                {videoPreviews[0].startsWith("http") ? (
                                  /(youtube\.com|youtu\.be)/.test(
                                    videoPreviews[0]
                                  ) ? (
                                    <iframe
                                      src={videoPreviews[0].replace(
                                        "watch?v=",
                                        "embed/"
                                      )}
                                      title="video-preview"
                                      className="h-64 w-full"
                                      frameBorder="0"
                                      allow="autoplay; encrypted-media"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <video
                                      src={videoPreviews[0]}
                                      controls
                                      className="h-fit w-full"
                                    />
                                  )
                                ) : (
                                  <video
                                    src={videoPreviews[0]}
                                    controls
                                    className="h-fit w-full"
                                  />
                                )}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeVideo(0);
                                  }}
                                  className="absolute top-2 right-2 z-10"
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                                <p className="mb-2 text-sm text-primary">
                                  <span className="font-semibold">
                                    Click to upload a video
                                  </span>
                                </p>
                              </div>
                            )}
                            <Input
                              id="video-upload"
                              type="file"
                              disabled={
                                !isPlaceholderChecked ||
                                uploading ||
                                videoUrl?.length > 0
                              }
                              onChange={handleVideoUpload}
                              accept=".mp4, .mov, .avi, .mkv, .webm"
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex gap-2.5 items-center my-2">
                        <Checkbox
                          checked={isUrlChecked}
                          onCheckedChange={() => setIsUrlChecked(!isUrlChecked)}
                        />{" "}
                        Use URL placeholder
                      </div>
                      <div className="mt-2.5 flex items-center gap-2.5">
                        <Input
                          value={videoUrl}
                          placeholder="Enter Video URL"
                          className="border-secondary"
                          disabled={!isUrlChecked || videoPreviews?.length > 0}
                          onChange={(e) => {
                            setVideoUrl(e.target.value);
                          }}
                        />
                        <Button
                          disabled={
                            !isUrlChecked ||
                            !videoUrl ||
                            videoPreviews?.length > 0
                          }
                          onClick={handleVideoSubmit}
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Add URL
                        </Button>
                      </div>
                    </div>
                    {uploadError && (
                      <span className="text-red-500">{uploadError}</span>
                    )}
                  </div>
                )}
              />
              <If
                condition={field?.variant === "Send File"}
                render={() => (
                  <div>
                    <div>
                      <Label htmlFor="file-upload">
                        <div className="flex items-center gap-2.5 my-2">
                          <Checkbox
                            checked={isPlaceholderChecked}
                            onCheckedChange={() =>
                              setIsPlaceholderChecked(!isPlaceholderChecked)
                            }
                          />{" "}
                          Use upload placeholder
                        </div>
                      </Label>

                      <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="file-upload"
                            className={`relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg ${
                              !isPlaceholderChecked
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            } bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden`}
                          >
                            {filePreviews && filePreviews?.length > 0 ? (
                              <div className="flex flex-col items-center flex-wrap justify-center w-full h-full">
                                <div className="text-4xl font-bold text-primary mb-2">
                                  {getFileIcon(fileName)}
                                </div>
                                <span className="text-sm text-center w-[50%] overflow-hidden overflow-ellipsis flex-wrap text-primary  truncate ">
                                  {fileName}
                                </span>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeFile(0);
                                  }}
                                  className="absolute top-2 right-2"
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col p-2.5 items-center justify-center pt-5 pb-6">
                                <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                                <p className="mb-2 text-sm text-primary">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-primary">
                                  DOC, DOCX, XLS, XLSX, CSV (MAX. 5MB)
                                </p>
                              </div>
                            )}
                            <Input
                              id="file-upload"
                              type="file"
                              disabled={
                                !isPlaceholderChecked ||
                                uploading ||
                                fileUrl?.length > 0
                              }
                              onChange={handleFileUpload}
                              accept=".doc,.docx,.xls,.xlsx,.csv"
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex gap-2.5 items-center my-2">
                        <Checkbox
                          checked={isUrlChecked}
                          onCheckedChange={() => setIsUrlChecked(!isUrlChecked)}
                        />{" "}
                        Use URL placeholder
                      </div>
                      <div className="mt-2.5 flex items-center gap-2.5">
                        <Input
                          value={fileUrl}
                          placeholder="Enter File URL"
                          className="border-secondary"
                          disabled={!isUrlChecked || filePreviews?.length > 0}
                          onChange={(e) => {
                            setFileUrl(e.target.value);
                          }}
                        />
                        <Button
                          disabled={
                            !isUrlChecked ||
                            !fileUrl ||
                            filePreviews?.length > 0
                          }
                          onClick={handleFileSubmit}
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Add URL
                        </Button>
                      </div>
                    </div>
                    {uploadError && (
                      <span className="text-red-500">{uploadError}</span>
                    )}
                  </div>
                )}
              />

              <If
                condition={field?.variant === "Send Pdf"}
                render={() => (
                  <div>
                    <div>
                      <Label htmlFor="pdf-upload">
                        <div className="flex items-center gap-2.5 my-2">
                          <Checkbox
                            checked={isPlaceholderChecked}
                            onCheckedChange={() =>
                              setIsPlaceholderChecked(!isPlaceholderChecked)
                            }
                          />{" "}
                          Use upload placeholder
                        </div>
                      </Label>

                      <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="pdf-upload"
                            className={`relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg ${
                              !isPlaceholderChecked
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            } bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden`}
                          >
                            {pdfPreviews && pdfPreviews?.length > 0 ? (
                              <div className="flex flex-col items-center flex-wrap justify-center w-full h-full">
                                <div className="text-4xl font-bold text-primary mb-2">
                                  <FaFilePdf className="text-red-500" />
                                </div>
                                <span className="text-sm  w-[50%] overflow-hidden overflow-ellipsis flex-wrap text-primary text-center  truncate ">
                                  {pdfName}
                                </span>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removePdf(0);
                                  }}
                                  className="absolute top-2 right-2"
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col p-2.5 items-center justify-center pt-5 pb-6">
                                <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                                <p className="mb-2 text-sm text-primary">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-primary">
                                  PDF (MAX. 5MB)
                                </p>
                              </div>
                            )}
                            <Input
                              id="pdf-upload"
                              type="file"
                              disabled={
                                !isPlaceholderChecked ||
                                uploading ||
                                pdfUrl?.length > 0
                              }
                              onChange={handlePdfUpload}
                              accept=".pdf"
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex gap-2.5 items-center my-2">
                        <Checkbox
                          checked={isUrlChecked}
                          onCheckedChange={() => setIsUrlChecked(!isUrlChecked)}
                        />{" "}
                        Use URL placeholder
                      </div>
                      <div className="mt-2.5 flex items-center gap-2.5">
                        <Input
                          value={pdfUrl}
                          placeholder="Enter File URL"
                          className="border-secondary"
                          disabled={!isUrlChecked || pdfPreviews?.length > 0}
                          onChange={(e) => {
                            setPdfUrl(e.target.value);
                          }}
                        />
                        <Button
                          disabled={
                            !isUrlChecked || !pdfUrl || pdfPreviews?.length > 0
                          }
                          onClick={handlePdfSubmit}
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Add URL
                        </Button>
                      </div>
                    </div>
                    {uploadError && (
                      <span className="text-red-500">{uploadError}</span>
                    )}
                  </div>
                )}
              />
              <div>
                <Label htmlFor="className">className</Label>
                <Input
                  id="className"
                  value={editedField.className}
                  onChange={(e) =>
                    setEditedField({
                      ...editedField,
                      className: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 border p-3 rounded">
                  <Checkbox
                    checked={editedField.disabled}
                    onCheckedChange={(checked) =>
                      setEditedField({
                        ...editedField,
                        disabled: checked as boolean,
                        required: checked ? false : editedField.required,
                      })
                    }
                  />
                  <Label>Hide</Label>
                </div>
                <div className="flex items-center gap-1 border p-3 rounded">
                  <Checkbox
                    checked={editedField.required}
                    onCheckedChange={(checked) =>
                      setEditedField({
                        ...editedField,
                        required: checked as boolean,
                        disabled: checked ? false : editedField.disabled,
                      })
                    }
                  />
                  <Label>Required</Label>
                </div>
              </div>
              <If
                condition={field?.variant === "Input"}
                render={() => (
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      // id="type"
                      value={editedField.type}
                      onValueChange={(value) => {
                        setFieldType(value);
                        setEditedField({ ...editedField, type: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="file">File</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              <If
                condition={fieldType === "number" || fieldType === "text"}
                render={() => (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-1 flex flex-col gap-1 ">
                      <Label>Min Value</Label>
                      <Input
                        id="min"
                        type="number"
                        value={editedField.min}
                        onChange={(e) =>
                          setEditedField({
                            ...editedField,
                            min: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1 ">
                      <Label>Max Value</Label>
                      <Input
                        id="max"
                        type="number"
                        value={editedField.max}
                        onChange={(e) =>
                          setEditedField({
                            ...editedField,
                            max: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              />
              <If
                condition={field?.variant === "Slider"}
                render={() => (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 flex flex-col gap-1 ">
                      <Label>Min Value</Label>
                      <Input
                        id="min"
                        type="number"
                        value={editedField.min}
                        onChange={(e) =>
                          setEditedField({
                            ...editedField,
                            min: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1 ">
                      <Label>Max Value</Label>
                      <Input
                        id="max"
                        type="number"
                        value={editedField.max}
                        onChange={(e) =>
                          setEditedField({
                            ...editedField,
                            max: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1 ">
                      <Label>Step</Label>
                      <Input
                        id="step"
                        type="number"
                        value={editedField.step}
                        onChange={(e) =>
                          setEditedField({
                            ...editedField,
                            step: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              />
              <If
                condition={field?.variant === "Dropdown"}
                render={() => (
                  <div>
                    <Label>Dropdown Options</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          placeholder="Add new option"
                        />
                        <Button
                          onClick={() => {
                            if (newOption && editedField) {
                              setEditedField({
                                ...editedField,
                                options: [
                                  ...(editedField.options || []),
                                  newOption,
                                ],
                              });
                              setNewOption("");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      {editedField?.options?.map((item: any, index: any) => (
                        <div
                          key={index}
                          className="p-2.5 bg-secondary rounded flex justify-between items-center"
                        >
                          <span>{item}</span>
                          <span
                            className="cursor-pointer"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <X />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              />
              <If
                condition={field?.variant === "Combobox"}
                render={() => (
                  <div>
                    <Label>ComboBox Options</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={comboboxOptions}
                          onChange={(e) => setComboboxOptions(e.target.value)}
                          placeholder="Add new option"
                        />
                        <Button
                          onClick={() => {
                            if (comboboxOptions && editedField) {
                              setEditedField({
                                ...editedField,
                                combobox: [
                                  ...(editedField.combobox || []),
                                  comboboxOptions,
                                ],
                              });
                              setComboboxOptions("");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      {editedField?.combobox?.map((item: any, index: any) => (
                        <div
                          key={index}
                          className="p-2.5 bg-secondary rounded flex justify-between items-center"
                        >
                          <span>{item}</span>
                          <span
                            className="cursor-pointer"
                            onClick={() => {
                              if (editedField) {
                                setEditedField({
                                  ...editedField,
                                  combobox: editedField.combobox?.filter(
                                    (_: any, i: any) => i !== index
                                  ),
                                });
                              }
                            }}
                          >
                            <X />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              />
              <If
                condition={field?.variant === "Multi Select"}
                render={() => (
                  <div>
                    <Label>Multi Select Options</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={multiSelect}
                          onChange={(e) => setMultiSelect(e.target.value)}
                          placeholder="Add new option"
                        />
                        <Button
                          onClick={() => {
                            if (multiSelect && editedField) {
                              setEditedField({
                                ...editedField,
                                multiselect: [
                                  ...(editedField.multiselect || []),
                                  multiSelect,
                                ],
                              });
                              setMultiSelect("");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      {editedField?.multiselect?.map(
                        (
                          item:
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactElement<
                                any,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | React.ReactPortal
                            | Promise<React.ReactNode>
                            | null
                            | undefined,
                          index: React.Key | null | undefined
                        ) => (
                          <div
                            key={index}
                            className="p-2.5 bg-secondary rounded flex justify-between items-center"
                          >
                            <span>{String(item)}</span>
                            <span
                              className="cursor-pointer"
                              onClick={() => {
                                if (editedField) {
                                  setEditedField({
                                    ...editedField,
                                    multiselect:
                                      editedField.multiselect?.filter(
                                        (_: any, i: any) => i !== index
                                      ),
                                  });
                                }
                              }}
                            >
                              <X />
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              />
              <If
                condition={field?.variant === "Radio Group"}
                render={() => (
                  <div>
                    <Label>Radio Group Options</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={radioGroup}
                          disabled={useAPI}
                          onChange={(e) => setRadioGroup(e.target.value)}
                          placeholder="Add new option"
                        />
                        <Button
                          disabled={useAPI}
                          onClick={() => {
                            if (radioGroup && editedField) {
                              setEditedField({
                                ...editedField,
                                radiogroup: [
                                  ...(editedField.radiogroup || []),
                                  radioGroup,
                                ],
                              });
                              setRadioGroup("");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      {editedField?.radiogroup?.map(
                        (
                          item:
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactElement<
                                any,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | React.ReactPortal
                            | Promise<React.ReactNode>
                            | null
                            | undefined,
                          index: React.Key | null | undefined
                        ) => (
                          <div
                            key={index}
                            className="p-2.5 bg-secondary rounded flex justify-between items-center"
                          >
                            <span>{String(item)}</span>
                            <span
                              className="cursor-pointer"
                              onClick={() => {
                                if (editedField) {
                                  setEditedField({
                                    ...editedField,
                                    radiogroup: editedField.radiogroup?.filter(
                                      (_: any, i: any) => i !== index
                                    ),
                                  });
                                }
                              }}
                            >
                              <X />
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              />
              <If
                condition={field?.variant === "Smart Datetime Input"}
                render={() => (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-1 flex flex-col gap-1 ">
                      <Label htmlFor="locale">Locale</Label>
                      <Select
                        // id="locale"
                        value={editedField.locale ?? ""}
                        onValueChange={(value) => {
                          setEditedField({
                            ...editedField,
                            locale: value as keyof typeof Locales,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select locale" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(Locales).map((locale) => (
                            <SelectItem key={locale} value={locale}>
                              {locale}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex items-end gap-1 p-3 rounded">
                      <Checkbox
                        // id="hour12"
                        checked={editedField.hour12}
                        onCheckedChange={(checked) =>
                          setEditedField({
                            ...editedField,
                            hour12: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor="hour12">12 Hour Clock</Label>
                    </div>
                  </div>
                )}
              />

              <If
                condition={[
                  "Combobox",
                  "Multi Select",
                  "Image Upload",
                  "File Upload",
                  "Location Select",
                  "Radio Group",
                  "Text Box",
                  "Number",
                  "Mobile",
                  "OTP",
                  "Email",
                  "Password",
                  "Date",
                  "Date Time",
                  "Dropdown",
                  "Check Box",
                  "Text Area",
                  "Radio Group",
                  "Send Image",
                  "Send Video",
                  "Send File",
                  "Send Pdf",
                ].includes(field?.variant ?? "")}
                render={() => (
                  <div>
                    <div className="flex w-fit items-center gap-1 border p-3 rounded">
                      <Checkbox
                        checked={useAPI}
                        onCheckedChange={() => setUseAPI(!useAPI)}
                      />
                      <Label>Use API</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiURL">API URL</Label>
                      <Input
                        id="apiURL"
                        type="text"
                        value={apiURL}
                        onChange={(e) => setAPIURL(e.target.value)}
                        placeholder="Enter API URL"
                        disabled={!useAPI}
                      />
                    </div>
                    <span
                      className="text-red-500 text-sm"
                      id="api_url_error_msg"
                    ></span>
                    <div className="space-y-2">
                      <Label htmlFor="apiURL">API Field</Label>
                      <Input
                        id="apiURL"
                        type="text"
                        value={apiField}
                        onChange={(e) => setApiField(e.target.value)}
                        placeholder="Enter API Field"
                        disabled={!useAPI}
                      />
                    </div>
                    <Button
                      className="mt-2"
                      disabled={!useAPI || !apiURL || !apiField}
                      onClick={handleAddApiData}
                    >
                      Add Data
                    </Button>
                    <span
                      className="text-red-500 text-sm"
                      id="api_field_error_msg"
                    ></span>
                  </div>
                )}
              />
              <div className="w-full flex items-end justify-end">
                <Button onClick={handleSave} disabled={uploading}>
                  Save changes
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="cards">
            <If
              condition={
                field?.variant !== "Send Media Card" &&
                field?.variant !== "Analytic Card" &&
                field?.variant !== "Chat with Data" &&
                field?.variant !== "Chat with Data Auto" &&
                field?.variant !== "Chat with Data JSON"
              }
              render={() => <div>Card content goes here.</div>}
            />
            <If
              condition={
                field?.variant === "Send Media Card" ||
                field?.variant === "Analytic Card" ||
                field?.variant === "Chat with Data" ||
                field?.variant === "Chat with Data Auto" ||
                field?.variant === "Chat with Data JSON"
              }
              render={() => (
                <div className="space-y-2.5">
                  <>
                    <Label htmlFor="media-card">Content Type</Label>
                    <Select
                      value={editedField.media_card_data?.card_type}
                      onValueChange={(value) => {
                        setEditedField({
                          ...editedField,
                          media_card_data: {
                            ...editedField.media_card_data,
                            card_type: value,
                          },
                        });
                        setSelectedValue(value);
                      }}
                    >
                      <SelectTrigger id="media-card">
                        <SelectValue placeholder="Select media type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES?.map((item: string, index: number) => (
                          <SelectItem key={index} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                  {/* -------------------------------- */}
                  <div>
                    <Label htmlFor="file-upload-checkbox">
                      <div className="flex items-center gap-2.5 my-2">
                        <Checkbox
                          id="file-upload-checkbox"
                          checked={editedField.media_card_data?.use_upload}
                          onCheckedChange={() =>
                            setEditedField({
                              ...editedField,
                              media_card_data: {
                                ...editedField.media_card_data,
                                use_upload:
                                  !editedField.media_card_data?.use_upload,
                              },
                            })
                          }
                        />{" "}
                        Use upload placeholder
                      </div>
                    </Label>

                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="file-upload"
                          className={`relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg ${
                            !editedField.media_card_data?.use_upload
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                          } bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden`}
                        >
                          {mediaCardPreviews.length > 0 ? (
                            <>
                              {mediaCardPreviews}
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeMedia();
                                }}
                                className="absolute top-2 right-2 z-10"
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <div
                              className={`flex ${
                                !editedField.media_card_data?.use_upload &&
                                "bg-gray-100 cursor-not-allowed"
                              } flex-col items-center justify-center pt-5 pb-6`}
                            >
                              <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                              <p className="mb-2 text-sm text-primary">
                                {editedField.media_card_data?.media_url ? (
                                  <span className="font-semibold text-center">
                                    {editedField.media_card_data.media_url}
                                  </span>
                                ) : (
                                  <>
                                    <span className="font-semibold">
                                      Click to upload
                                    </span>{" "}
                                    or drag and drop
                                  </>
                                )}
                              </p>
                            </div>
                          )}
                          <Input
                            id="file-upload"
                            type="file"
                            disabled={
                              !editedField.media_card_data?.use_upload ||
                              uploading ||
                              mediaCardPreviews?.length > 0 ||
                              selectedValue === "Page URL" ||
                              selectedValue === "Data card"
                            }
                            onChange={handleMediaUpload}
                            className="hidden"
                            onClick={(e) => {
                              if (!editedField.media_card_data?.use_upload) {
                                e.preventDefault();
                              }
                            }}
                            // Removed the value prop as file inputs can only have empty string values
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex gap-2.5 items-center my-2">
                      <Checkbox
                        checked={editedField.media_card_data?.use_url}
                        onCheckedChange={() =>
                          setEditedField({
                            ...editedField,
                            media_card_data: {
                              ...editedField.media_card_data,
                              use_url: !editedField.media_card_data?.use_url,
                            },
                          })
                        }
                      />{" "}
                      Use URL placeholder
                    </div>
                    <div className="mt-2.5 flex items-center gap-2.5">
                      <Input
                        value={editedField.media_card_data?.media_url}
                        placeholder="Enter File URL"
                        className="border-secondary"
                        disabled={
                          !editedField.media_card_data?.use_url ||
                          mediaCardPreviews?.length > 0
                        }
                        onChange={(e) => {
                          setEditedField({
                            ...editedField,
                            media_card_data: {
                              ...editedField.media_card_data,
                              media_url: e.target.value,
                            },
                          });
                        }}
                      />
                      <Button
                        disabled={
                          !editedField.media_card_data?.use_url ||
                          !mediaCardUrl ||
                          mediaCardPreviews?.length > 0
                        }
                        onClick={handleMediaSubmit}
                      >
                        <Link className="w-4 h-4 mr-2" />
                        Add URL
                      </Button>
                    </div>
                  </div>
                  {uploadError && (
                    <span className="text-red-500">{uploadError}</span>
                  )}
                  {/* ----------------- */}
                  <Label htmlFor="custom-html">Custom HTML</Label>
                  <Textarea
                    id="custom-html"
                    value={editedField.media_card_data?.custom_html}
                    className="min-h-[100px]"
                    onChange={(e) => {
                      setEditedField({
                        ...editedField,
                        media_card_data: {
                          ...editedField.media_card_data,
                          custom_html: e.target.value,
                        },
                      });
                    }}
                  />
                  {/* -----------------*/}
                  <div className="space-y-2">
                    <Label htmlFor="card-json">Card JSON</Label>
                    <div className="flex flex-col space-y-2">
                      <Textarea
                        id="card-json"
                        onChange={(e) => {
                          try {
                            const parsedData = JSON.parse(e.target.value);
                            setEditedField({
                              ...editedField,
                              media_card_data: {
                                ...editedField.media_card_data,
                                card_json: Array.isArray(parsedData)
                                  ? parsedData
                                  : [parsedData],
                              },
                            });
                          } catch (error) {
                            console.error("Invalid JSON:", error);
                            // Optionally show error to user via toast/alert
                          }
                        }}
                        value={JSON.stringify(
                          editedField.media_card_data?.card_json || [],
                          null,
                          2
                        )}
                        placeholder="Enter valid JSON array here"
                        className="min-h-[100px] text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="like-url"
                      className="flex items-center gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      Like URL
                    </Label>
                    <Input
                      id="like-url"
                      placeholder="Enter Like redirection URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="favorite-url"
                      className="flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Favorite URL
                    </Label>
                    <Input
                      id="favorite-url"
                      placeholder="Enter Favorite redirection URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="task-url"
                      className="flex items-center gap-2"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Task URL
                    </Label>
                    <Input
                      id="task-url"
                      placeholder="Enter Task redirection URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="chat-url"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat URL
                    </Label>
                    <Input
                      id="chat-url"
                      placeholder="Enter Chat redirection URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="share-url"
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share URL
                    </Label>
                    <Input
                      id="share-url"
                      placeholder="Enter Share redirection URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="component-name">Component Name</Label>
                    <Select
                      onValueChange={(value) => {
                        setEditedField({
                          ...editedField,
                          media_card_data: {
                            ...editedField.media_card_data,
                            component_name: value,
                          },
                        });
                      }}
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
                  </div>
                  <div>
                    <div className="flex w-fit items-center gap-1 border p-3 rounded">
                      <Checkbox
                        checked={useAPI}
                        onCheckedChange={() => setUseAPI(!useAPI)}
                      />
                      <Label>Use API</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiURL">API URL</Label>
                      <Input
                        id="apiURL"
                        type="text"
                        value={apiURL}
                        onChange={(e) => setAPIURL(e.target.value)}
                        placeholder="Enter API URL"
                        disabled={!useAPI}
                      />
                    </div>
                    <span
                      className="text-red-500 text-sm"
                      id="api_url_error_msg"
                    ></span>
                    <div className="space-y-2">
                      <Label htmlFor="apiURL">API Field</Label>
                      <Input
                        id="apiURL"
                        type="text"
                        value={apiField}
                        onChange={(e) => setApiField(e.target.value)}
                        placeholder="Enter API Field"
                        disabled={!useAPI}
                      />
                    </div>
                    <Button
                      className="mt-2"
                      disabled={!useAPI || !apiURL || !apiField}
                      onClick={handleAddApiData}
                    >
                      Add Data
                    </Button>
                    <span
                      className="text-red-500 text-sm"
                      id="api_field_error_msg"
                    ></span>
                  </div>
                  <div className="w-full flex items-end justify-end">
                    <Button onClick={handleSave} disabled={uploading}>
                      Save changes
                    </Button>
                  </div>
                </div>
              )}
            />
          </TabsContent>
          <TabsContent value="connection">
            Connection content goes here.
          </TabsContent>
          <TabsContent value="actions">
            <If
              condition={
                field?.variant !== "Chat with Data" &&
                field?.variant !== "Chat with Data Auto" &&
                field?.variant !== "Chat with Data JSON"
              }
              render={() => <div>Actions content goes here.</div>}
            />
            <If
              condition={
                field?.variant == "Chat with Data" ||
                field?.variant == "Chat with Data Auto" ||
                field?.variant == "Chat with Data JSON"
              }
              render={() => (
                <div>
                  <ChatwithDataActions
                    editedField={editedField}
                    setEditedField={setEditedField}
                    setLoading={setUploading}
                    validApi={validApi}

                    // handleSaveField={handleSave}
                  />
                  <div className="w-full flex items-end justify-end">
                    <Button onClick={handleSave} disabled={uploading}>
                      Save
                    </Button>
                  </div>
                </div>
              )}
            />
          </TabsContent>
        </Tabs>
        {/* <DialogFooter>
          <Button onClick={handleSave} disabled={uploading}>
            Save changes
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};
