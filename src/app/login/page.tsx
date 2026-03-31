import { redirect } from "next/navigation";
import { BookOpenCheck, Languages, MessageSquareText, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { StudyGenieMark } from "@/components/studygenie-mark";
import { getOptionalUser } from "@/lib/auth";

const highlights = [
  {
    title: "Chat with PDFs",
    description: "Grounded answers pulled from your document chunks.",
    icon: MessageSquareText,
  },
  {
    title: "Auto study kit",
    description: "Instant summary, key points, quiz questions, and ELI5 mode.",
    icon: BookOpenCheck,
  },
  {
    title: "Malayalam bonus",
    description: "Switch chat answers and simple explanations to Malayalam.",
    icon: Languages,
  },
];

export default async function LoginPage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 sm:px-10">
      <div className="mesh-orb left-[-8rem] top-0 h-52 w-52 bg-[#ffc7b8]" />
      <div className="mesh-orb right-[-7rem] top-40 h-72 w-72 bg-[#bdeff4]" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-8">
        <header className="glass-panel fade-in flex items-center justify-between rounded-full px-5 py-3">
          <StudyGenieMark />
          <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[#45546a]">
            Free deploy stack: Next.js + Supabase + Gemini
          </div>
        </header>

        <div className="grid flex-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="fade-up flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              <Sparkles className="h-4 w-4" />
              Hackathon-ready auth
            </div>

            <h1 className="display-font mt-6 max-w-2xl text-5xl font-bold tracking-tight text-[#0f1e34] sm:text-6xl">
              Your notes deserve a better study interface.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Sign in, upload a PDF, and open a polished study room with saved recent
              chats, instant summaries, and Gemini-backed Q&A grounded in your notes.
            </p>

            <div className="mt-8 grid gap-4">
              {highlights.map((highlight) => (
                <article
                  key={highlight.title}
                  className="glass-panel rounded-[1.75rem] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-white/85 p-3 text-[var(--accent)]">
                      <highlight.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="display-font text-2xl font-bold text-[#0f1e34]">
                        {highlight.title}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="fade-up flex items-center justify-center">
            <AuthForm />
          </section>
        </div>
      </div>
    </main>
  );
}
