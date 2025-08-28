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
import Link from "next/link";
import { Github, Facebook } from "lucide-react";
import { register, RegisterActionState } from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/supabase-provider";

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
      .regex(/^\+?[0-9]\d{9,14}$/, { message: "Invalid mobile number format" }), // Supports E.164 format (international numbers)
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

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  // const [state, formAction, pending] = useActionState<
  //   RegisterActionState,
  //   z.infer<typeof formSchema>
  // >(onSubmit, {
  //   status: "idle",
  // });

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

  const handleSignUp = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const result = await signUp(data.user_email, data.password);

      if (
        result &&
        typeof result === "object" &&
        "user" in result &&
        result.user
      ) {
        console.log("loged in");
      } else {
        toast.error("Invalid credentials");
      }
      // form.reset();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-2 flex flex-col space-y-2 text-left">
        <h1 className="text-lg font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to create an account. <br />
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign In
          </Link>
        </p>
      </div>
      <div className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignUp)}>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="first_name">First Name</FormLabel>
                    <FormControl>
                      <Input id="first_name" placeholder="John" {...field} />
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
                    <FormLabel htmlFor="last_name">Last Name</FormLabel>
                    <FormControl>
                      <Input id="last_name" placeholder="Doe" {...field} />
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
                    <FormLabel htmlFor="user_email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="user_email"
                        placeholder="name@example.com"
                        {...field}
                      />
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
                    <FormLabel htmlFor="user_name">Username</FormLabel>
                    <FormControl>
                      <Input id="user_name" placeholder="" {...field} />
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
                    <FormLabel htmlFor="user_mobile">Mobile</FormLabel>
                    <FormControl>
                      <Input
                        id="user_mobile"
                        placeholder="+1234567890"
                        {...field}
                      />
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
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        id="password"
                        placeholder="********"
                        {...field}
                      />
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
                    <FormLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        id="confirmPassword"
                        placeholder="********"
                        {...field}
                      />
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
                    <FormLabel htmlFor="for_business_name">
                      Business Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="for_business_name"
                        placeholder="Business Inc."
                        {...field}
                      />
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
                    <FormLabel htmlFor="for_business_number">
                      Business Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="for_business_number"
                        placeholder="1234567890"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="mt-2" disabled={isLoading}>
                Create Account
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  disabled={isLoading}
                >
                  <Github className="h-4 w-4" /> GitHub
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  disabled={isLoading}
                >
                  <Facebook className="h-4 w-4" /> Facebook
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
      <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
        By creating an account, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </p>
    </Card>
  );
}
