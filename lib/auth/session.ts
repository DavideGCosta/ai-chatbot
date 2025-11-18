import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserType = "guest" | "regular";

export type AppUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
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
  const metadataDisplayName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name.trim()
      : "";
  const metadataAvatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;
  const fallbackDisplayName = user.email?.includes("@")
    ? (user.email.split("@")[0] ?? null)
    : null;

  return {
    id: user.id,
    email: user.email ?? null,
    displayName:
      metadataDisplayName.length > 0
        ? metadataDisplayName
        : fallbackDisplayName,
    avatarUrl: metadataAvatarUrl,
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
