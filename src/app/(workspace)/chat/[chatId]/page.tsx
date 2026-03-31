import { notFound } from "next/navigation";
import { ChatWorkspace } from "@/components/chat-workspace";
import { requireUser } from "@/lib/auth";
import { getChatWorkspace } from "@/lib/data";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const { supabase, user } = await requireUser();
  const workspace = await getChatWorkspace(supabase, user.id, chatId);

  if (!workspace) {
    notFound();
  }

  return (
    <ChatWorkspace
      chat={workspace.chat}
      document={workspace.document}
      messages={workspace.messages}
    />
  );
}
