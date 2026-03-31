import { NextResponse } from "next/server";
import type { MessageSource } from "@/lib/types";
import { embedTexts, generateChatAnswer } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { toVectorString, trimPreview } from "@/lib/supa-utils";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      language?: string;
      message?: string;
    };

    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Enter a question first." }, { status: 400 });
    }

    const { data: chat } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!chat) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    }

    const { data: document } = await supabase
      .from("documents")
      .select("*")
      .eq("id", chat.document_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const now = new Date().toISOString();

    const { error: userMessageError } = await supabase.from("messages").insert({
      chat_id: chat.id,
      role: "user",
      content: message,
      created_at: now,
    });

    if (userMessageError) {
      throw userMessageError;
    }

    const [queryEmbedding] = await embedTexts([message]);
    const { data: matches, error: matchError } = await supabase.rpc(
      "match_document_chunks",
      {
        filter_document_id: document.id,
        match_count: 6,
        query_embedding: toVectorString(queryEmbedding ?? []),
      },
    );

    if (matchError) {
      throw matchError;
    }

    const sources: MessageSource[] = (matches ?? []).map((match) => ({
      chunkIndex: match.chunk_index,
      excerpt: trimPreview(match.content, 360),
      id: match.id,
      pageNumber: match.page_number,
      similarity: match.similarity,
    }));

    const assistantContent = await generateChatAnswer({
      contextBlocks: sources,
      documentTitle: document.title,
      language: body.language?.trim() || "English",
      question: message,
      summary: document.summary,
    });

    const assistantMessage = {
      id: crypto.randomUUID(),
      chat_id: chat.id,
      role: "assistant" as const,
      content: assistantContent,
      created_at: new Date().toISOString(),
      sources,
    };

    const [{ error: assistantError }, { error: chatUpdateError }] = await Promise.all([
      supabase.from("messages").insert(assistantMessage),
      supabase
        .from("chats")
        .update({
          last_message_preview: trimPreview(assistantContent),
          updated_at: assistantMessage.created_at,
        })
        .eq("id", chat.id),
    ]);

    if (assistantError || chatUpdateError) {
      throw assistantError ?? chatUpdateError;
    }

    return NextResponse.json({
      message: {
        content: assistantMessage.content,
        id: assistantMessage.id,
        role: assistantMessage.role,
        sources,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected chat processing error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
