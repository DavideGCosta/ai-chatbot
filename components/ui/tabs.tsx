"use client";

import {
  Content as TabsPrimitiveContent,
  List as TabsPrimitiveList,
  Root as TabsPrimitiveRoot,
  Trigger as TabsPrimitiveTrigger,
} from "@radix-ui/react-tabs";
import React from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitiveRoot;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitiveList>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitiveList>
>(({ className, ...props }, ref) => (
  <TabsPrimitiveList
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    ref={ref}
    {...props}
  />
));
TabsList.displayName = TabsPrimitiveList.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitiveTrigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitiveTrigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitiveTrigger
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    ref={ref}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitiveTrigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitiveContent>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitiveContent>
>(({ className, ...props }, ref) => (
  <TabsPrimitiveContent
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    ref={ref}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitiveContent.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
