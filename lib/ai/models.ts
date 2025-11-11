export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Grok Vision",
    description: "Advanced multimodal model with vision and text capabilities",
  },
  {
    id: "chat-model-reasoning",
    name: "Grok Reasoning",
    description:
      "Uses advanced chain-of-thought reasoning for complex problems",
  },
];

const chatModelIds = chatModels.map((model) => model.id);

export function isValidChatModelId(
  value: string | null | undefined
): value is ChatModel["id"] {
  return chatModelIds.includes(value as ChatModel["id"]);
}

export function getSafeChatModelId(
  value: string | null | undefined
): ChatModel["id"] {
  return isValidChatModelId(value) ? value : DEFAULT_CHAT_MODEL;
}
