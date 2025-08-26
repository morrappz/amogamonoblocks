"use client";

import { type FinalBomItem, finalBomItemStatuses } from "../type";
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
  type UpdateFinalBomItemSchema,
  updateFinalBomItemSchema,
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
  record: FinalBomItem | null;
  isNew?: boolean;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function UpdateRecordSheet({
  record,
  isNew = false,
  searchParams,
  ...props
}: UpdateRecordSheetProps) {
  const [isUpdatePending, startUpdateTransition] = React.useTransition();
  const form = useForm<UpdateFinalBomItemSchema>({
    resolver: zodResolver(updateFinalBomItemSchema),
  });

  
  
  React.useEffect(() => {
      form.reset({
        type: record?.type || "",
        source: record?.source || "",
        nature: record?.nature || "",
        combination: record?.combination || "",
        c_part_no: record?.c_part_no || "",
        c_part_name: record?.c_part_name || "",
        qty: record?.qty || 0,
        uom: record?.uom || "",
        price: record?.price || 0,
        amount: record?.amount || 0,
        status: record?.status || finalBomItemStatuses[0],
      });
      
  }, [record, form]);

  function onSubmit(input: UpdateFinalBomItemSchema) {
    startUpdateTransition(async () => {
      let response;
      if (isNew) {
        response = await createRecord({ ...input }, searchParams?.final_bom_id);
      } else {
        if (!record) return;
        response = await updateRecord({
          id: record.final_bom_item_id,
          ...input
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
    fieldName: keyof typeof updateFinalBomItemSchema["shape"]
  ) {
    const fieldSchema = updateFinalBomItemSchema.shape[fieldName];
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
            {isNew ? "Create Final BOM Item" : "Update Final BOM Item"}
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? "Enter details to create a new Final BOM Item."
              : "Update the Final BOM item details and save the changes."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Type{" "}
                      {isFieldRequired(field.name) && (
                        <span className="text-red-500">*</span>
                      )}
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
              name="source"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Source{" "}
                      {isFieldRequired(field.name) && (
                        <span className="text-red-500">*</span>
                      )}
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
              name="nature"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Nature{" "}
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
              name="combination"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Combination{" "}
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
              name="c_part_no"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Part Number{" "}
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
              name="c_part_name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Part Name{" "}
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
              name="qty"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Quantity{" "}
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
              name="price"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Price{" "}
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
              name="amount"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Amount{" "}
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
                        {finalBomItemStatuses.map((item) => (
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
