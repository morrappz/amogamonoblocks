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
import { Github, Facebook, Loader2 } from "lucide-react";
import { login, LoginActionState } from "../actions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
  email: z
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
});

export default function SignIn() {
  const [isLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [state, formAction, pending] = useActionState<
    LoginActionState,
    { email: string; password: string; callbackUrl?: string }
  >(login, {
    status: "idle",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (pending || !state?.status) return;
    if (state?.status === "failed") {
      toast.error("Invalid credentials!");
    } else if (state?.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state?.status === "success") {
      // Check if there's a callback URL to redirect to
      if (callbackUrl) {
        try {
          // Validate that the callback URL is safe (same origin or relative)
          const url = new URL(callbackUrl);
          if (url.origin === window.location.origin) {
            window.location.href = callbackUrl;
            return;
          }
        } catch {
          // If URL parsing fails, fall back to refresh
        }
      }
      router.refresh();
    }
  }, [state, pending, router, callbackUrl]);

  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password below <br />
          to log into your account
        </p>
      </div>
      <div className="grid gap-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) =>
              startTransition(() =>
                formAction({ ...v, callbackUrl: callbackUrl || undefined })
              )
            )}
          >
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
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
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex items-center justify-between">
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <Link
                        href="#"
                        className="text-sm font-medium text-muted-foreground hover:opacity-75"
                      >
                        Forgot password?
                      </Link>
                    </div>

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
              <Button className="mt-2" disabled={isLoading || pending}>
                Login
                {pending && <Loader2 className="animate-spin" />}
              </Button>
              <p className="text-sm text-muted-foreground">
                You want create new account?{" "}
                <Link
                  href="/sign-up"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign Up
                </Link>
              </p>
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
        By clicking login, you agree to our{" "}
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
