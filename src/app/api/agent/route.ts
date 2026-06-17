import { createAgentUIStreamResponse } from "ai";
import { getAgentSandbox } from "@/lib/sandbox";
import { createAgent } from "@/lib/agent";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  const { messages, sessionId } = await request.json();

  if (!sessionId || typeof sessionId !== "string") {
    return Response.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const sandbox = await getAgentSandbox(sessionId);
  const agent = createAgent(sandbox);

  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => abortController.abort());

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    abortSignal: abortController.signal,
  });
}
