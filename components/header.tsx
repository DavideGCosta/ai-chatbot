"use client";

import Link from "next/link";
import { memo } from "react";
import { SciQntIcon } from "@/components/icons";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import type { AppUser } from "@/lib/auth/session";

type AppHeaderProps = {
  user?: AppUser | null;
};

function AppHeaderComponent({ user }: AppHeaderProps) {
  const authenticatedUser = user && !user.isAnonymous ? user : null;

  return (
    <header
      className={[
        "bg-background",
        "flex",
        "items-center",
        "justify-between",
        "py-2",
        "px-2",
        "md:pr-4",
        "md:py-0",
        "sticky",
        "top-0",
        "z-50",
      ].join(" ")}
    >
      <div className="mt-1 flex h-fit flex-1 items-center gap-3">
        <Link
          aria-label="Go to SciQnt home"
          className="flex items-center gap-2 rounded-xl px-2 py-1 text-foreground md:hidden"
          href="/"
        >
          <SciQntIcon size={32} />
          <span
            className={[
              "font-light",
              "group-data-[collapsible=icon]:hidden",
              "text-md",
            ].join(" ")}
          >
            SciQnt
          </span>
        </Link>
        <SidebarToggle className="hidden md:flex" />
      </div>
      <div className="flex h-fit flex-1 items-center justify-end">
        {authenticatedUser ? (
          <div className="max-w-[260px] sm:max-w-sm md:hidden">
            <SidebarUserNav user={authenticatedUser} variant="icon" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button asChild size="sm" variant="default">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export const AppHeader = memo(AppHeaderComponent);
