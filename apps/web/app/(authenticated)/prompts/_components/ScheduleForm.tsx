"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Clock, Search, User, X } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Control, useWatch, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const frequencies = [
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "specific_dates",
];
const commonTimezones = [
  "UTC",
  "America/New_York", // US East
  "America/Chicago", // US Central
  "America/Denver", // US Mountain
  "America/Los_Angeles", // US Pacific
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Australia/Sydney",
  "Asia/Kuala_Lumpur", // Malaysia
  "Asia/Singapore", // Singapore
  "Asia/Jakarta", // Indonesia (Jakarta)
  "Asia/Kolkata", // India
];

const deliveryOptionsConfig = [
  { id: "aiChat", label: "Send on AI Chat" },
  { id: "notifier", label: "Send on Notifier" },
  { id: "email", label: "Send as Email" },
  { id: "chat", label: "Send on Chat" },
];

interface User {
  user_catalog_id: number;
  first_name: string;
  last_name: string | null;
  user_email: string | null;
}

interface ScheduleFormProps {
  control: Control<any>;
  errors: any;
  setValue: any;
  getValues: any;
  nextExecution?: Date | null;
  deliveryOptions?: {
    id: string;
    label: string;
  }[];
}

const searchUsersAPI = async (query: string, excludeIds: number[]) => {
  if (!query) return [];
  try {
    const params = new URLSearchParams({
      query,
      exclude: excludeIds.join(","),
    });

    const response = await fetch(`/api/users/search?${params.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to search users");
    }
    return await response.json();
  } catch (error) {
    console.error("Error searching users via API:", error);
    return [];
  }
};

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  control,
  errors,
  setValue,
  getValues,
  nextExecution,
  deliveryOptions = deliveryOptionsConfig,
}) => {
  const isScheduled = useWatch({ control, name: "is_scheduled" });
  const frequency = useWatch({ control, name: "frequency" });
  const targetAllUsers = useWatch({ control, name: "target_all_users" });
  const selectedUsersRaw = useWatch({ control, name: "target_user_ids" });

  const selectedUsers = useMemo(
    () => selectedUsersRaw || [],
    [selectedUsersRaw]
  );

  // State for user search
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  let summaryText = "Not scheduled to run again.";
  if (nextExecution) {
    const relativeTime = formatDistanceToNow(nextExecution, {
      addSuffix: true,
    });
    summaryText = `Next run: ${relativeTime}`;
  }

  const debouncedUserSearch = useCallback(
    async (query: string) => {
      if (query.length > 1) {
        setIsSearchingUsers(true);
        const excludeIds = selectedUsers.map((u: User) => u.user_catalog_id);
        const results = await searchUsersAPI(query, excludeIds);
        setFoundUsers(results);
        setIsSearchingUsers(false);
      } else {
        setFoundUsers([]);
      }
    },
    [selectedUsers]
  );

  // Reset schedule fields when scheduling is disabled
  useEffect(() => {
    if (!isScheduled) {
      // Reset schedule-specific fields to avoid validation issues
      setValue("frequency", "daily");
      setValue("schedule_time", "09:00");
      setValue("timezone", "UTC");
      setValue("start_date", "");
      setValue("end_date", "");
      setValue("selected_weekdays", []);
      setValue("day_of_month", 1);
      setValue("start_month", 1);
      setValue("end_month", 12);
      setValue("selected_year", new Date().getFullYear());
      setValue("selected_month", 1);
      setValue("selected_day", 1);
      setValue("specific_dates", []);
      setValue("delivery_options", {});
      setValue("target_all_users", true);
      setValue("target_user_ids", []);
    }
  }, [isScheduled, setValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedUserSearch(userSearchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [userSearchQuery, debouncedUserSearch]);

  const handleUserSelect = (user: User) => {
    const currentUsers = getValues("target_user_ids") || [];
    setValue("target_user_ids", [...currentUsers, user]);
    setUserSearchQuery("");
    setFoundUsers([]);
  };

  const handleUserRemove = (userId: number) => {
    const currentUsers = getValues("target_user_ids") || [];
    setValue(
      "target_user_ids",
      currentUsers.filter((u: User) => u.user_catalog_id !== userId)
    );
  };

  if (!isScheduled) {
    return (
      <FormField
        control={control}
        name="is_scheduled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center mt-6 border-t border-border pt-6 space-x-3 space-y-0">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            <FormLabel
              className="cursor-pointer"
              onClick={() => field.onChange(!field.value)}
            >
              Scheduled Execution
            </FormLabel>
          </FormItem>
        )}
      />
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Schedule Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="is_scheduled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FormLabel
                className="cursor-pointer"
                onClick={() => field.onChange(!field.value)}
              >
                Enable Scheduled Execution
              </FormLabel>
            </FormItem>
          )}
        />

        {/* Frequency */}
        <FormField
          control={control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <div className="flex flex-wrap gap-2">
                {frequencies.map((f) => (
                  <Button
                    key={f}
                    type="button"
                    variant={field.value === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => field.onChange(f)}
                    className="capitalize"
                  >
                    {f.replace("_", " ")}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time Input (not for hourly) */}
        {frequency !== "hourly" && (
          <FormField
            control={control}
            name="schedule_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Execution Time (HH:MM)</FormLabel>
                <Input {...field} placeholder="09:00" maxLength={5} />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Start/End Date Pickers */}
        {(frequency === "daily" || frequency === "hourly") && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <br />
                  <input
                    className="border w-full p-2.5 rounded-lg"
                    type="date"
                    {...field}
                  />
                  {/* <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? format(new Date(field.value), "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date?.toISOString().split("T")[0])
                        }
                        initialFocus
                      />
                      <input type="date" {...field} />
                    </PopoverContent>
                  </Popover> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <br />
                  <input
                    className="border w-full p-2.5 rounded-lg"
                    type="date"
                    {...field}
                  />
                  {/* <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? format(new Date(field.value), "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date?.toISOString().split("T")[0])
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover> */}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Weekly Selection */}
        {frequency === "weekly" && (
          <FormField
            control={control}
            name="selected_weekdays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Days of the Week</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {weekdays.map((day) => {
                    const isSelected = field.value?.includes(day);
                    return (
                      <Button
                        key={day}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = isSelected
                            ? field.value?.filter((d: string) => d !== day)
                            : [...(field.value || []), day];
                          field.onChange(newValue);
                        }}
                        className="capitalize"
                      >
                        {day}
                      </Button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Monthly Selection */}
        {frequency === "monthly" && (
          <div className="space-y-4">
            <FormField
              control={control}
              name="day_of_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Month</FormLabel>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={field.value?.toString() || ""}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 1)
                    }
                    placeholder="1-31"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="start_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Month</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={field.value?.toString() || ""}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 1)
                      }
                      placeholder="1-12"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="end_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Month</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={field.value?.toString() || ""}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 1)
                      }
                      placeholder="1-12"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Yearly Selection */}
        {frequency === "yearly" && (
          <div className="space-y-4">
            <FormField
              control={control}
              name="selected_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <Input
                    type="number"
                    value={field.value?.toString() || ""}
                    onChange={(e) =>
                      field.onChange(
                        parseInt(e.target.value, 10) || new Date().getFullYear()
                      )
                    }
                    placeholder="e.g., 2025"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="selected_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={field.value?.toString() || ""}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 1)
                      }
                      placeholder="1-12"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="selected_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={field.value?.toString() || ""}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 1)
                      }
                      placeholder="1-31"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Specific Dates */}
        {frequency === "specific_dates" && (
          <FormField
            control={control}
            name="specific_dates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specific Dates</FormLabel>
                <div className="flex gap-2">
                  <input
                    className="border w-full p-2.5 rounded-lg"
                    type="date"
                    id="specific-date-input"
                    placeholder="Select a date"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById(
                        "specific-date-input"
                      ) as HTMLInputElement;
                      if (input?.value) {
                        const newDates = [...(field.value || []), input.value];
                        field.onChange(newDates);
                        input.value = "";
                      }
                    }}
                  >
                    Add Date
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value?.map((date: string, index: number) => (
                    <div
                      key={index}
                      className="bg-muted p-2 rounded text-sm flex items-center gap-2"
                    >
                      {format(new Date(date), "PPP")}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newDates = field.value?.filter(
                            (_: string, i: number) => i !== index
                          );
                          field.onChange(newDates);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Timezone */}
        <FormField
          control={control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <div className="flex flex-wrap gap-2">
                {commonTimezones.map((tz) => (
                  <Button
                    key={tz}
                    type="button"
                    variant={field.value === tz ? "default" : "outline"}
                    size="sm"
                    onClick={() => field.onChange(tz)}
                  >
                    {tz.split("/")[1]?.replace("_", " ") || tz}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Summary */}
        <div className="flex items-center bg-muted rounded-full px-3 py-1.5 w-fit">
          <Clock className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-sm font-medium text-muted-foreground">
            {summaryText}
          </span>
        </div>

        {/* Delivery Options */}
        <FormField
          control={control}
          name="delivery_options"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Delivery Options</FormLabel>
              <div className="space-y-3">
                {deliveryOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={!!field.value?.[option.id]}
                      onCheckedChange={(checked) =>
                        field.onChange({ ...field.value, [option.id]: checked })
                      }
                    />
                    <Label
                      className="cursor-pointer"
                      onClick={() => {
                        field.onChange({
                          ...field.value,
                          [option.id]: !field.value?.[option.id],
                        });
                      }}
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* User Targeting */}
        <div className="space-y-4">
          <Label className="font-semibold text-lg">Select Users</Label>
          <FormField
            control={control}
            name="target_all_users"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FormLabel
                  className="cursor-pointer"
                  onClick={() => field.onChange(!field.value)}
                >
                  Send to All Users
                </FormLabel>
              </FormItem>
            )}
          />

          {!targetAllUsers && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {isSearchingUsers && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>

              {foundUsers.length > 0 && (
                <Card className="max-h-40 overflow-y-auto">
                  <CardContent className="p-0">
                    {foundUsers.map((user) => (
                      <button
                        key={user.user_catalog_id}
                        onClick={() => handleUserSelect(user)}
                        className="w-full p-3 border-b border-border hover:bg-muted text-left"
                      >
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.user_email}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}

              <div>
                <div className="text-muted-foreground mb-2">
                  Selected Users ({selectedUsers.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user: User) => (
                    <div
                      key={user.user_catalog_id}
                      className="flex items-center bg-secondary rounded-full pl-3 pr-2 py-1.5"
                    >
                      <User className="h-3 w-3 text-secondary-foreground mr-2" />
                      <span className="text-secondary-foreground text-sm font-medium">
                        {user.first_name} {user.last_name}
                      </span>
                      <button
                        onClick={() => handleUserRemove(user.user_catalog_id)}
                        className="ml-2 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3 text-secondary-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
