"use client";

import { useState } from "react";

interface Props {
  type: "losers" | "nonlowest" | "variance";
  data: unknown[];
  disabled?: boolean;
}

export default function InsightCard({ type, data, disabled }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function generate() {
    if (loading || done || disabled) return;
    setLoading(true);
    setText("");

    const res = await fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });

    if (!res.ok) {
      setText("AI service unavailable. Set OPENROUTER_API_KEY to enable.");
      setLoading(false);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;
      const chunk = decoder.decode(value, { stream: true });
      setText((prev) => prev + chunk);
    }

    setLoading(false);
    setDone(true);
  }

  if (!text && !loading) {
    return (
      <button
        onClick={generate}
        disabled={disabled}
        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
        style={{
          background: "var(--accent-muted)",
          border: "1px solid rgba(0,90,97,0.15)",
          color: "var(--accent)",
        }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {disabled ? "Add OPENROUTER_API_KEY to enable" : "Generate AI Insight"}
      </button>
    );
  }

  return (
    <div
      className="mt-4 rounded-xl p-4 text-sm leading-relaxed"
      style={{
        background: "rgba(0, 90, 97, 0.04)",
        border: "1px solid rgba(0, 90, 97, 0.12)",
        color: "var(--text-secondary)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent)" }}>AI Analysis</span>
        {loading && (
          <span className="w-1 h-4 rounded-full animate-pulse inline-block" style={{ background: "var(--accent)" }} />
        )}
      </div>
      <p>{text}</p>
    </div>
  );
}
