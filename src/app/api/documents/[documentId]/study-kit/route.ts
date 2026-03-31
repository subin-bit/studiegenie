import { NextResponse } from "next/server";
import type { QuizQuestion, StudyPack } from "@/lib/types";
import { generateEli5 } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
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
      mode?: "eli5" | "quiz" | "summary";
    };

    const { data: document } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const studyPack: StudyPack = {
      summary: document.summary ?? "",
      keyPoints: document.key_points ?? [],
      quiz: ((document.quiz as QuizQuestion[] | null) ?? []).filter(Boolean),
    };

    if (body.mode === "summary") {
      return NextResponse.json({ content: studyPack.summary });
    }

    if (body.mode === "quiz") {
      return NextResponse.json({ content: studyPack.quiz });
    }

    const content = await generateEli5({
      language: body.language?.trim() || "English",
      studyPack,
      title: document.title,
    });

    return NextResponse.json({ content });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected study kit error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
