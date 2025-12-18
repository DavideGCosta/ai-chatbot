"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import {
  BitcoinIcon,
  GraduationCapIcon,
  LineChartIcon,
  SearchIcon,
  TrendingUpIcon,
} from "lucide-react";
import { memo } from "react";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "./elements/suggestion";
import type { VisibilityType } from "./visibility-selector";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
};

function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      label: "Market trends",
      prompt: "What are the latest stock market trends?",
      Icon: TrendingUpIcon,
    },
    {
      label: "Analyze a stock",
      prompt: "Analyze the performance of AAPL stock",
      Icon: LineChartIcon,
    },
    {
      label: "Find an opportunity",
      prompt: "Suggest investment strategies for beginners",
      Icon: SearchIcon,
    },
    {
      label: "Crypto snapshot",
      prompt: "What's the current price of Bitcoin?",
      Icon: BitcoinIcon,
    },
  ] as const;

  return (
    <div className="w-full" data-testid="suggested-actions">
      <div className="flex w-full flex-wrap justify-center gap-2">
        {suggestedActions.map((action, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            initial={{ opacity: 0, y: 20 }}
            key={action.label}
            transition={{ delay: 0.05 * index }}
          >
            <Suggestion
              className="h-9 gap-2 px-3"
              onClick={(suggestion) => {
                window.history.replaceState({}, "", `/chat/${chatId}`);
                sendMessage({
                  role: "user",
                  parts: [{ type: "text", text: suggestion }],
                });
              }}
              suggestion={action.prompt}
            >
              <action.Icon className="size-4 text-muted-foreground" />
              <span>{action.label}</span>
            </Suggestion>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }

    return true;
  }
);
