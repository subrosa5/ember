import { getToolOrDynamicToolName, type DynamicToolUIPart, type ToolUIPart, type UITools } from "ai";

type ToolPart = ToolUIPart<UITools> | DynamicToolUIPart;

function formatPayload(value: unknown) {
  if (value === undefined) return null;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ToolCall({ part }: { part: ToolPart }) {
  const label = getToolOrDynamicToolName(part);
  const isRunning = part.state === "input-streaming" || part.state === "input-available";
  const input = "input" in part ? formatPayload(part.input) : null;
  const output =
    part.state === "output-available" && "output" in part ? formatPayload(part.output) : null;

  return (
    <div className="my-2 max-w-2xl border border-[var(--color-border)] bg-[var(--color-bg-panel)] text-[13px] rounded-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
        <span className="text-[var(--color-gold)]">&gt;_ {label}</span>
        <span
          className={
            isRunning
              ? "text-[var(--color-red-bright)] pulse-gold uppercase tracking-wide text-[11px]"
              : "text-[var(--color-text-dim)] uppercase tracking-wide text-[11px]"
          }
        >
          {isRunning ? "running" : "done"}
        </span>
      </div>
      {input && (
        <pre className="px-3 py-1.5 text-[var(--color-text-dim)] overflow-x-auto whitespace-pre-wrap">
          {input}
        </pre>
      )}
      {output && (
        <pre className="px-3 py-1.5 border-t border-[var(--color-border)] text-[var(--color-text)] overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
          {output}
        </pre>
      )}
    </div>
  );
}
