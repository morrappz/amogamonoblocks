"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React, { useMemo } from "react";
import { NotificationType } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

const Notifications = ({
  notifications,
}: {
  notifications: NotificationType[];
}) => {
  const [search, setSearch] = React.useState("");

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
          {filteredNotifications.length > 0 ? (
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
                  <p className="text-gray-400">{notification.chat_message}</p>
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
