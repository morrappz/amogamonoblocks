"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Github, Facebook, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


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
export default function ChatLoginForm() {
  const [isLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("chat-credentials", {
      redirect: false,
      email,
      password,
    });


    setLoading(false);

    if (res?.error) {
      toast.error("Invalid credentials. Please try again.");
    } else {
      setRedirecting(true);
      router.push("/langchain-chat/chat");
    }
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafb]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent mb-4"></div>
        <p className="text-sm text-gray-600">Redirecting to your chat...</p>
      </div>
    );
  }

  return (
    <Card className="p-6 flex items-center justify-center min-h-screen">
      <div className=" border border-gray-100 shadow-lg rounded-2xl p-8 w-full max-w-sm">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-center ">
          Welcome back
        </h1>
        <p className="text-sm  text-center mt-1 mb-6">
          Sign in to continue your conversations
        </p>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text font-medium text-sm mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition text-sm "
                  autoComplete="email"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block  font-medium text-sm"
                  >
                    Password
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-xs  hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  id="password"
                  required
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition text-sm placeholder-gray-400"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full   font-medium py-2.5 rounded-md transition  disabled:opacity-60 disabled:cursor-not-allowed "
              >
                {loading ? "Signing in..." : "Login"}
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


        <p className="mt-4 px-8 text-center text-sm text-muted-foreground"> By clicking login, you agree to our{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary"> Terms of Service</a>{" "}and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </Card>
  );
}
