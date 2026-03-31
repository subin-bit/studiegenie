import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BrainCircuit,
  FileText,
  Languages,
  MessageSquareText,
  Sparkles,
  Trophy,
} from "lucide-react";
import { StudyGenieMark } from "@/components/studygenie-mark";
import { getOptionalUser } from "@/lib/auth";

const features = [
  {
    title: "Upload and learn instantly",
    description:
      "Drop in a PDF and turn lectures, notes, and handouts into a study-ready workspace in one flow.",
    icon: FileText,
  },
  {
    title: "Chat with your material",
    description:
      "Ask focused doubts, get grounded answers, and keep every conversation saved in your recent chat history.",
    icon: MessageSquareText,
  },
  {
    title: "Generate a study kit",
    description:
      "Auto-summary, key takeaways, quizzes, and explain-like-I’m-5 mode help you revise faster before exams.",
    icon: BrainCircuit,
  },
  {
    title: "Built for hackathon demos",
    description:
      "Gemini-powered answers, Supabase auth and storage, and a deployment-friendly Next.js setup out of the box.",
    icon: Trophy,
  },
];

export default async function Home() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative overflow-hidden px-6 py-10 sm:px-10">
      <div className="mesh-orb left-[-8rem] top-10 h-52 w-52 bg-[#ffc7b8]" />
      <div className="mesh-orb right-[-4rem] top-32 h-64 w-64 bg-[#bdeff4]" />

      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col gap-10">
        <header className="glass-panel fade-in flex items-center justify-between rounded-full px-5 py-3">
          <StudyGenieMark />
          <nav className="flex items-center gap-3 text-sm font-semibold text-[#4b5a6e]">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 hover:bg-white/80"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[var(--foreground)] px-4 py-2 text-white hover:-translate-y-0.5"
            >
              Launch App
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 gap-8 lg:grid-cols-[1.25fr_0.95fr]">
          <section className="fade-up flex flex-col justify-center gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm font-semibold text-[#415067]">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              StudyGenie AI for smarter revision
            </div>

            <div className="space-y-6">
              <h1 className="display-font max-w-4xl text-5xl font-bold tracking-tight text-[#0f1e34] sm:text-6xl lg:text-7xl">
                Turn any PDF into a personal study partner.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
                Upload your notes, chat with the document, generate summaries and
                quizzes, and even switch responses to Malayalam for a standout
                hackathon demo.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-center text-sm font-bold text-white shadow-[0_18px_30px_rgba(255,122,89,0.28)] hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]"
              >
                Start building your study room
              </Link>
              <a
                href="#features"
                className="rounded-full border border-[var(--line)] bg-white/80 px-6 py-3 text-center text-sm font-bold text-[var(--foreground)] hover:-translate-y-0.5"
              >
                See what’s included
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard value="PDF + RAG" label="Upload and chat" />
              <StatCard value="Gemini" label="Summaries and quizzes" />
              <StatCard value="Supabase" label="Auth, storage, recents" />
            </div>
          </section>

          <section className="fade-up glass-panel-strong relative rounded-[2rem] p-6 lg:p-8">
            <div className="absolute right-6 top-6 rounded-full bg-[var(--secondary-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
              Live product layout
            </div>

            <div className="flex h-full flex-col gap-5 pt-8">
              <div className="rounded-[1.5rem] bg-[#10233a] p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/60">
                      Current study room
                    </p>
                    <h2 className="display-font mt-2 text-2xl font-bold">
                      Cell Biology Midterm
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
                    <p className="text-xs text-white/60">Language</p>
                    <p className="text-sm font-semibold">English / Malayalam</p>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.35rem] bg-white/8 p-4">
                  <p className="text-sm text-white/68">Auto summary</p>
                  <p className="mt-2 text-sm leading-7 text-white/90">
                    Photosynthesis has two main stages. The light-dependent
                    reactions capture solar energy, while the Calvin cycle turns
                    that energy into glucose.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <MiniPanel
                  icon={MessageSquareText}
                  title="Recent chats"
                  accent="bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                  items={[
                    "Explain the Calvin cycle like I’m 10",
                    "Quiz me on chloroplast structure",
                    "What will probably come in the exam?",
                  ]}
                />
                <MiniPanel
                  icon={Languages}
                  title="Study tools"
                  accent="bg-[var(--secondary-soft)] text-[var(--secondary)]"
                  items={[
                    "5 MCQs with answers",
                    "Key points to highlight",
                    "Translate recap to Malayalam",
                  ]}
                />
              </div>

              <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/75 p-4">
                <p className="text-sm font-semibold text-[#30435a]">
                  Ask anything from the document
                </p>
                <div className="mt-3 flex items-center gap-3 rounded-[1rem] bg-[#f5efe4] p-3">
                  <div className="rounded-full bg-[var(--accent)] p-2 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-[#506175]">
                    “Make a quick memory trick for the light-dependent reactions.”
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section
          id="features"
          className="grid gap-5 pb-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="glass-panel fade-up rounded-[1.75rem] p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-[var(--accent)]">
                <feature.icon className="h-5 w-5" />
              </div>
              <h2 className="display-font text-xl font-bold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {feature.description}
              </p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass-panel rounded-[1.5rem] px-5 py-4">
      <p className="display-font text-2xl font-bold text-[#0f1e34]">{value}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
}

function MiniPanel({
  icon: Icon,
  title,
  items,
  accent,
}: {
  icon: typeof MessageSquareText;
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div className="rounded-[1.45rem] border border-[var(--line)] bg-white/78 p-4">
      <div className="flex items-center gap-3">
        <div className={`rounded-2xl p-2 ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-[#223650]">{title}</h3>
      </div>
      <div className="mt-4 space-y-2 text-sm text-[#596a7c]">
        {items.map((item) => (
          <p key={item} className="rounded-xl bg-[#f7f3ec] px-3 py-2">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
