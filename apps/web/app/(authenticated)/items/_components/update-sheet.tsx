"use client";

import { type Product, productStatuses } from "../type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
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
import { updateRecord, createRecord } from "../_lib/actions";
import {
  type UpdateProductSchema,
  updateProductSchema,
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
  record: Product | null;
  isNew?: boolean;
}

export function UpdateRecordSheet({
  record,
  isNew = false,
  ...props
}: UpdateRecordSheetProps) {
  const [isUpdatePending, startUpdateTransition] = React.useTransition();
  const [file, setFile] = React.useState<File>();
  
  const form = useForm<UpdateProductSchema>({
    resolver: zodResolver(updateProductSchema),
  });

  React.useEffect(() => {
      form.reset({
        product_title: record?.product_title || "",
        product_category: record?.product_category || "",
        product_number: record?.product_number || "",
        product_short_description: record?.product_short_description || "",
        uom: record?.uom || "",
        fifo_price: record?.fifo_price || 0,
        moving_average_price: record?.moving_average_price || 0,
        recent_purchase_price: record?.recent_purchase_price || 0,
        product_small_image_link: record?.product_small_image_link || "",
        status: record?.status || productStatuses[0],
      });
  }, [record, form]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
    }
  }
  function onSubmit(input: UpdateProductSchema) {
    startUpdateTransition(async () => {
      let response;
      if (isNew) {
        response = await createRecord({ ...input, file });
      } else {
        if (!record) return;
        response = await updateRecord({
          id: record.product_id,
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

  function isFieldRequired(
    fieldName: keyof typeof updateProductSchema["shape"]
  ) {
    const fieldSchema = updateProductSchema.shape[fieldName];
    // If the field is wrapped in ZodOptional or ZodNullable, it's not required.
    return !(
      fieldSchema instanceof ZodOptional || fieldSchema instanceof ZodNullable
    );
  }

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-ld max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Create Item" : "Update Item"}
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? "Enter details to create a new Item."
              : "Update the Item details and save the changes."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="product_title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Item Title{" "}
                      {isFieldRequired(field.name) && (
                        <span className="text-red-500">*</span>
                      )}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input className="resize-none" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_category"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Item Category{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input className="resize-none" {...field} value={field.value ?? ""}/>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_number"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                    Item Number{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input className="resize-none" {...field} value={field.value ?? ""}/>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_short_description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                    Item description{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input className="resize-none" {...field} value={field.value ?? ""}/>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uom"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      UOM{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input className="resize-none" {...field} value={field.value ?? ""}/>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fifo_price"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Fifo Price{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input type="number" 
                      className="resize-none" {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(Number(value) || 0); // Convert to number on change
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="moving_average_price"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Average Price{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input type="number" 
                      className="resize-none" {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(Number(value) || 0); // Convert to number on change
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recent_purchase_price"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Last Purchase Price{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input type="number" 
                      className="resize-none" {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(Number(value) || 0); // Convert to number on change
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />            
            <FormItem>
              <FormLabel>Upload Item Picture</FormLabel>
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
                        {productStatuses.map((item) => (
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
