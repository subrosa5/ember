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
export const MODEL_OPTIONS: ModelOption[] = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B — Groq (free)", provider: "groq" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B — Groq (free, fast)", provider: "groq" },
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B — Groq (free)", provider: "groq" },
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
