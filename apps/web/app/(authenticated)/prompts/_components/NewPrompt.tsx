"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { editPromptData, getPromptData, savePrompt } from "../lib/actions";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ScheduleForm } from "./ScheduleForm";

const NewPrompt = ({ id }: { id?: number }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const newPrompt = z
    .object({
      title: z.string().min(1, "Title must be 3 characters"),
      description: z.string().optional(),
      status: z.string().min(1, "Status is required"),
      remarks: z.string().optional(),
      is_scheduled: z.boolean(),
      // Schedule configuration fields
      frequency: z.string().optional(),
      schedule_time: z.string().optional(),
      timezone: z.string().optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      selected_weekdays: z.array(z.string()).optional(),
      day_of_month: z.number().optional(),
      start_month: z.number().optional(),
      end_month: z.number().optional(),
      selected_year: z.number().optional(),
      selected_month: z.number().optional(),
      selected_day: z.number().optional(),
      specific_dates: z.array(z.string()).optional(),
      delivery_options: z.record(z.boolean()).optional(),
      target_all_users: z.boolean().optional(),
      target_user_ids: z
        .array(
          z.object({
            user_catalog_id: z.number(),
            first_name: z.string(),
            last_name: z.string().nullable(),
            user_email: z.string().nullable(),
          })
        )
        .optional(),
    })
    .refine(
      (data) => {
        // If not scheduled, skip validation
        if (!data.is_scheduled) return true;

        // If scheduled, validate required fields based on frequency
        if (!data.frequency) return false;
        if (!data.timezone) return false;

        // Validate time for non-hourly frequencies
        if (data.frequency !== "hourly" && !data.schedule_time) return false;

        // Validate date ranges for daily/hourly
        if (data.frequency === "daily" || data.frequency === "hourly") {
          if (!data.start_date) return false;
        }

        // Validate weekdays for weekly
        if (
          data.frequency === "weekly" &&
          (!data.selected_weekdays || data.selected_weekdays.length === 0)
        )
          return false;

        // Validate monthly fields
        if (data.frequency === "monthly") {
          if (
            !data.day_of_month ||
            data.day_of_month < 1 ||
            data.day_of_month > 31
          )
            return false;
        }

        // Validate yearly fields
        if (data.frequency === "yearly") {
          if (!data.selected_year || !data.selected_month || !data.selected_day)
            return false;
        }

        // Validate specific dates
        if (
          data.frequency === "specific_dates" &&
          (!data.specific_dates || data.specific_dates.length === 0)
        )
          return false;

        return true;
      },
      {
        message: "Please fill in all required schedule fields",
        path: ["is_scheduled"],
      }
    );

  const form = useForm<z.infer<typeof newPrompt>>({
    resolver: zodResolver(newPrompt),
    defaultValues: {
      title: "",
      description: "",
      status: "active",
      remarks: "",
      is_scheduled: false,
      frequency: "daily",
      schedule_time: "09:00",
      timezone: "UTC",
      start_date: "",
      end_date: "",
      selected_weekdays: [],
      day_of_month: 1,
      start_month: 1,
      end_month: 12,
      selected_year: new Date().getFullYear(),
      selected_month: 1,
      selected_day: 1,
      specific_dates: [],
      delivery_options: {},
      target_all_users: true,
      target_user_ids: [],
    },
  });

  useEffect(() => {
    if (id) {
      const fetchPrompt = async () => {
        const response = await getPromptData(id);
        if (response) {
          const promptData = response?.data?.[0];
          form.setValue("title", promptData?.title || "");
          form.setValue("description", promptData?.description || "");
          form.setValue("status", promptData?.status || "active");
          form.setValue("remarks", promptData?.remarks || "");
          form.setValue("is_scheduled", promptData?.is_scheduled || false);

          // Set schedule configuration values if they exist
          if (promptData?.is_scheduled) {
            form.setValue("frequency", promptData?.frequency || "daily");
            form.setValue(
              "schedule_time",
              promptData?.schedule_time || "09:00"
            );
            form.setValue("timezone", promptData?.timezone || "UTC");
            form.setValue("start_date", promptData?.start_date || "");
            form.setValue("end_date", promptData?.end_date || "");
            form.setValue(
              "selected_weekdays",
              Array.isArray(promptData?.selected_weekdays)
                ? promptData.selected_weekdays
                : []
            );
            form.setValue("day_of_month", promptData?.day_of_month || 1);
            form.setValue("start_month", promptData?.start_month || 1);
            form.setValue("end_month", promptData?.end_month || 12);
            form.setValue(
              "selected_year",
              promptData?.selected_year || new Date().getFullYear()
            );
            form.setValue("selected_month", promptData?.selected_month || 1);
            form.setValue("selected_day", promptData?.selected_day || 1);
            form.setValue(
              "specific_dates",
              Array.isArray(promptData?.specific_dates)
                ? promptData.specific_dates
                : []
            );
            form.setValue(
              "delivery_options",
              promptData?.delivery_options || {}
            );
            form.setValue(
              "target_all_users",
              promptData?.target_all_users ?? true
            );
            form.setValue(
              "target_user_ids",
              Array.isArray(promptData?.target_user_ids)
                ? promptData.target_user_ids
                : []
            );
          }
        }
      };
      fetchPrompt();
    }
  }, [id, form]);

  const onSubmit = async (data: z.infer<typeof newPrompt>) => {
    setIsLoading(true);
    try {
      console.log("Form data being submitted:", data);

      // Validate the form data
      const validationResult = newPrompt.safeParse(data);
      if (!validationResult.success) {
        console.error("Validation errors:", validationResult.error.errors);
        toast.error("Please check the form for errors");
        return;
      }

      let response;
      if (id) {
        response = await editPromptData(id, data);
      } else {
        response = await savePrompt(data);
      }
      console.log("response----", response);
      if (response.success) {
        toast.success(
          id ? "Prompt updated successfully" : "Prompt created successfully"
        );
        if (!id) {
          form.reset();
        }
      } else {
        toast.error("There was an error saving the prompt");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("There was an error saving the prompt");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card>
        <CardContent className="p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              {id ? (
                <h1 className="text-2xl font-semibold">Edit Prompt</h1>
              ) : (
                <h1 className="text-2xl font-semibold">New Prompt</h1>
              )}
            </div>
            <Link href="/prompts">
              <Button variant={"outline"}>
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                Go Back
              </Button>
            </Link>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Prompt Text</FormLabel>
                    <Textarea {...field} className="min-w-[500px]" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="status"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      {...field}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                name="remarks"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <Textarea {...field} className="min-w-[500px]" />
                  </FormItem>
                )}
              />
              {/* <FormField
                name="is_scheduled"
                control={form.control}
                render={({ field }) => (
                  <FormItem className=" flex items-center gap-2.5">
                    <Checkbox
                      id="is_scheduled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel htmlFor="is_scheduled">
                      Schedule Execution
                    </FormLabel>
                  </FormItem>
                )}
              /> */}

              {/* Schedule Form Component */}
              <ScheduleForm
                control={form.control}
                errors={form.formState.errors}
                setValue={form.setValue}
                getValues={form.getValues}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end gap-2.5 w-full">
            <Button variant={"outline"}>Cancel</Button>
            {id ? (
              <Button
                disabled={isLoading}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <Button
                disabled={isLoading}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isLoading ? "Creating..." : "Create Prompt"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewPrompt;
