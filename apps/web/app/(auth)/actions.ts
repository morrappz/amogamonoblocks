"use server";

import { z } from "zod";

// import { signIn } from "@/auth";
import { postgrest } from "@/lib/postgrest";
import { saveUserLogs } from "@/utils/userLogs";
import { toast } from "sonner";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  callbackUrl: z.string().optional(),
});

const authRegisterFormSchema = z.object({
  user_email: z.string().email(),
  password: z.string().min(6),
  user_name: z.string().min(4),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  user_mobile: z.string().optional(),
  for_business_name: z.string().optional(),
  for_business_number: z.string().optional(),
  store_name: z.string().optional(),
});

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
}

export const login = async (
  _: LoginActionState,
  formData: z.infer<typeof authFormSchema>
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.email,
      password: formData.password,
      callbackUrl: formData.callbackUrl,
    });

    const signInOptions: any = {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    };

    // If there's a callback URL, include it in the sign-in options
    if (validatedData.callbackUrl) {
      signInOptions.redirectTo = validatedData.callbackUrl;
    }

    // await signIn("credentials", signInOptions);

    await saveUserLogs({
      status: "Login Success",
      description: "Login Success",
      event_type: "Login Success",
      // user_ip_address: await IpAddress(),
      // browser: getCurrentBrowser(),
      // device: getUserOS(),
      // geo_location: await getUserLocation(),
      http_method: "POST",
      response_payload: {
        email: validatedData.email,
        password: validatedData.password,
      },
      // operating_system: getUserOS(),
      app_name: "Amoga Next Blocks",
    });

    return { status: "success" };
  } catch (error) {
    await saveUserLogs({
      status: "failure",
      description: "Login Failure",
      event_type: "Login Failure",
    });
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }
    return { status: "failed" };
  }
};

export interface RegisterActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
  message?: string;
}

export const register = async (
  _: RegisterActionState,
  formData: z.infer<typeof authRegisterFormSchema>
): Promise<RegisterActionState> => {
  try {
    const validatedData = authRegisterFormSchema.parse(formData);

    const { data: user } = await postgrest
      .asAdmin()
      .from("user_catalog")
      .select("*")
      .eq("user_email", validatedData.user_email)
      .single();
    if (user) {
      return { status: "user_exists" } as RegisterActionState;
    } else {
      const { error: insertError } = await postgrest
        .asAdmin()
        .from("user_catalog")
        .insert(validatedData);

      if (insertError) {
        if (
          insertError?.message &&
          insertError?.message.includes("duplicate key") &&
          insertError?.message.includes("user_mobile")
        ) {
          return { status: "failed", message: "Phone number already exists" };
        }
        return { status: "failed" };
      }

      // await signIn("credentials", {
      //   email: validatedData.user_email,
      //   password: validatedData.password,
      //   redirect: false,
      // });

      return { status: "success" };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }
    return { status: "failed" };
  }
};
