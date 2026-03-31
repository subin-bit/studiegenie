import Link from "next/link";
import { ArrowRight, FileStack, MessageCircleHeart, ScanSearch } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDashboardStats, getWorkspaceShellData } from "@/lib/data";
import { UploadPanel } from "@/components/upload-panel";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const [{ chats, documents }, stats] = await Promise.all([
    getWorkspaceShellData(supabase, user.id),
    getDashboardStats(supabase, user.id),
  ]);

  return (
    <div className="space-y-4">
      <section className="glass-panel-strong rounded-[2rem] px-6 py-7">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
              Dashboard
            </p>
            <h1 className="display-font mt-3 text-4xl font-bold text-[#0f1e34] sm:text-5xl">
              Welcome back, {user.email?.split("@")[0] ?? "student"}.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
              Upload a new PDF to create another study room, or jump back into one of
              your recent chats to continue revising with grounded answers.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <MetricCard
              value={stats.documentCount}
              label="Documents processed"
              icon={FileStack}
            />
            <MetricCard value={stats.chatCount} label="Recent chat threads" icon={ScanSearch} />
            <MetricCard
              value={stats.messageCount}
              label="Saved question turns"
              icon={MessageCircleHeart}
            />
          </div>
        </div>
      </section>

      <UploadPanel />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel-strong rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
                Recent study rooms
              </p>
              <h2 className="display-font mt-2 text-3xl font-bold text-[#0f1e34]">
                Continue where you left off
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {chats.length ? (
              chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="rounded-[1.65rem] border border-[var(--line)] bg-white/80 p-5 hover:-translate-y-0.5 hover:border-[var(--accent)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[#223650]">{chat.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                        {chat.last_message_preview ?? "Open this room to continue the discussion."}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-[var(--accent)]" />
                  </div>
                </Link>
              ))
            ) : (
              <EmptyCard text="No recent chats yet. Upload your first PDF above to create one automatically." />
            )}
          </div>
        </div>

        <div className="glass-panel-strong rounded-[2rem] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
            Documents
          </p>
          <h2 className="display-font mt-2 text-3xl font-bold text-[#0f1e34]">
            Your library
          </h2>

          <div className="mt-5 grid gap-4">
            {documents.length ? (
              documents.map((document) => (
                <div
                  key={document.id}
                  className="rounded-[1.6rem] border border-[var(--line)] bg-white/80 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[#223650]">{document.title}</h3>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {document.status === "ready"
                          ? `${document.page_count ?? 0} pages · ${document.word_count ?? 0} words`
                          : "Still processing"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                        document.status === "ready"
                          ? "bg-[var(--success-soft)] text-[#1f6c47]"
                          : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                      }`}
                    >
                      {document.status}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-4 text-sm leading-7 text-[var(--muted)]">
                    {document.summary ?? "Summary will appear here after StudyGenie finishes processing the PDF."}
                  </p>
                </div>
              ))
            ) : (
              <EmptyCard text="Your uploaded notes and study packs will show up here once you add a PDF." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileStack;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/78 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent-strong)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="display-font text-2xl font-bold text-[#0f1e34]">{value}</p>
          <p className="text-sm text-[var(--muted)]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-[var(--line)] px-5 py-7 text-sm leading-7 text-[var(--muted)]">
      {text}
    </div>
  );
}
