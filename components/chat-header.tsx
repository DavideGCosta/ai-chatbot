"use client";

import { memo } from "react";
import { SidebarToggle } from "@/components/sidebar-toggle";

function AppHeaderComponent() {
  // Intentionally minimal header: only toggle + visibility selector

  return (
    <header
      className={[
        "bg-background",
        "flex",
        "items-center",
        "justify-between",
        "py-6",
        "pr-2",
        "sticky",
        "top-0",
        "z-50",
      ].join(" ")}
    >
      <div
        className={["flex", "items-center", "gap-4", "ml-0", "relative"].join(
          " "
        )}
      >
        <SidebarToggle />
      </div>

      <div />
    </header>
  );
}

export const AppHeader = memo(AppHeaderComponent);
export const ChatHeader = AppHeader;
