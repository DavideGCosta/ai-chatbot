"use client";

import { Tooltip as TooltipPrimitive } from "radix-ui";
import * as React from "react";
import { CardEffect } from "@/components/ui/card-effect";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, children, ...props }, ref) => (
  <TooltipPrimitive.Content
    className={cn(
      "fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 origin-[--radix-tooltip-content-transform-origin] animate-in border-none bg-transparent p-0 shadow-none data-[state=closed]:animate-out",
      className
    )}
    ref={ref}
    sideOffset={sideOffset}
    {...props}
  >
    <CardEffect
      className="px-2.5 py-1.5 font-medium text-xs"
      elevation="md"
      rounded="lg"
    >
      {children}
    </CardEffect>
  </TooltipPrimitive.Content>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
