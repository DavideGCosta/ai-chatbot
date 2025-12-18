import { Slot as SlotPrimitive } from "radix-ui";
import { type ComponentProps, forwardRef } from "react";
import { cn } from "@/lib/utils";

type CardEffectProps = {
  asChild?: boolean;
  className?: string;
  elevation?: "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
  interactive?: boolean;
} & ComponentProps<"div">;

const roundedToClass: Record<
  NonNullable<CardEffectProps["rounded"]>,
  string
> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const elevationToClass: Record<
  NonNullable<CardEffectProps["elevation"]>,
  string
> = {
  sm: "shadow-none",
  md: "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]",
  lg: "shadow-[0px_4px_6px_-2px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(0,0,0,0.1)]",
};

export const CardEffect = forwardRef<HTMLDivElement, CardEffectProps>(
  (
    {
      asChild = false,
      className,
      elevation = "md",
      rounded = "xl",
      interactive = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? SlotPrimitive.Slot : "div";

    return (
      <Comp
        className={cn(
          [
            "card-effect",
            "relative",
            "border",
            roundedToClass[rounded],
            elevationToClass[elevation],
            "transition-colors",
            "bg-background/70",
            "backdrop-blur-xl",
          ].join(" "),
          interactive
            ? [
                "cursor-pointer",
                "hover:bg-white/45",
                "hover:dark:bg-white/15",
              ].join(" ")
            : undefined,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
CardEffect.displayName = "CardEffect";
