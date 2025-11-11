import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserType = "guest" | "regular";

export type AppUser = {
  id: string;
  email: string | null;
  isAnonymous: boolean;
  type: UserType;
};

export type AppSession = {
  user: AppUser;
};

const toAppUser = (user: User): AppUser => {
  const isAnonymous = Boolean(
    user.is_anonymous ?? user.app_metadata?.provider === "anonymous"
  );

  return {
    id: user.id,
    email: user.email ?? null,
    isAnonymous,
    type: isAnonymous ? "guest" : "regular",
  };
};

export async function getSession(): Promise<AppSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    user: toAppUser(user),
  };
}

export async function requireSession(): Promise<AppSession> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export function mapSupabaseUserToAppUser(user: User): AppUser {
  return toAppUser(user);
}
