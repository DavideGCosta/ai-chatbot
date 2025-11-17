"use client";

import { memo } from "react";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  // Intentionally minimal header: only toggle + visibility selector

  return (
    <header
      className={[
        "bg-background",
        "flex",
        "items-center",
        "justify-between",
        "py-1.5",
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

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          className="order-1 md:order-2"
          selectedVisibilityType={selectedVisibilityType}
        />
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
