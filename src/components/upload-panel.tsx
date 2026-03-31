"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, LoaderCircle } from "lucide-react";

export function UploadPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setMessage("Choose a PDF to continue.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("Uploading and generating your study kit...");
    setIsError(false);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as {
      chatId?: string;
      error?: string;
    };

    setLoading(false);

    if (!response.ok || !payload.chatId) {
      setIsError(true);
      setMessage(payload.error ?? "Upload failed. Try a smaller PDF.");
      return;
    }

    router.push(`/chat/${payload.chatId}`);
    router.refresh();
  }

  return (
    <div className="glass-panel-strong rounded-[2rem] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">
            Upload PDF
          </p>
          <h2 className="display-font mt-2 text-3xl font-bold text-[#0f1e34]">
            Build a study room from your notes
          </h2>
        </div>
        <div className="rounded-2xl bg-[var(--secondary-soft)] px-4 py-3 text-sm text-[var(--secondary)]">
          Best for lecture notes, chapters, and handouts up to 10 MB.
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleUpload}>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-dashed border-[var(--line)] bg-white/75 px-6 py-10 text-center hover:border-[var(--accent)] hover:bg-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <FileUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-[#223650]">
              Drag your PDF here or click to browse
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              StudyGenie will extract text, create embeddings, generate a summary,
              and start your first chat automatically.
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
          />
        </label>

        {message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              isError
                ? "bg-[#ffe8e4] text-[#a43721]"
                : "bg-[var(--secondary-soft)] text-[var(--secondary)]"
            }`}
          >
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Generate study room
        </button>
      </form>
    </div>
  );
}
