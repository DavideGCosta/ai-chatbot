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
    const deletePromise = fetch("/api/history", {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting all chats...",
      success: () => {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
        router.push("/");
        setShowDeleteAllDialog(false);
        return "All chats deleted successfully";
      },
      error: "Failed to delete all chats",
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
        <SidebarHeader className="px-1 py-1">
          <SidebarMenu>
            {/* Panel 1: Brand + toggle */}
            <div
              className={[
                "flex",
                "items-center",
                "justify-between",
                "mb-2",
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
                    "font-light",
                    "group-data-[collapsible=icon]:hidden",
                    "text-md",
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
                  "Markets",
                  <SidebarMenuButton
                    asChild
                    className={[
                      "cursor-pointer",
                      "rounded-lg",
                      "text-sidebar-accent-foreground",
                    ].join(" ")}
                  >
                    <Link
                      href="/markets"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <MarketsIcon />
                      <span
                        className={[
                          "font-normal",
                          "group-data-[collapsible=icon]:hidden",
                          "text-sm",
                        ].join(" ")}
                      >
                        Markets
                      </span>
                    </Link>
                  </SidebarMenuButton>
                )}

                {withCollapsedTooltip(
                  "Portfolio",
                  <SidebarMenuButton
                    asChild
                    className={[
                      "cursor-pointer",
                      "rounded-lg",
                      "text-sidebar-accent-foreground",
                    ].join(" ")}
                  >
                    <Link
                      href="/portfolio"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <PortfolioIcon />
                      <span
                        className={[
                          "font-normal",
                          "group-data-[collapsible=icon]:hidden",
                          "text-sm",
                        ].join(" ")}
                      >
                        Portfolio
                      </span>
                    </Link>
                  </SidebarMenuButton>
                )}

                {withCollapsedTooltip(
                  "Spaces",
                  <SidebarMenuButton
                    asChild
                    className={[
                      "cursor-pointer",
                      "rounded-lg",
                      "text-sidebar-accent-foreground",
                    ].join(" ")}
                  >
                    <Link
                      href="/spaces"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <SpacesIcon />
                      <span
                        className={[
                          "font-normal",
                          "group-data-[collapsible=icon]:hidden",
                          "text-sm",
                        ].join(" ")}
                      >
                        Spaces
                      </span>
                    </Link>
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
                    "cursor-pointer",
                    "justify-between",
                    "text-sidebar-accent-foreground",
                    "rounded-lg",
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
                      <MessageIcon />
                      <span
                        className={[
                          "font-normal",
                          "pl-3.5",
                          "text-sm",
                          "group-data-[collapsible=icon]:hidden",
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
