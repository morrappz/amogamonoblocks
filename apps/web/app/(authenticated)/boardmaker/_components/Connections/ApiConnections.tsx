/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CirclePlay, Loader, Save } from "lucide-react";
import { NEXT_PUBLIC_API_KEY } from "@/constants/envConfig";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { createConnection, updateConnection } from "../../lib/actions";

type Connection = {
  id: string;
  status: "active" | "inactive";
  created_date: string;
  connection_name: string;
  connection_type: string;
  api_method: "GET" | "POST";
  api_url: string;
  key: string;
  secret: string;
  test_status: "passed" | "failed" | "pending";
  test_data?: string;
  connection_scope?: string;
};

interface ApiConnectionsProps {
  isEditing?: boolean;
  connectionId?: string;
  initialData?: any;
}

const ApiConnections = ({
  isEditing = false,

  initialData,
}: ApiConnectionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const [testStatus, setTestStatus] = useState(false);

  const [connection, setConnection] = useState<Connection>({
    status: "inactive",
    created_date: new Date().toISOString().split("T")[0],
    connection_name: "",
    api_method: "GET",
    api_url: "",
    key: "",
    secret: "",
    test_status: "pending",
    test_data: '{\n  "key": "value"\n}',
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
    if (!connection.key || !connection.secret || !connection.api_url) {
      toast.error("API URL, Key and Secret are required");
      return;
    }

    try {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append(connection.key, connection.secret);

      const requestOptions: RequestInit = {
        method: connection.api_method,
        headers: headers,
      };

      if (connection.api_method === "POST") {
        if (!connection.test_data) {
          toast.error("Test data is required for POST requests");
          return;
        }

        try {
          const parsedData = JSON.parse(connection.test_data);
          requestOptions.body = JSON.stringify(parsedData);
          setTestStatus(true);
        } catch (e) {
          toast.error("Invalid JSON data format");
          console.log(e);
          return;
        }
      }

      const response = await fetch(connection.api_url, requestOptions);

      if (!response.ok) {
        setConnection({ ...connection, test_status: "failed" });
        const errorData = await response.json();
        throw new Error(errorData.error || "Connection test failed");
      }

      await response.json();
      setTestStatus(true);
      setConnection({ ...connection, test_status: "passed" });
      toast.success("Connection test passed successfully");
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

      const { connection_scope } = connection;

      const payload = {
        api_connection_json: connection,
        connection_scope: connection_scope,
        created_date: new Date().toISOString(),
        created_user_id: session?.user?.user_catalog_id,
        created_user_name: session?.user?.user_name,
        business_name: session?.user?.business_name,
        business_number: session?.user?.business_number,
        test_status: testStatus,
        connection_group: "api",
      };

      // const url = isEditing
      //   ? `${ADD_CONNECTIONS}?id=eq.${connection?.id}`
      //   : ADD_CONNECTIONS;
      // const method = isEditing ? "PATCH" : "POST";
      // const requestOptions = {
      //   method: method,
      //   headers: myHeaders,
      //   body: JSON.stringify(payload),
      // };

      // const response = await fetch(url, requestOptions);
      const response = await (isEditing
        ? updateConnection(payload, Number(payload.api_connection_json.id))
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
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {isEditing ? "Edit Connection" : "Add New API Connection"}
            </CardTitle>
            <Link href="/agentmaker">
              <Button className="border-0" variant={"outline"}>
                Back to Agent Maker
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && isEditing ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2.5">
                <div className="space-y-2">
                  <Label htmlFor="connection_name">Connection Name</Label>
                  <Input
                    id="connection_name"
                    name="connection_name"
                    value={connection.connection_name || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="connection_type">Connection Type</Label>
                  <Select
                    value={connection.connection_type || ""}
                    onValueChange={(value) =>
                      handleSelectChange("connection_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="OAuth">OAuth</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="api_method">API Method</Label>
                  <Select
                    value={connection.api_method || "GET"}
                    onValueChange={(value) =>
                      handleSelectChange("api_method", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={connection.status || "inactive"}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
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
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="api_url">API URL</Label>
                  <Input
                    id="api_url"
                    name="api_url"
                    value={connection.api_url || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    name="key"
                    value={connection.key || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret">Secret</Label>
                  <Input
                    id="secret"
                    name="secret"
                    type="password"
                    value={connection.secret || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {connection.api_method === "POST" && (
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="test_data">Test Data (JSON)</Label>
                    <Textarea
                      id="test_data"
                      name="test_data"
                      value={connection.test_data || ""}
                      onChange={handleInputChange}
                      className="min-h-[100px] font-mono"
                      placeholder="Enter JSON data for POST request"
                      required
                    />
                  </div>
                )}
                <div className="mt-5">
                  <Label htmlFor="connection_scope">Connection Scope</Label>
                  <Select
                    value={connection.connection_scope}
                    onValueChange={(value) => {
                      setConnection({
                        ...connection,
                        connection_scope: value,
                      });
                    }}
                  >
                    <SelectTrigger id="connection_scope">
                      <SelectValue placeholder="Select Connection Scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="All Agents">All Agents</SelectItem>
                        <SelectItem value="Agents">Agents</SelectItem>
                        <SelectItem value="Agent">Agent</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={
                    isLoading ||
                    !connection.api_url ||
                    !connection.key ||
                    !connection.secret
                  }
                >
                  <CirclePlay className="h-5 w-5 mr-2 " />
                  Test Connection
                </Button>
                <div className="space-x-2"></div>

                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !connection.api_url ||
                    !connection.key ||
                    !connection.secret ||
                    !connection.connection_name
                  }
                >
                  <Save className="mr-2 h-5 w-5" />
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Adding..."}
                    </>
                  ) : isEditing ? (
                    "Update Connection"
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiConnections;
