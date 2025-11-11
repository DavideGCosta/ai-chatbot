import { cookies } from "next/headers";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { getSafeChatModelId } from "@/lib/ai/models";
import { getSession } from "@/lib/auth/session";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const session = await getSession();

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const initialModelId = getSafeChatModelId(modelIdFromCookie?.value);

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={initialModelId}
        initialMessages={[]}
        initialVisibilityType="private"
        isReadonly={!session?.user}
        key={id}
      />
      <DataStreamHandler />
    </>
  );
}
