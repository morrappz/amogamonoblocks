"use client";

import { type FinalBom, finalBomStatuses } from "../type";
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
  type UpdateFinalBomSchema,
  updateFinalBomSchema,
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
import models from '@/data/model.json';
import variants from '@/data/variant.json';
import frames from '@/data/frame.json';
import engines from '@/data/engine.json';
import missions from '@/data/mission.json';
import { ZodNullable, ZodOptional } from "zod";

interface UpdateRecordSheetProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  record: FinalBom | null;
  isNew?: boolean;
}

export function UpdateRecordSheet({
  record,
  isNew = false,
  ...props
}: UpdateRecordSheetProps) {
  const [isUpdatePending, startUpdateTransition] = React.useTransition();
  
  const form = useForm<UpdateFinalBomSchema>({
    resolver: zodResolver(updateFinalBomSchema),
  });

  React.useEffect(() => {
      form.reset({
        bom_type: record?.bom_type || "",
        bom_name: record?.bom_name || "",
        bom_code: record?.bom_code || "",
        bom_description: record?.bom_description || "",
        model: record?.model || "",
        variant: record?.variant || "",
        frame: record?.frame || "",
        engine: record?.engine || "",
        mission: record?.mission || "",
        status: record?.status || finalBomStatuses[0],
      });
  }, [record, form]);

  function onSubmit(input: UpdateFinalBomSchema) {
    startUpdateTransition(async () => {
      let response;
      if (isNew) {
        response = await createRecord({ ...input });
      } else {
        if (!record) return;
        response = await updateRecord({
          id: record.final_bom_id,
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
    fieldName: keyof typeof updateFinalBomSchema["shape"]
  ) {
    const fieldSchema = updateFinalBomSchema.shape[fieldName];
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
            {isNew ? "Create Final BOM" : "Update Final BOM"}
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? "Enter details to create a new Final BOM."
              : "Update the Final BOM details and save the changes."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="bom_type"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      BOM Type{" "}
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
              name="bom_name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      BOM Name{" "}
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
              name="bom_code"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      BOM Code{" "}
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
              name="bom_description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Description{" "}
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
              name="model"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Model{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select a Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {models.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
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
              name="variant"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Variant{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select a Variant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {variants.map((variant) => (
                            <SelectItem key={variant.value} value={variant.value}>
                              {variant.label}
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
              name="frame"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Frame{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select a Frame" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {frames.map((frame) => (
                            <SelectItem key={frame.value} value={frame.value}>
                              {frame.label}
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
              name="engine"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Engine{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select an Engine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {engines.map((engine) => (
                            <SelectItem key={engine.value} value={engine.value}>
                              {engine.label}
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
              name="mission"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>
                      Mission{" "}
                    </span>
                    {fieldState.error && <FormMessage />}
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger className="capitalize">
                        <SelectValue placeholder="Select a Mission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {missions.map((mission) => (
                            <SelectItem key={mission.value} value={mission.value}>
                              {mission.label}
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
                        {finalBomStatuses.map((item) => (
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
