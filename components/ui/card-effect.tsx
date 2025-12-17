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
  sm: "shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset]",
  md: "shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_6px_20px_-8px_rgba(0,0,0,0.25)]",
  lg: "shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_12px_30px_-12px_rgba(0,0,0,0.35)]",
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
