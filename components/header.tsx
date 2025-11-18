"use client";

import { memo } from "react";
import { SciQntIcon } from "@/components/icons";
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
        "md:pr-2",
        "sm:px-4",
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
        <div className="md:hidden">
          <SciQntIcon />
        </div>
        <SidebarToggle />
      </div>

      <div />
    </header>
  );
}

export const AppHeader = memo(AppHeaderComponent);
export const ChatHeader = AppHeader;
