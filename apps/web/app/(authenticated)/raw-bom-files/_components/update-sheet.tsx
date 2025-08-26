"use client";

import { type MyDoc, myDocStatuses } from "../type";
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
import { type UpdateMyDocSchema, updateMyDocSchema } from "../_lib/validations";
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
  record: MyDoc | null;
  isNew?: boolean;
}

export function UpdateRecordSheet({
  record,
  isNew = false,
  ...props
}: UpdateRecordSheetProps) {
  const [isUpdatePending, startUpdateTransition] = React.useTransition();
  const [file, setFile] = React.useState<File>();

  const form = useForm<UpdateMyDocSchema>({
    resolver: zodResolver(updateMyDocSchema),
  });

  React.useEffect(() => {
    form.reset({
      doc_name: record?.doc_name || "",
      status: record?.status || myDocStatuses[0],
    });
  }, [record, form]);

  function onSubmit(input: UpdateMyDocSchema) {
    startUpdateTransition(async () => {
      let response;
      if (isNew) {
        response = await createRecord({ ...input, file });
      } else {
        if (!record) return;
        response = await updateRecord({ id: record.mydoc_id, ...input, file });
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

  function isFieldRequired(fieldName: keyof typeof updateMyDocSchema["shape"]) {
    const fieldSchema = updateMyDocSchema.shape[fieldName];
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
            {isNew ? "Create Raw BOM File" : "Update Raw BOM File"}
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? "Enter details to create a new Raw BOM File."
              : "Update the Raw BOM File details and save the changes."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="doc_name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Title{" "}
                      {isFieldRequired(field.name) && (
                        <span className="text-red-500">*</span>
                      )}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="title..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>  
                </FormItem>
              )}
            />
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
                        {myDocStatuses.map((item) => (
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
            <FormItem>
              <FormLabel>Upload File</FormLabel>
              <FormControl>
                <Input type="file" onChange={handleFileChange} />
              </FormControl>
              <FormMessage />
            </FormItem>

            {record?.shareurl && isViewable(record?.shareurl) && (
              <Button variant="outline" asChild className="mt-2">
                <a
                  href={record.shareurl}
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
