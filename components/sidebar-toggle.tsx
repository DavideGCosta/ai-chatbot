import type { ComponentProps } from "react";

import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarCloseIcon, SidebarOpenIcon } from "./icons";

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar, open, isMobile } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={[
            "relative",
            "flex",
            "h-full",
            "items-center",
            "text-primary/70",
            "hover:text-primary",
            "md:px-2",
            "cursor-pointer",
            className ?? "",
          ].join(" ")}
          data-testid="sidebar-toggle-button"
          onClick={toggleSidebar}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggleSidebar();
            }
          }}
          title="Toggle Sidebar"
          type="button"
        >
          <div
            className={[
              "absolute",
              "flex",
              "h-full",
              "items-center",
              "transition-all",
              "duration-200",
              "ease-in-out",
            ].join(" ")}
            style={{ opacity: open ? 1 : 0 }}
          >
            <SidebarCloseIcon size={isMobile ? 18 : 18} />
          </div>
          <div
            className={[
              "absolute",
              "flex",
              "h-full",
              "items-center",
              "transition-all",
              "duration-200",
              "ease-in-out",
            ].join(" ")}
            style={{ opacity: open ? 0 : 1 }}
          >
            <SidebarOpenIcon size={18} />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent align="center" side="right" sideOffset={15}>
        Toggle Sidebar
      </TooltipContent>
    </Tooltip>
  );
}
