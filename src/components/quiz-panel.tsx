"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";

export function QuizPanel({ quiz }: { quiz: QuizQuestion[] }) {
  const [revealed, setRevealed] = useState<number | null>(0);

  if (!quiz.length) {
    return (
      <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/85 p-5 text-sm text-[var(--muted)]">
        Quiz questions will appear after the document finishes processing.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quiz.map((item, index) => (
        <div
          key={`${item.question}-${index}`}
          className="rounded-[1.5rem] border border-[var(--line)] bg-white/82 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
                Question {index + 1}
              </p>
              <h4 className="mt-2 text-base font-semibold text-[#223650]">
                {item.question}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setRevealed(revealed === index ? null : index)}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[#42536a]"
            >
              {revealed === index ? "Hide answer" : "Show answer"}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {item.options.map((option) => (
              <div
                key={option}
                className="rounded-xl bg-[#f8f4ec] px-3 py-2 text-sm text-[#58687a]"
              >
                {option}
              </div>
            ))}
          </div>

          {revealed === index ? (
            <div className="mt-4 rounded-2xl bg-[var(--success-soft)] px-4 py-3 text-sm text-[#1e6a46]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Answer: {item.answer}</p>
                  <p className="mt-1 leading-6">{item.explanation}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
