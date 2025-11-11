import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { getSafeChatModelId } from "@/lib/ai/models";
import { getSession } from "@/lib/auth/session";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

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
        isReadonly={false}
        key={id}
      />
      <DataStreamHandler />
    </>
  );
}
