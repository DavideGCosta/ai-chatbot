"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import {
  MarketsIcon,
  MessageIcon,
  PlusIcon,
  PortfolioIcon,
  SciQntIcon,
  SpacesIcon,
} from "@/components/icons";
import {
  getChatHistoryPaginationKey,
  SidebarHistory,
} from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { toast } from "@/components/toast";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import type { AppUser } from "@/lib/auth/session";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function AppSidebar({ user }: { user: AppUser | undefined }) {
  const router = useRouter();
  const { setOpenMobile, state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const disabledNavButtonClasses = [
    "group",
    "sidebar-ink-parent",
    "group/sidebar-item",
    "cursor-not-allowed",
    "rounded-lg",
    "border",
    "border-transparent",
    "text-sidebar-accent-foreground",
    "opacity-60",
  ].join(" ");
  const comingSoonBadgeClasses = [
    "ml-auto",
    "rounded-full",
    "border",
    "border-dashed",
    "border-sky-400/40",
    "bg-sky-400/10",
    "px-2",
    "py-0.5",
    "text-[10px]",
    "font-semibold",
    "uppercase",
    "tracking-wide",
    "text-sky-200",
    "group-data-[collapsible=icon]:hidden",
  ].join(" ");

  const withCollapsedTooltip = (label: string, node: React.ReactNode) => {
    if (!isCollapsed) {
      return node;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent align="center" side="right" sideOffset={10}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  };
  const { mutate } = useSWRConfig();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const handleDeleteAll = () => {
    const deletePromise = (async () => {
      const response = await fetch("/api/history", {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        const derivedMessage =
          (typeof payload.error === "string" && payload.error.length > 0
            ? payload.error
            : undefined) ??
          (typeof payload.message === "string" && payload.message.length > 0
            ? payload.message
            : undefined) ??
          "Failed to delete all chats.";
        throw new Error(derivedMessage);
      }

      return response;
    })();

    toast.promise(deletePromise, {
      loading: "Deleting all chats...",
      success: () => {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
        router.push("/");
        setShowDeleteAllDialog(false);
        return "All chats deleted successfully";
      },
      error: (error) =>
        error instanceof Error ? error.message : "Failed to delete all chats",
    });
  };

  return (
    <>
      <Sidebar
        className={[
          "flex",
          "flex-col",
          "h-full",
          "sidebar-no-surface",
          "group-data-[side=left]:border-r-0",
          "px-1.5",
          "pt-0 pb-3",
          "overflow-visible",
        ].join(" ")}
        collapsible="icon"
        onClick={(e) => {
          if (state !== "collapsed") {
            return;
          }
          if ((e.target as Element).closest('[data-sidebar="menu-button"]')) {
            return;
          }
          toggleSidebar();
        }}
        variant="floating"
      >
        <SidebarHeader className="px-1 py-0">
          <SidebarMenu>
            {/* Panel 1: Brand + toggle */}
            <div
              className={[
                "flex",
                "items-center",
                "justify-between",
                "mb-2",
                "mt-2",
              ].join(" ")}
            >
              <Link
                aria-label="Go to SciQnt home"
                className={[
                  "flex",
                  "flex-row",
                  "gap-1",
                  "group",
                  "hover:bg-white/30",
                  "hover:dark:bg-white/10",
                  "items-center",
                  "rounded-lg",
                  "px-2",
                  "py-1",
                  "transition-colors",
                ].join(" ")}
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                }}
              >
                <SciQntIcon size={26} />
                <span
                  className={[
                    "font-medium",
                    "group-data-[collapsible=icon]:hidden",
                    "text-md",
                    "text-logo",
                  ].join(" ")}
                >
                  SciQnt
                </span>
              </Link>
            </div>

            {/* Panel 2: Primary navigation */}
            <LiquidGlass className="m-0 mb-2 py-1" rounded="xl">
              <div
                className={[
                  "flex",
                  "flex-col",
                  "gap-1",
                  "items-stretch",
                  "group-data-[collapsible=icon]:items-center",
                  "justify-between",
                  "mx-1",
                ].join(" ")}
              >
                {withCollapsedTooltip(
                  "Markets — Coming soon",
                  <SidebarMenuButton
                    className={disabledNavButtonClasses}
                    disabled
                  >
                    <div className="flex w-full items-center gap-2">
                      <span className="text-sidebar-accent-foreground">
                        <span className="sidebar-ink">
                          <MarketsIcon />
                        </span>
                      </span>
                      <span
                        className={[
                          "font-normal",
                          "group-data-[collapsible=icon]:hidden",
                          "text-sm",
                          "sidebar-ink",
                        ].join(" ")}
                      >
                        Markets
                      </span>
                      <span className={comingSoonBadgeClasses}>
                        Coming Soon
                      </span>
                    </div>
                  </SidebarMenuButton>
                )}

                {withCollapsedTooltip(
                  "Portfolio — Coming soon",
                  <SidebarMenuButton
                    className={disabledNavButtonClasses}
                    disabled
                  >
                    <div className="flex w-full items-center gap-2">
                      <span className="text-sidebar-accent-foreground">
                        <span className="sidebar-ink">
                          <PortfolioIcon />
                        </span>
                      </span>
                      <span
                        className={[
                          "font-normal",
                          "group-data-[collapsible=icon]:hidden",
                          "text-sm",
                          "sidebar-ink",
                        ].join(" ")}
                      >
                        Portfolio
                      </span>
                      <span className={comingSoonBadgeClasses}>
                        Coming Soon
                      </span>
                    </div>
                  </SidebarMenuButton>
                )}

                {withCollapsedTooltip(
                  "Spaces — Coming soon",
                  <SidebarMenuButton
                    className={disabledNavButtonClasses}
                    disabled
                  >
                    <div className="flex w-full items-center gap-2">
                      <span className="text-sidebar-accent-foreground">
                        <span className="sidebar-ink">
                          <SpacesIcon />
                        </span>
                      </span>
                      <span
                        className={[
                          "font-normal",
                          "group-data-[collapsible=icon]:hidden",
                          "text-sm",
                          "sidebar-ink",
                        ].join(" ")}
                      >
                        Spaces
                      </span>
                      <span className={comingSoonBadgeClasses}>
                        Coming Soon
                      </span>
                    </div>
                  </SidebarMenuButton>
                )}
              </div>
            </LiquidGlass>
          </SidebarMenu>
        </SidebarHeader>

        {/* Panel 3: Chats link + history */}
        <SidebarContent
          className={["flex-1", "px-1.5", "overflow-auto"].join(" ")}
        >
          <LiquidGlass className={["mb-2"].join(" ")} rounded="xl">
            {withCollapsedTooltip(
              "Chats",
              <div
                className={[
                  "flex",
                  "items-center",
                  "justify-between",
                  "py-1",
                  "px-1",
                ].join(" ")}
              >
                <SidebarMenuButton
                  asChild
                  className={[
                    "group",
                    "sidebar-ink-parent",
                    "group/sidebar-item",
                    "cursor-pointer",
                    "justify-between",
                    "text-sidebar-accent-foreground",
                    "rounded-lg border border-transparent",
                    "transition-none hover:border-transparent hover:bg-transparent focus-visible:outline-none focus-visible:ring-0",
                  ].join(" ")}
                >
                  <Link
                    href="/"
                    onClick={() => {
                      setOpenMobile(false);
                    }}
                  >
                    <div
                      className={["flex", "flex-row", "items-center"].join(" ")}
                    >
                      <span className="text-sidebar-accent-foreground transition-colors duration-200 group-hover/sidebar-item:text-sky-300">
                        <span className="sidebar-ink">
                          <MessageIcon />
                        </span>
                      </span>
                      <span
                        className={[
                          "font-normal",
                          "pl-3.5",
                          "text-sm",
                          "group-data-[collapsible=icon]:hidden",
                          "sidebar-ink",
                        ].join(" ")}
                      >
                        Chats
                      </span>
                    </div>
                    <div
                      className={["flex", "flex-row", "items-center"].join(" ")}
                    >
                      <PlusIcon />
                    </div>
                  </Link>
                </SidebarMenuButton>
              </div>
            )}
            <div
              className={["mt-1", "group-data-[collapsible=icon]:hidden"].join(
                " "
              )}
            >
              <SidebarHistory user={user} />
            </div>
          </LiquidGlass>
        </SidebarContent>
        <div className="group-data-[collapsible=icon]:flex-grow" />
        {/* Panel 4: Footer */}
        <SidebarFooter className="px-2 py-1">
          {user && <SidebarUserNav user={user} />}
        </SidebarFooter>
      </Sidebar>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your chats and remove them from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
