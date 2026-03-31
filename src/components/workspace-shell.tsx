import Link from "next/link";
import { BookOpen, Clock3, LogOut, MessageSquareText } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { AppChat, AppDocument } from "@/lib/types";
import { StudyGenieMark } from "@/components/studygenie-mark";
import { signOutAction } from "@/app/(workspace)/actions";
import { formatRelativeTime } from "@/lib/supa-utils";

export function WorkspaceShell({
  children,
  chats,
  documents,
  user,
}: {
  chats: AppChat[];
  children: React.ReactNode;
  documents: AppDocument[];
  user: User;
}) {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="glass-panel-strong flex flex-col rounded-[2rem] p-5">
          <StudyGenieMark />

          <div className="mt-6 rounded-[1.5rem] bg-[#10233a] p-4 text-white">
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">
              Signed in as
            </p>
            <p className="mt-2 text-sm font-semibold">{user.email}</p>
            <form action={signOutAction} className="mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-sm font-semibold text-white hover:bg-white/18"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>

          <nav className="mt-6 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 text-sm font-semibold text-[#223650]"
            >
              <BookOpen className="h-4 w-4 text-[var(--accent)]" />
              Dashboard
            </Link>
          </nav>

          <section className="mt-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6c7a8c]">
              <MessageSquareText className="h-4 w-4" />
              Recent chats
            </div>
            <div className="mt-4 space-y-3">
              {chats.length ? (
                chats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className="block rounded-[1.35rem] border border-[var(--line)] bg-white/76 px-4 py-3 hover:-translate-y-0.5 hover:border-[var(--accent)]"
                  >
                    <p className="font-semibold text-[#223650]">{chat.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                      {chat.last_message_preview ?? "Open this study room to continue chatting."}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7a8797]">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatRelativeTime(chat.updated_at)}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-[var(--line)] px-4 py-5 text-sm leading-7 text-[var(--muted)]">
                  Upload your first PDF to generate a recent chat here.
                </div>
              )}
            </div>
          </section>

          <section className="mt-8">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#6c7a8c]">
              Your documents
            </div>
            <div className="mt-4 space-y-3">
              {documents.length ? (
                documents.slice(0, 5).map((document) => (
                  <div
                    key={document.id}
                    className="rounded-[1.35rem] border border-[var(--line)] bg-white/72 px-4 py-3"
                  >
                    <p className="font-semibold text-[#223650]">{document.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {document.status === "ready"
                        ? `${document.page_count ?? 0} pages ready`
                        : "Processing in progress"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-[var(--line)] px-4 py-5 text-sm leading-7 text-[var(--muted)]">
                  Documents you upload will appear here for quick revision access.
                </div>
              )}
            </div>
          </section>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
