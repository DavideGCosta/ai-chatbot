"use server";

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import {
  mergePreferences,
  type PreferencesUpdateInput,
} from "@/lib/preferences";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ThemeSchema = z.enum(["light", "dark", "system"]);
const CostBasisSchema = z.enum(["fifo", "lifo", "bep"]);
const FeeRecognitionSchema = z.enum(["cash", "accrual"]);
const FxMethodSchema = z.enum(["complex", "simple_account", "simple_product"]);

const PreferencesPayloadSchema = z.object({
  theme: ThemeSchema.optional(),
  portfolio_currency: z.string().min(3).max(4).optional(),
  portfolio_agg_cost_basis: CostBasisSchema.optional(),
  portfolio_agg_fee_recognition: FeeRecognitionSchema.optional(),
  portfolio_fx_pnl_method: FxMethodSchema.optional(),
  assistant: z
    .object({
      preInstructions: z.string().max(2000).optional(),
      investmentStyle: z.number().min(0).max(100).optional(),
    })
    .optional(),
});

type PreferencesPayload = z.infer<typeof PreferencesPayloadSchema>;

export async function GET() {
  try {
    await requireSession();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw new Error("Unable to load user profile.");
    }

    const preferences = mergePreferences(
      (data.user.user_metadata?.preferences ?? undefined) as
        | PreferencesUpdateInput
        | undefined
    );

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("[preferences:GET]", error);
    return NextResponse.json(
      { error: "Failed to load preferences." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    const supabase = await createSupabaseServerClient();
    const json = await request.json();
    const parsed = PreferencesPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid preferences payload.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const payload: PreferencesPayload = parsed.data;

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw new Error("Unable to load user profile.");
    }

    const current = mergePreferences(
      (data.user.user_metadata?.preferences ?? undefined) as
        | PreferencesUpdateInput
        | undefined
    );

    const overrides: PreferencesUpdateInput = {
      ...(current as PreferencesUpdateInput),
      ...payload,
      assistant: {
        ...current.assistant,
        ...(payload.assistant ?? {}),
      },
    };

    const updated = mergePreferences(overrides);

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...(data.user.user_metadata ?? {}),
        preferences: updated,
      },
    });

    if (updateError) {
      throw new Error("Unable to update user preferences.");
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[preferences:POST]", error);
    return NextResponse.json(
      { error: "Failed to save preferences." },
      { status: 500 }
    );
  }
}
