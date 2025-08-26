"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { startTransition, useActionState, useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { register, RegisterActionState } from "../actions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
// import { updateShopifySessionBusinessNumber } from "@/lib/updateShopifySessionBusinessNumber";

const formSchema = z
  .object({
    first_name: z.string().min(1, { message: "First name is required" }),
    last_name: z.string().min(1, { message: "Last name is required" }),
    user_email: z
      .string()
      .min(1, { message: "Please enter your email" })
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(1, {
        message: "Please enter your password",
      })
      .min(7, {
        message: "Password must be at least 7 characters long",
      }),
    confirmPassword: z.string(),
    user_name: z
      .string()
      .min(1, {
        message: "Please enter your username",
      })
      .min(5, {
        message: "Username must be at least 5 characters long",
      }),
    user_mobile: z
      .string()
      .min(1, { message: "Mobile number is required" })
      .regex(/^[+]?\d{10,15}$/, { message: "Invalid mobile number format" }),
    for_business_name: z
      .string()
      .min(1, { message: "Business name is required" }),
    for_business_number: z
      .string()
      .min(1, { message: "Business number is required" })
      .regex(/^\d+$/, { message: "Business number must be numeric" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export default function StoreOnboardRegister() {
  const [isLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const shop = searchParams.get("shop");

  const [state, formAction, pending] = useActionState<
    RegisterActionState,
    z.infer<typeof formSchema>
  >(register, {
    status: "idle",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      user_email: "",
      user_name: "",
      password: "",
      confirmPassword: "",
      user_mobile: "",
      for_business_name: "",
      for_business_number: "",
    },
  });

  useEffect(() => {
    if (pending || !state?.status) return;
    if (state?.status === "user_exists") {
      toast.error("Account already exists");
    } else if (state?.status === "failed") {
      if (state?.message) toast.error(state?.message);
      else toast.error("Failed to create account");
    } else if (state?.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state?.status === "success") {
      toast.success("Account created successfully");
      router.push(`/api/shopify/setup-finalization?shop=${shop}`);
    }
  }, [state, pending, router, shop, form]);

  return (
    <Card className="p-6 max-w-md mx-auto mt-10">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Register for Store</h1>
        <p className="mb-2">
          Register a new account for the store:{" "}
          <span className="font-semibold">{shop}</span>
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) =>
            startTransition(() => formAction(v))
          )}
          className="flex flex-col gap-4 w-full max-w-sm mt-4"
        >
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
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
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="user_email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="user_name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
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
                  <Input placeholder="+1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="for_business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Business Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="for_business_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Number</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            disabled={isLoading || pending}
          >
            Register
          </Button>
        </form>
      </Form>
    </Card>
  );
}
