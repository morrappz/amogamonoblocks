/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import axiosInstance from "@/utils/axiosInstance";
import { Database, Filter, Loader, PlayCircle, Save } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TablesData from "./TablesData";
import { toast } from "sonner";
import { createConnection, updateConnection } from "../../lib/actions";

interface TableData {
  id: string;
  table_name: string;
}

interface DBConnectionsProps {
  isEditing?: boolean;
  connectionId?: string;
  initialData?: any;
}

interface Connection {
  id?: string;
  status: "active" | "inactive";
  created_date: string;
  connection_name: string;
  type: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  ssl: string;
  tables: TableData[];
  selected_tables: string[];
  test_status: "passed" | "failed" | "pending";
  connection_scope?: string;
}

const DBConnections = ({
  isEditing = false,
  connectionId,
  initialData,
}: DBConnectionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  // const [isTesting, setIsTesting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { data: session } = useSession();
  // const [testStatus, setTestStatus] = useState<string>("pending");

  const [connection, setConnection] = useState<Connection>({
    status: "inactive",
    created_date: new Date().toISOString().split("T")[0],
    connection_name: "",
    type: "PostgreSQL",
    host: "",
    port: "",
    database: "",
    username: "",
    password: "",
    ssl: "disable",
    tables: [],
    selected_tables: [],
    test_status: "pending",
    connection_scope: "All Agents",
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setConnection(initialData);
      if (
        initialData.test_status === "passed" &&
        initialData.database_connection_json
      ) {
        setConnection((prev) => ({
          ...prev,
          tables: initialData.database_connection_json.tables || [],
          selected_tables:
            initialData.database_connection_json.selected_tables || [],
        }));
      }
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
      !connection.host ||
      !connection.port ||
      !connection.database ||
      !connection.username ||
      !connection.password
    ) {
      toast.error("All fields are required");
      return;
    }

    // setIsTesting(true);
    try {
      const response = await axiosInstance.post(
        "/api/agent-maker/test-db-connection",
        {
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: connection.password,
          database: connection.database,
        }
      );

      if (response.data.success) {
        // setTestStatus("passed");
        const newTables = response.data.data.map((table: any) => ({
          id: table.table_name,
          table_name: table.table_name,
        }));

        // In edit mode, keep existing selected tables if they still exist in new tables
        const existingSelectedTables = isEditing
          ? connection.selected_tables.filter((tableName) =>
              newTables.some(
                (table: TableData) => table.table_name === tableName
              )
            )
          : [];

        setConnection({
          ...connection,
          test_status: "passed",
          tables: newTables,
          selected_tables: existingSelectedTables,
        });
        toast.success("Database connection successful");
      } else {
        // setTestStatus("failed");
        setConnection({
          ...connection,
          test_status: "failed",
        });
        toast.error(response.data.message || "Connection test failed");
      }
    } catch (error: any) {
      // setTestStatus("failed");
      setConnection({
        ...connection,
        test_status: "failed",
      });
      toast.error(error.message || "Connection test failed");
    } finally {
      // setIsTesting(false);
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
        database_connection_json: connection,
        connection_scope: connection.connection_scope,
        created_date: new Date().toISOString(),
        created_user_id: session?.user?.user_catalog_id,
        created_user_name: session?.user?.user_name,
        business_name: session?.user?.business_name,
        business_number: session?.user?.business_number,
        connection_group: "database",
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
        ? updateConnection(payload, Number(payload.database_connection_json.id))
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

  const handleSetScope = async () => {
    setIsLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${NEXT_PUBLIC_API_KEY}`);
      myHeaders.append("Content-Type", "application/json");

      const payload = {
        database_connection_json: {
          ...connection,
          selected_tables: connection.selected_tables,
          connection_scope: connection.connection_scope,
          updated_date: new Date().toISOString(),
          updated_user_id: session?.user?.user_catalog_id,
          updated_user_name: session?.user?.user_name,
        },
      };

      // const response = await fetch(`${ADD_CONNECTIONS}?id=eq.${connectionId}`, {
      //   method: "PATCH",
      //   headers: myHeaders,
      //   body: JSON.stringify(payload),
      // });
      const response = await updateConnection(payload, Number(connectionId));

      if (!response.data) {
        throw new Error("Failed to update scope");
      }

      toast.success("Scope updated successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update scope");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {isEditing ? "Edit Database Connection" : "New Database Connection"}
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
            <Label htmlFor="type">Database Type</Label>
            <Select
              value={connection.type}
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select database type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                <SelectItem value="MySQL">MySQL</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
                <SelectItem value="SQLite">SQLite</SelectItem>
                <SelectItem value="Redis">Redis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              name="host"
              value={connection.host}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              name="port"
              value={connection.port}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="database">Database Name</Label>
            <Input
              id="database"
              name="database"
              value={connection.database}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={connection.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={connection.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ssl">SSL Mode</Label>
            <Select
              value={connection.ssl}
              onValueChange={(value) => handleSelectChange("ssl", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select SSL mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disable">Disable</SelectItem>
                <SelectItem value="require">Require</SelectItem>
                <SelectItem value="verify-ca">Verify CA</SelectItem>
                <SelectItem value="verify-full">Verify Full</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isLoading}
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                Test Connection
              </Button>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" disabled={isLoading}>
                    <Database className="h-5 w-5 mr-2" />
                    Set Table Scope
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Connection Scope</DialogTitle>
                    <DialogDescription>
                      Select tables for this connection
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <TablesData
                      tables={connection.tables}
                      selectedTables={connection.selected_tables}
                      setSelectedTables={(newSelectedTables: string[]) => {
                        setConnection((prev) => ({
                          ...prev,
                          selected_tables: newSelectedTables,
                        }));
                      }}
                      onClose={() => {
                        handleSetScope();
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Button variant={"outline"} type="button" disabled>
              <Filter className="h-5 w-5 mr-2" />
              Set Field Scope
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

export default DBConnections;
