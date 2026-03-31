"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, MessageSquareDashed, Sparkles } from "lucide-react";
import type {
  AppChat,
  AppDocument,
  AppMessage,
  MessageSource,
  QuizQuestion,
} from "@/lib/types";
import { QuizPanel } from "@/components/quiz-panel";

type MessageState = {
  content: string;
  id: string;
  role: "assistant" | "user";
  sources: MessageSource[];
};

export function ChatWorkspace({
  chat,
  document,
  messages,
}: {
  chat: AppChat;
  document: AppDocument;
  messages: AppMessage[];
}) {
  const [language, setLanguage] = useState("English");
  const [input, setInput] = useState("");
  const [eli5, setEli5] = useState<string | null>(null);
  const [studyLoading, setStudyLoading] = useState<"chat" | "eli5" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageList, setMessageList] = useState<MessageState[]>(
    messages.map((message) => ({
      content: message.content,
      id: message.id,
      role: message.role,
      sources: Array.isArray(message.sources)
        ? (message.sources as MessageSource[])
        : [],
    })),
  );

  const quiz = useMemo(
    () => ((document.quiz as QuizQuestion[] | null) ?? []).filter(Boolean),
    [document.quiz],
  );

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!input.trim()) {
      return;
    }

    const question = input.trim();
    setError(null);
    setStudyLoading("chat");
    setMessageList((current) => [
      ...current,
      {
        content: question,
        id: crypto.randomUUID(),
        role: "user",
        sources: [],
      },
    ]);
    setInput("");

    const response = await fetch(`/api/chats/${chat.id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        message: question,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      message?: MessageState;
    };

    setStudyLoading(null);

    if (!response.ok || !payload.message) {
      setError(payload.error ?? "Could not send your question.");
      return;
    }

    setMessageList((current) => [...current, payload.message as MessageState]);
  }

  async function generateEli5() {
    setStudyLoading("eli5");
    setError(null);

    const response = await fetch(`/api/documents/${document.id}/study-kit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        mode: "eli5",
      }),
    });

    const payload = (await response.json()) as { content?: string; error?: string };
    setStudyLoading(null);

    if (!response.ok || !payload.content) {
      setError(payload.error ?? "Could not generate the ELI5 explanation.");
      return;
    }

    setEli5(payload.content);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_380px]">
      <section className="glass-panel-strong rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
              Study room
            </p>
            <h1 className="display-font mt-2 text-4xl font-bold text-[#0f1e34]">
              {document.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {document.page_count ?? 0} pages | {document.word_count ?? 0} words
              | recent chat saved automatically
            </p>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm font-semibold text-[#223650]">
            Response language
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-[#f8f4ec] px-3 py-2 text-sm outline-none"
            >
              <option>English</option>
              <option>Malayalam</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {messageList.length ? (
            messageList.map((message) => (
              <article
                key={message.id}
                className={`max-w-4xl rounded-[1.75rem] px-5 py-4 ${
                  message.role === "assistant"
                    ? "border border-[var(--line)] bg-white/85"
                    : "ml-auto bg-[#10233a] text-white"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-65">
                  {message.role === "assistant" ? "StudyGenie" : "You"}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
                  {message.content}
                </p>

                {message.sources.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.sources.map((source) => (
                      <span
                        key={`${message.id}-${source.id}`}
                        className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]"
                      >
                        Chunk {source.chunkIndex + 1}
                        {source.pageNumber ? ` | p.${source.pageNumber}` : ""}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-[var(--line)] bg-white/70 px-5 py-8 text-sm leading-7 text-[var(--muted)]">
              StudyGenie will place your summary here after the first upload. Ask a
              question to begin.
            </div>
          )}

          {studyLoading === "chat" ? (
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white/85 px-4 py-4 text-sm text-[var(--muted)]">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Thinking through the document and pulling the most relevant chunks...
            </div>
          ) : null}
        </div>

        <form className="mt-6" onSubmit={sendMessage}>
          <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/80 p-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a doubt, request a comparison, or say 'explain this simply'..."
              className="min-h-28 w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 outline-none"
            />
            <div className="flex flex-col gap-3 border-t border-[var(--line)] px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#708093]">
                Chat recents stay saved in Supabase
              </p>
              <button
                type="submit"
                disabled={studyLoading === "chat"}
                className="flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles className="h-4 w-4" />
                Ask StudyGenie
              </button>
            </div>
          </div>
        </form>

        {error ? (
          <div className="mt-4 rounded-2xl bg-[#ffe8e4] px-4 py-3 text-sm text-[#a43721]">
            {error}
          </div>
        ) : null}
      </section>

      <aside className="space-y-4">
        <section className="glass-panel-strong rounded-[2rem] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
                Auto summary
              </p>
              <h2 className="display-font mt-2 text-2xl font-bold text-[#0f1e34]">
                Quick revision card
              </h2>
            </div>
            <button
              type="button"
              onClick={generateEli5}
              disabled={studyLoading === "eli5"}
              className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[#42536a] hover:border-[var(--accent)] disabled:opacity-60"
            >
              {studyLoading === "eli5" ? "Generating..." : "ELI5"}
            </button>
          </div>

          <div className="mt-4 rounded-[1.5rem] bg-white/80 p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#4b5b70]">
              {document.summary ?? "Summary will appear here after processing."}
            </p>
          </div>

          {eli5 ? (
            <div className="mt-4 rounded-[1.5rem] bg-[var(--accent-soft)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                Explain like I&apos;m 5
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#7b3525]">
                {eli5}
              </p>
            </div>
          ) : null}
        </section>

        <section className="glass-panel-strong rounded-[2rem] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
            Key points
          </p>
          <div className="mt-4 space-y-3">
            {(document.key_points ?? []).length ? (
              document.key_points?.map((point) => (
                <div
                  key={point}
                  className="rounded-[1.4rem] border border-[var(--line)] bg-white/82 px-4 py-3 text-sm leading-7 text-[#4b5b70]"
                >
                  {point}
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] px-4 py-5 text-sm leading-7 text-[var(--muted)]">
                Key points will appear once the upload pipeline finishes.
              </div>
            )}
          </div>
        </section>

        <section className="glass-panel-strong rounded-[2rem] p-5">
          <div className="flex items-center gap-2">
            <MessageSquareDashed className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="display-font text-2xl font-bold text-[#0f1e34]">
              Quiz yourself
            </h3>
          </div>
          <div className="mt-4">
            <QuizPanel quiz={quiz} />
          </div>
        </section>
      </aside>
    </div>
  );
}
