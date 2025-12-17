"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast as sonnerToast } from "sonner";
import { CardEffect } from "@/components/ui/card-effect";
import { cn } from "@/lib/utils";
import {
  CheckCircleFillIcon,
  InfoIcon,
  LoaderIcon,
  WarningIcon,
} from "./icons";

const DEFAULT_DURATION = 3800;
const SUCCESS_DURATION = 2600;
const ERROR_DURATION = 3600;
const LOADING_DURATION = 1000 * 60;
const DEFAULT_SUCCESS_MESSAGE = "Done!";
const DEFAULT_ERROR_MESSAGE = "Something went wrong.";
const DEFAULT_LOADING_MESSAGE = "Working on it...";

type ToastTone = "success" | "error" | "info" | "loading";

type ToastPayload = {
  description: ReactNode;
  title?: ReactNode;
  type?: ToastTone;
  id?: string | number;
  duration?: number;
};

type MessageFactory<Payload = void> =
  | ReactNode
  | ((payload: Payload) => ReactNode | Promise<ReactNode>);

type PromiseMessages<Payload> = {
  loading: MessageFactory;
  success?: MessageFactory<Payload>;
  error?: MessageFactory<unknown>;
};

const iconByTone: Record<ToastTone, ReactNode> = {
  success: <CheckCircleFillIcon />,
  error: <WarningIcon />,
  info: <InfoIcon />,
  loading: <LoaderIcon />,
};

const toneColorByType: Record<ToastTone, string> = {
  success: "text-emerald-300",
  error: "text-red-400",
  info: "text-sky-300",
  loading: "text-zinc-200",
};

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showToast(payload: ToastPayload) {
  const { id, type = "info", duration, description, title } = payload;

  return sonnerToast.custom(
    (toastId) => (
      <ToastContent
        description={description}
        id={toastId}
        title={title}
        tone={type}
      />
    ),
    {
      id,
      duration:
        duration ?? (type === "loading" ? LOADING_DURATION : DEFAULT_DURATION),
    }
  );
}

function resolveMessage<Payload>(
  factory: MessageFactory<Payload> | undefined,
  payload: Payload
) {
  if (!factory) {
    return Promise.resolve(undefined);
  }

  if (typeof factory === "function") {
    return Promise.resolve(factory(payload));
  }

  return Promise.resolve(factory);
}

type ToastContentProps = {
  id: string | number;
  tone: ToastTone;
  description: ReactNode;
  title?: ReactNode;
};

function ToastContent(props: ToastContentProps) {
  const { tone, description, title, id } = props;
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

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const icon = iconByTone[tone];

  return (
    <CardEffect
      aria-atomic="true"
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn(
        "flex min-w-[280px] max-w-[420px] gap-3 p-3 pr-4 text-zinc-900 dark:text-zinc-50",
        multiLine ? "items-start" : "items-center"
      )}
      data-testid="toast"
      data-tone={tone}
      key={id}
      rounded="lg"
    >
      <span className="sr-only">{tone} notification</span>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-6 w-6 items-center justify-center text-base",
          toneColorByType[tone],
          multiLine && "mt-0.5"
        )}
      >
        {tone === "loading" ? (
          <span className="block animate-spin motion-reduce:animate-none">
            {icon}
          </span>
        ) : (
          icon
        )}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        {title && (
          <p
            className={cn(
              "text-sm",
              "font-semibold",
              "leading-5",
              "text-zinc-900",
              "dark:text-zinc-50"
            )}
          >
            {title}
          </p>
        )}
        <div
          className={cn(
            "text-xs",
            "font-medium",
            "leading-5",
            "text-zinc-800",
            "dark:text-zinc-200"
          )}
          ref={descriptionRef}
        >
          {description}
        </div>
      </div>
    </CardEffect>
  );
}

type ToastSupplemental = Omit<ToastPayload, "description" | "type">;

type ToastHandler = {
  (payload: ToastPayload): string | number;
  success: (
    description: ReactNode,
    options?: ToastSupplemental
  ) => string | number;
  error: (
    description: ReactNode,
    options?: ToastSupplemental
  ) => string | number;
  info: (
    description: ReactNode,
    options?: ToastSupplemental
  ) => string | number;
  promise: <Payload>(
    promiseOrFactory: Promise<Payload> | (() => Promise<Payload>),
    messages: PromiseMessages<Payload>
  ) => Promise<Payload>;
  dismiss: (id?: string | number) => void;
};

const toast = Object.assign((payload: ToastPayload) => showToast(payload), {
  success(description: ReactNode, options?: ToastSupplemental) {
    return showToast({ ...options, description, type: "success" });
  },
  error(description: ReactNode, options?: ToastSupplemental) {
    return showToast({ ...options, description, type: "error" });
  },
  info(description: ReactNode, options?: ToastSupplemental) {
    return showToast({ ...options, description, type: "info" });
  },
  async promise<Payload>(
    promiseOrFactory: Promise<Payload> | (() => Promise<Payload>),
    messages: PromiseMessages<Payload>
  ) {
    const toastId = createToastId();
    const loadingDescription =
      (await resolveMessage(messages.loading, undefined)) ??
      DEFAULT_LOADING_MESSAGE;

    showToast({
      id: toastId,
      type: "loading",
      description: loadingDescription,
      duration: LOADING_DURATION,
    });

    let promise: Promise<Payload>;

    try {
      promise =
        typeof promiseOrFactory === "function"
          ? promiseOrFactory()
          : promiseOrFactory;
    } catch (error) {
      const errorDescription =
        (await resolveMessage(messages.error, error)) ?? DEFAULT_ERROR_MESSAGE;

      showToast({
        id: toastId,
        type: "error",
        description: errorDescription,
        duration: ERROR_DURATION,
      });

      return Promise.reject(error);
    }

    try {
      const result = await promise;
      const successDescription =
        (await resolveMessage(messages.success, result)) ??
        DEFAULT_SUCCESS_MESSAGE;

      showToast({
        id: toastId,
        type: "success",
        description: successDescription,
        duration: SUCCESS_DURATION,
      });

      return result;
    } catch (error) {
      const errorDescription =
        (await resolveMessage(messages.error, error)) ?? DEFAULT_ERROR_MESSAGE;

      showToast({
        id: toastId,
        type: "error",
        description: errorDescription,
        duration: ERROR_DURATION,
      });

      throw error;
    }
  },
  dismiss(id?: string | number) {
    sonnerToast.dismiss(id);
  },
}) as ToastHandler;

export { toast };
