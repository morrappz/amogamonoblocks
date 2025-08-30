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
import { postgrest } from "@/lib/postgrest";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateProfileSettings, getUserProfileData } from "../lib/actions";
import { useSession } from "next-auth/react";

const Profile = () => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [profileData, setProfileData] = React.useState<any>(null);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const isSessionLoading = status === "loading";

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
      first_name: "",
      last_name: "",
      user_email: "",
      account_status: "active",
      business_name: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
    },
  });

  // Fetch user data from user_catalog table
  React.useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.user_catalog_id) {
        setIsDataLoading(true);
        try {
          const result = await getUserProfileData(session.user.user_catalog_id);
          if (result.success && result.data) {
            setProfileData(result.data);
            form.reset({
              first_name: result.data.first_name || "",
              last_name: result.data.last_name || "",
              user_email: result.data.user_email || "",
              account_status: result.data.account_status || "active",
              business_name: result.data.business_name || "",
              address_1: result.data.address_1 || "",
              address_2: result.data.address_2 || "",
              city: result.data.city || "",
              state: result.data.state || "",
              postcode: result.data.postcode || "",
              country: result.data.country || "",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load profile data");
        } finally {
          setIsDataLoading(false);
        }
      }
    };

    if (!isSessionLoading) {
      fetchUserData();
    }
  }, [session, isSessionLoading, form]);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!session?.user) {
      toast.error("Session not available. Please try again.");
      return;
    }
    setIsLoading(true);
    try {
      await updateProfileSettings(data, session?.user.user_catalog_id);
      toast.success("Profile updated successfully");

      // Refresh the profile data after successful update
      const result = await getUserProfileData(session.user.user_catalog_id);
      if (result.success && result.data) {
        setProfileData(result.data);
      }
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
        {isSessionLoading || isDataLoading ? (
          <div className="space-y-2 text-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-auto"></div>
          </div>
        ) : profileData ? (
          <>
            <div className="bg-accent w-10 h-10 text-center p-2.5 rounded-full">
              <p>{profileData.first_name?.[0]?.toUpperCase()}</p>
            </div>
            <p className="font-semibold text-2xl">
              {profileData.first_name} {profileData.last_name}
            </p>
            <p>{profileData.user_mobile}</p>
            {profileData.roles_json?.length ? (
              <div className="flex items-center space-x-2 pt-2">
                Roles:
                {profileData.roles_json.map((role: string) => (
                  <span key={role} className=" px-2 py-1 text-sm">
                    {role}
                  </span>
                ))}
              </div>
            ) : null}
          </>
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
            disabled={
              isLoading || isSessionLoading || isDataLoading || !session?.user
            }
          >
            {isLoading
              ? "Saving Changes..."
              : isSessionLoading || isDataLoading
                ? "Loading..."
                : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
