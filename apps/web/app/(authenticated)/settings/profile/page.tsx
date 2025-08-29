"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/supabase-provider";
import { postgrest } from "@/lib/postgrest";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateProfileSettings } from "../lib/actions";

const Profile = () => {
  const { userCatalog } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const profileSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    user_email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"),
    account_status: z.enum(["active", "inactive"]),
    business_name: z.string().optional(),
    address_1: z.string().optional(),
    address_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postcode: z.string().optional(),
    country: z.string().optional(),
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema as any),
    defaultValues: {
      first_name: userCatalog?.first_name || "",
      last_name: userCatalog?.last_name || "",
      user_email: userCatalog?.user_email || "",
      account_status:
        (userCatalog?.status as "active" | "inactive") || "active",
      business_name: userCatalog?.business_name || "",
      address_1: userCatalog?.business_address_1 || "",
      address_2: userCatalog?.business_address_2 || "",
      city: userCatalog?.business_city || "",
      state: userCatalog?.business_state || "",
      postcode: userCatalog?.business_postcode || "",
      country: userCatalog?.business_country || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!userCatalog) return;
    setIsLoading(true);
    try {
      await updateProfileSettings(data, userCatalog?.user_catalog_id);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error("Failed to update profile", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] py-5 mx-auto pb-10 ">
      <div className="flex items-center justify-center flex-col">
        <div className="bg-accent w-10 h-10 text-center p-2.5 rounded-full">
          <p>{userCatalog?.first_name?.[0].toUpperCase()}</p>
        </div>
        <p className="font-semibold text-2xl">
          {userCatalog?.first_name} {userCatalog?.last_name}
        </p>
        <p>{userCatalog?.user_mobile}</p>
        {userCatalog?.roles_json?.length ? (
          <div className="flex items-center space-x-2 pt-2">
            Roles:
            {userCatalog.roles_json.map((role: string) => (
              <span key={role} className=" px-2 py-1 text-sm">
                {role}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="space-y-5 pt-5">
        <Card>
          <CardHeader className="p-5">
            <h1 className="font-semibold text-2xl">Personal Information</h1>
            <p className="text-gray-400">Update your profile details here</p>
          </CardHeader>
          <CardContent className="p-5">
            <Form {...form}>
              <FormField
                name="first_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="last_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="user_email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <Input disabled {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="account_status"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Status</FormLabel>
                    <Input disabled {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-5">
            <h1 className="font-semibold text-2xl">Business Information</h1>
            <p className="text-gray-400">
              Manage your business and address details
            </p>
          </CardHeader>
          <CardContent className="p-5">
            <Form {...form}>
              <FormField
                name="business_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="address_1"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="address_2"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  name="city"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Input {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="state"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Province</FormLabel>
                      <Input {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  name="postcode"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode / ZIP</FormLabel>
                      <Input {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="country"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Input {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>
        <div className="pt-5 pb-10">
          <Button
            className="w-full"
            onClick={form.handleSubmit(onSubmit)}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
