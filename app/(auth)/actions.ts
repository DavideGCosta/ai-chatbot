"use server";

import { z } from "zod";

import { DEFAULT_PREFERENCES } from "@/lib/preferences";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  const supabase = await createSupabaseServerClient();

  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return { status: "failed" };
    }

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export type RegisterActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  const supabase = await createSupabaseServerClient();

  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const defaultDisplayName = validatedData.email.includes("@")
      ? (validatedData.email.split("@")[0] ?? validatedData.email)
      : validatedData.email;

    const { error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          preferences: DEFAULT_PREFERENCES,
          display_name: defaultDisplayName,
        },
      },
    });

    if (error) {
      const message = error.message?.toLowerCase() ?? "";
      if (
        error.code === "user_already_exists" ||
        message.includes("already registered") ||
        message.includes("exists")
      ) {
        return { status: "user_exists" };
      }
      return { status: "failed" };
    }

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};
