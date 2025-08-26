"use server";

import { z } from "zod";

import { signIn } from "@/auth";
import { postgrest } from "@/lib/postgrest";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const authRegisterFormSchema = z.object({
  user_email: z.string().email(),
  password: z.string().min(6),
  user_name: z.string().min(4),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  user_mobile: z.string().optional(),
  business_name: z.string().optional(),
  business_number: z.string().optional(),
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
    });

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
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
        .insert({ ...validatedData, roles_json: ["storemanager"] });

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

      await signIn("credentials", {
        email: validatedData.user_email,
        password: validatedData.password,
        redirect: false,
      });

      return { status: "success" };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }
    return { status: "failed" };
  }
};
