export type ModelOption = {
  id: string;
  label: string;
  provider: "gateway" | "groq";
};

/**
 * "gateway" models are billed through Vercel AI Gateway (requires a card on
 * file). "groq" models go straight to Groq's own free API via GROQ_API_KEY —
 * no Vercel billing involved, so they work without a card.
 */
// llama-3.3-70b-versatile и llama-3.1-8b-instant были сняты Groq с линейки
// (та же история, что в rag-agent) — каждый запрос падал с AI_APICallError
// ещё до того, как агент успевал что-либо сделать, независимо от языка
// вопроса. Заменены на реально доступные сейчас модели (проверено через
// GET https://api.groq.com/openai/v1/models).
export const MODEL_OPTIONS: ModelOption[] = [
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B — Groq (free)", provider: "groq" },
  { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B — Groq (free, fast)", provider: "groq" },
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6 (Gateway, needs card)", provider: "gateway" },
  { id: "anthropic/claude-opus-4.8", label: "Claude Opus 4.8 (Gateway, needs card)", provider: "gateway" },
];

export const DEFAULT_MODEL_ID = MODEL_OPTIONS[0].id;

export function getModelOption(id: string): ModelOption | undefined {
  return MODEL_OPTIONS.find((m) => m.id === id);
}

export function isValidModelId(id: unknown): id is string {
  return typeof id === "string" && MODEL_OPTIONS.some((m) => m.id === id);
}
