"use client";

import { type Contact, contactStatuses } from "../type";
import { Loader } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UpdateRecordSheetProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  record: Contact | null;
  isNew?: boolean;
  onUpdate: (updated: Contact) => void;
  onCreate: (created: Contact) => void;
}

export function UpdateRecordSheet({
  record,
  isNew = false,
  onUpdate,
  onCreate,
  ...props
}: UpdateRecordSheetProps) {
  const [isUpdatePending, setIsUpdatePending] = React.useState(false);
  const form = useForm({
    defaultValues: {
      first_name: record?.first_name || "",
      last_name: record?.last_name || "",
      user_email: record?.user_email || "",
      user_mobile: record?.user_mobile || "",
      status: record?.status || contactStatuses[0],
      created_datetime: record?.created_datetime || new Date().toISOString(),
    },
  });

  function onSubmit(input: Partial<Contact>) {
    setIsUpdatePending(true);
    if (isNew) {
      onCreate({ ...input, user_catalog_id: Date.now() } as Contact);
    } else {
      onUpdate({ ...record, ...input } as Contact);
    }
    setIsUpdatePending(false);
    props.onOpenChange?.(false);
  }

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? "Add Contact" : "Edit Contact"}</DialogTitle>
          <DialogDescription>
            {isNew ? "Create a new contact." : "Update the contact details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user_mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {contactStatuses.map((status: string) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isUpdatePending}>
                {isUpdatePending ? (
                  <Loader className="mr-2 size-4 animate-spin" />
                ) : null}
                {isNew ? "Create" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
