/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ADD_CONNECTIONS, NEXT_PUBLIC_API_KEY } from "@/constants/envConfig";
import { FaEdit } from "react-icons/fa";
import { getConnections } from "../lib/queries";
import { createConnection, updateConnection } from "../lib/actions";

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
};

export function ConnectionTable() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredData, setFilteredData] = React.useState<any[]>([]);
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [newConnection, setNewConnection] = React.useState<Partial<Connection>>(
    {
      status: "inactive",
      created_date: new Date().toISOString().split("T")[0],
      test_status: "pending",
      api_method: "GET",
      test_data: '{\n  "key": "value"\n}',
    }
  );

  React.useEffect(() => {
    const results = data.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(results);
  }, [searchTerm, data]);

  const fetchConnections = async () => {
    try {
      // const myHeaders = new Headers();
      // myHeaders.append("Authorization", `Bearer ${NEXT_PUBLIC_API_KEY}`);
      // const requestOptions = {
      //   method: "GET",
      //   headers: myHeaders,
      // };
      // const response = await fetch(ADD_CONNECTIONS, requestOptions);
      // if (!response.ok) {
      //   throw new Error("Failed to fetch connections");
      // }
      const response = await getConnections();

      setData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to fetch connections");
    }
  };

  React.useEffect(() => {
    fetchConnections();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewConnection({ ...newConnection, [e.target.name]: e.target.value });
  };

  const handleEdit = (item: Connection) => {
    setIsDialogOpen(true);
    setIsEditing(true);
    setNewConnection(item);
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewConnection({ ...newConnection, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${NEXT_PUBLIC_API_KEY}`);
      myHeaders.append("Content-Type", "application/json");

      const { test_data, ...connectionData } = newConnection;

      // const url = isEditing
      //   ? `${ADD_CONNECTIONS}?id=eq.${newConnection?.id}`
      //   : ADD_CONNECTIONS;
      // const method = isEditing ? "PUT" : "POST";
      // const requestOptions = {
      //   method: method,
      //   headers: myHeaders,
      //   body: JSON.stringify(connectionData),
      // };

      // const response = await fetch(url, requestOptions);
      const response = await (isEditing
        ? updateConnection(connectionData, Number(newConnection.id))
        : createConnection(connectionData));
      if (!response.data) {
        throw new Error("Failed to save connection");
      }

      toast.success(
        `Connection ${isEditing ? "updated" : "added"} successfully`
      );
      setLoading(false);
      setIsDialogOpen(false);
      fetchConnections();
    } catch (error) {
      setLoading(false);
      toast.error(`Failed to ${isEditing ? "edit" : "add"} connection`);
    }
  };

  const handleTestConnection = async (newConnection: Partial<Connection>) => {
    if (!newConnection.key || !newConnection.secret || !newConnection.api_url) {
      toast.error("API URL, Key and Secret are required");
      return;
    }

    try {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append(newConnection.key, newConnection.secret);

      const requestOptions: RequestInit = {
        method: newConnection.api_method,
        headers: headers,
      };

      if (newConnection.api_method === "POST") {
        if (!newConnection.test_data) {
          toast.error("Test data is required for POST requests");
          return;
        }

        try {
          const parsedData = JSON.parse(newConnection.test_data);
          requestOptions.body = JSON.stringify(parsedData);
        } catch (e) {
          toast.error("Invalid JSON data format");
          return;
        }
      }

      const response = await fetch(newConnection.api_url, requestOptions);

      if (!response.ok) {
        setNewConnection({ ...newConnection, test_status: "failed" });
        const errorData = await response.json();
        throw new Error(errorData.error || "Connection test failed");
      }

      await response.json();
      setNewConnection({ ...newConnection, test_status: "passed" });
      toast.success("Connection test successful");
    } catch (error) {
      setNewConnection({ ...newConnection, test_status: "failed" });
      toast.error("Connection test failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          type="search"
          placeholder="Search connections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsEditing(false);
                setNewConnection({
                  status: "inactive",
                  created_date: new Date().toISOString().split("T")[0],
                  test_status: "pending",
                  api_method: "GET",
                  test_data: '[{\n  "product_name": "Cap"\n}]',
                });
              }}
            >
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-[800px]">
            <Card className="border-none">
              <CardHeader>
                <CardTitle>
                  {isEditing ? "Edit Connection" : "Add New Connection"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="connection_name">Connection Name</Label>
                      <Input
                        id="connection_name"
                        name="connection_name"
                        value={newConnection.connection_name || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connection_type">Connection Type</Label>
                      <Select
                        value={newConnection.connection_type}
                        onValueChange={(value) =>
                          handleSelectChange("connection_type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REST">REST</SelectItem>
                          <SelectItem value="GraphQL">GraphQL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api_method">API Method</Label>
                      <Select
                        value={newConnection.api_method}
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
                      <Label htmlFor="api_url">API URL</Label>
                      <Input
                        id="api_url"
                        name="api_url"
                        value={newConnection.api_url || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="key">Key</Label>
                      <Input
                        id="key"
                        name="key"
                        value={newConnection.key || ""}
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
                        value={newConnection.secret || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newConnection.status}
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

                    {newConnection.api_method === "POST" && (
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="test_data">Test Data (JSON)</Label>
                        <Textarea
                          id="test_data"
                          name="test_data"
                          value={newConnection.test_data || ""}
                          onChange={handleInputChange}
                          className="min-h-[100px] font-mono"
                          placeholder="Enter JSON data for POST request"
                          required={newConnection.api_method === "POST"}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <Button type="submit">
                      {isEditing
                        ? "Edit Connection"
                        : loading
                        ? "Adding Connection..."
                        : "Add Connection"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleTestConnection(newConnection)}
                    >
                      Test Connection
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Connection Name</TableHead>
            <TableHead>Connection Type</TableHead>
            <TableHead>API Method</TableHead>
            <TableHead>API URL</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Secret</TableHead>
            <TableHead>Test Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Badge
                  variant={item.status === "active" ? "default" : "secondary"}
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>{item.created_date}</TableCell>
              <TableCell>{item.connection_name}</TableCell>
              <TableCell>{item.connection_type}</TableCell>
              <TableCell>{item.api_method}</TableCell>
              <TableCell>{item.api_url}</TableCell>
              <TableCell>{item.key}</TableCell>
              <TableCell>******</TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.test_status === "passed"
                      ? "default"
                      : item.test_status === "failed"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {item.test_status}
                </Badge>
              </TableCell>
              <TableCell onClick={() => handleEdit(item)}>
                <FaEdit className="h-5 w-5 cursor-pointer" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
