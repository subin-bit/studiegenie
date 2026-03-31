import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppChat, AppDocument, AppMessage } from "@/lib/types";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function getWorkspaceShellData(client: Client, userId: string) {
  const [{ data: chats }, { data: documents }] = await Promise.all([
    client
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(8),
    client
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(12),
  ]);

  return {
    chats: (chats ?? []) as AppChat[],
    documents: (documents ?? []) as AppDocument[],
  };
}

export async function getDashboardStats(client: Client, userId: string) {
  const [{ count: documentCount }, { count: chatCount }, { count: messageCount }] =
    await Promise.all([
      client
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      client.from("chats").select("*", { count: "exact", head: true }).eq("user_id", userId),
      client
        .from("messages")
        .select("id, chats!inner(user_id)", { count: "exact", head: true })
        .eq("chats.user_id", userId),
    ]);

  return {
    chatCount: chatCount ?? 0,
    documentCount: documentCount ?? 0,
    messageCount: messageCount ?? 0,
  };
}

export async function getChatWorkspace(
  client: Client,
  userId: string,
  chatId: string,
) {
  const { data: chat } = await client
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!chat) {
    return null;
  }

  const [{ data: messages }, { data: document }] = await Promise.all([
    client
      .from("messages")
      .select("*")
      .eq("chat_id", chat.id)
      .order("created_at", { ascending: true }),
    client
      .from("documents")
      .select("*")
      .eq("id", chat.document_id)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (!document) {
    return null;
  }

  return {
    chat: chat as AppChat,
    document: document as AppDocument,
    messages: (messages ?? []) as AppMessage[],
  };
}
