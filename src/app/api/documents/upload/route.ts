import { NextResponse } from "next/server";
import { splitIntoChunks } from "@/lib/chunk";
import { generateStudyPack, embedTexts } from "@/lib/gemini";
import { extractPdfText } from "@/lib/pdf";
import { createClient } from "@/lib/supabase/server";
import { slugify, toVectorString, trimPreview } from "@/lib/supa-utils";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let documentId: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a PDF file." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF uploads are supported." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "PDF is too large. Keep it under 10 MB for this build." },
        { status: 400 },
      );
    }

    const originalTitle = file.name.replace(/\.pdf$/i, "").trim() || "Study Notes";
    const safeTitle = slugify(originalTitle) || "study-notes";
    const chatId = crypto.randomUUID();
    const createdDocumentId = crypto.randomUUID();
    documentId = createdDocumentId;
    const storagePath = `${user.id}/${createdDocumentId}-${safeTitle}.pdf`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { pageCount, text } = await extractPdfText(fileBuffer);

    if (!text || text.length < 80) {
      return NextResponse.json(
        { error: "Could not extract enough readable text from this PDF." },
        { status: 400 },
      );
    }

    const uploadResult = await supabase.storage
      .from("documents")
      .upload(storagePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadResult.error) {
      throw uploadResult.error;
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const chunks = splitIntoChunks(text, pageCount);

    if (!chunks.length) {
      return NextResponse.json(
        { error: "No study-ready text chunks were created from the PDF." },
        { status: 400 },
      );
    }

    const { error: documentInsertError } = await supabase.from("documents").insert({
      id: createdDocumentId,
      user_id: user.id,
      title: originalTitle,
      file_name: file.name,
      storage_path: storagePath,
      status: "processing",
      excerpt: trimPreview(text, 1800),
      page_count: pageCount,
      word_count: wordCount,
    });

    if (documentInsertError) {
      throw documentInsertError;
    }

    const { error: chatInsertError } = await supabase.from("chats").insert({
      id: chatId,
      user_id: user.id,
      document_id: createdDocumentId,
      title: originalTitle,
      last_message_preview: "StudyGenie is preparing your summary...",
    });

    if (chatInsertError) {
      throw chatInsertError;
    }

    const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));
    const chunkRows = chunks.map((chunk, index) => ({
      document_id: createdDocumentId,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      page_number: chunk.pageNumber,
      token_count: chunk.tokenCount,
      embedding: toVectorString(embeddings[index] ?? []),
    }));

    for (let index = 0; index < chunkRows.length; index += 100) {
      const batch = chunkRows.slice(index, index + 100);
      const { error } = await supabase.from("document_chunks").insert(batch);

      if (error) {
        throw error;
      }
    }

    const studyPack = await generateStudyPack({
      text: selectStudyPackSource(text),
      title: originalTitle,
    });

    const welcomeMessage = [
      `I finished reading **${originalTitle}**.`,
      "",
      `Summary: ${studyPack.summary}`,
      "",
      "Key points:",
      ...studyPack.keyPoints.map((point) => `- ${point}`),
    ].join("\n");

    const now = new Date().toISOString();

    const [{ error: updateError }, { error: messageError }, { error: chatUpdateError }] =
      await Promise.all([
        supabase
          .from("documents")
          .update({
            status: "ready",
            summary: studyPack.summary,
            key_points: studyPack.keyPoints,
            quiz: studyPack.quiz,
            updated_at: now,
          })
          .eq("id", createdDocumentId),
        supabase.from("messages").insert({
          chat_id: chatId,
          role: "assistant",
          content: welcomeMessage,
        }),
        supabase
          .from("chats")
          .update({
            last_message_preview: trimPreview(studyPack.summary),
            updated_at: now,
          })
          .eq("id", chatId),
      ]);

    if (updateError || messageError || chatUpdateError) {
      throw updateError ?? messageError ?? chatUpdateError;
    }

    return NextResponse.json({ chatId, documentId: createdDocumentId });
  } catch (error) {
    if (documentId) {
      await supabase
        .from("documents")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", documentId);
    }

    const message =
      error instanceof Error ? error.message : "Unexpected upload processing error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function selectStudyPackSource(text: string) {
  if (text.length <= 48000) {
    return text;
  }

  const head = text.slice(0, 32000);
  const tail = text.slice(-12000);

  return `${head}\n\n[...document truncated for summary generation...]\n\n${tail}`;
}
