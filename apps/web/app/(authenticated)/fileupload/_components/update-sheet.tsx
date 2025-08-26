"use client";

import { type FileUpload, FileUploadStatuses } from "../type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { updateRecord, createRecord } from "../_lib/actions";
import {
  type UpdateFileUploadSchema,
  updateFileUploadSchema,
} from "../_lib/validations";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ZodNullable, ZodOptional } from "zod";

interface UpdateRecordSheetProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  record: FileUpload | null;
  isNew?: boolean;
}

export function UpdateRecordSheet({
  record,
  isNew = false,
  ...props
}: UpdateRecordSheetProps) {
  const [isUpdatePending, startUpdateTransition] = React.useTransition();
  const [file, setFile] = React.useState<File>();

  const form = useForm<UpdateFileUploadSchema>({
    resolver: zodResolver(updateFileUploadSchema),
  });

  React.useEffect(() => {
    const schemaKeys = Object.keys(updateFileUploadSchema.shape);

    const sanitizedRecord = Object.fromEntries(
      Object.entries(record || {})
        .filter(([key]) => schemaKeys.includes(key))
        .map(([key, value]) => [key, value ?? ""])
    );

    form.reset({
      ...sanitizedRecord,
      status: record?.status || FileUploadStatuses[0],
    });
  }, [record, form, isNew]);

  function onSubmit(input: UpdateFileUploadSchema) {
    startUpdateTransition(async () => {
      let response;
      if (isNew) {
        response = await createRecord({ ...input, file });
      } else {
        if (!record) return;
        response = await updateRecord({
          id: record.file_upload_id,
          ...input,
          file,
        });
      }

      if (response.error) {
        toast.error(response.error);
        return;
      }

      form.reset();
      props.onOpenChange?.(false);
      toast.success(isNew ? "Record created" : "Record updated");
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
    }
  }

  function isViewable(url?: string) {
    return true;
    return url?.match(/\.(jpeg|jpg|png|gif|pdf)$/i);
  }

  function isFieldRequired(
    fieldName: keyof (typeof updateFileUploadSchema)["shape"]
  ) {
    const fieldSchema = updateFileUploadSchema.shape[fieldName];
    // If the field is wrapped in ZodOptional or ZodNullable, it's not required.
    return !(
      fieldSchema instanceof ZodOptional || fieldSchema instanceof ZodNullable
    );
  }

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Create File Upload" : "Update File Upload"}
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? "Enter details to create a new File Upload."
              : "Update the File Upload details and save the changes."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="file_name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      File Name{" "}
                      {isFieldRequired(field.name) && (
                        <span className="text-red-500">*</span>
                      )}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file_description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Description{" "}
                      {isFieldRequired(field.name) && (
                        <span className="text-red-500">*</span>
                      )}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Upload File</FormLabel>
              <FormControl>
                <Input type="file" onChange={handleFileChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {FileUploadStatuses.map((item) => (
                          <SelectItem
                            key={item}
                            value={item}
                            className="capitalize"
                          >
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {record?.file_publish_url &&
              isViewable(record?.file_publish_url) && (
                <Button variant="outline" asChild className="mt-2">
                  <a
                    href={record.file_publish_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="mr-2" /> View File
                  </a>
                </Button>
              )}

            <DialogFooter className="gap-2 pt-2 sm:space-x-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={isUpdatePending}>
                {isUpdatePending && (
                  <Loader
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
