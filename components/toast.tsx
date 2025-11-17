"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast as sonnerToast } from "sonner";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";
import { CheckCircleFillIcon, WarningIcon } from "./icons";

const iconsByType: Record<"success" | "error", ReactNode> = {
  success: <CheckCircleFillIcon />,
  error: <WarningIcon />,
};

export function toast(props: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => (
    <Toast description={props.description} id={id} type={props.type} />
  ));
}

function Toast(props: ToastProps) {
  const { id, type, description } = props;

  const descriptionRef = useRef<HTMLDivElement>(null);
  const [multiLine, setMultiLine] = useState(false);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) {
      return;
    }

    const update = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight);
      const lines = Math.round(el.scrollHeight / lineHeight);
      setMultiLine(lines > 1);
    };

    update(); // initial check
    const ro = new ResizeObserver(update); // re-check on width changes
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <LiquidGlass
      className={cn(
        [
          "flex",
          "flex-row",
          "gap-3",
          "rounded-lg",
          "p-3",
          "w-[275px]",
          "justify-center",
          "text-sm",
          "shadow-[0_8px_30px_rgba(0,0,0,0.45)]",
          "dark:bg-white/15",
          "dark:text-white",
        ].join(" "),
        multiLine ? "items-start" : "items-center"
      )}
      data-testid="toast"
      key={id}
      rounded="lg"
    >
      <div
        className={cn(
          "data-[type=error]:text-red-400 data-[type=success]:text-emerald-300",
          { "pt-1": multiLine }
        )}
        data-type={type}
      >
        {iconsByType[type]}
      </div>
      <div
        className="font-medium text-xs text-zinc-900 dark:text-zinc-50"
        ref={descriptionRef}
      >
        {description}
      </div>
    </LiquidGlass>
  );
}

type ToastProps = {
  id: string | number;
  type: "success" | "error";
  description: string;
};
