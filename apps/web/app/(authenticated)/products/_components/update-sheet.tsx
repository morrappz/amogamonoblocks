"use client";

import { type Product, productStatuses, publishStatuses } from "../type";
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
import { getProductGroups } from "../_lib/queries";
interface UpdateRecordSheetProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  record: Product | null;
  isNew?: boolean;
  productGroups?: Awaited<ReturnType<typeof getProductGroups>>;
}

export function UpdateRecordSheet({
  record,
  isNew = false,
  productGroups,
  ...props
}: UpdateRecordSheetProps) {
  const [isUpdatePending, startUpdateTransition] = React.useTransition();
  const [file, setFile] = React.useState<File>();

  const form = useForm<UpdateProductSchema>({
    resolver: zodResolver(updateProductSchema),
  });

  const productGroup = productGroups?.filter(
    (productGroup) => productGroup.data_group_type === "Product Group"
  );

  const productCategory = productGroups?.filter(
    (productCategory) => productCategory.data_group_type === "Product Category"
  );

  const formattedDate = (date: string | undefined | null) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    return parsedDate.toISOString().split("T")[0];
  };

  React.useEffect(() => {
    form.reset({
      product_name: record?.product_name || "",
      product_code: record?.product_code || "",
      product_short_description: record?.product_short_description || "",
      product_start_date: formattedDate(record?.product_start_date) || "",
      product_end_date: formattedDate(record?.product_end_date) || "",
      product_publish_date: formattedDate(record?.product_publish_date) || "",
      product_publish_status:
        record?.product_publish_status || publishStatuses[0],
      product_group: record?.product_group || "",
      product_category: record?.product_category || "",
      uom: record?.uom || "",
      manage_stock: record?.manage_stock || false,
      hsn_number: record?.hsn_number || "",
      product_number: record?.product_number || "",
      price: record?.price || null,
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
    fieldName: keyof (typeof updateProductSchema)["shape"]
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
            {isNew ? "Create Product" : "Update Product"}
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? "Enter details to create a new Product."
              : "Update the Product details and save the changes."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="product_name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Product Name{" "}
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
              name="product_code"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Product Code </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
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
                    <span>Short Description </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_start_date"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>ProductStart Date </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_end_date"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Product End Date </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_publish_date"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Product Publish Date </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_publish_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select a publish status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {publishStatuses.map((item) => (
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
            <FormField
              control={form.control}
              name="product_group"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Product Group{" "}
                      {isFieldRequired(field.name) && (
                        <span className="text-red-500">*</span>
                      )}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select a Product Group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {productGroup?.map((productGroup) => (
                            <SelectItem
                              key={productGroup.data_group_id}
                              value={productGroup.data_group_name || ""}
                            >
                              {productGroup.data_group_name}
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
            <FormField
              control={form.control}
              name="product_category"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Product Category{" "}
                      {isFieldRequired(field.name) && (
                        <span className="text-red-500">*</span>
                      )}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select a Product Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {productCategory?.map((productCategory) => (
                            <SelectItem
                              key={productCategory.data_group_id}
                              value={productCategory?.data_group_name || ""}
                            >
                              {productCategory.data_group_name}
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

            <FormField
              control={form.control}
              name="uom"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      UOM{" "}
                      {isFieldRequired(field.name) && (
                        <span className="text-red-500">*</span>
                      )}{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manage_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manage Stocks</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "Yes");
                    }}
                    value={field.value ? "Yes" : "No"}
                  >
                    <FormControl>
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select a manage stocks" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {["Yes", "No"].map((item) => (
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
            <FormField
              control={form.control}
              name="hsn_number"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>HSN No </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
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
                    <span>Product Number </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
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
                    <span> Price </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="resize-none"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(Number(value) || 0); // Convert to number on change
                      }}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Upload Product Picture</FormLabel>
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
