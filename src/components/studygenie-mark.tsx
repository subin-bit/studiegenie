import Link from "next/link";
import { Sparkles } from "lucide-react";

export function StudyGenieMark() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--foreground)] text-white shadow-[0_14px_24px_rgba(19,34,56,0.22)]">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <p className="display-font text-lg font-bold leading-none text-[#0f1e34]">
          StudyGenie AI
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#6c7a8c]">
          Learn from your notes faster
        </p>
      </div>
    </Link>
  );
}
