"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import { useRef, useState } from "react";
import type { EmberUIMessage } from "@/lib/agent";
import { MODEL_OPTIONS, DEFAULT_MODEL_ID } from "@/lib/models";
import { ToolCall } from "./ToolCall";

export function ConsoleInner({ sessionId }: { sessionId: string }) {
  const [input, setInput] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL_ID);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/agent",
        body: { sessionId },
      })
  );

  const { messages, sendMessage, status, error } = useChat<EmberUIMessage>({
    transport,
    onFinish: () => {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    },
  });

  const busy = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text }, { body: { model } });
    setInput("");
    requestAnimationFrame(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="border-b border-[var(--color-border)] px-4 py-3 flex items-baseline justify-between gap-4 shrink-0">
        <h1 className="text-[var(--color-gold)] text-lg tracking-wider shrink-0">
          EMBER<span className="text-[var(--color-red)]">_</span>
        </h1>

        <div className="flex items-center gap-3">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={busy}
            title="Model used for the next message"
            className="bg-[var(--color-bg-panel)] border border-[var(--color-border)] text-[var(--color-gold)] text-[11px] uppercase tracking-wide px-2 py-1 outline-none disabled:opacity-50 hover:border-[var(--color-gold)] transition-colors"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id} className="bg-[var(--color-bg-panel)]">
                {m.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-widest whitespace-nowrap">
            sandboxed autonomous agent · session {sessionId.slice(0, 8)}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-[var(--color-text-dim)] text-sm">
            $ waiting for instructions. Try: &quot;create a fibonacci.py that prints the first 10
            fibonacci numbers, then run it&quot;
          </p>
        )}

        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={
                message.role === "user"
                  ? "text-[var(--color-red-bright)]"
                  : "text-[var(--color-text)]"
              }
            >
              <span className="text-[var(--color-text-dim)] select-none mr-2">
                {message.role === "user" ? "$" : "#"}
              </span>
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <span key={i} className="whitespace-pre-wrap leading-relaxed">
                      {part.text}
                    </span>
                  );
                }
                if (isToolUIPart(part)) {
                  return <ToolCall key={part.toolCallId} part={part} />;
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {busy && (
          <p className="text-[var(--color-gold)] pulse-gold text-sm">thinking…</p>
        )}
        {error && (
          <p className="text-[var(--color-red-bright)] text-sm">error: {error.message}</p>
        )}
        <div ref={logEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--color-border)] px-4 py-3 flex items-center gap-2 shrink-0"
      >
        <span className="text-[var(--color-red)]">&gt;</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder="give Ember a task…"
          className="flex-1 bg-transparent outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] disabled:opacity-50"
          autoFocus
        />
        <span className="cursor-blink text-[var(--color-gold)]">▌</span>
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="text-[var(--color-gold)] border border-[var(--color-border)] px-3 py-1 text-xs uppercase tracking-wide hover:border-[var(--color-gold)] disabled:opacity-40 disabled:hover:border-[var(--color-border)] transition-colors"
        >
          run
        </button>
      </form>
    </div>
  );
}
