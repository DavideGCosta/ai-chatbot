import "server-only";

import type { VisibilityType } from "@/components/visibility-selector";
import { ChatSDKError } from "@/lib/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Chat, DBMessage, Document, Suggestion, Vote } from "./schema";

const CHAT_TABLE = "chat_conversations";
const MESSAGE_TABLE = "chat_messages";
const VOTE_TABLE = "chat_message_votes";
const DOCUMENT_TABLE = "chat_documents";
const SUGGESTION_TABLE = "chat_suggestions";
const STREAM_TABLE = "chat_streams";

const toIsoString = (value: Date | string): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
};

type ChatRow = {
  id: string;
  created_at: string;
  title: string;
  user_id: string;
  visibility: VisibilityType;
};

type MessageRow = {
  id: string;
  chat_id: string;
  role: string;
  parts: unknown[];
  attachments: unknown[];
  created_at: string;
};

type VoteRow = {
  chat_id: string;
  message_id: string;
  is_upvoted: boolean;
};

type DocumentRow = {
  id: string;
  created_at: string;
  title: string;
  content: string | null;
  kind: Document["kind"];
  user_id: string;
};

type SuggestionRow = {
  id: string;
  document_id: string;
  document_created_at: string;
  original_text: string;
  suggested_text: string;
  description: string | null;
  is_resolved: boolean;
  user_id: string;
  created_at: string;
};

const mapChat = (row: ChatRow): Chat => ({
  id: row.id,
  createdAt: new Date(row.created_at),
  title: row.title,
  userId: row.user_id,
  visibility: row.visibility,
});

const mapMessage = (row: MessageRow): DBMessage => ({
  id: row.id,
  chatId: row.chat_id,
  role: row.role,
  parts: row.parts,
  attachments: row.attachments,
  createdAt: new Date(row.created_at),
});

const mapVote = (row: VoteRow): Vote => ({
  chatId: row.chat_id,
  messageId: row.message_id,
  isUpvoted: row.is_upvoted,
});

const mapDocument = (row: DocumentRow): Document => ({
  id: row.id,
  createdAt: new Date(row.created_at),
  title: row.title,
  content: row.content,
  kind: row.kind,
  userId: row.user_id,
});

const mapSuggestion = (row: SuggestionRow): Suggestion => ({
  id: row.id,
  documentId: row.document_id,
  documentCreatedAt: new Date(row.document_created_at),
  originalText: row.original_text,
  suggestedText: row.suggested_text,
  description: row.description,
  isResolved: row.is_resolved,
  userId: row.user_id,
  createdAt: new Date(row.created_at),
});

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from(CHAT_TABLE).insert({
    id,
    user_id: userId,
    title,
    visibility,
  });

  if (error) {
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  const supabase = await createSupabaseServerClient();

  try {
    await supabase.from(VOTE_TABLE).delete().eq("chat_id", id);
    await supabase.from(MESSAGE_TABLE).delete().eq("chat_id", id);
    await supabase.from(STREAM_TABLE).delete().eq("chat_id", id);

    const { data, error } = await supabase
      .from(CHAT_TABLE)
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapChat(data) : null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: chats } = await supabase
      .from(CHAT_TABLE)
      .select("id")
      .eq("user_id", userId);

    if (!chats || chats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = chats.map((chat) => chat.id);

    await supabase.from(VOTE_TABLE).delete().in("chat_id", chatIds);
    await supabase.from(MESSAGE_TABLE).delete().in("chat_id", chatIds);
    await supabase.from(STREAM_TABLE).delete().in("chat_id", chatIds);

    const { data: deletedChats, error } = await supabase
      .from(CHAT_TABLE)
      .delete()
      .in("id", chatIds)
      .select();

    if (error) {
      throw error;
    }

    return { deletedCount: deletedChats?.length ?? 0 };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const extendedLimit = limit + 1;

  try {
    let query = supabase
      .from(CHAT_TABLE)
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(extendedLimit);

    if (startingAfter) {
      const chat = await getChatById({ id: startingAfter });

      if (!chat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      query = query.gt("created_at", chat.createdAt.toISOString());
    } else if (endingBefore) {
      const chat = await getChatById({ id: endingBefore });

      if (!chat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      query = query.lt("created_at", chat.createdAt.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const mapped = (data ?? []).map(mapChat);
    const hasMore = mapped.length > limit;

    return {
      chats: hasMore ? mapped.slice(0, limit) : mapped,
      hasMore,
    };
  } catch (err) {
    if (err instanceof ChatSDKError) {
      throw err;
    }

    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from(CHAT_TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapChat(data) : null;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  const supabase = await createSupabaseServerClient();

  try {
    const rows = messages.map((message) => ({
      id: message.id,
      chat_id: message.chatId,
      role: message.role,
      parts: message.parts,
      attachments: message.attachments,
      created_at: toIsoString(message.createdAt),
    }));

    const { error } = await supabase.from(MESSAGE_TABLE).insert(rows);

    if (error) {
      throw error;
    }
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from(MESSAGE_TABLE)
      .select("*")
      .eq("chat_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapMessage);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase.from(VOTE_TABLE).upsert(
      {
        chat_id: chatId,
        message_id: messageId,
        is_upvoted: type === "up",
      },
      {
        onConflict: "chat_id,message_id",
      }
    );

    if (error) {
      throw error;
    }
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from(VOTE_TABLE)
      .select("*")
      .eq("chat_id", id);

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapVote);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: Document["kind"];
  content: string | null;
  userId: string;
}) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from(DOCUMENT_TABLE)
      .insert({
        id,
        title,
        kind,
        content,
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapDocument);
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save document");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from(DOCUMENT_TABLE)
      .select("*")
      .eq("id", id)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapDocument);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from(DOCUMENT_TABLE)
      .select("*")
      .eq("id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapDocument(data) : null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  const supabase = await createSupabaseServerClient();
  const timestampIso = timestamp.toISOString();

  try {
    await supabase
      .from(SUGGESTION_TABLE)
      .delete()
      .eq("document_id", id)
      .gt("document_created_at", timestampIso);

    const { data, error } = await supabase
      .from(DOCUMENT_TABLE)
      .delete()
      .eq("id", id)
      .gt("created_at", timestampIso)
      .select();

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapDocument);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const supabase = await createSupabaseServerClient();

  try {
    const rows = suggestions.map((suggestion) => ({
      id: suggestion.id,
      document_id: suggestion.documentId,
      document_created_at: toIsoString(suggestion.documentCreatedAt),
      original_text: suggestion.originalText,
      suggested_text: suggestion.suggestedText,
      description: suggestion.description,
      is_resolved: suggestion.isResolved,
      user_id: suggestion.userId,
      created_at: toIsoString(suggestion.createdAt),
    }));

    const { error } = await supabase.from(SUGGESTION_TABLE).insert(rows);

    if (error) {
      throw error;
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from(SUGGESTION_TABLE)
      .select("*")
      .eq("document_id", documentId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapSuggestion);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from(MESSAGE_TABLE)
      .select("*")
      .eq("id", id);

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapMessage);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  const supabase = await createSupabaseServerClient();
  const timestampIso = timestamp.toISOString();

  try {
    const { data: messages, error: selectError } = await supabase
      .from(MESSAGE_TABLE)
      .select("id")
      .eq("chat_id", chatId)
      .gte("created_at", timestampIso);

    if (selectError) {
      throw selectError;
    }

    const messageIds = (messages ?? []).map(({ id }) => id);

    if (messageIds.length === 0) {
      return;
    }

    await supabase
      .from(VOTE_TABLE)
      .delete()
      .eq("chat_id", chatId)
      .in("message_id", messageIds);

    await supabase
      .from(MESSAGE_TABLE)
      .delete()
      .eq("chat_id", chatId)
      .in("id", messageIds);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from(CHAT_TABLE)
      .update({ visibility })
      .eq("id", chatId);

    if (error) {
      throw error;
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  const supabase = await createSupabaseServerClient();

  try {
    await supabase
      .from(CHAT_TABLE)
      .update({ title })
      .eq("id", chatId);
  } catch (error) {
    console.warn("Failed to update title for chat", chatId, error);
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  const supabase = await createSupabaseServerClient();
  const threshold = new Date(
    Date.now() - differenceInHours * 60 * 60 * 1000
  ).toISOString();

  try {
    const { data: chats, error: chatError } = await supabase
      .from(CHAT_TABLE)
      .select("id")
      .eq("user_id", id);

    if (chatError) {
      throw chatError;
    }

    if (!chats || chats.length === 0) {
      return 0;
    }

    const chatIds = chats.map(({ id: chatId }) => chatId);

    const { count, error } = await supabase
      .from(MESSAGE_TABLE)
      .select("id", { head: true, count: "exact" })
      .in("chat_id", chatIds)
      .eq("role", "user")
      .gte("created_at", threshold);

    if (error) {
      throw error;
    }

    return count ?? 0;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase.from(STREAM_TABLE).insert({
      id: streamId,
      chat_id: chatId,
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from(STREAM_TABLE)
      .select("id")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map(({ id }) => id);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

export async function deleteUserAccountById({ userId }: { userId: string }) {
  const supabaseAdmin = createSupabaseAdminClient();

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId, false);

  if (error) {
    throw new ChatSDKError(
      "bad_request:database",
      error.message ?? "Failed to delete user account."
    );
  }

  return { success: true };
}
