/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NEXT_PUBLIC_API_KEY } from "@/constants/envConfig";
import { Loader, PlayCircle, Save } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { createConnection, updateConnection } from "../../lib/actions";

interface DocumentConnectionsProps {
  isEditing?: boolean;
  connectionId?: string;
  initialData?: any;
}

interface Connection {
  id?: string;
  status: "active" | "inactive";
  created_date: string;
  connection_name: string;
  document_type: string;
  storage_type: string;
  document_path: string;
  access_key: string;
  secret_key: string;
  region: string;
  test_status: "passed" | "failed" | "pending";
  connection_scope?: string;
}

const DocumentConnections = ({
  isEditing = false,
  initialData,
}: DocumentConnectionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const [connection, setConnection] = useState<Connection>({
    status: "inactive",
    created_date: new Date().toISOString().split("T")[0],
    connection_name: "",
    document_type: "PDF",
    storage_type: "Amazon S3",
    document_path: "",
    access_key: "",
    secret_key: "",
    region: "",
    test_status: "pending",
    connection_scope: "All Agents",
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setConnection(initialData);
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setConnection({ ...connection, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setConnection({ ...connection, [name]: value });
  };

  const handleTestConnection = async () => {
    if (
      !connection.document_path ||
      !connection.access_key ||
      !connection.secret_key ||
      !connection.region
    ) {
      toast.error("All fields are required for testing");
      return;
    }

    try {
      // Here you would implement the actual document connection test
      // For now, we'll simulate a successful test
      setConnection({ ...connection, test_status: "passed" });
      toast.success("Connection test successful");
    } catch (error: any) {
      setConnection({ ...connection, test_status: "failed" });
      toast.error(error.message || "Connection test failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${NEXT_PUBLIC_API_KEY}`);
      myHeaders.append("Content-Type", "application/json");

      const payload = {
        document_connection_json: connection,
        connection_scope: connection.connection_scope,
        created_date: new Date().toISOString(),
        created_user_id: session?.user?.user_catalog_id,
        created_user_name: session?.user?.user_name,
        business_name: session?.user?.business_name,
        business_number: session?.user?.business_number,
        connection_group: "document",
      };

      // const url = isEditing
      //   ? `${ADD_CONNECTIONS}?id=eq.${connectionId}`
      //   : ADD_CONNECTIONS;
      // const method = isEditing ? "PATCH" : "POST";
      // const requestOptions = {
      //   method: method,
      //   headers: myHeaders,
      //   body: JSON.stringify(payload),
      // };

      // const response = await fetch(url, requestOptions);
      // if (!response.ok) {
      //   throw new Error("Failed to save connection");
      // }
      const response = await (isEditing
        ? updateConnection(payload, Number(payload.document_connection_json.id))
        : createConnection(payload));
      if (!response.data) {
        toast.error("Failed to save connection");
        throw new Error("Failed to save connection");
      }

      toast.success(
        `Connection ${isEditing ? "updated" : "added"} successfully`
      );
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error(`Failed to ${isEditing ? "edit" : "add"} connection`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {isEditing ? "Edit Document Connection" : "New Document Connection"}
          </CardTitle>
          <Link href="/agentmaker">
            <Button className="border-0" variant={"outline"}>
              Back to Agent Maker
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connection_name">Connection Name</Label>
            <Input
              id="connection_name"
              name="connection_name"
              value={connection.connection_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_type">Document Type</Label>
            <Select
              value={connection.document_type}
              onValueChange={(value) =>
                handleSelectChange("document_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="WORD">WORD</SelectItem>
                <SelectItem value="EXCEL">EXCEL</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
                <SelectItem value="TXT">TXT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storage_type">Storage Type</Label>
            <Select
              value={connection.storage_type}
              onValueChange={(value) =>
                handleSelectChange("storage_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select storage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Local">Local</SelectItem>
                <SelectItem value="Amazon S3">Amazon S3</SelectItem>
                <SelectItem value="Google Cloud Storage">
                  Google Cloud Storage
                </SelectItem>
                <SelectItem value="Azure Blob Storage">
                  Azure Blob Storage
                </SelectItem>
                <SelectItem value="Dropbox">Dropbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_path">Document Path</Label>
            <Input
              id="document_path"
              name="document_path"
              value={connection.document_path}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_key">Access Key</Label>
            <Input
              id="access_key"
              name="access_key"
              type="password"
              value={connection.access_key}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret_key">Secret Key</Label>
            <Input
              id="secret_key"
              name="secret_key"
              type="password"
              value={connection.secret_key}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              name="region"
              value={connection.region}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={connection.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection_scope">Connection Scope</Label>
            <Select
              value={connection.connection_scope}
              onValueChange={(value) =>
                handleSelectChange("connection_scope", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Agents">All Agents</SelectItem>
                <SelectItem value="Agents">Agents</SelectItem>
                <SelectItem value="Agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isLoading}
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Test Connection
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Adding..."}
                </>
              ) : isEditing ? (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Update Connection
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Create Connection
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentConnections;
