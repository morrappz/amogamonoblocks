"use client";
import { Input } from "@/components/ui/input";
import { Archive, Search, Trash2 } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { NotificationType } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow, set } from "date-fns";
import { archieveNotification, getNotifications } from "../lib/queries";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Notifications = () => {
  const [search, setSearch] = React.useState("");
  const [notifications, setNotifications] = React.useState<NotificationType[]>(
    []
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const notificationsData = await getNotifications();
      setNotifications(notificationsData || []);
    } catch (error) {
      toast.error("Failed to fetch notifications");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(
      (notification) =>
        notification.chat_message
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        notification.created_user_name
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [notifications, search]);

  const handleArchive = async (id: string) => {
    try {
      await archieveNotification(id);
      fetchNotifications();
      toast.success("Notification archived successfully");
    } catch (error) {
      console.error("Error archiving notification:", error);
      toast.error("Failed to archive notification");
    }
  };

  const handleDelete = (notification: NotificationType) => {
    console.log("id----", notification);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-5 bg-background">
        <div className="border flex items-center gap-2.5 rounded-lg">
          <Search className="w-5 h-5 ml-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none"
            type="text"
            placeholder="Search"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="w-full h-14" />
              <Skeleton className="w-full h-14" />
              <Skeleton className="w-full h-14" />
              <Skeleton className="w-full h-14" />
              <Skeleton className="w-full h-14" />
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-2.5">
                  <div className="flex justify-between items-center mb-2.5">
                    <h1 className="font-semibold text-lg">
                      {notification.created_user_name}
                    </h1>
                    <p className="text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">{notification.chat_message}</p>
                    <div className="flex gap-3 items-center">
                      <Archive
                        className={`w-5 h-5 cursor-pointer ${notification.archive_status ? "text-green-500 " : "text-muted-foreground"}`}
                        onClick={() => handleArchive(notification.id)}
                      />

                      <Trash2
                        onClick={() => handleDelete(notification)}
                        className="w-5 h-5 text-muted-foreground hover:text-red-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center">No Notifications Found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
