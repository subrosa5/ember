import { createAgentUIStreamResponse } from "ai";
import { ipAddress } from "@vercel/functions";
import { getAgentSandbox } from "@/lib/sandbox";
import { createAgent } from "@/lib/agent";
import { checkRateLimit } from "@/lib/rate-limit";
import { DEFAULT_MODEL_ID, isValidModelId } from "@/lib/models";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  const { messages, sessionId, model } = await request.json();

  if (!sessionId || typeof sessionId !== "string") {
    return Response.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const modelId = isValidModelId(model) ? model : DEFAULT_MODEL_ID;

  const ip = ipAddress(request) ?? "unknown";
  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many requests. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const sandbox = await getAgentSandbox(sessionId);
  const agent = createAgent(sandbox, modelId);

  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => abortController.abort());

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    abortSignal: abortController.signal,
  });
}
