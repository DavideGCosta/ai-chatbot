"use client";

import { Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppUser } from "@/lib/auth/session";
import { getThemeFromValue, isThemeOption } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { PreferencesDialog } from "./preferences-dialog";
import { useSupabase } from "./supabase-provider";
import { toast } from "./toast";
import { useSidebar } from "./ui/sidebar";

export function SidebarUserNav({
  user,
  variant = "inline",
}: {
  user: AppUser;
  variant?: "inline" | "icon";
}) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { setTheme, resolvedTheme, theme } = useTheme();
  const { state: sidebarState } = useSidebar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const isGuest = user.isAnonymous;
  const displayEmail = user.email ?? "guest@sciqnt.app";
  const derivedDisplayName =
    user.displayName && user.displayName.trim().length > 0
      ? user.displayName.trim()
      : (displayEmail.split("@")[0] ?? "User");
  const displayName = isGuest ? "Guest" : derivedDisplayName;
  const membershipLabel = isGuest ? "Guest" : "Member";
  const avatarSize = sidebarState === "collapsed" ? "sm" : "md";

  const activeTheme =
    getThemeFromValue(theme) ?? getThemeFromValue(resolvedTheme) ?? "system";

  const handleThemeChange = (value: string) => {
    if (isThemeOption(value)) {
      setTheme(value);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        type: "error",
        description: "Failed to sign out. Please try again.",
      });
      return;
    }
    setIsMenuOpen(false);
    router.refresh();
  };

  const handleAuthClick = async () => {
    if (isGuest) {
      router.push("/login");
      return;
    }
    await handleSignOut();
  };

  const openPreferences = () => {
    setIsPreferencesOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu onOpenChange={setIsMenuOpen} open={isMenuOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className={cn(
                  "h-12 gap-3 bg-background/70 text-left",
                  "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                  "group-data-[collapsible=icon]:!gap-0 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:overflow-visible"
                )}
                data-testid="user-nav-button"
              >
                <UserAvatar
                  email={user.email}
                  fallbackLabel={displayName}
                  imageUrl={user.avatarUrl}
                  size={avatarSize}
                />
                {variant !== "icon" && (
                  <div className="flex min-w-0 flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
                    <span
                      className="truncate font-medium text-sm"
                      data-testid="user-email"
                    >
                      {isGuest ? "Guest" : displayEmail}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {membershipLabel}
                    </span>
                  </div>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="text-sm shadow-2xl"
              data-testid="user-nav-menu"
              side="top"
            >
              <div className="flex items-center gap-3 p-3">
                <UserAvatar
                  email={user.email}
                  fallbackLabel={displayName}
                  imageUrl={user.avatarUrl}
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-sm">
                    {displayName}
                  </p>
                  {!isGuest && (
                    <p className="truncate text-muted-foreground text-xs">
                      {displayEmail}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    {membershipLabel}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="space-y-2" data-testid="user-nav-item-theme">
                <div className="flex items-center justify-between font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  <span className="px-1">Theme</span>
                  <Button
                    className="h-7 w-7 rounded-full"
                    onClick={openPreferences}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <PlusIcon size={14} />
                  </Button>
                </div>
                <Tabs onValueChange={handleThemeChange} value={activeTheme}>
                  <TabsList className="grid h-9 w-full grid-cols-3">
                    <TabsTrigger className="text-xs" value="light">
                      Light
                    </TabsTrigger>
                    <TabsTrigger className="text-xs" value="dark">
                      Dark
                    </TabsTrigger>
                    <TabsTrigger className="text-xs" value="system">
                      System
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm"
                  onClick={openPreferences}
                  type="button"
                >
                  <Settings className="h-4 w-4" />
                  Preferences
                </button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild data-testid="user-nav-item-auth">
                <button
                  className="w-full rounded-md px-2 py-2 text-left text-sm"
                  onClick={handleAuthClick}
                  type="button"
                >
                  {isGuest ? "Login to your account" : "Sign out"}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <PreferencesDialog
        onOpenChange={setIsPreferencesOpen}
        open={isPreferencesOpen}
      />
    </>
  );
}

function UserAvatar({
  email,
  fallbackLabel,
  imageUrl,
  size = "md",
}: {
  email: string | null;
  fallbackLabel: string;
  imageUrl?: string | null;
  size?: "sm" | "md";
}) {
  const [hasError, setHasError] = useState(false);
  const initials = fallbackLabel.trim().slice(0, 2).toUpperCase() || "SC";

  const dimension = size === "sm" ? 32 : 40;
  const wrapperClass = size === "sm" ? "size-8" : "size-10";

  const shouldUseGeneratedAvatar = !imageUrl || hasError;

  if (shouldUseGeneratedAvatar && (!email || hasError)) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-sidebar-accent font-semibold text-sidebar-accent-foreground text-xs uppercase",
          wrapperClass
        )}
      >
        {initials}
      </div>
    );
  }

  const src = shouldUseGeneratedAvatar
    ? `https://avatar.vercel.sh/${encodeURIComponent(email ?? initials)}.svg`
    : (imageUrl ?? "");

  return (
    <Image
      alt={`${fallbackLabel} avatar`}
      className={cn("rounded-full ring-1 ring-border/60", wrapperClass)}
      height={dimension}
      onError={() => setHasError(true)}
      src={src}
      width={dimension}
    />
  );
}
