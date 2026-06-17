import { Sandbox } from "@vercel/sandbox";

const SANDBOX_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Each chat session gets its own persistent sandbox, so files written in one
 * turn are still there in the next turn (until it's idle long enough to expire).
 */
export async function getAgentSandbox(sessionId: string): Promise<Sandbox> {
  const name = `ember-${sessionId}`;

  return Sandbox.getOrCreate({
    name,
    runtime: "node24",
    timeout: SANDBOX_TIMEOUT_MS,
  });
}
