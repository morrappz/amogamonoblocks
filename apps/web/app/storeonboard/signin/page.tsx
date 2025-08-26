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
import { Loader2 } from "lucide-react";
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

export default function StoreOnboardSignin() {
  const [isLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const shop = searchParams.get("shop");

  const [state, formAction, pending] = useActionState<
    LoginActionState,
    { email: string; password: string }
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
      toast.success("Login successful!");
      // Redirect to the store dashboard or home page after successful login
      router.push(`/api/shopify/setup-finalization?shop=${shop}`);
    }
  }, [state, pending, router, shop, form]);

  return (
    <Card className="p-6 max-w-md mx-auto mt-10">
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-2xl font-bold mb-2">Store Setup Required</h1>
        <p className="mb-2">
          You are connecting the store:{" "}
          <span className="font-semibold">{shop}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Please sign in or register to complete your store setup.
        </p>
      </div>
      <div className="grid gap-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) =>
              startTransition(() => formAction(v))
            )}
          >
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="email"
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
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="#"
                        className="text-sm font-medium text-muted-foreground hover:opacity-75"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <PasswordInput placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="mt-2 w-full" disabled={isLoading || pending}>
                Login
                {pending && <Loader2 className="animate-spin ml-2" />}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                You want create new account?{" "}
                <Link
                  href={"/storeonboard/register?shop=" + shop}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign Up
                </Link>
              </p>
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
