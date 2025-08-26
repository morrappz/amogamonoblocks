/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Calendar,
  Activity,
  Edit,
  Link as LinkIcon,
  Globe,
  Server,
  Trash2,
  Database,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteConnection } from "../../lib/actions";
// import { Connection } from "../../types/types";

const ConnectionsNew = ({ data }: { data: any }) => {
  const [search, setSearch] = useState("");
  // const [filteredData, setFilteredData] = useState<Connection[]>([]);
  // const [isLoading, setIsLoading] = useState(false);

  // const { data: session } = useSession();

  // const [newConnection, setNewConnection] = useState<Partial<Connection>>({
  //   status: "inactive",
  //   created_date: new Date().toISOString().split("T")[0],
  //   test_status: "pending",
  //   api_method: "GET",
  //   test_data: '{\n  "key": "value"\n}',
  // });

  // useEffect(() => {
  //   const results = data.filter((item: any) =>
  //     Object.values(item).some(
  //       (value: any) =>
  //         typeof value === "string" &&
  //         value.toLowerCase().includes(search.toLowerCase())
  //     )
  //   );
  //   setFilteredData(results);
  // }, [search, data]);

  // const fetchConnections = async () => {
  //   setIsLoading(true);
  //   try {
  //     const myHeaders = new Headers();
  //     myHeaders.append("Authorization", `Bearer ${NEXT_PUBLIC_API_KEY}`);
  //     const requestOptions = {
  //       method: "GET",
  //       headers: myHeaders,
  //     };
  // const response = await fetch(ADD_CONNECTIONS, requestOptions);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch connections");
  //     }
  //     const connections: Connection[] = await response.json();
  //     setData(connections);
  //     setFilteredData(connections);
  //   } catch (error) {
  //     console.error("Error fetching connections:", error);
  //     toast.error("Failed to fetch connections");
  //   }
  //   setIsLoading(false);
  // };

  // useEffect(() => {
  //   fetchConnections();
  // }, []);

  const getConnectionData = (item: any): any => {
    try {
      const connectionJsonField = `${item.connection_group}_connection_json`;
      const connectionDataString = item[connectionJsonField];

      // If the data is a string, parse it into an object
      if (typeof connectionDataString === "string") {
        return JSON.parse(connectionDataString);
      }

      // If it's already an object, return as is
      if (
        typeof connectionDataString === "object" &&
        connectionDataString !== null
      ) {
        return connectionDataString;
      }

      return null;
    } catch (error) {
      console.error("Error parsing connection data:", error);
      return null;
    }
  };

  const handleDelete = async (id: string) => {
    const response = await deleteConnection(Number(id));
    if (response) {
      toast.success(response.message);
    } else {
      toast.error("Failed to delete connection");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col max-w-[800px] mx-auto justify-center gap-4 w-full items-center">
      <div className="flex w-full gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search connections"
            className="pl-10 text-md"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"icon"}>
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Add Connection</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  href="/agentmaker/connections/api"
                  className="flex items-center"
                >
                  <Globe className="w-5 h-5 text-muted-foreground mr-2" />
                  <span>Connect API</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/agentmaker/connections/database"
                  className="flex items-center"
                >
                  <Database className="w-5 h-5 text-muted-foreground mr-2" />
                  <span>Connect Database</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/agentmaker/connections/document"
                  className="flex items-center"
                >
                  <FileText className="w-5 h-5 text-muted-foreground mr-2" />
                  <span>Connect Document</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 w-full">
        {data.map((item: any) => {
          const connectionData = getConnectionData(item);
          return (
            <Card key={item.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {/* Content Section */}
                  <div className="flex flex-col gap-4">
                    {/* Name and Type */}
                    <h2 className="font-semibold text-xl">
                      {connectionData?.connection_name}
                    </h2>

                    {/* API Method */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Server className="h-5 w-5" />
                      <span>Status: {connectionData?.status}</span>
                    </div>

                    {/* API URL */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <LinkIcon className="h-5 w-5" />
                      <span className="truncate">
                        Connection Group: {item?.connection_group}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-5 w-5" />
                      <span>Test Status: </span>
                      <p>{connectionData?.test_status}</p>
                    </div>

                    {/* Created Date */}

                    {/* Test Status and Actions */}
                    <div className="flex items-center justify-between">
                      {/* Actions */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-5 w-5" />
                        <span>Created: {formatDate(item?.created_date)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/agentmaker/connections/edit/${item.id}/${item.connection_group}`}
                        >
                          <Button size="sm" variant="ghost">
                            <Edit className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectionsNew;
