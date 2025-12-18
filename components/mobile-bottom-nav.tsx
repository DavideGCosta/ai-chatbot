"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  MarketsIcon,
  MarketsIconFill,
  MenuIcon,
  PlusIcon,
  PortfolioIcon,
  PortfolioIconFill,
  SpacesIcon,
  SpacesIconFill,
} from "@/components/icons";
import { toast } from "@/components/toast";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, setOpenMobile, setOpen } = useSidebar();

  const handleComingSoon = (label: string) => {
    toast({
      description: `${label} are coming soon.`,
      type: "info",
    });
  };

  const handleNewChat = () => {
    router.push("/");
  };

  const handleChatMenuClick = () => {
    if (isMobile) {
      setOpenMobile(true);
      return;
    }
    setOpen(true);
  };

  const leftMenuItems = [
    {
      label: "Markets",
      Icon: pathname?.startsWith("/markets") ? MarketsIconFill : MarketsIcon,
      onClick: () => handleComingSoon("Markets"),
    },
    {
      label: "Portfolio",
      Icon: pathname?.startsWith("/portfolio")
        ? PortfolioIconFill
        : PortfolioIcon,
      onClick: () => handleComingSoon("Portfolio"),
    },
  ];

  const rightMenuItems = [
    {
      label: "Spaces",
      Icon: pathname?.startsWith("/spaces") ? SpacesIconFill : SpacesIcon,
      onClick: () => handleComingSoon("Spaces"),
    },
    { label: "More", Icon: MenuIcon, onClick: handleChatMenuClick },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="-bottom-1 fixed inset-x-0 z-40 bg-transparent md:hidden"
    >
      <div className="relative mx-auto flex max-w-lg flex-col items-center">
        <div className="flex w-full items-center justify-between rounded-t-3xl border border-border/70 bg-background/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex flex-1 items-center justify-evenly gap-1 pr-6">
            {leftMenuItems.map(({ label, Icon, onClick }) => (
              <button
                className="flex flex-col items-center gap-1 rounded-xl px-3 py-1 font-semibold text-[11px] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                key={label}
                onClick={onClick}
                type="button"
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div aria-hidden="true" className="w-16" />
          <div className="flex flex-1 items-center justify-evenly gap-1">
            {rightMenuItems.map(({ label, Icon, onClick }) => (
              <button
                className="flex flex-col items-center gap-1 rounded-xl px-3 py-1 font-semibold text-[11px] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                key={label}
                onClick={onClick}
                type="button"
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          aria-label="Start a new chat"
          className="-top-2 gap- absolute flex h-18 w-18 flex-col items-center justify-center"
          onClick={handleNewChat}
          type="button"
        >
          <div className="rounded-full border border-border/70 bg-primary p-3.5 text-primary-foreground shadow-primary/40 shadow-xl transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50">
            <PlusIcon size={22} />
          </div>
          <span className="font-semibold text-[10px]">New Chat</span>
        </button>
      </div>
    </nav>
  );
}
